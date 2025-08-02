import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InvoiceStats } from "@/components/invoices/InvoiceStats";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTabs } from "@/components/invoices/InvoiceTabs";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { RecordPaymentModal } from "@/components/invoices/RecordPaymentModal";
import { CreateCreditNoteModal } from "@/components/invoices/CreateCreditNoteModal";
import { CreateInvoiceModal } from "@/components/invoices/CreateInvoiceModal";
import { CreateInvoiceFromQuoteModal } from "@/components/invoices/CreateInvoiceFromQuoteModal";
import { ValidateInvoiceModal } from "@/components/invoices/ValidateInvoiceModal";
import { DeleteInvoiceModal } from "@/components/invoices/DeleteInvoiceModal";
import { InvoiceViewModal } from "@/components/invoices/InvoiceViewModal";
import { InvoiceFiltersModal } from "@/components/invoices/InvoiceFiltersModal";
import { BulkInvoiceActionsModal } from "@/components/invoices/BulkInvoiceActionsModal";
import { toast } from "@/components/ui/use-toast";
import { 
  getInvoices, 
  getInvoiceStats, 
  validateInvoice, 
  recordPayment, 
  createCreditNote,
  deleteInvoice
} from "@/lib/api/invoices";
import { Invoice, InvoiceStatus, Payment } from "@/lib/types/invoice";

