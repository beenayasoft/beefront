import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginCredentials, RegisterData } from '../api';
import { tenantApi, TenantInfo } from '../../../lib/api/tenant';

// Fonction utilitaire pour valider et nettoyer un tenant ID
const validateAndCleanTenantId = (tenantId: string | undefined): string | null => {
  if (!tenantId) return null;
  
  const cleaned = tenantId
    .replace(/[\xa0\u00A0\u2000-\u200B\uFEFF]/g, '')
    .split(',')[0]
    .trim();
    
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(cleaned) ? cleaned : null;
};

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
  error: string | null;
  // Fonctions utilitaires pour accéder aux informations du tenant
  getTenantName: () => string;
  getTenantInfo: () => ExtendedTenantInfo | null;
  getUserDisplayName: () => string;
  // Fonction pour mettre à jour les données utilisateur
  updateUser: (userData: User) => void;
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

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          if (userData?.tenant_id) {
            // Valider et nettoyer le tenant_id avant stockage
            const cleanTenantId = validateAndCleanTenantId(userData.tenant_id);
            if (cleanTenantId) {
              localStorage.setItem('tenantId', cleanTenantId);
              // Récupérer les informations complètes du tenant
              try {
                const tenantData = await tenantApi.getCurrentTenantInfo();
                userData.tenant_info = tenantData;
              } catch (tenantError) {
                console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
              }
            } else {
              console.error('Tenant ID invalide reçu du serveur:', userData.tenant_id);
            }
          }
          setUser(userData);
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
              const userData = await authApi.getCurrentUser();
              if (userData?.tenant_id) {
                // Valider et nettoyer le tenant_id avant stockage
                const cleanTenantId = validateAndCleanTenantId(userData.tenant_id);
                if (cleanTenantId) {
                  localStorage.setItem('tenantId', cleanTenantId);
                  try {
                    const tenantData = await tenantApi.getCurrentTenantInfo();
                    userData.tenant_info = tenantData;
                  } catch (tenantError) {
                    console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
                  }
                } else {
                  console.error('Tenant ID invalide reçu du serveur après refresh:', userData.tenant_id);
                }
              }
              setUser(userData);
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
        // Valider et nettoyer le tenant_id avant stockage
        const cleanTenantId = validateAndCleanTenantId(data.user.tenant_id);
        if (cleanTenantId) {
          localStorage.setItem('tenantId', cleanTenantId);
          try {
            // Récupérer les informations complètes du tenant
            const tenantData = await tenantApi.getCurrentTenantInfo();
            data.user.tenant_info = tenantData;
          } catch (tenantError) {
            console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
          }
        } else {
          console.error('Tenant ID invalide reçu lors du login:', data.user.tenant_id);
        }
      }

      if (data.user) {
        setUser(data.user);
      } else {
        const userData = await authApi.getCurrentUser();
        if (userData?.tenant_id) {
          // Valider et nettoyer le tenant_id avant stockage
          const cleanTenantId = validateAndCleanTenantId(userData.tenant_id);
          if (cleanTenantId) {
            localStorage.setItem('tenantId', cleanTenantId);
            try {
              // Récupérer les informations complètes du tenant
              const tenantData = await tenantApi.getCurrentTenantInfo();
              userData.tenant_info = tenantData;
            } catch (tenantError) {
              console.error('Erreur lors de la récupération des infos du tenant:', tenantError);
            }
          } else {
            console.error('Tenant ID invalide reçu lors du getCurrentUser:', userData.tenant_id);
          }
        }
        setUser(userData);
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
    console.log('🚀 useAuth.handleRegister - Début');
    setIsLoading(true);
    setError(null);
    try {
      console.log('🚀 useAuth.handleRegister - Appel API');
      const response = await authApi.register(data);
      console.log('🚀 useAuth.handleRegister - Réponse API reçue:', response);
      localStorage.setItem('accessToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      setUser(response.user || null);
      // Stocker le tenant_id pour l'injection automatique du header multi-tenant
      if (response.user?.tenant_id) {
        // Valider et nettoyer le tenant_id avant stockage
        const cleanTenantId = validateAndCleanTenantId(response.user.tenant_id);
        if (cleanTenantId) {
          localStorage.setItem('tenantId', cleanTenantId);
        } else {
          console.error('Tenant ID invalide reçu lors de l\'inscription:', response.user.tenant_id);
        }
      }
      console.log('🚀 useAuth.handleRegister - Succès complet');
    } catch (error: any) {
      console.log('🚀 useAuth.handleRegister - Erreur:', error);
      console.log('🚀 useAuth.handleRegister - Erreur response:', error.response);
      setError(error.response?.data?.detail || 'Erreur lors de l\'inscription');
      console.log('🚀 useAuth.handleRegister - Avant throw');
      throw error;
    } finally {
      console.log('🚀 useAuth.handleRegister - Finally');
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantId'); // Supprimer le tenant_id à la déconnexion
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

  // Fonction pour mettre à jour les données utilisateur
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // Valeur du contexte
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    error,
    getTenantName,
    getTenantInfo,
    getUserDisplayName,
    updateUser
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