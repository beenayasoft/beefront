import { useState, useEffect } from "react";
import { 
  FileText, 
  AlertTriangle, 
  Check, 
  X,
  Calculator,
  Eye,
  Building2,
  Calendar,
  Info,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCreditNote, getCreditNotePreview } from "@/lib/api/invoices";
import { Invoice, InvoiceItem } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateCreditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: (creditNote: Invoice, originalInvoice: Invoice) => void;
}

interface CreditNoteFormData {
  reason: string;
  issueDate: string;
  isFullCreditNote: boolean;
  selectedItems: string[];
}

interface CreditNotePreview {
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  impact: string;
}

// Raisons prédéfinies pour les avoirs
const creditNoteReasons = [
  { value: 'return', label: 'Retour de marchandise', description: 'Produit retourné par le client' },
  { value: 'discount', label: 'Remise commerciale', description: 'Réduction accordée après facturation' },
  { value: 'error', label: 'Erreur de facturation', description: 'Correction d\'une erreur sur la facture' },
  { value: 'cancellation', label: 'Annulation partielle', description: 'Annulation d\'une partie de la commande' },
  { value: 'quality', label: 'Défaut de qualité', description: 'Produit ou service non conforme' },
  { value: 'other', label: 'Autre', description: 'Autre motif (à préciser)' }
];

