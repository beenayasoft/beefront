import { quotesApi, Quote, QuoteStats, QuoteFilters } from '@/lib/api/quotes';
import { mockQuotes } from '@/lib/mock/quotes';

// Configuration du service
interface ServiceConfig {
  cacheEnabled: boolean;
  cacheTimeout: number;
  useAPI: boolean;
  enableFallback: boolean;
  enableMetrics: boolean;
}

// Interface pour les entrées du cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  source: 'api' | 'mock';
}

// Métriques pour les devis
interface QuoteMetrics {
  total: number;
  totalAmount: number;
  avgAmount: number;
  byStatus: Record<string, number>;
  acceptanceRate: number;
}

/**
 * Service intelligent pour la gestion des devis avec cache, fallback et métriques
 */
class QuotesService {
  private cache = new Map<string, CacheEntry<any>>();
  
  private config: ServiceConfig = {
    cacheEnabled: true,
    cacheTimeout: process.env.NODE_ENV === 'production' ? 10 * 60 * 1000 : 5 * 60 * 1000, // 5min dev, 10min prod
    useAPI: true,
    enableFallback: true,
    enableMetrics: true,
  };

  private metrics = {
    apiCalls: 0,
    cacheHits: 0,
    fallbackUses: 0,
    errors: 0,
  };

  // ==================== MÉTHODES DE CACHE ====================

  private getCacheKey(method: string, params?: any): string {
    return `quotes_${method}_${params ? JSON.stringify(params) : 'all'}`;
  }

