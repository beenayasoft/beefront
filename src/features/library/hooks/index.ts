/**
 * Library Hooks - Custom hooks pour la feature Library
 * Gestion de la bibliothèque d'ouvrages, matériaux et main-d'œuvre
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { libraryApi, DjangoPaginatedResponse } from '../api/library';
import { Work, Material, Labor, WorkCategory, LibraryItem } from '../types/workLibrary';

// Hook pour gérer l'état de chargement et d'erreur
interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Hook générique pour gérer les données avec cache local
function useLibraryData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): T | null & LoadingState {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Erreur lors du chargement des données:', err);
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  } as T | null & LoadingState & { refetch: () => Promise<void> };
}

// Hook pour les catégories
export function useCategories(filters?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getCategories(filters),
    [JSON.stringify(filters)]
  );
}

// Hook pour les catégories racines
export function useRootCategories() {
  return useLibraryData(() => libraryApi.getRootCategories());
}

// Hook pour les matériaux
export function useMaterials(filters?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getMaterials(filters),
    [JSON.stringify(filters)]
  );
}

// Hook pour les matériaux avec pagination
export function useMaterialsPaginated(params?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getMaterialsPaginated(params),
    [JSON.stringify(params)]
  );
}

// Hook pour un matériau spécifique
export function useMaterial(id: string | null) {
  return useLibraryData(
    () => id ? libraryApi.getMaterial(id) : Promise.resolve(null),
    [id]
  );
}

// Hook pour la main d'œuvre
export function useLabor(filters?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getLabor(filters),
    [JSON.stringify(filters)]
  );
}

// Hook pour la main d'œuvre avec pagination
export function useLaborPaginated(params?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getLaborPaginated(params),
    [JSON.stringify(params)]
  );
}

// Hook pour un type de main d'œuvre spécifique
export function useLaborItem(id: string | null) {
  return useLibraryData(
    () => id ? libraryApi.getLaborItem(id) : Promise.resolve(null),
    [id]
  );
}

// Hook pour les ouvrages
export function useWorks(filters?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getWorks(filters),
    [JSON.stringify(filters)]
  );
}

// Hook pour les ouvrages avec pagination
export function useWorksPaginated(params?: Record<string, string>) {
  return useLibraryData(
    () => libraryApi.getWorksPaginated(params),
    [JSON.stringify(params)]
  );
}

// Hook pour un ouvrage spécifique
export function useWork(id: string | null) {
  return useLibraryData(
    () => id ? libraryApi.getWork(id) : Promise.resolve(null),
    [id]
  );
}

// Hook principal pour la bibliothèque complète
export function useWorkLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'work' | 'material' | 'labor'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Chargement des données de base
  const categories = useCategories();
  const materials = useMaterials();
  const labor = useLabor();
  const works = useWorks();
  
  // Combinaison de tous les éléments
  const allItems = useMemo(() => {
    const items: LibraryItem[] = [];
    if (materials.data) items.push(...materials.data);
    if (labor.data) items.push(...labor.data);
    if (works.data) items.push(...works.data);
    return items;
  }, [materials.data, labor.data, works.data]);
  
  // Filtrage des éléments
  const filteredItems = useMemo(() => {
    let filtered = allItems;
    
    // Filtrage par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => {
        if (selectedType === 'material') return 'vatRate' in item || 'supplier' in item;
        if (selectedType === 'labor') return !('vatRate' in item) && !('components' in item);
        if (selectedType === 'work') return 'components' in item;
        return true;
      });
    }
    
    // Filtrage par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filtrage par recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [allItems, selectedType, selectedCategory, searchQuery]);
  
  // État de chargement global
  const isLoading = categories.isLoading || materials.isLoading || labor.isLoading || works.isLoading;
  const error = categories.error || materials.error || labor.error || works.error;
  
  // Fonction de recherche avec l'API dédiée
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const searchLibrary = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    
    try {
      setIsSearching(true);
      const results = await libraryApi.searchLibrary(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  // Méthodes de mutation
  const createMaterial = useCallback(async (material: Partial<Material>) => {
    try {
      const newMaterial = await libraryApi.createMaterial(material);
      // Recharger les matériaux
      materials.refetch?.();
      return newMaterial;
    } catch (err) {
      console.error('Erreur lors de la création du matériau:', err);
      throw err;
    }
  }, [materials.refetch]);
  
  const createLabor = useCallback(async (laborItem: Partial<Labor>) => {
    try {
      const newLabor = await libraryApi.createLabor(laborItem);
      // Recharger la main d'œuvre
      labor.refetch?.();
      return newLabor;
    } catch (err) {
      console.error('Erreur lors de la création de la main d\'œuvre:', err);
      throw err;
    }
  }, [labor.refetch]);
  
  const createWork = useCallback(async (work: Partial<Work>) => {
    try {
      const newWork = await libraryApi.createWork(work);
      // Recharger les ouvrages
      works.refetch?.();
      return newWork;
    } catch (err) {
      console.error('Erreur lors de la création de l\'ouvrage:', err);
      throw err;
    }
  }, [works.refetch]);
  
  return {
    // Données
    categories: categories.data || [],
    materials: materials.data || [],
    labor: labor.data || [],
    works: works.data || [],
    allItems,
    filteredItems,
    
    // État
    isLoading,
    error,
    
    // Filtres
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    
    // Recherche
    searchResults,
    isSearching,
    searchLibrary,
    
    // Mutations
    createMaterial,
    createLabor,
    createWork,
    
    // Rechargement
    refetch: () => {
      categories.refetch?.();
      materials.refetch?.();
      labor.refetch?.();
      works.refetch?.();
    },
  };
}

// Hook pour les statistiques
export function useLibraryStats() {
  return useLibraryData(() => libraryApi.getStats());
}

// Hook pour les données groupées par catégorie
export function useLibraryByCategory() {
  const materialsByCategory = useLibraryData(() => libraryApi.getMaterialsByCategory());
  const laborByCategory = useLibraryData(() => libraryApi.getLaborByCategory());
  const worksByCategory = useLibraryData(() => libraryApi.getWorksByCategory());
  
  return {
    materials: materialsByCategory.data,
    labor: laborByCategory.data,
    works: worksByCategory.data,
    isLoading: materialsByCategory.isLoading || laborByCategory.isLoading || worksByCategory.isLoading,
    error: materialsByCategory.error || laborByCategory.error || worksByCategory.error,
  };
}

// Hook générique pour la pagination
export function usePagination<T>(data: DjangoPaginatedResponse<T> | null) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.count / (data.results.length || 1));
  }, [data]);
  
  const hasNext = Boolean(data?.next);
  const hasPrevious = Boolean(data?.previous);
  
  return {
    currentPage,
    setCurrentPage,
    totalPages,
    hasNext,
    hasPrevious,
    totalItems: data?.count || 0,
    itemsPerPage: data?.results.length || 0,
  };
}

// Hook supprimé - plus besoin de tests avec les endpoints corrigés