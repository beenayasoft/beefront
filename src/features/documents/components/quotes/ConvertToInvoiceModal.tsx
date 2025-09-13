import { useState } from "react";
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
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
    totalTtc: number | string; // Accepter les deux types pour plus de flexibilité
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
  const { formatCurrency } = useCurrency();
  const [formData, setFormData] = useState({
    issueDate: new Date(),
    dueDate: undefined as Date | undefined,
    paymentTerms: "30",
    notes: "",
    copyItems: true,
  });

  // Fonction utilitaire pour s'assurer que totalTtc est un nombre
  const formatTotalTtc = (value: number | string | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculer la date d'échéance basée sur les conditions de paiement
  const calculateDueDate = (issueDate: Date, termsDays: string) => {
    const due = new Date(issueDate);
    due.setDate(issueDate.getDate() + parseInt(termsDays));
    return due;
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
  const handleIssueDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    setFormData(prev => ({
      ...prev,
      issueDate: date,
      dueDate: calculateDueDate(date, prev.paymentTerms),
    }));
  };

  // Gérer la soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dueDate) return;
    
    // Convertir les dates en format ISO string pour l'API
    onConvert({
      issueDate: formData.issueDate.toISOString().split('T')[0],
      dueDate: formData.dueDate.toISOString().split('T')[0],
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      copyItems: formData.copyItems,
    });
  };

  // Ne pas rendre la modale si les données du devis ne sont pas disponibles
  if (!quote || !quote.id) {
    return null;
  }

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
                <span className="font-semibold">{formatCurrency(quote.totalTtc || 0)}</span>
              </div>
            </div>
          </div>

          {/* Date d'émission */}
          <div className="space-y-2">
            <Label htmlFor="issueDate">Date d'émission</Label>
            <DatePicker
              value={formData.issueDate}
              onChange={handleIssueDateChange}
              placeholder="Sélectionner la date d'émission"
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
            <DatePicker
              value={formData.dueDate}
              onChange={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
              placeholder="Sélectionner la date d'échéance"
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
              className="Beenaya-button-primary"
            >
              {loading ? "Création..." : "Créer la facture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 