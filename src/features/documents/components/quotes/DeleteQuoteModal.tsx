import { useState } from "react";
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
import { toast } from "@/components/ui/use-toast";

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
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await quotesApi.deleteQuote(quote.id);
      
      toast({
        title: "Succès",
        description: `Le devis ${quote.number} a été supprimé`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le devis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Supprimer le devis</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce devis ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                Devis {quote.number}
              </div>
              <div className="text-gray-600 mt-1">
                {quote.clientName}
              </div>
              <div className="text-gray-600">
                {new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(quote.totalTtc || 0)}
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
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}