export default function Factures() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    all: 0,
    draft: 0,
    sent: 0,
    overdue: 0,
    partially_paid: 0,
    paid: 0,
    cancelled: 0,
  });
  const [statsData, setStatsData] = useState({
    totalAmount: 0,
    overdueAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
  });
  
  // States for modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [validateInvoiceModalOpen, setValidateInvoiceModalOpen] = useState(false);
  const [deleteInvoiceModalOpen, setDeleteInvoiceModalOpen] = useState(false);

  // Charger les factures depuis l'API
  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Préparer les paramètres
      const params: any = {
        page,
        page_size: 20,
        search: searchQuery || undefined,
      };
      
      // Filtrer par statut si nécessaire
      if (activeTab !== "all") {
        params.status = activeTab as InvoiceStatus;
      }
      
      const response = await getInvoices(params);
      setInvoices(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques depuis l'API
  const loadStats = async () => {
    try {
      console.log("🔍 Chargement des statistiques des factures...");
      const invoiceStats = await getInvoiceStats();
      console.log("📊 Statistiques reçues:", invoiceStats);
      
      setStats({
        all: invoiceStats.total,
        draft: invoiceStats.draft,
        sent: invoiceStats.sent,
        overdue: invoiceStats.overdue,
        partially_paid: invoiceStats.partially_paid,
        paid: invoiceStats.paid,
        cancelled: invoiceStats.cancelled + invoiceStats.cancelled_by_credit_note,
      });
      setStatsData({
        totalAmount: invoiceStats.totalAmount,
        overdueAmount: invoiceStats.overdueAmount,
        paidAmount: invoiceStats.paidAmount,
        remainingAmount: invoiceStats.remainingAmount,
      });
      console.log("✅ Statistiques mises à jour avec succès");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des statistiques:", error);
      // Afficher des stats par défaut en cas d'erreur
      setStats({
        all: 0,
        draft: 0,
        sent: 0,
        overdue: 0,
        partially_paid: 0,
        paid: 0,
        cancelled: 0,
      });
      setStatsData({
        totalAmount: 0,
        overdueAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
      });
    }
  };

  // Charger les données au montage et lors des changements
  useEffect(() => {
    loadInvoices();
    loadStats();
  }, [activeTab, searchQuery, page]);

  // View invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/factures/${invoice.id}`);
  };

  // Edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/factures/edit/${invoice.id}`);
  };

  // Create new invoice - ouvrir la modale au lieu de naviguer
  const handleCreateInvoice = () => {
    setCreateInvoiceModalOpen(true);
  };

  // Gérer le succès de création de facture
  const handleCreateInvoiceSuccess = (invoice: Invoice) => {
    console.log("handleCreateInvoiceSuccess appelé avec:", invoice);
    console.log("ID de la facture:", invoice.id);
    
    // Rafraîchir la liste et les stats
    loadInvoices();
    loadStats();
    
    // S'assurer que l'ID est une chaîne valide avant de naviguer
    if (invoice && invoice.id) {
      console.log("Navigation vers:", `/factures/edit/${invoice.id}`);
      // Utiliser un court délai pour s'assurer que la navigation se fait après la fermeture complète de la modale
      setTimeout(() => {
        navigate(`/factures/edit/${invoice.id}`);
      }, 200);
    } else {
      console.error("ID de facture invalide:", invoice);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir l'éditeur: ID de facture invalide",
        variant: "destructive",
      });
    }
  };

  // Delete invoice - ouvrir la modale de confirmation
  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteInvoiceModalOpen(true);
  };

  // Gérer le succès de suppression
  const handleDeleteInvoiceSuccess = () => {
    // La suppression a déjà été effectuée dans la modale DeleteInvoiceModal
    // Rafraîchir la liste et les stats en une seule fois
    Promise.all([
      loadInvoices(),
      loadStats()
    ]);
    
    toast({
      title: "Succès",
      description: "La facture a été supprimée avec succès",
    });
  };

  // Validate and send invoice - ouvrir la modale de validation
  const handleSendInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setValidateInvoiceModalOpen(true);
  };

  // Gérer le succès de validation
  const handleValidateInvoiceSuccess = async (validatedInvoice: Invoice) => {
    // Rafraîchir la liste et les stats en une seule fois
    await Promise.all([
      loadInvoices(),
      loadStats()
    ]);
    
    toast({
      title: "Succès",
      description: `La facture ${validatedInvoice.number} a été validée`,
    });
  };

  // Record payment
  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  // Submit payment
  const handleSubmitPayment = async (invoiceId: string, payment: Omit<Payment, "id">) => {
    try {
      const result = await recordPayment(invoiceId, payment);
      if (result) {
        // Rafraîchir la liste et les stats en une seule fois
        await Promise.all([
          loadInvoices(),
          loadStats()
        ]);
        
        toast({
          title: "Succès",
          description: "Le paiement a été enregistré avec succès",
        });
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du paiement:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement",
        variant: "destructive",
      });
    }
  };

  // Create credit note
  const handleCreateCreditNote = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCreditNoteModalOpen(true);
  };

  // Submit credit note
  const handleSubmitCreditNote = async (invoiceId: string, isFullCreditNote: boolean, selectedItems?: string[]) => {
    try {
      const result = await createCreditNote(invoiceId, {
        reason: "Avoir sur facture",
        is_full_credit_note: isFullCreditNote,
        selected_items: selectedItems
      });
      
      if (result && result.creditNote) {
        // Rafraîchir les données en une seule fois pour éviter les rendus multiples
        await Promise.all([
          loadInvoices(),
          loadStats()
        ]);
        
        toast({
          title: "Succès",
          description: "L'avoir a été créé avec succès",
        });
      }
    } catch (err) {
      console.error("Erreur lors de la création de l'avoir:", err);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'avoir",
        variant: "destructive",
      });
    }
  };

  // Download invoice (placeholder)
  const handleDownloadInvoice = (invoice: Invoice) => {
    alert(`Téléchargement de la facture ${invoice.number} à implémenter`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Factures</h1>
            <p className="text-Beenaya-100 mt-1">
              Gérez vos factures et suivez les paiements
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-Beenaya-900 hover:bg-white/90"
            onClick={handleCreateInvoice}
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Stats */}
      <InvoiceStats 
        stats={{
          total: stats.all,
          draft: stats.draft,
          sent: stats.sent,
          overdue: stats.overdue,
          partially_paid: stats.partially_paid,
          paid: stats.paid,
          cancelled: stats.cancelled,
          totalAmount: statsData.totalAmount,
          overdueAmount: statsData.overdueAmount,
          paidAmount: statsData.paidAmount,
          remainingAmount: statsData.remainingAmount,
        }}
      />

      {/* Filters */}
      <InvoiceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="Beenaya-card">
        {/* Tabs */}
        <InvoiceTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={{
            all: stats.all,
            draft: stats.draft,
            sent: stats.sent,
            overdue: stats.overdue,
            partially_paid: stats.partially_paid,
            paid: stats.paid,
            cancelled: stats.cancelled,
          }}
        />

        {/* Table */}
        <InvoiceList
          invoices={invoices}
          onView={handleViewInvoice}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          onSend={handleSendInvoice}
          onRecordPayment={handleRecordPayment}
          onCreateCreditNote={handleCreateCreditNote}
          onDownload={handleDownloadInvoice}
        />
      </div>

      {/* Modals */}
      
      {/* Nouvelle facture */}
      <CreateInvoiceModal
        open={createInvoiceModalOpen}
        onOpenChange={setCreateInvoiceModalOpen}
        onSuccess={handleCreateInvoiceSuccess}
      />

      {/* Modales nécessitant une facture sélectionnée */}
      {selectedInvoice && (
        <>
          <RecordPaymentModal
            open={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            invoice={selectedInvoice}
            onSuccess={async (updatedInvoice) => {
              // Rafraîchir la liste et les stats en une seule fois
              await Promise.all([
                loadInvoices(),
                loadStats()
              ]);
              
              toast({
                title: "Succès",
                description: "Le paiement a été enregistré avec succès",
              });
            }}
          />
          
          <CreateCreditNoteModal
            open={creditNoteModalOpen}
            onOpenChange={setCreditNoteModalOpen}
            invoice={selectedInvoice}
            onSuccess={async (creditNote, originalInvoice) => {
              // Rafraîchir la liste et les stats en une seule fois
              await Promise.all([
                loadInvoices(),
                loadStats()
              ]);
              
              toast({
                title: "Succès",
                description: "L'avoir a été créé avec succès",
              });
            }}
          />

          <ValidateInvoiceModal
            open={validateInvoiceModalOpen}
            onOpenChange={setValidateInvoiceModalOpen}
            invoice={selectedInvoice}
            onSuccess={handleValidateInvoiceSuccess}
          />

          <DeleteInvoiceModal
            open={deleteInvoiceModalOpen}
            onOpenChange={setDeleteInvoiceModalOpen}
            invoice={selectedInvoice}
            onSuccess={handleDeleteInvoiceSuccess}
          />
        </>
      )}
    </div>
  );
}