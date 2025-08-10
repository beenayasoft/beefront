import { AlertTriangle, CheckCircle, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Opportunity, OpportunityStatus } from "../../types/opportunities.types";
import { cn } from "@/lib/utils";

interface OpportunityTransitionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity;
  targetStage: OpportunityStatus;
  errorCode?: string;
  suggestion?: string;
  onConfirmTransition: () => void;
  onDirectAction: () => void; // Action directe (ex: marquer comme gagné après négociation)
  isLoading?: boolean;
}

export function OpportunityTransitionDialog({
  isOpen,
  onClose,
  opportunity,
  targetStage,
  errorCode,
  suggestion,
  onConfirmTransition,
  onDirectAction,
  isLoading = false,
}: OpportunityTransitionDialogProps) {
  
  // Obtenir les informations sur les étapes
  const getStageInfo = (stage: OpportunityStatus) => {
    switch (stage) {
      case 'new':
        return { label: 'Nouvelle', color: 'bg-blue-500', icon: '🆕' };
      case 'needs_analysis':
        return { label: 'Analyse des besoins', color: 'bg-purple-500', icon: '🔍' };
      case 'negotiation':
        return { label: 'Négociation', color: 'bg-amber-500', icon: '💬' };
      case 'won':
        return { label: 'Gagnée', color: 'bg-green-500', icon: '🎉' };
      case 'lost':
        return { label: 'Perdue', color: 'bg-red-500', icon: '❌' };
      default:
        return { label: 'Inconnue', color: 'bg-neutral-500', icon: '❓' };
    }
  };

  const currentStageInfo = getStageInfo(opportunity.stage);
  const targetStageInfo = getStageInfo(targetStage);

  // Messages personnalisés selon l'erreur
  const getTransitionMessage = () => {
    switch (errorCode) {
      case 'QUOTE_REQUIRED_FOR_NEGOTIATION':
        return {
          title: "📄 Devis requis",
          description: "Pour passer une opportunité en négociation, un devis doit d'abord être créé et envoyé au client. C'est une étape importante du processus commercial.",
          actionLabel: "Créer un devis d'abord",
          directActionLabel: "Forcer en négociation",
          showDirectAction: false, // On cache cette option pour cette erreur
        };
      case 'NEGOTIATION_REQUIRED_FOR_WON':
        return {
          title: "🎯 Presque gagné !",
          description: "Pour marquer cette opportunité comme gagnée, elle doit d'abord passer par l'étape de négociation. C'est une bonne pratique pour s'assurer que tous les détails sont finalisés.",
          actionLabel: "Passer en négociation puis gagner",
          directActionLabel: "Gagner directement",
          showDirectAction: true,
        };
      default:
        return {
          title: "🔄 Transition d'étape",
          description: "Cette opportunité nécessite de passer par une étape intermédiaire.",
          actionLabel: "Continuer la transition",
          directActionLabel: "Action directe",
          showDirectAction: true,
        };
    }
  };

  const transitionInfo = getTransitionMessage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-3">
            <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl">{transitionInfo.title}</DialogTitle>
          <DialogDescription className="text-base leading-relaxed mt-2">
            {transitionInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Opportunité actuelle */}
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
            <h4 className="font-medium text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Opportunité concernée :
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {opportunity.name}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {opportunity.tierName}
                </p>
              </div>
              <Badge className={cn("text-white", currentStageInfo.color)}>
                {currentStageInfo.icon} {currentStageInfo.label}
              </Badge>
            </div>
          </div>

          {/* Transition proposée */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-sm text-green-700 dark:text-green-300 mb-3">
              💡 {errorCode === 'QUOTE_REQUIRED_FOR_NEGOTIATION' ? 'Action recommandée :' : 'Transition recommandée :'}
            </h4>
            {errorCode === 'QUOTE_REQUIRED_FOR_NEGOTIATION' ? (
              // Pour le cas où un devis est requis
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={cn("text-white", currentStageInfo.color)}>
                  {currentStageInfo.icon} {currentStageInfo.label}
                </Badge>
                <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                <Badge className="bg-blue-500 text-white">
                  📄 Créer un devis
                </Badge>
                <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                <Badge className={cn("text-white", targetStageInfo.color)}>
                  {targetStageInfo.icon} {targetStageInfo.label}
                </Badge>
              </div>
            ) : (
              // Pour les autres cas
              <div className="flex items-center gap-3">
                <Badge className={cn("text-white", currentStageInfo.color)}>
                  {currentStageInfo.icon} {currentStageInfo.label}
                </Badge>
                <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                <Badge className="bg-amber-500 text-white">
                  💬 Négociation
                </Badge>
                <ArrowRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                <Badge className={cn("text-white", targetStageInfo.color)}>
                  {targetStageInfo.icon} {targetStageInfo.label}
                </Badge>
              </div>
            )}
          </div>

          {/* Suggestion du backend */}
          {suggestion && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-400">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Conseil :</strong> {suggestion}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          
          <Button 
            onClick={onConfirmTransition}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            <CheckCircle className="w-4 h-4 mr-2" />
            {transitionInfo.actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}