/**
 * Fichier de test pour vérifier l'authentification et les en-têtes
 * Ce fichier permet de diagnostiquer les problèmes d'erreur 401 Unauthorized
 */
import { apiClient } from ./client';
import jwtDecode from 'jwt-decode';

/**
 * Interface pour le contenu décodé du token JWT
 */
interface JwtPayload {
  exp: number;
  iat: number;
  tenant_id: string;
  user_id: string;
  email: string;
  [key: string]: any;
}

/**
 * Fonction qui teste l'authentification et les en-têtes
 * @returns Résultat du test avec les détails
 */
export const testAuthentication = async (): Promise<{
  success: boolean;
  message: string;
  details: {
    token: string | null;
    tokenDecoded: JwtPayload | null;
    tokenExpired: boolean;
    tenantId: string | null;
    headers: Record<string, string>;
    response?: any;
    error?: any;
  };
}> => {
  // Récupérer le token depuis le localStorage
  const token = localStorage.getItem('token');
  
  // Vérifier si le token existe
  if (!token) {
    return {
      success: false,
      message: 'Aucun token JWT trouvé dans le localStorage',
      details: {
        token: null,
        tokenDecoded: null,
        tokenExpired: false,
        tenantId: null,
        headers: {}
      }
    };
  }
  
  // Décoder le token
  let tokenDecoded: JwtPayload | null = null;
  let tokenExpired = false;
  
  try {
    tokenDecoded = jwtDecode<JwtPayload>(token);
    
    // Vérifier si le token est expiré
    const now = Math.floor(Date.now() / 1000);
    tokenExpired = tokenDecoded.exp < now;
  } catch (error) {
    return {
      success: false,
      message: 'Impossible de décoder le token JWT',
      details: {
        token,
        tokenDecoded: null,
        tokenExpired: false,
        tenantId: null,
        headers: {},
        error
      }
    };
  }
  
  // Récupérer le tenant_id depuis le token
  const tenantId = tokenDecoded?.tenant_id || localStorage.getItem('tenantId');
  
  if (!tenantId) {
    return {
      success: false,
      message: 'Aucun tenant_id trouvé dans le token JWT ou dans le localStorage',
      details: {
        token,
        tokenDecoded,
        tokenExpired,
        tenantId: null,
        headers: {}
      }
    };
  }
  
  // Construire les en-têtes comme le fait le client API
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': tenantId,
    'X-TENANT-ID': tenantId,
    'x-tenant-id': tenantId
  };
  
  // Tester une requête API simple
  try {
    // Afficher les en-têtes qui seront envoyés
    console.log('En-têtes qui seront envoyés:', headers);
    
    // Faire une requête GET vers l'API des devis
    const response = await apiClient.get('/quotes/', {
      headers: {
        ...headers
      }
    });
    
    return {
      success: true,
      message: 'Authentification réussie',
      details: {
        token,
        tokenDecoded,
        tokenExpired,
        tenantId,
        headers,
        response: {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        }
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Erreur lors de la requête API: ${error.message}`,
      details: {
        token,
        tokenDecoded,
        tokenExpired,
        tenantId,
        headers,
        error: {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
      }
    };
  }
};

/**
 * Fonction qui affiche le résultat du test dans la console
 */
export const runAuthenticationTest = async (): Promise<void> => {
  console.log('Démarrage du test d\'authentification...');
  
  const result = await testAuthentication();
  
  console.log('=== RÉSULTAT DU TEST D\'AUTHENTIFICATION ===');
  console.log(`Succès: ${result.success}`);
  console.log(`Message: ${result.message}`);
  console.log('Détails:');
  console.log('- Token présent:', !!result.details.token);
  console.log('- Token décodé:', result.details.tokenDecoded);
  console.log('- Token expiré:', result.details.tokenExpired);
  console.log('- Tenant ID:', result.details.tenantId);
  console.log('- En-têtes:', result.details.headers);
  
  if (result.details.response) {
    console.log('- Réponse API:', result.details.response);
  }
  
  if (result.details.error) {
    console.log('- Erreur:', result.details.error);
  }
  
  console.log('===========================================');
  
  return result;
};

export default runAuthenticationTest;

