// Types pour les données du tenant et ses paramètres
// Mis à jour pour correspondre exactement à la structure de l'API backend

export interface TenantInfo {
  id: string;
  name: string;
  slug?: string;
  domain?: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Adresse - structure plate comme retournée par l'API
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    full_address?: string;
  };
  
  // Informations légales - structure plate
  legal: {
    siret?: string;
    vat_number?: string;
    legal_form?: string;
  };
  
  // Paramètres généraux et visuels - structure imbriquée
  settings: {
    logo_url?: string;
    logo_base64?: string;
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    timezone?: string;
    language?: string;
    currency?: string;
    date_format?: string;
    notifications: {
      email_enabled: boolean;
      sms_enabled: boolean;
      push_enabled: boolean;
    };
    security: {
      two_factor_required: boolean;
      password_expiry_days: number;
      session_timeout_minutes: number;
    };
  };
  
  // Informations bancaires - structure plate
  bank_info: {
    bank_name?: string;
    iban?: string;
    bic?: string;
    account_owner?: string;
  };
  
  // Taux de TVA - tableau d'objets
  vat_rates: VatRate[];
  
  // Conditions de paiement - tableau d'objets
  payment_terms: PaymentTerm[];
  
  // Numérotation des documents - tableau d'objets
  document_numbering: DocumentNumbering[];
  
  // Apparence des documents - objet unique
  document_appearance: DocumentAppearance;
  
  // Informations générales du tenant
  is_active: boolean;
  is_trial: boolean;
  trial_end_date?: string;
  subscription_plan: 'trial' | 'starter' | 'professional' | 'enterprise';
  max_users: number;
  max_storage_gb: number;
  created_at: string;
  updated_at?: string;
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

export interface PaymentTerm {
  id?: string;
  label: string;
  days: number;
  description?: string;
  is_default: boolean;
  is_active: boolean;
}

export interface DocumentNumbering {
  id?: string;
  document_type: string;
  document_type_display?: string;
  prefix?: string;
  suffix?: string;
  padding: number;
  next_number: number;
  include_year: boolean;
  include_month: boolean;
  reset_yearly: boolean;
  reset_monthly: boolean;
}

export interface DocumentAppearance {
  header_text?: string;
  footer_text?: string;
  show_logo: boolean;
  logo_position: string;
  logo_position_display?: string;
  font_family: string;
  font_size: number;
  line_spacing: number;
  margin_top: number;
  margin_right: number;
  margin_bottom: number;
  margin_left: number;
  show_payment_details: boolean;
  show_legal_mentions: boolean;
  legal_mentions?: string;
  table_header_color: string;
  table_alternate_color: string;
}

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

// Structure pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Structure pour les erreurs API
export interface ApiError {
  detail: string;
  code?: string;
  field?: string;
}
