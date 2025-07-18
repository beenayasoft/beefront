import { useState, useEffect } from "react";
import { 
  CreditCard, 
  Calendar, 
  Hash, 
  FileText, 
  AlertCircle, 
  Check, 
  X,
  DollarSign,
  Calculator,
  Building,
  Banknote,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { recordPayment, getPaymentImpact } from "@/lib/api/invoices";
import { Invoice, PaymentMethod } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecordPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: (updatedInvoice: Invoice) => void;
}

interface PaymentFormData {
  date: string;
  amount: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
}

interface PaymentImpact {
  newStatus: string;
  newRemainingAmount: number;
  isFullyPaid: boolean;
}

export function RecordPaymentModal({ 
  open, 
  onOpenChange, 
  invoice,
  onSuccess
}: RecordPaymentModalProps) {
  // État du formulaire
  const [formData, setFormData] = useState<PaymentFormData>({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: 'bank_transfer',
    reference: '',
    notes: ''
  });

  // États de l'interface
  const [loading, setLoading] = useState(false);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentImpact, setPaymentImpact] = useState<PaymentImpact | null>(null);

  // Méthodes de paiement disponibles
  const paymentMethods = [
    { 
      value: 'bank_transfer', 
      label: 'Virement bancaire', 
      icon: Building,
      description: 'Transfert via institution bancaire'
    },
    { 
      value: 'check', 
      label: 'Chèque', 
      icon: FileText,
      description: 'Paiement par chèque bancaire'
    },
    { 
      value: 'cash', 
      label: 'Espèces', 
      icon: Banknote,
      description: 'Paiement en liquide'
    },
    { 
      value: 'card', 
      label: 'Carte bancaire', 
      icon: CreditCard,
      description: 'Paiement par carte de crédit/débit'
    },
    { 
      value: 'other', 
      label: 'Autre', 
      icon: Smartphone,
      description: 'Autre méthode de paiement'
    }
  ];

  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: invoice.remainingAmount > 0 ? invoice.remainingAmount.toString() : '',
        method: 'bank_transfer',
        reference: '',
        notes: ''
      });
      setErrors({});
      setPaymentImpact(null);
    }
  }, [open, invoice]);

  // Calculer l'impact du paiement lors du changement de montant
  useEffect(() => {
    const amount = parseFloat(formData.amount);
    if (open && !isNaN(amount) && amount > 0) {
      calculatePaymentImpact(amount);
    } else {
      setPaymentImpact(null);
    }
  }, [formData.amount, open]);

  // Mettre à jour le formulaire
  const updateFormData = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Calculer l'impact du paiement
  const calculatePaymentImpact = async (amount: number) => {
    setLoadingImpact(true);
    try {
      const impact = await getPaymentImpact(invoice.id, amount);
      setPaymentImpact({
        newStatus: impact.newStatus,
        newRemainingAmount: impact.newRemainingAmount,
        isFullyPaid: impact.newRemainingAmount === 0
      });
    } catch (err) {
      console.error('Erreur lors du calcul de l\'impact:', err);
      setPaymentImpact(null);
    } finally {
      setLoadingImpact(false);
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation de la date
    if (!formData.date) {
      newErrors.date = 'La date est obligatoire';
    } else {
      const paymentDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (paymentDate > today) {
        newErrors.date = 'La date ne peut pas être dans le futur';
      }
    }

    // Validation du montant
    if (!formData.amount) {
      newErrors.amount = 'Le montant est obligatoire';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Le montant doit être supérieur à 0';
      } else if (amount > invoice.remainingAmount) {
        newErrors.amount = `Le montant ne peut pas dépasser ${formatCurrency(invoice.remainingAmount)} MAD`;
      }
    }

    // Validation de la méthode
    if (!formData.method) {
      newErrors.method = 'La méthode de paiement est obligatoire';
    }

    // Validation de la référence pour certaines méthodes
    if ((formData.method === 'check' || formData.method === 'bank_transfer') && !formData.reference.trim()) {
      newErrors.reference = 'La référence est obligatoire pour cette méthode de paiement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le paiement
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const paymentData = {
        date: formData.date,
        amount: parseFloat(formData.amount),
        method: formData.method,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      };

      const result = await recordPayment(invoice.id, paymentData);
      
      toast.success("Paiement enregistré", {
        description: `${formatCurrency(paymentData.amount)} MAD enregistré avec succès`
      });

      if (onSuccess) {
        onSuccess(result.invoice);
      }
      
      onOpenChange(false);
    } catch (err: any) {
      console.error('Erreur lors de l\'enregistrement du paiement:', err);
      toast.error("Erreur", {
        description: "Impossible d'enregistrer le paiement"
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le badge de statut avec couleur
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", className: "bg-gray-100 text-gray-700" },
      sent: { label: "Émise", className: "bg-blue-100 text-blue-700" },
      overdue: { label: "En retard", className: "bg-red-100 text-red-700" },
      partially_paid: { label: "Partiellement payée", className: "bg-orange-100 text-orange-700" },
      paid: { label: "Payée", className: "bg-green-100 text-green-700" },
      cancelled: { label: "Annulée", className: "bg-gray-100 text-gray-700" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, className: "bg-gray-100 text-gray-700" };
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Obtenir les infos de la méthode sélectionnée
  const selectedMethod = paymentMethods.find(method => method.value === formData.method);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-benaya-600" />
            Enregistrer un paiement
          </DialogTitle>
          <DialogDescription>
            Enregistrer un nouveau paiement pour la facture {invoice.number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé de la facture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Résumé de la facture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-600 text-sm">Client:</span>
                  <div className="font-medium">{invoice.clientName}</div>
                </div>
                <div>
                  <span className="text-neutral-600 text-sm">Statut:</span>
                  <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                </div>
                <div>
                  <span className="text-neutral-600 text-sm">Montant total:</span>
                  <div className="font-medium">{formatCurrency(invoice.totalTTC)} MAD</div>
                </div>
                <div>
                  <span className="text-neutral-600 text-sm">Reste à payer:</span>
                  <div className="font-bold text-benaya-600">
                    {formatCurrency(invoice.remainingAmount)} MAD
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calculator className="w-4 h-4" />
                Détails du paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date et montant */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-date" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Date du paiement *
                  </Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData('date', e.target.value)}
                    className={errors.date ? 'border-red-500' : ''}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-amount" className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Montant (MAD) *
                  </Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => updateFormData('amount', e.target.value)}
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>
              </div>

              {/* Méthode de paiement */}
              <div className="space-y-2">
                <Label>Méthode de paiement *</Label>
                <Select 
                  value={formData.method} 
                  onValueChange={(value: PaymentMethod) => updateFormData('method', value)}
                >
                  <SelectTrigger className={errors.method ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => {
                      const IconComponent = method.icon;
                      return (
                        <SelectItem key={method.value} value={method.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{method.label}</div>
                              <div className="text-xs text-neutral-500">{method.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-sm text-red-600">{errors.method}</p>
                )}
              </div>

              {/* Référence */}
              <div className="space-y-2">
                <Label htmlFor="payment-reference" className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Référence {(formData.method === 'check' || formData.method === 'bank_transfer') && '*'}
                </Label>
                <Input
                  id="payment-reference"
                  placeholder={
                    formData.method === 'check' ? 'Numéro de chèque' :
                    formData.method === 'bank_transfer' ? 'Référence du virement' :
                    'Référence du paiement (optionnel)'
                  }
                  value={formData.reference}
                  onChange={(e) => updateFormData('reference', e.target.value)}
                  className={errors.reference ? 'border-red-500' : ''}
                />
                {errors.reference && (
                  <p className="text-sm text-red-600">{errors.reference}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="payment-notes">Notes (optionnel)</Label>
                <Textarea
                  id="payment-notes"
                  placeholder="Remarques supplémentaires..."
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Impact du paiement */}
          {loadingImpact ? (
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-neutral-300 border-t-benaya-600 mx-auto" />
                  <div className="text-neutral-500 mt-2">Calcul de l'impact...</div>
                </div>
              </CardContent>
            </Card>
          ) : paymentImpact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  Impact du paiement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Nouveau statut:</span>
                    <div>{getStatusBadge(paymentImpact.newStatus)}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Nouveau reste à payer:</span>
                    <span className={cn(
                      "font-bold",
                      paymentImpact.isFullyPaid ? "text-green-600" : "text-orange-600"
                    )}>
                      {formatCurrency(paymentImpact.newRemainingAmount)} MAD
                    </span>
                  </div>

                  {paymentImpact.isFullyPaid && (
                    <Alert className="bg-green-50 border-green-200">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        Cette facture sera marquée comme entièrement payée.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {selectedMethod && (
                <Badge variant="outline" className="gap-1">
                  <selectedMethod.icon className="w-3 h-3" />
                  {selectedMethod.label}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.amount}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enregistrer le paiement
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}