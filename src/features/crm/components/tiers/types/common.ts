/**
 * Types de tiers communs pour entreprises et particuliers
 * 
 * RÈGLES MÉTIER :
 * - Un tier ne peut pas être à la fois "prospect" et "client"
 * - Tous les autres types peuvent être combinés
 */

// Types de base communs (selon le modèle Django backend)
export type CommonTierFlags = "client" | "prospect" | "fournisseur" | "sous_traitant";

// Configuration des flags avec informations détaillées
export interface TierFlagConfig {
  id: CommonTierFlags;
  label: string;
  description: string;
  color: string;
  applicableFor: ("entreprise" | "particulier")[];
  exclusiveWith?: CommonTierFlags[];
}

// Configuration complète des flags
export const tierFlagsConfig: TierFlagConfig[] = [
  {
    id: "client",
    label: "Client",
    description: "Tier qui achète nos services ou produits",
    color: "bg-green-100 text-green-800",
    applicableFor: ["entreprise", "particulier"],
    exclusiveWith: ["prospect"], // Un client ne peut pas être prospect
  },
  {
    id: "prospect",
    label: "Prospect",
    description: "Tier potentiel, pas encore client",
    color: "bg-yellow-100 text-yellow-800",
    applicableFor: ["entreprise", "particulier"],
    exclusiveWith: ["client"], // Un prospect ne peut pas être client
  },
  {
    id: "fournisseur",
    label: "Fournisseur",
    description: "Tier qui nous vend des services ou produits",
    color: "bg-blue-100 text-blue-800",
    applicableFor: ["entreprise", "particulier"],
  },

  {
    id: "sous_traitant",
    label: "Sous-traitant",
    description: "Tier qui effectue des travaux pour notre compte",
    color: "bg-indigo-100 text-indigo-800",
    applicableFor: ["entreprise", "particulier"],
  },
];

// Fonction pour obtenir les flags applicables selon le type d'entité
export const getApplicableFlags = (entityType: "entreprise" | "particulier"): TierFlagConfig[] => {
  return tierFlagsConfig.filter(flag => flag.applicableFor.includes(entityType));
};

// Fonction pour valider les flags sélectionnés
export const validateTierFlags = (selectedFlags: CommonTierFlags[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (selectedFlags.length === 0) {
    errors.push("Sélectionnez au moins un type de relation");
    return { isValid: false, errors };
  }
  
  // Vérifier les exclusions (prospect vs client)
  const hasClient = selectedFlags.includes("client");
  const hasProspect = selectedFlags.includes("prospect");
  
  if (hasClient && hasProspect) {
    errors.push("Un tier ne peut pas être à la fois client et prospect");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction pour obtenir les flags compatibles avec une sélection
export const getCompatibleFlags = (
  currentFlags: CommonTierFlags[],
  entityType: "entreprise" | "particulier"
): CommonTierFlags[] => {
  const applicableFlags = getApplicableFlags(entityType);
  
  // Si aucun flag sélectionné, tous sont compatibles
  if (currentFlags.length === 0) {
    return applicableFlags.map(f => f.id);
  }
  
  // Filtrer les flags incompatibles
  const incompatibleFlags = new Set<CommonTierFlags>();
  
  currentFlags.forEach(selectedFlag => {
    const flagConfig = tierFlagsConfig.find(f => f.id === selectedFlag);
    if (flagConfig?.exclusiveWith) {
      flagConfig.exclusiveWith.forEach(excluded => incompatibleFlags.add(excluded));
    }
  });
  
  return applicableFlags
    .map(f => f.id)
    .filter(flagId => !incompatibleFlags.has(flagId));
};

// Fonction pour auto-corriger une sélection de flags
export const autoCorrectFlags = (selectedFlags: CommonTierFlags[]): CommonTierFlags[] => {
  const hasClient = selectedFlags.includes("client");
  const hasProspect = selectedFlags.includes("prospect");
  
  // Si client et prospect sont sélectionnés, garder seulement client (priorité business)
  if (hasClient && hasProspect) {
    return selectedFlags.filter(flag => flag !== "prospect");
  }
  
  return selectedFlags;
};

// Fonction pour obtenir la configuration d'un flag
export const getFlagConfig = (flagId: CommonTierFlags): TierFlagConfig | undefined => {
  return tierFlagsConfig.find(f => f.id === flagId);
};

// Fonction pour formater l'affichage des flags
export const formatFlagsDisplay = (flags: CommonTierFlags[]): string => {
  if (flags.length === 0) return "Aucun type défini";
  
  return flags
    .map(flagId => {
      const config = getFlagConfig(flagId);
      return config?.label || flagId;
    })
    .join(", ");
};

// Hook pour la logique de gestion des flags
export const useTierFlags = (
  entityType: "entreprise" | "particulier",
  initialFlags: CommonTierFlags[] = []
) => {
  const applicableFlags = getApplicableFlags(entityType);
  
  const validateSelection = (selectedFlags: CommonTierFlags[]) => {
    return validateTierFlags(selectedFlags);
  };
  
  const getSelectableFlags = (currentSelection: CommonTierFlags[]) => {
    return getCompatibleFlags(currentSelection, entityType);
  };
  
  const correctSelection = (selectedFlags: CommonTierFlags[]) => {
    return autoCorrectFlags(selectedFlags);
  };
  
  return {
    applicableFlags,
    validateSelection,
    getSelectableFlags,
    correctSelection,
  };
}; 