import { apiClient } from '@/lib/api/client';
import type {
  CompanyIdentity,
  LegalFinancialSettings,
  DocumentAppearance,
  NumberingFormat,
  PaymentTerm,
  VatRate
} from '../types';

export const settingsApi = {
  // Company Identity
  getCompanyIdentity: async (): Promise<CompanyIdentity> => {
    const response = await apiClient.get('/settings/company/');
    return response.data;
  },

  updateCompanyIdentity: async (data: Partial<CompanyIdentity>): Promise<CompanyIdentity> => {
    const response = await apiClient.patch('/settings/company/', data);
    return response.data;
  },

  // Legal & Financial
  getLegalFinancialSettings: async (): Promise<LegalFinancialSettings> => {
    const response = await apiClient.get('/settings/legal-financial/');
    return response.data;
  },

  updateLegalFinancialSettings: async (data: Partial<LegalFinancialSettings>): Promise<LegalFinancialSettings> => {
    const response = await apiClient.patch('/settings/legal-financial/', data);
    return response.data;
  },

  // Document Appearance
  getDocumentAppearance: async (): Promise<DocumentAppearance> => {
    const response = await apiClient.get('/settings/document-appearance/');
    return response.data;
  },

  updateDocumentAppearance: async (data: Partial<DocumentAppearance>): Promise<DocumentAppearance> => {
    const response = await apiClient.patch('/settings/document-appearance/', data);
    return response.data;
  },

  // Numbering Format
  getNumberingFormat: async (): Promise<NumberingFormat> => {
    const response = await apiClient.get('/settings/numbering-format/');
    return response.data;
  },

  updateNumberingFormat: async (data: Partial<NumberingFormat>): Promise<NumberingFormat> => {
    const response = await apiClient.patch('/settings/numbering-format/', data);
    return response.data;
  },

  // Payment Terms
  getPaymentTerms: async (): Promise<PaymentTerm[]> => {
    const response = await apiClient.get('/settings/payment-terms/');
    return response.data;
  },

  createPaymentTerm: async (data: Omit<PaymentTerm, 'id'>): Promise<PaymentTerm> => {
    const response = await apiClient.post('/settings/payment-terms/', data);
    return response.data;
  },

  updatePaymentTerm: async (id: number, data: Partial<PaymentTerm>): Promise<PaymentTerm> => {
    const response = await apiClient.patch(`/api/settings/payment-terms/${id}/`, data);
    return response.data;
  },

  deletePaymentTerm: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/settings/payment-terms/${id}/`);
  },

  // VAT Rates
  getVatRates: async (): Promise<VatRate[]> => {
    const response = await apiClient.get('/settings/vat-rates/');
    return response.data;
  },

  createVatRate: async (data: Omit<VatRate, 'id'>): Promise<VatRate> => {
    const response = await apiClient.post('/settings/vat-rates/', data);
    return response.data;
  },

  updateVatRate: async (id: number, data: Partial<VatRate>): Promise<VatRate> => {
    const response = await apiClient.patch(`/api/settings/vat-rates/${id}/`, data);
    return response.data;
  },

  deleteVatRate: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/settings/vat-rates/${id}/`);
  }
};

export default settingsApi; 