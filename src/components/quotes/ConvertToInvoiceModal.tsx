import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConvertToInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: {
    id: string;
    number: string;
    clientName: string;
    totalTTC: number | string; // Accepter les deux types pour plus de flexibilité
  };
  onConvert: (invoiceData: {
    issueDate: string;
    dueDate: string;
    paymentTerms: string;
    notes?: string;
    copyItems: boolean;
  }) => void;
  loading?: boolean;
}

export function ConvertToInvoiceModal({
  open,
  onOpenChange,
  quote,
  onConvert,
  loading = false,
}: ConvertToInvoiceModalProps) {
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: "",
    paymentTerms: "30",
    notes: "",
    copyItems: true,
  });

  // Fonction utilitaire pour s'assurer que totalTTC est un nombre
  const formatTotalTTC = (value: number | string): number => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculer la date d'échéance basée sur les conditions de paiement
  const calculateDueDate = (issueDate: string, termsDays: string) => {
    const issue = new Date(issueDate);
    const due = new Date(issue);
    due.setDate(issue.getDate() + parseInt(termsDays));
    return due.toISOString().split('T')[0];
  };

  // Mettre à jour la date d'échéance quand les conditions changent
  const handlePaymentTermsChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: value,
      dueDate: calculateDueDate(prev.issueDate, value),
    }));
  };

  // Mettre à jour la date d'échéance quand la date d'émission change
  const handleIssueDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      issueDate: value,
      dueDate: calculateDueDate(value, prev.paymentTerms),
    }));
  };

  // Gérer la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConvert(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convertir en facture</DialogTitle>
          <DialogDescription>
            Créer une nouvelle facture à partir du devis {quote.number}
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
                <span className="font-semibold">{formatTotalTTC(quote.totalTTC).toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Date d'émission */}
          <div className="space-y-2">
            <Label htmlFor="issueDate">Date d'émission</Label>
            <Input
              id="issueDate"
              name="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleIssueDateChange(e.target.value)}
              required
            />
          </div>

          {/* Conditions de paiement */}
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Conditions de paiement</Label>
            <Select value={formData.paymentTerms} onValueChange={handlePaymentTermsChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner les conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Comptant</SelectItem>
                <SelectItem value="8">8 jours</SelectItem>
                <SelectItem value="15">15 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="45">45 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date d'échéance (calculée automatiquement) */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Notes pour la facture..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              className="benaya-button-primary"
            >
              {loading ? "Création..." : "Créer la facture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 