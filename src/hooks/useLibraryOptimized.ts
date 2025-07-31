import { useState, useEffect, useCallback } from 'react';
import { Work, Material, Labor } from '@/features/library/types/workLibrary';
import { libraryApi } from '@/features/library/api/library';

interface UseLibraryOptimizedReturn {
  items: (Work | Material | Labor)[];
  materials: Material[];
  labor: Labor[];
  works: Work[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook optimisé pour la gestion de la library
export function useLibraryOptimized(): UseLibraryOptimizedReturn {
  const [items, setItems] = useState<(Work | Material | Labor)[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [labor, setLabor] = useState<Labor[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // OPTIMISATION: Un seul appel API unifié
      const allItems = await libraryApi.getAllLibraryItems();
      
      // Tri par type (plus efficace qu'avant)
      const materialItems: Material[] = [];
      const laborItems: Labor[] = [];
      const workItems: Work[] = [];
      
      allItems.forEach(item => {
        if ("vatRate" in item) {
          materialItems.push(item as Material);
        } else if ("components" in item) {
          workItems.push(item as Work);
        } else {
          laborItems.push(item as Labor);
        }
      });
      
      setItems(allItems);
      setMaterials(materialItems);
      setLabor(laborItems);
      setWorks(workItems);
      
    } catch (err: any) {
      console.error("Erreur chargement library:", err);
      setError("Impossible de charger les données");
      
      // Fallback vers l'ancien système si besoin
      try {
        const [materialsData, laborData, worksData] = await Promise.all([
          libraryApi.getMaterials(),
          libraryApi.getLabor(),
          libraryApi.getWorks(),
        ]);
        
        setMaterials(materialsData);
        setLabor(laborData);
        setWorks(worksData);
        setItems([...materialsData, ...laborData, ...worksData]);
        setError(null);
      } catch (fallbackErr) {
        console.error("Erreur fallback:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    items,
    materials,
    labor,
    works,
    loading,
    error,
    refetch: loadData,
  };
}