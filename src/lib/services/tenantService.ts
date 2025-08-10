/**
 * Service de gestion du Tenant ID avec cache
 */

interface TenantCache {
  rawId: string | null;
  cleanedId: string | null;
  lastValidated: number;
}

class TenantService {
  private static instance: TenantService;
  private cache: TenantCache = {
    rawId: null,
    cleanedId: null,
    lastValidated: 0
  };
  
  // Cache valide pendant 5 minutes
  private CACHE_DURATION = 5 * 60 * 1000;
  
  private constructor() {}
  
  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }
  
  /**
   * Nettoie et valide un tenant ID
   */
  private cleanTenantId(rawId: string): string | null {
    const cleaned = rawId
      .replace(/[\xa0\u00A0\u2000-\u200B\uFEFF]/g, '')
      .split(',')[0]
      .trim();
      
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(cleaned) ? cleaned : null;
  }
  
  /**
   * Récupère le tenant ID nettoyé et validé avec gestion de cache
   */
  public getTenantId(): string | null {
    const rawId = localStorage.getItem('tenantId');
    
    // Si pas de tenant ID, retourner null
    if (!rawId) {
      this.clearCache();
      return null;
    }
    
    // Vérifier si le cache est valide
    if (
      this.cache.rawId === rawId && 
      this.cache.cleanedId && 
      Date.now() - this.cache.lastValidated < this.CACHE_DURATION
    ) {
      return this.cache.cleanedId;
    }
    
    // Nettoyer et valider le tenant ID
    const cleanedId = this.cleanTenantId(rawId);
    
    // Mettre à jour le cache
    this.cache = {
      rawId,
      cleanedId,
      lastValidated: Date.now()
    };
    
    // Si le tenant ID nettoyé est différent, le sauvegarder
    if (cleanedId && cleanedId !== rawId) {
      localStorage.setItem('tenantId', cleanedId);
    }
    
    return cleanedId;
  }
  
  /**
   * SUPPRIMÉ: L'en-tête X-Tenant-ID est maintenant géré automatiquement 
   * par l'API Gateway via le JWT. Le frontend ne doit jamais l'envoyer manuellement.
   */
  public needsTenantHeader(url: string): boolean {
    // Le frontend ne doit JAMAIS envoyer X-Tenant-ID manuellement
    // Tout passe par le JWT → API Gateway → Services backend
    return false;
  }
  
  /**
   * Nettoie le cache et les données du tenant
   */
  public clearCache(): void {
    this.cache = {
      rawId: null,
      cleanedId: null,
      lastValidated: 0
    };
  }
  
  /**
   * Gère un tenant ID invalide
   */
  public handleInvalidTenant(): void {
    console.warn('🔧 Suppression du tenant ID invalide. Veuillez vous reconnecter.');
    
    // Nettoyer le localStorage
    localStorage.removeItem('tenantId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    this.clearCache();
    
    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined') {
      console.warn('🔄 Redirection vers la page de connexion...');
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    }
  }
}

export default TenantService.getInstance();
