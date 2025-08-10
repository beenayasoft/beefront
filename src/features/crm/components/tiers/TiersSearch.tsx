import { Search, Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TiersSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  // Nouveaux props pour les filtres
  selectedTypes?: string[];
  onTypeFiltersChange?: (types: string[]) => void;
  onFilterClick?: () => void; // Gardé pour compatibilité
}

export function TiersSearch({ 
  searchQuery, 
  onSearchChange,
  selectedTypes = [],
  onTypeFiltersChange,
  onFilterClick
}: TiersSearchProps) {
  
  // Options de filtres par type de tiers (Particulier vs Entreprise)
  const typeOptions = [
    { id: 'particulier', label: 'Particuliers' },
    { id: 'entreprise', label: 'Entreprises' }
  ];

  // Gérer la sélection/désélection d'un type
  const handleTypeToggle = (typeId: string) => {
    if (!onTypeFiltersChange) return;
    
    const newSelectedTypes = selectedTypes.includes(typeId)
      ? selectedTypes.filter(id => id !== typeId)
      : [...selectedTypes, typeId];
    
    onTypeFiltersChange(newSelectedTypes);
  };

  // Réinitialiser tous les filtres
  const handleClearFilters = () => {
    if (onTypeFiltersChange) {
      onTypeFiltersChange([]);
    }
  };

  const hasActiveFilters = selectedTypes.length > 0;
  return (
    <div className="Beenaya-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Rechercher un tiers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 Beenaya-input"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-2 ${hasActiveFilters ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filtres
                {hasActiveFilters && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full ml-1"></div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Type de tiers</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {typeOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  checked={selectedTypes.includes(option.id)}
                  onCheckedChange={() => handleTypeToggle(option.id)}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
              
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    onSelect={handleClearFilters}
                    className="text-red-600"
                  >
                    Réinitialiser les filtres
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 