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
  Copy,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuoteStats } from "../components/quotes/QuoteStats";
import { QuoteFilters } from "../components/quotes/QuoteFilters";
import { QuoteTabs } from "../components/quotes/QuoteTabs";
import { QuoteList } from "../components/quotes/QuoteList";
import { ValidateQuoteModal } from "../components/quotes/ValidateQuoteModal";
import { SendQuoteModal } from "../components/quotes/SendQuoteModal";
import { ConvertToInvoiceModal } from "../components/quotes/ConvertToInvoiceModal";
import { DeleteQuoteModal } from "../components/quotes/DeleteQuoteModal";
import { DuplicateQuoteModal } from "../components/quotes/DuplicateQuoteModal";
import { toast } from "@/components/ui/use-toast";
import { quotesApi } from "../api/quotes";
import { Quote, QuoteStatus, QuoteFilters as FilterType, PaginatedQuotesResponse } from "../types/quotes.types";

export default function Devis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    all: 0,
    draft: 0,
    pending_validation: 0,
    validated: 0,
    sent: 0,
    accepted: 0,
    rejected: 0,
    expired: 0,
    cancelled: 0,
  });
  const [statsData, setStatsData] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    acceptedAmount: 0,
    averageValue: 0,
  });
  
  // States for modals
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [validateQuoteModalOpen, setValidateQuoteModalOpen] = useState(false);
  const [sendQuoteModalOpen, setSendQuoteModalOpen] = useState(false);
  const [convertToInvoiceModalOpen, setConvertToInvoiceModalOpen] = useState(false);
  const [deleteQuoteModalOpen, setDeleteQuoteModalOpen] = useState(false);
  const [duplicateQuoteModalOpen, setDuplicateQuoteModalOpen] = useState(false);

  // Charger les devis depuis l'API
  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      // Préparer les paramètres
      const filters: FilterType = {
        search: searchQuery || undefined,
      };
      
      // Filtrer par statut si nécessaire
      if (activeTab !== "all") {
        filters.status = activeTab as QuoteStatus;
      }
      
      const response = await quotesApi.getQuotes(page, 10, filters);
      setQuotes(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error) {
      console.error("Erreur lors du chargement des devis:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les devis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques depuis l'API
  const loadStats = async () => {
    try {
      console.log("🔍 Chargement des statistiques des devis...");
      
      // Simulation des statistiques - à remplacer par un vrai appel API
      // const quoteStats = await quotesApi.getQuoteStats();
      
      // Calculer les statistiques à partir des devis chargés
      const totalQuotes = quotes.length;
      const draftQuotes = quotes.filter(q => q.status === 'draft').length;
      const sentQuotes = quotes.filter(q => q.status === 'sent').length;
      const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
      const rejectedQuotes = quotes.filter(q => q.status === 'rejected').length;
      const expiredQuotes = quotes.filter(q => q.status === 'expired').length;
      
      const totalAmount = quotes.reduce((sum, quote) => sum + (quote.totalTtc || 0), 0);
      const acceptedAmount = quotes
        .filter(q => q.status === 'accepted')
        .reduce((sum, quote) => sum + (quote.totalTtc || 0), 0);
      const pendingAmount = quotes
        .filter(q => ['sent', 'validated'].includes(q.status))
        .reduce((sum, quote) => sum + (quote.totalTtc || 0), 0);
      
      setStats({
        all: totalQuotes,
        draft: draftQuotes,
        pending_validation: quotes.filter(q => q.status === 'pending_validation').length,
        validated: quotes.filter(q => q.status === 'validated').length,
        sent: sentQuotes,
        accepted: acceptedQuotes,
        rejected: rejectedQuotes,
        expired: expiredQuotes,
        cancelled: quotes.filter(q => q.status === 'cancelled').length,
      });
      
      setStatsData({
        totalAmount,
        pendingAmount,
        acceptedAmount,
        averageValue: totalQuotes > 0 ? totalAmount / totalQuotes : 0,
      });
      
      console.log("✅ Statistiques des devis mises à jour avec succès");
    } catch (error) {
      console.error("❌ Erreur lors du chargement des statistiques:", error);
      // Afficher des stats par défaut en cas d'erreur
      setStats({
        all: 0,
        draft: 0,
        pending_validation: 0,
        validated: 0,
        sent: 0,
        accepted: 0,
        rejected: 0,
        expired: 0,
        cancelled: 0,
      });
      setStatsData({
        totalAmount: 0,
        pendingAmount: 0,
        acceptedAmount: 0,
        averageValue: 0,
      });
    }
  };

  // Charger les données au montage et lors des changements
  useEffect(() => {
    loadQuotes();
  }, [activeTab, searchQuery, page]);

  useEffect(() => {
    if (quotes.length > 0) {
      loadStats();
    }
  }, [quotes]);

  // View quote details
  const handleViewQuote = (quote: Quote) => {
    navigate(`/devis/${quote.id}`);
  };

  // Edit quote
  const handleEditQuote = (quote: Quote) => {
    navigate(`/devis/edit/${quote.id}`);
  };

  // Create new quote
  const handleCreateQuote = () => {
    navigate("/devis/nouveau");
  };

  // Validate quote
  const handleValidateQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setValidateQuoteModalOpen(true);
  };

  // Gérer le succès de validation
  const handleValidateQuoteSuccess = async (validatedQuote: Quote) => {
    // Rafraîchir la liste et les stats
    await loadQuotes();
    
    toast({
      title: "Succès",
      description: `Le devis ${validatedQuote.number} a été validé`,
    });
  };

  // Send quote
  const handleSendQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setSendQuoteModalOpen(true);
  };

  // Gérer le succès d'envoi
  const handleSendQuoteSuccess = async (sentQuote: Quote) => {
    // Rafraîchir la liste
    await loadQuotes();
    
    toast({
      title: "Succès",
      description: `Le devis ${sentQuote.number} a été envoyé`,
    });
  };

  // Convert to invoice
  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedQuote(quote);
    setConvertToInvoiceModalOpen(true);
  };

  // Gérer le succès de conversion
  const handleConvertToInvoiceSuccess = async (invoice: any) => {
    // Rafraîchir la liste
    await loadQuotes();
    
    toast({
      title: "Succès",
      description: `Le devis a été converti en facture`,
    });
    
    // Rediriger vers la facture créée
    if (invoice && invoice.id) {
      setTimeout(() => {
        navigate(`/factures/${invoice.id}`);
      }, 200);
    }
  };

  // Duplicate quote
  const handleDuplicateQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setDuplicateQuoteModalOpen(true);
  };

  // Gérer le succès de duplication
  const handleDuplicateQuoteSuccess = async (duplicatedQuote: Quote) => {
    // Rafraîchir la liste
    await loadQuotes();
    
    toast({
      title: "Succès",
      description: `Le devis a été dupliqué`,
    });
    
    // Rediriger vers le nouveau devis
    if (duplicatedQuote && duplicatedQuote.id) {
      setTimeout(() => {
        navigate(`/devis/edit/${duplicatedQuote.id}`);
      }, 200);
    }
  };

  // Delete quote
  const handleDeleteQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteQuoteModalOpen(true);
  };

  // Gérer le succès de suppression
  const handleDeleteQuoteSuccess = () => {
    // Rafraîchir la liste
    loadQuotes();
    
    toast({
      title: "Succès",
      description: "Le devis a été supprimé avec succès",
    });
  };

  // Download quote (placeholder)
  const handleDownloadQuote = async (quote: Quote) => {
    try {
      const pdfBlob = await quotesApi.generateQuotePdf(quote.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${quote.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le devis",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis</h1>
            <p className="text-benaya-100 mt-1">
              Gérez vos devis et suivez leur statut
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
            onClick={handleCreateQuote}
          >
            <Plus className="w-4 h-4" />
            Nouveau devis
          </Button>
        </div>
      </div>

      {/* Stats */}
      <QuoteStats 
        stats={{
          total: stats.all,
          draft: stats.draft,
          pending_validation: stats.pending_validation,
          validated: stats.validated,
          sent: stats.sent,
          accepted: stats.accepted,
          rejected: stats.rejected,
          expired: stats.expired,
          cancelled: stats.cancelled,
          totalAmount: statsData.totalAmount,
          pendingAmount: statsData.pendingAmount,
          acceptedAmount: statsData.acceptedAmount,
          averageValue: statsData.averageValue,
        }}
      />

      {/* Filters */}
      <QuoteFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="benaya-card">
        {/* Tabs */}
        <QuoteTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={{
            all: stats.all,
            draft: stats.draft,
            pending_validation: stats.pending_validation,
            validated: stats.validated,
            sent: stats.sent,
            accepted: stats.accepted,
            rejected: stats.rejected,
            expired: stats.expired,
            cancelled: stats.cancelled,
          }}
        />

        {/* Table */}
        <QuoteList
          quotes={quotes}
          loading={loading}
          onView={handleViewQuote}
          onEdit={handleEditQuote}
          onValidate={handleValidateQuote}
          onSend={handleSendQuote}
          onConvertToInvoice={handleConvertToInvoice}
          onDuplicate={handleDuplicateQuote}
          onDelete={handleDeleteQuote}
          onDownload={handleDownloadQuote}
        />
      </div>

      {/* Modals */}
      
      {/* Modales nécessitant un devis sélectionné */}
      {selectedQuote && (
        <>
          <ValidateQuoteModal
            open={validateQuoteModalOpen}
            onOpenChange={setValidateQuoteModalOpen}
            quote={selectedQuote}
            onSuccess={handleValidateQuoteSuccess}
          />
          
          <SendQuoteModal
            open={sendQuoteModalOpen}
            onOpenChange={setSendQuoteModalOpen}
            quote={selectedQuote}
            onSuccess={handleSendQuoteSuccess}
          />

          <ConvertToInvoiceModal
            open={convertToInvoiceModalOpen}
            onOpenChange={setConvertToInvoiceModalOpen}
            quote={selectedQuote}
            onSuccess={handleConvertToInvoiceSuccess}
          />

          <DuplicateQuoteModal
            open={duplicateQuoteModalOpen}
            onOpenChange={setDuplicateQuoteModalOpen}
            quote={selectedQuote}
            onSuccess={handleDuplicateQuoteSuccess}
          />

          <DeleteQuoteModal
            open={deleteQuoteModalOpen}
            onOpenChange={setDeleteQuoteModalOpen}
            quote={selectedQuote}
            onSuccess={handleDeleteQuoteSuccess}
          />
        </>
      )}
    </div>
  );
}