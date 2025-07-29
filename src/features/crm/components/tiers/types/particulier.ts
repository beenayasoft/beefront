import { z } from "zod";
import { CommonTierFlags, getApplicableFlags } from "./common";

// Types spécifiques aux particuliers (utilise les types communs)
export type ParticulierFlags = CommonTierFlags;

// Récupération des flags applicables aux particuliers (suppression locataire/propriétaire)
export const particulierFlags = getApplicableFlags("particulier");

// Interface pour les adresses de particulier (simples)
export interface AdresseParticulier {
  id?: string;
  libelle?: string; // "Domicile", "Résidence secondaire", etc.
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  principale?: boolean;
}

// Schéma de validation pour particulier
export const particulierFormSchema = z.object({
  // SEULS CHAMPS OBLIGATOIRES : Nom 
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  
  // Champs optionnels pour particulier
  prenom: z.string().optional(),
  
  // Contact direct (le particulier EST son propre contact)
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  telephone: z.string().optional(),
  
  // Relation commerciale unique (obligatoire)
  relation: z.array(z.string()).min(1, "Sélectionnez une relation commerciale").max(1, "Une seule relation peut être sélectionnée"),
  
  // Statut
  status: z.enum(["active", "inactive"]).default("active"),
  
  // Informations personnelles optionnelles
  profession: z.string().optional(),
  dateNaissance: z.string().optional(),
  
  // Adresses personnelles (optionnelles)
  adresses: z.array(z.object({
    libelle: z.string().optional(),
    rue: z.string().optional(),
    ville: z.string().optional(),
    codePostal: z.string().optional(),
    pays: z.string().default("France"),
    principale: z.boolean().default(false),
  })).default([]),
  
  // Notes personnelles
  notes: z.string().optional(),
});

// Type pour les valeurs du formulaire particulier
export type ParticulierFormValues = z.infer<typeof particulierFormSchema>;

// Valeurs par défaut pour un nouveau particulier
export const defaultParticulierValues: ParticulierFormValues = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  relation: [], // Démarrer avec aucune sélection - l'utilisateur doit choisir
  status: "active",
  profession: "",
  dateNaissance: "",
  adresses: [],
  notes: "",
};

// Types pour les professions communes (pour autocomplete)
export const professionsCommunes = [
  "Artisan",
  "Commerçant",
  "Profession libérale",
  "Cadre",
  "Employé",
  "Fonctionnaire",
  "Retraité",
  "Étudiant",
  "Sans emploi",
  "Chef d'entreprise",
  "Agriculteur",
  "Autre",
];

// Fonction pour obtenir les champs obligatoires
export const getRequiredFieldsParticulier = (): string[] => {
  return ["nom", "relation"];
};

// Fonction pour valider un particulier
export const validateParticulier = (values: ParticulierFormValues): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!values.nom || values.nom.trim().length === 0) {
    errors.push("Le nom est obligatoire");
  }
  
  if (!values.relation || values.relation.length === 0) {
    errors.push("Sélectionnez une relation commerciale");
  } else if (values.relation.length > 1) {
    errors.push("Une seule relation commerciale peut être sélectionnée");
  }
  
  // Validation email si fourni
  if (values.email && values.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      errors.push("L'email n'est pas valide");
    }
  }
  
  // Validation téléphone si fourni (format français basique)
  if (values.telephone && values.telephone.trim().length > 0) {
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
    const cleanPhone = values.telephone.replace(/[\s\-\.]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.push("Le numéro de téléphone n'est pas valide");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction pour obtenir le nom complet
export const getFullName = (values: ParticulierFormValues): string => {
  const parts = [values.prenom, values.nom].filter(Boolean);
  return parts.join(' ');
};

// Fonction pour obtenir l'adresse principale
export const getAdressePrincipale = (values: ParticulierFormValues): AdresseParticulier | null => {
  if (!values.adresses || values.adresses.length === 0) return null;
  
  // Chercher l'adresse marquée comme principale
  const principale = values.adresses.find(addr => addr.principale);
  if (principale) return principale;
  
  // Sinon, retourner la première adresse
  return values.adresses[0] || null;
}; 