export function CreateCreditNoteModal({ 
  open, 
  onOpenChange, 
  invoice,
  onSuccess
}: CreateCreditNoteModalProps) {
  // État du formulaire
  const [formData, setFormData] = useState<CreditNoteFormData>({
    reason: 'error',
    issueDate: new Date().toISOString().split('T')[0],
    isFullCreditNote: true,
    selectedItems: []
  });

  // États de l'interface
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creditPreview, setCreditPreview] = useState<CreditNotePreview | null>(null);
  const [activeTab, setActiveTab] = useState("config");

  // Réinitialiser le formulaire quand la modale s'ouvre
  useEffect(() => {
    if (open) {
      setFormData({
        reason: 'error',
        issueDate: new Date().toISOString().split('T')[0],
        isFullCreditNote: true,
        selectedItems: []
      });
      setErrors({});
      setCreditPreview(null);
      setActiveTab("config");
    }
  }, [open]);

  // Calculer l'aperçu de l'avoir lors des changements
  useEffect(() => {
    if (open && (formData.isFullCreditNote || formData.selectedItems.length > 0)) {
      generatePreview();
    } else {
      setCreditPreview(null);
    }
  }, [formData.isFullCreditNote, formData.selectedItems, open]);

  // Mettre à jour le formulaire
  const updateFormData = <K extends keyof CreditNoteFormData>(
    field: K, 
    value: CreditNoteFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Toggle de sélection d'un élément
  const toggleItemSelection = (itemId: string) => {
    const newSelectedItems = formData.selectedItems.includes(itemId)
      ? formData.selectedItems.filter(id => id !== itemId)
      : [...formData.selectedItems, itemId];
    
    updateFormData('selectedItems', newSelectedItems);
  };

  // Sélectionner/désélectionner tous les éléments
  const toggleAllItems = () => {
    const allItemIds = invoice.items?.map(item => item.id) || [];
    const newSelectedItems = formData.selectedItems.length === allItemIds.length 
      ? [] 
      : allItemIds;
    
    updateFormData('selectedItems', newSelectedItems);
  };

  // Générer l'aperçu de l'avoir
  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const previewData = {
        is_full: formData.isFullCreditNote,
        selected_items: formData.isFullCreditNote ? undefined : formData.selectedItems
      };

      const preview = await getCreditNotePreview(invoice.id, previewData);
      setCreditPreview(preview);
    } catch (err) {
      console.error('Erreur lors de la génération de l\'aperçu:', err);
      setCreditPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation de la raison
    if (!formData.reason) {
      newErrors.reason = 'La raison est obligatoire';
    }

    // Validation de la date
    if (!formData.issueDate) {
      newErrors.issueDate = 'La date d\'émission est obligatoire';
    } else {
      const issueDate = new Date(formData.issueDate);
      const invoiceDate = new Date(invoice.issueDate);
      
      if (issueDate < invoiceDate) {
        newErrors.issueDate = 'La date ne peut pas être antérieure à la facture';
      }
    }

    // Validation des éléments pour avoir partiel
    if (!formData.isFullCreditNote && formData.selectedItems.length === 0) {
      newErrors.selectedItems = 'Veuillez sélectionner au moins un élément pour un avoir partiel';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la fermeture
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  };

  // Créer l'avoir
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const creditNoteData = {
        reason: formData.reason,
        is_full_credit_note: formData.isFullCreditNote,
        selected_items: formData.isFullCreditNote ? undefined : formData.selectedItems
      };

      const result = await createCreditNote(invoice.id, creditNoteData);
      
      toast.success("Avoir créé", {
        description: `L'avoir a été créé avec succès`
      });

      // Fermer d'abord la modale pour éviter les problèmes de focus
      handleClose();
      
      // Puis appeler le callback de succès après une courte attente
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(result.creditNote, result.originalInvoice);
        }
      }, 100);
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'avoir:', err);
      setError(err?.response?.data?.message || "Erreur lors de la création de l'avoir");
      setLoading(false);
    }
  };

  // Obtenir le badge de statut
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

  // Obtenir la raison sélectionnée
  const selectedReason = creditNoteReasons.find(reason => reason.value === formData.reason);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-benaya-600" />
            Créer un avoir
          </DialogTitle>
          <DialogDescription>
            Créer un avoir à partir de la facture {invoice.number}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="gap-2">
              <Building2 className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Check className="w-4 h-4" />
              Éléments
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Aperçu
            </TabsTrigger>
          </TabsList>

          {/* Onglet Configuration */}
          <TabsContent value="config" className="space-y-6 mt-6">
            {/* Informations facture source */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Facture source
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-600 text-sm">Numéro:</span>
                    <div className="font-medium">{invoice.number}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600 text-sm">Client:</span>
                    <div className="font-medium">{invoice.clientName}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600 text-sm">Statut:</span>
                    <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                  </div>
                  <div>
                    <span className="text-neutral-600 text-sm">Montant TTC:</span>
                    <div className="font-medium">{formatCurrency(invoice.totalTTC)} MAD</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuration de l'avoir */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Minus className="w-4 h-4" />
                  Configuration de l'avoir
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Raison et date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Raison de l'avoir *</Label>
                    <Select 
                      value={formData.reason} 
                      onValueChange={(value) => updateFormData('reason', value)}
                    >
                      <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {creditNoteReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            <div>
                              <div className="font-medium">{reason.label}</div>
                              <div className="text-xs text-neutral-500">{reason.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.reason && (
                      <p className="text-sm text-red-600">{errors.reason}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issue-date" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Date d'émission *
                    </Label>
                    <Input
                      id="issue-date"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => updateFormData('issueDate', e.target.value)}
                      className={errors.issueDate ? 'border-red-500' : ''}
                    />
                    {errors.issueDate && (
                      <p className="text-sm text-red-600">{errors.issueDate}</p>
                    )}
                  </div>
                </div>

                {/* Type d'avoir */}
                <div className="space-y-3">
                  <Label>Type d'avoir</Label>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="full-credit"
                        checked={formData.isFullCreditNote}
                        onCheckedChange={(checked) => updateFormData('isFullCreditNote', !!checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="full-credit" className="text-sm font-medium cursor-pointer">
                          Avoir total
                        </Label>
                        <p className="text-xs text-neutral-600">
                          Créer un avoir pour la totalité de la facture
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="partial-credit"
                        checked={!formData.isFullCreditNote}
                        onCheckedChange={(checked) => updateFormData('isFullCreditNote', !checked)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor="partial-credit" className="text-sm font-medium cursor-pointer">
                          Avoir partiel
                        </Label>
                        <p className="text-xs text-neutral-600">
                          Sélectionner les éléments à inclure dans l'avoir
                        </p>
                      </div>
                    </div>
                  </div>
                  {errors.selectedItems && (
                    <p className="text-sm text-red-600">{errors.selectedItems}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Éléments */}
          <TabsContent value="items" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Éléments de la facture ({invoice.items?.length || 0})
                  </div>
                  {!formData.isFullCreditNote && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAllItems}
                    >
                      {formData.selectedItems.length === (invoice.items?.length || 0) ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  {formData.isFullCreditNote ? 
                    'Tous les éléments seront inclus dans l\'avoir' : 
                    'Sélectionnez les éléments à inclure dans l\'avoir'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.isFullCreditNote ? (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Avoir total sélectionné : tous les éléments de la facture seront inclus automatiquement.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {(invoice.items || []).map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-3 border rounded-lg transition-colors",
                          formData.selectedItems.includes(item.id)
                            ? "bg-benaya-50 border-benaya-200"
                            : "hover:bg-neutral-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={formData.selectedItems.includes(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{item.designation}</div>
                                {item.description && (
                                  <div className="text-sm text-neutral-600 mt-1">{item.description}</div>
                                )}
                                {item.reference && (
                                  <div className="text-xs text-neutral-400 mt-1">Réf: {item.reference}</div>
                                )}
                              </div>
                              <div className="text-right space-y-1">
                                <div className="font-medium">{formatCurrency(item.totalTTC)} MAD</div>
                                <div className="text-sm text-neutral-600">
                                  {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)} MAD
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  TVA {item.vatRate}%
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Aperçu */}
          <TabsContent value="preview" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Calculator className="w-4 h-4" />
                  Aperçu de l'avoir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPreview ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-neutral-300 border-t-benaya-600 mx-auto" />
                    <div className="text-neutral-500 mt-2">Calcul en cours...</div>
                  </div>
                ) : creditPreview ? (
                  <div className="space-y-4">
                    {/* Résumé financier */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-neutral-50 rounded-lg">
                        <div className="text-lg font-bold text-neutral-900">
                          {formatCurrency(creditPreview.totalHT)} MAD
                        </div>
                        <div className="text-sm text-neutral-600">Total HT</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-50 rounded-lg">
                        <div className="text-lg font-bold text-neutral-900">
                          {formatCurrency(creditPreview.totalVAT)} MAD
                        </div>
                        <div className="text-sm text-neutral-600">TVA</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-lg font-bold text-red-600">
                          -{formatCurrency(creditPreview.totalTTC)} MAD
                        </div>
                        <div className="text-sm text-red-700">Total TTC</div>
                      </div>
                    </div>

                    {/* Impact */}
                    <Alert className="bg-orange-50 border-orange-200">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-700">
                        <strong>Impact :</strong> {creditPreview.impact}
                      </AlertDescription>
                    </Alert>

                    {/* Détails de configuration */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-neutral-600 text-sm">Type d'avoir:</span>
                        <div className="font-medium">
                          {formData.isFullCreditNote ? 'Avoir total' : 'Avoir partiel'}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-600 text-sm">Raison:</span>
                        <div className="font-medium">{selectedReason?.label}</div>
                      </div>
                      <div>
                        <span className="text-neutral-600 text-sm">Date d'émission:</span>
                        <div className="font-medium">
                          {new Date(formData.issueDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      {!formData.isFullCreditNote && (
                        <div>
                          <span className="text-neutral-600 text-sm">Éléments sélectionnés:</span>
                          <div className="font-medium">{formData.selectedItems.length} / {invoice.items?.length || 0}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    {formData.isFullCreditNote || formData.selectedItems.length > 0 ? 
                      'Aucun aperçu disponible' : 
                      'Sélectionnez les éléments pour voir l\'aperçu'
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {selectedReason && (
                <Badge variant="outline" className="gap-1">
                  <FileText className="w-3 h-3" />
                  {selectedReason.label}
                </Badge>
              )}
              {creditPreview && (
                <Badge variant="secondary" className="text-red-600">
                  -{formatCurrency(creditPreview.totalTTC)} MAD
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
                disabled={loading || (!formData.isFullCreditNote && formData.selectedItems.length === 0)}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Créer l'avoir
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