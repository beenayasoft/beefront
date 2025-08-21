/**
 * Client API centralisé avec gestion de l'authentification et des en-têtes
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import config from '../config/environment';
import TenantService from '../services/tenantService';
import AuthService from '../services/authService';

/**
 * Crée une instance Axios configurée avec les intercepteurs pour l'authentification
 * et la gestion des erreurs
 */
export const createApiClient = (): AxiosInstance => {
  // Variables pour éviter les boucles infinies de refresh
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    failedQueue = [];
  };

  // Créer l'instance avec la configuration de base
  const client = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 3000000, // Réduit de 30s à 15s pour éviter les attentes trop longues
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Intercepteur pour ajouter les en-têtes d'authentification et tenant_id
  client.interceptors.request.use(async (config) => {
    const url = config.url || '';
    
    // Exclure les endpoints de refresh pour éviter les boucles infinies
    const isRefreshEndpoint = url.includes('/auth/refresh');
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || isRefreshEndpoint;
    
    // Vérifier et ajouter le token d'authentification
    if (AuthService.isAuthenticated() && !isAuthEndpoint) {
      // Si un refresh est en cours, attendre qu'il se termine
      if (isRefreshing) {
        console.log('🔄 Attente du refresh en cours...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          const { accessToken } = AuthService.getTokens();
          if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
          }
          return config;
        });
      }
      
      // Vérifier si le token est expiré
      if (AuthService.isTokenExpired()) {
        console.log('🕒 Token expiré détecté, tentative de refresh...');
        isRefreshing = true;
        
        try {
          const success = await AuthService.refreshAccessToken();
          if (!success) {
            processQueue(new Error('Session expirée'), null);
            return Promise.reject(new Error('Session expirée'));
          }
          
          const { accessToken } = AuthService.getTokens();
          processQueue(null, accessToken);
          
          if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
          }
        } catch (error) {
          processQueue(error, null);
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Token valide, l'ajouter directement
        const { accessToken } = AuthService.getTokens();
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
      }
    }

    // X-Tenant-ID maintenant géré par l'API Gateway via JWT
    // Le frontend ne doit JAMAIS envoyer X-Tenant-ID manuellement
    // Tout passe par : JWT → API Gateway → Services backend
    
    // Nettoyer tous les headers X-Tenant-ID au cas où ils seraient présents
    delete config.headers['X-Tenant-ID'];
    delete config.headers['x-tenant-id'];
    delete config.headers['X-TENANT-ID'];

    // OPTIONNEL : Ajouter trace ID personnalisé pour debugging (SOA 100%)
    if (process.env.NODE_ENV === 'development') {
      const traceId = `frontend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      config.headers['X-Trace-ID'] = traceId;
      console.log(`📊 Trace ID: ${traceId} → ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  }, (error) => {
    return Promise.reject(error);
  });


  // Intercepteur pour le traitement des réponses
  client.interceptors.response.use(
    (response) => {
      // OPTIONNEL : Afficher trace ID de retour pour debugging (SOA 100%)
      if (process.env.NODE_ENV === 'development') {
        const traceId = response.headers['x-trace-id'];
        if (traceId) {
          console.log(`📊 Response Trace ID: ${traceId} → ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
        }
      }
      return response;
    },
    (error: AxiosError) => {
      // Gérer les erreurs de manière centralisée
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        const { status, data } = error.response;
        const url = error.config?.url || '';

        console.error(`API Error ${status}: ${url}`, data);

        // Gérer les erreurs d'authentification
        if (status === 401) {
          console.error('🔒 Erreur d\'authentification (401) détectée');
          
          // Vérifier si c'est une erreur de token expiré
          const errorData = data as any;
          if (errorData?.detail?.includes('expiré') || errorData?.detail?.includes('expired')) {
            console.warn('🕒 Token expiré détecté dans la réponse');
            
            // Importer et utiliser le service d'authentification pour la déconnexion
            import('../services/authService').then(({ default: AuthService }) => {
              AuthService.logout('Session expirée. Veuillez vous reconnecter.');
            });
          }
        }

        // Gérer les erreurs de validation
        if (status === 400) {
          console.error('Validation error:', data);
        }

        // Gérer les erreurs d'autorisation
        if (status === 403) {
          console.error('Access denied. Check your permissions.');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        const url = error.config?.url || '';
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
          console.error('Request timeout after 15s:', url);
        } else {
          console.error('No server response:', error.request);
        }
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Request configuration error:', error.message);
      }

      // Propager l'erreur pour que les composants puissent la gérer
      return Promise.reject(error);
    }
  );

  return client;
};

// Exporter l'instance du client API
export const apiClient = createApiClient();

/**
 * Fonction utilitaire pour construire les paramètres de requête avec pagination et filtres
 */
export const buildQueryParams = (
  page?: number,
  pageSize?: number,
  filters?: Record<string, any>
): Record<string, any> => {
  const params: Record<string, any> = {};

  // Ajouter la pagination
  if (page !== undefined) {
    params.page = page;
  }
  if (pageSize !== undefined) {
    params.page_size = pageSize;
  }

  // Ajouter les filtres
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
  }

  return params;
};

/**
 * Fonction utilitaire pour gérer les erreurs API de manière cohérente
 */
export const handleApiError = (error: any, defaultMessage: string = 'Une erreur est survenue'): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Erreur avec réponse du serveur
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      // Erreurs spécifiques
      if (status === 401) {
        return 'Votre session a expiré. Veuillez vous reconnecter.';
      }
      
      if (status === 403) {
        return 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
      }
      
      if (status === 404) {
        return 'La ressource demandée n\'existe pas.';
      }
      
      // Erreurs de validation (400)
      if (status === 400 && data) {
        if (typeof data === 'string') {
          return data;
        }
        
        if (typeof data === 'object') {
          // Gérer spécialement les erreurs d'unicité de numéro
          if (data.number && Array.isArray(data.number)) {
            const numberError = data.number[0];
            if (typeof numberError === 'string' && numberError.includes('existe déjà')) {
              return numberError;
            }
          }
          
          // Extraire le premier message d'erreur
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            return firstError[0] as string;
          }
          
          // Fallback si le format est différent
          return JSON.stringify(data);
        }
      }
      
      // Autres erreurs avec code de statut
      return `Erreur ${status}: ${data?.detail || data?.message || defaultMessage}`;
    }
    
    // Erreur réseau (pas de réponse)
    if (axiosError.request) {
      if (axiosError.code === 'ECONNABORTED' && axiosError.message.includes('timeout')) {
        return 'La requête a pris trop de temps. Le service semble surchargé.';
      }
      return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
    }
  }
  
  // Erreur générique
  return defaultMessage;
};

export default apiClient;
