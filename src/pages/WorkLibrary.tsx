import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Settings,
  Search,
  Filter,
  BarChart3,
  Package,
  Hammer,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { LibraryItemsList, LibraryFilters } from "@/components/quotes/library/LibraryItemsList";
import { LibraryItemForm } from "@/components/quotes/library/LibraryItemForm";
import { WorkCompositionForm } from "@/components/quotes/library/WorkCompositionForm";
import { Work, Material, Labor } from "@/lib/types/workLibrary";
import { libraryApi } from "@/lib/api/library";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

// Fonction améliorée pour supprimer les doublons par ID avec logs détaillés
function removeDuplicatesById<T extends { id: string; name: string }>(items: T[], type: string = "éléments"): T[] {
  const seen = new Set<string>();
  const unique = items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
  
  const duplicates = items.filter(item => !unique.includes(item));
  
  // Log supprimé - fonctionnalité validée
  return unique;
}

// Cache global pour éviter les duplications entre composants
let mockDataCache: { materials: Material[], labor: Labor[], works: Work[] } | null = null;

async function getMockDataOnce(): Promise<{ materials: Material[], labor: Labor[], works: Work[] }> {
  if (mockDataCache) {
    console.log("📦 Utilisation du cache mock existant");
    return mockDataCache;
  }
  
  console.log("📦 Chargement initial des données mock");
  const { mockMaterials, mockLabor, mockWorks } = await import("@/lib/mock/workLibrary");
  
  mockDataCache = {
    materials: removeDuplicatesById([...mockMaterials], "matériaux mock"),
    labor: removeDuplicatesById([...mockLabor], "main d'œuvre mock"),
    works: removeDuplicatesById([...mockWorks], "ouvrages mock")
  };
  
  return mockDataCache;
}

// Fonction pour valider et nettoyer les collections par type
function validateAndCleanCollections(
  materials: Material[], 
  labor: Labor[], 
  works: Work[]
): { cleanMaterials: Material[], cleanLabor: Labor[], cleanWorks: Work[] } {
  
  // Séparer les éléments selon leur vraie nature
  let allItems = [...materials, ...labor, ...works];
  
  let cleanMaterials: Material[] = [];
  let cleanLabor: Labor[] = [];
  let cleanWorks: Work[] = [];
  let invalidItems = 0;
  
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
    else {
      invalidItems++;
    }
  });

  // Supprimer les doublons dans chaque collection nettoyée
  cleanMaterials = removeDuplicatesById(cleanMaterials, "matériaux nettoyés");
  cleanLabor = removeDuplicatesById(cleanLabor, "main d'œuvre nettoyée");
  cleanWorks = removeDuplicatesById(cleanWorks, "ouvrages nettoyés");

  // Log supprimé - fonctionnalité validée

  return { cleanMaterials, cleanLabor, cleanWorks };
}

