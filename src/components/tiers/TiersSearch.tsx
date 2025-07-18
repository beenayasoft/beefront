import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TiersSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
}

export function TiersSearch({ 
  searchQuery, 
  onSearchChange,
  onFilterClick
}: TiersSearchProps) {
  return (
    <div className="benaya-card">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Rechercher un tiers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 benaya-input"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onFilterClick}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        </div>
      </div>
    </div>
  );
} 