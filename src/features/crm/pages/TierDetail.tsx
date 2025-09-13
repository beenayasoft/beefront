import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  Plus,
  AlertCircle,
  BarChart3,
  FileText,
  Tag,
  Users,
  Home,
  Search,
  Filter,
  Trash2,
  Check,
  Crown,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTierUtils } from "../components/tiers/useTierUtils";
import { tiersApi } from "../api";
import { TierEntrepriseEditDialog } from "../components/tiers/TierEntrepriseEditDialog";
import { TierParticulierEditDialog } from "../components/tiers/TierParticulierEditDialog";
import type { Tier, Opportunity, CreateOpportunityData } from "../types/crm.types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { OpportunityForm } from "../components/opportunities/OpportunityForm";
import { toast } from "@/hooks/use-toast";
import { crmApi } from "../api";
import { quotesService } from "@/features/documents/services/quotesService";
import { Quote } from "@/features/documents/types/quotes.types";
import { useFormatCurrency } from "@/contexts/CurrencyContext";
import QuoteCreateWizard from "@/features/documents/components/quotes/modern/QuoteCreateWizard";
import { useCurrency } from '@/contexts/CurrencyContext';
import { DeleteConfirmDialog } from "../components/tiers/DeleteConfirmDialog";
import { ContactEditDialog, ContactCreateDialog } from "../components/contacts";
import { AddressEditDialog, AddressCreateDialog } from "../components/addresses";
import { useModalState } from "@/hooks/useModalState";
import { forceCleanModalOrphans, debugModalState, isUIBlocked } from "@/utils/modalDebug";

// Types pour les données détaillées du backend
interface TierDetailData {
  id: string;
  nom: string;
  type: string[];
  siret?: string;
  tva?: string;
  relation: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  contacts?: Array<{
    id: string;
    prenom: string;
    nom: string;
    fonction?: string;
    email?: string;
    telephone?: string;
    contact_principal_devis: boolean;
    contact_principal_facture: boolean;
  }>;
  adresses?: Array<{
    id: string;
    libelle: string;
    rue: string;
    ville: string;
    code_postal: string;
    pays?: string;
    facturation: boolean;
  }>;
}

