import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Send,
  Eye,
  Download,
  FileText,
  Calendar,
  User,
  MapPin,
  Euro,
  Clock,
  AlertCircle,
  CreditCard,
  FileX,
  Check,
  X,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RecordPaymentModal } from "@/components/invoices/RecordPaymentModal";
import { CreateCreditNoteModal } from "@/components/invoices/CreateCreditNoteModal";
import { toast } from "@/components/ui/use-toast";
import { getInvoiceById } from "@/lib/api/invoices";
import { Invoice, InvoiceStatus, Payment } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les modales
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);

  // Charger la facture depuis l'API
  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceById(id!);
      setInvoice(data);
    } catch (error) {
      console.error("Erreur lors du chargement de la facture:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la facture",
        variant: "destructive",
      });
      // Rediriger vers la liste en cas d'erreur
      navigate("/factures");
    } finally {
      setLoading(false);
    }
  };



  // Générer un PDF (placeholder)
  const handleGeneratePDF = () => {
    alert("Fonctionnalité de génération de PDF à implémenter");
  };

  // Envoyer par email (placeholder)
  const handleSendEmail = () => {
    alert("Fonctionnalité d'envoi par email à implémenter");
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="benaya-badge-primary gap-1">
            <Send className="w-3 h-3" />
            Émise
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="benaya-badge-error gap-1">
            <AlertCircle className="w-3 h-3" />
            En retard
          </Badge>
        );
      case "partially_paid":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <Clock className="w-3 h-3" />
            Partiellement payée
          </Badge>
        );
      case "paid":
        return (
          <Badge className="benaya-badge-success gap-1">
            <Check className="w-3 h-3" />
            Payée
          </Badge>
        );
      case "cancelled":
      case "cancelled_by_credit_note":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <X className="w-3 h-3" />
            Annulée
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error || "Facture non trouvée"}</h2>
          <Button onClick={() => navigate("/factures")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/factures")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {invoice.number}
                </h1>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-benaya-100 mt-1">
                Client: {invoice.clientName} {invoice.projectName && `- Projet: ${invoice.projectName}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <div className="text-benaya-100 text-sm">Total TTC</div>
              <div className="text-xl font-bold">{formatCurrency(invoice.totalTTC)} MAD</div>
            </div>
            
            <div className="flex">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={handleGeneratePDF}
              >
                <Printer className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={handleGeneratePDF}
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/10 hover:bg-white/20"
                onClick={handleSendEmail}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client and Invoice Info */}
          <div className="benaya-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client
                </h3>
                <div className="space-y-1">
                  <div className="font-medium">{invoice.clientName}</div>
                  {invoice.clientAddress && (
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      {invoice.clientAddress}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Projet
                </h3>
                <div className="space-y-1">
                  <div className="font-medium">
                    {invoice.projectName || "—"}
                  </div>
                  {invoice.projectAddress && (
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      {invoice.projectAddress}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Date d'émission
                    </div>
                    <div className="font-medium">{formatDate(invoice.issueDate)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Date d'échéance
                    </div>
                    <div className="font-medium">
                      {formatDate(invoice.dueDate)}
                      {invoice.status === "overdue" && (
                        <span className="ml-2 text-red-500">
                          <AlertCircle className="w-4 h-4 inline" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {invoice.quoteNumber && (
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Devis d'origine
                  </h3>
                  <div className="space-y-1">
                    <div className="font-medium">{invoice.quoteNumber}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Détail de la facture</h3>
            
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Désignation</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Total HT</TableHead>
                    <TableHead>Total TTC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => {
                    // Si c'est un chapitre, afficher en tant que titre
                    if (item.type === 'chapter' || item.type === 'section') {
                      return (
                        <TableRow key={item.id} className="bg-neutral-50 dark:bg-neutral-800/50">
                          <TableCell colSpan={6} className="font-semibold">
                            {item.designation}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    // Sinon, afficher comme élément normal
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.designation}</div>
                            {item.description && (
                              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)} MAD</TableCell>
                        <TableCell>{item.vatRate}%</TableCell>
                        <TableCell>{formatCurrency(item.totalHT)} MAD</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.totalTTC)} MAD</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total HT:</span>
                  <span className="font-medium">{formatCurrency(invoice.totalHT)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total TVA:</span>
                  <span className="font-medium">{formatCurrency(invoice.totalVAT)} MAD</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <span>Total TTC:</span>
                  <span>{formatCurrency(invoice.totalTTC)} MAD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="benaya-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {invoice.notes && (
                <div className="space-y-2">
                  <h3 className="font-medium">Notes</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {invoice.notes}
                  </p>
                </div>
              )}
              
              {invoice.termsAndConditions && (
                <div className="space-y-2">
                  <h3 className="font-medium">Conditions de paiement</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {invoice.termsAndConditions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Statut et actions</h3>
            
            <div className="space-y-6">
              {/* Status */}
              <div className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div className="text-lg font-semibold mb-2">Statut actuel</div>
                <div className="scale-125 mb-2">
                  {getStatusBadge(invoice.status)}
                </div>
                
                {invoice.status === "overdue" && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2">
                    En retard de paiement depuis le {formatDate(invoice.dueDate)}
                  </p>
                )}
              </div>
              
              {/* Payment Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total TTC:</span>
                  <span className="font-medium">{formatCurrency(invoice.totalTTC)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Montant payé:</span>
                  <span className="font-medium">{formatCurrency(invoice.paidAmount)} MAD</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-neutral-200 dark:border-neutral-700 pt-2">
                  <span>Restant dû:</span>
                  <span className={invoice.remainingAmount > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                    {formatCurrency(invoice.remainingAmount)} MAD
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partially_paid") && (
                  <Button 
                    className="w-full benaya-button-primary gap-2"
                    onClick={() => setPaymentModalOpen(true)}
                  >
                    <Check className="w-4 h-4" />
                    Enregistrer un paiement
                  </Button>
                )}
                
                {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partially_paid" || invoice.status === "paid") && (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={() => setCreditNoteModalOpen(true)}
                  >
                    <X className="w-4 h-4" />
                    Créer un avoir
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleGeneratePDF}
                >
                  <Download className="w-4 h-4" />
                  Télécharger PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleSendEmail}
                >
                  <Send className="w-4 h-4" />
                  Envoyer par email
                </Button>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="benaya-card">
            <h3 className="font-medium text-lg mb-4">Historique des paiements</h3>
            
            {invoice.payments.length === 0 ? (
              <div className="text-center py-6 text-neutral-500">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p>Aucun paiement enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{formatCurrency(payment.amount)} MAD</span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {formatDate(payment.date)}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      {payment.method === "bank_transfer" && "Virement bancaire"}
                      {payment.method === "check" && "Chèque"}
                      {payment.method === "cash" && "Espèces"}
                      {payment.method === "card" && "Carte bancaire"}
                      {payment.method === "other" && "Autre"}
                      {payment.reference && ` - ${payment.reference}`}
                    </div>
                    {payment.notes && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                        {payment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {invoice && (
        <>
          <RecordPaymentModal
            open={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            invoice={invoice}
            onSuccess={async (updatedInvoice) => {
              setInvoice(updatedInvoice);
              toast({
                title: "Succès",
                description: "Le paiement a été enregistré avec succès",
              });
            }}
          />
          
          <CreateCreditNoteModal
            open={creditNoteModalOpen}
            onOpenChange={setCreditNoteModalOpen}
            invoice={invoice}
            onSuccess={async (creditNote, originalInvoice) => {
              setInvoice(originalInvoice);
              toast({
                title: "Succès",
                description: "L'avoir a été créé avec succès",
              });
              // Rediriger vers l'avoir créé
              navigate(`/factures/${creditNote.id}`);
            }}
          />
        </>
      )}
    </div>
  );
}