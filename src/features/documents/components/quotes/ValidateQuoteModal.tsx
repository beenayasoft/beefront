import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface ValidateQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: {
    id: string;
    number: string;
    clientName: string;
    totalTtc: number | string;
    status: string;
  };
  onValidate: (data: { notes?: string }) => void;
  loading?: boolean;
}

export function ValidateQuoteModal({
  open,
  onOpenChange,
  quote,
  onValidate,
  loading = false,
}: ValidateQuoteModalProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onValidate({ notes: notes.trim() || undefined });
  };

  // Fonction utilitaire pour s'assurer que totalTtc est un nombre
  const formatTotalTtc = (value: number | string | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Ne pas rendre la modale si les données du devis ne sont pas disponibles
  if (!quote || !quote.id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Valider le devis
          </DialogTitle>
          <DialogDescription>
            Confirmer la validation du devis {quote.number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations du devis */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                <span className="font-medium">{quote.clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Montant TTC:</span>
                <span className="font-semibold">{formatTotalTtc(quote.totalTtc).toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Statut actuel:</span>
                <span className="font-medium capitalize">{quote.status}</span>
              </div>
            </div>
          </div>

          {/* Information sur la validation */}
          <Alert>
            <AlertDescription>
              Une fois validé, le devis ne pourra plus être modifié et sera marqué comme "sent" (envoyé).
              Un numéro définitif sera automatiquement attribué.
            </AlertDescription>
          </Alert>

          {/* Notes optionnelles */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes de validation (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez des notes sur cette validation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="Beenaya-button-primary"
            >
              {loading ? "Validation..." : "Valider le devis"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}