import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "./OpportunityCard";
import { OpportunitySortableItem } from "./OpportunitySortableItem";
import { Opportunity, OpportunityStatus } from "../../types/opportunity";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface OpportunityKanbanColumnProps {
  title: string;
  stage: OpportunityStatus;
  opportunities: Opportunity[];
  count: number;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity, newStage: OpportunityStatus) => void;
  onCreateQuote?: (opportunity: Opportunity) => void;
  onMarkAsWon?: (opportunity: Opportunity) => void;
  onMarkAsLost?: (opportunity: Opportunity) => void;
  onAddNew?: (stage: OpportunityStatus) => void;
  activeId?: string | null;
}

export function OpportunityKanbanColumn({
  title,
  stage,
  opportunities,
  count,
  onView,
  onEdit,
  onDelete,
  onStageChange,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
  onAddNew,
  activeId,
}: OpportunityKanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: stage,
  });

  // Pagination
  const itemsPerPage = 2;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(opportunities.length / itemsPerPage);
  
  // Get current opportunities
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOpportunities = opportunities.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Obtenir la couleur de l'en-tête en fonction du statut
  const getHeaderColor = (stage: OpportunityStatus) => {
    switch (stage) {
      case 'new':
        return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700";
      case 'needs_analysis':
        return "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700";
      case 'negotiation':
        return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700";
      case 'won':
        return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700";
      case 'lost':
        return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700";
      default:
        return "bg-neutral-100 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700";
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Column Header */}
      <div 
        className={cn(
          "p-3 rounded-xl border mb-3",
          getHeaderColor(stage)
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">{title}</h3>
            <Badge className="bg-white/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 text-xs">
              {count}
            </Badge>
          </div>
          {onAddNew && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onAddNew(stage)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Column Content */}
      <div 
        ref={setNodeRef}
        className="flex-1 space-y-3 min-h-[200px] overflow-y-auto max-h-[calc(100vh-300px)] p-1"
      >
        <SortableContext 
          items={currentOpportunities.map(o => o.id)} 
          strategy={verticalListSortingStrategy}
        >
          {currentOpportunities.map((opportunity) => (
            <OpportunitySortableItem
              key={opportunity.id}
              opportunity={opportunity}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStageChange={onStageChange}
              onCreateQuote={onCreateQuote}
              onMarkAsWon={onMarkAsWon}
              onMarkAsLost={onMarkAsLost}
            />
          ))}
        </SortableContext>

        {opportunities.length === 0 && (
          <div className="flex items-center justify-center h-20 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
            <p className="text-sm text-neutral-500">Aucune opportunité</p>
          </div>
        )}

        {/* Pagination controls */}
        {opportunities.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {currentPage} / {totalPages}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Add new opportunity button */}
        {onAddNew && (
          <Button 
            variant="outline" 
            className="w-full border-dashed mt-3 text-xs py-1 h-auto"
            onClick={() => onAddNew(stage)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Ajouter
          </Button>
        )}
      </div>
    </div>
  );
}