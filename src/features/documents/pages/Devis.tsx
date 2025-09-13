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
import { toast } from "@/components/ui/use-toast";
import { quotesApi } from "../api/quotes";
import { Quote, QuoteStatus, QuoteFilters as FilterType, PaginatedQuotesResponse } from "../types/quotes.types";
import { useModalState } from "@/hooks/useModalState";

// Debug pour vérifier les états bloqués
if (typeof window !== 'undefined') {
  (window as any).debugQuotePage = () => {
    console.log('🔍 État des modales devis:', {
      sendQuoteModal: document.querySelector('[data-radix-dialog-overlay]'),
      modalOrphans: document.querySelectorAll('[data-radix-dialog-overlay]').length,
      bodyStyle: document.body.style.overflow,
      bodyPointerEvents: document.body.style.pointerEvents,
    });
  };
}

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


  // Delete quote
  const handleDeleteQuote = (quote: Quote) => {
    deleteQuoteModal.actions.open(quote);
  };

  // Gérer le succès de suppression - SOLUTION ADAPTÉE DES TIERS
  const handleDeleteQuoteSuccess = () => {
    try {
      console.log('🎉 Suppression réussie, fermeture de la modale en premier');
      
      // 🚀 FERMER D'ABORD la modale pour libérer l'UI (comme dans Tiers.tsx:337)
      deleteQuoteModal.actions.close();
      
      // Mise à jour optimiste - retirer le devis supprimé de la liste
      if (deleteQuoteModal.data?.id) {
        setQuotes(prevQuotes => 
          prevQuotes.filter(quote => quote.id !== deleteQuoteModal.data?.id)
        );
        
        // Mettre à jour les statistiques
        setStats(prevStats => ({
          ...prevStats,
          all: Math.max(0, prevStats.all - 1),
          [deleteQuoteModal.data?.status || 'draft']: Math.max(0, prevStats[deleteQuoteModal.data?.status as keyof typeof prevStats] - 1)
        }));
      }
      
      toast({
        title: "Devis supprimé avec succès",
        description: "Le devis a été définitivement supprimé",
        variant: 'default'
      });
      
      // 🔄 PUIS recharger APRÈS un délai pour éviter les conflits (comme dans Tiers.tsx:340)
      setTimeout(async () => {
        try {
          await loadQuotes();
          console.log('✅ Rechargement terminé avec succès après suppression');
        } catch (reloadError) {
          console.error('❌ Erreur lors du rechargement après suppression:', reloadError);
          // L'UI reste fonctionnelle même si le rechargement échoue
        }
      }, 100); // Délai minimal pour permettre à la modale de se fermer complètement
      
    } catch (error) {
      console.error("Erreur lors du traitement après suppression:", error);
      toast({
        title: "Attention",  
        description: "Une erreur s'est produite lors de la mise à jour",
        variant: "destructive",
      });
    }
  };

  // Download quote - FONCTIONNALITÉ TEMPORAIREMENT DÉSACTIVÉE
  const handleDownloadQuote = async (quote: Quote) => {
    toast({
      title: "Fonctionnalité temporairement indisponible",
      description: "L'export PDF est en cours de refonte et sera disponible prochainement",
      variant: "default",
    });
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
          onDelete={handleDeleteQuote}
          onDownload={handleDownloadQuote}
        />
      </div>

      {/* Modals */}
      
      {/* Modales avec nouvelle gestion useModalState - rendu toujours présent */}
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


      <DeleteQuoteModal
        open={deleteQuoteModal.isOpen}
        onOpenChange={(open) => {
          if (!open && !deleteQuoteModal.isSubmitting) {
            console.log('🚪 Fermeture sécurisée de la modale de suppression');
            deleteQuoteModal.actions.close();
            
            // 🛡️ NETTOYAGE des overlays orphelins (comme dans Tiers.tsx:368-380)
            setTimeout(() => {
              const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-radix-focus-guard], [data-radix-portal], [data-radix-dialog-overlay]');
              overlays.forEach(el => {
                if (el.parentNode) {
                  console.log('🧹 Suppression overlay orphelin:', el);
                  el.parentNode.removeChild(el);
                }
              });
              
              // Débloquer le scroll au cas où
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
              document.body.style.pointerEvents = '';
            }, 500); // Délai pour les microservices avec latence
            
            // 🔄 Recharger APRÈS fermeture complète si annulation
            setTimeout(async () => {
              try {
                await loadQuotes();
              } catch (reloadError) {
                console.error('❌ Erreur lors du rechargement après fermeture:', reloadError);
              }
            }, 150);
          }
        }}
        quote={deleteQuoteModal.data}
        onSuccess={handleDeleteQuoteSuccess}
      />
    </div>
  );
}