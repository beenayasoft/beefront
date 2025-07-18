import axios from 'axios';
import { Work, Material, Labor, WorkCategory } from '@/lib/types/workLibrary';

// URL de l'API
const API_URL = 'http://localhost:8000/api';

// Créer une instance axios avec config d'authentification
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types pour les réponses du backend
interface BackendCategory {
  id: number;
  nom: string;
  parent?: number;
  position?: number;
  chemin_complet?: string;
  sous_categories?: BackendCategory[];
}

interface BackendMaterial {
  id: number;
  nom: string;
  unite: string;
  prix_achat_ht: number;
  vat_rate: number;
  description?: string;
  reference?: string;
  supplier?: string;
  categorie?: number;
  categorie_nom?: string;
  type?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
}

interface BackendLabor {
  id: number;
  nom: string;
  cout_horaire: number;
  unite: string;
  description?: string;
  categorie?: number;
  categorie_nom?: string;
  type?: string;
  code?: string;
  created_at?: string;
  updated_at?: string;
}

interface BackendWork {
  id: number;
  nom: string;
  unite: string;
  description?: string;
  code?: string;
  categorie?: number;
  categorie_nom?: string;
  prix_recommande: number;
  marge: number;
  is_custom: boolean;
  type?: string;
  complexity?: string;
  efficiency?: number;
  debourse_sec: number;
  totalCost?: number;
  recommendedPrice?: number;
  margin?: number;
  laborCost?: number;
  materialCost?: number;
  created_at?: string;
  updated_at?: string;
  ingredients?: any[];
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
  reference: backendMaterial.reference || backendMaterial.code,
  name: backendMaterial.nom,
  description: backendMaterial.description,
  unit: backendMaterial.unite,
  unitPrice: Number(backendMaterial.prix_achat_ht),
  vatRate: Number(backendMaterial.vat_rate),
  supplier: backendMaterial.supplier,
  category: backendMaterial.categorie_nom,
});

const transformLabor = (backendLabor: BackendLabor): Labor => ({
  id: backendLabor.id.toString(),
  name: backendLabor.nom,
  description: backendLabor.description,
  unit: backendLabor.unite || 'h',
  unitPrice: Number(backendLabor.cout_horaire),
  category: backendLabor.categorie_nom,
});

const transformWork = (backendWork: BackendWork): Work => ({
  id: backendWork.id.toString(),
  reference: backendWork.code,
  name: backendWork.nom,
  description: backendWork.description,
  categoryId: backendWork.categorie?.toString() || '',
  unit: backendWork.unite,
  components: [], // TODO: Transformer les ingredients
  laborCost: Number(backendWork.laborCost || 0),
  materialCost: Number(backendWork.materialCost || 0),
  totalCost: Number(backendWork.debourse_sec || backendWork.totalCost || 0),
  recommendedPrice: Number(backendWork.prix_recommande || backendWork.recommendedPrice || 0),
  margin: Number(backendWork.marge || backendWork.margin || 0),
  createdAt: backendWork.created_at || new Date().toISOString(),
  updatedAt: backendWork.updated_at || new Date().toISOString(),
  isCustom: backendWork.is_custom || false,
});

// Fonctions de transformation Frontend → Backend
const transformMaterialToBackend = (material: Partial<Material>) => ({
  nom: material.name,
  unite: material.unit,
  prix_achat_ht: material.unitPrice,
  vat_rate: material.vatRate,
  description: material.description,
  reference: material.reference,
  supplier: material.supplier,
});

const transformLaborToBackend = (labor: Partial<Labor>) => ({
  nom: labor.name,
  cout_horaire: labor.unitPrice,
  unite: labor.unit || 'h',
  description: labor.description,
});

const transformWorkToBackend = (work: Partial<Work>) => ({
  nom: work.name,
  unite: work.unit,
  description: work.description,
  code: work.reference,
  prix_recommande: work.recommendedPrice,
  marge: work.margin,
  is_custom: work.isCustom,
});

