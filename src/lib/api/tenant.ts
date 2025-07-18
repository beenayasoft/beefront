import { apiClient } from './client';
import { TenantInfo, VatRate, PaymentTerm, DocumentNumbering, DocumentAppearance } from '../types/tenant';

// Type pour les mises à jour partielles du tenant
export interface TenantUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  siret?: string;
  vat_number?: string;
  legal_form?: string;
  settings?: {
    logo_url?: string;
    logo_base64?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    timezone?: string;
    language?: string;
    currency?: string;
    date_format?: string;
    email_notifications_enabled?: boolean;
    sms_notifications_enabled?: boolean;
    push_notifications_enabled?: boolean;
    two_factor_required?: boolean;
    password_expiry_days?: number;
    session_timeout_minutes?: number;
  };
  bank_info?: {
    bank_name?: string;
    iban?: string;
    bic?: string;
    account_owner?: string;
  };
  document_appearance?: Partial<DocumentAppearance>;
  vat_rates?: VatRate[];
  payment_terms?: PaymentTerm[];
  document_numbering?: DocumentNumbering[];
}

export const tenantApi = {
  // Récupérer les informations du tenant actuel (avec toutes les données enrichies)
  getCurrentTenantInfo: async (): Promise<TenantInfo> => {
    try {
      const response = await apiClient.get('/tenants/current_tenant_info/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations du tenant actuel:', error);
      throw error;
    }
  },

  // Mettre à jour les informations du tenant actuel
  updateCurrentTenant: async (data: TenantUpdateData): Promise<TenantInfo> => {
    try {
      const response = await apiClient.patch('/tenants/current_tenant_info/', data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tenant:', error);
      throw error;
    }
  },

  // Mettre à jour les taux de TVA du tenant
  updateVatRates: async (vatRates: VatRate[]): Promise<VatRate[]> => {
    try {
      const response = await apiClient.put('/tenants/current_tenant_info/', {
        vat_rates: vatRates
      });
      return response.data.vat_rates || [];
    } catch (error) {
      console.error('Erreur lors de la mise à jour des taux de TVA:', error);
      throw error;
    }
  },

  // Mettre à jour les conditions de paiement du tenant
  updatePaymentTerms: async (paymentTerms: PaymentTerm[]): Promise<PaymentTerm[]> => {
    try {
      const response = await apiClient.put('/tenants/current_tenant_info/', {
        payment_terms: paymentTerms
      });
      return response.data.payment_terms || [];
    } catch (error) {
      console.error('Erreur lors de la mise à jour des conditions de paiement:', error);
      throw error;
    }
  },

  // Mettre à jour la numérotation des documents du tenant
  updateDocumentNumbering: async (documentNumbering: DocumentNumbering[]): Promise<DocumentNumbering[]> => {
    try {
      const response = await apiClient.put('/tenants/current_tenant_info/', {
        document_numbering: documentNumbering
      });
      return response.data.document_numbering || [];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la numérotation des documents:', error);
      throw error;
    }
  },

  // Valider un tenant (utilisé pour vérifier si un tenant est actif)
  validateTenant: async (tenantId: string): Promise<{ is_valid: boolean; message?: string }> => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/validate/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la validation du tenant ${tenantId}:`, error);
      // Par défaut, considérer le tenant comme valide en cas d'erreur
      return { is_valid: true };
    }
  },

  // Récupérer les statistiques du tenant (si disponible)
  getTenantStats: async (tenantId: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/stats/`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des statistiques du tenant ${tenantId}:`, error);
      // Retourner des statistiques vides par défaut
      return {};
    }
  }
};

export default tenantApi;
