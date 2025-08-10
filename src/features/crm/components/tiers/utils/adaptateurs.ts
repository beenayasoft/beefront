import { Tier } from "@/features/crm/types/crm.types";
import { CreateTierRequest } from "@/features/crm/api/crm";
import { EntrepriseFormValues } from "../types/entreprise";
import { ParticulierFormValues } from "../types/particulier";

/**
 * Adaptateur pour transformer EntrepriseFormValues vers l'API CreateTierRequest
 */
export const transformEntrepriseToTier = (values: EntrepriseFormValues, existingId?: string): CreateTierRequest => {
  console.log("transformEntrepriseToTier: Converting entreprise form to tier", values);

  // Convertir les contacts
  const contacts = values.contacts.map(c => ({
    nom: c.nom || '',
    prenom: c.prenom || '',
    fonction: c.fonction || '',
    email: c.email || '',
    telephone: c.telephone || '',
    is_contact_principal_devis: c.contactPrincipalDevis || false,
    is_contact_principal_facture: c.contactPrincipalFacture || false
  }));

  // Convertir les adresses
  const adresses = values.adresses.map(a => ({
    libelle: a.libelle || '',
    rue: a.rue || '',
    ville: a.ville || '',
    code_postal: a.codePostal || '',
    pays: a.pays || 'France',
    is_facturation: a.facturation || false
  }));

  const tierData: CreateTierRequest = {
    nom: values.nom || '',
    type: 'entreprise',
    relation: values.flags && values.flags.length > 0 ? values.flags[0] as any : 'prospect',
    siret: values.siret || undefined,
    tva: values.tva || undefined,
    contacts,
    adresses
  };

  console.log("transformEntrepriseToTier: Converted tier", tierData);
  return tierData;
};

/**
 * Adaptateur pour transformer ParticulierFormValues vers l'API CreateTierRequest
 */
export const transformParticulierToTier = (values: ParticulierFormValues, existingId?: string): CreateTierRequest => {
  console.log("transformParticulierToTier: Converting particulier form to tier", values);

  // Pour un particulier, créer un contact avec ses informations
  const contacts = [{
    nom: values.nom || '',
    prenom: values.prenom || '',
    fonction: values.profession || '',
    email: values.email || '',
    telephone: values.telephone || '',
    is_contact_principal_devis: true,
    is_contact_principal_facture: true
  }];

  // Convertir les adresses
  const adresses = values.adresses.map(a => ({
    libelle: a.libelle || 'Domicile',
    rue: a.rue || '',
    ville: a.ville || '',
    code_postal: a.codePostal || '',
    pays: a.pays || 'France',
    is_facturation: a.facturation || false
  }));

  const tierData: CreateTierRequest = {
    nom: [values.prenom, values.nom].filter(Boolean).join(' ') || values.nom || '',
    type: 'particulier',
    relation: values.relation && values.relation.length > 0 ? values.relation[0] as any : 'prospect',
    contacts,
    adresses
  };

  console.log("transformParticulierToTier: Converted tier", tierData);
  return tierData;
};


/**
 * Validation des données avant transformation
 */
export const validateBeforeTransform = (
  values: EntrepriseFormValues | ParticulierFormValues,
  type: 'entreprise' | 'particulier'
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (type === 'entreprise') {
    const entrepriseValues = values as EntrepriseFormValues;
    if (!entrepriseValues.nom || entrepriseValues.nom.trim().length === 0) {
      errors.push('Le nom de l’entreprise est obligatoire');
    }
    if (!entrepriseValues.flags || entrepriseValues.flags.length === 0) {
      errors.push('Sélectionnez au moins un type de relation commerciale');
    }
  } else {
    const particulierValues = values as ParticulierFormValues;
    if (!particulierValues.nom || particulierValues.nom.trim().length === 0) {
      errors.push('Le nom est obligatoire pour un particulier');
    }
    if (!particulierValues.relation || particulierValues.relation.length === 0) {
      errors.push('Sélectionnez au moins un type de relation');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 