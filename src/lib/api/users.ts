import { apiClient } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
}

// Fonctions d'API pour les utilisateurs
export const usersApi = {
  // Récupérer tous les utilisateurs du tenant
  getUsers: async (): Promise<User[]> => {
    try {
      // Correction de l'URL : supprimer le préfixe /api/ redondant
      // apiClient.baseURL est déjà configuré avec http://localhost:8000/api
      console.log('📞 Appel API: GET /auth/users/');
      const response = await apiClient.get('/auth/users/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  getUser: async (id: string): Promise<User> => {
    try {
      console.log(`📞 Appel API: GET /auth/users/${id}/`);
      const response = await apiClient.get(`/auth/users/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: async (): Promise<User> => {
    try {
      console.log('📞 Appel API: GET /auth/me/');
      const response = await apiClient.get('/auth/me/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

export default usersApi; 