import { apiClient } from '@/lib/api/client';

export const statsApi = {
  // Statistiques générales
  getStats: async (): Promise<any> => {
    try {
      const [materialsStats, laborStats, worksStats] = await Promise.all([
        apiClient.get('/api/fournitures/stats/'),
        apiClient.get('/api/main-oeuvre/stats/'),
        apiClient.get('/api/ouvrages/stats/'),
      ]);
      
      return {
        materials: materialsStats.data,
        labor: laborStats.data,
        works: worksStats.data,
      };
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
      throw error;
    }
  },
};