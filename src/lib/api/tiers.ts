import { apiClient } from './client';
import { Tier } from '@/components/tiers/types';

// Types correspondant au backend
export interface TierData {
  id: string;
  nom: string;
  type: string;
  relation: string;
  siret: string;
  tva: string;
  assigned_user?: { id: string; email: string; first_name: string; last_name: string };
  adresses: AdresseData[];
  contacts: ContactData[];
  date_creation: string;
  date_modification: string;
  is_deleted: boolean;
}

export interface AdresseData {
  id: string;
  libelle: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
  facturation: boolean;
}

export interface ContactData {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  email: string;
  telephone: string;
  contact_principal_devis: boolean;
  contact_principal_facture: boolean;
}

// Types pour la pagination
export interface PaginationInfo {
  count: number;
  num_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

export interface PaginatedResponse<T> {
  results: T[];
  pagination: PaginationInfo;
}

export interface TiersFilters {
  type?: string;        // Type de tier (clients, fournisseurs, etc.)
  search?: string;      // Texte de recherche (sur nom, contact, etc.)
  page?: number;        // Numéro de page
  page_size?: number;   // Nombre d'éléments par page
  sort?: string;        // Champ de tri (name, date, etc. avec - pour descendant)
  status?: 'active' | 'inactive'; // Statut des tiers (actifs ou archivés)
  format?: 'frontend' | 'backend'; // Format de réponse (frontend pour données adaptées)
}

export interface TierDetailData {
  id: string;
  nom: string;
  type: string[];
  relation: string;
  siret?: string;
  tva?: string;
  is_deleted: boolean;
  date_creation: string;
  date_modification: string;
  onglets: {
    infos: {
      adresses: Array<{
        id: string;
        libelle: string;
        rue: string;
        ville: string;
        code_postal: string;
        pays?: string;
        facturation: boolean;
      }>
    };
    contacts: Array<{
      id: string;
      nom: string;
      prenom: string;
      fonction?: string;
      email?: string;
      telephone?: string;
      contact_principal_devis: boolean;
      contact_principal_facture: boolean;
    }>;
    activites: any[];
  };
}

export interface TiersGlobalStats {
  total: number;
  client: number;
  fournisseur: number;
  prospect: number;
  sous_traitant: number;
}

// Types pour la création (sans ID)
export type AdresseCreateData = Omit<AdresseData, 'id'>;
export type ContactCreateData = Omit<ContactData, 'id'>;

// Type pour créer un tier
export interface TierCreateData {
  nom: string;
  type: string;
  relation: string;
  siret: string;
  tva: string;
  is_deleted: boolean;
  adresses: AdresseCreateData[];
  contacts: ContactCreateData[];
}

// Adapter les données du backend vers le format frontend
const adaptTierFromApi = (tierApi: any): Tier => {
  // S'assurer que tierApi est un objet non-null
  if (!tierApi) {
    console.error("tierApi est undefined ou null");
    return {
      id: '',
      name: 'Données manquantes',
      type: [],
      contact: '',
      email: '',
      phone: '',
      address: '',
      siret: '',
      status: 'inactive'
    };
  }
  
  // Vérifier que les propriétés existent avant d'y accéder
  const adresses = Array.isArray(tierApi.adresses) ? tierApi.adresses : [];
  const contacts = Array.isArray(tierApi.contacts) ? tierApi.contacts : [];
  
  // Récupérer l'adresse principale (facturation=true ou première)
  const adressePrincipale = adresses.find(a => a?.facturation) || adresses[0] || null;
  
  // Récupérer le contact principal
  const contactPrincipal = contacts.find(c => c?.contact_principal_devis) || contacts[0] || null;
  
  // Log détaillé pour débogage des valeurs extraites
  console.log("Adaptation tier:", {
    id: tierApi.id,
    nom: tierApi.nom,
    relation: tierApi.relation,
    contacts: contacts,
    contactPrincipal: contactPrincipal,
    adresses: adresses,
    adressePrincipale: adressePrincipale
  });
  
  // Construire l'adresse formatée si disponible
  let addressFormatted = '';
  if (adressePrincipale) {
    const rue = adressePrincipale.rue || '';
    const codePostal = adressePrincipale.code_postal || '';
    const ville = adressePrincipale.ville || '';
    
    if (rue && (codePostal || ville)) {
      addressFormatted = `${rue}, ${codePostal} ${ville}`.trim();
    } else if (rue) {
      addressFormatted = rue;
    } else if (ville) {
      addressFormatted = ville;
    }
  }
  
  // Construire le nom complet du contact si disponible
  let contactName = '';
  if (contactPrincipal) {
    const prenom = contactPrincipal.prenom || '';
    const nom = contactPrincipal.nom || '';
    
    if (prenom && nom) {
      contactName = `${prenom} ${nom}`;
    } else if (prenom) {
      contactName = prenom;
    } else if (nom) {
      contactName = nom;
    }
  }
  
  const tier = {
    id: tierApi.id || '',
    name: tierApi.nom || '',
    type: tierApi.relation ? [tierApi.relation] : [],
    contact: contactName,
    email: contactPrincipal?.email || '',
    phone: contactPrincipal?.telephone || '',
    address: addressFormatted,
    siret: tierApi.siret || '',
    status: tierApi.is_deleted === true ? 'inactive' : 'active' as 'inactive' | 'active'
  };
  
  console.log("Tier adapté:", tier);
  return tier;
};

// Adapter les données du frontend vers le format backend
const adaptTierToApi = (tier: Tier & { entityType?: string, fonction?: string, pays?: string }): any => {
  // Logs pour débogage
  console.log("Adaptation de tier vers API:", tier);
  
  // Déterminer le type d'entité (entreprise/particulier) basé sur le champ entityType
  const entityType = tier.entityType === 'particulier' ? 'particulier' : 'entreprise';

  // Construction de l'objet à envoyer à l'API
  const tierData: any = {
    nom: tier.name,
    type: entityType,
    relation: Array.isArray(tier.type) && tier.type.length > 0 ? tier.type[0] : 'client',
    siret: tier.siret || '',
    tva: '',
    is_deleted: tier.status === 'inactive',
  };

  // Ajouter les adresses seulement si on a une adresse valide
  if (tier.address && tier.address.trim()) {
    // Format attendu: "Rue, Code Postal Ville"
    const parts = tier.address.split(',');
    const rue = parts[0]?.trim() || '';
    
    let codePostal = '';
    let ville = '';
    
    if (parts.length > 1) {
      const villeInfo = parts[1].trim();
      const codePostalMatch = villeInfo.match(/^(\d{5})\s+(.+)$/);
      
      if (codePostalMatch) {
        codePostal = codePostalMatch[1];
        ville = codePostalMatch[2];
      } else {
        ville = villeInfo;
      }
    }

    // N'ajouter l'adresse que si on a au moins rue, ville et code postal
    if (rue && ville && codePostal) {
      tierData.adresses = [{
        libelle: entityType === 'particulier' ? 'Domicile' : 'Principale',
        rue,
        ville,
        code_postal: codePostal,
        pays: tier.pays || 'France',
        facturation: true
      }];
    }
  }

  // Ajouter les contacts seulement si on a des informations de contact valides
  if (tier.contact && tier.contact.trim()) {
    // Format du contact: "Prénom Nom"
    const contactParts = tier.contact.trim().split(' ');
    const prenom = contactParts[0] || '';
    const nom = contactParts.slice(1).join(' ') || '';

    // Si on a au moins un nom, créer un contact
    if (nom || prenom) {
      tierData.contacts = [{
        nom: nom || prenom,
        prenom: nom ? prenom : '',
        fonction: tier.fonction || '',
        email: tier.email || '',
        telephone: tier.phone || '',
        contact_principal_devis: true,
        contact_principal_facture: true
      }];
    }
  }
  
  console.log("Données adaptées pour l'API:", tierData);
  return tierData;
};

// API Functions
export const tiersApi = {
  // Récupérer les tiers avec pagination
  getTiers: async (params: TiersFilters) => {
    console.log('🚀 API OPTIMISÉE: Récupération paginée des tiers', params);

    // Mapping des types frontend (pluriel) vers backend (singulier)
    if (params.type && params.type !== 'tous') {
      const typeMapping: Record<string, string> = {
        'clients': 'client',
        'fournisseurs': 'fournisseur',
        'prospects': 'prospect',
        'sous_traitants': 'sous_traitant'
      };
      // Utiliser le mapping ou la valeur d'origine si non trouvée
      params.type = typeMapping[params.type] || params.type;
      console.log(`🔍 Conversion du type: ${params.type} → ${params.type}`);
    }

    const response = await apiClient.get('/tiers/frontend_format/', { params });
    return response.data;
  },

    // Récupérer le détail d'un tier avec sa vue 360°
    getTierDetail: async (id: string) => {
      console.log('🔍 API: Récupération détaillée du tier', id);

      try {
        const response = await apiClient.get(`/tiers/${id}/vue_360/`);
        console.log('✅ Détail du tier récupéré avec succès:', response.data);
        return response.data;
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du tier:', error);
        throw error;
      }
    },

  // Récupérer les statistiques
  getStats: async (search?: string) => {
    console.log('📊 API: Récupération des statistiques globales des tiers');
    const params = search ? { search } : {};
    const response = await apiClient.get('/tiers/stats/', { params });
    return response.data;
  },
  
  // Récupérer un tier par son ID
  getTierById: async (id: string): Promise<Tier> => {
    try {
      console.log(`Récupération des détails du tier ${id}...`);
      // URL corrigée sans duplication du terme 'tiers'
      const response = await apiClient.get(`/tiers/${id}/vue_360/`);
      console.log('Réponse API vue_360:', response.data);
      
      const tierData = response.data;
      
      // La vue 360 place les relations dans un sous-objet 'onglets'
      // Nous devons les replacer au niveau racine pour adaptTierFromApi
      let tierFormatted = { ...tierData };
      
      // Si les données sont dans le format 'onglets', réorganiser
      if (tierData.onglets) {
        console.log('Structure avec onglets détectée, réorganisation des données...');
        tierFormatted = {
          ...tierData,
          // Remonter les adresses et contacts au niveau racine
          adresses: tierData.onglets.infos?.adresses || [],
          contacts: tierData.onglets.contacts || []
        };
      }
      
      console.log('Tier formaté pour adaptation:', tierFormatted);
      const result = adaptTierFromApi(tierFormatted);
      console.log('Résultat adapté:', result);
      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tier ${id}:`, error);
      throw error;
    }
  },
  
  // Créer un nouveau tier
  createTier: async (tier: Tier): Promise<Tier> => {
    try {
      const tierData = adaptTierToApi(tier);
      const response = await apiClient.post('/tiers/', tierData);
      return adaptTierFromApi(response.data);
    } catch (error: any) {
      console.error('Erreur lors de la création du tier:', error);
      
      // Log détaillé de l'erreur 400
      if (error.response?.status === 400) {
        console.error('🚨 ERREUR 400 - DÉTAILS:');
        console.error('  Status:', error.response.status);
        console.error('  StatusText:', error.response.statusText);
        console.error('  Data:', error.response.data);
        console.error('  Headers:', error.response.headers);
        
        // Si on a des détails d'erreur dans la réponse
        if (error.response.data) {
          console.error('🔍 ERREURS DE VALIDATION BACKEND:');
          console.error(JSON.stringify(error.response.data, null, 2));
        }
      }
      
      throw error;
    }
  },
  
  // Mettre à jour un tier existant
  updateTier: async (id: string, tier: Tier): Promise<Tier> => {
    try {
      const tierData = adaptTierToApi(tier);
      const response = await apiClient.patch(`/tiers/${id}/`, tierData);
      return adaptTierFromApi(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du tier ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer (archiver) un tier
  deleteTier: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/tiers/${id}/`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du tier ${id}:`, error);
      throw error;
    }
  },
  
  // Restaurer un tier archivé
  restoreTier: async (id: string): Promise<Tier> => {
    try {
      const response = await apiClient.post(`/tiers/${id}/restaurer/`);
      return adaptTierFromApi(response.data);
    } catch (error) {
      console.error(`Erreur lors de la restauration du tier ${id}:`, error);
      throw error;
    }
  }
};
