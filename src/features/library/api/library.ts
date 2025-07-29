import { apiClient } from '@/lib/api/client';
import { Work, Material, Labor, WorkCategory, WorkComponent } from '../types/workLibrary';

// Types pour la pagination Django REST Framework
interface DjangoPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Type pour les paramètres de pagination
interface PaginationParams {
  page?: number;
  page_size?: number;
}

// Type pour les réponses avec pagination optionnelle
type ApiResponse<T> = T[] | DjangoPaginatedResponse<T>;

// Types pour les réponses du backend Django
interface BackendCategory {
  id: number;
  nom: string;
  parent?: number;
  position: number;
  description?: string;
  chemin_complet: string;
  sous_categories?: BackendCategory[];
  created_at: string;
  updated_at: string;
}

interface BackendMaterial {
  id: number;
  nom: string;
  unite: string;
  prix_achat_ht: string; // Decimal as string from Django
  categorie: number;
  reference: string;
  supplier: string;
  vat_rate: string; // Decimal as string from Django
  type: string;
  waste_factor: string; // Decimal as string from Django
  is_recyclable: boolean;
  categorie_nom?: string; // Computed field
  unitPrice?: string; // Alias field
  vatRate?: string; // Alias field
  wasteFactor?: string; // Alias field
  created_at: string;
  updated_at: string;
  description?: string;
}

interface BackendLabor {
  id: number;
  nom: string;
  cout_horaire: string; // Decimal as string from Django
  categorie: number;
  unite: string;
  skill_level: 'apprentice' | 'skilled' | 'expert' | 'specialist';
  productivity_factor: string; // Decimal as string from Django
  type: string;
  categorie_nom?: string; // Computed field
  unitPrice?: string; // Alias field (= cout_horaire)
  prix_achat_ht?: string; // Alias field (= cout_horaire)
  created_at: string;
  updated_at: string;
  description?: string;
}

interface BackendIngredient {
  id: number;
  ouvrage: number;
  element_type: number;
  element_id: number;
  element: any; // Generic foreign key content
  quantite: string; // Decimal as string from Django
  waste_allowance: string; // Decimal as string from Django
  cout_total: number; // Computed property
}

interface BackendWork {
  id: number;
  nom: string;
  unite: string;
  categorie: number;
  prix_recommande: string; // Decimal as string from Django
  marge: string; // Decimal as string from Django
  complexity: 'low' | 'medium' | 'high';
  efficiency: string; // Decimal as string from Django
  duration_estimate?: string; // Decimal as string from Django
  requires_certification: boolean;
  categorie_nom?: string; // Computed field
  debourse_sec: number; // Computed property
  recommendedPrice: number; // Computed property with applied margin
  laborCost: number; // Computed property
  materialCost: number; // Computed property
  ingredients?: BackendIngredient[]; // Related ingredients
  created_at: string;
  updated_at: string;
  description?: string;
  type?: string;
  is_custom?: boolean;
}

// Fonctions de transformation Backend → Frontend
const transformCategory = (backendCategory: BackendCategory): WorkCategory => ({
  id: backendCategory.id.toString(),
  name: backendCategory.nom,
  description: backendCategory.chemin_complet,
  parentId: backendCategory.parent?.toString(),
  position: backendCategory.position || 0,
});

const transformMaterial = (backendMaterial: BackendMaterial): Material => ({
  id: backendMaterial.id.toString(),
  reference: backendMaterial.reference,
  name: backendMaterial.nom,
  description: backendMaterial.description || '',
  unit: backendMaterial.unite,
  unitPrice: Number(backendMaterial.unitPrice || backendMaterial.prix_achat_ht),
  vatRate: Number(backendMaterial.vatRate || backendMaterial.vat_rate),
  supplier: backendMaterial.supplier,
  category: backendMaterial.categorie_nom || '',
  categoryId: backendMaterial.categorie?.toString(),
  code: backendMaterial.reference || '',
  wasteFactor: Number(backendMaterial.wasteFactor || backendMaterial.waste_factor || 0),
  isRecyclable: backendMaterial.is_recyclable || false,
});

