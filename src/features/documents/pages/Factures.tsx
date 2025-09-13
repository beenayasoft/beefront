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
import { InvoiceStats } from "../components/invoices/InvoiceStats";
import { InvoiceFilters } from "../components/invoices/InvoiceFilters";
import { InvoiceTabs } from "../components/invoices/InvoiceTabs";
import { InvoiceList } from "../components/invoices/InvoiceList";
import { RecordPaymentModal } from "../components/invoices/RecordPaymentModal";
import { CreateCreditNoteModal } from "../components/invoices/CreateCreditNoteModal";
import { ValidateInvoiceModal } from "../components/invoices/ValidateInvoiceModal";
import { DeleteInvoiceModal } from "../components/invoices/DeleteInvoiceModal";
import { toast } from "@/components/ui/use-toast";
import { 
  getInvoices, 
  getInvoiceStats, 
  validateInvoice, 
  recordPayment, 
  createCreditNote,
  deleteInvoice,
  generateInvoicePdf,
  InvoiceFilters as InvoiceFiltersType
} from "../api/invoices";
import { Invoice, InvoiceStatus, Payment } from "../types/invoices.types";

export default function Factures() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState<{from?: string; to?: string}>({});
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
  const [validateInvoiceModalOpen, setValidateInvoiceModalOpen] = useState(false);
  const [deleteInvoiceModalOpen, setDeleteInvoiceModalOpen] = useState(false);

  // Charger les factures depuis l'API
  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Préparer les filtres conformément à l'interface InvoiceFilters
      const filters: InvoiceFiltersType = {
        search: searchQuery || undefined,
        date_from: dateRange.from,
        date_to: dateRange.to,
        ordering: sortOrder === 'desc' ? `-${sortField}` : sortField,
      };
      
      // Filtrer par statut si nécessaire
      if (activeTab !== "all") {
        filters.status = activeTab as InvoiceStatus;
      } else if (statusFilter.length > 0) {
        filters.status = statusFilter[0] as InvoiceStatus; // Prendre le premier filtre de statut
      }
      
      const response = await getInvoices(page, 20, filters);
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
      console.log("💰 Montant encaissé (totalPaid):", invoiceStats.totalPaid);
      console.log("💰 Montant encaissé (paidAmount - legacy):", invoiceStats.paidAmount);
      
      setStats({
        all: invoiceStats.totalInvoices || invoiceStats.total,
        draft: invoiceStats.draftInvoices || invoiceStats.draft,
        sent: invoiceStats.sentInvoices || invoiceStats.sent,
        overdue: invoiceStats.overdueInvoices || invoiceStats.overdue,
        partially_paid: invoiceStats.partiallyPaidInvoices || invoiceStats.partially_paid,
        paid: invoiceStats.paidInvoices || invoiceStats.paid,
        cancelled: (invoiceStats.cancelledInvoices || invoiceStats.cancelled || 0) + (invoiceStats.creditNoteInvoices || invoiceStats.cancelled_by_credit_note || 0),
      });
      setStatsData({
        totalAmount: invoiceStats.totalAmountTtc || invoiceStats.totalAmount,
        overdueAmount: invoiceStats.overdueAmount,
        paidAmount: invoiceStats.totalPaid || invoiceStats.paidAmount,
        remainingAmount: invoiceStats.totalOutstanding || invoiceStats.remainingAmount,
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
  }, [activeTab, searchQuery, page, dateRange, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    loadStats();
  }, [invoices]);

  // Filter handlers
  const handleDateRangeChange = (from: string, to: string) => {
    setDateRange({ from, to });
    setPage(1); // Reset to first page
  };

  const handleStatusFilterChange = (statuses: string[]) => {
    setStatusFilter(statuses);
    setPage(1); // Reset to first page
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortField(field);
    setSortOrder(order);
    setPage(1); // Reset to first page
  };

  const handleExport = async () => {
    try {
      // Pour l'instant, on exporte la liste actuelle en CSV/Excel
      const csvContent = generateCSVFromInvoices(invoices);
      downloadCSVFile(csvContent, `factures-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const generateCSVFromInvoices = (invoices: Invoice[]): string => {
    const headers = ['Numéro', 'Client', 'Date création', 'Date échéance', 'Statut', 'Montant HT', 'Montant TTC', 'Montant payé'];
    const rows = invoices.map(invoice => [
      invoice.number,
      invoice.clientName,
      new Date(invoice.createdAt).toLocaleDateString('fr-FR'),
      invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : '',
      invoice.status,
      invoice.totalHt?.toString() || '0',
      invoice.totalTtc?.toString() || '0',
      invoice.amountPaid?.toString() || '0'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  const downloadCSVFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // View invoice details
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/factures/${invoice.id}`);
  };

  // Edit invoice
  const handleEditInvoice = (invoice: Invoice) => {
    navigate(`/factures/edit/${invoice.id}`);
  };

  // Create new invoice - naviguer vers le wizard de création
  const handleCreateInvoice = () => {
    navigate('/factures/nouvelle');
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

  // Download invoice PDF
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const pdfBlob = await generateInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoice.number}.pdf`;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Succès",
        description: `Le PDF de la facture ${invoice.number} a été téléchargé`,
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture",
        variant: "destructive",
      });
    }
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
        onDateRangeChange={handleDateRangeChange}
        onStatusFilterChange={handleStatusFilterChange}
        onSortChange={handleSortChange}
        onExport={handleExport}
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
          loading={loading}
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