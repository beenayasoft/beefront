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
import { SendQuoteModal } from "../components/quotes/SendQuoteModal";
import { ConvertToInvoiceModal } from "../components/quotes/ConvertToInvoiceModal";
import { DeleteQuoteModal } from "../components/quotes/DeleteQuoteModal";
import { DuplicateQuoteModal } from "../components/quotes/DuplicateQuoteModal";
import { toast } from "@/components/ui/use-toast";
import { quotesApi } from "../api/quotes";
import { Quote, QuoteStatus, QuoteFilters as FilterType, PaginatedQuotesResponse } from "../types/quotes.types";
import { useModalState } from "@/hooks/useModalState";

export default function Devis() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState<{from?: string; to?: string}>({});
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // ✅ Statuts alignés avec le backend document-service
  const [stats, setStats] = useState({
    all: 0,
    draft: 0,
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
  
  // States for modals - Migration vers useModalState pour éviter les gels d'UI
  const sendQuoteModal = useModalState<Quote>();
  const convertToInvoiceModal = useModalState<Quote>();
  const deleteQuoteModal = useModalState<Quote>();
  const duplicateQuoteModal = useModalState<Quote>();

  // Charger les devis depuis l'API
  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      // Préparer les paramètres
      const filters: FilterType = {
        search: searchQuery || undefined,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        sortBy: sortField,
        sortOrder: sortOrder,
      };
      
      // Filtrer par statut si nécessaire
      if (activeTab !== "all") {
        filters.status = activeTab as QuoteStatus;
      } else if (statusFilter.length > 0) {
        filters.status = statusFilter[0] as QuoteStatus; // Prendre le premier filtre de statut
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
      
      const totalAmount = quotes.reduce((sum, quote) => sum + (parseFloat(quote.totalTtc) || 0), 0);
      const acceptedAmount = quotes
        .filter(q => q.status === 'accepted')
        .reduce((sum, quote) => sum + (parseFloat(quote.totalTtc) || 0), 0);
      const pendingAmount = quotes
        .filter(q => q.status === 'sent')
        .reduce((sum, quote) => sum + (parseFloat(quote.totalTtc) || 0), 0);
      
      console.log("📊 Statistiques calculées:", {
        totalQuotes,
        totalAmount,
        acceptedAmount,
        pendingAmount,
        sampleQuote: quotes[0]?.totalTtc
      });
      
      setStats({
        all: totalQuotes,
        draft: draftQuotes,
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
  }, [activeTab, searchQuery, page, dateRange, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    if (quotes.length > 0) {
      loadStats();
    }
  }, [quotes.length]);

  // View quote details
  const handleViewQuote = (quote: Quote) => {
    navigate(`/devis/${quote.id}`);
  };

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
      const csvContent = generateCSVFromQuotes(quotes);
      downloadCSVFile(csvContent, `devis-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
    }
  };

  const generateCSVFromQuotes = (quotes: Quote[]): string => {
    const headers = ['Numéro', 'Client', 'Projet', 'Date création', 'Date expiration', 'Statut', 'Montant HT', 'Montant TTC'];
    const rows = quotes.map(quote => [
      quote.number,
      quote.clientName,
      quote.projectName || '',
      new Date(quote.createdAt).toLocaleDateString('fr-FR'),
      quote.expiryDate ? new Date(quote.expiryDate).toLocaleDateString('fr-FR') : '',
      quote.status,
      quote.totalHt.toString(),
      quote.totalTtc.toString()
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
  };

  // Edit quote
  const handleEditQuote = (quote: Quote) => {
    navigate(`/devis/edit/${quote.id}`);
  };

  // Create new quote
  const handleCreateQuote = () => {
    navigate("/devis/nouveau");
  };


  // Send quote
  const handleSendQuote = (quote: Quote) => {
    console.log('📧 Ouverture modal envoi pour:', quote);
    sendQuoteModal.actions.open(quote);
  };

  // Gérer le succès d'envoi
  const handleSendQuoteSuccess = async (sentQuote: Quote) => {
    console.log('🎉 handleSendQuoteSuccess appelée pour:', sentQuote.number);
    
    // Mise à jour locale du statut au lieu de recharger toute la liste
    setQuotes(prevQuotes => 
      prevQuotes.map(quote => 
        quote.id === sentQuote.id 
          ? { ...quote, status: 'sent' as const }
          : quote
      )
    );
    
    toast({
      title: "Succès",
      description: `Le devis ${sentQuote.number} a été envoyé`,
    });
    
    console.log('🎉 handleSendQuoteSuccess terminée');
  };

  // Convert to invoice - ouvrir la modal
  const handleOpenConvertToInvoice = (quote: Quote) => {
    convertToInvoiceModal.actions.open(quote);
  };

  // Gérer la conversion (appelle l'API)
  const handleConvertToInvoice = async (formData: any) => {
    if (!convertToInvoiceModal.data) return;
    
    try {
      // Appeler l'API de conversion
      const invoice = await quotesApi.convertToInvoice(convertToInvoiceModal.data.id, formData);
      
      // Fermer la modal avec cleanup automatique
      convertToInvoiceModal.actions.close();
      
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
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la conversion du devis en facture",
        variant: "destructive",
      });
      console.error('Erreur lors de la conversion:', error);
    }
  };

  // Duplicate quote
  const handleDuplicateQuote = (quote: Quote) => {
    duplicateQuoteModal.actions.open(quote);
  };

  // Gérer le succès de duplication
  const handleDuplicateQuoteSuccess = async (duplicatedQuote: Quote) => {
    // Rafraîchir la liste
    await loadQuotes();
    
    toast({
      title: "Devis dupliqué avec succès",
      description: `Le devis ${duplicatedQuote.number} a été créé par duplication`,
      variant: 'default'
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
    deleteQuoteModal.actions.open(quote);
  };

  // Gérer le succès de suppression
  const handleDeleteQuoteSuccess = async () => {
    try {
      // La modal se ferme automatiquement avec cleanup
      
      // Rafraîchir la liste
      await loadQuotes();
      
      toast({
        title: "Devis supprimé avec succès",
        description: "Le devis a été définitivement supprimé",
        variant: 'default'
      });
    } catch (error) {
      console.error("Erreur lors du rechargement après suppression:", error);
      toast({
        title: "Attention",
        description: "Le devis a été supprimé mais la liste n'a pas pu être rafraîchie",
        variant: "destructive",
      });
    }
  };

  // Download quote with backend PDF generation
  const handleDownloadQuote = async (quote: Quote) => {
    try {
      console.log(`🔄 Téléchargement PDF backend pour le devis ${quote.number}...`);
      
      // Récupérer les paramètres d'apparence et infos tenant
      let appearanceSettings = null;
      let tenantInfo = null;
      
      try {
        const [settingsModule, tenantModule] = await Promise.all([
          import('@/lib/api/documentAppearance'),
          import('@/lib/api/tenant')
        ]);
        
        appearanceSettings = await settingsModule.documentAppearanceAPI.getAppearanceSettings();
        tenantInfo = await tenantModule.tenantApi.getCurrentTenantInfo();
        
        console.log('🎨 Paramètres récupérés pour PDF backend');
      } catch (settingsError) {
        console.warn('⚠️ Impossible de récupérer les paramètres:', settingsError);
      }
      
      // Préparer les données complètes pour le backend
      const pdfRequestData = {
        appearance_settings: appearanceSettings,
        tenant_info: tenantInfo,
        quote_data: {
          id: quote.id,
          number: quote.number,
          clientName: quote.clientName,
          projectName: quote.projectName,
          totalHt: quote.totalHt,
          totalVat: quote.totalVat,
          totalTtc: quote.totalTtc,
          items: quote.items,
          issueDate: quote.issueDate,
          expiryDate: quote.expiryDate,
          notes: quote.notes,
          termsAndConditions: quote.termsAndConditions
        }
      };
      
      console.log('📤 Envoi données complètes au backend pour PDF:', pdfRequestData);
      
      // Utiliser l'API backend avec tous les paramètres
      const pdfBlob = await quotesApi.exportQuoteToPdf(quote.id, pdfRequestData);
      
      // Vérifier que le blob est valide
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF vide ou invalide reçu du serveur');
      }
      
      console.log(`📄 PDF reçu - Taille: ${pdfBlob.size} bytes`);
      
      // Créer un blob avec le type MIME correct pour PDF
      const correctedBlob = new Blob([pdfBlob], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(correctedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devis-${quote.number.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer après un délai
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`✅ PDF backend téléchargé avec succès pour le devis ${quote.number}`);
      
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement:", error);
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
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Devis</h1>
            <p className="text-Beenaya-100 mt-1">
              Gérez vos devis et suivez leur statut
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-Beenaya-900 hover:bg-white/90"
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
        onDateRangeChange={handleDateRangeChange}
        onStatusFilterChange={handleStatusFilterChange}
        onSortChange={handleSortChange}
        onExport={handleExport}
      />

      {/* Main Content */}
      <div className="Beenaya-card">
        {/* Tabs */}
        <QuoteTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          counts={{
            all: stats.all,
            draft: stats.draft,
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
          onSend={handleSendQuote}
          onConvertToInvoice={handleOpenConvertToInvoice}
          onDuplicate={handleDuplicateQuote}
          onDelete={handleDeleteQuote}
          onDownload={handleDownloadQuote}
        />
      </div>

      {/* Modals */}
      
      {/* Modales avec nouvelle gestion useModalState */}
      {(sendQuoteModal.data || convertToInvoiceModal.data || duplicateQuoteModal.data || deleteQuoteModal.data) && (
        <>
          <SendQuoteModal
            open={sendQuoteModal.isOpen}
            onOpenChange={(open) => !open && sendQuoteModal.actions.close()}
            quote={sendQuoteModal.data}
            onSend={async (data: { recipient_email: string; message?: string }) => {
              try {
                console.log('📧 Début envoi devis:', sendQuoteModal.data?.id, data);
                if (!sendQuoteModal.data?.id) {
                  throw new Error('Aucun devis sélectionné');
                }
                await quotesApi.sendQuote(sendQuoteModal.data.id, data);
                console.log('📧 Envoi réussi');
                
                // Fermer le modal avec cleanup automatique
                sendQuoteModal.actions.close();
                
                // Toast simple sans autres actions
                toast({
                  title: "Succès",
                  description: `Le devis a été envoyé`,
                });
                
                console.log('📧 Traitement terminé');
              } catch (error) {
                console.error('Erreur lors de l\'envoi:', error);
                toast({
                  title: "Erreur",
                  description: "Impossible d'envoyer le devis",
                  variant: "destructive",
                });
              }
            }}
          />

          <ConvertToInvoiceModal
            open={convertToInvoiceModal.isOpen}
            onOpenChange={(open) => !open && convertToInvoiceModal.actions.close()}
            quote={convertToInvoiceModal.data}
            onConvert={handleConvertToInvoice}
          />

          <DuplicateQuoteModal
            open={duplicateQuoteModal.isOpen}
            onOpenChange={(open) => !open && duplicateQuoteModal.actions.close()}
            quote={duplicateQuoteModal.data}
            onSuccess={handleDuplicateQuoteSuccess}
          />

          <DeleteQuoteModal
            open={deleteQuoteModal.isOpen}
            onOpenChange={(open) => !open && deleteQuoteModal.actions.close()}
            quote={deleteQuoteModal.data}
            onSuccess={handleDeleteQuoteSuccess}
          />
        </>
      )}
    </div>
  );
}