const transformLabor = (backendLabor: BackendLabor): Labor => ({
  id: backendLabor.id.toString(),
  name: backendLabor.nom,
  description: backendLabor.description || '',
  unit: backendLabor.unite,
  unitPrice: Number(backendLabor.unitPrice || backendLabor.cout_horaire),
  category: backendLabor.categorie_nom || '',
  categoryId: backendLabor.categorie?.toString(),
  code: backendLabor.nom || '',
  skillLevel: backendLabor.skill_level || 'skilled',
  productivityFactor: Number(backendLabor.productivity_factor || 1.0),
});

// Transformation d'un ingrédient backend en composant frontend
const transformIngredient = (ingredient: BackendIngredient): WorkComponent => {
  const element = ingredient.element || {};
  const isLabor = element.cout_horaire !== undefined;
  
  return {
    id: ingredient.id.toString(),
    type: isLabor ? 'labor' : 'material',
    referenceId: ingredient.element_id.toString(),
    name: element.nom || 'Non renseigné',
    unit: element.unite || (isLabor ? 'h' : 'unité'),
    quantity: Number(ingredient.quantite),
    unitPrice: Number(element.prix_achat_ht || element.cout_horaire || 0),
    totalPrice: ingredient.cout_total || 0,
    wasteAllowance: Number(ingredient.waste_allowance || 0),
    notes: ingredient.notes || undefined,
  };
};

const transformWork = (backendWork: BackendWork): Work => ({
  id: backendWork.id.toString(),
  reference: backendWork.code || backendWork.nom,
  name: backendWork.nom,
  description: backendWork.description || '',
  categoryId: backendWork.categorie.toString(),
  unit: backendWork.unite,
  code: backendWork.code || '',
  components: (backendWork.ingredients || []).map(transformIngredient),
  laborCost: backendWork.laborCost || 0,
  materialCost: backendWork.materialCost || 0,
  totalCost: backendWork.debourse_sec || 0,
  recommendedPrice: backendWork.recommendedPrice || Number(backendWork.prix_recommande),
  margin: Number(backendWork.marge),
  complexity: backendWork.complexity || 'medium',
  efficiency: Number(backendWork.efficiency || 1.0),
  durationEstimate: backendWork.duration_estimate ? Number(backendWork.duration_estimate) : undefined,
  requiresCertification: backendWork.requires_certification || false,
  createdAt: backendWork.created_at,
  updatedAt: backendWork.updated_at,
  isCustom: backendWork.is_custom || false,
});

// Fonctions de transformation Frontend → Backend
const transformMaterialToBackend = (material: Partial<Material>) => ({
  nom: material.name,
  unite: material.unit,
  prix_achat_ht: material.unitPrice?.toString(),
  vat_rate: material.vatRate?.toString() || '20.0',
  description: material.description || '',
  reference: material.reference || '',
  supplier: material.supplier || '',
  categorie: material.categoryId ? Number(material.categoryId) : null,
  type: 'material',
  code: material.code || material.reference || '',
  waste_factor: (material.wasteFactor || 0).toString(),
  is_recyclable: material.isRecyclable || false,
});

const transformLaborToBackend = (labor: Partial<Labor>) => ({
  nom: labor.name,
  cout_horaire: labor.unitPrice?.toString(),
  unite: labor.unit || 'h',
  description: labor.description || '',
  categorie: labor.categoryId ? Number(labor.categoryId) : null,
  type: 'labor',
  code: labor.code || labor.name || '',
  skill_level: labor.skillLevel || 'skilled',
  productivity_factor: (labor.productivityFactor || 1.0).toString(),
});

const transformWorkToBackend = (work: Partial<Work>) => ({
  nom: work.name,
  unite: work.unit,
  description: work.description || '',
  categorie: work.categoryId ? Number(work.categoryId) : null,
  code: work.reference || '',
  prix_recommande: work.recommendedPrice?.toString() || '0.0',
  marge: work.margin?.toString() || '20.0',
  complexity: 'medium',
  efficiency: '1.0',
  duration_estimate: null,
  requires_certification: false,
  type: 'work',
  is_custom: work.isCustom || true,
});

