import { useState } from "react";
import { Check, AlertCircle, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quote } from "@/lib/types/quote";
import { formatCurrency } from "@/lib/utils";
import { createInvoiceFromQuote, CreateInvoiceFromQuoteRequest } from "@/lib/api/invoices";
import { toast } from "sonner";

interface CreateInvoiceFromQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  onSubmit?: (invoice: any) => void;
}

export function CreateInvoiceFromQuoteModal({
  open,
  onOpenChange,
  quote,
  onSubmit,
}: CreateInvoiceFromQuoteModalProps) {
  const [invoiceType, setInvoiceType] = useState<'advance' | 'total'>('total');
  const [advancePercentage, setAdvancePercentage] = useState<number>(30);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Calculer le montant de l'acompte
  const calculateAdvanceAmount = () => {
    return (quote.totalTTC * advancePercentage) / 100;
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (invoiceType === 'advance') {
      if (!advancePercentage) {
        newErrors.advancePercentage = "Le pourcentage est requis";
      } else if (advancePercentage <= 0 || advancePercentage >= 100) {
        newErrors.advancePercentage = "Le pourcentage doit être entre 1 et 99";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire avec intégration API
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const invoiceData: CreateInvoiceFromQuoteRequest = {
        type: invoiceType,
        advancePercentage: invoiceType === 'advance' ? advancePercentage : undefined,
        issueDate: new Date().toISOString().split('T')[0],
        paymentTerms: 30
      };

      const newInvoice = await createInvoiceFromQuote(quote.id, invoiceData);
      
      toast.success("Facture créée avec succès", {
        description: `Facture ${invoiceType === 'advance' ? 'd\'acompte' : 'totale'} créée depuis le devis ${quote.number}`
      });

      if (onSubmit) {
        onSubmit(newInvoice);
      }
      
      onOpenChange(false);
    } catch (err: any) {
      console.error('Erreur lors de la création de la facture:', err);
      toast.error("Erreur lors de la création", {
        description: err?.response?.data?.message || "Impossible de créer la facture"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-benaya-600" />
            ✨ Créer une facture
          </DialogTitle>
          <DialogDescription>
            À partir du devis {quote.number} - {quote.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations sur le devis */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Devis:</span>
              <span className="font-medium">{quote.number}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Client:</span>
              <span className="font-medium">{quote.clientName}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
              <span>Montant total:</span>
              <span className="text-benaya-900 dark:text-benaya-200">{formatCurrency(quote.totalTTC)} MAD</span>
            </div>
          </div>

          {/* Type de facture */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Type de facture</Label>
            <RadioGroup 
              value={invoiceType} 
              onValueChange={(value) => setInvoiceType(value as 'advance' | 'total')}
              className="space-y-4"
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="advance" id="advance" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="advance"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Facture d'acompte
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Facturer un pourcentage du montant total
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="total" id="total" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="total"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Facture totale
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Facturer le montant total du devis
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Pourcentage d'acompte (si facture d'acompte) */}
          {invoiceType === 'advance' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="advancePercentage" className={errors.advancePercentage ? "text-red-500" : ""}>
                  Pourcentage d'acompte (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="advancePercentage"
                  type="number"
                  min="1"
                  max="99"
                  value={advancePercentage}
                  onChange={(e) => setAdvancePercentage(parseInt(e.target.value))}
                  className={`benaya-input ${errors.advancePercentage ? "border-red-500" : ""}`}
                />
                {errors.advancePercentage && (
                  <div className="flex items-center text-xs text-red-500">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.advancePercentage}
                  </div>
                )}
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="flex justify-between font-semibold">
                  <span>Montant de l'acompte:</span>
                  <span className="text-benaya-900 dark:text-benaya-200">
                    {formatCurrency(calculateAdvanceAmount())} MAD
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Création...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Créer la facture
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}