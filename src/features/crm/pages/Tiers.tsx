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
import { Tier } from "@/features/crm/types/tiers.types";
import { tiersApi, TiersFilters, PaginationInfo, TiersGlobalStats } from "../api";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";

export default function Tiers() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTier, setEditingTier] = useState<Tier | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<Tier | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntrepriseOpen, setEditEntrepriseOpen] = useState(false);
  const [editParticulierOpen, setEditParticulierOpen] = useState(false);

  // 🚀 NOUVEAUX ÉTATS POUR LA PAGINATION OPTIMISÉE
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    num_pages: 0,
    current_page: 1,
    page_size: 10,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null
  });

  // 📊 NOUVEL ÉTAT POUR LES VRAIES STATS GLOBALES
  const [globalStats, setGlobalStats] = useState<TiersGlobalStats>({
    total: 0,
    client: 0,
    fournisseur: 0,
    prospect: 0,
    sous_traitant: 0
  });

  const { countTiersByType, filterTiers, generateTabs } = useTierUtils();

  // 🎯 NOUVELLE LOGIQUE: Utiliser les vraies stats globales au lieu des stats locales
  // Convertir les stats globales au format attendu par les composants
  const countByType = {
    tous: globalStats.total,
    clients: globalStats.client,
    fournisseurs: globalStats.fournisseur,
    prospects: globalStats.prospect,
    sous_traitants: globalStats.sous_traitant
  };

  // Générer les onglets avec les compteurs (maintenant basés sur les vraies stats)
  const tabs = generateTabs(countByType);

  // 🚀 Les tiers sont déjà filtrés côté backend - pas besoin de filtrage frontend
  const displayedTiers = tiers; // Directement les tiers reçus de l'API

  // 🔄 Gestionnaires pour les changements qui nécessitent un rechargement
  const handleTabChange = (newTab: string) => {
    console.log("🔄 Changement d'onglet:", newTab);
    setActiveTab(newTab);
    setCurrentPage(1); // Remettre à la première page
    loadTiers(1, searchQuery, newTab); // Recharger avec le nouveau filtre
    // Note: Les stats ne changent pas selon l'onglet (elles montrent le total global)
  };

  const handleSearchChange = (newSearch: string) => {
    console.log("🔍 Changement de recherche:", newSearch);
    setSearchQuery(newSearch);
    setCurrentPage(1); // Remettre à la première page
    // Le débounce est géré par useEffect, pas ici
  };

  const handlePageChange = (newPage: number) => {
    console.log("📄 Changement de page:", newPage);
    setCurrentPage(newPage);
    loadTiers(newPage, searchQuery, activeTab);
    // Pas besoin de recharger les stats pour un changement de page
  };

  // 🚀 FONCTION OPTIMISÉE pour charger les tiers avec pagination
  const loadTiers = async (page: number = currentPage, search: string = searchQuery, type: string = activeTab) => {
    const startTime = performance.now(); // 📊 DÉBUT MESURE
    try {
      setLoading(true);
      console.log("🚀 Tiers.tsx: Chargement OPTIMISÉ des tiers", { page, search, type, pageSize });

      // Construire les filtres pour l'API
      const filters: TiersFilters = {
        page: page,
        page_size: pageSize,
      };
      
      // Ajouter le filtre de type seulement si ce n'est pas "tous"
      if (type && type !== "tous") {
        filters.type = type;
      }
      
      // Ajouter la recherche si présente
      if (search && search.trim()) {
        filters.search = search.trim();
      }

      // Utiliser notre nouvelle API optimisée
      const response = await tiersApi.getTiers(filters);
      console.log("📊 Tiers.tsx: Réponse paginée reçue", response);

      // Mettre à jour les données et la pagination
      setTiers(response.results);
      setPagination(response.pagination);
      setCurrentPage(response.pagination.current_page);
      setError(null);
      
      const endTime = performance.now(); // 📊 FIN MESURE
      const loadTime = endTime - startTime;
      console.log(`✅ ${response.results.length} tiers chargés sur ${response.pagination.count} total`);
      console.log(`⚡ PERFORMANCE: Chargement terminé en ${loadTime.toFixed(2)}ms`);
    } catch (err) {
      const endTime = performance.now(); // 📊 FIN MESURE (même en cas d'erreur)
      const loadTime = endTime - startTime;
      setError("Erreur lors du chargement des tiers");
      console.error("🚨 Tiers.tsx: Erreur critique", err);
      console.log(`❌ PERFORMANCE: Échec après ${loadTime.toFixed(2)}ms`);
      // En cas d'erreur, réinitialiser
      setTiers([]);
      setPagination({
        count: 0,
        num_pages: 0,
        current_page: 1,
        page_size: pageSize,
        has_next: false,
        has_previous: false,
        next_page: null,
        previous_page: null
      });
    } finally {
      setLoading(false);
    }
  };

  // 📊 FONCTION pour charger les vraies stats globales
  const loadGlobalStats = async (search: string = searchQuery) => {
    const startTime = performance.now(); // 📊 DÉBUT MESURE STATS
    try {
      console.log("📊 Chargement des stats globales", { search });
      const stats = await tiersApi.getStats(search);
      setGlobalStats(stats);
      
      const endTime = performance.now(); // 📊 FIN MESURE STATS
      const loadTime = endTime - startTime;
      console.log("✅ Stats globales chargées:", stats);
      console.log(`⚡ PERFORMANCE STATS: Chargées en ${loadTime.toFixed(2)}ms`);
    } catch (err) {
      const endTime = performance.now(); // 📊 FIN MESURE STATS (erreur)
      const loadTime = endTime - startTime;
      console.error("🚨 Erreur lors du chargement des stats globales:", err);
      console.log(`❌ PERFORMANCE STATS: Échec après ${loadTime.toFixed(2)}ms`);
      // Garder les stats précédentes en cas d'erreur
    }
  };

  // 🔄 MÉTHODE LEGACY pour compatibilité temporaire (ne charge que la première page)
  const loadTiersLegacy = async () => {
    try {
      setLoading(true);
      console.log("⚠️ Utilisation de la méthode legacy");
      
      const response = await tiersApi.getTiersLegacy();
      setTiers(response);
      setError(null);
    } catch (err) {
      setError("Erreur lors du chargement des tiers (legacy)");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Forcer le rafraîchissement de la page après les actions
  useEffect(() => {
    // Ce useEffect sera déclenché chaque fois que forceUpdate change
    // Il ne fait rien directement, mais force React à re-rendre le composant
  }, [forceUpdate]);

  // 🚀 Charger les tiers ET les stats au montage du composant
  useEffect(() => {
    loadTiers(1, "", "tous"); // Charger la première page, sans recherche, tous les types
    loadGlobalStats(""); // Charger les stats globales
  }, []);

  // 🔄 Débounce pour la recherche (éviter trop d'appels API)
  useEffect(() => {
    if (searchQuery !== undefined) { // Vérifier !== undefined pour inclure les chaînes vides
      const timeoutId = setTimeout(() => {
        loadTiers(1, searchQuery, activeTab);
        loadGlobalStats(searchQuery); // Recharger les stats avec la recherche
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  // Gérer la fermeture de la modale d'édition
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Fermer les modales d'édition
      setEditEntrepriseOpen(false);
      setEditParticulierOpen(false);
      
      // Attendre que l'animation de fermeture soit terminée avant de réinitialiser
      setTimeout(() => {
        setEditingTier(undefined);
        // Forcer le rafraîchissement
        setForceUpdate(prev => prev + 1);
      }, 100);
    }
  };

  // Gérer la suppression d'un tiers
  const handleDelete = (tier: Tier) => {
    setTierToDelete({...tier});
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression d'un tiers
  const confirmDelete = async () => {
    if (tierToDelete) {
      try {
        setLoading(true);
        await tiersApi.deleteTier(tierToDelete.id);
        setTiers(prev => prev.filter(t => t.id !== tierToDelete.id));
        setDeleteDialogOpen(false);
        setTierToDelete(null);
      } catch (err) {
        setError("Erreur lors de la suppression du tier");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Gérer la fermeture de la modale de suppression
  const handleDeleteDialogClose = (open: boolean) => {
    if (!open) {
      setDeleteDialogOpen(false);
      // Attendre que l'animation de fermeture soit terminée avant de réinitialiser
      setTimeout(() => {
        setTierToDelete(null);
        // Forcer le rafraîchissement
        setForceUpdate(prev => prev + 1);
      }, 100);
    } else {
      setDeleteDialogOpen(true);
    }
  };

  // Gérer l'édition d'un tiers
  const handleEdit = (tier: Tier) => {
    // Définir d'abord le tier à éditer avec une copie profonde
    setEditingTier({...tier});
    
    // Déterminer le type de tiers et ouvrir la modale appropriée
    setTimeout(() => {
      // Si le tier a un SIRET, c'est une entreprise, sinon un particulier
      if (tier.siret && tier.siret.trim() !== '') {
        setEditEntrepriseOpen(true);
      } else {
        setEditParticulierOpen(true);
      }
    }, 50);
  };

  // Gérer la vue détaillée d'un tiers
  const handleView = (tier: Tier) => {
    navigate(`/tiers/${tier.id}`);
  };

  // Gérer l'appel téléphonique (conservé pour référence)
  const handleCall = (tier: Tier) => {
    window.open(`tel:${tier.phone.replace(/\s/g, "")}`);
  };

  // Gérer l'envoi d'email (conservé pour référence)
  const handleEmail = (tier: Tier) => {
    window.open(`mailto:${tier.email}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Tiers</h1>
            <p className="text-Beenaya-100 mt-1">
              Gérez vos clients, fournisseurs, prospects et sous-traitants
            </p>
          </div>
          <Button 
            className="gap-2 bg-white text-Beenaya-900 hover:bg-white/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nouveau tiers
          </Button>
        </div>
      </div>

      {/* Modale de création de tiers (workflow) */}
      <TierCreationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={async (createdTierId) => {
          // 🚀 Phase 2 : Navigation automatique vers la fiche détail du tier créé
          if (createdTierId) {
            console.log("🎯 Navigation automatique vers la fiche détail du tier:", createdTierId);
            navigate(`/tiers/${createdTierId}`);
          } else {
            // Fallback : Recharger la liste ET les stats si pas d'ID
            console.warn("⚠️ Pas d'ID de tier reçu, rechargement de la liste et des stats");
            await Promise.all([
              loadTiers(),
              loadGlobalStats()
            ]);
          }
        }}
      />

      {/* Stats */}
      <TiersStats counts={countByType} />

      {/* Filters */}
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

        {/* 📊 Informations de pagination */}
        {pagination.count > 0 && (
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, pagination.count)} sur {pagination.count} tiers
              </div>
              <div className="flex items-center gap-4">
                <div>Page {currentPage} sur {pagination.num_pages}</div>
                {/* Contrôles de pagination */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagination.has_previous}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!pagination.has_next}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <TiersList 
          tiers={displayedTiers}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCall={handleCall}
          onEmail={handleEmail}
          disableInternalPagination={true}
        />
      </div>

      {/* Dialog pour éditer une entreprise */}
      {editingTier && editEntrepriseOpen && (
        <TierEntrepriseEditDialog
          key={`entreprise-edit-${editingTier.id}-${forceUpdate}`}
          open={editEntrepriseOpen}
          onOpenChange={(open) => {
            handleDialogClose(open);
            if (!open) loadTiers();
          }}
          onSuccess={loadTiers}
          tier={editingTier}
        />
      )}

      {/* Dialog pour éditer un particulier */}
      {editingTier && editParticulierOpen && (
        <TierParticulierEditDialog
          key={`particulier-edit-${editingTier.id}-${forceUpdate}`}
          open={editParticulierOpen}
          onOpenChange={(open) => {
            handleDialogClose(open);
            if (!open) loadTiers();
          }}
          onSuccess={loadTiers}
          tier={editingTier}
        />
      )}

      {/* Confirmation dialog for deleting tiers */}
      <DeleteConfirmDialog
        key={`delete-${tierToDelete?.id || 'none'}-${forceUpdate}`}
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={confirmDelete}
        tier={tierToDelete}
      />

      {/* 📊 Performance Monitor */}
      <PerformanceMonitor enabled={true} position="bottom-right" />
    </div>
  );
}