export default function WorkLibrary() {
  const navigate = useNavigate();
  
  // État pour les données
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
      const dedupedMaterials = removeDuplicatesById(materialsData, "matériaux API");
      const dedupedLabor = removeDuplicatesById(laborData, "main d'œuvre API");
      const dedupedWorks = removeDuplicatesById(worksData, "ouvrages API");
      
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
      
    } catch (err) {
      console.error("❌ Erreur lors du chargement de la bibliothèque:", err);
      setError("Impossible de charger les données de la bibliothèque. Utilisation des données de test.");
      
      // Fallback vers les données mock en cas d'erreur
      const mockData = await getMockDataOnce();
      setMaterials(mockData.materials);
      setLabor(mockData.labor);
      setWorks(mockData.works);
    } finally {
      setLoading(false);
    }
  };

  // État pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "material" | "labor" | "work">("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Constants
  const ITEMS_PER_PAGE = 10;

  // Charger les données au montage du composant
  useEffect(() => {
    // Éviter le double chargement si les données sont déjà là
    if (materials.length === 0 && labor.length === 0 && works.length === 0) {
      loadLibraryData();
    }
  }, []); // Dépendances vides pour exécuter une seule fois

  // État pour les dialogues
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [currentItemType, setCurrentItemType] = useState<"material" | "labor" | "work">("material");
  const [selectedItem, setSelectedItem] = useState<Work | Material | Labor | null>(null);

  // Filtrer et trier les éléments - VERSION OPTIMISÉE AVEC USEMEMO
  const filteredItems = useMemo(() => {
    // Étape 1: Créer la liste unifiée selon l'onglet sélectionné
    let baseItems: (Work | Material | Labor)[] = [];
    
    switch (activeTab) {
      case "all":
        baseItems = [...materials, ...labor, ...works];
        break;
      case "material":
        baseItems = [...materials];
        break;
      case "labor":
        baseItems = [...labor];
        break;
      case "work":
        baseItems = [...works];
        break;
      default:
        baseItems = [...materials, ...labor, ...works];
    }

    // Étape 2: Appliquer la recherche textuelle
    let searchFiltered = baseItems;
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      searchFiltered = baseItems.filter(item => {
        const name = (item.name || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const reference = ("reference" in item && item.reference) ? item.reference.toLowerCase() : "";
        
        return name.includes(query) || 
               description.includes(query) || 
               reference.includes(query);
      });
    }

    // Étape 3: Appliquer le tri
    const sortedItems = [...searchFiltered].sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortField) {
        case "unitPrice":
          // Utiliser 'recommendedPrice' pour les ouvrages, 'unitPrice' pour le reste
          valueA = "recommendedPrice" in a ? a.recommendedPrice : a.unitPrice;
          valueB = "recommendedPrice" in b ? b.recommendedPrice : b.unitPrice;
          break;
          
        case "reference":
          valueA = 'reference' in a ? (a.reference || "") : "";
          valueB = 'reference' in b ? (b.reference || "") : "";
          break;
          
        case "name":
          valueA = a.name || "";
          valueB = b.name || "";
          break;
          
        case "unit":
          valueA = a.unit || "";
          valueB = b.unit || "";
          break;
          
        default:
          valueA = (a as any)[sortField] || "";
          valueB = (b as any)[sortField] || "";
      }

      // Comparaison selon le type
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        const comparison = String(valueA).localeCompare(String(valueB));
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });
    
    return sortedItems;
  }, [materials, labor, works, activeTab, searchQuery, sortField, sortDirection]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Gestionnaires d'événements
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Réinitialiser la pagination lors d'une nouvelle recherche
  };

  // Nouveau: recherche en temps réel
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setCurrentPage(1);
    // Pas besoin d'attendre un submit, filtrage immédiat
  };

  // Nouveau: fonction pour réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setSortField("name");
    setSortDirection("asc");
    setCurrentPage(1);
    setShowAdvancedFilters(false);
  };

  const handleTabChange = (tab: "all" | "material" | "labor" | "work") => {
    setActiveTab(tab);
    setCurrentPage(1); // Réinitialiser la pagination lors de la modification de l'onglet
  };

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemClick = (item: Work | Material | Labor) => {
    // Naviguer vers la page de détail appropriée
    if ("components" in item) {
      navigate(`/bibliotheque/ouvrage/${item.id}`);
    } else if ("vatRate" in item) {
      navigate(`/bibliotheque/materiau/${item.id}`);
    } else {
      navigate(`/bibliotheque/main-oeuvre/${item.id}`);
    }
  };

  const handleItemEdit = (item: Work | Material | Labor) => {
    setSelectedItem(item);
    
    if ("components" in item) {
      setCurrentItemType("work");
      setShowWorkForm(true);
    } else if ("vatRate" in item) {
      setCurrentItemType("material");
      setShowItemForm(true);
    } else {
      setCurrentItemType("labor");
      setShowItemForm(true);
    }
  };

  const handleAddItem = (type: "material" | "labor" | "work") => {
    setSelectedItem(null);
    setCurrentItemType(type);
    setShowTypeSelector(false); // Fermer la modale de sélection de type
    
    if (type === "work") {
      setShowWorkForm(true);
    } else {
      setShowItemForm(true);
    }
  };

  // Fonction pour gérer l'annulation et fermer toutes les modales
  const handleCancelForm = () => {
    setShowItemForm(false);
    setShowWorkForm(false);
    setShowTypeSelector(false);
    setSelectedItem(null);
  };



  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      
      if ("components" in selectedItem) {
        await libraryApi.deleteWork(selectedItem.id);
        setWorks(works.filter(w => w.id !== selectedItem.id));
      } else if ("vatRate" in selectedItem) {
        await libraryApi.deleteMaterial(selectedItem.id);
        setMaterials(materials.filter(m => m.id !== selectedItem.id));
      } else {
        await libraryApi.deleteLabor(selectedItem.id);
        setLabor(labor.filter(l => l.id !== selectedItem.id));
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setError("Erreur lors de la suppression de l'élément");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: Material | Labor | Work) => {
    try {
      setLoading(true);
      
      if ("components" in item) {
        // C'est un ouvrage
        const workItem = item as Work;
        const existingIndex = works.findIndex(w => w.id === workItem.id);
        const isNew = !workItem.id || workItem.id.startsWith('work-') || existingIndex === -1;
        
        let savedWork: Work;
        if (isNew) {
          // Ajout d'un nouvel ouvrage
          savedWork = await libraryApi.createWork(workItem);
          setWorks([...works, savedWork]);
          
          // Fermer toutes les modales et rediriger vers la page de détail
          setShowWorkForm(false);
          setShowTypeSelector(false);
          setSelectedItem(null);
          navigate(`/bibliotheque/ouvrage/${savedWork.id}`);
          return; // Sortir de la fonction pour éviter la logique de mise à jour
        } else {
          // Mise à jour d'un ouvrage existant
          savedWork = await libraryApi.updateWork(workItem.id, workItem);
          const updatedWorks = [...works];
          updatedWorks[existingIndex] = savedWork;
          setWorks(updatedWorks);
        }
        
        setShowWorkForm(false);
      } else if ("vatRate" in item) {
        // C'est un matériau
        const materialItem = item as Material;
        const existingIndex = materials.findIndex(m => m.id === materialItem.id);
        const isNew = !materialItem.id || materialItem.id.startsWith('material-') || existingIndex === -1;
        
        let savedMaterial: Material;
        if (isNew) {
          // Ajout d'un nouveau matériau
          savedMaterial = await libraryApi.createMaterial(materialItem);
          setMaterials([...materials, savedMaterial]);
          
          // Fermer toutes les modales et rediriger vers la page de détail
          setShowItemForm(false);
          setShowTypeSelector(false);
          setSelectedItem(null);
          navigate(`/bibliotheque/materiau/${savedMaterial.id}`);
          return; // Sortir de la fonction pour éviter la logique de mise à jour
        } else {
          // Mise à jour d'un matériau existant
          savedMaterial = await libraryApi.updateMaterial(materialItem.id, materialItem);
          const updatedMaterials = [...materials];
          updatedMaterials[existingIndex] = savedMaterial;
          setMaterials(updatedMaterials);
        }
        
        setShowItemForm(false);
      } else {
        // C'est de la main d'œuvre
        const laborItem = item as Labor;
        const existingIndex = labor.findIndex(l => l.id === laborItem.id);
        const isNew = !laborItem.id || laborItem.id.startsWith('labor-') || existingIndex === -1;
        
        let savedLabor: Labor;
        if (isNew) {
          // Ajout d'une nouvelle main d'œuvre
          savedLabor = await libraryApi.createLabor(laborItem);
          setLabor([...labor, savedLabor]);
          
          // Fermer toutes les modales et rediriger vers la page de détail
          setShowItemForm(false);
          setShowTypeSelector(false);
          setSelectedItem(null);
          navigate(`/bibliotheque/main-oeuvre/${savedLabor.id}`);
          return; // Sortir de la fonction pour éviter la logique de mise à jour
        } else {
          // Mise à jour d'une main d'œuvre existante
          savedLabor = await libraryApi.updateLabor(laborItem.id, laborItem);
          const updatedLabor = [...labor];
          updatedLabor[existingIndex] = savedLabor;
          setLabor(updatedLabor);
        }
        
        setShowItemForm(false);
      }
      
      setSelectedItem(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setError("Erreur lors de la sauvegarde de l'élément");
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour les statistiques
  const getTotalItems = () => {
    return materials.length + labor.length + works.length;
  };

  const getTotalValue = () => {
    const materialsValue = materials.reduce((sum, item) => sum + item.unitPrice, 0);
    const laborValue = labor.reduce((sum, item) => sum + item.unitPrice, 0);
    const worksValue = works.reduce((sum, item) => sum + item.recommendedPrice, 0);
    return materialsValue + laborValue + worksValue;
  };

  const getRecentlyUpdated = () => {
    // Dans un cas réel, on utiliserait une date pour trier
    // Ici on retourne simplement un nombre fixe pour la maquette
    return 3;
  };

  // Affichage pendant le chargement initial
  if (loading && materials.length === 0 && labor.length === 0 && works.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="benaya-card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-benaya-600" />
              <div className="text-lg font-medium">Chargement de la bibliothèque...</div>
              <div className="text-sm text-neutral-600">
                Récupération des données depuis l'API
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Bibliothèque d'ouvrages</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos ouvrages, matériaux et main d'œuvre
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <BarChart3 className="w-4 h-4" />
              Rapport
            </Button>
            <Dialog open={showTypeSelector} onOpenChange={setShowTypeSelector}>
              <DialogTrigger asChild>
                <Button 
                  className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
                  disabled={loading}
                  onClick={() => setShowTypeSelector(true)}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Ajouter un élément
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un élément</DialogTitle>
                  <DialogDescription>
                    Sélectionnez le type d'élément à ajouter
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => handleAddItem("material")}
                  >
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <span>Matériau</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => handleAddItem("labor")}
                  >
                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span>Main d'œuvre</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => handleAddItem("work")}
                  >
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <span>Ouvrage</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {filteredItems.length}
            {filteredItems.length !== getTotalItems() && (
              <span className="text-sm text-neutral-500 ml-1">
                / {getTotalItems()}
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {filteredItems.length !== getTotalItems() ? "Éléments filtrés" : "Éléments total"}
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {getTotalValue().toLocaleString("fr-FR")} MAD
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Valeur catalogue
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-amber-600">
            {getRecentlyUpdated()}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Mis à jour récemment
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="benaya-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Rechercher un élément..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
            {(searchQuery || activeTab !== "all" || sortField !== "name" || sortDirection !== "asc") && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResetFilters}
                className="text-neutral-500 hover:text-neutral-700"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="benaya-card">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <LibraryItemsList
              items={paginatedItems}
              onSearch={handleSearch}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onSort={handleSort}
              onPageChange={handlePageChange}
              totalItems={filteredItems.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              showFilters={showAdvancedFilters}
              onToggleFilters={(show) => setShowAdvancedFilters(show)}
              allMaterials={materials}
              allLabor={labor}
              allWorks={works}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
              isLoading={loading}
            />
          </div>
        </div>
      </div>



      {/* Dialogue de formulaire pour matériau/main d'œuvre */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Le DialogTitle est géré par LibraryItemForm */}
          <LibraryItemForm
            item={selectedItem as Material | Labor}
            type={currentItemType as "material" | "labor"}
            onSave={handleSaveItem}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue de formulaire pour ouvrage */}
      <Dialog open={showWorkForm} onOpenChange={setShowWorkForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>
              {selectedItem ? `Modifier ${selectedItem.name}` : "Créer un ouvrage"}
            </DialogTitle>
            <DialogDescription>
              Formulaire de création ou modification d'un ouvrage
            </DialogDescription>
          </DialogHeader>
          <WorkCompositionForm
            work={selectedItem as Work}
            availableMaterials={materials}
            availableLabor={labor}
            availableWorks={works.filter(w => !selectedItem || w.id !== selectedItem.id)} // Éviter les références circulaires
            onSave={handleSaveItem}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 