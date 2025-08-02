export interface TenantInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Adresse - alignée avec le backend
  address: {
    line1: string;
    line2: string;
    city: string;
    postal_code: string;
    country: string;
    full_address: string;
  };
  
  // Informations légales - alignée avec le backend
  legal: {
    legal_form: string;
    siret: string;
    ice: string;
  };
  
  // Informations bancaires - alignée avec le backend
  bank_info: {
    bank_name: string;
    iban: string;
    bic: string;
    account_owner?: string;
  };
  
  // Paramètres - alignée avec le backend
  settings: {
    logo_url?: string;
    logo_base64?: string | null;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    timezone?: string;
    language?: string;
    currency?: string;
    date_format?: string;
    notifications?: {
      email_enabled: boolean;
      sms_enabled: boolean;
      push_enabled: boolean;
    };
    security?: {
      two_factor_required: boolean;
      password_expiry_days: number;
      session_timeout_minutes: number;
    };
  };
  
  // Taux de TVA
  vat_rates?: VatRate[];
  
  // Conditions de paiement
  payment_terms?: PaymentTerm[];
  
  // Numérotation des documents
  document_numbering?: DocumentNumbering[];
  
  // Apparence des documents
  document_appearance?: DocumentAppearance;
}

export interface PaymentTerm {
  id: string;
  label: string;
  description?: string;
  days: number;
  is_default: boolean;
  is_active: boolean;
}

export interface VatRate {
  id?: string;
  code: string;
  name: string;
  rate: number;
  rate_display?: string;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

export interface DocumentNumbering {
  id: string;
  document_type: string;
  document_type_display: string;
  prefix: string;
  suffix: string;
  padding: number;
  next_number: number;
  include_year: boolean;
  include_month: boolean;
  include_day: boolean;
  date_format: string;
  separator: string;
  custom_format: string;
  reset_yearly: boolean;
  reset_monthly: boolean;
  format_description: string;
  preview: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentAppearance {
  header_text: string;
  footer_text: string;
  show_logo: boolean;
  logo_position: string;
  logo_position_display: string;
  font_family: string;
  font_size: number;
  line_spacing: number;
  margin_top: number;
  margin_right: number;
  margin_bottom: number;
  margin_left: number;
  show_payment_details: boolean;
  show_legal_mentions: boolean;
  legal_mentions: string;
  table_header_color: string;
  table_alternate_color: string;
} 