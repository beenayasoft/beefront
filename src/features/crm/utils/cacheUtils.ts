/**
 * Utilitaires de cache pour le module CRM
 * Combine React Query avec sessionStorage pour performance optimale
 */

// Clés de cache CRM
const CRM_CACHE_KEY = 'crm_data_cache';
const CRM_CACHE_TIMESTAMP_KEY = 'crm_data_timestamp';
const CRM_CACHE_VERSION_KEY = 'crm_cache_version';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes pour données CRM

// Version du cache - incrémentée à chaque modification
let crmCacheVersion = Date.now();

/**
 * Récupère les données mises en cache pour le CRM
 */
export function getCrmCachedData(key: string) {
  try {
    const fullKey = `${CRM_CACHE_KEY}_${key}`;
    const timestamp = sessionStorage.getItem(`${CRM_CACHE_TIMESTAMP_KEY}_${key}`);
    const data = sessionStorage.getItem(fullKey);
    const storedVersion = sessionStorage.getItem(`${CRM_CACHE_VERSION_KEY}_${key}`);
    
    if (timestamp && data && storedVersion) {
      const age = Date.now() - parseInt(timestamp);
      const versionMatch = parseInt(storedVersion) === crmCacheVersion;
      
      if (age < CACHE_DURATION && versionMatch) {
        console.log(`📦 [CRM CACHE] Cache hit pour ${key}`);
        return JSON.parse(data);
      }
    }
  } catch (e) {
    console.warn('Erreur lecture cache CRM:', e);
  }
  return null;
}

/**
 * Sauvegarde les données en cache
 */
export function setCrmCachedData(key: string, data: any) {
  try {
    const fullKey = `${CRM_CACHE_KEY}_${key}`;
    sessionStorage.setItem(fullKey, JSON.stringify(data));
    sessionStorage.setItem(`${CRM_CACHE_TIMESTAMP_KEY}_${key}`, Date.now().toString());
    sessionStorage.setItem(`${CRM_CACHE_VERSION_KEY}_${key}`, crmCacheVersion.toString());
    
    console.log(`💾 [CRM CACHE] Données mises en cache pour ${key}`);
  } catch (e) {
    console.warn('Erreur écriture cache CRM:', e);
  }
}

/**
 * Invalide le cache CRM globalement
 */
export function invalidateCrmCache(reason: string = 'modification') {
  console.log(`🗑️ [CRM CACHE] Cache invalidé globalement - raison: ${reason}`);
  crmCacheVersion = Date.now();
  
  try {
    // Supprimer toutes les clés liées au CRM
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(CRM_CACHE_KEY) || 
          key.startsWith(CRM_CACHE_TIMESTAMP_KEY) || 
          key.startsWith(CRM_CACHE_VERSION_KEY)) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('crm-cache-invalidated', { 
      detail: { reason } 
    }));
    
  } catch (e) {
    console.warn('Erreur lors de l\'invalidation du cache CRM:', e);
  }
}

/**
 * Invalide une clé spécifique du cache
 */
export function invalidateCrmCacheKey(key: string, reason: string = 'modification') {
  console.log(`🗑️ [CRM CACHE] Cache invalidé pour ${key} - raison: ${reason}`);
  
  try {
    sessionStorage.removeItem(`${CRM_CACHE_KEY}_${key}`);
    sessionStorage.removeItem(`${CRM_CACHE_TIMESTAMP_KEY}_${key}`);
    sessionStorage.removeItem(`${CRM_CACHE_VERSION_KEY}_${key}`);
  } catch (e) {
    console.warn('Erreur lors de l\'invalidation du cache CRM:', e);
  }
}

/**
 * Vérifie si le cache existe pour une clé donnée
 */
export function hasCrmCache(key: string): boolean {
  try {
    return sessionStorage.getItem(`${CRM_CACHE_KEY}_${key}`) !== null;
  } catch (e) {
    return false;
  }
}