import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight, Eye, Edit, Package, Hammer, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Work, Material, Labor } from "@/lib/types/workLibrary";

type LibraryItemType = "all" | "work" | "material" | "labor";

interface LibraryItemsListProps {
  items: (Work | Material | Labor)[];
  onSearch: (query: string) => void;
  activeTab: LibraryItemType;
  onTabChange: (tab: LibraryItemType) => void;
  onSort: (field: string, direction: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  isLoading?: boolean;
  showFilters?: boolean;
  onToggleFilters?: (show: boolean) => void;
  allMaterials: Material[];
  allLabor: Labor[];
  allWorks: Work[];
  onItemClick?: (item: Work | Material | Labor) => void;
  onItemEdit?: (item: Work | Material | Labor) => void;
}

// Interface simplifiée pour les filtres avancés (optionnels)
export interface LibraryFilters {
  type: LibraryItemType;
  minPrice?: number;
  maxPrice?: number;
  unit?: string;
  supplier?: string;
}

export function LibraryItemsList({
  items,
  onSearch,
  activeTab,
  onTabChange,
  onSort,
  onPageChange,
  totalItems,
  currentPage,
  itemsPerPage,
  isLoading = false,
  showFilters = false,
  onToggleFilters,
  allMaterials,
  allLabor,
  allWorks,
  onItemClick,
  onItemEdit,
}: LibraryItemsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Log des items reçus - VERSION SIMPLIFIÉE
  useEffect(() => {
    // Log supprimé - filtrage fonctionne correctement
  }, [items, totalItems, currentPage, activeTab]);

  // Pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleSort = (field: string) => {
    const newDirection = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    onSort(field, newDirection);
  };

  // Fonction pour créer une clé unique pour chaque élément
  const getUniqueKey = (item: Work | Material | Labor): string => {
    // Déterminer le type d'élément pour créer une clé unique
    if ("components" in item) {
      return `work-${item.id}`;
    } else if ("vatRate" in item) {
      return `material-${item.id}`;
    } else {
      return `labor-${item.id}`;
    }
  };

  // Fonction améliorée pour détecter le type d'élément
  const getItemType = (item: Work | Material | Labor): string => {
    // Détecter un ouvrage (a des composants)
    if ("components" in item) return "Ouvrage";
    
    // Détecter un matériau (a obligatoirement vatRate selon notre interface)
    if ("vatRate" in item) return "Matériau";
    
    // Par défaut, c'est de la main d'œuvre
    return "Main d'œuvre";
  };

  // Fonction améliorée pour les badges avec meilleure détection
  const getItemTypeBadge = (item: Work | Material | Labor) => {
    // Détecter un ouvrage (a des composants)
    if ("components" in item) {
      return (
        <Badge className="benaya-badge-success gap-1">
          <Hammer className="w-3 h-3" />
          Ouvrage
        </Badge>
      );
    }
    
    // Détecter un matériau (a obligatoirement vatRate selon notre interface)
    if ("vatRate" in item) {
      return (
        <Badge className="benaya-badge-primary gap-1">
          <Package className="w-3 h-3" />
          Matériau
        </Badge>
      );
    }
    
    // Par défaut, c'est de la main d'œuvre
    return (
      <Badge className="benaya-badge-warning gap-1">
        <Clock className="w-3 h-3" />
        Main d'œuvre
      </Badge>
    );
  };

  // Calculer les compteurs corrects basés sur les données complètes
  const getTabCount = (tab: LibraryItemType) => {
    switch (tab) {
      case "all":
        return allMaterials.length + allLabor.length + allWorks.length;
      case "material":
        return allMaterials.length;
      case "labor":
        return allLabor.length;
      case "work":
        return allWorks.length;
      default:
        return 0;
    }
  };

  const categories = [
    { id: "all", label: "Tous", count: getTabCount("all") },
    { id: "material", label: "Matériaux", count: getTabCount("material") },
    { id: "labor", label: "Main d'œuvre", count: getTabCount("labor") },
    { id: "work", label: "Ouvrages", count: getTabCount("work") },
  ];

  return (
    <div className="space-y-4">
      {/* Onglets - Style identique au module stock */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as LibraryItemType)}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="gap-2"
              >
                {category.label}
                {category.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Items list */}
      <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <Table key={`table-page-${currentPage}`} className="benaya-table">
          <TableHeader>
            <TableRow>
              <TableHead>TYPE</TableHead>
              <TableHead>RÉFÉRENCE</TableHead>
              <TableHead>DÉSIGNATION</TableHead>
              <TableHead>UNITÉ</TableHead>
              <TableHead>PRIX UNITAIRE</TableHead>
              <TableHead className="w-[100px]">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600"></div>
                  </div>
                  <div className="mt-2 text-sm text-neutral-500">Chargement...</div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                  Aucun élément trouvé
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                return (
                  <TableRow key={getUniqueKey(item)} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <TableCell>
                      {getItemTypeBadge(item)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {"reference" in item ? item.reference || "—" : "—"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          {item.description?.substring(0, 60)}
                          {item.description && item.description.length > 60 ? "..." : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="font-semibold">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "MAD",
                        minimumFractionDigits: 2,
                      }).format("recommendedPrice" in item ? item.recommendedPrice : item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onItemClick?.(item)}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => onItemEdit?.(item)}
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-neutral-500">
          Affichage de {startItem} à {endItem} sur {totalItems} éléments
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={i}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 