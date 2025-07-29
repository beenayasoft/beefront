import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Opportunity, OpportunityStatus } from "../../types/opportunities.types";
import { OpportunityCard } from "./OpportunityCard";

interface OpportunitySortableItemProps {
  opportunity: Opportunity;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity, newStage: OpportunityStatus) => void;
  onCreateQuote?: (opportunity: Opportunity) => void;
  onMarkAsWon?: (opportunity: Opportunity) => void;
  onMarkAsLost?: (opportunity: Opportunity) => void;
}

export function OpportunitySortableItem({
  opportunity,
  onView,
  onEdit,
  onDelete,
  onStageChange,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
}: OpportunitySortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-id={opportunity.id} // Ajouter un attribut data-id pour le débogage
    >
      <OpportunityCard
        opportunity={opportunity}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onStageChange={onStageChange}
        onCreateQuote={onCreateQuote}
        onMarkAsWon={onMarkAsWon}
        onMarkAsLost={onMarkAsLost}
        isDragging={isDragging}
      />
    </div>
  );
}