import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginCredentials, RegisterData } from '@/lib/api/auth';
import { tenantApi, TenantInfo } from '@/lib/api/tenant';

// Type pour les informations du tenant
interface ExtendedTenantInfo extends TenantInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  subscription_plan: string;
  is_active: boolean;
  is_trial: boolean;
  created_at: string;
}

// Type pour les données de l'utilisateur
interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  language?: string;
  timezone?: string;
  is_verified?: boolean;
  date_joined?: string;
  tenant_id?: string;
  company: string;          // Nom du tenant (pour compatibilité)
  tenant_info?: ExtendedTenantInfo | null;  // Informations complètes du tenant
}

// Type pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  error: string | null;
  // Fonctions utilitaires pour accéder aux informations du tenant
  getTenantName: () => string;
  getTenantInfo: () => ExtendedTenantInfo | null;
  getUserDisplayName: () => string;
}

// Création du contexte avec une valeur par défaut undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider d'authentification
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour sauvegarder les données utilisateur dans localStorage
  const saveUserToStorage = (userData: User) => {
    try {
      localStorage.setItem('userInfo', JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
    }
  };

  // Fonction pour charger les données utilisateur depuis localStorage
  const loadUserFromStorage = (): User | null => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      return null;
    }
  };

  // Fonction pour effacer les données utilisateur du localStorage
  const clearUserFromStorage = () => {
    localStorage.removeItem('userInfo');
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Charger d'abord les données depuis le localStorage pour un affichage immédiat
        const cachedUser = loadUserFromStorage();
        if (cachedUser) {
          setUser(cachedUser);
        }

        try {
          // Puis récupérer les données fraîches depuis l'API
          const userData = await authApi.getUserInfo();
          if (userData?.tenant_id) {
            // Récupérer les informations complètes du tenant
            try {
              const tenantData = await tenantApi.getCurrentTenantInfo();
              userData.tenant_info = tenantData;
              localStorage.setItem('tenantId', userData.tenant_id);
            } catch (tenantError) {
              console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
            }
          }
          setUser(userData);
          saveUserToStorage(userData);
        } catch (error) {
          // Essayer de rafraîchir le token si la requête échoue
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const refreshData = await authApi.refreshToken(refreshToken);
              localStorage.setItem('accessToken', refreshData.access);
              if (refreshData.refresh) {
                localStorage.setItem('refreshToken', refreshData.refresh);
              }
              
              // Réessayer de récupérer les informations utilisateur et du tenant
              const userData = await authApi.getUserInfo();
              if (userData?.tenant_id) {
                try {
                  const tenantData = await tenantApi.getCurrentTenantInfo();
                  userData.tenant_info = tenantData;
                  localStorage.setItem('tenantId', userData.tenant_id);
                } catch (tenantError) {
                  console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
                }
              }
              setUser(userData);
              saveUserToStorage(userData);
            } catch (refreshError) {
              handleLogout();
              setError('Session expirée, veuillez vous reconnecter.');
            }
          } else {
            handleLogout();
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(credentials);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      if (data.user?.tenant_id) {
        localStorage.setItem('tenantId', data.user.tenant_id);
        try {
          // Récupérer les informations complètes du tenant
          const tenantData = await tenantApi.getCurrentTenantInfo();
          data.user.tenant_info = tenantData;
        } catch (tenantError) {
          console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
        }
      }

      if (data.user) {
        setUser(data.user);
        saveUserToStorage(data.user);
      } else {
        const userData = await authApi.getUserInfo();
        if (userData?.tenant_id) {
          localStorage.setItem('tenantId', userData.tenant_id);
          try {
            // Récupérer les informations complètes du tenant
            const tenantData = await tenantApi.getCurrentTenantInfo();
            userData.tenant_info = tenantData;
          } catch (tenantError) {
            console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
          }
        }
        setUser(userData);
        saveUserToStorage(userData);
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erreur de connexion');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const handleRegister = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(data);
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      setUser(response.user || null);
      // Stocker le tenant_id pour l'injection automatique du header multi-tenant
      if (response.user?.tenant_id) {
        localStorage.setItem('tenantId', response.user.tenant_id);
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantId'); // Supprimer le tenant_id à la déconnexion
    clearUserFromStorage(); // Effacer les données utilisateur du localStorage
    setUser(null);
  };

  // Fonctions utilitaires pour accéder aux informations du tenant
  const getTenantName = () => {
    return user?.company || user?.tenant_info?.name || 'Entreprise';
  };

  const getTenantInfo = () => {
    return user?.tenant_info || null;
  };

  const getUserDisplayName = () => {
    if (user?.first_name) {
      return user.first_name;
    }
    if (user?.full_name) {
      return user.full_name.split(' ')[0]; // Premier prénom
    }
    return user?.username || 'Utilisateur';
  };

  // Fonction pour mettre à jour les données utilisateur (ex: avatar)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      saveUserToStorage(updatedUser);
    }
  };

  // Valeur du contexte
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    error,
    getTenantName,
    getTenantInfo,
    getUserDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Exporter les types pour utilisation dans d'autres composants
export type { User, ExtendedTenantInfo };

export default useAuth;
