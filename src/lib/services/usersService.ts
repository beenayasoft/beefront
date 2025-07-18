import { usersApi, User } from '../api/users';

// Utilisateurs par défaut pour le développement
const DEFAULT_USERS: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    last_login: null,
    date_joined: new Date().toISOString()
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'user',
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    full_name: 'Regular User',
    role: 'user',
    is_active: true,
    last_login: null,
    date_joined: new Date().toISOString()
  }
];

export const usersService = {
  // Récupérer tous les utilisateurs du tenant
  getUsers: async (): Promise<User[]> => {
    console.log('🔍 Service: Récupération des utilisateurs');
    try {
      const users = await usersApi.getUsers();
      console.log(`✅ ${users.length} utilisateurs récupérés`);
      return users;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      console.log('⚠️ Utilisation des utilisateurs par défaut pour le développement');
      // En cas d'erreur, retourner des utilisateurs par défaut pour le développement
      return DEFAULT_USERS;
    }
  },

  // Récupérer un utilisateur par ID
  getUser: async (id: string): Promise<User | null> => {
    console.log(`🔍 Service: Récupération de l'utilisateur ${id}`);
    try {
      const user = await usersApi.getUser(id);
      console.log('✅ Utilisateur récupéré:', user.username);
      return user;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      // Rechercher dans les utilisateurs par défaut
      const defaultUser = DEFAULT_USERS.find(u => u.id === id);
      if (defaultUser) {
        console.log('⚠️ Utilisation d\'un utilisateur par défaut pour le développement');
        return defaultUser;
      }
      return null;
    }
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: async (): Promise<User | null> => {
    console.log('🔍 Service: Récupération de l\'utilisateur courant');
    try {
      const user = await usersApi.getCurrentUser();
      console.log('✅ Utilisateur courant récupéré:', user.username);
      return user;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur courant:', error);
      console.log('⚠️ Utilisation de l\'utilisateur admin par défaut pour le développement');
      // En cas d'erreur, retourner l'utilisateur admin par défaut
      return DEFAULT_USERS[0];
    }
  },

  // Formater le nom complet d'un utilisateur
  formatUserName: (user: User): string => {
    if (user.full_name) {
      return user.full_name;
    }
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.username;
  }
};

export default usersService; 