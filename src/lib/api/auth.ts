import { apiClient } from './client';

// Types pour les données d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  company: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    company: string;
    tenant_id?: string; // Ajouté pour multi-tenant
  };
}

// Fonctions d'API pour l'authentification
export const authApi = {
  // Connexion utilisateur
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login/', credentials);
    return response.data;
  },

  // Inscription utilisateur
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register/', data);
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refresh: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/refresh/', { refresh });
    return response.data;
  },

  // Récupérer les informations de l'utilisateur connecté
  getUserInfo: async (): Promise<any> => {
    const response = await apiClient.get('/api/auth/me/');
    return response.data;
  },

  // Mettre à jour les informations de l'utilisateur connecté
  updateUserInfo: async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
  }): Promise<any> => {
    const response = await apiClient.patch('/api/auth/me/', data);
    return response.data;
  },

  // Upload d'avatar
  uploadAvatar: async (file: File): Promise<{ avatar_url: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await apiClient.post('/api/auth/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer l'avatar
  deleteAvatar: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete('/api/auth/avatar/');
    return response.data;
  },
};

export default authApi;
