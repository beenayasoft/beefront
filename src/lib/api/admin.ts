import { apiClient } from './client';

// Types pour les utilisateurs et les rôles
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  roles: UserRole[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface UserRole {
  id: number;
  role: {
    id: number;
    name: string;
    description: string;
  };
  assigned_at: string;
}

// Types pour les tokens utilisateur
export interface UserToken {
  id: number;
  token: string;
  ip_address: string | null;
  user_agent: string;
  device_name: string;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  last_used_at: string;
}

// Types pour l'activité utilisateur
export interface UserActivity {
  id: number;
  action: string;
  ip_address: string | null;
  details: any; // JSONField
  created_at: string;
}

// Types pour les invitations
export interface Invitation {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  token: string;
  invited_by: number;
  created_at: string;
  expires_at: string;
  is_accepted: boolean;
  roles: Role[];
}

export interface UserProfile {
  id: number;
  user: User;
  phone: string;
  bio: string;
  address: string;
  position: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginStatistics {
  id: number;
  user: number;
  user_email: string;
  date: string;
  login_count: number;
  posts_count: number;
  stories_count: number;
  reels_count: number;
}

export interface LoginStatisticsSummary {
  total_logins: number;
  total_posts: number;
  total_stories: number;
  total_reels: number;
  daily_data: {
    date: string;
    day: string;
    logins: number;
  }[];
}

// Fonctions d'API pour l'administration
export const adminApi = {
  // Récupérer tous les utilisateurs
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/auth/users/');
    return response.data;
  },

  // Récupérer un utilisateur spécifique
  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/auth/users/${userId}/`);
    return response.data;
  },

  // Mettre à jour un utilisateur
  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch(`/auth/users/${userId}/`, data);
    return response.data;
  },

  // Activer/désactiver un utilisateur
  toggleUserStatus: async (userId: number, isActive: boolean): Promise<User> => {
    const response = await apiClient.patch(`/auth/users/${userId}/toggle-status/`, { is_active: isActive });
    return response.data;
  },

  // Récupérer tous les rôles
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/auth/roles/');
    return response.data;
  },

  // Attribuer un rôle à un utilisateur
  assignRole: async (userId: number, roleId: number): Promise<UserRole> => {
    const response = await apiClient.post('/auth/user-roles/', { user: userId, role: roleId });
    return response.data;
  },

  // Retirer un rôle à un utilisateur
  removeRole: async (userRoleId: number): Promise<void> => {
    await apiClient.delete(`/auth/user-roles/${userRoleId}/`);
  },

  // Récupérer toutes les invitations
  getAllInvitations: async (): Promise<Invitation[]> => {
    const response = await apiClient.get('/auth/invitations/');
    return response.data;
  },

  // Créer une nouvelle invitation
  createInvitation: async (data: Partial<Invitation>): Promise<Invitation> => {
    const response = await apiClient.post('/auth/invitations/', data);
    return response.data;
  },

  // Renvoyer une invitation
  resendInvitation: async (invitationId: number): Promise<void> => {
    await apiClient.post(`/auth/invitations/${invitationId}/resend/`);
  },

  // Supprimer une invitation
  deleteInvitation: async (invitationId: number): Promise<void> => {
    await apiClient.delete(`/auth/invitations/${invitationId}/`);
  },

  // Récupérer tous les tokens utilisateur
  getAllUserTokens: async (): Promise<UserToken[]> => {
    const response = await apiClient.get('/auth/tokens/');
    return response.data;
  },

  // Récupérer les tokens d'un utilisateur spécifique
  getUserTokens: async (userId: number): Promise<UserToken[]> => {
    const response = await apiClient.get(`/auth/tokens/user/${userId}/`);
    return response.data;
  },

  // Révoquer un token
  revokeToken: async (tokenId: number): Promise<void> => {
    await apiClient.post(`/auth/tokens/${tokenId}/revoke/`);
  },

  // Récupérer toute l'activité des utilisateurs
  getAllActivities: async (): Promise<UserActivity[]> => {
    const response = await apiClient.get('/auth/activities/');
    return response.data;
  },

  // Récupérer l'activité d'un utilisateur spécifique
  getUserActivities: async (userId: number): Promise<UserActivity[]> => {
    const response = await apiClient.get(`/auth/activities/user/${userId}/`);
    return response.data;
  },

  // Profils utilisateur
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    const response = await apiClient.get(`/auth/profiles/?user=${userId}`);
    return response.data[0]; // Supposons qu'il y a un seul profil par utilisateur
  },

  // Statistiques de connexion
  getLoginStatistics: async (
    userId?: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<LoginStatistics[]> => {
    let url = `/auth/login-statistics/`;
    const params = new URLSearchParams();
    
    if (userId) params.append('user_id', userId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  },

  getLoginStatisticsSummary: async (
    userId?: number, 
    days: number = 30
  ): Promise<LoginStatisticsSummary> => {
    let url = `/auth/login-statistics/summary/?days=${days}`;
    
    if (userId) {
      url += `&user_id=${userId}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  },
};

export const getLoginStatisticsSummary = async (userId?: number, days: number = 30): Promise<LoginStatisticsSummary> => {
  return adminApi.getLoginStatisticsSummary(userId, days);
};

export const getUserTokens = async (userId: number): Promise<UserToken[]> => {
  return adminApi.getUserTokens(userId);
};

export const getUserActivities = async (userId: number): Promise<UserActivity[]> => {
  return adminApi.getUserActivities(userId);
};

export const updateUserRoles = async (userId: number, roleIds: number[]): Promise<void> => {
  // First get current user roles
  const user = await adminApi.getUser(userId);
  const currentRoleIds = user.roles.map(ur => ur.role.id);
  
  // Remove roles that are no longer selected
  for (const userRole of user.roles) {
    if (!roleIds.includes(userRole.role.id)) {
      await adminApi.removeRole(userRole.id);
    }
  }
  
  // Add new roles
  for (const roleId of roleIds) {
    if (!currentRoleIds.includes(roleId)) {
      await adminApi.assignRole(userId, roleId);
    }
  }
};

export const revokeToken = async (tokenId: number): Promise<void> => {
  return adminApi.revokeToken(tokenId);
};

export const activateUser = async (userId: number): Promise<User> => {
  return adminApi.toggleUserStatus(userId, true);
};

export const deactivateUser = async (userId: number): Promise<User> => {
  return adminApi.toggleUserStatus(userId, false);
};

export const getRoles = async (): Promise<Role[]> => {
  return adminApi.getAllRoles();
};

export const getUsers = async (): Promise<User[]> => {
  return adminApi.getAllUsers();
};

export const resendInvitation = async (invitationId: number): Promise<void> => {
  return adminApi.resendInvitation(invitationId);
};

export const getInvitations = async (): Promise<Invitation[]> => {
  return adminApi.getAllInvitations();
};

export default adminApi; 