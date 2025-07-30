import { useState, useMemo } from 'react';
import { Work, Material, Labor } from '../types/workLibrary';

const ITEMS_PER_PAGE = 10;

export interface UseLibraryFiltersReturn {
  // État des filtres
  currentPage: number;
  searchQuery: string;
  activeTab: "all" | "material" | "labor" | "work";
  sortField: string;
  sortDirection: "asc" | "desc";
  showAdvancedFilters: boolean;
  
  // Données filtrées et paginées
  filteredItems: (Work | Material | Labor)[];
  paginatedItems: (Work | Material | Labor)[];
  
  // Actions
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<"all" | "material" | "labor" | "work">>;
  setSortField: React.Dispatch<React.SetStateAction<string>>;
  setSortDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  setShowAdvancedFilters: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Gestionnaires d'événements
  handleSearch: (query: string) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetFilters: () => void;
  handleTabChange: (tab: "all" | "material" | "labor" | "work") => void;
  handleSort: (field: string, direction: "asc" | "desc") => void;
  handlePageChange: (page: number) => void;
}

export function useLibraryFilters(
  materials: Material[],
  labor: Labor[],
  works: Work[]
): UseLibraryFiltersReturn {
  // État pour la pagination et le filtrage
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "material" | "labor" | "work">("all");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Base items optimisée avec dépendances allégées
  const baseItems = useMemo(() => {
    switch (activeTab) {
      case "material": return materials;
      case "labor": return labor;
      case "work": return works;
      default: return [...materials, ...labor, ...works];
    }
  }, [materials, labor, works, activeTab]);

  // Filtrage optimisé séparément
  const searchFiltered = useMemo(() => {
    if (!searchQuery?.trim()) return baseItems;
    
    const query = searchQuery.toLowerCase().trim();
    return baseItems.filter(item => {
      const name = item.name?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      const reference = ("reference" in item && item.reference?.toLowerCase()) || "";
      
      return name.includes(query) || description.includes(query) || reference.includes(query);
    });
  }, [baseItems, searchQuery]);

  // Tri optimisé séparément 
  const filteredItems = useMemo(() => {
    // Cas optimisé pour le tri le plus fréquent
    if (sortField === "name" && sortDirection === "asc") {
      return [...searchFiltered].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    
    return [...searchFiltered].sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortField) {
        case "unitPrice":
          valueA = "recommendedPrice" in a ? a.recommendedPrice : a.unitPrice;
          valueB = "recommendedPrice" in b ? b.recommendedPrice : b.unitPrice;
          break;
        case "reference":
          valueA = 'reference' in a ? (a.reference || "") : "";
          valueB = 'reference' in b ? (b.reference || "") : "";
          break;
        case "unit":
          valueA = a.unit || "";
          valueB = b.unit || "";
          break;
        default:
          valueA = (a as any)[sortField] || "";
          valueB = (b as any)[sortField] || "";
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      const comparison = String(valueA).localeCompare(String(valueB));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [searchFiltered, sortField, sortDirection]);

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

  return {
    // État des filtres
    currentPage,
    searchQuery,
    activeTab,
    sortField,
    sortDirection,
    showAdvancedFilters,
    
    // Données filtrées et paginées
    filteredItems,
    paginatedItems,
    
    // Actions
    setCurrentPage,
    setSearchQuery,
    setActiveTab,
    setSortField,
    setSortDirection,
    setShowAdvancedFilters,
    
    // Gestionnaires d'événements
    handleSearch,
    handleSearchChange,
    handleResetFilters,
    handleTabChange,
    handleSort,
    handlePageChange,
  };
}