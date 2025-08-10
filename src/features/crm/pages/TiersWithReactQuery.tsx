/**
 * Version React Query de la page Tiers
 * Résout les problèmes de freeze des modales en éliminant la gestion d'état manuelle
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TiersList,
  TiersStats,
  TiersSearch,
  TiersTabs,
  TierCreationDialog,
  TierEntrepriseDialog,
  TierParticulierDialog,
  TierEntrepriseEditDialog,
  TierParticulierEditDialog,
  DeleteConfirmDialog,
  useTierUtils
} from "@/features/crm/components/tiers";
import { Tier } from "@/features/crm/types/crm.types";
import { useTiers, useTiersStats, useTiersPage } from "../hooks/useTiers";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";
import { useModalState } from "@/hooks/useModalState";
import { forceCleanModalOrphans } from "@/utils/modalDebug";
import { diagnoseUIFreeze, forceUnblockUI } from "@/utils/uiDebug";

export default function TiersWithReactQuery() {
  const navigate = useNavigate();
  
  // ✅ États locaux UI uniquement (pas de données serveur)
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingTier, setEditingTier] = useState<Tier | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntrepriseOpen, setEditEntrepriseOpen] = useState(false);
  const [editParticulierOpen, setEditParticulierOpen] = useState(false);
  
  // ✅ Gestion sécurisée des modales
  const deleteModal = useModalState<Tier>();
  
  // ✅ React Query hooks - gestion automatique des états serveur
  const {
    data: tiersResponse,
    isLoading: tiersLoading,
    error: tiersError,
    refetch: refetchTiers
  } = useTiers({
    page: currentPage,
    pageSize,
    search: searchQuery,
    type: activeTab
  });

  const {
    data: globalStats,
    isLoading: statsLoading
  } = useTiersStats(searchQuery);

  const { mutations, refreshAll, prefetchTierDetail } = useTiersPage();
  const { generateTabs } = useTierUtils();

  // ✅ Raccourci de déblocage d'urgence (Ctrl+Shift+U) et diagnostic (Ctrl+Shift+D)
  useEffect(() => {
    const handleEmergencyActions = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        // Diagnostic complet
        console.warn('🔍 DIAGNOSTIC UI COMPLET...');
        const diagnosis = diagnoseUIFreeze();
        console.table(diagnosis);
        alert(`Diagnostic terminé ! Vérifiez la console pour les détails.
        
Éléments bloquants: ${diagnosis.clickBlocking.blockingElements.length}
Overlays invisibles: ${diagnosis.styles.invisibleOverlays.length}
Éléments fixed: ${diagnosis.styles.fixedElements.length}
UI bloquée: ${diagnosis.performance.isBlocked}`);
      }
      
      if (e.ctrlKey && e.shiftKey && e.key === 'U') {
        console.warn('🚨 DÉBLOCAGE D\'URGENCE ACTIVÉ !');
        
        // 1. Diagnostic d'abord
        const diagnosis = diagnoseUIFreeze();
        console.log('📊 État avant déblocage:', diagnosis);
        
        // 2. Nettoyage des modales
        const modalsCleaned = forceCleanModalOrphans();
        
        // 3. Déblocage UI avancé
        const uiElementsCleaned = forceUnblockUI();
        
        // 4. Reset complet des états locaux
        setEditEntrepriseOpen(false);
        setEditParticulierOpen(false);
        setEditingTier(undefined);
        deleteModal.actions.forceClose();
        
        // 5. Diagnostic après
        setTimeout(() => {
          const postDiagnosis = diagnoseUIFreeze();
          console.log('📊 État après déblocage:', postDiagnosis);
        }, 100);
        
        alert(`Déblocage terminé !
        
Modales nettoyées: ${modalsCleaned}
Éléments UI supprimés: ${uiElementsCleaned}
        
Vérifiez la console pour plus de détails.`);
      }
    };

    document.addEventListener('keydown', handleEmergencyActions);
    return () => document.removeEventListener('keydown', handleEmergencyActions);
  }, [deleteModal]);

  // ✅ Données dérivées (pas d'état local)
  const tiers = tiersResponse?.results || [];
  const pagination = tiersResponse ? {
    count: tiersResponse.count,
    num_pages: Math.ceil(tiersResponse.count / pageSize),
    current_page: currentPage,
    page_size: pageSize,
    has_next: tiersResponse.next !== null,
    has_previous: tiersResponse.previous !== null,
    next_page: tiersResponse.next ? currentPage + 1 : null,
    previous_page: tiersResponse.previous ? currentPage - 1 : null,
  } : {
    count: 0,
    num_pages: 0,
    current_page: 1,
    page_size: pageSize,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null,
  };

  const countByType = globalStats ? {
    tous: globalStats.total,
    clients: globalStats.clients,
    fournisseurs: globalStats.fournisseurs,
    prospects: globalStats.prospects,
    sous_traitants: globalStats.sous_traitants
  } : {
    tous: 0,
    clients: 0,
    fournisseurs: 0,
    prospects: 0,
    sous_traitants: 0
  };

  const tabs = generateTabs(countByType);

  // ✅ Gestionnaires simplifiés - pas de rechargemement manuel
  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setCurrentPage(1);
      // React Query recharge automatiquement
    }
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchQuery(newSearch);
    setCurrentPage(1);
    // React Query recharge automatiquement avec debounce
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // React Query recharge automatiquement
  };

  // ✅ Actions tiers avec mutations React Query
  const handleView = (tier: Tier) => {
    navigate(`/crm/tiers/${tier.id}`);
  };

  const handleEdit = (tier: Tier) => {
    setEditingTier({...tier});
    
    // Précharger les détails pour l'édition
    prefetchTierDetail(tier.id);
    
    // Déterminer le type de modale
    setTimeout(() => {
      if (tier.siret && tier.siret.trim() !== '') {
        setEditEntrepriseOpen(true);
      } else {
        setEditParticulierOpen(true);
      }
    }, 50);
  };

  const handleDelete = (tier: Tier) => {
    console.log(`🗑️ Ouverture de la modale de suppression pour : ${tier.nom}`);
    deleteModal.actions.open(tier);
  };

  // ✅ Fermeture de modales d'édition avec nettoyage agressif
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditEntrepriseOpen(false);
      setEditParticulierOpen(false);
      
      setTimeout(() => {
        setEditingTier(undefined);
        
        // ✅ Nettoyage forcé pour éviter le blocage UI
        console.log('🧹 Nettoyage post-édition...');
        forceCleanModalOrphans();
      }, 400); // Délai plus long pour microservices
    }
  };

  // ✅ Confirmation suppression avec mutation
  const confirmDelete = async () => {
    if (!deleteModal.data || deleteModal.isSubmitting) {
      return;
    }

    try {
      deleteModal.actions.setSubmitting(true);
      await mutations.deleteTier.mutateAsync(deleteModal.data.id);
      deleteModal.actions.close();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      deleteModal.actions.setSubmitting(false);
    }
  };

  // ✅ Fermeture modale suppression simplifiée
  const handleDeleteDialogClose = (open: boolean) => {
    if (!open && !deleteModal.isSubmitting) {
      deleteModal.actions.close();
    }
  };

  // Actions contact
  const handleCall = (tier: Tier) => {
    console.log(`📞 Appel vers : ${tier.nom}`);
  };

  const handleEmail = (tier: Tier) => {
    console.log(`📧 Email vers : ${tier.nom}`);
  };

  // ✅ Gestion des erreurs centralisée
  const loading = tiersLoading || statsLoading;
  const error = tiersError ? `Erreur lors du chargement des tiers: ${tiersError}` : null;


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Tiers</h1>
        <Button 
          onClick={() => setCreateOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau tiers
        </Button>
      </div>

      {/* Stats */}
      <TiersStats counts={countByType} />

      {/* Search */}
      <TiersSearch 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange} 
      />

      {/* Main Content */}
      <div className="Beenaya-card">
        {/* Tabs */}
        <TiersTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Liste des tiers */}
        {error ? (
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </div>
        ) : (
          <>
            {/* Pagination info */}
            {pagination.count > 0 && (
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  {pagination.count} tiers trouvés • Page {pagination.current_page} sur {pagination.num_pages}
                </p>
              </div>
            )}

            {/* Table */}
            <TiersList 
              tiers={tiers}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCall={handleCall}
              onEmail={handleEmail}
              pagination={pagination}
              onPageChange={handlePageChange}
              disableInternalPagination={true}
            />
          </>
        )}
      </div>

      {/* ✅ Modales sans conflits d'état */}
      
      {/* Creation Dialog */}
      <TierCreationDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          // React Query gère automatiquement le refresh
          setCreateOpen(false);
        }}
      />

      {/* Edit Dialogs */}
      {editingTier && editEntrepriseOpen && (
        <TierEntrepriseEditDialog
          key={`entreprise-edit-${editingTier.id}`}
          open={editEntrepriseOpen}
          onOpenChange={handleDialogClose}
          onSuccess={() => {
            // La mutation React Query gère le refresh
            console.log('✅ Entreprise modifiée avec succès');
          }}
          tier={editingTier}
        />
      )}

      {editingTier && editParticulierOpen && (
        <TierParticulierEditDialog
          key={`particulier-edit-${editingTier.id}`}
          open={editParticulierOpen}
          onOpenChange={handleDialogClose}
          onSuccess={() => {
            // La mutation React Query gère le refresh
            console.log('✅ Particulier modifié avec succès');
          }}
          tier={editingTier}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={confirmDelete}
        tier={deleteModal.data || null}
        loading={deleteModal.isSubmitting}
      />

      {/* Performance Monitor */}
      <PerformanceMonitor enabled={true} position="bottom-right" />

      {/* Overlay de chargement pour les mutations */}
      <CrmLoadingOverlay 
        isVisible={mutations.createTier?.isPending || mutations.updateTier?.isPending || mutations.deleteTier?.isPending}
        message="Sauvegarde en cours..."
      />
    </div>
  );
}