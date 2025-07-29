// Types pour la configuration de l'entreprise
export interface CompanyIdentity {
  name: string;
  logo?: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  siret: string;
  vat_number?: string;
}

// Types pour la configuration légale et financière
export interface LegalFinancialSettings {
  default_payment_term: string;
  default_vat_rate: number;
  bank_name?: string;
  bank_account?: string;
  iban?: string;
  bic?: string;
}

// Types pour la configuration de l'apparence des documents
export interface DocumentAppearance {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  logo_position: 'left' | 'center' | 'right';
  show_payment_info: boolean;
  show_legal_notice: boolean;
  custom_footer?: string;
  custom_header?: string;
}

// Types pour la configuration de la numérotation
export interface NumberingFormat {
  quote_prefix: string;
  invoice_prefix: string;
  quote_start_number: number;
  invoice_start_number: number;
  reset_yearly: boolean;
  include_year: boolean;
  include_month: boolean;
  separator: string;
}

// Types pour les conditions de paiement
export interface PaymentTerm {
  id: number;
  name: string;
  days: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

// Types pour les taux de TVA
export interface VatRate {
  id: number;
  name: string;
  rate: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
} 