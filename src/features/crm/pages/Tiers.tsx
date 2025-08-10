import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
import { tiersApi, TiersFilters, PaginationInfo, TiersGlobalStats } from "../api";
import { PerformanceMonitor } from "@/components/common/PerformanceMonitor";
import { useModalState } from "@/hooks/useModalState";
import { getCrmCachedData, setCrmCachedData, invalidateCrmCache } from "../utils/cacheUtils";

export default function Tiers() {
  const navigate = useNavigate();
  
  // 🏷️ Définir le titre de la page
  usePageTitle('Tiers');
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  
  // 🚀 Gestion sécurisée des modales avec useModalState
  const deleteModal = useModalState<Tier>();
  const editEntrepriseModal = useModalState<Tier>();
  const editParticulierModal = useModalState<Tier>();

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
    clients: 0,
    fournisseurs: 0,
    prospects: 0,
    sous_traitants: 0
  });

  const { countTiersByType, filterTiers, generateTabs } = useTierUtils();

  // 🎯 NOUVELLE LOGIQUE: Utiliser les vraies stats globales au lieu des stats locales
  // Convertir les stats globales au format attendu par les composants
  const countByType = {
    tous: globalStats.total,
    clients: globalStats.clients,        // ✅ CORRECTION : utiliser les clés du backend (pluriel)
    fournisseurs: globalStats.fournisseurs,  // ✅ CORRECTION : utiliser les clés du backend (pluriel)
    prospects: globalStats.prospects,    // ✅ CORRECTION : utiliser les clés du backend (pluriel)
    sous_traitants: globalStats.sous_traitants // ✅ CORRECTION : utiliser les clés du backend (pluriel)
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
    loadTiers(1, searchQuery, newTab, selectedTypeFilters); // Recharger avec le nouveau filtre
    // Note: Les stats ne changent pas selon l'onglet (elles montrent le total global)
  };

  const handleSearchChange = (newSearch: string) => {
    console.log("🔍 Changement de recherche:", newSearch);
    setSearchQuery(newSearch);
    setCurrentPage(1); // Remettre à la première page
    // Le débounce est géré par useEffect, pas ici
  };

  // Nouveau gestionnaire pour les filtres par type
  const handleTypeFiltersChange = (newTypeFilters: string[]) => {
    console.log("🎯 Changement de filtres par type:", newTypeFilters);
    setSelectedTypeFilters(newTypeFilters);
    setCurrentPage(1); // Remettre à la première page
    
    // Recharger immédiatement avec les nouveaux filtres
    loadTiers(1, searchQuery, activeTab, newTypeFilters);
    loadGlobalStats(searchQuery); // Recharger les stats si nécessaire
  };

  const handlePageChange = (newPage: number) => {
    console.log("📄 Changement de page:", newPage);
    setCurrentPage(newPage);
    loadTiers(newPage, searchQuery, activeTab, selectedTypeFilters);
    // Pas besoin de recharger les stats pour un changement de page
  };

  // 🚀 FONCTION OPTIMISÉE pour charger les tiers avec pagination et filtres + CACHE
  const loadTiers = async (
    page: number = currentPage, 
    search: string = searchQuery, 
    type: string = activeTab,
    typeFilters: string[] = selectedTypeFilters
  ) => {
    // Créer une clé de cache unique pour ces paramètres
    const cacheKey = `tiers_${JSON.stringify({ page, search, type, typeFilters, pageSize })}`;
    
    // Vérifier le cache d'abord
    const cachedData = getCrmCachedData(cacheKey);
    if (cachedData) {
      console.log("📦 [CRM CACHE] Cache hit pour les tiers");
      setTiers(cachedData.results);
      setPagination(cachedData.pagination);
      setCurrentPage(cachedData.pagination.current_page);
      setError(null);
      setLoading(false);
      return;
    }

    const startTime = performance.now(); // 📊 DÉBUT MESURE
    try {
      setLoading(true);
      console.log("🚀 Tiers.tsx: Chargement OPTIMISÉ des tiers", { page, search, type, typeFilters, pageSize });

      // Construire les filtres pour l'API
      const filters: TiersFilters = {
        page: page,
        page_size: pageSize,
      };
      
      // ✅ FILTRES PAR TYPE DE TIERS (Particulier vs Entreprise)
      if (typeFilters && typeFilters.length > 0) {
        // Utiliser les filtres de type sélectionnés dans le dropdown
        if (typeFilters.length === 1) {
          filters.type = typeFilters[0]; // 'particulier' ou 'entreprise'
        } else if (typeFilters.length === 2) {
          // Si les deux types sont sélectionnés, ne pas ajouter de filtre type (= tous)
          console.log("🔄 Tous les types sélectionnés, pas de filtre type");
        } else {
          filters.type = typeFilters[0]; // Prendre le premier par défaut
        }
        console.log("🎯 Filtre par type de tiers:", filters.type);
      }
      
      // ✅ FILTRES PAR RELATION COMMERCIALE (depuis les onglets)
      if (type && type !== "tous") {
        // Fallback : utiliser l'onglet actif si aucun filtre spécifique n'est sélectionné
        const typeMapping: Record<string, string> = {
          'clients': 'client',
          'prospects': 'prospect', 
          'fournisseurs': 'fournisseur',
          'sous_traitants': 'sous_traitant'
        };
        
        const backendRelation = typeMapping[type] || type;
        filters.relation = backendRelation;
      }
      
      // Ajouter la recherche si présente
      if (search && search.trim()) {
        filters.search = search.trim();
      }

      // Utiliser notre nouvelle API optimisée
      const response = await tiersApi.getTiers(filters);
      console.log("📊 Tiers.tsx: Réponse paginée reçue", response);

      // Transformer la réponse Django REST en format attendu
      const paginationInfo = {
        count: response.count,
        num_pages: Math.ceil(response.count / (filters.page_size || 10)),
        current_page: filters.page || 1,
        page_size: filters.page_size || 10,
        has_next: !!response.next,
        has_previous: !!response.previous,
        next_page: response.next ? (filters.page || 1) + 1 : null,
        previous_page: response.previous ? (filters.page || 1) - 1 : null
      };

      // Mettre à jour les données et la pagination
      setTiers(response.results);
      setPagination(paginationInfo);
      setCurrentPage(paginationInfo.current_page);
      setError(null);
      
      // Mettre en cache la réponse
      setCrmCachedData(cacheKey, { results: response.results, pagination: paginationInfo });
      
      const endTime = performance.now(); // 📊 FIN MESURE
      const loadTime = endTime - startTime;
      console.log(`✅ ${response.results.length} tiers chargés sur ${paginationInfo.count} total`);
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

  // 📊 FONCTION pour charger les vraies stats globales + CACHE
  const loadGlobalStats = async (search: string = searchQuery) => {
    // Créer une clé de cache pour les stats
    const cacheKey = `tiers_stats_${search}`;
    
    // Vérifier le cache d'abord
    const cachedStats = getCrmCachedData(cacheKey);
    if (cachedStats) {
      console.log("📦 [CRM CACHE] Cache hit pour les stats");
      setGlobalStats(cachedStats);
      return;
    }

    const startTime = performance.now(); // 📊 DÉBUT MESURE STATS
    try {
      console.log("📊 Chargement des stats globales", { search });
      const stats = await tiersApi.getStats(search);
      setGlobalStats(stats);
      
      // Mettre en cache les stats
      setCrmCachedData(cacheKey, stats);
      
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


  // 🚀 Charger les tiers ET les stats au montage du composant
  useEffect(() => {
    loadTiers(1, "", "tous", []); // Charger la première page, sans recherche, tous les types, sans filtres
    loadGlobalStats(""); // Charger les stats globales
  }, []);

  // 🔄 Débounce pour la recherche (éviter trop d'appels API)
  useEffect(() => {
    if (searchQuery !== undefined) { // Vérifier !== undefined pour inclure les chaînes vides
      const timeoutId = setTimeout(() => {
        loadTiers(1, searchQuery, activeTab, selectedTypeFilters);
        loadGlobalStats(searchQuery); // Recharger les stats avec la recherche
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  // Gérer la fermeture des modales d'édition
  const handleEditDialogClose = (modal: typeof editEntrepriseModal, open: boolean) => {
    if (!open && !modal.isSubmitting) {
      console.log('🚪 Fermeture sécurisée de la modale d\'édition');
      modal.actions.close();
    }
  };

  // Gérer la suppression d'un tiers
  const handleDelete = (tier: Tier) => {
    console.log(`🗑️ Ouverture de la modale de suppression pour : ${tier.nom}`);
    deleteModal.actions.open(tier);
  };

  // Confirmer la suppression d'un tiers - MÊME LOGIQUE que création/édition
  const confirmDelete = async () => {
    if (!deleteModal.data || deleteModal.isSubmitting) {
      console.warn('⚠️ Suppression déjà en cours ou aucune donnée - ignorée');
      return;
    }
    
    try {
      deleteModal.actions.setSubmitting(true);
      await tiersApi.deleteTier(deleteModal.data.id);
      
      console.log(`✅ Tier ${deleteModal.data.nom} supprimé avec succès`);
      
      // Invalider le cache après suppression
      invalidateCrmCache('suppression tier');
      
      // 🚀 FERMER D'ABORD la modale pour libérer l'UI
      deleteModal.actions.close();
      
      // 🔄 PUIS recharger APRÈS un délai pour éviter les conflits
      setTimeout(async () => {
        try {
          await Promise.all([
            loadTiers(currentPage, searchQuery, activeTab, selectedTypeFilters), // Recharger la liste actuelle
            loadGlobalStats(searchQuery) // Recharger les stats avec la recherche actuelle
          ]);
        } catch (reloadError) {
          console.error('❌ Erreur lors du rechargement après suppression:', reloadError);
          // L'UI reste fonctionnelle même si le rechargement échoue
        }
      }, 100); // Délai minimal pour permettre à la modale de se fermer complètement
      
    } catch (err) {
      setError("Erreur lors de la suppression du tier");
      console.error('❌ Erreur lors de la suppression:', err);
      // En cas d'erreur, ne pas fermer la modale pour permettre de réessayer
    } finally {
      deleteModal.actions.setSubmitting(false);
    }
  };

  // Gérer la fermeture de la modale de suppression - VERSION OPTIMISÉE MICROSERVICES
  const handleDeleteDialogClose = (open: boolean) => {
    if (!open && !deleteModal.isSubmitting) {
      console.log('🚪 Fermeture sécurisée de la modale de suppression');
      deleteModal.actions.close();
      
      // 🛡️ NETTOYAGE adapté aux microservices avec latence élevée
      setTimeout(() => {
        const overlays = document.querySelectorAll('[data-radix-popper-content-wrapper], [data-radix-focus-guard], [data-radix-portal]');
        overlays.forEach(el => {
          if (el.parentNode) {
            console.log('🧹 Suppression overlay orphelin:', el);
            el.parentNode.removeChild(el);
          }
        });
        
        // Débloquer le scroll au cas où
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      }, 500); // Délai plus long pour les microservices avec latence
      
      // 🔄 Recharger APRÈS fermeture complète pour éviter les conflits
      setTimeout(async () => {
        try {
          await loadTiers(currentPage, searchQuery, activeTab, selectedTypeFilters);
        } catch (reloadError) {
          console.error('❌ Erreur lors du rechargement après fermeture:', reloadError);
          // L'UI reste fonctionnelle même si le rechargement échoue
        }
      }, 150); // Délai plus long pour l'annulation
    }
  };

  // Gérer l'édition d'un tiers
  const handleEdit = (tier: Tier) => {
    console.log(`✏️ Édition du tiers : ${tier.nom}`, {
      type: tier.type,
      siret: tier.siret,
      hasValidSiret: tier.siret && tier.siret.trim() !== ''
    });
    
    // Déterminer le type de tiers - utiliser le champ 'type' en priorité
    const isEntreprise = tier.type === 'entreprise' || 
                        (tier.siret && tier.siret.trim() !== '') ||
                        tier.type_display === 'Entreprise';
    
    console.log(`🏢 Type détecté: ${isEntreprise ? 'ENTREPRISE' : 'PARTICULIER'}`);
    
    if (isEntreprise) {
      editEntrepriseModal.actions.open(tier);
    } else {
      editParticulierModal.actions.open(tier);
    }
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
          // Invalider le cache après création
          invalidateCrmCache('création tier');
          
          // 🚀 Phase 2 : Navigation automatique vers la fiche détail du tier créé
          if (createdTierId) {
            console.log("🎯 Navigation automatique vers la fiche détail du tier:", createdTierId);
            navigate(`/tiers/${createdTierId}`);
          } else {
            // Fallback : Recharger la liste ET les stats si pas d'ID
            console.warn("⚠️ Pas d'ID de tier reçu, rechargement de la liste et des stats");
            await Promise.all([
              loadTiers(1, "", "tous", []),
              loadGlobalStats()
            ]);
          }
        }}
      />

      {/* Stats */}
      <TiersStats counts={countByType} />

      {/* Search & Filters */}
      <TiersSearch 
        searchQuery={searchQuery} 
        onSearchChange={handleSearchChange}
        selectedTypes={selectedTypeFilters}
        onTypeFiltersChange={handleTypeFiltersChange}
      />

      {/* Main Content */}
      <div className="Beenaya-card">
        {/* Tabs */}
        <TiersTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

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

        {/* 🎯 NOUVELLE PAGINATION - Style bibliothèque d'ouvrages */}
        {pagination.count > 0 && (
          <div className="flex items-center justify-between mt-4 px-6 pb-4">
            <div className="text-sm text-neutral-500">
              Affichage de {((currentPage - 1) * pageSize) + 1} à {Math.min(currentPage * pageSize, pagination.count)} sur {pagination.count} tiers
            </div>
            {/* Afficher les contrôles de navigation seulement s'il y a plus d'une page */}
            {pagination.num_pages > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_previous}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.num_pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.num_pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.num_pages - 2) {
                      pageNum = pagination.num_pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={i}
                        variant={pageNum === currentPage ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-sm text-neutral-400">
                Page 1 sur 1
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog pour éditer une entreprise */}
      {editEntrepriseModal.data && (
        <TierEntrepriseEditDialog
          key={`entreprise-edit-${editEntrepriseModal.data.id}`}
          open={editEntrepriseModal.isOpen}
          onOpenChange={(open) => handleEditDialogClose(editEntrepriseModal, open)}
          onSuccess={async () => {
            console.log('🎉 TierEntrepriseEditDialog: onSuccess appelé');
            
            // Invalider le cache après édition
            invalidateCrmCache('édition tier entreprise');
            
            // ⏰ ATTENDRE que le nettoyage de useModalState soit terminé
            setTimeout(async () => {
              try {
                console.log('🔄 Rechargement des données (après délai)...', { currentPage, searchQuery, activeTab });
                await Promise.all([
                  loadTiers(currentPage, searchQuery, activeTab, selectedTypeFilters),
                  loadGlobalStats(searchQuery)
                ]);
                console.log('✅ Rechargement terminé avec succès');
              } catch (error) {
                console.error('❌ Erreur lors du rechargement:', error);
              }
            }, 500); // Délai pour éviter le conflit avec useModalState
          }}
          tier={editEntrepriseModal.data}
        />
      )}

      {/* Dialog pour éditer un particulier */}
      {editParticulierModal.data && (
        <TierParticulierEditDialog
          key={`particulier-edit-${editParticulierModal.data.id}`}
          open={editParticulierModal.isOpen}
          onOpenChange={(open) => handleEditDialogClose(editParticulierModal, open)}
          onSuccess={async () => {
            console.log('🎉 TierParticulierEditDialog: onSuccess appelé');
            
            // Invalider le cache après édition
            invalidateCrmCache('édition tier particulier');
            
            // ⏰ ATTENDRE que le nettoyage de useModalState soit terminé
            setTimeout(async () => {
              try {
                console.log('🔄 Rechargement des données (après délai)...', { currentPage, searchQuery, activeTab });
                await Promise.all([
                  loadTiers(currentPage, searchQuery, activeTab, selectedTypeFilters),
                  loadGlobalStats(searchQuery)
                ]);
                console.log('✅ Rechargement terminé avec succès');
              } catch (error) {
                console.error('❌ Erreur lors du rechargement:', error);
              }
            }, 500); // Délai pour éviter le conflit avec useModalState
          }}
          tier={editParticulierModal.data}
          />
      )}

      {/* Confirmation dialog for deleting tiers */}
      <DeleteConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={handleDeleteDialogClose}
        onConfirm={confirmDelete}
        tier={deleteModal.data || null}
        loading={deleteModal.isSubmitting}
      />

      {/* 📊 Performance Monitor */}
      <PerformanceMonitor enabled={true} position="bottom-right" />
    </div>
  );
}