export default function TierDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  const formatCurrencyWithSymbol = useFormatCurrency();
  const { formatCurrency } = useCurrency();
  
  // Fonctions utilitaires pour les badges et l'affichage
  const getBadgeVariant = (flag: string) => {
    switch (flag) {
      case "client":
        return "default";
      case "fournisseur":
        return "secondary";
      case "sous_traitant":
        return "outline";
      case "prospect":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  const getDisplayName = (flag: string) => {
    switch (flag) {
      case "client":
        return "Client";
      case "fournisseur":
        return "Fournisseur";
      case "sous_traitant":
        return "Sous-traitant";
      case "prospect":
        return "Prospect";
      default:
        return flag.charAt(0).toUpperCase() + flag.slice(1);
    }
  };
  
  const [tierData, setTierData] = useState<TierDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  
  // Utilisation de useModalState pour éviter les freezes UI
  const quoteModal = useModalState();
  
  // MAD Idée de génie #2 : États pour chargement progressif et métriques
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(false);
  const [opportunitiesError, setOpportunitiesError] = useState<string | null>(null);
  const [opportunityMetrics, setOpportunityMetrics] = useState<{
    total: number;
    byStage: Record<string, number>;
    totalAmount: number;
    avgAmount: number;
  } | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'mock' | null>(null);

  // 🎯 États pour les devis
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [quoteMetrics, setQuoteMetrics] = useState<{
    total: number;
    totalAmount: number;
    avgAmount: number;
    byStatus: Record<string, number>;
    acceptanceRate: number;
  } | null>(null);

  // États pour les modales d'édition spécialisées
  const [editEntrepriseDialogOpen, setEditEntrepriseDialogOpen] = useState(false);
  const [editParticulierDialogOpen, setEditParticulierDialogOpen] = useState(false);

  // État pour la modale de suppression avec useModalState
  const deleteModal = useModalState<Tier>();

  // État pour la modale d'édition de contact
  const [contactEditModal, setContactEditModal] = useState<{
    open: boolean;
    contact: any;
  }>({ open: false, contact: null });

  // État pour la modale de création de contact
  const [contactCreateModal, setContactCreateModal] = useState(false);

  // États pour la pagination
  const [quotesCurrentPage, setQuotesCurrentPage] = useState(1);
  const [opportunitiesCurrentPage, setOpportunitiesCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // États pour la recherche et le filtrage
  const [opportunitiesSearchQuery, setOpportunitiesSearchQuery] = useState('');
  const [opportunitiesStatusFilter, setOpportunitiesStatusFilter] = useState<string>('all');
  const [quotesSearchQuery, setQuotesSearchQuery] = useState('');
  const [quotesStatusFilter, setQuotesStatusFilter] = useState<string>('all');

  // États pour les modales d'actions
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState<{
    title: string;
    message: string;
    icon: React.ReactNode;
  } | null>(null);

  // Déterminer le type d'entité
  const isEntreprise = tierData?.type?.includes('entreprise') || false;
  
  // 🎯 LOGIQUE MÉTIER : Les opportunités ne sont visibles que pour les clients et prospects
  const isClientOrProspect = ['client', 'prospect'].includes(tierData?.relation) || false;
  
  console.log('🔍 [TierDetail] Logique métier opportunités:', {
    tierNom: tierData?.nom,
    relation: tierData?.relation,
    isClientOrProspect,
    raisonAffichage: isClientOrProspect ? 'Client ou prospect = opportunités visibles' : 'Ni client ni prospect = opportunités cachées'
  });

  // Créer un objet Tier compatible pour les modales d'édition
  const tierForEdit: Tier | null = tierData ? {
    id: tierData.id,
    name: tierData.nom,
    type: [tierData.relation], // Convertir relation unique en array pour compatibilité
    siret: tierData.siret || '',
    contact: '', // Sera recalculé par la modale
    email: '', // Sera recalculé par la modale
    phone: '', // Sera recalculé par la modale
    address: '', // Sera recalculé par la modale
    status: tierData.is_deleted ? 'inactive' : 'active'
  } : null;

  useEffect(() => {
    if (!id) {
      setError("ID du tier manquant");
      setLoading(false);
      return;
    }

    const fetchTierData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer le tenant_id du localStorage
        const tenantId = localStorage.getItem('tenantId');

        console.log("Tentative de récupération du tier avec ID:", id);
        console.log("Tenant ID utilisé:", tenantId);

        // Utiliser l'API client au lieu d'un fetch brut pour bénéficier des intercepteurs
        const response = await tiersApi.getTierDetail(id);

        // La réponse est déjà traitée par l'API client
        if (!response) {
          throw new Error('Réponse vide reçue de l\'API');
        }
        
        console.log("Données tier reçues:", response);

        // Vérifier la structure des données retournées
        console.log("Structure de l'API:", {
          onglets: response.onglets ? "Présent" : "Absent",
          contacts: response.onglets?.contacts ? `Présent (${response.onglets.contacts.length} contacts)` : "Absent",
          adresses: response.onglets?.infos?.adresses ? `Présent (${response.onglets.infos.adresses.length} adresses)` : "Absent",
        });

        // Adapter le format de données pour notre composant
        const adaptedData = {
          id: response.id,
          nom: response.nom,
          type: response.type,
          relation: response.relation,
          siret: response.siret,
          tva: response.tva,
          is_deleted: response.is_deleted,
          created_at: response.created_at,
          updated_at: response.updated_at,
          // Extraire les données des onglets pour faciliter l'accès
          contacts: response.onglets?.contacts || [],
          adresses: response.onglets?.infos?.adresses || [],
          activites: response.onglets?.activites || []
        };

        console.log("🔍 DEBUG CONTACTS - Données tier adaptées:", adaptedData);
        console.log("🔍 DEBUG CONTACTS - Structure complète des contacts:", JSON.stringify(adaptedData.contacts, null, 2));
        
        // Debug spécifique pour les contacts
        if (adaptedData.contacts && adaptedData.contacts.length > 0) {
          adaptedData.contacts.forEach((contact, index) => {
            console.log(`🔍 Contact ${index}:`, {
              id: contact.id,
              nom: contact.nom,
              prenom: contact.prenom,
              email: contact.email,
              telephone: contact.telephone,
              fonction: contact.fonction,
              contactPrincipalDevis: contact.contact_principal_devis || contact.is_contact_principal_devis,
              contactPrincipalFacture: contact.contact_principal_facture || contact.is_contact_principal_facture
            });
          });
        }
        
        setTierData(adaptedData);
        
        // MAD Chargement progressif intelligent des opportunités
        if (id) {
          loadOpportunitiesProgressively(id);
          loadQuotesProgressively(id);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du tier:", err);

        // Message d'erreur plus détaillé et instructions pour l'utilisateur
        let errorMessage = "Impossible de charger les détails du tier.";

        if (err instanceof Error) {
          errorMessage += ` Détail: ${err.message}`;
        }

        if (err.response?.status === 400) {
          errorMessage += " L'ID du tier est peut-être invalide ou le tier n'existe pas dans cet espace de travail.";
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          errorMessage += " Vous n'avez peut-être pas les permissions nécessaires ou votre session a expiré.";
        }

        setError(errorMessage);

        // Notification visible pour l'utilisateur
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTierData();
  }, [id]);

  // MAD Idée de génie #2 : Fonction de chargement progressif des opportunités
  const loadOpportunitiesProgressively = async (tierId: string) => {
    console.log('🔍 [TierDetail] loadOpportunitiesProgressively - tierId reçu:', tierId);
    
    setOpportunitiesLoading(true);
    setOpportunitiesError(null);
    
    try {
      console.log('🔄 [TierDetail] Appel de opportunityService.getOpportunitiesByTier avec tierId:', tierId);
      
      const result = await crmApi.opportunities.getOpportunitiesByClient(tierId);
      
      console.log('✅ [TierDetail] Résultat reçu:', {
        count: result.length,
        tierIdFilter: tierId,
        opportunities: result.map(opp => ({
          id: opp.id,
          name: opp.name,
          tierId: opp.tierId,
          tierName: opp.tierName
        }))
      });
      
      // ✅ Utiliser directement les opportunités de l'API (déjà filtrées côté backend)
      setOpportunities(result);
      
      // Calculer les métriques à partir des opportunités chargées
      if (result.length > 0) {
        // Debug : vérifier les types des données
        console.log('🔍 [TierDetail] Debug opportunités reçues:', {
          count: result.length,
          firstOpportunity: result[0],
          estimatedAmounts: result.map(opp => ({
            id: opp.id,
            amount: opp.estimatedAmount,
            type: typeof opp.estimatedAmount,
            stage: opp.stage
          }))
        });
        
        // Calculer le montant total avec validation des types
        const totalAmount = result.reduce((sum, opp) => {
          const amount = typeof opp.estimatedAmount === 'number' 
            ? opp.estimatedAmount 
            : parseFloat(String(opp.estimatedAmount) || '0');
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        const avgAmount = result.length > 0 ? totalAmount / result.length : 0;
        
        // Calculer les stats par stage
        const stageStats = result.reduce((acc, opp) => {
          const stage = opp.stage || 'unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('📊 [TierDetail] Métriques calculées:', {
          total: result.length,
          totalAmount,
          avgAmount,
          stageStats
        });
        
        setOpportunityMetrics({
          total: result.length,
          byStage: stageStats,
          totalAmount: Math.round(totalAmount * 100) / 100, // Arrondir à 2 décimales
          avgAmount: Math.round(avgAmount * 100) / 100 // Arrondir à 2 décimales
        });
      } else {
        setOpportunityMetrics({
          total: 0,
          byStage: {},
          totalAmount: 0,
          avgAmount: 0
        });
      }
      
      setDataSource('api');
      
      // Réinitialiser la page courante si nécessaire
      setOpportunitiesCurrentPage(1);
      
    } catch (error) {
      console.error('❌ [TierDetail] Erreur lors du chargement des opportunités:', error);
      setOpportunitiesError(error instanceof Error ? error.message : 'Erreur de chargement');
      setOpportunities([]);
      setOpportunityMetrics({
        total: 0,
        byStage: {},
        totalAmount: 0,
        avgAmount: 0
      });
    } finally {
      setOpportunitiesLoading(false);
    }
  };

  // 🎯 Fonction de chargement des devis
  const loadQuotesProgressively = async (tierId: string) => {
    console.log('🎯 [TierDetail] loadQuotesProgressively - tierId reçu:', tierId);
    
    setQuotesLoading(true);
    setQuotesError(null);
    
    try {
      console.log('🔄 [TierDetail] Appel de quotesService.getQuotesByTier avec tierId:', tierId);
      
      const result = await quotesService.getQuotesByTier(tierId, {
        progressive: true,
        includeMetrics: true,
      });
      
      console.log('✅ [TierDetail] Résultat devis reçu:', {
        count: result.quotes.length,
        source: result.source,
        tierIdFilter: tierId,
        quotes: result.quotes.map(quote => ({
          id: quote.id,
          number: quote.number,
          tier: quote.tier,
          project_name: quote.project_name,
          status: quote.status,
          total_ttc: quote.total_ttc,
        })),
      });

      // Note: Pas besoin de filtrage local car le filtrage par tier se fait automatiquement
      // au niveau backend via les schémas PostgreSQL multi-tenant
      console.log('🔍 [TierDetail] Devis reçus depuis API:', result.quotes.length);

      setQuotes(result.quotes);
      setQuoteMetrics(result.metrics);
      setQuotesError(null);
      
      // Réinitialiser la page courante si nécessaire
      setQuotesCurrentPage(1);
      
    } catch (error) {
      console.error('❌ [TierDetail] Erreur lors du chargement des devis:', error);
      setQuotesError('Erreur lors du chargement des devis');
      setQuotes([]);
      setQuoteMetrics(null);
    } finally {
      setQuotesLoading(false);
    }
  };

  // Gérer la création réussie d'un devis
  const handleQuoteCreated = async (quoteId: string) => {
    try {
      console.log("✅ Devis créé avec succès, ID:", quoteId);
      
      // Afficher une notification de succès
      toast({
        title: "Devis créé",
        description: "Le devis a été créé avec succès",
      });
      
      // Fermer le formulaire avec useModalState
      quoteModal.actions.close();
      
      // Recharger les devis de ce tier pour afficher le nouveau
      if (id) {
        try {
          await loadQuotesProgressively(id);
        } catch (refreshError) {
          console.warn("⚠️ Erreur lors du rechargement des devis après création:", refreshError);
        }
      }
      
    } catch (error) {
      console.error("❌ Erreur lors du traitement post-création:", error);
    }
  };

  // Gérer l'annulation de la création de devis
  const handleQuoteCancel = () => {
    console.log('🚪 TierDetail.handleQuoteCancel appelé');
    
    // Diagnostic avant fermeture
    const beforeState = debugModalState();
    console.log('📊 État avant fermeture:', beforeState);
    
    // Utilisation de useModalState pour éviter les freezes
    quoteModal.actions.close();
    console.log('✅ TierDetail.quoteModal.actions.close() appelé');
    
    // Diagnostic après fermeture avec délai
    setTimeout(() => {
      const afterState = debugModalState();
      console.log('📊 État après fermeture:', afterState);
      
      const blockStatus = isUIBlocked();
      if (blockStatus.blocked) {
        console.error('🚨 UI BLOQUÉE après fermeture!', blockStatus.details);
        console.log('🧹 Nettoyage d\'urgence...');
        forceCleanModalOrphans();
      } else {
        console.log('✅ UI libre après fermeture');
      }
    }, 500);
  };

  // Gestionnaire pour l'édition selon le type
  const handleEdit = () => {
    if (!tierData) return;
    
    if (isEntreprise) {
      setEditEntrepriseDialogOpen(true);
    } else {
      setEditParticulierDialogOpen(true);
    }
  };

  // Gestionnaire de succès après édition
  const handleEditSuccess = async () => {
    // Recharger les données après modification
    if (id) {
      const response = await fetch(`http://localhost:8000/api/tiers/${id}/vue_360/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTierData(data);
      }
    }
  };

  // Créer une nouvelle opportunité pour ce tiers
  const handleCreateOpportunity = () => {
    setFormDialogOpen(true);
  };

  // Gestionnaires pour les actions avec modales informatives
  const handleCallAction = () => {
    setActionModalContent({
      title: "Fonction d'appel en développement",
      message: "Cette fonctionnalité sera bientôt disponible ! Nous travaillons actuellement sur l'intégration des appels téléphoniques pour améliorer votre expérience. En attendant, vous pouvez contacter ce tiers en utilisant les informations disponibles dans l'onglet 'Contacts'.",
      icon: <Phone className="h-12 w-12 text-blue-500 mx-auto mb-4" />
    });
    setActionModalOpen(true);
  };

  const handleEmailAction = () => {
    setActionModalContent({
      title: "Fonction d'email en développement",
      message: "Cette fonctionnalité sera bientôt disponible ! Nous préparons une intégration complète pour l'envoi d'emails directement depuis Beenaya. En attendant, vous pouvez utiliser les adresses email disponibles dans l'onglet 'Contacts' pour contacter ce tiers.",
      icon: <Mail className="h-12 w-12 text-green-500 mx-auto mb-4" />
    });
    setActionModalOpen(true);
  };

  const handleQuoteAction = () => {
    quoteModal.actions.open();
  };

  const handleMapAction = () => {
    setActionModalContent({
      title: "Fonction de carte en développement",
      message: "Cette fonctionnalité sera bientôt disponible ! Nous préparons une intégration avec des services de cartographie pour localiser facilement vos tiers. En attendant, vous pouvez utiliser les adresses disponibles dans l'onglet 'Adresses' pour vous rendre chez ce tiers.",
      icon: <MapPin className="h-12 w-12 text-purple-500 mx-auto mb-4" />
    });
    setActionModalOpen(true);
  };

  const handleDeleteAction = () => {
    if (!tierData) return;
    
    // Créer un objet Tier compatible pour la modale de suppression
    const tierForDelete: Tier = {
      id: tierData.id,
      nom: tierData.nom,
      type: tierData.type,
      relation: tierData.relation,
      siret: tierData.siret || '',
      tva: tierData.tva || '',
      is_deleted: tierData.is_deleted,
      created_at: tierData.created_at,
      updated_at: tierData.updated_at,
      contacts: tierData.contacts || [],
      adresses: tierData.adresses || []
    };
    
    console.log(`🗑️ Ouverture de la modale de suppression pour : ${tierData.nom}`);
    deleteModal.actions.open(tierForDelete);
  };

  // Confirmer la suppression d'un tiers
  const confirmDelete = async () => {
    if (!deleteModal.data || deleteModal.isSubmitting) {
      console.warn('⚠️ Suppression déjà en cours ou aucune donnée - ignorée');
      return;
    }
    
    try {
      deleteModal.actions.setSubmitting(true);
      await tiersApi.deleteTier(deleteModal.data.id);
      
      console.log(`✅ Tier ${deleteModal.data.nom} supprimé avec succès`);
      
      // Fermer la modale
      deleteModal.actions.close();
      
      // Naviguer vers la liste des tiers après suppression
      setTimeout(() => {
        navigate('/tiers');
      }, 100);
      
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      toast({
        title: "Erreur de suppression",
        description: "Une erreur est survenue lors de la suppression du tiers",
        variant: "destructive",
      });
    } finally {
      deleteModal.actions.setSubmitting(false);
    }
  };

  // Gérer la fermeture de la modale de suppression
  const handleDeleteDialogClose = (open: boolean) => {
    if (!open && !deleteModal.isSubmitting) {
      console.log('🚪 Fermeture sécurisée de la modale de suppression');
      deleteModal.actions.close();
    }
  };

  // Gérer l'édition d'un contact
  const handleEditContact = (contact: any) => {
    console.log('✏️ Édition du contact:', contact);
    setContactEditModal({
      open: true,
      contact: contact
    });
  };

  // Gérer le succès de modification d'un contact
  const handleContactEditSuccess = async () => {
    console.log('🎉 Contact modifié avec succès');
    setContactEditModal({ open: false, contact: null });
    await reloadTierData();
  };

  // Gérer le succès de création d'un contact
  const handleContactCreateSuccess = async () => {
    console.log('🎉 Contact créé avec succès');
    await reloadTierData();
  };

  // États pour la gestion des adresses
  const [addressEditModal, setAddressEditModal] = useState<{
    open: boolean;
    address: any | null;
  }>({
    open: false,
    address: null
  });

  const [addressCreateModal, setAddressCreateModal] = useState<{
    open: boolean;
  }>({
    open: false
  });

  // Gérer l'édition d'une adresse
  const handleEditAddress = (address: any) => {
    console.log('✏️ Édition de l\'adresse:', address);
    setAddressEditModal({
      open: true,
      address: address
    });
  };

  // Gérer le succès de modification d'une adresse
  const handleAddressEditSuccess = async () => {
    console.log('🎉 Adresse modifiée avec succès');
    setAddressEditModal({ open: false, address: null });
    await reloadTierData();
  };

  // Gérer le succès de création d'une adresse
  const handleAddressCreateSuccess = async () => {
    console.log('🎉 Adresse créée avec succès');
    setAddressCreateModal({ open: false });
    await reloadTierData();
  };

  // Fonction utilitaire pour recharger les données du tier
  const reloadTierData = async () => {
    if (!id) return;

    try {
      const response = await tiersApi.getTierDetail(id);
      
      // Adapter les données comme dans le useEffect principal
      const adaptedData = {
        id: response.id,
        nom: response.nom,
        type: response.type,
        relation: response.relation,
        siret: response.siret,
        tva: response.tva,
        is_deleted: response.is_deleted,
        created_at: response.created_at,
        updated_at: response.updated_at,
        contacts: response.onglets?.contacts || [],
        adresses: response.onglets?.infos?.adresses || [],
        activites: response.onglets?.activites || []
      };
      
      console.log('🔄 Données tier rechargées après action sur contact:', adaptedData);
      setTierData(adaptedData);
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des données tier:', error);
      // Fallback: rechargement complet si l'API échoue
      window.location.reload();
    }
  };

  // Gérer l'ouverture de la création de contact
  const handleCreateContact = () => {
    console.log('✨ Ouverture de la création de contact pour:', tierData?.nom);
    setContactCreateModal(true);
  };

  // Gérer la fermeture de la modale d'édition de contact
  const handleContactEditClose = (open: boolean) => {
    if (!open) {
      setContactEditModal({ open: false, contact: null });
    }
  };

  // Gérer la soumission du formulaire d'opportunité
  const handleFormSubmit = async (formData: Partial<Opportunity>) => {
    try {
      console.log("MAD Phase 3 : Création d'opportunité via service intelligent:", formData);
      
      // Convertir les données camelCase vers snake_case pour l'API
      const opportunityData: CreateOpportunityData = {
        name: formData.name!,
        tier: formData.tierId!,
        stage: formData.stage!,
        estimated_amount: formData.estimatedAmount!,
        probability: formData.probability!,
        expected_close_date: formData.expectedCloseDate!,
        source: formData.source!,
        description: formData.description,
        assigned_to: formData.assignedTo || undefined,
      };
      
      console.log("📤 Données converties vers snake_case:", opportunityData);
      
      // Créer l'opportunité via le service intelligent
      const createdOpportunity = await crmApi.opportunities.createOpportunity(opportunityData);
      
      console.log("✅ Opportunité créée avec succès:", createdOpportunity);
      
      // Vérifier que l'opportunité a bien été créée
      if (!createdOpportunity || !createdOpportunity.id) {
        throw new Error("L'opportunité n'a pas été créée correctement");
      }
      
      // Afficher une notification de succès
      toast({
        title: "Opportunité créée",
        description: `L'opportunité "${createdOpportunity.name}" a été créée avec succès`,
      });
      
      // Fermer le formulaire
      setFormDialogOpen(false);
      
      // Recharger les opportunités de ce tier pour afficher la nouvelle
      if (id) {
        try {
          await loadOpportunitiesProgressively(id);
        } catch (reloadError) {
          console.error("⚠️ Erreur lors du rechargement des opportunités (non critique):", reloadError);
          // Ne pas faire échouer toute l'opération pour le rechargement
        }
      }
      
      // Optionnel : Navigation vers la page des opportunités générales
      // navigate(`/opportunities`);
      
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'opportunité:", error);
      
      // Afficher une notification d'erreur
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création",
        variant: "destructive",
      });
      
      // Ne pas fermer le formulaire pour permettre à l'utilisateur de corriger
    }
  };

  // Fonctions utilitaires pour la pagination
  const getPaginatedData = <T,>(data: T[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    
    return {
      items: paginatedItems,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  };

  const createPaginationComponent = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              className={currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Fonctions utilitaires pour la traduction des statuts
  const getOpportunityStatusFrench = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'Nouvelle',
      'needs_analysis': 'Analyse des besoins',
      'negotiation': 'Négociation',
      'won': 'Gagnée',
      'lost': 'Perdue'
    };
    return statusMap[status] || status;
  };

  const getQuoteStatusFrench = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Brouillon',
      'sent': 'Envoyé',
      'accepted': 'Accepté',
      'rejected': 'Refusé',
      'expired': 'Expiré',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  // Fonctions de filtrage
  const filterOpportunities = (opportunities: Opportunity[]) => {
    return opportunities.filter(opportunity => {
      // Filtrage par recherche
      const matchesSearch = !opportunitiesSearchQuery || 
        opportunity.name.toLowerCase().includes(opportunitiesSearchQuery.toLowerCase()) ||
        (opportunity.description && opportunity.description.toLowerCase().includes(opportunitiesSearchQuery.toLowerCase()));
      
      // Filtrage par statut
      const matchesStatus = opportunitiesStatusFilter === 'all' || opportunity.stage === opportunitiesStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filterQuotes = (quotes: Quote[]) => {
    return quotes.filter(quote => {
      // Filtrage par recherche
      const matchesSearch = !quotesSearchQuery || 
        quote.number.toLowerCase().includes(quotesSearchQuery.toLowerCase()) ||
        (quote.project_name && quote.project_name.toLowerCase().includes(quotesSearchQuery.toLowerCase()));
      
      // Filtrage par statut
      const matchesStatus = quotesStatusFilter === 'all' || quote.status === quotesStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Données filtrées et paginées
  const filteredOpportunities = filterOpportunities(opportunities);
  const filteredQuotes = filterQuotes(quotes);
  const paginatedQuotes = getPaginatedData(filteredQuotes, quotesCurrentPage);
  const paginatedOpportunities = getPaginatedData(filteredOpportunities, opportunitiesCurrentPage);

  // Réinitialiser les pages lors des changements de filtres
  useEffect(() => {
    setOpportunitiesCurrentPage(1);
  }, [opportunitiesSearchQuery, opportunitiesStatusFilter]);

  useEffect(() => {
    setQuotesCurrentPage(1);
  }, [quotesSearchQuery, quotesStatusFilter]);

  // Rendre les fonctions de débogage disponibles globalement
  useEffect(() => {
    (window as any).emergencyUnblockUI = () => {
      console.log('🚨 Déblocage d\'urgence de l\'UI...');
      forceCleanModalOrphans();
      const status = isUIBlocked();
      console.log('📊 État après déblocage:', status);
    };
    (window as any).debugModalState = debugModalState;
    (window as any).isUIBlocked = isUIBlocked;
    (window as any).forceCleanModalOrphans = forceCleanModalOrphans;
  }, []);

  // Si en cours de chargement, afficher un spinner
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/tiers')}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tierData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Tier non trouvé</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/tiers')}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* En-tête adaptatif style ancien - Full width */}
        <div className="mb-6">
          {/* En-tête principal avec style Beenaya */}
          <div className={`Beenaya-card text-white ${isEntreprise ? 'Beenaya-gradient' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={() => navigate("/tiers")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {isEntreprise ? (
                      <Building className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                    <h1 className="text-2xl font-bold">{tierData.nom}</h1>
                  </div>
                </div>
                <div className="ml-12 mt-2 flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {isEntreprise ? 'Entreprise' : 'Particulier'}
                  </Badge>
                  {tierData.relation && (
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {getDisplayName(tierData.relation)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 ml-6 flex gap-3">
                <Button 
                  className="gap-2 bg-white text-Beenaya-900 hover:bg-white/90 px-8"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </Button>
                <Button 
                  variant="destructive"
                  className="gap-2 bg-red-600 text-white hover:bg-red-700 px-6"
                  onClick={handleDeleteAction}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Onglets avec actions rapides */}
            <Tabs defaultValue="identity" className="w-full">
              <div className="flex items-start justify-between gap-6 mb-6">
                <TabsList className="grid grid-cols-4 flex-1">
                  <TabsTrigger value="identity" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Identité
                  </TabsTrigger>
                  <TabsTrigger value="contacts" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contacts
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Adresses
                  </TabsTrigger>
                  <TabsTrigger value="quotes" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Devis
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Contenu des onglets */}
              <TabsContent value="identity" className="mt-6">
                <Card className="Beenaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {isEntreprise ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      Informations d'identité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {isEntreprise ? 'Raison sociale' : 'Nom'}
                        </div>
                        <div className="font-medium text-lg">{tierData.nom || 'Non renseigné'}</div>
                      </div>
                      
                      {isEntreprise && (
                        <>
                          <div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">SIRET</div>
                            <div className="font-medium">{tierData.siret || "Non renseigné"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">N° TVA</div>
                            <div className="font-medium">{tierData.tva || "Non renseigné"}</div>
                          </div>
                        </>
                      )}
                      
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Type d'entité</div>
                        <div className="font-medium">
                          <Badge variant={isEntreprise ? "default" : "secondary"}>
                            {isEntreprise ? '🏢 Entreprise' : '👤 Particulier'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Date de création</div>
                        <div className="font-medium">
                          {new Date(tierData.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">Dernière modification</div>
                        <div className="font-medium">
                          {new Date(tierData.updated_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="mt-6">
                <Card className="Beenaya-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Contacts ({tierData.contacts?.length || 0})
                        </CardTitle>
                        <p className="text-sm text-neutral-500 mt-1">
                          Informations de contact et personnes à contacter pour ce tiers
                        </p>
                      </div>
                      <Button 
                        onClick={handleCreateContact}
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="h-4 w-4" />
                        Nouveau contact
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tierData.contacts && tierData.contacts.length > 0 ? (
                      <div className="space-y-6">
                        {tierData.contacts.map((contact, index) => (
                          <div key={contact.id} className="p-6 border rounded-lg bg-neutral-50/50 dark:bg-neutral-800/50">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-semibold">
                                  {contact.prenom || contact.nom ? `${contact.prenom || ''} ${contact.nom || ''}`.trim() : 'Contact sans nom'}
                                </h4>
                                {(contact.contact_principal_devis || contact.is_contact_principal_devis) && (
                                  <Badge variant="default" className="text-xs">Principal</Badge>
                                )}
                                {(contact.contact_principal_facture || contact.is_contact_principal_facture) && (
                                  <Badge variant="outline" className="text-xs">Facturation</Badge>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditContact(contact)}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </Button>
                            </div>
                            
                            {/* Affichage explicite de tous les champs de contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Fonction</div>
                                <div className="font-medium">
                                  {contact.fonction || <span className="text-neutral-400 italic">Non renseignée</span>}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Email</div>
                                <div className="font-medium">
                                  {contact.email ? (
                                    <a href={`mailto:${contact.email}`} className="text-Beenaya-600 hover:underline flex items-center gap-1">
                                      <Mail className="h-4 w-4" />
                                      {contact.email}
                                    </a>
                                  ) : (
                                    <span className="text-neutral-400 italic">Non renseigné</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Téléphone</div>
                                <div className="font-medium">
                                  {contact.telephone ? (
                                    <a href={`tel:${contact.telephone.replace(/\s/g, "")}`} className="text-Beenaya-600 hover:underline flex items-center gap-1">
                                      <Phone className="h-4 w-4" />
                                      {contact.telephone}
                                    </a>
                                  ) : (
                                    <span className="text-neutral-400 italic">Non renseigné</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Contact pour devis</div>
                                <div className="font-medium">
                                  {(contact.contact_principal_devis || contact.is_contact_principal_devis) ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <Check className="h-4 w-4" />
                                      Oui
                                    </span>
                                  ) : (
                                    <span className="text-neutral-400">Non</span>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Contact pour facturation</div>
                                <div className="font-medium">
                                  {(contact.contact_principal_facture || contact.is_contact_principal_facture) ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <Check className="h-4 w-4" />
                                      Oui
                                    </span>
                                  ) : (
                                    <span className="text-neutral-400">Non</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Suggestion intelligente d'ajout si peu de contacts */}
                        {tierData.contacts.length === 1 && (
                          <div className="mt-4 p-4 border-2 border-dashed border-green-200 dark:border-green-700 rounded-lg text-center bg-green-50/50 dark:bg-green-950/10">
                            <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">
                              <strong>Astuce :</strong> {isEntreprise 
                                ? 'Les entreprises ont souvent plusieurs contacts (RH, Finance, Technique...)' 
                                : 'Les particuliers peuvent avoir des contacts supplémentaires (conjoint, conseiller...)'
                              }
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCreateContact}
                              className="gap-2 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400"
                            >
                              <Plus className="h-4 w-4" />
                              Ajouter un autre contact
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="relative">
                          <Users className="h-20 w-20 mx-auto mb-4 text-green-200 dark:text-green-800" />
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                            <Plus className="h-4 w-4" />
                          </div>
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-neutral-900 dark:text-neutral-100">
                          Aucun contact enregistré
                        </h3>
                        <p className="text-sm mb-6 max-w-md mx-auto text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {isEntreprise 
                            ? 'Ajoutez des contacts pour cette entreprise (directeur, comptable, responsable technique...)' 
                            : 'Ajoutez des informations de contact pour ce particulier (lui-même, conjoint, personne de confiance...)'
                          }
                        </p>
                        <div className="space-y-3">
                          <Button 
                            onClick={handleCreateContact}
                            className="gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                          >
                            <Plus className="h-4 w-4" />
                            Créer le premier contact
                          </Button>
                          <p className="text-xs text-neutral-400">
                            💡 Vous pourrez ajouter d'autres contacts plus tard
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="addresses" className="mt-6">
                <Card className="Beenaya-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <MapPin className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Adresses ({tierData.adresses?.length || 0})
                          </CardTitle>
                          <p className="text-sm text-neutral-500 mt-1">
                            Gérez toutes les adresses de {tierData.type === 'entreprise' ? 'l\'entreprise' : 'cette personne'}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setAddressCreateModal({ open: true })}
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Nouvelle adresse
                        <div className="ml-1 opacity-60">
                          {tierData.type === 'entreprise' ? '🏢' : '🏠'}
                        </div>
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {tierData.adresses && tierData.adresses.length > 0 ? (
                      <div className="space-y-4">
                        {tierData.adresses.map((adresse) => (
                          <div 
                            key={adresse.id} 
                            className="group p-5 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:-translate-y-1 transition-all duration-200 bg-gradient-to-r from-white to-neutral-50/50 dark:from-neutral-800 dark:to-neutral-800/50 cursor-pointer"
                            onClick={() => handleEditAddress(adresse)}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                                  {adresse.is_facturation ? (
                                    <Mail className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Home className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                    {adresse.libelle}
                                  </h4>
                                  {adresse.is_facturation && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs animate-pulse">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Adresse de facturation
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded-full">
                                  <Edit3 className="h-3 w-3" />
                                  Cliquer pour modifier
                                </div>
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Adresse active" />
                              </div>
                            </div>
                            
                            <div className="pl-11 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                                <MapPin className="h-3 w-3 text-neutral-400" />
                                <span className="font-medium">{adresse.rue}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <span className="w-3 h-3" />
                                <span>{adresse.code_postal} {adresse.ville}</span>
                              </div>
                              {adresse.pays && adresse.pays !== 'France' && (
                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                  <span className="w-3 h-3" />
                                  <span>{adresse.pays}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl bg-gradient-to-br from-neutral-50/50 to-white dark:from-neutral-800/50 dark:to-neutral-800">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-full w-fit mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          Aucune adresse enregistrée
                        </h3>
                        <p className="text-sm text-neutral-500 mb-6 max-w-md mx-auto">
                          {tierData.type === 'entreprise' 
                            ? "Commencez par ajouter l'adresse principale de cette entreprise pour faciliter la gestion des documents et de la facturation."
                            : "Ajoutez une adresse pour ce contact afin de faciliter les échanges et l'envoi de documents."
                          }
                        </p>
                        <Button
                          onClick={() => setAddressCreateModal({ open: true })}
                          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter la première adresse
                          <div className="ml-2 opacity-70">
                            {tierData.type === 'entreprise' ? '🏢' : '🏠'}
                          </div>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>



              {/* 🎯 NOUVEL ONGLET : Devis */}
              <TabsContent value="quotes" className="mt-6">
                <Card className="Beenaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Devis de {tierData.nom}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {/* État de chargement */}
                    {quotesLoading && (
                      <div className="flex items-center justify-center py-12 text-neutral-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span>Chargement des devis...</span>
                      </div>
                    )}
                    
                    {/* Gestion d'erreurs */}
                    {quotesError && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-5 w-5" />
                          <span>⚠️ {quotesError}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => id && loadQuotesProgressively(id)}
                            className="ml-auto"
                          >
                            Réessayer
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Barre de recherche et filtres pour les devis */}
                    {!quotesLoading && !quotesError && quotes.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-lg">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                            <Input
                              placeholder="Rechercher par numéro ou projet..."
                              value={quotesSearchQuery}
                              onChange={(e) => setQuotesSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-48">
                          <Select value={quotesStatusFilter} onValueChange={setQuotesStatusFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="draft">Brouillon</SelectItem>
                              <SelectItem value="sent">Envoyé</SelectItem>
                              <SelectItem value="accepted">Accepté</SelectItem>
                              <SelectItem value="rejected">Refusé</SelectItem>
                              <SelectItem value="expired">Expiré</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Métriques des devis */}
                    {quoteMetrics && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {quoteMetrics.total}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            Total devis
                          </div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(quoteMetrics.totalAmount)}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            Montant total
                          </div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(quoteMetrics.avgAmount)}
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            Montant moyen
                          </div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {Math.round(quoteMetrics.acceptanceRate)}%
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            Taux d'acceptation
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tableau des devis */}
                    {!quotesLoading && !quotesError && (
                      <>
                        {filteredQuotes.length > 0 ? (
                          <>
                            <div className="border rounded-lg overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Numéro / Projet
                                      </th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Statut
                                      </th>
                                      <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Montant TTC
                                      </th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Date création
                                      </th>
                                      <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {paginatedQuotes.items.map((quote) => (
                                      <tr key={quote.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {quote.number}
                                          </div>
                                          {quote.projectName && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs">
                                              {quote.projectName}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-3">
                                          <Badge variant={quote.status === 'accepted' ? 'default' : 'secondary'}>
                                            {getQuoteStatusFrench(quote.status)}
                                          </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <div className="font-medium text-green-600 dark:text-green-400">
                                            {formatCurrency(quote.totalTtc)}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {new Date(quote.issueDate || quote.createdAt).toLocaleDateString('fr-FR')}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <div className="flex items-center justify-center gap-2">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => navigate(`/devis/${quote.id}`)}
                                              className="h-8 w-8 p-0"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => navigate(`/devis/${quote.id}/edit`)}
                                              className="h-8 w-8 p-0"
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Pagination */}
                            {paginatedQuotes.totalPages > 1 && (
                              <div className="border-t px-4 py-3 bg-neutral-50/50 dark:bg-neutral-800/50">
                                <Pagination>
                                  <PaginationContent>
                                    <PaginationItem>
                                      <PaginationPrevious 
                                        onClick={() => setQuotesCurrentPage(Math.max(1, quotesCurrentPage - 1))}
                                        className={!paginatedQuotes.hasPrev ? 'pointer-events-none opacity-50' : ''}
                                      />
                                    </PaginationItem>
                                    
                                    {Array.from({ length: paginatedQuotes.totalPages }, (_, i) => (
                                      <PaginationItem key={i + 1}>
                                        <PaginationLink
                                          onClick={() => setQuotesCurrentPage(i + 1)}
                                          isActive={quotesCurrentPage === i + 1}
                                        >
                                          {i + 1}
                                        </PaginationLink>
                                      </PaginationItem>
                                    ))}
                                    
                                    <PaginationItem>
                                      <PaginationNext 
                                        onClick={() => setQuotesCurrentPage(Math.min(paginatedQuotes.totalPages, quotesCurrentPage + 1))}
                                        className={!paginatedQuotes.hasNext ? 'pointer-events-none opacity-50' : ''}
                                      />
                                    </PaginationItem>
                                  </PaginationContent>
                                </Pagination>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                              Aucun devis trouvé
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                              {quotesSearchQuery || quotesStatusFilter !== 'all' 
                                ? 'Aucun devis ne correspond aux critères de recherche.'
                                : `Aucun devis n'a encore été créé pour ${tierData.nom}.`
                              }
                            </p>
                            <Button onClick={handleQuoteAction} className="gap-2">
                              <Plus className="h-4 w-4" />
                              Créer le premier devis
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 🎯 SECTION : Opportunités du client (LOGIQUE MÉTIER: seulement clients et prospects) */}
            {isClientOrProspect && (
              <div className="md:col-span-2 mt-6">
                <Card className="Beenaya-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Opportunités de {tierData.nom}
                    </CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">
                      Gérez les opportunités commerciales liées à ce {tierData.relation === 'client' ? 'client' : 'prospect'}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Métriques des opportunités */}
                    {opportunityMetrics && opportunityMetrics.total > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all' 
                              ? filteredOpportunities.length 
                              : opportunityMetrics.total}
                          </div>
                          <div className="text-sm text-neutral-500">
                            Opportunités{opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all' ? ' (filtrées)' : ''}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrencyWithSymbol(
                              opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all' 
                                ? filteredOpportunities.reduce((sum, opp) => sum + opp.estimatedAmount, 0)
                                : opportunityMetrics.totalAmount
                            , { showSymbol: true })}
                          </div>
                          <div className="text-sm text-neutral-500">Montant total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {formatCurrencyWithSymbol(
                              opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all' 
                                ? (filteredOpportunities.length > 0 
                                    ? Math.round(filteredOpportunities.reduce((sum, opp) => sum + opp.estimatedAmount, 0) / filteredOpportunities.length)
                                    : 0)
                                : Math.round(opportunityMetrics.avgAmount)
                            , { showSymbol: true })}
                          </div>
                          <div className="text-sm text-neutral-500">Montant moyen</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-teal-600">
                            {opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all' 
                              ? (filteredOpportunities.length > 0 
                                  ? ((filteredOpportunities.filter(opp => opp.stage === 'won').length / filteredOpportunities.length) * 100).toFixed(2)
                                  : 0)
                              : (opportunityMetrics.total > 0 
                                  ? (((opportunityMetrics.byStage.won || 0) / opportunityMetrics.total) * 100).toFixed(2)
                                  : 0)
                            }%
                          </div>
                          <div className="text-sm text-neutral-500">Taux de conversion</div>
                        </div>
                      </div>
                    )}

                    {/* État de chargement */}
                    {opportunitiesLoading && (
                      <div className="flex items-center justify-center py-12 text-neutral-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        <span>Chargement des opportunités...</span>
                      </div>
                    )}
                    
                    {/* Gestion d'erreurs */}
                    {opportunitiesError && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="h-5 w-5" />
                          <span>⚠️ {opportunitiesError}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => id && loadOpportunitiesProgressively(id)}
                            className="ml-auto"
                          >
                            Réessayer
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Barre de recherche et filtres pour les opportunités */}
                    {!opportunitiesLoading && !opportunitiesError && opportunities.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-lg">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                            <Input
                              placeholder="Rechercher par nom ou description..."
                              value={opportunitiesSearchQuery}
                              onChange={(e) => setOpportunitiesSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="w-full sm:w-48">
                          <Select value={opportunitiesStatusFilter} onValueChange={setOpportunitiesStatusFilter}>
                            <SelectTrigger>
                              <Filter className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Tous les statuts</SelectItem>
                              <SelectItem value="new">Nouvelle</SelectItem>
                              <SelectItem value="needs_analysis">Analyse des besoins</SelectItem>
                              <SelectItem value="negotiation">Négociation</SelectItem>
                              <SelectItem value="won">Gagnée</SelectItem>
                              <SelectItem value="lost">Perdue</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Tableau des opportunités */}
                    {!opportunitiesLoading && !opportunitiesError && (
                      <>
                        {filteredOpportunities.length > 0 ? (
                          <>
                            <div className="border rounded-lg overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-neutral-50 dark:bg-neutral-800">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Nom / Description
                                      </th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Statut
                                      </th>
                                      <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Montant estimé
                                      </th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Probabilité
                                      </th>
                                      <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Date prévue
                                      </th>
                                      <th className="px-4 py-3 text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {paginatedOpportunities.items.map((opportunity) => (
                                      <tr key={opportunity.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {opportunity.name}
                                          </div>
                                          {opportunity.description && (
                                            <div className="text-sm text-neutral-500 truncate max-w-xs">
                                              {opportunity.description}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-3">
                                                                                  <Badge 
                                          variant={
                                            opportunity.stage === 'won' ? 'default' : 
                                            opportunity.stage === 'lost' ? 'destructive' : 
                                            opportunity.stage === 'negotiation' ? 'secondary' :
                                            'outline'
                                          }
                                          className="text-xs"
                                        >
                                          {getOpportunityStatusFrench(opportunity.stage)}
                                        </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <div className="font-medium">
                                            {formatCurrencyWithSymbol(opportunity.estimatedAmount, { showSymbol: true })}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center">
                                            <div className="text-sm font-medium mr-2">
                                              {opportunity.probability}%
                                            </div>
                                            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                              <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${opportunity.probability}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          {opportunity.expectedCloseDate && (
                                            <div className="text-sm">
                                              {new Date(opportunity.expectedCloseDate).toLocaleDateString('fr-FR')}
                                            </div>
                                          )}
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center justify-center gap-2">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                                              className="h-8 w-8 p-0"
                                            >
                                              <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => navigate(`/devis/edit/${opportunity.id}`)}
                                              className="h-8 w-8 p-0"
                                            >
                                              <FileText className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Information de pagination et pagination pour les opportunités */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="text-sm text-neutral-500">
                                Affichage de {((opportunitiesCurrentPage - 1) * itemsPerPage) + 1} à {Math.min(opportunitiesCurrentPage * itemsPerPage, filteredOpportunities.length)} sur {filteredOpportunities.length} opportunités
                                {opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all' ? ` (${opportunities.length} au total)` : ''}
                              </div>
                              {createPaginationComponent(
                                opportunitiesCurrentPage,
                                paginatedOpportunities.totalPages,
                                setOpportunitiesCurrentPage
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-12 text-neutral-500">
                            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">
                              {opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all'
                                ? 'Aucun résultat trouvé' 
                                : 'Aucune opportunité'}
                            </h3>
                            <p className="text-sm mb-4">
                              {opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all'
                                ? 'Aucune opportunité ne correspond aux critères de recherche.'
                                : `Ce ${tierData.relation === 'client' ? 'client' : 'prospect'} n'a pas encore d'opportunités enregistrées.`}
                            </p>
                            {(opportunitiesSearchQuery || opportunitiesStatusFilter !== 'all') && (
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setOpportunitiesSearchQuery('');
                                  setOpportunitiesStatusFilter('all');
                                }}
                                className="mt-2"
                              >
                                Effacer les filtres
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Panneau latéral - Résumé */}
          <div className="lg:col-span-1">
            <Card className="Beenaya-card sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Type:</span>
                    <span className="font-medium">
                      {isEntreprise ? 'Entreprise' : 'Particulier'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Contacts:</span>
                    <span className="font-medium">{tierData.contacts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Adresses:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{tierData.adresses?.length || 0}</span>
                      {tierData.adresses?.some(addr => addr.is_facturation) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Adresse de facturation configurée" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Relation:</span>
                    <span className="font-medium">{tierData.relation ? 1 : 0}</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div>
                        <span className="text-neutral-500 text-xs">Créé le:</span>
                        <div className="font-medium text-sm">
                          {new Date(tierData.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs">Modifié le:</span>
                        <div className="font-medium text-sm">
                          {new Date(tierData.updated_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            {tierData && (
              <Card className="Beenaya-card mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 🎯 LOGIQUE MÉTIER : Bouton opportunité seulement pour clients et prospects */}
                  {isClientOrProspect && (
                    <Button 
                      className="w-full gap-2 Beenaya-button-primary" 
                      onClick={handleCreateOpportunity}
                    >
                      <BarChart3 className="h-4 w-4" />
                      Créer une opportunité
                    </Button>
                  )}
                  
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={handleCreateContact}
                  >
                    <Users className="h-4 w-4" />
                    Ajouter un contact
                  </Button>
                  
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={handleQuoteAction}
                  >
                    <FileText className="h-4 w-4" />
                    Créer un devis
                  </Button>
                  
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={handleCallAction}
                  >
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                  
                  <Button 
                    className="w-full gap-2" 
                    variant="outline"
                    onClick={handleEmailAction}
                  >
                    <Mail className="h-4 w-4" />
                    Envoyer un email
                  </Button>
                  {tierData.adresses && tierData.adresses[0] && (
                    <Button 
                      className="w-full gap-2" 
                      variant="outline" 
                      onClick={handleMapAction}
                    >
                      <MapPin className="h-4 w-4" />
                      Voir sur la carte
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Modales d'édition spécialisées */}
      {tierForEdit && (
        <>
          <TierEntrepriseEditDialog
            open={editEntrepriseDialogOpen}
            onOpenChange={setEditEntrepriseDialogOpen}
            onSuccess={handleEditSuccess}
            tier={tierForEdit}
          />
          
          <TierParticulierEditDialog
            open={editParticulierDialogOpen}
            onOpenChange={setEditParticulierDialogOpen}
            onSuccess={handleEditSuccess}
            tier={tierForEdit}
          />
        </>
      )}

      {/* Formulaire de création d'opportunité */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full mx-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle opportunité</DialogTitle>
            <DialogDescription>
              Créez une nouvelle opportunité pour {tierData.nom}
            </DialogDescription>
          </DialogHeader>
          
          <OpportunityForm
            onSubmit={handleFormSubmit}
            onCancel={() => setFormDialogOpen(false)}
            isEditing={false}
            preselectedTierId={tierData.id}
            disableTierSelection={true}
          />
        </DialogContent>
      </Dialog>

      {/* Modale de création de devis */}
      <Dialog open={quoteModal.isOpen} onOpenChange={(open) => !open && quoteModal.actions.close()}>
        <DialogContent className="max-w-7xl max-h-[95vh] w-[98vw] sm:w-full mx-auto overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau devis pour {tierData.nom}</DialogTitle>
            <DialogDescription>
              Assistant de création de devis étape par étape
            </DialogDescription>
          </DialogHeader>
          
          <QuoteCreateWizard
            onQuoteCreated={handleQuoteCreated}
            onCancel={handleQuoteCancel}
            initialData={{
              preselectedTierId: tierData.id
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Modale informative pour les actions */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              {actionModalContent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-4">
            {actionModalContent?.icon}
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {actionModalContent?.message}
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setActionModalOpen(false)}
              className="px-8"
            >
              Compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de confirmation de suppression */}
      <DeleteConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={confirmDelete}
        tier={deleteModal.data || null}
        loading={deleteModal.isSubmitting}
      />

      {/* Modale d'édition de contact */}
      {contactEditModal.contact && (
        <ContactEditDialog
          open={contactEditModal.open}
          onOpenChange={handleContactEditClose}
          onSuccess={handleContactEditSuccess}
          contact={contactEditModal.contact}
          tierId={tierData?.id || ''}
          tierName={tierData?.nom || ''}
        />
      )}

      {/* Modale de création de contact */}
      {tierData && (
        <ContactCreateDialog
          open={contactCreateModal}
          onOpenChange={setContactCreateModal}
          onSuccess={handleContactCreateSuccess}
          tierId={tierData.id}
          tierName={tierData.nom}
        />
      )}

      {/* Modale d'édition d'adresse */}
      {addressEditModal.address && tierData && (
        <AddressEditDialog
          open={addressEditModal.open}
          onOpenChange={(open) => setAddressEditModal({ open, address: open ? addressEditModal.address : null })}
          onSuccess={handleAddressEditSuccess}
          address={addressEditModal.address}
          tierId={tierData.id}
          tierName={tierData.nom}
          tierType={tierData.type}
        />
      )}

      {/* Modale de création d'adresse */}
      {tierData && (
        <AddressCreateDialog
          open={addressCreateModal.open}
          onOpenChange={(open) => setAddressCreateModal({ open })}
          onSuccess={handleAddressCreateSuccess}
          tierId={tierData.id}
          tierName={tierData.nom}
          tierType={tierData.type}
        />
      )}

    </>
  );
}
