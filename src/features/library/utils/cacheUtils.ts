/**
 * Utilitaires pour la gestion du cache de la bibliothèque
 * Permet d'invalider le cache depuis n'importe où dans l'application
 */

// Clés de cache
const CACHE_KEY = 'library_data_cache';
const CACHE_TIMESTAMP_KEY = 'library_data_timestamp';
const CACHE_VERSION_KEY = 'library_cache_version';

// Fonction globale pour invalider le cache
export function invalidateLibraryCache(reason: string = 'modification') {
  console.log(`🗑️ [LIBRARY CACHE] Cache invalidé globalement - raison: ${reason}`);
  
  try {
    // Supprimer toutes les clés de cache
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    sessionStorage.removeItem(CACHE_VERSION_KEY);
    
    // Déclencher un événement personnalisé pour notifier les composants
    window.dispatchEvent(new CustomEvent('library-cache-invalidated', { 
      detail: { reason } 
    }));
    
  } catch (e) {
    console.warn('Erreur lors de l\'invalidation du cache:', e);
  }
}

// Fonction pour vérifier si le cache existe
export function hasLibraryCache(): boolean {
  try {
    return sessionStorage.getItem(CACHE_KEY) !== null;
  } catch (e) {
    return false;
  }
}

// Fonction pour vider complètement le cache (utile pour le debugging)
export function clearLibraryCache() {
  invalidateLibraryCache('nettoyage manuel');
}