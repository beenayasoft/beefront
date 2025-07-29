/**
 * Service de bibliothèque - Version optimisée pour SOA
 * Délégation complète de la logique métier au backend
 */
import { libraryApi } from '../api/library';
import { Material, Labor, Work, WorkCategory } from '../types/workLibrary';

export const libraryService = {
  // ==================== CATÉGORIES ====================
  
  // Récupérer toutes les catégories
  getCategories: async (): Promise<WorkCategory[]> => {
    console.log('🔍 Service: Récupération des catégories');
    try {
      const categories = await libraryApi.getCategories();
      console.log(`✅ ${categories.length} catégories récupérées`);
      return categories;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  },

  // Récupérer les catégories racines
  getRootCategories: async (): Promise<WorkCategory[]> => {
    console.log('🔍 Service: Récupération des catégories racines');
    try {
      const categories = await libraryApi.getRootCategories();
      console.log(`✅ ${categories.length} catégories racines récupérées`);
      return categories;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories racines:', error);
      throw error;
    }
  },

  // ==================== MATÉRIAUX ====================
  
  // Récupérer tous les matériaux avec filtres optionnels
  getMaterials: async (filters?: Record<string, string>): Promise<Material[]> => {
    console.log('🔍 Service: Récupération des matériaux avec filtres', filters);
    try {
      const materials = await libraryApi.getMaterials(filters);
      console.log(`✅ ${materials.length} matériaux récupérés`);
      return materials;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des matériaux:', error);
      throw error;
    }
  },

  // Récupérer un matériau par ID
  getMaterial: async (id: string): Promise<Material> => {
    console.log(`🔍 Service: Récupération du matériau ${id}`);
    try {
      const material = await libraryApi.getMaterial(id);
      console.log('✅ Matériau récupéré:', material.name);
      return material;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du matériau ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau matériau
  createMaterial: async (data: Partial<Material>): Promise<Material> => {
    console.log('📝 Service: Création d\'un nouveau matériau', data.name);
    try {
      const material = await libraryApi.createMaterial(data);
      console.log('✅ Matériau créé avec succès:', material.id);
      return material;
    } catch (error) {
      console.error('❌ Erreur lors de la création du matériau:', error);
      throw error;
    }
  },

  // Mettre à jour un matériau existant
  updateMaterial: async (id: string, data: Partial<Material>): Promise<Material> => {
    console.log(`📝 Service: Mise à jour du matériau ${id}`, data);
    try {
      const material = await libraryApi.updateMaterial(id, data);
      console.log('✅ Matériau mis à jour avec succès:', material.id);
      return material;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du matériau ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un matériau
  deleteMaterial: async (id: string): Promise<void> => {
    console.log(`🗑️ Service: Suppression du matériau ${id}`);
    try {
      await libraryApi.deleteMaterial(id);
      console.log('✅ Matériau supprimé avec succès');
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du matériau ${id}:`, error);
      throw error;
    }
  },

  // ==================== MAIN D'ŒUVRE ====================
  
  // Récupérer toute la main d'œuvre avec filtres optionnels
  getLabor: async (filters?: Record<string, string>): Promise<Labor[]> => {
    console.log('🔍 Service: Récupération de la main d\'œuvre avec filtres', filters);
    try {
      const labor = await libraryApi.getLabor(filters);
      console.log(`✅ ${labor.length} types de main d'œuvre récupérés`);
      return labor;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la main d\'œuvre:', error);
      throw error;
    }
  },

  // Récupérer un type de main d'œuvre par ID
  getLaborItem: async (id: string): Promise<Labor> => {
    console.log(`🔍 Service: Récupération de la main d'œuvre ${id}`);
    try {
      const labor = await libraryApi.getLaborItem(id);
      console.log('✅ Main d\'œuvre récupérée:', labor.name);
      return labor;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau type de main d'œuvre
  createLabor: async (data: Partial<Labor>): Promise<Labor> => {
    console.log('📝 Service: Création d\'un nouveau type de main d\'œuvre', data.name);
    try {
      const labor = await libraryApi.createLabor(data);
      console.log('✅ Main d\'œuvre créée avec succès:', labor.id);
      return labor;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la main d\'œuvre:', error);
      throw error;
    }
  },

  // Mettre à jour un type de main d'œuvre existant
  updateLabor: async (id: string, data: Partial<Labor>): Promise<Labor> => {
    console.log(`📝 Service: Mise à jour de la main d'œuvre ${id}`, data);
    try {
      const labor = await libraryApi.updateLabor(id, data);
      console.log('✅ Main d\'œuvre mise à jour avec succès:', labor.id);
      return labor;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un type de main d'œuvre
  deleteLabor: async (id: string): Promise<void> => {
    console.log(`🗑️ Service: Suppression de la main d'œuvre ${id}`);
    try {
      await libraryApi.deleteLabor(id);
      console.log('✅ Main d\'œuvre supprimée avec succès');
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // ==================== OUVRAGES ====================
  
  // Récupérer tous les ouvrages avec filtres optionnels
  getWorks: async (filters?: Record<string, string>): Promise<Work[]> => {
    console.log('🔍 Service: Récupération des ouvrages avec filtres', filters);
    try {
      const works = await libraryApi.getWorks(filters);
      console.log(`✅ ${works.length} ouvrages récupérés`);
      return works;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des ouvrages:', error);
      throw error;
    }
  },

  // Récupérer un ouvrage par ID
  getWork: async (id: string): Promise<Work> => {
    console.log(`🔍 Service: Récupération de l'ouvrage ${id}`);
    try {
      const work = await libraryApi.getWork(id);
      console.log('✅ Ouvrage récupéré:', work.name);
      return work;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel ouvrage
  createWork: async (data: Partial<Work>): Promise<Work> => {
    console.log('📝 Service: Création d\'un nouvel ouvrage', data.name);
    try {
      const work = await libraryApi.createWork(data);
      console.log('✅ Ouvrage créé avec succès:', work.id);
      return work;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'ouvrage:', error);
      throw error;
    }
  },

  // Mettre à jour un ouvrage existant
  updateWork: async (id: string, data: Partial<Work>): Promise<Work> => {
    console.log(`📝 Service: Mise à jour de l'ouvrage ${id}`, data);
    try {
      const work = await libraryApi.updateWork(id, data);
      console.log('✅ Ouvrage mis à jour avec succès:', work.id);
      return work;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un ouvrage
  deleteWork: async (id: string): Promise<void> => {
    console.log(`🗑️ Service: Suppression de l'ouvrage ${id}`);
    try {
      await libraryApi.deleteWork(id);
      console.log('✅ Ouvrage supprimé avec succès');
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // ==================== MÉTHODES COMBINÉES ====================
  
  // Récupérer tous les éléments de la bibliothèque
  getAllLibraryItems: async (): Promise<(Material | Labor | Work)[]> => {
    console.log('🔍 Service: Récupération de tous les éléments de la bibliothèque');
    try {
      const items = await libraryApi.getAllLibraryItems();
      console.log(`✅ ${items.length} éléments de bibliothèque récupérés`);
      return items;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la bibliothèque complète:', error);
      throw error;
    }
  },

  // Rechercher dans la bibliothèque
  searchLibrary: async (query: string): Promise<(Material | Labor | Work)[]> => {
    console.log('🔍 Service: Recherche dans la bibliothèque:', query);
    try {
      const results = await libraryApi.searchLibrary(query);
      console.log(`✅ ${results.length} résultats trouvés pour "${query}"`);
      return results;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche dans la bibliothèque:', error);
      throw error;
    }
  },

  // ==================== MÉTHODES UTILITAIRES ====================
  
  // Filtrer les éléments par catégorie
  filterByCategory: async (categoryId: string): Promise<(Material | Labor | Work)[]> => {
    console.log(`🔍 Service: Filtrage par catégorie ${categoryId}`);
    try {
      const [materials, labor, works] = await Promise.all([
        libraryApi.getMaterials({ categorie: categoryId }),
        libraryApi.getLabor({ categorie: categoryId }),
        libraryApi.getWorks({ categorie: categoryId }),
      ]);
      
      const results = [...materials, ...labor, ...works];
      console.log(`✅ ${results.length} éléments trouvés dans la catégorie ${categoryId}`);
      return results;
    } catch (error) {
      console.error(`❌ Erreur lors du filtrage par catégorie ${categoryId}:`, error);
      throw error;
    }
  },

  // Obtenir les statistiques de la bibliothèque
  getLibraryStats: async (): Promise<{
    materials: number;
    labor: number;
    works: number;
    total: number;
  }> => {
    console.log('📊 Service: Récupération des statistiques de la bibliothèque');
    try {
      const [materials, labor, works] = await Promise.all([
        libraryApi.getMaterials(),
        libraryApi.getLabor(),
        libraryApi.getWorks(),
      ]);
      
      const stats = {
        materials: materials.length,
        labor: labor.length,
        works: works.length,
        total: materials.length + labor.length + works.length,
      };
      
      console.log('✅ Statistiques de la bibliothèque:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },
};
