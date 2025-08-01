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

// Cache de session pour éviter les rechargements inutiles
const CACHE_KEY = 'library_data_cache';
const CACHE_TIMESTAMP_KEY = 'library_data_timestamp';
const CACHE_VERSION_KEY = 'library_cache_version';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Version du cache - incrémentée à chaque modification
let cacheVersion = Date.now();

function getCachedData() {
  try {
    const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
    const data = sessionStorage.getItem(CACHE_KEY);
    const storedVersion = sessionStorage.getItem(CACHE_VERSION_KEY);
    
    if (timestamp && data && storedVersion) {
      const age = Date.now() - parseInt(timestamp);
      const versionMatch = parseInt(storedVersion) === cacheVersion;
      
      // Cache valide si récent ET version correcte
      if (age < CACHE_DURATION && versionMatch) {
        return JSON.parse(data);
      }
    }
  } catch (e) {
    console.warn('Erreur lecture cache session:', e);
  }
  return null;
}

function setCachedData(materials: Material[], labor: Labor[], works: Work[]) {
  try {
    const data = { materials, labor, works };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    sessionStorage.setItem(CACHE_VERSION_KEY, cacheVersion.toString());
  } catch (e) {
    console.warn('Erreur écriture cache session:', e);
  }
}

// FONCTION CRITIQUE : Invalider le cache après modifications
function invalidateCache(reason: string = 'modification') {
  console.log(`🗑️ [LIBRARY CACHE] Cache invalidé - raison: ${reason}`);
  cacheVersion = Date.now();
  try {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    sessionStorage.removeItem(CACHE_VERSION_KEY);
  } catch (e) {
    console.warn('Erreur invalidation cache:', e);
  }
}

export interface UseLibraryDataReturn {
  materials: Material[];
  labor: Labor[];
  works: Work[];
  loading: boolean;
  error: string | null;
  loadLibraryData: () => Promise<void>;
  reloadLibraryData: () => Promise<void>;
  invalidateCache: (reason?: string) => void;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour charger les données depuis l'API - OPTIMISÉE avec cache
  const loadLibraryData = useCallback(async () => {
    // Vérifier d'abord le cache
    const cachedData = getCachedData();
    if (cachedData && cachedData.materials && cachedData.labor && cachedData.works) {
      console.log("📦 [LIBRARY CACHE] Données trouvées dans le cache session");
      setMaterials(cachedData.materials);
      setLabor(cachedData.labor);
      setWorks(cachedData.works);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔄 [LIBRARY API] Chargement depuis l'API...");
      
      // OPTIMISATION: Utiliser l'endpoint unifié si disponible
      try {
        const allData = await libraryApi.getAllLibraryItems();
        
        // Trier par type
        const materialsData: Material[] = [];
        const laborData: Labor[] = [];
        const worksData: Work[] = [];
        
        allData.forEach(item => {
          if (item && typeof item === 'object') {
            if ("vatRate" in item || "vat_rate" in item) {
              materialsData.push(item as Material);
            } else if ("components" in item) {
              worksData.push(item as Work);
            } else {
              laborData.push(item as Labor);
            }
          }
        });
        
        setMaterials(materialsData);
        setLabor(laborData);
        setWorks(worksData);
        setCachedData(materialsData, laborData, worksData);
        
      } catch (unifiedError) {
        // Fallback: 3 appels séparés
        console.warn("Endpoint unifié indisponible, fallback vers appels séparés");
        const [materialsData, laborData, worksData] = await Promise.all([
          libraryApi.getMaterials(),
          libraryApi.getLabor(),
          libraryApi.getWorks(),
        ]);
        
        const cleanMaterials = removeDuplicatesById(materialsData);
        const cleanLabor = removeDuplicatesById(laborData);
        const cleanWorks = removeDuplicatesById(worksData);
        
        setMaterials(cleanMaterials);
        setLabor(cleanLabor);
        setWorks(cleanWorks);
        setCachedData(cleanMaterials, cleanLabor, cleanWorks);
      }
      
      console.log("✅ [LIBRARY API] Données chargées avec succès");
      
    } catch (err: any) {
      console.error("❌ [LIBRARY API] Erreur lors du chargement:", err);
      
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
  }, []);

  // Fonction pour forcer le rechargement
  const reloadLibraryData = useCallback(async () => {
    console.log("🔄 [LIBRARY API] Rechargement forcé des données");
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    await loadLibraryData();
  }, [loadLibraryData]);

  // Charger les données au montage du composant
  useEffect(() => {
    loadLibraryData();
  }, [loadLibraryData]);

  return {
    materials,
    labor,
    works,
    loading,
    error,
    loadLibraryData,
    reloadLibraryData,
    invalidateCache,
    setMaterials,
    setLabor,
    setWorks,
    setLoading,
    setError,
  };
}