/**
 * Script de comparaison entre l'ancien et le nouveau client API
 * Permet de diagnostiquer les problèmes d'erreur 401 Unauthorized
 */
import { apiClient as newApiClient } from ./client';
import axios from 'axios';
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
 * Fonction qui compare l'ancien et le nouveau client API
 */
export const compareApiClients = async (): Promise<{
  oldClient: {
    success: boolean;
    status?: number;
    data?: any;
    error?: any;
  };
  newClient: {
    success: boolean;
    status?: number;
    data?: any;
    error?: any;
  };
  tokenInfo: {
    token: string | null;
    decoded: JwtPayload | null;
    expired: boolean;
    tenantId: string | null;
  };
}> => {
  // Récupérer le token et le tenant_id
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  
  // Information sur le token
  let decoded: JwtPayload | null = null;
  let expired = false;
  
  if (token) {
    try {
      decoded = jwtDecode<JwtPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      expired = decoded.exp < now;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
    }
  }
  
  const tokenInfo = {
    token,
    decoded,
    expired,
    tenantId
  };
  
  // Résultats pour l'ancien client
  let oldClientResult = {
    success: false,
    status: undefined,
    data: undefined,
    error: undefined
  };
  
  // Résultats pour le nouveau client
  let newClientResult = {
    success: false,
    status: undefined,
    data: undefined,
    error: undefined
  };
  
  // Tester l'ancien client (simulé avec axios)
  try {
    console.log('Test avec l\'ancien client API...');
    
    // Créer une instance axios avec la même configuration que l'ancien client
    const oldClient = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Ajouter les en-têtes d'authentification comme dans l'ancien client
    if (token) {
      oldClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    if (tenantId) {
      oldClient.defaults.headers.common['X-Tenant-ID'] = tenantId;
    }
    
    // Faire une requête GET vers l'API des devis
    const oldResponse = await oldClient.get('/quotes/');
    
    oldClientResult = {
      success: true,
      status: oldResponse.status,
      data: oldResponse.data
    };
    
    console.log('Ancien client: Succès', oldResponse.status);
  } catch (error: any) {
    console.error('Ancien client: Erreur', error.message);
    
    oldClientResult = {
      success: false,
      status: error.response?.status,
      error: {
        message: error.message,
        data: error.response?.data
      }
    };
  }
  
  // Tester le nouveau client
  try {
    console.log('Test avec le nouveau client API...');
    
    // Faire une requête GET vers l'API des devis
    const newResponse = await newApiClient.get('/quotes/');
    
    newClientResult = {
      success: true,
      status: newResponse.status,
      data: newResponse.data
    };
    
    console.log('Nouveau client: Succès', newResponse.status);
  } catch (error: any) {
    console.error('Nouveau client: Erreur', error.message);
    
    newClientResult = {
      success: false,
      status: error.response?.status,
      error: {
        message: error.message,
        data: error.response?.data
      }
    };
  }
  
  return {
    oldClient: oldClientResult,
    newClient: newClientResult,
    tokenInfo
  };
};

/**
 * Fonction qui exécute la comparaison et affiche les résultats
 */
export const runComparisonTest = async (): Promise<void> => {
  console.log('=== COMPARAISON DES CLIENTS API ===');
  console.log('Démarrage de la comparaison...');
  
  const result = await compareApiClients();
  
  console.log('\n=== INFORMATIONS SUR LE TOKEN ===');
  console.log('Token présent:', !!result.tokenInfo.token);
  console.log('Token décodé:', result.tokenInfo.decoded);
  console.log('Token expiré:', result.tokenInfo.expired);
  console.log('Tenant ID:', result.tokenInfo.tenantId);
  
  console.log('\n=== RÉSULTATS ANCIEN CLIENT ===');
  console.log('Succès:', result.oldClient.success);
  console.log('Status:', result.oldClient.status);
  if (result.oldClient.success) {
    console.log('Données:', result.oldClient.data);
  } else {
    console.log('Erreur:', result.oldClient.error);
  }
  
  console.log('\n=== RÉSULTATS NOUVEAU CLIENT ===');
  console.log('Succès:', result.newClient.success);
  console.log('Status:', result.newClient.status);
  if (result.newClient.success) {
    console.log('Données:', result.newClient.data);
  } else {
    console.log('Erreur:', result.newClient.error);
  }
  
  console.log('\n=== CONCLUSION ===');
  if (result.oldClient.success && result.newClient.success) {
    console.log('Les deux clients fonctionnent correctement.');
  } else if (result.oldClient.success && !result.newClient.success) {
    console.log('L\'ancien client fonctionne mais le nouveau client échoue.');
  } else if (!result.oldClient.success && result.newClient.success) {
    console.log('L\'ancien client échoue mais le nouveau client fonctionne.');
  } else {
    console.log('Les deux clients échouent.');
  }
  
  console.log('===========================================');
};

export default runComparisonTest;