// API Bibliothèque
export const libraryApi = {
  // ==================== CATÉGORIES ====================
  
  // Récupérer toutes les catégories (avec pagination Django)
  getCategories: async (filters?: Record<string, string>): Promise<WorkCategory[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/categories/?${params.toString()}`);
      
      // Django REST retourne {count, next, previous, results}
      const categories = response.data.results || response.data;
      return categories.map(transformCategory);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      throw error;
    }
  },

  // Récupérer les catégories racines
  getRootCategories: async (): Promise<WorkCategory[]> => {
    try {
      const response = await apiClient.get('/api/categories/racines/');
      return response.data.map(transformCategory);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories racines:", error);
      throw error;
    }
  },

  // Statistiques des catégories
  getCategoryStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/categories/stats/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques des catégories:", error);
      throw error;
    }
  },

  // ==================== MATÉRIAUX ====================
  
  // Récupérer tous les matériaux
  getMaterials: async (filters?: Record<string, string>): Promise<Material[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/fournitures/?${params.toString()}`);
      
      // Django REST pagination: {count, next, previous, results}
      const materials = response.data.results || response.data;
      return materials.map(transformMaterial);
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux:", error);
      throw error;
    }
  },

  // Récupérer un matériau par ID
  getMaterial: async (id: string): Promise<Material> => {
    try {
      const response = await apiClient.get(`/api/fournitures/${id}/`);
      return transformMaterial(response.data);
    } catch (error) {
      console.error(`Erreur lors du chargement du matériau ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau matériau
  createMaterial: async (material: Partial<Material>): Promise<Material> => {
    try {
      const backendData = transformMaterialToBackend(material);
      const response = await apiClient.post('/api/fournitures/', backendData);
      return transformMaterial(response.data);
    } catch (error) {
      console.error("Erreur lors de la création du matériau:", error);
      throw error;
    }
  },

  // Mettre à jour un matériau
  updateMaterial: async (id: string, material: Partial<Material>): Promise<Material> => {
    try {
      const backendData = transformMaterialToBackend(material);
      const response = await apiClient.patch(`/api/fournitures/${id}/`, backendData);
      return transformMaterial(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du matériau ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un matériau
  deleteMaterial: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/fournitures/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du matériau ${id}:`, error);
      throw error;
    }
  },

  // ==================== MAIN D'ŒUVRE ====================
  
  // Récupérer toute la main d'œuvre
  getLabor: async (filters?: Record<string, string>): Promise<Labor[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/main-oeuvre/?${params.toString()}`);
      
      // Django REST pagination: {count, next, previous, results}
      const labor = response.data.results || response.data;
      return labor.map(transformLabor);
    } catch (error) {
      console.error("Erreur lors du chargement de la main d'œuvre:", error);
      throw error;
    }
  },

  // Récupérer un type de main d'œuvre par ID
  getLaborItem: async (id: string): Promise<Labor> => {
    try {
      const response = await apiClient.get(`/api/main-oeuvre/${id}/`);
      return transformLabor(response.data);
    } catch (error) {
      console.error(`Erreur lors du chargement de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau type de main d'œuvre
  createLabor: async (labor: Partial<Labor>): Promise<Labor> => {
    try {
      const backendData = transformLaborToBackend(labor);
      const response = await apiClient.post('/api/main-oeuvre/', backendData);
      return transformLabor(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de la main d'œuvre:", error);
      throw error;
    }
  },

  // Mettre à jour un type de main d'œuvre
  updateLabor: async (id: string, labor: Partial<Labor>): Promise<Labor> => {
    try {
      const backendData = transformLaborToBackend(labor);
      const response = await apiClient.patch(`/api/main-oeuvre/${id}/`, backendData);
      return transformLabor(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un type de main d'œuvre
  deleteLabor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/main-oeuvre/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // ==================== INGRÉDIENTS D'OUVRAGES ====================
  
  // Créer un ingrédient pour un ouvrage
  createIngredient: async (ouvrageId: string, ingredient: {
    elementType: 'fourniture' | 'mainoeuvre';
    elementId: string;
    quantity: number;
    wasteAllowance?: number;
    notes?: string;
  }): Promise<WorkComponent> => {
    try {
      const backendData = {
        ouvrage: Number(ouvrageId),
        element_type_nom: ingredient.elementType,
        element_id: Number(ingredient.elementId),
        quantite: ingredient.quantity.toString(),
        waste_allowance: (ingredient.wasteAllowance || 0).toString(),
        notes: ingredient.notes || '',
      };
      
      const response = await apiClient.post('/api/ingredients/', backendData);
      return transformIngredient(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de l'ingrédient:", error);
      throw error;
    }
  },

  // Mettre à jour un ingrédient
  updateIngredient: async (id: string, updates: {
    quantity?: number;
    wasteAllowance?: number;
    notes?: string;
  }): Promise<WorkComponent> => {
    try {
      const backendData: any = {};
      if (updates.quantity !== undefined) {
        backendData.quantite = updates.quantity.toString();
      }
      if (updates.wasteAllowance !== undefined) {
        backendData.waste_allowance = updates.wasteAllowance.toString();
      }
      if (updates.notes !== undefined) {
        backendData.notes = updates.notes;
      }
      
      const response = await apiClient.patch(`/api/ingredients/${id}/`, backendData);
      return transformIngredient(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'ingrédient ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un ingrédient
  deleteIngredient: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/ingredients/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'ingrédient ${id}:`, error);
      throw error;
    }
  },

  // ==================== OUVRAGES ====================
  
  // Récupérer tous les ouvrages
  getWorks: async (filters?: Record<string, string>): Promise<Work[]> => {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          params.append(key, value);
        });
      }
      
      const response = await apiClient.get(`/api/ouvrages/?${params.toString()}`);
      
      // Django REST pagination: {count, next, previous, results}
      const works = response.data.results || response.data;
      return works.map(transformWork);
    } catch (error) {
      console.error("Erreur lors du chargement des ouvrages:", error);
      throw error;
    }
  },

  // Récupérer un ouvrage par ID avec détails
  getWork: async (id: string): Promise<Work> => {
    try {
      const response = await apiClient.get(`/api/ouvrages/${id}/`);
      return transformWork(response.data);
    } catch (error) {
      console.error(`Erreur lors du chargement de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel ouvrage
  createWork: async (work: Partial<Work>): Promise<Work> => {
    try {
      const backendData = transformWorkToBackend(work);
      const response = await apiClient.post('/api/ouvrages/', backendData);
      return transformWork(response.data);
    } catch (error) {
      console.error("Erreur lors de la création de l'ouvrage:", error);
      throw error;
    }
  },

  // Mettre à jour un ouvrage
  updateWork: async (id: string, work: Partial<Work>): Promise<Work> => {
    try {
      const backendData = transformWorkToBackend(work);
      const response = await apiClient.patch(`/api/ouvrages/${id}/`, backendData);
      return transformWork(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un ouvrage
  deleteWork: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/ouvrages/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // ==================== MÉTHODES COMBINÉES ====================
  
  // Récupérer tous les éléments de la bibliothèque
  getAllLibraryItems: async (): Promise<(Material | Labor | Work)[]> => {
    try {
      console.log("API: Récupération de tous les éléments de la bibliothèque");
      
      const [materials, labor, works] = await Promise.all([
        libraryApi.getMaterials(),
        libraryApi.getLabor(),
        libraryApi.getWorks(),
      ]);
      
      return [...materials, ...labor, ...works];
    } catch (error) {
      console.error("Erreur lors du chargement de la bibliothèque complète:", error);
      throw error;
    }
  },

  // Rechercher dans la bibliothèque (endpoint dédié Django)
  searchLibrary: async (query: string): Promise<{
    categories: WorkCategory[];
    fournitures: Material[];
    main_oeuvre: Labor[];
    ouvrages: Work[];
    total_results: number;
  }> => {
    try {
      const response = await apiClient.get(`/api/search/?q=${encodeURIComponent(query)}`);
      
      return {
        categories: (response.data.categories || []).map(transformCategory),
        fournitures: (response.data.fournitures || []).map(transformMaterial),
        main_oeuvre: (response.data.main_oeuvre || []).map(transformLabor),
        ouvrages: (response.data.ouvrages || []).map(transformWork),
        total_results: response.data.total_results || 0,
      };
    } catch (error) {
      console.error("Erreur lors de la recherche dans la bibliothèque:", error);
      // Fallback vers recherche séparée si l'endpoint global n'existe pas
      const [materials, labor, works] = await Promise.all([
        libraryApi.getMaterials({ search: query }),
        libraryApi.getLabor({ search: query }),
        libraryApi.getWorks({ search: query }),
      ]);
      
      return {
        categories: [],
        fournitures: materials,
        main_oeuvre: labor,
        ouvrages: works,
        total_results: materials.length + labor.length + works.length,
      };
    }
  },

  // Version simple pour compatibilité (retourne tous les résultats dans un tableau)
  searchLibrarySimple: async (query: string): Promise<(Material | Labor | Work)[]> => {
    try {
      const results = await libraryApi.searchLibrary(query);
      return [...results.fournitures, ...results.main_oeuvre, ...results.ouvrages];
    } catch (error) {
      console.error("Erreur lors de la recherche simple dans la bibliothèque:", error);
      throw error;
    }
  },

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

  // Méthodes spécifiques avec pagination explicite
  
  // Matériaux groupés par catégorie
  getMaterialsByCategory: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/fournitures/par_categorie/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux par catégorie:", error);
      throw error;
    }
  },

  // Main d'œuvre groupée par catégorie
  getLaborByCategory: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/main-oeuvre/par_categorie/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement de la main d'œuvre par catégorie:", error);
      throw error;
    }
  },

  // Ouvrages groupés par catégorie
  getWorksByCategory: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/api/ouvrages/par_categorie/');
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des ouvrages par catégorie:", error);
      throw error;
    }
  },

  // Méthodes avec pagination explicite
  
  getMaterialsPaginated: async (params?: PaginationParams & Record<string, string>): Promise<DjangoPaginatedResponse<Material>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
      }
      
      const response = await apiClient.get(`/api/fournitures/?${searchParams.toString()}`);
      
      // Si la réponse a la structure de pagination Django
      if (response.data.results !== undefined) {
        return {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map(transformMaterial),
        };
      }
      
      // Fallback si pas de pagination
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(transformMaterial),
      };
    } catch (error) {
      console.error("Erreur lors du chargement paginaé des matériaux:", error);
      throw error;
    }
  },

  getLaborPaginated: async (params?: PaginationParams & Record<string, string>): Promise<DjangoPaginatedResponse<Labor>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
      }
      
      const response = await apiClient.get(`/api/main-oeuvre/?${searchParams.toString()}`);
      
      // Si la réponse a la structure de pagination Django
      if (response.data.results !== undefined) {
        return {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map(transformLabor),
        };
      }
      
      // Fallback si pas de pagination
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(transformLabor),
      };
    } catch (error) {
      console.error("Erreur lors du chargement paginaé de la main d'œuvre:", error);
      throw error;
    }
  },

  getWorksPaginated: async (params?: PaginationParams & Record<string, string>): Promise<DjangoPaginatedResponse<Work>> => {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          searchParams.append(key, value.toString());
        });
      }
      
      const response = await apiClient.get(`/api/ouvrages/?${searchParams.toString()}`);
      
      // Si la réponse a la structure de pagination Django
      if (response.data.results !== undefined) {
        return {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          results: response.data.results.map(transformWork),
        };
      }
      
      // Fallback si pas de pagination
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(transformWork),
      };
    } catch (error) {
      console.error("Erreur lors du chargement paginaé des ouvrages:", error);
      throw error;
    }
  },
};

// Fonction utilitaire pour extraire les résultats d'une réponse paginaée ou non
export const extractResults = <T>(response: ApiResponse<T>): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  return response.results || [];
};

// Fonction utilitaire pour vérifier si une réponse est paginaée
export const isPaginatedResponse = <T>(response: ApiResponse<T>): response is DjangoPaginatedResponse<T> => {
  return !Array.isArray(response) && 'results' in response;
};

export type { DjangoPaginatedResponse, PaginationParams, ApiResponse };