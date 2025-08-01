/**
 * Client API centralisé avec gestion de l'authentification et des en-têtes
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import config from '../config/environment';

/**
 * Crée une instance Axios configurée avec les intercepteurs pour l'authentification
 * et la gestion des erreurs
 */
const createApiClient = (): AxiosInstance => {
  // Créer l'instance avec la configuration de base
  const client = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 15000, // Réduit de 30s à 15s pour éviter les attentes trop longues
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Intercepteur pour ajouter les en-têtes d'authentification et tenant_id
  client.interceptors.request.use((config) => {
    // Récupérer le token JWT depuis le localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      // Déboguer le contenu du token JWT en développement
      if (process.env.NODE_ENV === 'development') {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.debug('Token JWT payload:', payload);
            console.debug('Token expiration:', new Date(payload.exp * 1000).toLocaleString());
            
            // Vérifier si le token contient un tenant_id
            if (payload.tenant_id) {
              console.debug('Token tenant_id:', payload.tenant_id);
            }
          }
        } catch (e) {
          console.error('Erreur lors du décodage du token JWT:', e);
        }
      }
    }

    // Ajouter l'en-tête X-Tenant-ID seulement pour les endpoints qui ne passent pas 
    // par l'authentification JWT du gateway (ex: tenant-service direct)
    const tenantId = localStorage.getItem('tenantId');
    if (tenantId) {
      const url = config.url || '';
      
      // Endpoints qui ont besoin de X-Tenant-ID mais ne passent pas par JWT
      const needsTenantHeader = [
        '/tenants/',
        '/api/tenants/',
        '/vat-rates/',
        '/payment-terms/',
        '/document_appearance/'
      ].some(endpoint => url.includes(endpoint));
      
      // Pour les endpoints library, le gateway ajoute automatiquement X-Tenant-ID depuis JWT
      const isLibraryEndpoint = url.includes('/api/library/') || 
                               url.includes('/api/fournitures/') ||
                               url.includes('/api/main-oeuvre/') ||
                               url.includes('/api/ouvrages/') ||
                               url.includes('/api/categories/') ||
                               url.includes('/api/ingredients/');
      
      if (needsTenantHeader && !isLibraryEndpoint) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }

    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Intercepteur pour le logging des requêtes en développement
  if (process.env.NODE_ENV === 'development') {
    client.interceptors.request.use((config) => {
      console.debug(`📤 Requête API: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        params: config.params,
      });
      return config;
    });
  }

  // Intercepteur pour le traitement des réponses
  client.interceptors.response.use(
    (response) => {
      // Logger les réponses en développement
      if (process.env.NODE_ENV === 'development') {
        console.debug(`📥 Réponse API: ${response.status} ${response.config.url}`, {
          data: response.data,
          headers: response.headers,
        });
      }
      return response;
    },
    (error: AxiosError) => {
      // Gérer les erreurs de manière centralisée
      if (error.response) {
        // La requête a été faite et le serveur a répondu avec un code d'erreur
        const { status, data } = error.response;
        const url = error.config?.url || '';

        console.error(`🚨 Erreur API ${status}: ${url}`, data);

        // Gérer les erreurs d'authentification
        if (status === 401) {
          console.error('Erreur d\'authentification. Vérifiez votre token JWT et tenant_id.');
          
          // Afficher les en-têtes envoyés pour le débogage
          console.debug('En-têtes envoyés:', error.config?.headers);
          
          // Rediriger vers la page de connexion si nécessaire
          // window.location.href = '/login';
        }

        // Gérer les erreurs de validation
        if (status === 400) {
          console.error('Erreur de validation:', data);
        }

        // Gérer les erreurs d'autorisation
        if (status === 403) {
          console.error('Accès refusé. Vérifiez vos permissions.');
        }
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
          console.error('⏰ Timeout de la requête après 15s:', url);
        } else {
          console.error('Pas de réponse du serveur:', error.request);
        }
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        console.error('Erreur de configuration de la requête:', error.message);
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
