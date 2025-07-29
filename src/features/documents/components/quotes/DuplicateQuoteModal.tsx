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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { Quote } from "../../types/quotes.types";
import { quotesApi } from "../../api/quotes";
import { toast } from "@/components/ui/use-toast";

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
  const [loading, setLoading] = useState(false);
  const [newQuoteNumber, setNewQuoteNumber] = useState(`${quote.number}-COPY`);

  const handleDuplicate = async () => {
    try {
      setLoading(true);
      
      const duplicatedQuote = await quotesApi.duplicateQuote(quote.id, {
        quote_number: newQuoteNumber
      });
      
      toast({
        title: "Succès",
        description: `Le devis a été dupliqué sous le numéro ${duplicatedQuote.number}`,
      });
      
      onSuccess(duplicatedQuote);
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le devis",
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
                Devis original : {quote.number}
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

          <div className="space-y-2">
            <Label htmlFor="newQuoteNumber">
              Nouveau numéro de devis
            </Label>
            <Input
              id="newQuoteNumber"
              value={newQuoteNumber}
              onChange={(e) => setNewQuoteNumber(e.target.value)}
              placeholder="Entrez le nouveau numéro"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Le nouveau devis sera créé avec le statut "Brouillon" et pourra être modifié.
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
            onClick={handleDuplicate}
            disabled={loading || !newQuoteNumber.trim()}
          >
            {loading ? "Duplication..." : "Dupliquer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}