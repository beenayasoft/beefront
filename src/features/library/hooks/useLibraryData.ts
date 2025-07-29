import { useState, useEffect } from 'react';
import { Work, Material, Labor } from '../types';
import { libraryApi } from '../api';

// Fonction pour supprimer les doublons par ID
function removeDuplicatesById<T extends { id: string; name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const unique = items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
  
  return unique;
}

// Fonction pour valider et nettoyer les collections par type
function validateAndCleanCollections(
  materials: Material[], 
  labor: Labor[], 
  works: Work[]
): { cleanMaterials: Material[], cleanLabor: Labor[], cleanWorks: Work[] } {
  
  let allItems = [...materials, ...labor, ...works];
  
  let cleanMaterials: Material[] = [];
  let cleanLabor: Labor[] = [];
  let cleanWorks: Work[] = [];
  
  allItems.forEach(item => {
    // Détecter un ouvrage (a des composants)
    if ('components' in item) {
      cleanWorks.push(item as Work);
    }
    // Détecter un matériau (a vatRate)
    else if ('vatRate' in item) {
      cleanMaterials.push(item as Material);
    }
    // Détecter de la main d'œuvre (ni components ni vatRate)
    else if (!('vatRate' in item) && !('components' in item)) {
      cleanLabor.push(item as Labor);
    }
  });

  // Supprimer les doublons dans chaque collection nettoyée
  cleanMaterials = removeDuplicatesById(cleanMaterials);
  cleanLabor = removeDuplicatesById(cleanLabor);
  cleanWorks = removeDuplicatesById(cleanWorks);

  return { cleanMaterials, cleanLabor, cleanWorks };
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

  // Fonction pour charger les données depuis l'API
  const loadLibraryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger toutes les données en parallèle
      const [materialsData, laborData, worksData] = await Promise.all([
        libraryApi.getMaterials(),
        libraryApi.getLabor(),
        libraryApi.getWorks(),
      ]);
      
      // Supprimer les doublons
      const dedupedMaterials = removeDuplicatesById(materialsData);
      const dedupedLabor = removeDuplicatesById(laborData);
      const dedupedWorks = removeDuplicatesById(worksData);
      
      // Valider et nettoyer les collections pour garantir que chaque type est dans la bonne collection
      const { cleanMaterials, cleanLabor, cleanWorks } = validateAndCleanCollections(
        dedupedMaterials, 
        dedupedLabor, 
        dedupedWorks
      );
      
      // Sauvegarder les collections nettoyées
      setMaterials(cleanMaterials);
      setLabor(cleanLabor);
      setWorks(cleanWorks);
      
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
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    // Éviter le double chargement si les données sont déjà là
    if (materials.length === 0 && labor.length === 0 && works.length === 0) {
      loadLibraryData();
    }
  }, []); // Dépendances vides pour exécuter une seule fois

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