  private isCacheValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < this.config.cacheTimeout;
  }

  private setCache<T>(key: string, data: T, source: 'api' | 'mock'): void {
    if (!this.config.cacheEnabled) return;
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      source,
    });
  }

  private getCache<T>(key: string): T | null {
    if (!this.config.cacheEnabled) return null;
    
    const entry = this.cache.get(key);
    if (!entry || !this.isCacheValid(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    this.metrics.cacheHits++;
    return entry.data;
  }

  public clearCache(pattern?: string): void {
    if (pattern) {
      Array.from(this.cache.keys())
        .filter(key => key.includes(pattern))
        .forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  // ==================== MÉTHODES PUBLIQUES ====================

  /**
   * Récupérer tous les devis d'un client spécifique avec cache intelligent
   */
  async getQuotesByTier(tierId: string, options?: {
    progressive?: boolean;
    includeMetrics?: boolean;
  }): Promise<{
    quotes: Quote[];
    metrics?: QuoteMetrics;
    source: 'api' | 'mock';
    cached: boolean;
  }> {
    console.log('🎯 [QuotesService] getQuotesByTier - tierId:', tierId, 'options:', options);
    
    const cacheKey = this.getCacheKey('byTier', { tierId, options });
    
    // Vérifier le cache
    const cachedData = this.getCache(cacheKey);
    if (cachedData) {
      console.log('✅ [QuotesService] Cache hit pour les devis du tier:', tierId);
      return { ...cachedData, cached: true };
    }

    let quotes: Quote[] = [];
    let source: 'api' | 'mock' = 'mock';

    if (this.config.useAPI) {
      try {
        console.log('🚀 [QuotesService] Tentative API pour devis du tier:', tierId);
        this.metrics.apiCalls++;
        
        quotes = await quotesApi.getQuotesByClient(tierId);
        source = 'api';
        
        console.log('✅ [QuotesService] API réussie - devis reçus:', quotes.length);
      } catch (error) {
        console.warn('🔄 [QuotesService] API failed, falling back to mocks', error);
        this.metrics.errors++;
        
        if (this.config.enableFallback) {
          this.metrics.fallbackUses++;
          // 🎯 CORRECTION: Adapter aux données mock (clientId vs tier)
          const mockQuotes = this.getQuotesMock();
          quotes = mockQuotes
            .filter(quote => (quote as any).clientId === tierId || quote.tier === tierId)
            .map(quote => this.adaptMockToApiFormat(quote));
          source = 'mock';
        } else {
          throw error;
        }
      }
    } else {
      console.log('📝 [QuotesService] Utilisation des mocks (API désactivée)');
      const mockQuotes = this.getQuotesMock();
      quotes = mockQuotes
        .filter(quote => (quote as any).clientId === tierId || quote.tier === tierId)
        .map(quote => this.adaptMockToApiFormat(quote));
    }

    // Calculer les métriques si demandées
    let metrics: QuoteMetrics | undefined;
    if (options?.includeMetrics && quotes.length > 0) {
      metrics = this.calculateMetrics(quotes);
    }

    const result = {
      quotes,
      metrics,
      source,
      cached: false,
    };

    // Mise en cache
    this.setCache(cacheKey, result, source);

    console.log('🎯 [QuotesService] Résultat final:', {
      count: quotes.length,
      source,
      metricsIncluded: !!metrics,
    });

    return result;
  }

  /**
   * Créer un nouveau devis pour un client
   */
  async createQuote(tierId: string, quoteData: {
    project_name: string;
    project_address?: string;
    notes?: string;
  }): Promise<Quote> {
    console.log('🚀 [QuotesService] Création devis pour tier:', tierId, quoteData);

    if (this.config.useAPI) {
      try {
        this.metrics.apiCalls++;
        
        const newQuote = await quotesApi.createQuote({
          tier: tierId,
          ...quoteData,
        });
        
        // Invalider le cache pour ce tier
        this.clearCache(`byTier_${tierId}`);
        
        console.log('✅ [QuotesService] Devis créé avec succès:', newQuote.id);
        return newQuote;
      } catch (error) {
        console.error('🚨 [QuotesService] Erreur création devis:', error);
        this.metrics.errors++;
        
        if (this.config.enableFallback) {
          this.metrics.fallbackUses++;
          // Retourner un mock de devis créé
          const mockQuote = this.createQuoteMock(tierId, quoteData);
          return mockQuote;
        } else {
          throw error;
        }
      }
    } else {
      return this.createQuoteMock(tierId, quoteData);
    }
  }

  /**
   * Récupérer les statistiques des devis
   */
  async getStats(): Promise<QuoteStats> {
    const cacheKey = this.getCacheKey('stats');
    
    const cachedStats = this.getCache<QuoteStats>(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    if (this.config.useAPI) {
      try {
        this.metrics.apiCalls++;
        const stats = await quotesApi.getStats();
        this.setCache(cacheKey, stats, 'api');
        return stats;
      } catch (error) {
        console.warn('🔄 [QuotesService] API stats failed, using mock fallback');
        this.metrics.errors++;
        
        if (this.config.enableFallback) {
          this.metrics.fallbackUses++;
          const mockStats = this.getStatsMock();
          this.setCache(cacheKey, mockStats, 'mock');
          return mockStats;
        } else {
          throw error;
        }
      }
    } else {
      const mockStats = this.getStatsMock();
      this.setCache(cacheKey, mockStats, 'mock');
      return mockStats;
    }
  }

  // ==================== MÉTHODES PRIVÉES (MOCKS ET CALCULS) ====================

  private getQuotesMock(): Quote[] {
    return mockQuotes;
  }

  // 🎯 NOUVELLE FONCTION: Adapter les données mock au format API
  private adaptMockToApiFormat(mockQuote: any): Quote {
    return {
      id: mockQuote.id,
      number: mockQuote.number,
      status: mockQuote.status,
      status_display: this.getStatusDisplay(mockQuote.status),
      tier: mockQuote.clientId || mockQuote.tier || '',
      client_name: mockQuote.clientName || 'Client',
      client_type: 'Entreprise',
      client_address: mockQuote.clientAddress || '',
      project_name: mockQuote.projectName || 'Projet',
      project_address: mockQuote.projectAddress || '',
      issue_date: mockQuote.issueDate || new Date().toISOString().split('T')[0],
      expiry_date: mockQuote.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issue_date_formatted: mockQuote.issueDate ? new Date(mockQuote.issueDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
      expiry_date_formatted: mockQuote.expiryDate ? new Date(mockQuote.expiryDate).toLocaleDateString('fr-FR') : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      validity_period: mockQuote.validityPeriod || 30,
      notes: mockQuote.notes || '',
      conditions: mockQuote.termsAndConditions || '',
      total_ht: mockQuote.totalHT || 0,
      total_tva: mockQuote.totalVAT || 0,
      total_ttc: mockQuote.totalTTC || 0,
      items_count: mockQuote.items?.length || 0,
      created_at: mockQuote.createdAt || new Date().toISOString(),
      updated_at: mockQuote.updatedAt || new Date().toISOString(),
    };
  }

  private getStatusDisplay(status: string): string {
    const statusMap: Record<string, string> = {
      'draft': 'Brouillon',
      'sent': 'Envoyé',
      'accepted': 'Accepté',
      'rejected': 'Refusé',
      'expired': 'Expiré',
      'cancelled': 'Annulé',
    };
    return statusMap[status] || status;
  }

  private createQuoteMock(tierId: string, quoteData: any): Quote {
    const newId = `mock-quote-${Date.now()}`;
    return {
      id: newId,
      number: `DEV-${String(Date.now()).slice(-6)}`,
      status: 'draft',
      status_display: 'Brouillon',
      tier: tierId,
      client_name: 'Client Mock',
      client_type: 'Entreprise',
      client_address: 'Adresse mock',
      project_name: quoteData.project_name,
      project_address: quoteData.project_address || '',
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issue_date_formatted: new Date().toLocaleDateString('fr-FR'),
      expiry_date_formatted: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR'),
      validity_period: 30,
      notes: quoteData.notes || '',
      conditions: '',
      total_ht: 0,
      total_tva: 0,
      total_ttc: 0,
      items_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private getStatsMock(): QuoteStats {
    const quotes = this.getQuotesMock();
    return {
      total: quotes.length,
      draft: quotes.filter(q => q.status === 'draft').length,
      sent: quotes.filter(q => q.status === 'sent').length,
      accepted: quotes.filter(q => q.status === 'accepted').length,
      rejected: quotes.filter(q => q.status === 'rejected').length,
      expired: quotes.filter(q => q.status === 'expired').length,
      cancelled: quotes.filter(q => q.status === 'cancelled').length,
      total_amount: quotes.reduce((sum, q) => sum + (q.totalTTC || 0), 0),
      acceptance_rate: quotes.length > 0 
        ? (quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100 
        : 0,
    };
  }

  private calculateMetrics(quotes: Quote[]): QuoteMetrics {
    const total = quotes.length;
    
    // 🎯 CORRECTION: Gérer les deux formats (API et mock) + vérification sécurisée
    const totalAmount = quotes.reduce((sum, quote) => {
      const amount = quote.total_ttc || (quote as any).totalTTC || 0;
      return sum + (typeof amount === 'number' && !isNaN(amount) ? amount : 0);
    }, 0);
    
    const avgAmount = total > 0 && totalAmount > 0 ? Math.round(totalAmount / total) : 0;
    
    const byStatus: Record<string, number> = {};
    quotes.forEach(quote => {
      const status = quote.status || (quote as any).status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    const acceptedCount = byStatus['accepted'] || 0;
    const acceptanceRate = total > 0 ? Math.round((acceptedCount / total) * 100) : 0;

    return {
      total,
      totalAmount: Math.round(totalAmount),
      avgAmount,
      byStatus,
      acceptanceRate,
    };
  }

  // ==================== MÉTHODES DE MONITORING ====================

  public getMetrics() {
    return { ...this.metrics };
  }

  public resetMetrics() {
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      fallbackUses: 0,
      errors: 0,
    };
  }

  public getConfig() {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Instance singleton
export const quotesService = new QuotesService();
export default quotesService; 