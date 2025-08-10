/**
 * Utilitaires pour transformer les données CRM tiers en données fournisseur
 */
import type { Tier } from '@/features/crm/types';

/**
 * Interface pour les détails fournisseur transformés
 */
export interface SupplierDetails {
  id: string;
  nom: string;
  siret: string;
  numero_tva: string;
  email: string;
  telephone: string;
  relation: string;
  type: string;
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  } | null;
}

/**
 * Transforme les données d'un tiers CRM en données fournisseur
 */
export function transformTierToSupplier(tierDetails: Tier): SupplierDetails {
  return {
    id: tierDetails.id,
    nom: tierDetails.nom,
    siret: tierDetails.siret || '',
    numero_tva: tierDetails.numero_tva || '',
    email: tierDetails.email || '',
    telephone: tierDetails.telephone || '',
    relation: tierDetails.relation,
    type: tierDetails.type,
    adresse: tierDetails.adresses?.[0] ? {
      rue: tierDetails.adresses[0].rue,
      ville: tierDetails.adresses[0].ville,
      code_postal: tierDetails.adresses[0].code_postal,
      pays: tierDetails.adresses[0].pays
    } : null
  };
}

/**
 * Récupère les détails d'un fournisseur via l'API CRM
 */
export async function getSupplierDetailsFromCRM(supplierId: string): Promise<SupplierDetails | null> {
  try {
    const { crmApi } = await import('@/features/crm/api/crm');
    const tierDetails = await crmApi.tiers.getTierDetails(supplierId);
    return transformTierToSupplier(tierDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails fournisseur:', error);
    return null;
  }
}