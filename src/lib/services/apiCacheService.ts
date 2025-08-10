/**
 * Service de gestion du cache et des requêtes API
 */
import { AxiosResponse } from 'axios';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface CacheConfig {
  duration: number;  // Durée de vie du cache en millisecondes
  key: string;       // Clé unique pour identifier les données
}

class ApiCacheService {
  private static instance: ApiCacheService;
  private cache: Map<string, CacheItem<any>> = new Map();
  
  // Cache par défaut de 5 minutes
  private DEFAULT_CACHE_DURATION = 5 * 60 * 1000;
  
  // Limite de taille du cache (en nombre d'entrées)
  private CACHE_SIZE_LIMIT = 100;
  
  private constructor() {
    // Nettoyer le cache périodiquement
    setInterval(() => this.cleanExpiredCache(), 60 * 1000);
  }
  
  public static getInstance(): ApiCacheService {
    if (!ApiCacheService.instance) {
      ApiCacheService.instance = new ApiCacheService();
    }
    return ApiCacheService.instance;
  }
  
  /**
   * Génère une clé de cache unique basée sur l'URL et les paramètres
   */
  private generateCacheKey(url: string, params?: any): string {
    const tenant = localStorage.getItem('tenantId') || 'no-tenant';
    const paramsKey = params ? JSON.stringify(params) : '';
    return `${tenant}:${url}:${paramsKey}`;
  }
  
  /**
   * Vérifie si les données en cache sont valides
   */
  private isCacheValid(cacheItem: CacheItem<any>, duration: number): boolean {
    return Date.now() - cacheItem.timestamp < duration;
  }
  
  /**
   * Nettoie les entrées expirées du cache
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.DEFAULT_CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
    
    // Si le cache dépasse la limite, supprimer les entrées les plus anciennes
    if (this.cache.size > this.CACHE_SIZE_LIMIT) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const entriesToRemove = entries.slice(0, entries.length - this.CACHE_SIZE_LIMIT);
      entriesToRemove.forEach(([key]) => this.cache.delete(key));
    }
  }
  
  /**
   * Stocke des données dans le cache
   */
  public setCache<T>(config: CacheConfig, data: T, response?: AxiosResponse): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      etag: response?.headers?.etag
    };
    
    this.cache.set(config.key, cacheItem);
  }
  
  /**
   * Récupère des données du cache
   */
  public getCache<T>(config: CacheConfig): T | null {
    const cacheItem = this.cache.get(config.key);
    
    if (cacheItem && this.isCacheValid(cacheItem, config.duration)) {
      return cacheItem.data as T;
    }
    
    return null;
  }
  
  /**
   * Récupère l'ETag pour une ressource
   */
  public getETag(key: string): string | undefined {
    return this.cache.get(key)?.etag;
  }
  
  /**
   * Invalide une entrée du cache
   */
  public invalidateCache(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Invalide toutes les entrées du cache correspondant à un pattern
   */
  public invalidateCachePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Wrapper pour les requêtes API avec gestion du cache
   */
  public async cachedRequest<T>({
    url,
    params,
    fetcher,
    duration = this.DEFAULT_CACHE_DURATION
  }: {
    url: string;
    params?: any;
    fetcher: () => Promise<AxiosResponse<T>>;
    duration?: number;
  }): Promise<T> {
    const cacheKey = this.generateCacheKey(url, params);
    const cacheConfig: CacheConfig = { key: cacheKey, duration };
    
    // Vérifier le cache
    const cachedData = this.getCache<T>(cacheConfig);
    if (cachedData) {
      console.debug('📦 Données récupérées du cache pour:', url);
      return cachedData;
    }
    
    // Si pas en cache, faire la requête
    try {
      const response = await fetcher();
      this.setCache(cacheConfig, response.data, response);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la requête API:', error);
      throw error;
    }
  }
  
  /**
   * Nettoie tout le cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export default ApiCacheService.getInstance();
