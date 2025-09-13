import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Quote } from "../../types/quotes.types";
import { quotesApi } from "../../api/quotes";
import { toast } from "@/hooks/use-toast";
import { useModalState, createSafeSubmitHandler } from "@/hooks/useModalState";

interface DuplicateQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onSuccess: (duplicatedQuote: Quote) => void;
}

export function DuplicateQuoteModal({ 
  open, 
  onOpenChange, 
  quote, 
  onSuccess 
}: DuplicateQuoteModalProps) {
  const modal = useModalState<Quote>();

  // Synchroniser seulement l'ouverture (pas la fermeture automatique)
  useEffect(() => {
    console.log('DuplicateQuoteModal useEffect:', { open, quote: quote?.id, modalIsOpen: modal.isOpen });
    if (open && quote && !modal.isOpen) {
      console.log('Opening modal with quote:', quote);
      modal.actions.open(quote);
    }
  }, [open, quote, modal.actions, modal.isOpen]);

  // Gérer la fermeture manuellement
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDuplicate = createSafeSubmitHandler<Quote>(
    modal,
    async (quoteTouplicate) => {
      // Utiliser directement le prop quote comme fallback
      const currentQuote = quoteTouplicate || modal.data || quote;
      console.log('handleDuplicate debug:', { quoteTouplicate, modalData: modal.data, propQuote: quote, currentQuote });
      if (!currentQuote?.id) {
        throw new Error('Aucun devis sélectionné pour la duplication');
      }
      
      // La numérotation est maintenant automatique côté backend
      const duplicatedQuote = await quotesApi.duplicateQuote(currentQuote.id);
      return duplicatedQuote;
    },
    (duplicatedQuote) => {
      toast({
        title: "Succès",
        description: `Le devis a été dupliqué sous le numéro ${duplicatedQuote.number}`,
      });
      onSuccess(duplicatedQuote);
      // Fermer seulement après succès
      onOpenChange(false);
    },
    (error) => {
      console.error("Erreur lors de la duplication:", error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le devis",
        variant: "destructive",
      });
      // Ne pas fermer en cas d'erreur
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!quote ? (
          <div className="p-4 text-center text-gray-500">
            Aucun devis sélectionné
          </div>
        ) : (
          <>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Copy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Dupliquer le devis</DialogTitle>
              <DialogDescription>
                Créer une copie de ce devis avec un nouveau numéro
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                Devis original : {quote?.number}
              </div>
              <div className="text-gray-600 mt-1">
                {quote?.clientName}
              </div>
              <div className="text-gray-600">
                {new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(quote?.totalTtc || 0)}
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Numérotation automatique :</strong> Le nouveau devis recevra automatiquement le prochain numéro disponible selon votre configuration de numérotation.
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Le nouveau devis sera créé avec le statut "Brouillon" et pourra être modifié.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={modal.isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={modal.isLoading}
          >
            {modal.isLoading ? "Duplication..." : "Dupliquer"}
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}