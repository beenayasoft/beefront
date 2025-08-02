import { apiClient } from '@/lib/api/client';

export interface PaymentMethod {
  id?: number;
  method_type: 'bank_transfer' | 'check' | 'cash' | 'card' | 'paypal' | 'other';
  label: string;
  description: string;
  details: Record<string, any>;
  is_active: boolean;
  display_order: number;
  icon_name: string;
  background_color: string;
  text_color: string;
  border_color: string;
  method_type_display?: string;
  formatted_details?: Record<string, any>;
}

export interface PaymentMethodType {
  value: 'bank_transfer' | 'check' | 'cash' | 'card' | 'paypal' | 'other';
  label: string;
  description: string;
  icon: string;
  default_style: {
    background_color: string;
    text_color: string;
    border_color: string;
  };
}

export interface BankTransferDetails {
  iban: string;
  bic: string;
  bank_name: string;
  account_holder: string;
}

export interface CheckDetails {
  payable_to: string;
  address: string;
  instructions: string;
}

class PaymentMethodsAPI {
  private baseUrl = '';

  /**
   * Récupère tous les moyens de paiement actifs du tenant
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get(`${this.baseUrl}/payment_methods/`);
    return response.data;
  }

  /**
   * Récupère un moyen de paiement spécifique
   */
  async getPaymentMethod(id: number): Promise<PaymentMethod> {
    const response = await apiClient.get(`${this.baseUrl}/payment_methods/${id}/`);
    return response.data;
  }

  /**
   * Crée un nouveau moyen de paiement
   */
  async createPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const response = await apiClient.post(`${this.baseUrl}/payment_methods/`, paymentMethod);
    return response.data;
  }

  /**
   * Met à jour un moyen de paiement existant
   */
  async updatePaymentMethod(id: number, paymentMethod: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const response = await apiClient.put(`${this.baseUrl}/payment_methods/${id}/`, paymentMethod);
    return response.data;
  }

  /**
   * Supprime un moyen de paiement
   */
  async deletePaymentMethod(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/payment_methods/${id}/`);
  }

  /**
   * Récupère les types de moyens de paiement disponibles
   */
  async getPaymentMethodTypes(): Promise<PaymentMethodType[]> {
    const response = await apiClient.get(`${this.baseUrl}/payment_methods/types/`);
    return response.data;
  }

  /**
   * Crée les moyens de paiement par défaut (Virement + Chèque)
   */
  async createDefaultPaymentMethods(): Promise<{ message: string; payment_methods: PaymentMethod[] }> {
    const response = await apiClient.post(`${this.baseUrl}/payment_methods/create_defaults/`);
    return response.data;
  }

  /**
   * Helpers pour créer des détails typés
   */
  createBankTransferDetails(details: BankTransferDetails): BankTransferDetails {
    return {
      iban: details.iban,
      bic: details.bic,
      bank_name: details.bank_name,
      account_holder: details.account_holder,
    };
  }

  createCheckDetails(details: CheckDetails): CheckDetails {
    return {
      payable_to: details.payable_to,
      address: details.address,
      instructions: details.instructions,
    };
  }
}

export const paymentMethodsAPI = new PaymentMethodsAPI();