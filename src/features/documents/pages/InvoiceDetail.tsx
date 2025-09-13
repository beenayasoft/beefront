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
  Building,
  Info,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RecordPaymentModal } from "../components/invoices/RecordPaymentModal";
import { CreateCreditNoteModal } from "../components/invoices/CreateCreditNoteModal";
import { SendInvoiceModal } from "../components/invoices/SendInvoiceModal";
import { InvoicePreviewModal } from "../components/invoices/InvoicePreviewModal";
import { toast } from "@/components/ui/use-toast";
import { getInvoiceById, sendInvoice, generateInvoicePdf } from "../api/invoices";
import { Invoice, InvoiceStatus, Payment } from "../types/invoices.types";
import { useCurrency } from '@/contexts/CurrencyContext';

export default function InvoiceDetail() {
  const { formatCurrency } = useCurrency();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les modales
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

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



  // Télécharger la facture en PDF
  const handleGeneratePDF = async () => {
    if (!invoice) return;
    
    try {
      const pdfBlob = await generateInvoicePdf(invoice.id);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${invoice.number || 'Brouillon'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF téléchargé",
        description: "La facture PDF a été téléchargée avec succès.",
        variant: "default"
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger le PDF. Réessayez.",
        variant: "destructive"
      });
    }
  };

  // Envoyer par email
  const handleSendEmail = async (data: { recipient_email: string; message?: string }) => {
    if (!invoice) return;
    
    try {
      await sendInvoice(invoice.id, data);
      setSendModalOpen(false);
      toast({
        title: "Facture envoyée",
        description: "La facture a été envoyée avec succès par email.",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la facture:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la facture.",
        variant: "destructive",
      });
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="Beenaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="Beenaya-badge-primary gap-1">
            <Send className="w-3 h-3" />
            Émise
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="Beenaya-badge-error gap-1">
            <AlertCircle className="w-3 h-3" />
            En retard
          </Badge>
        );
      case "partially_paid":
        return (
          <Badge className="Beenaya-badge-warning gap-1">
            <Clock className="w-3 h-3" />
            Partiellement payée
          </Badge>
        );
      case "paid":
        return (
          <Badge className="Beenaya-badge-success gap-1">
            <Check className="w-3 h-3" />
            Payée
          </Badge>
        );
      case "cancelled":
      case "cancelled_by_credit_note":
        return (
          <Badge className="Beenaya-badge-neutral gap-1">
            <X className="w-3 h-3" />
            Annulée
          </Badge>
        );
      default:
        return <Badge className="Beenaya-badge-neutral">—</Badge>;
    }
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Beenaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de la facture...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center">
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
        {/* Header avec thème Benaya et coins arrondis */}
        <div className="Beenaya-gradient text-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/factures')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{invoice.number || 'Brouillon'}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invoice.status === 'draft' ? 'bg-gray-500/80 text-white' :
                    invoice.status === 'sent' ? 'bg-blue-500/80 text-white' :
                    invoice.status === 'paid' ? 'bg-green-500/80 text-white' :
                    invoice.status === 'overdue' ? 'bg-red-500/80 text-white' :
                    invoice.status === 'partially_paid' ? 'bg-yellow-500/80 text-white' :
                    'bg-gray-500/80 text-white'
                  }`}>
                    {invoice.status === 'draft' ? 'Brouillon' : 
                     invoice.status === 'sent' ? 'Émise' :
                     invoice.status === 'paid' ? 'Payée' :
                     invoice.status === 'overdue' ? 'En retard' :
                     invoice.status === 'partially_paid' ? 'Partiellement payée' :
                     invoice.status}
                  </span>
                </div>
                <p className="text-slate-200 mt-1">
                  Client: {invoice.clientName} {invoice.projectName && `- Projet: ${invoice.projectName}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right mr-4">
                <div className="text-slate-200 text-sm">Total TTC</div>
                <div className="text-xl font-bold">{formatCurrency(invoice.totalTtc)}</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleGeneratePDF}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Télécharger PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setPreviewModalOpen(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Aperçu"
                >
                  <Eye className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setSendModalOpen(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Envoyer par email"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layout principal exactement comme l'image */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonnes principales (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Client et Projet - Style moderne */}
          <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-gradient-to-r from-white to-neutral-50/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Client */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Client</h3>
                  </div>
                  <div className="space-y-3 ml-10">
                    <div className="font-medium text-gray-900 text-lg">{invoice.clientName}</div>
                    {invoice.clientAddress && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.clientAddress}</div>
                    )}
                  </div>
                </div>

                {/* Projet */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                      <Building className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Projet</h3>
                  </div>
                  <div className="space-y-3 ml-10">
                    <div className="font-medium text-gray-900 text-lg">{invoice.projectName || 'Facture - Service général'}</div>
                    {invoice.projectAddress && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.projectAddress}</div>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Dates</h3>
                  </div>
                  <div className="space-y-3 ml-10">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">Date d'émission</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{formatDate(invoice.issueDate)}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-xs font-medium text-red-600 uppercase tracking-wide">Date d'échéance</div>
                      <div className="text-sm font-medium text-gray-900 mt-1 flex items-center">
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

                {/* Devis d'origine */}
                {invoice.quoteNumber && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Devis d'origine</h3>
                    </div>
                    <div className="space-y-3 ml-10">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Numéro de devis</div>
                        <div className="text-sm font-medium text-gray-900 mt-1">{invoice.quoteNumber}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

            {/* Détail de la facture - Style moderne */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-gradient-to-r from-white to-slate-50/50">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  Détail de la facture
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Désignation</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantité</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix unitaire</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">TVA</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total HT</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total TTC</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => {
                          // Si c'est un chapitre, afficher en tant que titre
                          if (item.type === 'chapter' || item.type === 'section') {
                            return (
                              <tr key={item.id} className="bg-gradient-to-r from-gray-50 to-slate-50">
                                <td colSpan={6} className="px-6 py-4 font-semibold text-gray-900">
                                  {item.designation}
                                </td>
                              </tr>
                            );
                          }
                          
                          // Sinon, afficher comme élément normal
                          return (
                            <tr key={item.id} className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-slate-50/30 transition-all duration-200">
                              <td className="px-6 py-5">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg flex items-center justify-center">
                                    <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">{item.designation}</div>
                                    {item.description && (
                                      <div className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">{item.description}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                  {item.quantity} {item.unit}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  {item.vatRate}%
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalHt)}</span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-sm font-bold text-Beenaya-600">{formatCurrency(item.totalTtc)}</span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-sm font-medium">Aucun élément dans cette facture</p>
                              <p className="text-xs text-gray-400 mt-1">Les éléments de la facture apparaîtront ici</p>
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              {/* Totaux - Style moderne */}
              <div className="px-6 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-100">
                <div className="flex justify-end">
                  <div className="space-y-3 min-w-[250px]">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Total HT:</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(invoice.totalHt)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <span className="text-sm font-medium text-gray-600">Total TVA:</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(invoice.totalVat)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-Beenaya-50 to-blue-50 rounded-lg shadow-md border border-Beenaya-200">
                      <span className="text-lg font-bold text-Beenaya-900">Total TTC:</span>
                      <span className="text-xl font-bold text-Beenaya-600">{formatCurrency(invoice.totalTtc)}</span>
                    </div>
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Notes et conditions - Style moderne */}
            {(invoice.notes || invoice.termsAndConditions) && (
              <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-600" />
                    </div>
                    Notes et conditions
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {invoice.notes && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Notes
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{invoice.notes}</p>
                    </div>
                  )}
                  
                  {invoice.termsAndConditions && (
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                      <h4 className="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Conditions de paiement
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{invoice.termsAndConditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne de droite - Style moderne */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Statut et actions - Style moderne */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  Statut et actions
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Statut actuel - Style moderne */}
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Statut actuel</div>
                  <div className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg transition-all duration-200 ${
                    invoice.status === 'draft' ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300 shadow-gray-200' :
                    invoice.status === 'sent' ? 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-300 shadow-blue-200' :
                    invoice.status === 'paid' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-green-200' :
                    invoice.status === 'overdue' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300 shadow-red-200' :
                    invoice.status === 'partially_paid' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300 shadow-yellow-200' :
                    'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300 shadow-gray-200'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      invoice.status === 'draft' ? 'bg-gray-500' :
                      invoice.status === 'sent' ? 'bg-blue-500' :
                      invoice.status === 'paid' ? 'bg-green-500' :
                      invoice.status === 'overdue' ? 'bg-red-500' :
                      invoice.status === 'partially_paid' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`}></div>
                    {invoice.status === 'draft' ? 'Brouillon' : 
                     invoice.status === 'sent' ? 'Émise' :
                     invoice.status === 'paid' ? 'Payée' :
                     invoice.status === 'overdue' ? 'En retard' :
                     invoice.status === 'partially_paid' ? 'Partiellement payée' :
                     invoice.status}
                  </div>
                  
                  {invoice.status === "overdue" && (
                    <p className="text-sm text-red-600 text-center mt-3 p-2 bg-red-50 rounded-lg">
                      En retard de paiement depuis le {formatDate(invoice.dueDate)}
                    </p>
                  )}
                </div>

                {/* Montants - Style moderne */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Total TTC:</span>
                    <span className="font-bold text-blue-900">{formatCurrency(invoice.totalTtc)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Montant payé:</span>
                    <span className="font-bold text-green-900">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-Beenaya-50 to-purple-50 rounded-xl shadow-md border border-Beenaya-200">
                    <span className="font-bold text-Beenaya-900">Restant dû:</span>
                    <span className={`font-bold text-xl ${
                      invoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(invoice.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* Actions principales - Style moderne */}
                <div className="space-y-3">
                  {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partially_paid") && (
                    <button
                      className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium gap-2"
                      onClick={() => setPaymentModalOpen(true)}
                    >
                      <Check className="w-4 h-4" />
                      Enregistrer un paiement
                    </button>
                  )}
                  
                  {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partially_paid" || invoice.status === "paid") && (
                    <button
                      className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      onClick={() => setCreditNoteModalOpen(true)}
                    >
                      <X className="w-4 h-4" />
                      Créer un avoir
                    </button>
                  )}
                  
                  <button
                    className="w-full border border-blue-300 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={handleGeneratePDF}
                  >
                    <Download className="w-4 h-4" />
                    Télécharger PDF
                  </button>
                  
                  <button
                    className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={() => setSendModalOpen(true)}
                  >
                    <Send className="w-4 h-4" />
                    Envoyer par email
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Historique des paiements - Style moderne */}
            <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-gradient-to-br from-white to-emerald-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  Historique des paiements
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {invoice.payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">Aucun paiement enregistré</p>
                    <p className="text-xs text-gray-400 mt-1">Les paiements apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoice.payments.map((payment) => (
                      <div 
                        key={payment.id}
                        className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-emerald-900 text-lg">{formatCurrency(payment.amount)}</span>
                          <span className="text-sm text-emerald-600 bg-white px-2 py-1 rounded-full font-medium">
                            {formatDate(payment.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-emerald-700">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          {payment.method === "bank_transfer" && "Virement bancaire"}
                          {payment.method === "check" && "Chèque"}
                          {payment.method === "cash" && "Espèces"}
                          {payment.method === "card" && "Carte bancaire"}
                          {payment.method === "other" && "Autre"}
                          {payment.reference && ` - ${payment.reference}`}
                        </div>
                        {payment.notes && (
                          <div className="text-xs text-emerald-600 mt-2 p-2 bg-white/50 rounded">
                            {payment.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Modals */}
        {invoice && (
        <div>
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

          <SendInvoiceModal
            open={sendModalOpen}
            onOpenChange={setSendModalOpen}
            invoice={{
              id: invoice.id,
              number: invoice.number,
              clientName: invoice.clientName,
              totalTtc: invoice.totalTtc || 0
            }}
            onSend={handleSendEmail}
            loading={false}
          />

          <InvoicePreviewModal
            invoice={invoice}
            isOpen={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
          />
        </div>
        )}
      </div>
    );
}