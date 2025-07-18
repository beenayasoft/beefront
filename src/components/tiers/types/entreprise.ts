import { z } from "zod";
import { CommonTierFlags, getApplicableFlags } from "./common";

// Types spécifiques aux entreprises (utilise les types communs)
export type EntrepriseFlags = CommonTierFlags;

// Récupération des flags applicables aux entreprises
export const entrepriseFlags = getApplicableFlags("entreprise");

// Interface pour les contacts d'entreprise
export interface ContactEntreprise {
  id?: string;
  nom?: string;
  prenom?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  contactPrincipalDevis?: boolean;
  contactPrincipalFacture?: boolean;
}

// Interface pour les contacts pendant l'édition (champs optionnels)
export interface ContactEntrepriseForm {
  id?: string;
  nom?: string;
  prenom?: string;
  fonction?: string;
  email?: string;
  telephone?: string;
  contactPrincipalDevis?: boolean;
  contactPrincipalFacture?: boolean;
}

// Interface pour les adresses d'entreprise
export interface AdresseEntreprise {
  id?: string;
  libelle?: string; // "Siège social", "Facturation", "Livraison", etc.
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  facturation?: boolean;
}

// Interface pour les adresses pendant l'édition (champs optionnels)
export interface AdresseEntrepriseForm {
  id?: string;
  libelle?: string;
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  facturation?: boolean;
}

// Schéma de validation pour entreprise
export const entrepriseFormSchema = z.object({
  // SEUL CHAMP OBLIGATOIRE : Raison sociale
  raisonSociale: z.string().min(2, "La raison sociale doit contenir au moins 2 caractères"),
  
  // Champs optionnels pour entreprise
  siret: z.string().optional(),
  tva: z.string().optional(),
  numeroTVA: z.string().optional(),
  codeNAF: z.string().optional(),
  formeJuridique: z.string().optional(),
  capitalSocial: z.string().optional(),
  
  // Relation commerciale unique (obligatoire)
  flags: z.array(z.string()).min(1, "Sélectionnez une relation commerciale").max(1, "Une seule relation peut être sélectionnée"),
  
  // Statut
  status: z.enum(["active", "inactive"]).default("active"),
  
    // Contacts multiples (optionnels)
  contacts: z.array(z.object({
    nom: z.string().optional(),
    prenom: z.string().optional(),
    fonction: z.string().optional(),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    telephone: z.string().optional(),
    contactPrincipalDevis: z.boolean().default(false),
    contactPrincipalFacture: z.boolean().default(false),
  })).default([]),

  // Adresses multiples (optionnelles)
  adresses: z.array(z.object({
    libelle: z.string().optional(),
    rue: z.string().optional(),
    ville: z.string().optional(),
    codePostal: z.string().optional(),
    pays: z.string().default("France"),
    facturation: z.boolean().default(false),
  })).default([]),
});

// Type pour les valeurs du formulaire entreprise
export type EntrepriseFormValues = z.infer<typeof entrepriseFormSchema>;

// Valeurs par défaut pour une nouvelle entreprise
export const defaultEntrepriseValues: EntrepriseFormValues = {
  raisonSociale: "",
  siret: "",
  numeroTVA: "",
  codeNAF: "",
  formeJuridique: "",
  capitalSocial: "",
  flags: [], // Démarrer avec aucune sélection - l'utilisateur doit choisir
  status: "active",
  contacts: [],
  adresses: [],
};

// Types pour les formes juridiques communes
export const formesJuridiques = [
  { value: "SARL", label: "SARL - Société à Responsabilité Limitée" },
  { value: "SAS", label: "SAS - Société par Actions Simplifiée" },
  { value: "SASU", label: "SASU - Société par Actions Simplifiée Unipersonnelle" },
  { value: "EURL", label: "EURL - Entreprise Unipersonnelle à Responsabilité Limitée" },
  { value: "SA", label: "SA - Société Anonyme" },
  { value: "SNC", label: "SNC - Société en Nom Collectif" },
  { value: "EI", label: "EI - Entreprise Individuelle" },
  { value: "Auto-entrepreneur", label: "Auto-entrepreneur / Micro-entreprise" },
  { value: "Association", label: "Association loi 1901" },
  { value: "Autre", label: "Autre forme juridique" },
];

// Fonction pour obtenir les champs obligatoires
export const getRequiredFieldsEntreprise = (): string[] => {
  return ["raisonSociale", "flags"];
};

// Fonction pour valider une entreprise
export const validateEntreprise = (values: EntrepriseFormValues): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!values.raisonSociale || values.raisonSociale.trim().length === 0) {
    errors.push("La raison sociale est obligatoire");
  }
  
  if (!values.flags || values.flags.length === 0) {
    errors.push("Sélectionnez une relation commerciale");
  } else if (values.flags.length > 1) {
    errors.push("Une seule relation commerciale peut être sélectionnée");
  }
  
  // Validation SIRET si fourni
  if (values.siret && values.siret.trim().length > 0) {
    const siretCleaned = values.siret.replace(/\s/g, '');
    if (siretCleaned.length !== 14 || !/^\d{14}$/.test(siretCleaned)) {
      errors.push("Le SIRET doit contenir exactement 14 chiffres");
    }
  }
  
  // Validation TVA si fournie
  if (values.numeroTVA && values.numeroTVA.trim().length > 0) {
    if (!/^[A-Z]{2}\d{11}$/.test(values.numeroTVA.replace(/\s/g, ''))) {
      errors.push("Le numéro de TVA doit être au format FR12345678901");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 