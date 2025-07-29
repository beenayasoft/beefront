/**
 * Utilitaires pour transformer les données entre le format frontend et backend
 */

import { TenantInfo } from '../types/tenant';
import { TenantUpdateData } from '@/lib/api/tenant';

/**
 * Transforme les données du backend vers le format frontend
 */
export function transformBackendToFrontend(backendData: any): TenantInfo {
  return {
    id: backendData.id,
    name: backendData.name,
    email: backendData.email,
    phone: backendData.phone,
    website: backendData.website,
    
    address: {
      line1: backendData.address_line_1 || backendData.address?.line1 || '',
      line2: backendData.address_line_2 || backendData.address?.line2 || '',
      city: backendData.city || backendData.address?.city || '',
      postal_code: backendData.postal_code || backendData.address?.postal_code || '',
      country: backendData.country || backendData.address?.country || '',
      full_address: backendData.full_address || backendData.address?.full_address || '',
    },
    
    legal: {
      legal_form: backendData.legal_form || backendData.legal?.legal_form || '',
      siret: backendData.siret || backendData.legal?.siret || '',
      ice: backendData.ice || backendData.legal?.ice || '',
    },
    
    bank_info: {
      bank_name: backendData.bank_info?.bank_name || '',
      iban: backendData.bank_info?.iban || '',
      bic: backendData.bank_info?.bic || '',
      account_owner: backendData.bank_info?.account_owner || '',
    },
    
    settings: {
      logo_url: backendData.settings?.logo_url || '',
      logo_base64: backendData.settings?.logo_data || null, // Utiliser logo_data du backend comme logo_base64 dans le frontend
      primary_color: backendData.settings?.primary_color || '#007bff',
      secondary_color: backendData.settings?.secondary_color || '#6c757d',
      accent_color: backendData.settings?.accent_color || '#28a745',
      timezone: backendData.settings?.timezone || 'Europe/Paris',
      language: backendData.settings?.language || 'fr',
      currency: backendData.settings?.currency || 'EUR',
      date_format: backendData.settings?.date_format || 'DD/MM/YYYY',
      notifications: {
        email_enabled: backendData.settings?.notifications?.email_enabled || true,
        sms_enabled: backendData.settings?.notifications?.sms_enabled || false,
        push_enabled: backendData.settings?.notifications?.push_enabled || true,
      },
      security: {
        two_factor_required: backendData.settings?.security?.two_factor_required || false,
        password_expiry_days: backendData.settings?.security?.password_expiry_days || 90,
        session_timeout_minutes: backendData.settings?.security?.session_timeout_minutes || 480,
      },
    },
    
    vat_rates: backendData.vat_rates || [],
    payment_terms: backendData.payment_terms || [],
    document_numbering: backendData.document_numbering || [],
    document_appearance: backendData.document_appearance || null,
  };
}

/**
 * Transforme les données du frontend vers le format backend
 */
