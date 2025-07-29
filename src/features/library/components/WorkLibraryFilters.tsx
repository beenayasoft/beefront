import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

interface WorkLibraryFiltersProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  activeTab: string;
  sortField: string;
  sortDirection: string;
  onResetFilters: () => void;
}

export function WorkLibraryFilters({
  searchQuery,
  onSearchChange,
  onSearch,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  activeTab,
  sortField,
  sortDirection,
  onResetFilters,
}: WorkLibraryFiltersProps) {
  const hasActiveFilters = searchQuery || activeTab !== "all" || sortField !== "name" || sortDirection !== "asc";

  return (
    <div className="benaya-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Rechercher un élément..."
              value={searchQuery}
              onChange={onSearchChange}
              onKeyDown={(e) => e.key === "Enter" && onSearch(searchQuery)}
              className="pl-10 benaya-input"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onToggleAdvancedFilters}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="text-neutral-500 hover:text-neutral-700"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}