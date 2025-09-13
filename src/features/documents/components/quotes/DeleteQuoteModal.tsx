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
import { AlertTriangle } from "lucide-react";
import { Quote } from "../../types/quotes.types";
import { quotesApi } from "../../api/quotes";
import { toast } from "@/hooks/use-toast";
import { useModalState, createSafeSubmitHandler } from "@/hooks/useModalState";

interface DeleteQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onSuccess: () => void;
}

export function DeleteQuoteModal({ 
  open, 
  onOpenChange, 
  quote, 
  onSuccess 
}: DeleteQuoteModalProps) {
  const modal = useModalState<Quote>();

  // Synchroniser seulement l'ouverture (pas la fermeture automatique)
  useEffect(() => {
    if (open && quote && !modal.isOpen) {
      modal.actions.open(quote);
    }
  }, [open, quote, modal.actions, modal.isOpen]);

  // Gérer la fermeture manuellement
  const handleClose = () => {
    modal.actions.close();
    onOpenChange(false);
  };

  const handleDelete = createSafeSubmitHandler<Quote>(
    modal,
    async (quoteToDelete) => {
      if (!quoteToDelete?.id) {
        throw new Error('Aucun devis sélectionné pour la suppression');
      }
      await quotesApi.deleteQuote(quoteToDelete.id);
    },
    () => {
      toast({
        title: "Succès",
        description: "Devis supprimé avec succès",
        variant: "default",
      });
      onSuccess();
      // Fermer seulement après succès
      onOpenChange(false);
    },
    (error) => {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis",
        variant: "destructive",
      });
      // Ne pas fermer en cas d'erreur
    }
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !newOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Supprimer le devis</DialogTitle>
              <DialogDescription>
                {!modal.data 
                  ? "Aucun devis sélectionné"
                  : "Êtes-vous sûr de vouloir supprimer ce devis ?"
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!modal.data ? (
          <div className="p-4 text-center text-gray-500">
            Veuillez sélectionner un devis à supprimer.
          </div>
        ) : (
          <>
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    Devis {modal.data?.number}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {modal.data?.clientName}
                  </div>
                  <div className="text-gray-600">
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'EUR' 
                    }).format(modal.data?.totalTtc || 0)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Attention :</strong> Cette action est irréversible. 
                  Le devis sera définitivement supprimé.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={modal.isSubmitting}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(modal.data)}
                disabled={modal.isSubmitting}
              >
                {modal.isSubmitting ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}