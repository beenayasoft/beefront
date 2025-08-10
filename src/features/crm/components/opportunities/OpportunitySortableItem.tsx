import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Opportunity, OpportunityStatus } from "../../types/opportunity";
import { OpportunityCard } from "./OpportunityCard";

interface OpportunitySortableItemProps {
  opportunity: Opportunity;
  onView?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity, newStage: OpportunityStatus) => void;
  onCreateQuote?: (opportunity: Opportunity) => void;
  onMarkAsWon?: (opportunity: Opportunity) => void;
  onMarkAsLost?: (opportunity: Opportunity) => void;
}

export function OpportunitySortableItem({
  opportunity,
  onView,
  onDelete,
  onStageChange,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
}: OpportunitySortableItemProps) {
  const [isDragDisabled, setIsDragDisabled] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: opportunity.id,
    disabled: isDragDisabled
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Fonctions pour gérer l'activation/désactivation du drag
  const handleDisableDrag = () => {
    setIsDragDisabled(true);
  };

  const handleEnableDrag = () => {
    setIsDragDisabled(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isDragDisabled ? {} : listeners)}
      data-id={opportunity.id}
      className={`relative transition-all duration-200 ${
        isDragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      }`}
    >
      <OpportunityCard
        opportunity={opportunity}
        onView={onView}
        onDelete={onDelete}
        onStageChange={onStageChange}
        onCreateQuote={onCreateQuote}
        onMarkAsWon={onMarkAsWon}
        onMarkAsLost={onMarkAsLost}
        isDragging={isDragging}
        onDisableDrag={handleDisableDrag}
        onEnableDrag={handleEnableDrag}
      />
    </div>
  );
}