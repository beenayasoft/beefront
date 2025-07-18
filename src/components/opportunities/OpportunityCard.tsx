import { useState } from "react";
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  FileText, 
  Building,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Opportunity, OpportunityStatus } from "@/lib/types/opportunity";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onView?: (opportunity: Opportunity) => void;
  onEdit?: (opportunity: Opportunity) => void;
  onDelete?: (opportunity: Opportunity) => void;
  onStageChange?: (opportunity: Opportunity, newStage: OpportunityStatus) => void;
  onCreateQuote?: (opportunity: Opportunity) => void;
  onMarkAsWon?: (opportunity: Opportunity) => void;
  onMarkAsLost?: (opportunity: Opportunity) => void;
  isDragging?: boolean;
}

export function OpportunityCard({
  opportunity,
  onView,
  onEdit,
  onDelete,
  onStageChange,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
  isDragging = false,
}: OpportunityCardProps) {
  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Obtenir la couleur de probabilité
  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return "text-green-600 dark:text-green-400";
    if (probability >= 50) return "text-blue-600 dark:text-blue-400";
    if (probability >= 25) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  // Obtenir le badge de statut
  const getStageBadge = (stage: OpportunityStatus) => {
    switch (stage) {
      case 'new':
        return <Badge className="benaya-badge-primary">Nouvelle</Badge>;
      case 'needs_analysis':
        return <Badge className="benaya-badge-primary">Analyse des besoins</Badge>;
      case 'negotiation':
        return <Badge className="benaya-badge-warning">Négociation</Badge>;
      case 'won':
        return <Badge className="benaya-badge-success">Gagnée</Badge>;
      case 'lost':
        return <Badge className="benaya-badge-error">Perdue</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  return (
    <div 
      className={cn(
        "benaya-card p-3 cursor-grab active:cursor-grabbing transition-all duration-200",
        isDragging ? "opacity-50 rotate-3 scale-105 shadow-xl z-50" : "hover:shadow-lg",
        opportunity.stage === 'won' && "border-l-4 border-l-green-500",
        opportunity.stage === 'lost' && "border-l-4 border-l-red-500",
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-2">
            <h3 className="font-medium text-neutral-900 dark:text-white text-sm line-clamp-2">
              {opportunity.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{opportunity.tierName}</span>
            </div>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="benaya-glass">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(opportunity)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir détails
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(opportunity)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onCreateQuote && opportunity.stage !== 'won' && opportunity.stage !== 'lost' && (
                  <DropdownMenuItem onClick={() => onCreateQuote(opportunity)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Créer un devis
                  </DropdownMenuItem>
                )}
                
                {opportunity.stage !== 'won' && opportunity.stage !== 'lost' && (
                  <>
                    <DropdownMenuSeparator />
                    {onMarkAsWon && (
                      <DropdownMenuItem onClick={() => onMarkAsWon(opportunity)}>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                        Marquer comme gagnée
                      </DropdownMenuItem>
                    )}
                    {onMarkAsLost && (
                      <DropdownMenuItem onClick={() => onMarkAsLost(opportunity)}>
                        <XCircle className="mr-2 h-4 w-4 text-red-600" />
                        Marquer comme perdue
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete(opportunity)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
              <DollarSign className="w-3 h-3" />
              <span>Montant:</span>
            </div>
            <span className="font-semibold">{formatCurrency(opportunity.estimatedAmount)} MAD</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
              <Calendar className="w-3 h-3" />
              <span>Date:</span>
            </div>
            <span>{formatDate(opportunity.expectedCloseDate)}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
              <span>Probabilité:</span>
            </div>
            <span className={cn("font-semibold", getProbabilityColor(opportunity.probability))}>
              {opportunity.probability}%
            </span>
          </div>
        </div>

        {/* Progress bar for probability */}
        <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full",
              opportunity.probability >= 75 ? "bg-green-500" :
              opportunity.probability >= 50 ? "bg-blue-500" :
              opportunity.probability >= 25 ? "bg-amber-500" :
              "bg-red-500"
            )}
            style={{ width: `${opportunity.probability}%` }}
          ></div>
        </div>

        {/* Footer */}
        {opportunity.stage === 'won' && opportunity.projectId && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <Building className="w-3 h-3" />
              <span>Projet créé</span>
            </div>
          </div>
        )}
        
        {opportunity.stage === 'lost' && opportunity.lossReason && (
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
              <XCircle className="w-3 h-3" />
              <span>Raison: {opportunity.lossReason === 'price' ? 'Prix' : 
                opportunity.lossReason === 'competitor' ? 'Concurrent' :
                opportunity.lossReason === 'timing' ? 'Timing' :
                opportunity.lossReason === 'no_budget' ? 'Pas de budget' :
                opportunity.lossReason === 'no_need' ? 'Pas de besoin' :
                opportunity.lossReason === 'no_decision' ? 'Pas de décision' : 'Autre'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}