// API Bibliothèque
export const libraryApi = {
  // ==================== CATÉGORIES ====================
  
  // Récupérer toutes les catégories
  getCategories: async (): Promise<WorkCategory[]> => {
    try {
      console.log("API: Récupération des catégories");
      const response = await apiClient.get('/library/categories/');
      console.log("Réponse catégories:", response.data);
      
      const categories = Array.isArray(response.data) ? response.data : response.data.results || [];
      return categories.map(transformCategory);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
      throw error;
    }
  },

  // Récupérer les catégories racines
  getRootCategories: async (): Promise<WorkCategory[]> => {
    try {
      console.log("API: Récupération des catégories racines");
      const response = await apiClient.get('/library/categories/racines/');
      console.log("Réponse catégories racines:", response.data);
      
      return response.data.map(transformCategory);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories racines:", error);
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
      
      const response = await apiClient.get(`/library/fournitures/?${params.toString()}`);
      
      const materials = Array.isArray(response.data) ? response.data : response.data.results || [];
      return materials.map(transformMaterial);
    } catch (error) {
      console.error("Erreur lors du chargement des matériaux:", error);
      throw error;
    }
  },

  // Récupérer un matériau par ID
  getMaterial: async (id: string): Promise<Material> => {
    try {
      const response = await apiClient.get(`/library/fournitures/${id}/`);
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
      const response = await apiClient.post('/library/fournitures/', backendData);
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
      const response = await apiClient.patch(`/library/fournitures/${id}/`, backendData);
      return transformMaterial(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du matériau ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un matériau
  deleteMaterial: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/library/fournitures/${id}/`);
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
      
      const response = await apiClient.get(`/library/main-oeuvre/?${params.toString()}`);
      
      const labor = Array.isArray(response.data) ? response.data : response.data.results || [];
      return labor.map(transformLabor);
    } catch (error) {
      console.error("Erreur lors du chargement de la main d'œuvre:", error);
      throw error;
    }
  },

  // Récupérer un type de main d'œuvre par ID
  getLaborItem: async (id: string): Promise<Labor> => {
    try {
      const response = await apiClient.get(`/library/main-oeuvre/${id}/`);
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
      const response = await apiClient.post('/library/main-oeuvre/', backendData);
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
      const response = await apiClient.patch(`/library/main-oeuvre/${id}/`, backendData);
      return transformLabor(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la main d'œuvre ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un type de main d'œuvre
  deleteLabor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/library/main-oeuvre/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la main d'œuvre ${id}:`, error);
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
      
      const response = await apiClient.get(`/library/ouvrages/?${params.toString()}`);
      
      const works = Array.isArray(response.data) ? response.data : response.data.results || [];
      return works.map(transformWork);
    } catch (error) {
      console.error("Erreur lors du chargement des ouvrages:", error);
      throw error;
    }
  },

  // Récupérer un ouvrage par ID avec détails
  getWork: async (id: string): Promise<Work> => {
    try {
      const response = await apiClient.get(`/library/ouvrages/${id}/`);
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
      const response = await apiClient.post('/library/ouvrages/', backendData);
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
      const response = await apiClient.patch(`/library/ouvrages/${id}/`, backendData);
      return transformWork(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'ouvrage ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un ouvrage
  deleteWork: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/library/ouvrages/${id}/`);
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

  // Rechercher dans la bibliothèque
  searchLibrary: async (query: string): Promise<(Material | Labor | Work)[]> => {
    try {
      console.log("API: Recherche dans la bibliothèque:", query);
      
      const [materials, labor, works] = await Promise.all([
        libraryApi.getMaterials({ search: query }),
        libraryApi.getLabor({ search: query }),
        libraryApi.getWorks({ search: query }),
      ]);
      
      return [...materials, ...labor, ...works];
    } catch (error) {
      console.error("Erreur lors de la recherche dans la bibliothèque:", error);
      throw error;
    }
  },
}; 