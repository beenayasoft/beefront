import { apiClient } from '../../../lib/api/client';

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
    const response = await apiClient.post('/auth/login/', credentials);
    return response.data;
  },

  // Inscription utilisateur
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refresh: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/refresh/', { refresh });
    return response.data;
  },

  // Déconnexion utilisateur
  logout: async (refresh: string): Promise<void> => {
    await apiClient.post('/auth/logout/', { refresh });
  },

  // Vérifier la validité du token
  verifyToken: async (token: string): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/token/verify/', { token });
    return response.data;
  },

  // Récupérer le profil utilisateur actuel
  getCurrentUser: async (): Promise<AuthResponse['user']> => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (data: Partial<RegisterData>): Promise<AuthResponse['user']> => {
    const response = await apiClient.patch('/auth/profile/', data);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (data: {
    old_password: string;
    new_password: string;
    new_password2: string;
  }): Promise<{ detail: string }> => {
    const response = await apiClient.post('/auth/change-password/', data);
    return response.data;
  },

  // Demander une réinitialisation de mot de passe
  requestPasswordReset: async (email: string): Promise<{ detail: string }> => {
    const response = await apiClient.post('/auth/password-reset/', { email });
    return response.data;
  },

  // Confirmer la réinitialisation de mot de passe
  confirmPasswordReset: async (data: {
    token: string;
    password: string;
    password2: string;
  }): Promise<{ detail: string }> => {
    const response = await apiClient.post('/auth/password-reset/confirm/', data);
    return response.data;
  },
};

export default authApi;