import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');
  
  // 🚀 NOUVEAU : Gestion d'état sécurisée pour les modals
  const opportunityFormModal = useModalState<Opportunity>();
  const lossFormModal = useModalState<Opportunity>();

  // Configuration des capteurs pour le drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
        setStats(statsData);
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

  // Filtrer les opportunités par statut
  const getOpportunitiesByStatus = (status: OpportunityStatus) => {
    return opportunities.filter(opportunity => opportunity.stage === status);
  };

  // Gérer le début du glisser-déposer
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Gérer le survol pendant le glisser-déposer
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Nous n'avons pas besoin de faire des changements pendant le survol
    // mais cette fonction peut être utilisée pour des animations ou des effets visuels
  };

  // Gérer la fin du glisser-déposer
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Trouver l'opportunité active
    const activeOpportunity = opportunities.find(opp => opp.id === activeId);
    if (!activeOpportunity) return;
    
    // Déterminer le nouveau statut en fonction de l'endroit où elle a été déposée
    let newStatus: OpportunityStatus = activeOpportunity.stage;
    
    // Vérifier si elle a été déposée sur une colonne
    const targetColumn = kanbanColumns.find(col => col.id === overId);
    if (targetColumn) {
      newStatus = targetColumn.status;
    } else {
      // Si elle a été déposée sur une autre opportunité, trouver la colonne de cette opportunité
      const overOpportunity = opportunities.find(opp => opp.id === overId);
      if (overOpportunity) {
        newStatus = overOpportunity.stage;
      }
    }
    
    // Mettre à jour le statut de l'opportunité si nécessaire
    if (newStatus !== activeOpportunity.stage) {
      // Si on déplace vers "perdu", ouvrir le formulaire de raison de perte
      if (newStatus === 'lost') {
        handleMarkAsLostSecure(activeOpportunity);
      } else {
        // Sinon, mettre à jour directement
        handleStageChange(activeOpportunity, newStatus);
      }
    }
    
    setActiveId(null);
  };

  // Marquer une opportunité comme perdue - DÉPLACÉ ICI POUR ÉVITER L'ERREUR
  const handleMarkAsLostSecure = useCallback((opportunity: Opportunity) => {
    console.log(`❌ Ouverture du formulaire de perte pour l'opportunité ${opportunity.id}`);
    lossFormModal.actions.open(opportunity);
  }, [lossFormModal.actions]);

  // 🚀 MIGRATION: Gérer le changement de statut via le service intelligent
  const handleStageChange = async (opportunity: Opportunity, newStage: OpportunityStatus) => {
    try {
      const updatedOpportunity = await opportunitiesApi.updateOpportunityStage(opportunity.id, newStage);
      
      // Mettre à jour la liste des opportunités
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      const statsData = await crmApi.stats.getStats();
      setStats(statsData);
      
      // Afficher une notification de succès
      toast.success(`L'opportunité a été déplacée vers "${
        newStage === 'new' ? 'Nouvelles' :
        newStage === 'needs_analysis' ? 'Analyse des besoins' :
        newStage === 'negotiation' ? 'Négociation' :
        newStage === 'won' ? 'Gagnées' :
        newStage === 'lost' ? 'Perdues' : 'En attente'
      }"`);
      
      // Vérifier si un prospect a été converti en client
      if (updatedOpportunity.tier_converted) {
        toast.success(`🎉 Prospect converti en client ! ${updatedOpportunity.tier_converted_message || `${opportunity.tierName} est maintenant un client.`}`, {
          duration: 6000,
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      
      // Gérer les erreurs de validation métier
      if (error?.response?.status === 400 && error?.response?.data) {
        const errorData = error.response.data;
        toast.error(`Transition interdite: ${errorData.detail}${errorData.suggestion ? ` ${errorData.suggestion}` : ''}`, {
          duration: 8000,
        });
      } else {
        // Erreur générique
        toast.error("Impossible de mettre à jour l'opportunité");
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

  // 🚀 MIGRATION: Marquer une opportunité comme gagnée
  const handleMarkAsWon = async (opportunity: Opportunity) => {
    try {
      console.log(`🎉 Marquage de l'opportunité ${opportunity.id} comme gagnée...`);
      const updatedOpportunity = await opportunitiesApi.markAsWon(opportunity.id);
      
      // Mettre à jour la liste des opportunités
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      const statsData = await crmApi.stats.getStats();
      setStats(statsData);
      
      toast.success('🎉 Opportunité marquée comme gagnée !');
      
      // Vérifier si un prospect a été converti en client
      if (updatedOpportunity.tier_converted) {
        toast.success(`🎉 Prospect converti en client ! ${updatedOpportunity.tier_converted_message || `${opportunity.tierName} est maintenant un client.`}`, {
          duration: 6000,
        });
      }
      
      console.log(`✅ Opportunité ${opportunity.id} marquée comme gagnée`);
    } catch (error) {
      console.error('❌ Erreur lors du marquage gagnée:', error);
      toast.error('Erreur lors du marquage de l\'opportunité comme gagnée');
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
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'opportunité "${opportunity.name}" ?`)) {
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
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Impossible de supprimer l\'opportunité');
      }
    }
  }, []); // Pas de dépendances car on utilise la forme fonctionnelle de setState

  // 🚀 MIGRATION: Confirmer la perte via le service intelligent
  const handleConfirmLoss = useCallback(async (data: { lossReason: LossReason; lossDescription?: string }) => {
    if (!lossFormModal.data || lossFormModal.isSubmitting) {
      console.warn('⚠️ Aucune opportunité sélectionnée pour la perte ou traitement en cours');
      return;
    }
    
    try {
      lossFormModal.actions.setSubmitting(true);
      
      console.log(`❌ Marquage de l'opportunité ${lossFormModal.data.id} comme perdue...`);
      const updatedOpportunity = await opportunitiesApi.markAsLost(lossFormModal.data.id, data.lossReason, data.lossDescription);
      
      // Mettre à jour la liste des opportunités
      setOpportunities(prev => prev.map(opp => 
        opp.id === updatedOpportunity.id ? updatedOpportunity : opp
      ));
      
      // Mettre à jour les statistiques
      const statsData = await crmApi.stats.getStats();
      setStats(statsData);
      
      toast.success('Opportunité marquée comme perdue');
      console.log(`✅ Opportunité ${lossFormModal.data.id} marquée comme perdue`);
      
      // Fermer le modal
      lossFormModal.actions.close();
    } catch (error) {
      console.error('❌ Erreur lors du marquage perdue:', error);
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
        
        // Transformer les données au format attendu par l'API (snake_case)
        const createData = {
          name: formData.name!,
          tier: formData.tierId!,
          stage: formData.stage!,
          estimated_amount: formData.estimatedAmount!,
          probability: formData.probability!,
          expected_close_date: formData.expectedCloseDate!,
          source: formData.source! as string,
          description: formData.description,
          assigned_to: formData.assignedTo,
        };
        
        console.log('📤 Données envoyées à l\'API:', createData);
        const newOpportunity = await opportunitiesApi.createOpportunity(createData);
        
        // Ajouter à la liste des opportunités
        setOpportunities(prev => [...prev, newOpportunity]);
        
        console.log(`✅ Nouvelle opportunité ${newOpportunity.id} créée`);
        toast.success('Opportunité créée avec succès');
      }
      
      // Recharger les statistiques (séparé de la création pour éviter l'échec total)
      try {
        const statsData = await crmApi.stats.getStats();
        setStats(statsData);
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

  // 🚀 Gestionnaire d'annulation de formulaire sécurisé
  const handleFormCancel = useCallback(() => {
    console.log('❌ Annulation du formulaire');
    opportunityFormModal.actions.close();
  }, [opportunityFormModal.actions]);

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
                onEdit={handleEditOpportunitySecure}
                onDelete={handleDeleteOpportunity}
                onStageChange={handleStageChange}
                onCreateQuote={handleCreateQuote}
                onMarkAsWon={handleMarkAsWon}
                onMarkAsLost={handleMarkAsLostSecure}
                onAddNew={handleAddNewSecure}
                activeId={activeId}
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
            opportunities={opportunities.filter(opp => 
              opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (opp.tierName && opp.tierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (opp.description && opp.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{opportunityFormModal.data ? "Modifier l'opportunité" : "Nouvelle opportunité"}</DialogTitle>
            <DialogDescription>
              {opportunityFormModal.data 
                ? "Modifiez les informations de cette opportunité commerciale."
                : "Créez une nouvelle opportunité commerciale en remplissant les informations ci-dessous."
              }
            </DialogDescription>
          </DialogHeader>
          
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
    </div>
  );
}