import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Plus, Grid, List, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import { OpportunityStats } from "@/features/crm/components/opportunities/OpportunityStats";
import { OpportunityKanbanColumn } from "@/features/crm/components/opportunities/OpportunityKanbanColumn";
import { OpportunityList } from "@/features/crm/components/opportunities/OpportunityList";
import { OpportunityFilters } from "@/features/crm/components/opportunities/OpportunityFilters";
import { OpportunityForm } from "@/features/crm/components/opportunities/OpportunityForm";
import { OpportunityLossForm } from "@/features/crm/components/opportunities/OpportunityLossForm";
import { ConfirmationDialog } from "@/features/crm/components/opportunities/ConfirmationDialog";
import { OpportunityTransitionDialog } from "@/features/crm/components/opportunities/OpportunityTransitionDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

import { opportunitiesApi, crmApi } from "@/features/crm/api";
import { Opportunity, OpportunityStatus, LossReason } from "../types/opportunity";
import { useModalState, createSafeSubmitHandler } from "@/hooks/useModalState";
import { OpportunitySortableItem } from "@/features/crm/components/opportunities/OpportunitySortableItem";
import { OpportunityCard } from "@/features/crm/components/opportunities/OpportunityCard";

// Définition des colonnes du Kanban
const kanbanColumns = [
  { id: "new", title: "Nouvelles", status: "new" as OpportunityStatus },
  { id: "needs_analysis", title: "Analyse des besoins", status: "needs_analysis" as OpportunityStatus },
  { id: "negotiation", title: "Négociation", status: "negotiation" as OpportunityStatus },
  { id: "won", title: "Gagnées", status: "won" as OpportunityStatus },
  { id: "lost", title: "Perdues", status: "lost" as OpportunityStatus },
];

