import { useState, useEffect } from "react";
import { 
  Eye, 
  Download, 
  Send, 
  Edit, 
  Printer, 
  FileText, 
  User, 
  Building2, 
  Calendar, 
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportInvoicePdf, getInvoicePayments } from "@/lib/api/invoices";
import { Invoice, InvoiceItem, Payment } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvoiceViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice;
  onEdit?: () => void;
  onValidate?: () => void;
  onDelete?: () => void;
  onRecordPayment?: () => void;
  onCreateCreditNote?: () => void;
}

export function InvoiceViewModal({ 
  open, 
  onOpenChange, 
  invoice,
  onEdit,
  onValidate,
  onDelete,
  onRecordPayment,
  onCreateCreditNote
}: InvoiceViewModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Charger les paiements au montage
  useEffect(() => {
    if (open && invoice && invoice.status !== 'draft') {
      loadPayments();
    }
  }, [open, invoice]);

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const invoicePayments = await getInvoicePayments(invoice.id);
      setPayments(invoicePayments);
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Obtenir le badge de statut avec couleur
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { 
        label: "Brouillon", 
        variant: "secondary" as const, 
        icon: Edit, 
        className: "bg-gray-100 text-gray-700" 
      },
      sent: { 
        label: "Émise", 
        variant: "default" as const, 
        icon: Send, 
        className: "bg-blue-100 text-blue-700" 
      },
      overdue: { 
        label: "En retard", 
        variant: "destructive" as const, 
        icon: AlertTriangle, 
        className: "bg-red-100 text-red-700" 
      },
      partially_paid: { 
        label: "Partiellement payée", 
        variant: "secondary" as const, 
        icon: Clock, 
        className: "bg-orange-100 text-orange-700" 
      },
      paid: { 
        label: "Payée", 
        variant: "secondary" as const, 
        icon: CheckCircle, 
        className: "bg-green-100 text-green-700" 
      },
      cancelled: { 
        label: "Annulée", 
        variant: "secondary" as const, 
        icon: XCircle, 
        className: "bg-gray-100 text-gray-700" 
      },
      cancelled_by_credit_note: { 
        label: "Annulée par avoir", 
        variant: "secondary" as const, 
        icon: XCircle, 
        className: "bg-gray-100 text-gray-700" 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: "secondary" as const, icon: FileText, className: "" };
    
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className={cn("gap-1", config.className)}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Actions possibles selon le statut
  const getAvailableActions = () => {
    const actions = [];
    
    if (invoice.status === 'draft') {
      actions.push(
        { label: "Modifier", action: onEdit, icon: Edit, variant: "outline" as const },
        { label: "Valider", action: onValidate, icon: Send, variant: "default" as const },
        { label: "Supprimer", action: onDelete, icon: XCircle, variant: "destructive" as const }
      );
    } else if (invoice.status === 'sent' || invoice.status === 'overdue' || invoice.status === 'partially_paid') {
      actions.push(
        { label: "Enregistrer un paiement", action: onRecordPayment, icon: CreditCard, variant: "default" as const },
        { label: "Créer un avoir", action: onCreateCreditNote, icon: FileText, variant: "outline" as const }
      );
    }
    
    return actions;
  };

  // Export PDF
  const handleExportPdf = async () => {
    try {
      const result = await exportInvoicePdf(invoice.id);
      // Déclencher le téléchargement
      const link = document.createElement('a');
      link.href = result.file_url;
      link.download = result.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Export réussi", {
        description: "Le PDF de la facture a été téléchargé."
      });
    } catch (err: any) {
      console.error('Erreur lors de l\'export PDF:', err);
      toast.error("Erreur d'export", {
        description: "Impossible de générer le PDF de la facture."
      });
    }
  };

  // Copier le numéro de facture
  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.number);
    toast.success("Numéro copié", {
      description: `Le numéro ${invoice.number} a été copié dans le presse-papiers.`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-benaya-600" />
            Facture {invoice.number || "Brouillon"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>Consultation détaillée de la facture</span>
            {getStatusBadge(invoice.status)}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="gap-2">
              <FileText className="w-4 h-4" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="items" className="gap-2">
              <Building2 className="w-4 h-4" />
              Éléments
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Paiements
            </TabsTrigger>
          </TabsList>

          {/* Onglet Détails */}
          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations facture */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    Informations facture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Numéro:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invoice.number || "Brouillon"}</span>
                      {invoice.number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyInvoiceNumber}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date d'émission:</span>
                    <span className="font-medium">
                      {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Date d'échéance:</span>
                    <span className="font-medium">
                      {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {invoice.paymentTerms && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Délai de paiement:</span>
                      <span className="font-medium">{invoice.paymentTerms} jours</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    Informations client
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-neutral-600 text-sm">Nom:</span>
                    <div className="font-medium">{invoice.clientName}</div>
                  </div>
                  {invoice.clientAddress && (
                    <div>
                      <span className="text-neutral-600 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Adresse:
                      </span>
                      <div className="text-sm text-neutral-700">{invoice.clientAddress}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Informations projet si disponible */}
            {invoice.projectName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="w-4 h-4" />
                    Informations projet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-neutral-600 text-sm">Nom du projet:</span>
                      <div className="font-medium">{invoice.projectName}</div>
                    </div>
                    {invoice.projectAddress && (
                      <div>
                        <span className="text-neutral-600 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Adresse:
                        </span>
                        <div className="text-sm text-neutral-700">{invoice.projectAddress}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Résumé financier */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="w-4 h-4" />
                  Résumé financier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">
                      {formatCurrency(invoice.totalHT)} MAD
                    </div>
                    <div className="text-sm text-neutral-600">Total HT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">
                      {formatCurrency(invoice.totalVAT)} MAD
                    </div>
                    <div className="text-sm text-neutral-600">TVA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-benaya-600">
                      {formatCurrency(invoice.totalTTC)} MAD
                    </div>
                    <div className="text-sm text-neutral-600">Total TTC</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(invoice.paidAmount)} MAD
                    </div>
                    <div className="text-sm text-neutral-600">Payé</div>
                  </div>
                </div>
                {invoice.remainingAmount > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="text-center">
                      <div className="text-xl font-bold text-orange-700">
                        {formatCurrency(invoice.remainingAmount)} MAD
                      </div>
                      <div className="text-sm text-orange-600">Reste à payer</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Notes et conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {invoice.notes && (
                    <div>
                      <span className="text-neutral-600 text-sm">Notes:</span>
                      <div className="text-sm text-neutral-700 whitespace-pre-wrap">{invoice.notes}</div>
                    </div>
                  )}
                  {invoice.termsAndConditions && (
                    <div>
                      <span className="text-neutral-600 text-sm">Conditions générales:</span>
                      <div className="text-sm text-neutral-700 whitespace-pre-wrap">{invoice.termsAndConditions}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onglet Éléments */}
          <TabsContent value="items" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Building2 className="w-4 h-4" />
                  Éléments de facturation ({invoice.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.items && invoice.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Désignation</TableHead>
                        <TableHead className="text-center">Qté</TableHead>
                        <TableHead className="text-right">Prix unitaire</TableHead>
                        <TableHead className="text-center">TVA</TableHead>
                        <TableHead className="text-right">Total HT</TableHead>
                        <TableHead className="text-right">Total TTC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.designation}</div>
                              {item.description && (
                                <div className="text-sm text-neutral-500">{item.description}</div>
                              )}
                              {item.reference && (
                                <div className="text-xs text-neutral-400">Réf: {item.reference}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity} {item.unit && <span className="text-neutral-500">{item.unit}</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice)} MAD
                          </TableCell>
                          <TableCell className="text-center">
                            {item.vatRate}%
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalHT)} MAD
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalTTC)} MAD
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    Aucun élément de facturation
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paiements */}
          <TabsContent value="payments" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="w-4 h-4" />
                  Historique des paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 animate-spin rounded-full border-2 border-neutral-300 border-t-benaya-600 mx-auto" />
                    <div className="text-neutral-500 mt-2">Chargement des paiements...</div>
                  </div>
                ) : payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{formatCurrency(payment.amount)} MAD</div>
                            <div className="text-sm text-neutral-600">
                              {new Date(payment.date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-neutral-500">
                              Méthode: {payment.method}
                            </div>
                            {payment.reference && (
                              <div className="text-xs text-neutral-400">
                                Référence: {payment.reference}
                              </div>
                            )}
                          </div>
                          <Badge variant="secondary">Encaissé</Badge>
                        </div>
                        {payment.notes && (
                          <div className="text-sm text-neutral-600 mt-2">{payment.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-500">
                    {invoice.status === 'draft' ? 
                      "Les paiements ne sont possibles qu'après validation de la facture" :
                      "Aucun paiement enregistré"
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            {/* Actions contextuelles */}
            <div className="flex gap-2">
              {getAvailableActions().map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant}
                    size="sm"
                    onClick={action.action}
                    className="gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Actions générales */}
            <div className="flex gap-2">
              {invoice.status !== 'draft' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 