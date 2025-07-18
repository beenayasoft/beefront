import { useState } from "react";
import { Check, AlertCircle, Send, Calendar, FileText, User } from "lucide-react";
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
import { validateInvoice } from "@/lib/api/invoices";
import { Invoice } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
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
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation des données avant soumission
  const canValidate = () => {
    if (invoice.status !== 'draft') {
      return { valid: false, reason: "Seules les factures en brouillon peuvent être validées" };
    }
    
    if (!invoice.items || invoice.items.length === 0) {
      return { valid: false, reason: "La facture doit contenir au moins un élément" };
    }
    
    if (invoice.totalTTC <= 0) {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-benaya-600" />
            ✨ Valider et émettre la facture
          </DialogTitle>
          <DialogDescription>
            Confirmer l'émission de la facture {invoice.number || "Brouillon"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Récapitulatif de la facture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Récapitulatif de la facture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Statut actuel:</span>
                    <span className="font-medium">Brouillon</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Client:</span>
                    <span className="font-medium">{invoice.clientName}</span>
                  </div>
                  {invoice.projectName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Projet:</span>
                      <span className="font-medium">{invoice.projectName}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Nombre d'éléments:</span>
                    <span className="font-medium">{invoice.items?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Montant HT:</span>
                    <span className="font-medium">{formatCurrency(invoice.totalHT)} MAD</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total TTC:</span>
                    <span className="text-benaya-600">{formatCurrency(invoice.totalTTC)} MAD</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paramètres d'émission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Calendar className="w-4 h-4 text-benaya-600" />
              <h3 className="font-medium">Paramètres d'émission</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issue-date">Date d'émission</Label>
              <Input
                id="issue-date"
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-neutral-500">
                La facture recevra automatiquement un numéro définitif (FAC-YYYY-XXX)
              </p>
            </div>
          </div>

          {/* Conséquences de la validation */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-yellow-800">
                Après validation, cette facture :
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700 space-y-1">
              <p>• Recevra un numéro définitif (non modifiable)</p>
              <p>• Ne pourra plus être modifiée ou supprimée</p>
              <p>• Sera accessible depuis l'interface client</p>
              <p>• Pourra recevoir des paiements</p>
              <p>• Pourra générer des avoirs si nécessaire</p>
            </CardContent>
          </Card>

          {/* Erreur de validation */}
          {!validation.valid && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>Impossible de valider :</strong> {validation.reason}
              </AlertDescription>
            </Alert>
          )}

          {/* Erreur API */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Confirmation */}
          {validation.valid && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                La facture est prête à être validée et émise.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!validation.valid || loading}
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Validation...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Valider et émettre
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 