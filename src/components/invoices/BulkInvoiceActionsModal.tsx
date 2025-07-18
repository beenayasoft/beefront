import { useState, useEffect } from "react";
import { 
  CheckSquare, 
  Send, 
  Download, 
  Trash2, 
  CreditCard, 
  FileText, 
  AlertTriangle,
  Check,
  X,
  Mail,
  Printer,
  Archive,
  Edit,
  Clock,
  Users,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  bulkValidateInvoices, 
  bulkExportInvoices, 
  bulkDeleteInvoices, 
  getBulkActionConstraints 
} from "@/lib/api/invoices";
import { Invoice, InvoiceStatus } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BulkInvoiceActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInvoices: Invoice[];
  onSuccess?: () => void;
}

interface BulkActionConstraint {
  invoiceId: string;
  invoiceNumber: string;
  constraint: string;
  severity: 'error' | 'warning';
}

interface BulkActionResult {
  successful: string[];
  failed: Array<{
    invoiceId: string;
    invoiceNumber: string;
    error: string;
  }>;
}

type BulkAction = 
  | 'validate'
  | 'export_pdf'
  | 'send_email'
  | 'delete'
  | 'mark_sent'
  | 'archive';

export function BulkInvoiceActionsModal({ 
  open, 
  onOpenChange, 
  selectedInvoices,
  onSuccess
}: BulkInvoiceActionsModalProps) {
  // États pour l'action sélectionnée
  const [selectedAction, setSelectedAction] = useState<BulkAction>('validate');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // États pour les contraintes et validation
  const [constraints, setConstraints] = useState<BulkActionConstraint[]>([]);
  const [loadingConstraints, setLoadingConstraints] = useState(false);
  
  // États pour les options d'action
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  
  // États pour les résultats
  const [actionResult, setActionResult] = useState<BulkActionResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Actions disponibles avec leurs configurations
  const availableActions = [
    {
      id: 'validate' as const,
      label: 'Valider les factures',
      icon: Check,
      description: 'Valider toutes les factures en brouillon',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'export_pdf' as const,
      label: 'Exporter en PDF',
      icon: Download,
      description: 'Télécharger les factures au format PDF',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'send_email' as const,
      label: 'Envoyer par email',
      icon: Mail,
      description: 'Envoyer les factures aux clients par email',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'mark_sent' as const,
      label: 'Marquer comme émises',
      icon: Send,
      description: 'Changer le statut vers "émise"',
      color: 'text-benaya-600',
      bgColor: 'bg-benaya-50',
      borderColor: 'border-benaya-200'
    },
    {
      id: 'archive' as const,
      label: 'Archiver',
      icon: Archive,
      description: 'Archiver les factures sélectionnées',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'delete' as const,
      label: 'Supprimer',
      icon: Trash2,
      description: 'Supprimer définitivement les factures',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  // Charger les contraintes lors du changement d'action
  useEffect(() => {
    if (open && selectedInvoices.length > 0) {
      loadConstraints();
    }
  }, [open, selectedAction, selectedInvoices]);

  const loadConstraints = async () => {
    setLoadingConstraints(true);
    try {
      const invoiceIds = selectedInvoices.map(inv => inv.id);
      const constraintsData = await getBulkActionConstraints(selectedAction, invoiceIds);
      setConstraints(constraintsData);
    } catch (err) {
      console.error('Erreur lors du chargement des contraintes:', err);
      toast.error("Erreur", {
        description: "Impossible de vérifier les contraintes"
      });
    } finally {
      setLoadingConstraints(false);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      draft: { label: "Brouillon", className: "bg-gray-100 text-gray-700" },
      sent: { label: "Émise", className: "bg-blue-100 text-blue-700" },
      overdue: { label: "En retard", className: "bg-red-100 text-red-700" },
      partially_paid: { label: "Partiellement payée", className: "bg-orange-100 text-orange-700" },
      paid: { label: "Payée", className: "bg-green-100 text-green-700" },
      cancelled: { label: "Annulée", className: "bg-gray-100 text-gray-700" },
      cancelled_by_credit_note: { label: "Annulée par avoir", className: "bg-gray-100 text-gray-700" }
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };
    
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Vérifier si l'action peut être exécutée
  const canExecuteAction = () => {
    const hasBlockingConstraints = constraints.some(c => c.severity === 'error');
    
    if (selectedAction === 'delete') {
      return !hasBlockingConstraints && confirmDeletion;
    }
    
    if (selectedAction === 'send_email') {
      return !hasBlockingConstraints && emailSubject.trim() && emailMessage.trim();
    }
    
    return !hasBlockingConstraints;
  };

  // Exécuter l'action sélectionnée
  const executeAction = async () => {
    if (!canExecuteAction()) return;

    setProcessing(true);
    setProgress(0);
    
    try {
      const invoiceIds = selectedInvoices.map(inv => inv.id);
      let result: BulkActionResult;

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      switch (selectedAction) {
        case 'validate':
          result = await bulkValidateInvoices(invoiceIds);
          break;
        case 'export_pdf':
          result = await bulkExportInvoices(invoiceIds, exportFormat);
          break;
        case 'send_email':
          result = await bulkSendEmails(invoiceIds, emailSubject, emailMessage);
          break;
        case 'delete':
          result = await bulkDeleteInvoices(invoiceIds);
          break;
        case 'mark_sent':
          result = await bulkMarkAsSent(invoiceIds);
          break;
        case 'archive':
          result = await bulkArchiveInvoices(invoiceIds);
          break;
        default:
          throw new Error('Action non supportée');
      }

      clearInterval(progressInterval);
      setProgress(100);
      
      setActionResult(result);
      setShowResults(true);

      // Toast de succès
      if (result.successful.length > 0) {
        toast.success("Action réussie", {
          description: `${result.successful.length} facture(s) traitée(s) avec succès`
        });
      }

      // Toast d'erreur si des échecs
      if (result.failed.length > 0) {
        toast.warning("Action partiellement réussie", {
          description: `${result.failed.length} facture(s) en échec`
        });
      }

      // Actualiser les données parent
      if (onSuccess && result.successful.length > 0) {
        onSuccess();
      }

    } catch (err: any) {
      console.error('Erreur lors de l\'exécution de l\'action:', err);
      toast.error("Erreur", {
        description: "Impossible d'exécuter l'action sélectionnée"
      });
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  // Fonctions d'API pour les actions non couvertes par l'API principal
  const bulkSendEmails = async (invoiceIds: string[], subject: string, message: string) => {
    // Implementation would call API endpoint
    return { successful: invoiceIds, failed: [] };
  };

  const bulkMarkAsSent = async (invoiceIds: string[]) => {
    // Implementation would call API endpoint
    return { successful: invoiceIds, failed: [] };
  };

  const bulkArchiveInvoices = async (invoiceIds: string[]) => {
    // Implementation would call API endpoint
    return { successful: invoiceIds, failed: [] };
  };

  // Réinitialiser le modal
  const resetModal = () => {
    setSelectedAction('validate');
    setConstraints([]);
    setActionResult(null);
    setShowResults(false);
    setEmailSubject('');
    setEmailMessage('');
    setConfirmDeletion(false);
    setProgress(0);
  };

  // Fermer le modal
  const handleClose = () => {
    if (!processing) {
      resetModal();
      onOpenChange(false);
    }
  };

  // Obtenir l'action sélectionnée
  const currentAction = availableActions.find(a => a.id === selectedAction);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-benaya-600" />
            Actions en lot
          </DialogTitle>
          <DialogDescription>
            {selectedInvoices.length} facture(s) sélectionnée(s) pour traitement
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            {/* Sélection de l'action */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Choisir une action</CardTitle>
                <CardDescription>
                  Sélectionnez l'action à appliquer aux factures sélectionnées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {availableActions.map((action) => {
                    const IconComponent = action.icon;
                    const isSelected = selectedAction === action.id;
                    
                    return (
                      <div
                        key={action.id}
                        className={cn(
                          "p-3 border-2 rounded-lg cursor-pointer transition-all",
                          isSelected 
                            ? `${action.borderColor} ${action.bgColor}` 
                            : "border-neutral-200 hover:border-neutral-300"
                        )}
                        onClick={() => setSelectedAction(action.id)}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={cn("w-5 h-5 mt-0.5", 
                            isSelected ? action.color : "text-neutral-500"
                          )} />
                          <div>
                            <div className="font-medium text-sm">{action.label}</div>
                            <div className="text-xs text-neutral-600 mt-1">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Options spécifiques à l'action */}
            {selectedAction === 'export_pdf' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Options d'export</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label>Format d'export</Label>
                      <Select value={exportFormat} onValueChange={(value: 'pdf' | 'excel') => setExportFormat(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF (recommandé)</SelectItem>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedAction === 'send_email' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Options d'envoi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email-subject">Objet de l'email *</Label>
                    <Input
                      id="email-subject"
                      placeholder="Votre facture est disponible"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-message">Message *</Label>
                    <Textarea
                      id="email-message"
                      placeholder="Bonjour,&#10;&#10;Veuillez trouver ci-joint votre facture...&#10;&#10;Cordialement"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedAction === 'delete' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-red-600">Confirmation de suppression</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Cette action est irréversible. Les factures supprimées ne pourront pas être récupérées.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="confirm-deletion"
                      checked={confirmDeletion}
                      onCheckedChange={(checked) => setConfirmDeletion(!!checked)}
                    />
                    <Label htmlFor="confirm-deletion" className="text-sm">
                      Je comprends que cette action est irréversible
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Liste des factures sélectionnées */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Factures sélectionnées ({selectedInvoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-40 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.number || "Brouillon"}
                          </TableCell>
                          <TableCell>{invoice.clientName}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(invoice.totalTTC)} MAD
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Contraintes et validations */}
            {loadingConstraints ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-neutral-300 border-t-benaya-600 mx-auto" />
                    <div className="text-neutral-500 mt-2">Vérification des contraintes...</div>
                  </div>
                </CardContent>
              </Card>
            ) : constraints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Contraintes détectées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {constraints.map((constraint, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border",
                          constraint.severity === 'error' 
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-orange-50 border-orange-200 text-orange-700"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {constraint.severity === 'error' ? (
                            <X className="w-4 h-4 mt-0.5 text-red-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500" />
                          )}
                          <div>
                            <div className="font-medium text-sm">
                              Facture {constraint.invoiceNumber}
                            </div>
                            <div className="text-sm">{constraint.constraint}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {constraints.some(c => c.severity === 'error') && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Des contraintes bloquantes empêchent l'exécution de cette action.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Barre de progression */}
            {processing && (
              <Card>
                <CardContent className="py-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Traitement en cours...</span>
                      <span className="text-sm text-neutral-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Résultats de l'action */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  {currentAction?.icon && <currentAction.icon className="w-4 h-4" />}
                  Résultats de l'action: {currentAction?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {actionResult?.successful.length || 0}
                    </div>
                    <div className="text-sm text-green-700">Réussies</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {actionResult?.failed.length || 0}
                    </div>
                    <div className="text-sm text-red-700">Échecs</div>
                  </div>
                </div>

                {actionResult?.failed && actionResult.failed.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-sm mb-3">Détails des échecs:</h4>
                    <div className="space-y-2">
                      {actionResult.failed.map((failure, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="font-medium text-sm text-red-700">
                            Facture {failure.invoiceNumber}
                          </div>
                          <div className="text-sm text-red-600">{failure.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            {!showResults ? (
              <>
                <div className="flex items-center gap-2">
                  {currentAction && (
                    <Badge variant="secondary" className={cn("gap-1", currentAction.bgColor)}>
                      <currentAction.icon className="w-3 h-3" />
                      {currentAction.label}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={processing}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={!canExecuteAction() || processing}
                    className="gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Exécuter
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-end w-full">
                <Button onClick={handleClose}>
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 