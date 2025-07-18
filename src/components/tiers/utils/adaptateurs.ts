import { Tier } from "../types";
import { EntrepriseFormValues } from "../types/entreprise";
import { ParticulierFormValues } from "../types/particulier";

/**
 * Adaptateur pour transformer EntrepriseFormValues vers l'API Tier
 */
export const transformEntrepriseToTier = (values: EntrepriseFormValues, existingId?: string): Tier => {
  console.log("transformEntrepriseToTier: Converting entreprise form to tier", values);

  // Pour une entreprise, utiliser la raison sociale comme nom
  const name = values.raisonSociale || '';
  
  // Récupérer le contact principal (premier contact ou contact principal devis)
  console.log("🔍 Contacts disponibles:", values.contacts);
  const contactPrincipal = values.contacts.find(c => c.contactPrincipalDevis) || values.contacts[0];
  console.log("🔍 Contact principal sélectionné:", contactPrincipal);
  const contact = contactPrincipal ? `${contactPrincipal.prenom} ${contactPrincipal.nom}`.trim() : '';
  
  // Récupérer l'adresse principale (adresse de facturation ou première)
  console.log("🔍 Adresses disponibles:", values.adresses);
  const adressePrincipale = values.adresses.find(a => a.facturation) || values.adresses[0];
  console.log("🔍 Adresse principale sélectionnée:", adressePrincipale);
  const address = adressePrincipale ? 
    `${adressePrincipale.rue}, ${adressePrincipale.codePostal} ${adressePrincipale.ville}`.trim() : '';

  const tier: Tier & { entityType: string } = {
    id: existingId || '',
    name,
    type: values.flags && values.flags.length > 0 ? [values.flags[0]] : ['client'], // Prendre la première relation ou 'client' par défaut
    contact,
    email: contactPrincipal?.email || '',
    phone: contactPrincipal?.telephone || '',
    address,
    siret: values.siret || '',
    status: (values.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    entityType: 'entreprise', // CRITIQUE : Spécifier explicitement le type d'entité
  };

  console.log("transformEntrepriseToTier: Converted tier", tier);
  return tier;
};

/**
 * Adaptateur pour transformer ParticulierFormValues vers l'API Tier
 */
export const transformParticulierToTier = (values: ParticulierFormValues, existingId?: string): Tier => {
  console.log("transformParticulierToTier: Converting particulier form to tier", values);

  // Pour un particulier, utiliser le nom complet comme nom
  const name = [values.prenom, values.nom].filter(Boolean).join(' ') || values.nom || '';
  
  // Le particulier est son propre contact
  const contact = name;
  
  // Récupérer l'adresse principale
  const adressePrincipale = values.adresses.find(a => a.principale) || values.adresses[0];
  const address = adressePrincipale ? 
    `${adressePrincipale.rue}, ${adressePrincipale.codePostal} ${adressePrincipale.ville}`.trim() : '';

  const tier: Tier & { entityType: string } = {
    id: existingId || '',
    name,
    type: values.relation && values.relation.length > 0 ? [values.relation[0]] : ['client'], // Prendre la première relation ou 'client' par défaut
    contact,
    email: values.email || '',
    phone: values.telephone || '',
    address,
    siret: '', // Pas de SIRET pour un particulier
    status: (values.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    entityType: 'particulier', // CRITIQUE : Spécifier explicitement le type d'entité
  };

  console.log("transformParticulierToTier: Converted tier", tier);
  return tier;
};

/**
 * Adaptateur pour transformer un Tier vers EntrepriseFormValues
 */
export const transformTierToEntreprise = (tier: Tier): EntrepriseFormValues => {
  console.log("transformTierToEntreprise: Converting tier to entreprise form", tier);

  // Séparer le contact en prénom/nom s'il existe
  const contactParts = tier.contact ? tier.contact.trim().split(' ') : [];
  const prenom = contactParts[0] || '';
  const nom = contactParts.slice(1).join(' ') || '';

  // Séparer l'adresse en composants
  const addressParts = tier.address ? tier.address.split(',') : [];
  const rue = addressParts[0]?.trim() || '';
  const villeInfo = addressParts[1]?.trim() || '';
  const codePostalMatch = villeInfo.match(/^(\d{5})\s+(.+)$/);
  const codePostal = codePostalMatch ? codePostalMatch[1] : '';
  const ville = codePostalMatch ? codePostalMatch[2] : villeInfo;

  const entrepriseValues: EntrepriseFormValues = {
    raisonSociale: tier.name || '',
    siret: tier.siret || '',
    numeroTVA: '',
    codeNAF: '',
    formeJuridique: '',
    capitalSocial: '',
    flags: tier.type || [],
    status: (tier.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    contacts: tier.contact ? [{
      nom,
      prenom,
      fonction: '',
      email: tier.email || '',
      telephone: tier.phone || '',
      contactPrincipalDevis: true,
      contactPrincipalFacture: true,
    }] : [],
    adresses: tier.address ? [{
      libelle: 'Siège social',
      rue,
      ville,
      codePostal,
      pays: 'France',
      facturation: true,
    }] : [],
  };

  console.log("transformTierToEntreprise: Converted entreprise values", entrepriseValues);
  return entrepriseValues;
};

/**
 * Adaptateur pour transformer un Tier vers ParticulierFormValues
 */
export const transformTierToParticulier = (tier: Tier): ParticulierFormValues => {
  console.log("transformTierToParticulier: Converting tier to particulier form", tier);

  // Séparer le nom complet en prénom/nom
  const nameParts = tier.name ? tier.name.trim().split(' ') : [];
  const prenom = nameParts[0] || '';
  const nom = nameParts.slice(1).join(' ') || nameParts[0] || '';

  // Séparer l'adresse en composants
  const addressParts = tier.address ? tier.address.split(',') : [];
  const rue = addressParts[0]?.trim() || '';
  const villeInfo = addressParts[1]?.trim() || '';
  const codePostalMatch = villeInfo.match(/^(\d{5})\s+(.+)$/);
  const codePostal = codePostalMatch ? codePostalMatch[1] : '';
  const ville = codePostalMatch ? codePostalMatch[2] : villeInfo;

  const particulierValues: ParticulierFormValues = {
    nom,
    prenom,
    email: tier.email || '',
    telephone: tier.phone || '',
    relation: tier.type || [],
    status: (tier.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
    profession: '',
    dateNaissance: '',
    adresses: tier.address ? [{
      libelle: 'Domicile',
      rue,
      ville,
      codePostal,
      pays: 'France',
      principale: true,
    }] : [],
    notes: '',
  };

  console.log("transformTierToParticulier: Converted particulier values", particulierValues);
  return particulierValues;
};

/**
 * Fonction utilitaire pour déterminer le type d'entité à partir d'un Tier
 */
export const detectEntityTypeFromTier = (tier: Tier): 'entreprise' | 'particulier' => {
  // Heuristiques pour déterminer le type :
  // 1. Si SIRET présent -> entreprise
  // 2. Si flags contient des termes entreprise -> entreprise
  // 3. Sinon -> particulier
  
  if (tier.siret && tier.siret.trim().length > 0) {
    return 'entreprise';
  }
  
  const entrepriseFlags = ['fournisseur', 'sous-traitant'];
  const hasEntrepriseFlag = tier.type?.some(flag => entrepriseFlags.includes(flag.toLowerCase()));
  
  if (hasEntrepriseFlag) {
    return 'entreprise';
  }
  
  return 'particulier';
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
    if (!entrepriseValues.raisonSociale || entrepriseValues.raisonSociale.trim().length === 0) {
      errors.push('La raison sociale est obligatoire pour une entreprise');
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