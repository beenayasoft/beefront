import { Tier } from '@/features/crm/types/tier';
import { tiersApi, TiersFilters } from '../api/tiers';
import { apiClient } from '../api/client';
import { getServiceConfig, logger, isProduction } from '../config/environment';

// Configuration du service
interface TiersServiceConfig {
  enableCache: boolean;
  cacheTimeout: number; // ms
  enableMetrics: boolean;
  maxRetries: number;
}

// Cache intelligent
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

// Métriques de performance
interface TiersServiceMetrics {
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  apiFailures: number;
  averageResponseTime: number;
  lastError?: string;
}

class TiersService {
  private config: TiersServiceConfig = {
    enableCache: true,
    cacheTimeout: isProduction() ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10min prod, 5min dev
    enableMetrics: !isProduction(),
    maxRetries: 3,
  };

  private cache = new Map<string, CacheEntry<any>>();
  private metrics: TiersServiceMetrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    apiFailures: 0,
    averageResponseTime: 0,
  };

  // 🚀 Wrapper avec métriques automatiques
  private withMetrics = <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    name: string
  ) => async (...args: T): Promise<R> => {
    const start = Date.now();
    
    try {
      this.metrics.apiCalls++;
      const result = await fn(...args);
      const duration = Date.now() - start;
      
      // Calcul de la moyenne mobile
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime + duration) / 2;
      
      if (this.config.enableMetrics) {
        logger.debug(`✅ ${name}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.metrics.apiFailures++;
      this.metrics.lastError = error instanceof Error ? error.message : String(error);
      
      if (this.config.enableMetrics) {
        logger.error(`❌ ${name}: ${duration}ms - ${this.metrics.lastError}`);
      }
      
      throw error;
    }
  };

  // 🚀 Cache simple - la complexité est gérée par le backend
  private getCached = <T>(key: string): T | null => {
    if (!this.config.enableCache) return null;
    
    const entry = this.cache.get(key);
    if (!entry || Date.now() - entry.timestamp > this.config.cacheTimeout) {
      // Cache miss ou expiré
      if (entry) this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }
    
    // Cache hit
    this.metrics.cacheHits++;
    return entry.data;
  };

  private setCache = <T>(key: string, data: T): void => {
    if (!this.config.enableCache) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });
  };

  // 🎯 Méthode principale : récupérer tous les tiers (optimisée pour formulaires)
  async getAllTiers(filters?: TiersFilters): Promise<Tier[]> {
    const cacheKey = `all_tiers_${JSON.stringify(filters || {})}`;
    const cached = this.getCached<Tier[]>(cacheKey);
    if (cached) return cached;

    try {
      // Déléguer au backend la récupération des tiers avec pagination optimisée
      const paginatedResponse = await this.withMetrics(
        tiersApi.getTiers,
        'getAllTiers'
      )({
        ...filters,
        // Le backend gère la taille de page optimale et la pagination
        format: 'frontend', // Utiliser le format adapté au frontend
      });

      const tiers = paginatedResponse.results;
      this.setCache(cacheKey, tiers);
      
      if (this.config.enableMetrics) {
        logger.info(`📋 Chargé ${tiers.length} tiers depuis l'API`);
      }
      
      return tiers;
    } catch (error) {
      console.error('Erreur lors du chargement des tiers:', error);
      throw error;
    }
  }

  // 🎯 Méthode spécialisée : récupérer seulement les clients et prospects (pour OpportunityForm)
  async getClientsAndProspects(): Promise<Tier[]> {
    const cacheKey = 'clients_prospects';
    const cached = this.getCached<Tier[]>(cacheKey);
    if (cached) return cached;

    try {
      // Utiliser l'endpoint backend dédié aux clients et prospects
      const filters: TiersFilters = {
        type: 'client,prospect' // Le backend filtre par type
      };
      
      const paginatedResponse = await this.withMetrics(
        tiersApi.getTiers,
        'getClientsAndProspects'
      )(filters);

      const clientsAndProspects = paginatedResponse.results;
      
      this.setCache(cacheKey, clientsAndProspects);
      
      if (this.config.enableMetrics) {
        logger.info(`📋 Récupéré ${clientsAndProspects.length} clients et prospects depuis l'API`);
      }
      
      return clientsAndProspects;
    } catch (error) {
      console.error('Erreur lors du chargement des clients et prospects:', error);
      throw error;
    }
  }

  // 🔍 Recherche de tiers avec cache intelligent
  async searchTiers(query: string): Promise<Tier[]> {
    // Si la requête est vide ou trop courte, déléguer au backend qui gèrera cette logique
    const cacheKey = `search_${query ? query.toLowerCase().trim() : 'all'}`;
    const cached = this.getCached<Tier[]>(cacheKey);
    if (cached) return cached;

    try {
      // Utiliser directement l'API de recherche du backend
      const paginatedResponse = await this.withMetrics(
        tiersApi.getTiers,
        'searchTiers'
      )({ 
        search: query,
        page_size: 1000 // Assurer d'avoir tous les résultats
      });
      
      const results = paginatedResponse.results;
      this.setCache(cacheKey, results);
      
      if (this.config.enableMetrics) {
        logger.info(`🔍 Recherche: ${results.length} résultats pour "${query}"`); 
      }
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche de tiers:', error);
      throw error;
    }
  }

  // 📝 Récupérer un tier par ID
  async getTierById(id: string): Promise<Tier> {
    const cacheKey = `tier_${id}`;
    const cached = this.getCached<Tier>(cacheKey);
    if (cached) return cached;

    try {
      const tier = await this.withMetrics(tiersApi.getTierById, 'getTierById')(id);
      this.setCache(cacheKey, tier);
      return tier;
    } catch (error) {
      console.error(`Erreur lors du chargement du tier ${id}:`, error);
      throw error;
    }
  }

  // 🆕 Créer un nouveau tier
  async createTier(tierData: Tier): Promise<Tier> {
    try {
      const newTier = await this.withMetrics(tiersApi.createTier, 'createTier')(tierData);
      
      // Invalider les caches de liste
      this.clearListCaches();
      
      // Mettre en cache le nouveau tier
      this.setCache(`tier_${newTier.id}`, newTier);
      
      return newTier;
    } catch (error) {
      console.error('Erreur lors de la création du tier:', error);
      throw error;
    }
  }

  // 📝 Mettre à jour un tier
  async updateTier(id: string, tierData: Tier): Promise<Tier> {
    try {
      const updatedTier = await this.withMetrics(tiersApi.updateTier, 'updateTier')(id, tierData);
      
      // Invalider les caches de liste
      this.clearListCaches();
      
      // Mettre à jour le cache du tier
      this.setCache(`tier_${id}`, updatedTier);
      
      return updatedTier;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du tier ${id}:`, error);
      throw error;
    }
  }

  // 🗑️ Supprimer un tier
  async deleteTier(id: string): Promise<boolean> {
    try {
      await this.withMetrics(tiersApi.deleteTier, 'deleteTier')(id);
      
      // Invalider tous les caches
      this.clearCache();
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du tier ${id}:`, error);
      throw error;
    }
  }

  // 🚀 Utilitaires de gestion

  // Invalider seulement les caches de listes (préserve les caches de tiers individuels)
  clearListCaches(): void {
    const listCacheKeys = ['all_tiers_', 'clients_prospects', 'search_'];
    
    for (const [key] of this.cache) {
      if (listCacheKeys.some(prefix => key.startsWith(prefix))) {
        this.cache.delete(key);
      }
    }
    
    if (this.config.enableMetrics) {
      logger.info('🧹 Caches de listes invalidés');
    }
  }

  // Nettoyer tout le cache
  clearCache(): void {
    this.cache.clear();
    if (this.config.enableMetrics) {
      logger.info('🗑️ Cache tiers entièrement nettoyé');
    }
  }

  // Obtenir les métriques de performance
  getMetrics(): TiersServiceMetrics {
    return { 
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheEfficiency: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100 || 0
    } as TiersServiceMetrics & { cacheSize: number; cacheEfficiency: number };
  }

  // Mettre à jour la configuration
  updateConfig(updates: Partial<TiersServiceConfig>): void {
    this.config = { ...this.config, ...updates };
    if (this.config.enableMetrics) {
      logger.info('⚙️ Configuration tiers service mise à jour:', updates);
    }
  }

  // Health check du service
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      // Utiliser l'endpoint health check du backend
      const response = await this.withMetrics(
        async () => {
          const result = await apiClient.get('/tiers/health/');
          return result.data;
        },
        'healthCheck'
      )();
      
      // Ajouter les métriques frontend aux détails
      return {
        status: response.status,
        details: {
          ...response.details,
          frontend: {
            metrics: this.getMetrics(),
            config: this.config,
            environment: isProduction() ? 'production' : 'development',
          }
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: { 
          error: error instanceof Error ? error.message : String(error),
          frontend: {
            metrics: this.getMetrics()
          }
        }
      };
    }
  }
}

// Instance singleton
export const tiersService = new TiersService();
export default tiersService; 