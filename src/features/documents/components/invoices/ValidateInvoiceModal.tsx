import { useState } from "react";
import { Check, AlertCircle, Send, Calendar, FileText, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateInvoice } from "../../api/invoices";
import { Invoice } from "../../types/invoices.types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface ValidateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: (invoice: Invoice) => void;
}

export function ValidateInvoiceModal({ 
  open, 
  onOpenChange, 
  invoice, 
  onSuccess 
}: ValidateInvoiceModalProps) {
  const { formatCurrency } = useCurrency();
  
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log pour débugger les données de facture reçues
  console.log('🔍 ValidateInvoiceModal - Données facture reçues:', {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    clientName: invoice.clientName,
    projectName: invoice.projectName,
    totalHt: invoice.totalHt,
    totalVAT: invoice.totalVAT,
    totalTtc: invoice.totalTtc,
    itemsCount: invoice.items?.length,
    items: invoice.items
  });

  // Validation des données avant soumission
  const canValidate = () => {
    if (invoice.status !== 'draft') {
      return { valid: false, reason: "Seules les factures en brouillon peuvent être validées" };
    }
    
    if (!invoice.items || invoice.items.length === 0) {
      return { valid: false, reason: "La facture doit contenir au moins un élément" };
    }
    
    if (invoice.totalTtc <= 0) {
      return { valid: false, reason: "Le montant total doit être supérieur à zéro" };
    }
    
    if (!invoice.clientName) {
      return { valid: false, reason: "Un client doit être assigné à la facture" };
    }

    return { valid: true };
  };

  const validation = canValidate();

  // Gestion de la fermeture
  const handleClose = () => {
    if (!loading) {
      setFormData({
        issueDate: new Date().toISOString().split('T')[0]
      });
      setError(null);
      onOpenChange(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = {
        issue_date: formData.issueDate
      };

      const updatedInvoice = await validateInvoice(invoice.id, data);
      
      toast.success("Facture validée avec succès", {
        description: `La facture ${updatedInvoice.number} a été validée et émise.`
      });

      // Fermer d'abord la modale pour éviter les problèmes de focus
      handleClose();
      
      // Puis appeler le callback de succès après une courte attente
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(updatedInvoice);
        }
      }, 100);
    } catch (err: any) {
      console.error('Erreur lors de la validation de la facture:', err);
      setError(err?.response?.data?.message || "Erreur lors de la validation de la facture");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-Beenaya-600" />
            ✨ Valider et émettre la facture
          </DialogTitle>
          <DialogDescription>
            Confirmer l'émission de la facture {invoice.number || "Brouillon"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Récapitulatif de la facture */}
          <Card className="border-l-4 border-l-Beenaya-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <FileText className="w-5 h-5 text-Beenaya-600" />
                Récapitulatif de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Statut actuel</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="font-medium text-yellow-700">Brouillon</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Client</span>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-Beenaya-500" />
                      <span className="font-medium text-neutral-900">{invoice.clientName || "Non défini"}</span>
                    </div>
                  </div>
                  
                  {invoice.projectName && (
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Projet</span>
                      <span className="font-medium text-neutral-900">{invoice.projectName}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Éléments</span>
                    <span className="text-2xl font-bold text-neutral-900">{invoice.items?.length || 0}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Montant HT</span>
                    <span className="text-lg font-semibold text-neutral-700">{formatCurrency(invoice.totalHt || 0)}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Total TTC</span>
                    <span className="text-2xl font-bold text-Beenaya-600">{formatCurrency(invoice.totalTtc || 0)}</span>
                  </div>
                </div>
              </div>
              
              {/* Informations additionnelles si disponibles */}
              {(invoice.totalVAT && invoice.totalVAT > 0) && (
                <div className="pt-3 border-t border-neutral-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">TVA totale</span>
                    <span className="font-medium text-neutral-900">{formatCurrency(invoice.totalVAT)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Paramètres d'émission */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="w-5 h-5 text-blue-600" />
                Paramètres d'émission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue-date" className="text-sm font-medium">Date d'émission</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  disabled={loading}
                  className="w-full"
                />
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    La facture recevra automatiquement un numéro définitif au format <strong>FAC-YYYY-XXX</strong> et ne pourra plus être modifiée après validation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conséquences de la validation */}
          <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Conséquences de la validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Numéro définitif attribué</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Accessible aux clients</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Paiements activés</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <X className="w-4 h-4 text-red-500" />
                    <span>Modification bloquée</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <X className="w-4 h-4 text-red-500" />
                    <span>Suppression impossible</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Création d'avoirs possible</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Erreur de validation */}
          {!validation.valid && (
            <Alert variant="destructive" className="border-l-4 border-l-red-500">
              <AlertCircle className="w-5 h-5" />
              <AlertDescription className="text-sm">
                <strong>Impossible de valider :</strong> {validation.reason}
              </AlertDescription>
            </Alert>
          )}

          {/* Erreur API */}
          {error && (
            <Alert variant="destructive" className="border-l-4 border-l-red-500">
              <AlertCircle className="w-5 h-5" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Confirmation */}
          {validation.valid && (
            <Alert className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <Check className="w-5 h-5 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                ✅ La facture est prête à être validée et émise.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-6 border-t border-neutral-200 bg-neutral-50 mx-[-24px] px-6 pb-6 mt-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto border-neutral-300 hover:bg-neutral-50"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!validation.valid || loading}
              className="gap-2 w-full sm:w-auto bg-Beenaya-600 hover:bg-Beenaya-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Validation en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Valider et émettre
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 