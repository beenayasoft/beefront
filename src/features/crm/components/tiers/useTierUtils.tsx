import { Badge } from "@/components/ui/badge";
import { Tier } from "../../types"; // ✅ CORRECTION : Utiliser les vrais types CRM

export function useTierUtils() {
  // Générer un badge pour le type de tiers
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "client":
        return <Badge className="Beenaya-badge-primary">Client</Badge>;
      case "fournisseur":
        return <Badge className="Beenaya-badge-warning">Fournisseur</Badge>;

      case "sous_traitant":
        return <Badge className="Beenaya-badge-info">Sous-traitant</Badge>;
      case "prospect":
        return <Badge className="Beenaya-badge-neutral">Prospect</Badge>;
      default:
        return <Badge className="Beenaya-badge-neutral">—</Badge>;
    }
  };

  // Générer un badge pour le statut du tiers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="Beenaya-badge-success">Actif</Badge>;
      case "inactive":
        return <Badge className="Beenaya-badge-neutral">Inactif</Badge>;
      default:
        return <Badge className="Beenaya-badge-neutral">—</Badge>;
    }
  };

  // Compter les tiers par type
  const countTiersByType = (tiers: Tier[]) => {
    return {
      tous: tiers.length,
      clients: tiers.filter((t) => t.relation === "client").length,
      fournisseurs: tiers.filter((t) => t.relation === "fournisseur").length,
      "sous_traitants": tiers.filter((t) => t.relation === "sous_traitant").length,
      prospects: tiers.filter((t) => t.relation === "prospect").length,
    };
  };

  // Filtrer les tiers par type et recherche
  const filterTiers = (tiers: Tier[], activeTab: string, searchQuery: string) => {
    return tiers.filter((tier) => {
      // Filtre par onglet - mapper l'onglet à la relation backend
      if (activeTab !== "tous") {
        const typeMapping: Record<string, string> = {
          'clients': 'client',
          'prospects': 'prospect', 
          'fournisseurs': 'fournisseur',
          'sous_traitants': 'sous_traitant'
        };
        
        const expectedRelation = typeMapping[activeTab] || activeTab;
        if (tier.relation !== expectedRelation) {
          return false;
        }
      }

      // Filtre par recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tier.nom?.toLowerCase().includes(query) ||
          tier.siret?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  // Générer les onglets avec les compteurs
  const generateTabs = (countByType: Record<string, number>) => {
    return [
      { id: "tous", label: "Tous", count: countByType.tous },
      { id: "clients", label: "Clients", count: countByType.clients },
      { id: "fournisseurs", label: "Fournisseurs", count: countByType.fournisseurs },

      { id: "sous_traitants", label: "Sous_traitants", count: countByType["sous_traitants"] },
      { id: "prospects", label: "Prospects", count: countByType.prospects },
    ];
  };

  return {
    getTypeBadge,
    getStatusBadge,
    countTiersByType,
    filterTiers,
    generateTabs,
  };
} 