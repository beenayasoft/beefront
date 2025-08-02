import { apiClient } from '@/lib/api/client';
import { TenantInfo, VatRate, PaymentTerm, DocumentNumbering, DocumentAppearance } from '@/lib/types/tenant';
import { transformBackendToFrontend, transformFrontendToBackend } from '../utils/tenantTransformers';

/**
 * API unifiée pour la gestion des paramètres du tenant
 * Encapsule la logique de transformation et les appels à l'API backend
 */
export const settingsApi = {
  // === INFORMATIONS GÉNÉRALES DU TENANT ===
  
  /**
   * Récupérer toutes les informations du tenant actuel
   */
  getCurrentTenantInfo: async (): Promise<TenantInfo> => {
    try {
      const response = await apiClient.get('/tenants/current_tenant_info/');
      console.log('🔍 Réponse brute de l\'API:', response.data);
      console.log('🔍 Taux de TVA bruts:', response.data.vat_rates);
      const transformed = transformBackendToFrontend(response.data);
      console.log('🔍 Données transformées:', transformed);
      console.log('🔍 Taux de TVA transformés:', transformed.vat_rates);
      return transformed;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du tenant:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour les informations du tenant actuel
   */
  updateCurrentTenant: async (data: Partial<TenantInfo>): Promise<TenantInfo> => {
    try {
      console.log('📤 Données à envoyer (frontend):', data);
      console.log('📤 Taux de TVA à envoyer:', data.vat_rates);
      const backendData = transformFrontendToBackend(data);
      console.log('📤 Données transformées pour backend:', backendData);
      console.log('📤 Taux de TVA transformés:', backendData.vat_rates);
      const response = await apiClient.patch('/tenants/current_tenant_info/', backendData);
      return transformBackendToFrontend(response.data);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tenant:', error);
      throw error;
    }
  },

  // === IDENTITÉ DE L'ENTREPRISE ===
  
  /**
   * Mettre à jour l'identité de l'entreprise (nom, adresse, contact)
   */
  updateCompanyIdentity: async (data: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
    settings?: {
      logo_base64?: string | null;
      logo_url?: string;
    };
  }): Promise<TenantInfo> => {
    return settingsApi.updateCurrentTenant(data);
  },

  // === INFORMATIONS LÉGALES ET BANCAIRES ===
  
  /**
   * Mettre à jour les informations légales et bancaires
   */
  updateLegalFinancialInfo: async (data: {
    legal?: {
      siret?: string;
      vat_number?: string;
      legal_form?: string;
    };
    bank_info?: {
      bank_name?: string;
      iban?: string;
      bic?: string;
      account_owner?: string;
    };
  }): Promise<TenantInfo> => {
    return settingsApi.updateCurrentTenant(data);
  },

  // === TAUX DE TVA ===
  
  /**
   * Mettre à jour les taux de TVA du tenant
   */
  updateVatRates: async (vatRates: VatRate[]): Promise<TenantInfo> => {
    return settingsApi.updateCurrentTenant({ vat_rates: vatRates });
  },

  // === CONDITIONS DE PAIEMENT ===
  
  /**
   * Mettre à jour les conditions de paiement du tenant
   */
  updatePaymentTerms: async (paymentTerms: PaymentTerm[]): Promise<TenantInfo> => {
    return settingsApi.updateCurrentTenant({ payment_terms: paymentTerms });
  },

  // === NUMÉROTATION DES DOCUMENTS ===
  
  /**
   * Mettre à jour la configuration de numérotation des documents
   */
  updateDocumentNumbering: async (documentNumbering: DocumentNumbering[]): Promise<TenantInfo> => {
    return settingsApi.updateCurrentTenant({ document_numbering: documentNumbering });
  },

  /**
   * Générer un aperçu de numérotation
   */
  generateNumberingPreview: async (config: Partial<DocumentNumbering>): Promise<string> => {
    try {
      const response = await apiClient.post('/tenants/preview-numbering/', {
        document_type: config.document_type || 'quote',
        prefix: config.prefix || '',
        suffix: config.suffix || '',
        padding: config.padding || 3,
        next_number: config.next_number || 1,
        include_year: config.include_year ?? true,
        include_month: config.include_month ?? false,
        include_day: config.include_day ?? false,
        date_format: config.date_format || 'YYYY-MM-DD',
        separator: config.separator || '-',
        custom_format: config.custom_format || '',
        reset_yearly: config.reset_yearly ?? true,
        reset_monthly: config.reset_monthly ?? false,
      });
      return response.data.preview;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'aperçu:', error);
      throw error;
    }
  },

  /**
   * Réinitialiser un compteur de numérotation
   */
  resetNumberingCounter: async (numberingId: string, newValue: number): Promise<boolean> => {
    try {
      await apiClient.post(`/tenants/document_numbering/${numberingId}/reset/`, {
        new_value: newValue
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du compteur:', error);
      throw error;
    }
  },

  // === APPARENCE DES DOCUMENTS ===
  
  /**
   * Mettre à jour l'apparence des documents
   */
  updateDocumentAppearance: async (appearance: Partial<DocumentAppearance>): Promise<TenantInfo> => {
    return settingsApi.updateCurrentTenant({ document_appearance: appearance });
  },

  // === VALIDATION TENANT ===
  
  /**
   * Valider qu'un tenant existe et est actif
   */
  validateTenant: async (tenantId: string): Promise<{ is_valid: boolean; message?: string }> => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/validate/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la validation du tenant ${tenantId}:`, error);
      return { is_valid: false, message: 'Erreur de validation' };
    }
  }
};

export default settingsApi;