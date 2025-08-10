/**
 * Service de gestion de l'authentification unifié
 */
import { AxiosError } from 'axios';
import TenantService from './tenantService';

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface User {
  id: string;
  email: string;
  tenant_id: string;
  [key: string]: any;
}

class AuthService {
  private static instance: AuthService;
  private isRefreshingToken: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  
  private readonly storageKeys = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    AUTH_TOKEN: 'authToken', // Legacy
    USER: 'user'
  };

  private constructor() {
    this.migrateTokens(); // Migration des anciens tokens
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Migration des anciens tokens vers le nouveau format
   */
  private migrateTokens(): void {
    const authToken = localStorage.getItem(this.storageKeys.AUTH_TOKEN);
    const accessToken = localStorage.getItem(this.storageKeys.ACCESS_TOKEN);

    if (authToken && !accessToken) {
      localStorage.setItem(this.storageKeys.ACCESS_TOKEN, authToken);
      localStorage.removeItem(this.storageKeys.AUTH_TOKEN);
      console.info('🔄 Migration du token legacy réussie');
    }
  }

  /**
   * Stocke les tokens d'authentification
   */
  public setTokens(tokens: AuthTokens): void {
    if (tokens.accessToken) {
      localStorage.setItem(this.storageKeys.ACCESS_TOKEN, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem(this.storageKeys.REFRESH_TOKEN, tokens.refreshToken);
    }
  }

  /**
   * Récupère tous les tokens
   */
  public getTokens(): AuthTokens {
    return {
      accessToken: localStorage.getItem(this.storageKeys.ACCESS_TOKEN),
      refreshToken: localStorage.getItem(this.storageKeys.REFRESH_TOKEN)
    };
  }

  /**
   * Stocke les informations utilisateur
   */
  public setUser(user: User): void {
    localStorage.setItem(this.storageKeys.USER, JSON.stringify(user));
    if (user.tenant_id) {
      localStorage.setItem('tenantId', user.tenant_id);
    }
  }

  /**
   * Récupère les informations utilisateur
   */
  public getUser(): User | null {
    const userStr = localStorage.getItem(this.storageKeys.USER);
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  public isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return !!tokens.accessToken;
  }

  /**
   * Décode le JWT token
   */
  public decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  }

  /**
   * Vérifie si le token est expiré
   */
  public isTokenExpired(): boolean {
    const { accessToken } = this.getTokens();
    if (!accessToken) return true;

    const decoded = this.decodeToken(accessToken);
    if (!decoded?.exp) return true;

    return Date.now() >= decoded.exp * 1000;
  }

  /**
   * Gère les erreurs d'authentification
   */
  public handleAuthError(error: AxiosError): void {
    if (error.response?.status === 401) {
      this.logout('Session expirée');
    }
  }

  /**
   * Déconnexion avec message optionnel
   */
  public logout(message?: string): void {
    // Nettoyer le localStorage
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });

    // Nettoyer le tenant
    TenantService.clearCache();
    localStorage.removeItem('tenantId');

    if (message) {
      console.warn('🔐 Déconnexion :', message);
    }

    // Rediriger vers la page de connexion
    if (typeof window !== 'undefined') {
      window.location.href = '/auth';
    }
  }

  /**
   * Rafraîchit le token d'accès avec protection contre les appels multiples
   */
  public async refreshAccessToken(): Promise<boolean> {
    // Si un refresh est déjà en cours, retourner la promesse existante
    if (this.isRefreshingToken && this.refreshPromise) {
      console.log('🔄 Refresh déjà en cours, utilisation de la promesse existante');
      return this.refreshPromise;
    }

    const { refreshToken } = this.getTokens();
    if (!refreshToken) {
      console.warn('🔄 Pas de refresh token disponible');
      this.logout('Pas de refresh token');
      return false;
    }

    // Marquer le refresh comme en cours et créer la promesse
    this.isRefreshingToken = true;
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Nettoyer l'état du refresh
      this.isRefreshingToken = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Effectue le rafraîchissement du token (méthode privée)
   */
  private async performTokenRefresh(refreshToken: string): Promise<boolean> {
    try {
      console.log('🔄 Tentative de rafraîchissement du token...');
      
      // Importer dynamiquement pour éviter les dépendances circulaires
      const { authApi } = await import('../../features/auth/api/auth');
      
      // Appel API pour rafraîchir le token
      const response = await authApi.refreshToken(refreshToken);
      
      // Stocker les nouveaux tokens
      this.setTokens({
        accessToken: response.access,
        refreshToken: response.refresh
      });
      
      console.log('✅ Token rafraîchi avec succès');
      return true;
    } catch (error) {
      console.error('❌ Échec du rafraîchissement du token:', error);
      this.logout('Échec du rafraîchissement du token');
      return false;
    }
  }
}

export default AuthService.getInstance();
