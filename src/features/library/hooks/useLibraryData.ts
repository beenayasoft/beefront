import { useState, useEffect, useCallback } from 'react';
import { Work, Material, Labor } from '../types/workLibrary';
import { libraryApi } from '../api/library';

// Fonction optimisée pour supprimer les doublons par ID
function removeDuplicatesById<T extends { id: string }>(items: T[]): T[] {
  if (items.length <= 1) return items;
  
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export interface UseLibraryDataReturn {
  materials: Material[];
  labor: Labor[];
  works: Work[];
  loading: boolean;
  error: string | null;
  loadLibraryData: () => Promise<void>;
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  setLabor: React.Dispatch<React.SetStateAction<Labor[]>>;
  setWorks: React.Dispatch<React.SetStateAction<Work[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useLibraryData(): UseLibraryDataReturn {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [labor, setLabor] = useState<Labor[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fonction pour charger les données depuis l'API
  const loadLibraryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger toutes les données en parallèle
      const [materialsData, laborData, worksData] = await Promise.all([
        libraryApi.getMaterials(),
        libraryApi.getLabor(),
        libraryApi.getWorks(),
      ]);
      
      // Supprimer les doublons simplement
      setMaterials(removeDuplicatesById(materialsData));
      setLabor(removeDuplicatesById(laborData));
      setWorks(removeDuplicatesById(worksData));
      setHasLoaded(true);
      
    } catch (err: any) {
      console.error("❌ [LIBRARY PAGE] Erreur lors du chargement de la bibliothèque:", err);
      
      let errorMessage = "Impossible de charger les données de la bibliothèque.";
      
      if (err.response) {
        errorMessage += ` Erreur ${err.response.status}: ${err.response.data?.detail || err.response.statusText}`;
      } else if (err.request) {
        errorMessage += " Problème de connexion au serveur.";
      } else {
        errorMessage += ` ${err.message}`;
      }
      
      setError(errorMessage);
      setHasLoaded(true); // Marquer comme tenté même en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances car on utilise seulement des setters

  // Charger les données au montage du composant
  useEffect(() => {
    // Charger seulement une fois au montage si pas encore chargé
    if (!hasLoaded) {
      loadLibraryData();
    }
  }, [hasLoaded, loadLibraryData]); // Dépendances complètes

  return {
    materials,
    labor,
    works,
    loading,
    error,
    loadLibraryData,
    setMaterials,
    setLabor,
    setWorks,
    setLoading,
    setError,
  };
}