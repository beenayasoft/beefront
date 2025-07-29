/**
 * Service de gestion du cache côté client
 * Exploite les headers de cache Redis du backend et gère le cache localStorage
 */

export interface CacheMetadata {
  key: string;
  timestamp: number;
  ttl: number;
  hitCount: number;
  source: 'redis' | 'localStorage' | 'memory';
}

export interface CacheEntry<T = any> {
  data: T;
  metadata: CacheMetadata;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number; // en bytes
  oldestEntry: number;
  newestEntry: number;
}

class CacheServiceClass {
  private memoryCache = new Map<string, CacheEntry>();
  private cacheStats = {
    hits: 0,
    misses: 0,
  };

  private readonly DEFAULT_TTL = 30000; // 30 secondes par défaut
  private readonly MAX_MEMORY_ENTRIES = 100;
  private readonly MAX_LOCALSTORAGE_SIZE = 5 * 1024 * 1024; // 5MB

  /**
   * Génère une clé de cache basée sur l'URL et les paramètres
   */
  generateCacheKey(url: string, params?: Record<string, any>): string {
    const tenant = localStorage.getItem('tenantId') || 'default';
    const paramString = params ? JSON.stringify(params) : '';
    return `${tenant}:${url}:${btoa(paramString)}`;
  }

  /**
   * Stocke des données dans le cache avec métadonnées
   */
  set<T>(key: string, data: T, ttl?: number, source: 'redis' | 'localStorage' | 'memory' = 'memory'): void {
    const now = Date.now();
    const cacheEntry: CacheEntry<T> = {
      data,
      metadata: {
        key,
        timestamp: now,
        ttl: ttl || this.DEFAULT_TTL,
        hitCount: 0,
        source,
      },
    };

    // Cache mémoire
    if (source === 'memory' || source === 'redis') {
      this.memoryCache.set(key, cacheEntry);
      this.cleanupMemoryCache();
    }

    // Cache localStorage pour persistance
    if (source === 'localStorage') {
      try {
        this.setLocalStorage(key, cacheEntry);
      } catch (error) {
        console.warn('Impossible de stocker en localStorage:', error);
      }
    }
  }

  /**
   * Récupère des données du cache
   */
  get<T>(key: string): T | null {
    // Vérifier d'abord le cache mémoire
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      memoryEntry.metadata.hitCount++;
      this.cacheStats.hits++;
      return memoryEntry.data as T;
    }

    // Vérifier ensuite localStorage
    const localEntry = this.getLocalStorage<T>(key);
    if (localEntry && this.isValid(localEntry)) {
      localEntry.metadata.hitCount++;
      this.cacheStats.hits++;
      // Promouvoir vers le cache mémoire
      this.memoryCache.set(key, localEntry);
      return localEntry.data;
    }

    this.cacheStats.misses++;
    return null;
  }

  /**
   * Invalide une entrée de cache
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.removeLocalStorage(key);
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    // Cache mémoire
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && regex.test(key)) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Traite les headers de cache du backend
   */
  processCacheHeaders(
    url: string,
    headers: Record<string, string>,
    data: any,
    params?: Record<string, any>
  ): void {
    const cacheStatus = headers['x-cache-status'];
    const cacheKey = headers['x-cache-key'];
    const cacheTtl = parseInt(headers['x-cache-ttl'] || '30');

    if (cacheStatus === 'HIT' && cacheKey) {
      // Le backend a servi depuis Redis, on stocke en mémoire
      const key = this.generateCacheKey(url, params);
      this.set(key, data, cacheTtl * 1000, 'redis');
    }
  }

  /**
   * Vérifie si une entrée de cache est valide
   */
  private isValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.metadata.timestamp) < entry.metadata.ttl;
  }

  /**
   * Nettoie le cache mémoire si trop d'entrées
   */
  private cleanupMemoryCache(): void {
    if (this.memoryCache.size <= this.MAX_MEMORY_ENTRIES) return;

    // Supprimer les entrées les plus anciennes
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp);

    const toRemove = entries.slice(0, this.memoryCache.size - this.MAX_MEMORY_ENTRIES);
    toRemove.forEach(([key]) => this.memoryCache.delete(key));
  }

  /**
   * Stocke en localStorage avec préfixe
   */
  private setLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    const storageKey = `cache_${key}`;
    const serialized = JSON.stringify(entry);
    
    // Vérifier la taille
    if (this.getLocalStorageSize() + serialized.length > this.MAX_LOCALSTORAGE_SIZE) {
      this.cleanupLocalStorage();
    }

    localStorage.setItem(storageKey, serialized);
  }

  /**
   * Récupère depuis localStorage
   */
  private getLocalStorage<T>(key: string): CacheEntry<T> | null {
    try {
      const storageKey = `cache_${key}`;
      const serialized = localStorage.getItem(storageKey);
      if (!serialized) return null;

      return JSON.parse(serialized) as CacheEntry<T>;
    } catch (error) {
      console.warn('Erreur lors de la lecture du cache localStorage:', error);
      return null;
    }
  }

  /**
   * Supprime de localStorage
   */
  private removeLocalStorage(key: string): void {
    const storageKey = `cache_${key}`;
    localStorage.removeItem(storageKey);
  }

  /**
   * Calcule la taille du cache localStorage
   */
  private getLocalStorageSize(): number {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        total += (localStorage.getItem(key) || '').length;
      }
    }
    return total;
  }

  /**
   * Nettoie localStorage en supprimant les entrées expirées
   */
  private cleanupLocalStorage(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        const entry = this.getLocalStorage(key.replace('cache_', ''));
        if (!entry || !this.isValid(entry)) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Obtient les statistiques du cache
   */
  getStats(): CacheStats {
    const memoryEntries = Array.from(this.memoryCache.values());
    let localStorageEntries = 0;
    let totalHits = 0;

    // Compter localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localStorageEntries++;
        const entry = this.getLocalStorage(key.replace('cache_', ''));
        if (entry) {
          totalHits += entry.metadata.hitCount;
        }
      }
    }

    // Compter hits mémoire
    memoryEntries.forEach(entry => {
      totalHits += entry.metadata.hitCount;
    });

    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = totalRequests > 0 ? (this.cacheStats.hits / totalRequests) * 100 : 0;

    const timestamps = memoryEntries.map(e => e.metadata.timestamp);
    
    return {
      totalEntries: memoryEntries.length + localStorageEntries,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.cacheStats.hits,
      totalMisses: this.cacheStats.misses,
      cacheSize: this.getLocalStorageSize(),
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    };
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.memoryCache.clear();
    
    // Nettoyer localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Reset stats
    this.cacheStats = { hits: 0, misses: 0 };
  }

  /**
   * Précharge des données importantes
   */
  async prefetch(requests: Array<{ url: string; params?: Record<string, any> }>): Promise<void> {
    // Implémentation du prefetching
    // Peut être utilisé pour précharger les données critiques
    console.log('Prefetching', requests.length, 'requests');
  }
}

export const CacheService = new CacheServiceClass();
export default CacheService;