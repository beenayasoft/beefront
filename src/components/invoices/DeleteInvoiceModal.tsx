import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, AlertCircle, Shield, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { deleteInvoice, getInvoiceDeletionConstraints } from "@/lib/api/invoices";
import { Invoice } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface DeleteInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onSuccess?: () => void;
}

interface DeletionConstraint {
  type: 'status' | 'payments' | 'credit_notes';
  message: string;
  blocking: boolean;
}

export function DeleteInvoiceModal({ 
  open, 
  onOpenChange, 
  invoice, 
  onSuccess 
}: DeleteInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<DeletionConstraint[]>([]);
  const [canDelete, setCanDelete] = useState(false);
  const [constraintsLoading, setConstraintsLoading] = useState(false);

  // Charger les contraintes de suppression au montage
  useEffect(() => {
    if (open && invoice) {
      loadDeletionConstraints();
    }
  }, [open, invoice]);

  const loadDeletionConstraints = async () => {
    setConstraintsLoading(true);
    try {
      const result = await getInvoiceDeletionConstraints(invoice.id);
      setConstraints(result.constraints || []);
      setCanDelete(result.canDelete || false);
    } catch (err: any) {
      console.error('Erreur lors de la vérification des contraintes:', err);
      setError("Impossible de vérifier les contraintes de suppression");
      // En cas d'erreur, on définit des valeurs par défaut pour éviter le gel de l'interface
      setConstraints([{
        type: 'status',
        message: 'Erreur lors de la vérification des contraintes. Veuillez réessayer.',
        blocking: true
      }]);
      setCanDelete(false);
    } finally {
      setConstraintsLoading(false);
    }
  };

  // Obtenir l'icône et la couleur selon le type de contrainte
  const getConstraintStyle = (constraint: DeletionConstraint) => {
    if (constraint.blocking) {
      return {
        icon: AlertTriangle,
        className: "text-red-600 bg-red-50 border-red-200",
        badgeVariant: "destructive" as const
      };
    } else {
      return {
        icon: AlertCircle,
        className: "text-yellow-600 bg-yellow-50 border-yellow-200",
        badgeVariant: "secondary" as const
      };
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      sent: { label: "Émise", variant: "default" as const },
      overdue: { label: "En retard", variant: "destructive" as const },
      partially_paid: { label: "Partiellement payée", variant: "secondary" as const },
      paid: { label: "Payée", variant: "secondary" as const },
      cancelled: { label: "Annulée", variant: "secondary" as const },
      cancelled_by_credit_note: { label: "Annulée par avoir", variant: "secondary" as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: "secondary" as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Soumission de la suppression
  const handleSubmit = async () => {
    if (!canDelete) {
      setError("La suppression est bloquée par des contraintes");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteInvoice(invoice.id);
      
      toast.success("Facture supprimée avec succès", {
        description: `La facture ${invoice.number} a été définitivement supprimée.`
      });

      // Fermer d'abord la modale pour éviter les problèmes de focus
      onOpenChange(false);
      
      // Puis appeler le callback de succès après une courte attente
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 100);
    } catch (err: any) {
      console.error('Erreur lors de la suppression de la facture:', err);
      setError(err?.response?.data?.message || "Erreur lors de la suppression de la facture");
      setLoading(false);
    }
  };

  // Gérer la fermeture manuelle de la modale
  const handleCloseModal = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            ⚠️ Supprimer la facture
          </DialogTitle>
          <DialogDescription>
            Confirmer la suppression de la facture {invoice.number || "Brouillon"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de la facture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Facture à supprimer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Numéro:</span>
                    <span className="font-medium">{invoice.number || "Brouillon"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Statut:</span>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Client:</span>
                    <span className="font-medium">{invoice.clientName}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date d'émission:</span>
                    <span className="font-medium">
                      {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Montant TTC:</span>
                    <span className="font-medium">{formatCurrency(invoice.totalTTC)} MAD</span>
                  </div>
                  {invoice.projectName && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Projet:</span>
                      <span className="font-medium">{invoice.projectName}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vérification des contraintes */}
          {constraintsLoading ? (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-center gap-2 text-neutral-500">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-neutral-300 border-t-benaya-600" />
                  Vérification des contraintes...
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Contraintes de suppression */}
              {constraints.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-benaya-600" />
                    Contraintes de suppression
                  </h3>
                  
                  {constraints.map((constraint, index) => {
                    const style = getConstraintStyle(constraint);
                    const IconComponent = style.icon;
                    
                    return (
                      <Alert key={index} className={style.className}>
                        <IconComponent className="w-4 h-4" />
                        <AlertDescription className="flex items-start justify-between">
                          <span>{constraint.message}</span>
                          <Badge variant={style.badgeVariant} className="ml-2">
                            {constraint.blocking ? "Bloquant" : "Avertissement"}
                          </Badge>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              )}

              {/* Avertissement général */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    ⚠️ Action irréversible
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-700 space-y-1">
                  <p>Cette action est <strong>définitive et irréversible</strong>.</p>
                  <p>Une fois supprimée, la facture ne pourra pas être récupérée.</p>
                  {invoice.status === 'draft' && (
                    <p>• Les éléments et données associées seront perdus</p>
                  )}
                </CardContent>
              </Card>

              {/* État de la suppression */}
              {canDelete ? (
                <Alert className="border-green-200 bg-green-50">
                  <Shield className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    La suppression est autorisée. Aucune contrainte bloquante détectée.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Suppression impossible :</strong> Des contraintes bloquantes empêchent la suppression.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Erreur API */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canDelete || loading || constraintsLoading}
            variant="destructive"
            className="gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 