export default function Opportunities() {
  const navigate = useNavigate();
  
  // 🏷️ Définir le titre de la page
  usePageTitle('Opportunités');
  
  // États principaux
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byStage: {} as Record<OpportunityStatus, number>,
    totalAmount: 0,
    weightedAmount: 0,
    wonAmount: 0,
    lostAmount: 0,
    conversionRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // 🔍 États pour les filtres
  const [dateFilter, setDateFilter] = useState<{from?: string; to?: string}>({});
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name' | 'estimatedAmount' | 'probability' | 'expectedCloseDate' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');
  
  // 🚀 NOUVEAU : Gestion d'état sécurisée pour les modals
  const opportunityFormModal = useModalState<Opportunity>();
  const lossFormModal = useModalState<Opportunity>();
  const confirmationModal = useModalState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger';
  }>();

  // État pour le dialogue de transition d'étapes
  const [transitionDialog, setTransitionDialog] = useState<{
    isOpen: boolean;
    opportunity: Opportunity | null;
    targetStage: OpportunityStatus;
    errorCode?: string;
    suggestion?: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    opportunity: null,
    targetStage: 'won',
    errorCode: undefined,
    suggestion: undefined,
    isLoading: false,
  });

  // Configuration des capteurs pour le drag and drop optimisée
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Distance minimum pour déclencher le drag (réduite)
        delay: 50,   // Délai réduit pour une meilleure réactivité
        tolerance: 8, // Tolérance augmentée pour les mouvements
      },
    })
  );

  // 🚀 CHARGEMENT INITIAL DES DONNÉES
  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        console.log('📥 Chargement des opportunités...');
        console.log('🏢 Tenant ID actuel:', localStorage.getItem('tenantId'));
        console.log('👤 Access Token actuel:', localStorage.getItem('accessToken') ? 'présent' : 'absent');
        console.log('🔑 Auth Token actuel:', localStorage.getItem('authToken') ? 'présent' : 'absent');
        const response = await opportunitiesApi.getOpportunities();
        
        // Logs détaillés pour diagnostiquer le problème
        console.log('🔍 Response complète:', response);
        console.log('🔍 Type de response:', typeof response);
        console.log('🔍 response.results:', response.results);
        console.log('🔍 response.results type:', typeof response.results);
        console.log('🔍 response.results length:', response.results?.length);
        
        // Vérifier si c'est un tableau direct ou un objet paginé
        if (Array.isArray(response)) {
          console.log('📋 Response est un tableau direct de', response.length, 'éléments');
          setOpportunities(response);
        } else if (response.results && Array.isArray(response.results)) {
          console.log('📋 Response est paginée avec', response.results.length, 'éléments');
          setOpportunities(response.results);
        } else {
          console.error('❌ Structure de response inattendue:', response);
          setOpportunities([]);
        }
        
        const statsData = await crmApi.stats.getStats();
        console.log('📊 Stats brutes reçues du serveur:', statsData);
        const safeStats = createSafeStats(statsData);
        console.log('📊 Stats sécurisées appliquées:', safeStats);
        setStats(safeStats);
        console.log('✅ Chargement terminé');
      } catch (error: any) {
        console.error('❌ Erreur lors du chargement des opportunités:', error);
        if (error?.response?.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.');
        } else if (error?.response?.status === 404) {
          toast.error('Service d\'opportunités non disponible');
        } else if (error?.response?.status === 500) {
          toast.error('Erreur serveur - Vérifiez les logs Django et la base de données');
        } else {
          toast.error('Impossible de charger les opportunités');
        }
      }
    };
    
    loadOpportunities();
    
    // Gérer les redirections depuis les devis
    const comesFromQuoteRejection = sessionStorage.getItem('quoteRejected');
    const comesFromQuoteAcceptation = sessionStorage.getItem('quoteAccepted');
    
    if (comesFromQuoteRejection || comesFromQuoteAcceptation) {
      sessionStorage.removeItem('quoteRejected');
      sessionStorage.removeItem('quoteAccepted');
      
      setTimeout(() => {
        loadOpportunities();
        toast.success('Opportunités mises à jour suite au changement de statut du devis');
      }, 500);
    }
  }, []);

  // 🚀 NETTOYAGE AUTOMATIQUE AU DÉMONTAGE
  useEffect(() => {
    return () => {
      console.log('🚪 Démontage du composant Opportunities - nettoyage final');
      // Ne pas utiliser les actions en dépendances pour éviter la boucle infinie
    };
  }, []); // ✅ Tableau de dépendances vide pour éviter la boucle

  // 🔍 NOUVELLE LOGIQUE DE FILTRAGE UNIFIÉE
  const getFilteredOpportunities = () => {
    let filtered = [...opportunities];
    
    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.name.toLowerCase().includes(query) ||
        (opp.tierName && opp.tierName.toLowerCase().includes(query)) ||
        (opp.description && opp.description.toLowerCase().includes(query))
      );
    }
    
    // Filtre par statut
    if (stageFilter.length > 0) {
      filtered = filtered.filter(opp => stageFilter.includes(opp.stage));
    }
    
    // Filtre par date
    if (dateFilter.from || dateFilter.to) {
      filtered = filtered.filter(opp => {
        const createdDate = new Date(opp.createdAt);
        const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
        const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
        
        if (fromDate && createdDate < fromDate) return false;
        if (toDate && createdDate > toDate) return false;
        
        return true;
      });
    }
    
    // Tri
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      // Gestion des cas spéciaux
      if (sortField === 'estimatedAmount') {
        aValue = a.estimatedAmount || 0;
        bValue = b.estimatedAmount || 0;
      } else if (sortField === 'expectedCloseDate' || sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  };
  
  // Filtrer les opportunités par statut (pour le Kanban)
  const getOpportunitiesByStatus = (status: OpportunityStatus) => {
    return getFilteredOpportunities().filter(opportunity => opportunity.stage === status);
  };

  // État pour le feedback visuel du drag & drop
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Fonction utilitaire pour créer des stats sécurisées avec adaptation du format backend
  const createSafeStats = (statsData: any) => {
    console.log('🔧 createSafeStats - Données reçues:', statsData);
    
    // Adapter les données du nouveau format backend vers le format frontend (comme dans OpportunityStats)
    let adaptedStats;
    
    if (statsData?.total_stats) {
      // Format backend avec total_stats et stage_stats
      adaptedStats = {
        total: statsData.total_stats.count || 0,
        totalAmount: parseFloat(statsData.total_stats.total_amount || '0'),
        weightedAmount: parseFloat(statsData.weighted_pipeline?.weighted_total || '0'),
        wonAmount: 0, // À calculer depuis stage_stats
        lostAmount: 0, // À calculer depuis stage_stats
        conversionRate: 0, // À calculer
        // Initialiser tous les stages par défaut
        byStage: {
          new: 0,
          needs_analysis: 0,
          negotiation: 0,
          won: 0,
          lost: 0
        } as Record<OpportunityStatus, number>
      };
      
      // Créer byStage depuis stage_stats
      if (statsData.stage_stats && Array.isArray(statsData.stage_stats)) {
        statsData.stage_stats.forEach((stage: any) => {
          const stageKey = stage.stage as OpportunityStatus;
          adaptedStats.byStage[stageKey] = stage.count || 0;
          if (stage.stage === 'won') {
            adaptedStats.wonAmount = parseFloat(stage.total_amount || '0');
          }
          if (stage.stage === 'lost') {
            adaptedStats.lostAmount = parseFloat(stage.total_amount || '0');
          }
        });
      }
      
      // Calculer le taux de conversion
      if (adaptedStats.total > 0) {
        adaptedStats.conversionRate = ((adaptedStats.byStage.won || 0) / adaptedStats.total) * 100;
      }
      
    } else {
      // Format déjà adapté ou ancien format
      adaptedStats = {
        total: statsData?.total || 0,
        // Initialiser tous les stages par défaut même pour l'ancien format
        byStage: {
          new: 0,
          needs_analysis: 0,
          negotiation: 0,
          won: 0,
          lost: 0,
          ...(statsData?.byStage || {})
        } as Record<OpportunityStatus, number>,
        totalAmount: statsData?.totalAmount || 0,
        weightedAmount: statsData?.weightedAmount || 0,
        wonAmount: statsData?.wonAmount || 0,
        lostAmount: statsData?.lostAmount || 0,
        conversionRate: statsData?.conversionRate || 0,
      };
    }
    
    console.log('🔧 createSafeStats - Stats adaptées:', adaptedStats);
    return adaptedStats;
  };

  // Gérer le début du glisser-déposer avec feedback
  const handleDragStart = (event: DragStartEvent) => {
    console.log('🎯 DRAG START:', event.active.id);
    setActiveId(event.active.id as string);
    // Ajouter une classe pour le feedback visuel global
    document.body.style.cursor = 'grabbing';
  };

  // Gérer le survol pendant le glisser-déposer avec feedback visuel
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setDragOverColumn(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Identifier la colonne survolée pour le feedback visuel
    let targetColumnId = null;
    
    // Vérifier d'abord si c'est directement une colonne
    const targetColumn = kanbanColumns.find(col => col.id === overId || col.status === overId);
    if (targetColumn) {
      targetColumnId = targetColumn.id;
    } else {
      // Si on survole une opportunité, identifier sa colonne
      const overOpportunity = opportunities.find(opp => opp.id === overId);
      if (overOpportunity) {
        const overColumn = kanbanColumns.find(col => col.status === overOpportunity.stage);
        targetColumnId = overColumn?.id || null;
      }
    }
    
    setDragOverColumn(targetColumnId);
    
    // Validation en temps réel pour le feedback visuel
    const activeOpportunity = opportunities.find(opp => opp.id === activeId);
    if (activeOpportunity && targetColumn) {
      const validation = validateTransition(activeOpportunity, targetColumn.status);
      // Le feedback visuel est géré dans OpportunityKanbanColumn avec canAcceptDrop
    }
  };

  // Valider une transition d'opportunité selon les règles métier
  const validateTransition = (opportunity: Opportunity, newStage: OpportunityStatus): { isValid: boolean; message?: string; needsConfirmation?: boolean } => {
    const currentStage = opportunity.stage;
    
    // Si pas de changement, toujours valide
    if (currentStage === newStage) {
      return { isValid: true };
    }
    
    // Règles métier
    switch (newStage) {
      case 'negotiation':
        // La validation réelle se fait côté backend
        // Le frontend laisse passer et affiche la modale si nécessaire
        break;
        
      case 'won':
        // Pour gagner une opportunité, elle doit avoir été en négociation
        if (currentStage !== 'negotiation') {
          return {
            isValid: false,
            message: "Une opportunité ne peut être gagnée que depuis l'étape de négociation."
          };
        }
        break;
        
      case 'new':
      case 'needs_analysis':
        // Retour en arrière - nécessite confirmation
        if (currentStage === 'negotiation' || currentStage === 'won') {
          return {
            isValid: true,
            needsConfirmation: true,
            message: `Êtes-vous sûr de vouloir faire revenir cette opportunité en "${newStage === 'new' ? 'Nouvelles' : 'Analyse des besoins'}" ?`
          };
        }
        break;
    }
    
    return { isValid: true };
  };

  // Gérer la fin du glisser-déposer avec validation et confirmation
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Nettoyer le feedback visuel immédiatement
    setActiveId(null);
    setDragOverColumn(null);
    document.body.style.cursor = '';
    
    if (!over) {
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Trouver l'opportunité active
    const activeOpportunity = opportunities.find(opp => opp.id === activeId);
    if (!activeOpportunity) {
      return;
    }
    
    // Déterminer le nouveau statut en fonction de l'endroit où elle a été déposée
    let newStatus: OpportunityStatus = activeOpportunity.stage;
    
    // Vérifier si elle a été déposée sur une colonne (par ID ou par status)
    const targetColumn = kanbanColumns.find(col => col.id === overId || col.status === overId);
    if (targetColumn) {
      newStatus = targetColumn.status;
    } else {
      // Si elle a été déposée sur une autre opportunité, trouver la colonne de cette opportunité
      const overOpportunity = opportunities.find(opp => opp.id === overId);
      if (overOpportunity) {
        newStatus = overOpportunity.stage;
      } else {
        // Si aucune correspondance trouvée, annuler le drag
        console.warn('Zone de drop non reconnue:', overId);
        return;
      }
    }
    
    // Mettre à jour le statut si nécessaire
    if (newStatus !== activeOpportunity.stage) {
      // Valider la transition
      const validation = validateTransition(activeOpportunity, newStatus);
      
      if (!validation.isValid) {
        // Transition interdite
        toast.error(validation.message || "Cette transition n'est pas autorisée");
        return;
      }
      
      if (validation.needsConfirmation) {
        // Transition nécessitant confirmation
        confirmationModal.actions.open({
          title: "Confirmer la transition",
          message: validation.message || "Êtes-vous sûr de vouloir effectuer cette action ?",
          type: 'warning',
          onConfirm: () => {
            if (newStatus === 'lost') {
              handleMarkAsLostSecure(activeOpportunity);
            } else {
              handleStageChange(activeOpportunity, newStatus);
            }
            confirmationModal.actions.close();
          }
        });
        return;
      }
      
      // Si on déplace vers "perdu", ouvrir le formulaire de raison de perte
      if (newStatus === 'lost') {
        handleMarkAsLostSecure(activeOpportunity);
      } else {
        // Sinon, mettre à jour directement et immédiatement
        handleStageChange(activeOpportunity, newStatus);
      }
    }
  };

  // Marquer une opportunité comme perdue - DÉPLACÉ ICI POUR ÉVITER L'ERREUR
  const handleMarkAsLostSecure = useCallback((opportunity: Opportunity) => {
    console.log(`❌ Ouverture du formulaire de perte pour l'opportunité ${opportunity.id}`);
    lossFormModal.actions.open(opportunity);
  }, [lossFormModal.actions]);

  // Fonction utilitaire pour calculer la probabilité selon l'étape
  const getProbabilityByStage = (stage: OpportunityStatus): number => {
    switch (stage) {
      case 'new':
        return 10;
      case 'needs_analysis':
        return 30;
      case 'negotiation':
        return 60;
      case 'won':
        return 100;
      case 'lost':
        return 0;
      default:
        return 10; // Défaut pour nouvelle
    }
  };

  // 🚀 MIGRATION: Gérer le changement de statut avec mise à jour optimiste
  const handleStageChange = async (opportunity: Opportunity, newStage: OpportunityStatus) => {
    // 1. MISE À JOUR OPTIMISTE IMMÉDIATE (pour l'effet instantané)
    console.log(`🚀 Mise à jour optimiste: ${opportunity.id} vers ${newStage}`);
    const newProbability = getProbabilityByStage(newStage);
    console.log(`🔗 Mise à jour probabilité: ${opportunity.probability}% → ${newProbability}%`);
    const optimisticOpportunity = { 
      ...opportunity, 
      stage: newStage,
      probability: newProbability
    };
    
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunity.id ? optimisticOpportunity : opp
    ));
    
    // 2. Mettre à jour les stats optimistement
    setStats(prev => {
      console.log('🔄 Stats AVANT mise à jour optimiste:', prev);
      
      const newStats = { 
        ...prev,
        byStage: { ...prev.byStage } // S'assurer que byStage est un objet
      };
      
      // Décrémenter l'ancien statut (avec protection)
      const currentStageCount = newStats.byStage[opportunity.stage] || 0;
      console.log(`📉 Décrément ${opportunity.stage}: ${currentStageCount} → ${Math.max(0, currentStageCount - 1)}`);
      newStats.byStage[opportunity.stage] = Math.max(0, currentStageCount - 1);
      
      // Incrémenter le nouveau statut (avec protection)
      const newStageCount = newStats.byStage[newStage] || 0;
      console.log(`📈 Incrément ${newStage}: ${newStageCount} → ${newStageCount + 1}`);
      newStats.byStage[newStage] = newStageCount + 1;
      
      console.log('🔄 Stats APRÈS mise à jour optimiste:', newStats);
      return newStats;
    });

    try {
      // 3. CONFIRMATION VIA L'API (en arrière-plan)
      console.log(`📡 Confirmation API: ${opportunity.id} vers ${newStage}`);
      const updatedOpportunity = await opportunitiesApi.updateOpportunityStage(opportunity.id, newStage);
      
      // 4. Mise à jour avec les vraies données du serveur
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // 5. Recharger les stats réelles
      try {
        const statsData = await crmApi.stats.getStats();
        setStats(createSafeStats(statsData));
      } catch (statsError) {
        console.warn('⚠️ Erreur stats (non critique):', statsError);
      }
      
      // 6. Notification de succès
      toast.success(`Opportunité déplacée vers "${
        newStage === 'new' ? 'Nouvelles' :
        newStage === 'needs_analysis' ? 'Analyse des besoins' :
        newStage === 'negotiation' ? 'Négociation' :
        newStage === 'won' ? 'Gagnées' :
        newStage === 'lost' ? 'Perdues' : 'En attente'
      }"`);
      
      // 7. Vérifier conversion prospect -> client
      if (updatedOpportunity.tier_converted) {
        toast.success(`🎉 Prospect converti en client ! ${updatedOpportunity.tier_converted_message || `${opportunity.tierName} est maintenant un client.`}`, {
          duration: 6000,
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la confirmation API:', error);
      console.log('🔍 Détails complets de l\'erreur:', {
        status: error?.response?.status,
        data: error?.response?.data,
        headers: error?.response?.headers,
        config: error?.config
      });
      console.log('🔍 Test condition pour QUOTE_REQUIRED:', {
        statusIs400: error?.response?.status === 400,
        hasData: !!error?.response?.data,
        hasCode: !!error?.response?.data?.code,
        code: error?.response?.data?.code,
        codeMatch: error?.response?.data?.code === 'QUOTE_REQUIRED_FOR_NEGOTIATION'
      });
      
      // 8. ROLLBACK en cas d'erreur - remettre l'état original
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunity.id ? opportunity : opp
      ));
      
      // Rollback des stats
      setStats(prev => {
        const rollbackStats = { 
          ...prev,
          byStage: { ...prev.byStage } // S'assurer que byStage est un objet
        };
        
        // Remettre l'ancien statut (avec protection)
        const originalStageCount = rollbackStats.byStage[opportunity.stage] || 0;
        rollbackStats.byStage[opportunity.stage] = originalStageCount + 1;
        
        // Décrémenter le nouveau statut (avec protection)
        const newStageCount = rollbackStats.byStage[newStage] || 0;
        rollbackStats.byStage[newStage] = Math.max(0, newStageCount - 1);
        
        return rollbackStats;
      });
      
      // 9. Gestion élégante des erreurs selon le type
      console.log('🎯 Entrant dans la gestion d\'erreur spécifique');
      if (error?.response?.status === 400 && error?.response?.data?.code) {
        console.log('✅ Condition principale remplie, errorData:', error.response.data);
        const errorData = error.response.data;
        
        // Si l'erreur a un code spécifique, ouvrir le dialogue de transition
        console.log('🔍 Vérification du code:', errorData.code);
        if (errorData.code === 'QUOTE_REQUIRED_FOR_NEGOTIATION' || 
            errorData.code === 'NEGOTIATION_REQUIRED_FOR_WON') {
          console.log('🚀 Ouverture du dialogue de transition!');
          setTransitionDialog({
            isOpen: true,
            opportunity,
            targetStage: newStage,
            errorCode: errorData.code,
            suggestion: errorData.suggestion,
            isLoading: false,
          });
        } else {
          // Pour les autres erreurs avec code, afficher un toast informatif
          toast.error(`Transition interdite: ${errorData.detail}${errorData.suggestion ? ` ${errorData.suggestion}` : ''}`, {
            duration: 8000,
          });
        }
      } else if (error?.response?.status === 400 && error?.response?.data) {
        // Erreurs sans code spécifique
        const errorData = error.response.data;
        toast.error(`Transition interdite: ${errorData.detail}${errorData.suggestion ? ` ${errorData.suggestion}` : ''}`, {
          duration: 8000,
        });
      } else {
        // Erreurs techniques générales
        toast.error("Impossible de mettre à jour l'opportunité - changement annulé");
      }
    }
  };

  // 🚀 MIGRATION: Créer un devis à partir d'une opportunité
  const handleCreateQuote = async (opportunity: Opportunity) => {
    try {
      console.log(`📄 Création d'un devis pour l'opportunité ${opportunity.id}...`);
      // Rediriger vers la création de devis avec pré-sélection du tier
      navigate('/devis/nouveau', { 
        state: { 
          preselectedTierId: opportunity.tierId,
          opportunityId: opportunity.id,
          opportunityName: opportunity.name 
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création du devis:', error);
      toast.error('Impossible de créer un devis pour cette opportunité');
    }
  };

  // 🚀 MIGRATION: Marquer une opportunité comme gagnée (avec gestion élégante des transitions)
  const handleMarkAsWon = async (opportunity: Opportunity) => {
    try {
      console.log(`🎉 Marquage de l'opportunité ${opportunity.id} comme gagnée...`);
      
      // Mise à jour optimiste immédiate
      const optimisticOpportunity = { 
        ...opportunity, 
        stage: 'won' as OpportunityStatus
      };
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunity.id ? optimisticOpportunity : opp
      ));
      
      const updatedOpportunity = await opportunitiesApi.markAsWon(opportunity.id);
      
      // Mettre à jour avec les vraies données du serveur
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Recharger les statistiques
      try {
        const statsData = await crmApi.stats.getStats();
        setStats(createSafeStats(statsData));
      } catch (statsError) {
        console.warn('⚠️ Erreur stats (non critique):', statsError);
      }
      
      toast.success('🎉 Opportunité marquée comme gagnée !');
      
      // Vérifier si un prospect a été converti en client
      if (updatedOpportunity.tier_converted) {
        toast.success(`🎉 Prospect converti en client ! ${updatedOpportunity.tier_converted_message || `${opportunity.tierName} est maintenant un client.`}`, {
          duration: 6000,
        });
      }
      
    } catch (error: any) {
      console.error('❌ Erreur lors du marquage gagnée:', error);
      
      // Gestion élégante des erreurs de transition métier
      if (error?.response?.status === 400 && error?.response?.data?.code) {
        const errorData = error.response.data;
        setTransitionDialog({
          isOpen: true,
          opportunity,
          targetStage: 'won',
          errorCode: errorData.code,
          suggestion: errorData.suggestion,
          isLoading: false,
        });
      } else {
        // Erreur technique générale
        toast.error('Erreur lors du marquage de l\'opportunité comme gagnée');
      }
    }
  };

  // Gérer la vue détaillée d'une opportunité
  const handleViewOpportunity = (opportunity: Opportunity) => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  // Gérer l'édition d'une opportunité
  const handleEditOpportunitySecure = useCallback((opportunity: Opportunity) => {
    console.log(`📝 Ouverture du formulaire d'édition pour l'opportunité ${opportunity.id}`);
    opportunityFormModal.actions.open(opportunity);
  }, [opportunityFormModal.actions]);

  // 🚀 MIGRATION: Gérer la suppression via le service intelligent
  const handleDeleteOpportunity = useCallback(async (opportunity: Opportunity) => {
    confirmationModal.actions.open({
      title: "Supprimer l'opportunité",
      message: `Êtes-vous sûr de vouloir supprimer l'opportunité "${opportunity.name}" ? Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const success = await opportunitiesApi.deleteOpportunity(opportunity.id);
          if (success) {
            // Mettre à jour la liste des opportunités
            setOpportunities(prev => prev.filter(opp => opp.id !== opportunity.id));
            
            // Mettre à jour les statistiques
            const statsData = await crmApi.stats.getStats();
            setStats(statsData);
            
            // Afficher une notification
            toast.success('Opportunité supprimée');
            
            // Fermer la modale
            confirmationModal.actions.close();
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          toast.error('Impossible de supprimer l\'opportunité');
        }
      }
    });
  }, [confirmationModal.actions]); // Dépendance correcte

  // 🚀 MIGRATION: Confirmer la perte via le service intelligent (avec mise à jour optimiste)
  const handleConfirmLoss = useCallback(async (data: { lossReason: LossReason; lossDescription?: string }) => {
    if (!lossFormModal.data || lossFormModal.isSubmitting) {
      console.warn('⚠️ Aucune opportunité sélectionnée pour la perte ou traitement en cours');
      return;
    }

    const opportunity = lossFormModal.data;
    
    // Mise à jour optimiste immédiate
    const optimisticOpportunity = { 
      ...opportunity, 
      stage: 'lost' as OpportunityStatus,
      lossReason: data.lossReason,
      lossDescription: data.lossDescription
    };
    setOpportunities(prev => prev.map(opp => 
      opp.id === opportunity.id ? optimisticOpportunity : opp
    ));
    
    try {
      lossFormModal.actions.setSubmitting(true);
      
      console.log(`❌ Marquage de l'opportunité ${opportunity.id} comme perdue...`);
      console.log('🔍 Données reçues du formulaire:', data);
      console.log('🔍 Type de lossDescription:', typeof data.lossDescription, data.lossDescription);
      
      // Préparer les données en filtrant les valeurs undefined
      const requestData: any = {
        loss_reason: data.lossReason,
      };
      
      // Ajouter loss_description seulement si elle n'est pas undefined ou null
      if (data.lossDescription !== undefined && data.lossDescription !== null && data.lossDescription !== '') {
        requestData.loss_description = Array.isArray(data.lossDescription) 
          ? data.lossDescription.join(' ') 
          : data.lossDescription;
      }
      
      console.log('🔍 Données préparées pour envoi:', requestData);
      const updatedOpportunity = await opportunitiesApi.markAsLost(opportunity.id, requestData);
      
      // Mettre à jour avec les vraies données du serveur
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Recharger les statistiques
      try {
        const statsData = await crmApi.stats.getStats();
        setStats(createSafeStats(statsData));
      } catch (statsError) {
        console.warn('⚠️ Erreur stats (non critique):', statsError);
      }
      
      toast.success('Opportunité marquée comme perdue');
      console.log(`✅ Opportunité ${opportunity.id} marquée comme perdue`);
      
      // Fermer la modale APRÈS le succès de l'opération
      lossFormModal.actions.close();
      
    } catch (error) {
      console.error('❌ Erreur lors du marquage perdue:', error);
      
      // Rollback en cas d'erreur
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunity.id ? opportunity : opp
      ));
      
      toast.error('Erreur lors du marquage de l\'opportunité comme perdue');
    } finally {
      lossFormModal.actions.setSubmitting(false);
    }
  }, [lossFormModal.data, lossFormModal.isSubmitting, lossFormModal.actions]);

  // 🚀 MIGRATION: Gérer la soumission via le service intelligent - Version sécurisée
  const handleFormSubmit = useCallback(async (formData: Partial<Opportunity>) => {
    if (opportunityFormModal.isSubmitting) {
      console.warn('⚠️ Soumission déjà en cours - ignorée');
      return;
    }

    try {
      opportunityFormModal.actions.setSubmitting(true);
      
      if (opportunityFormModal.data) {
        // Mode édition
        console.log(`📝 Mise à jour de l'opportunité ${opportunityFormModal.data.id}...`);
        const updatedOpportunity = await opportunitiesApi.updateOpportunity(opportunityFormModal.data.id, formData);
        
        // Mettre à jour la liste des opportunités
        setOpportunities(prev => prev.map(opp => 
          opp.id === updatedOpportunity.id ? updatedOpportunity : opp
        ));
        
        console.log(`✅ Opportunité ${opportunityFormModal.data.id} mise à jour`);
        toast.success('Opportunité mise à jour avec succès');
      } else {
        // Mode création
        console.log('🆕 Création d\'une nouvelle opportunité...');
        console.log('📤 DONNÉES REÇUES DANS OPPORTUNITIES.TSX:', formData);
        console.log('🚨 ANALYSE DÉTAILLÉE DANS OPPORTUNITIES.TSX:');
        Object.entries(formData).forEach(([key, value]) => {
          console.log(`   ${key}:`, typeof value, Array.isArray(value) ? '(ARRAY!)' : '', value);
        });
        const newOpportunity = await opportunitiesApi.createOpportunity(formData);
        
        // Ajouter à la liste des opportunités
        setOpportunities(prev => [...prev, newOpportunity]);
        
        console.log(`✅ Nouvelle opportunité ${newOpportunity.id} créée`);
        toast.success('Opportunité créée avec succès');
      }
      
      // Recharger les statistiques (séparé de la création pour éviter l'échec total)
      try {
        const statsData = await crmApi.stats.getStats();
        setStats(createSafeStats(statsData));
      } catch (statsError) {
        console.error('⚠️ Erreur lors du rechargement des statistiques (non critique):', statsError);
        // Ne pas faire échouer toute l'opération pour les stats
      }
      
      // Fermer le modal
      opportunityFormModal.actions.close();
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      toast.error(opportunityFormModal.data ? "Impossible de mettre à jour l'opportunité" : "Impossible de créer l'opportunité");
    } finally {
      opportunityFormModal.actions.setSubmitting(false);
    }
  }, [opportunityFormModal.data, opportunityFormModal.isSubmitting, opportunityFormModal.actions]);

  // 🚀 Gérer l'ouverture sécurisée du formulaire de création
  const handleAddNewSecure = useCallback((stage?: OpportunityStatus) => {
    console.log('🆕 Ouverture du formulaire de création');
    opportunityFormModal.actions.open();
  }, [opportunityFormModal.actions]);

  // 🚀 Gestionnaires de fermeture sécurisés pour les modales
  const handleFormDialogClose = useCallback((open: boolean) => {
    if (!open) {
      console.log('🚪 Fermeture sécurisée du formulaire');
      opportunityFormModal.actions.close();
    }
  }, [opportunityFormModal.actions]);

  const handleLossFormClose = useCallback((open: boolean) => {
    if (!open) {
      console.log('🚪 Fermeture sécurisée du formulaire de perte');
      lossFormModal.actions.close();
    }
  }, [lossFormModal.actions]);

  // 🚀 Gestionnaire pour la transition guidée d'étapes
  const handleConfirmTransition = useCallback(async () => {
    if (!transitionDialog.opportunity) return;

    setTransitionDialog(prev => ({ ...prev, isLoading: true }));

    try {
      const opportunity = transitionDialog.opportunity;
      
      // Cas spécial : si un devis est requis pour la négociation
      if (transitionDialog.errorCode === 'QUOTE_REQUIRED_FOR_NEGOTIATION') {
        console.log(`📄 Redirection vers la création de devis pour l'opportunité ${opportunity.id}`);
        
        // Fermer le dialogue et rediriger vers la création de devis
        setTransitionDialog(prev => ({ 
          ...prev, 
          isOpen: false, 
          isLoading: false,
          opportunity: null 
        }));
        
        // Rediriger vers la création de devis avec pré-sélection
        handleCreateQuote(opportunity);
        
        toast.success('Vous allez être redirigé vers la création d\'un devis');
        return;
      }

      console.log(`🔄 Transition guidée pour ${opportunity.id}: ${opportunity.stage} -> négociation -> ${transitionDialog.targetStage}`);

      // Étape 1: Passer en négociation
      await handleStageChange(opportunity, 'negotiation');
      
      // Attendre un peu pour que la mise à jour se propage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Étape 2: Passer à l'étape finale
      const updatedOpportunity = { ...opportunity, stage: 'negotiation' as OpportunityStatus };
      if (transitionDialog.targetStage === 'won') {
        await handleMarkAsWon(updatedOpportunity);
      } else if (transitionDialog.targetStage === 'lost') {
        // Pour les transitions vers 'lost', ouvrir le formulaire de raison
        handleMarkAsLostSecure(updatedOpportunity);
      }

      // Fermer le dialogue
      setTransitionDialog(prev => ({ 
        ...prev, 
        isOpen: false, 
        isLoading: false,
        opportunity: null 
      }));

      toast.success('✨ Transition effectuée avec succès !');

    } catch (error) {
      console.error('❌ Erreur lors de la transition guidée:', error);
      toast.error('Erreur lors de la transition guidée');
      setTransitionDialog(prev => ({ ...prev, isLoading: false }));
    }
  }, [transitionDialog.opportunity, transitionDialog.targetStage, transitionDialog.errorCode, handleStageChange, handleMarkAsLostSecure, handleCreateQuote]);

  // 🚀 Fermer le dialogue de transition
  const handleTransitionDialogClose = useCallback(() => {
    setTransitionDialog(prev => ({ 
      ...prev, 
      isOpen: false, 
      isLoading: false,
      opportunity: null 
    }));
  }, []);

  // 🚀 Gestionnaire d'annulation de formulaire sécurisé
  const handleFormCancel = useCallback(() => {
    console.log('❌ Annulation du formulaire');
    opportunityFormModal.actions.close();
  }, [opportunityFormModal.actions]);
  
  // 🔍 GESTIONNAIRES DE FILTRES
  const handleDateRangeChange = useCallback((from: string, to: string) => {
    console.log('📅 Changement de plage de dates:', { from, to });
    setDateFilter({ from, to });
  }, []);
  
  const handleStageFilterChange = useCallback((stages: string[]) => {
    console.log('🎯 Changement de filtre par statut:', stages);
    setStageFilter(stages);
  }, []);
  
  const handleSortChange = useCallback((field: string, order: 'asc' | 'desc') => {
    console.log('🔄 Changement de tri:', { field, order });
    setSortField(field as any);
    setSortOrder(order);
  }, []);

  // Obtenir l'opportunité active pour l'overlay de glisser-déposer
  const activeOpportunity = activeId ? opportunities.find(opp => opp.id === activeId) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Opportunités</h1>
            <p className="text-Beenaya-100 text-sm mt-1">
              Gérez votre pipeline commercial
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-Beenaya-900 hover:bg-white/90 mt-3 sm:mt-0"
            onClick={() => handleAddNewSecure()}
          >
            <Plus className="w-4 h-4" />
            Nouvelle opportunité
          </Button>
        </div>
      </div>

      {/* Stats */}
      <OpportunityStats stats={stats} />

      {/* Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <OpportunityFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onDateRangeChange={handleDateRangeChange}
        onStageFilterChange={handleStageFilterChange}
        onSortChange={handleSortChange}
      />

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <Button
            variant={viewType === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setViewType('kanban')}
          >
            <Grid className="h-4 w-4" />
            Kanban
          </Button>
          <Button
            variant={viewType === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setViewType('list')}
          >
            <List className="h-4 w-4" />
            Liste
          </Button>
        </div>
      </div>

      {/* Content - Vue conditionnelle */}
      {viewType === 'kanban' ? (
        // Vue Kanban avec drag and drop
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex overflow-x-auto pb-6 gap-4">
          {kanbanColumns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-[300px] md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(20%-13px)]">
              <OpportunityKanbanColumn
                key={`column-${column.status}`}
                title={column.title}
                stage={column.status}
                opportunities={getOpportunitiesByStatus(column.status)}
                count={getOpportunitiesByStatus(column.status).length}
                onView={handleViewOpportunity}
                onDelete={handleDeleteOpportunity}
                onStageChange={handleStageChange}
                onCreateQuote={handleCreateQuote}
                onMarkAsWon={handleMarkAsWon}
                onMarkAsLost={handleMarkAsLostSecure}
                onAddNew={handleAddNewSecure}
                activeId={activeId}
                isDragOver={dragOverColumn === column.id}
                canAcceptDrop={(() => {
                  if (!activeId) return true;
                  const activeOpportunity = opportunities.find(opp => opp.id === activeId);
                  if (!activeOpportunity) return true;
                  const validation = validateTransition(activeOpportunity, column.status);
                  return validation.isValid;
                })()}
              />
            </div>
          ))}
        </div>
        
        {/* DragOverlay pour afficher l'élément en cours de déplacement */}
        {activeId && activeOpportunity ? (
          <DragOverlay>
            <OpportunityCard
              opportunity={activeOpportunity}
              isDragging={true}
            />
          </DragOverlay>
        ) : null}
      </DndContext>
      ) : (
        // Vue Liste
        <div className="space-y-4">
          <OpportunityList
            opportunities={getFilteredOpportunities()}
            onView={handleViewOpportunity}
            onEdit={handleEditOpportunitySecure}
            onDelete={handleDeleteOpportunity}
            onCreateQuote={handleCreateQuote}
            onMarkAsWon={handleMarkAsWon}
            onMarkAsLost={handleMarkAsLostSecure}
          />
        </div>
      )}

      {/* Opportunity Form Dialog */}
      <Dialog open={opportunityFormModal.isOpen} onOpenChange={handleFormDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full mx-auto overflow-y-auto">
          <OpportunityForm
            opportunity={opportunityFormModal.data}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isEditing={!!opportunityFormModal.data}
          />
        </DialogContent>
      </Dialog>

      {/* Loss Reason Form Dialog */}
      <OpportunityLossForm
        open={lossFormModal.isOpen}
        onOpenChange={handleLossFormClose}
        onSubmit={handleConfirmLoss}
      />

      {/* Confirmation Dialog */}
      {confirmationModal.data && (
        <ConfirmationDialog
          isOpen={confirmationModal.isOpen}
          onClose={() => confirmationModal.actions.close()}
          onConfirm={confirmationModal.data.onConfirm}
          title={confirmationModal.data.title}
          message={confirmationModal.data.message}
          type={confirmationModal.data.type}
        />
      )}

      {/* Transition Dialog */}
      {transitionDialog.opportunity && (
        <OpportunityTransitionDialog
          isOpen={transitionDialog.isOpen}
          onClose={handleTransitionDialogClose}
          opportunity={transitionDialog.opportunity}
          targetStage={transitionDialog.targetStage}
          errorCode={transitionDialog.errorCode}
          suggestion={transitionDialog.suggestion}
          onConfirmTransition={handleConfirmTransition}
          onDirectAction={() => {
            // Action directe non implémentée pour l'instant
            handleTransitionDialogClose();
          }}
          isLoading={transitionDialog.isLoading}
        />
      )}
    </div>
  );
}