export function transformFrontendToBackend(frontendData: Partial<TenantInfo>): TenantUpdateData {
  const backendData: TenantUpdateData = {};
  
  // Champs de base
  if (frontendData.name !== undefined) backendData.name = frontendData.name;
  if (frontendData.email !== undefined) backendData.email = frontendData.email;
  if (frontendData.phone !== undefined) backendData.phone = frontendData.phone;
  if (frontendData.website !== undefined) backendData.website = frontendData.website;
  
  // Adresse - transformation vers la structure backend plate
  if (frontendData.address) {
    if (frontendData.address.line1 !== undefined) backendData.address_line_1 = frontendData.address.line1;
    if (frontendData.address.line2 !== undefined) backendData.address_line_2 = frontendData.address.line2;
    if (frontendData.address.city !== undefined) backendData.city = frontendData.address.city;
    if (frontendData.address.postal_code !== undefined) backendData.postal_code = frontendData.address.postal_code;
    if (frontendData.address.country !== undefined) backendData.country = frontendData.address.country;
  }
  
  // Informations légales - transformation vers la structure backend plate
  if (frontendData.legal) {
    if (frontendData.legal.legal_form !== undefined) backendData.legal_form = frontendData.legal.legal_form;
    if (frontendData.legal.siret !== undefined) backendData.siret = frontendData.legal.siret;
    if (frontendData.legal.ice !== undefined) backendData.ice = frontendData.legal.ice;
  }
  
  // Paramètres
  if (frontendData.settings) {
    backendData.settings = {};
    
    if (frontendData.settings.logo_url !== undefined) backendData.settings.logo_url = frontendData.settings.logo_url;
    if (frontendData.settings.logo_base64 !== undefined) backendData.settings.logo_data = frontendData.settings.logo_base64; // Renommer logo_base64 en logo_data pour le backend
    if (frontendData.settings.primary_color !== undefined) backendData.settings.primary_color = frontendData.settings.primary_color;
    if (frontendData.settings.secondary_color !== undefined) backendData.settings.secondary_color = frontendData.settings.secondary_color;
    if (frontendData.settings.accent_color !== undefined) backendData.settings.accent_color = frontendData.settings.accent_color;
    if (frontendData.settings.timezone !== undefined) backendData.settings.timezone = frontendData.settings.timezone;
    if (frontendData.settings.language !== undefined) backendData.settings.language = frontendData.settings.language;
    if (frontendData.settings.currency !== undefined) backendData.settings.currency = frontendData.settings.currency;
    if (frontendData.settings.date_format !== undefined) backendData.settings.date_format = frontendData.settings.date_format;
    
    // Notifications
    if (frontendData.settings.notifications) {
      if (frontendData.settings.notifications.email_enabled !== undefined) {
        backendData.settings.email_notifications_enabled = frontendData.settings.notifications.email_enabled;
      }
      if (frontendData.settings.notifications.sms_enabled !== undefined) {
        backendData.settings.sms_notifications_enabled = frontendData.settings.notifications.sms_enabled;
      }
      if (frontendData.settings.notifications.push_enabled !== undefined) {
        backendData.settings.push_notifications_enabled = frontendData.settings.notifications.push_enabled;
      }
    }
    
    // Sécurité
    if (frontendData.settings.security) {
      if (frontendData.settings.security.two_factor_required !== undefined) {
        backendData.settings.two_factor_required = frontendData.settings.security.two_factor_required;
      }
      if (frontendData.settings.security.password_expiry_days !== undefined) {
        backendData.settings.password_expiry_days = frontendData.settings.security.password_expiry_days;
      }
      if (frontendData.settings.security.session_timeout_minutes !== undefined) {
        backendData.settings.session_timeout_minutes = frontendData.settings.security.session_timeout_minutes;
      }
    }
  }
  
  // Informations bancaires
  if (frontendData.bank_info) {
    backendData.bank_info = {};
    
    if (frontendData.bank_info.bank_name !== undefined) backendData.bank_info.bank_name = frontendData.bank_info.bank_name;
    if (frontendData.bank_info.iban !== undefined) backendData.bank_info.iban = frontendData.bank_info.iban;
    if (frontendData.bank_info.bic !== undefined) backendData.bank_info.bic = frontendData.bank_info.bic;
    if (frontendData.bank_info.account_owner !== undefined) backendData.bank_info.account_owner = frontendData.bank_info.account_owner;
  }
  
  // Autres données complexes (passées telles quelles)
  if (frontendData.vat_rates !== undefined) {
    console.log("Transformation des taux de TVA:", frontendData.vat_rates);
    backendData.vat_rates = frontendData.vat_rates;
  }
  if (frontendData.payment_terms !== undefined) backendData.payment_terms = frontendData.payment_terms;
  if (frontendData.document_numbering !== undefined) backendData.document_numbering = frontendData.document_numbering;
  if (frontendData.document_appearance !== undefined) backendData.document_appearance = frontendData.document_appearance;
  
  return backendData;
}