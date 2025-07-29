import { apiClient } from './client';

export interface DocumentAppearanceSettings {
  documentTemplate: 'modern' | 'classic' | 'minimal';
  primaryColor: string;
  showLogo: boolean;
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showCompanyEmail: boolean;
  showCompanyPhone: boolean;
  showCompanyWebsite: boolean;
  showCompanySiret: boolean;
  showCompanyIce: boolean;
  showClientAddress: boolean;
  showProjectInfo: boolean;
  showNotes: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;
  showSignatureArea: boolean;
  logoPosition?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontSize?: number;
  lineSpacing?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  headerText?: string;
  footerText?: string;
  legalMentions?: string;
  tableHeaderColor?: string;
  tableAlternateColor?: string;
  showPaymentDetails?: boolean;
  showLegalMentions?: boolean;
}

export interface DocumentTemplate {
  value: 'modern' | 'classic' | 'minimal';
  label: string;
}

export interface ColorPreset {
  name: string;
  value: string;
}

export interface DocumentTemplatePreset {
  name: string;
  description: string;
  config: DocumentAppearanceSettings;
}

class DocumentAppearanceAPI {
  private baseUrl = '';

  /**
   * Convertit les noms de champs de snake_case vers camelCase depuis l'API backend
   */
  private convertFromSnakeCase(data: any): DocumentAppearanceSettings {
    const converted: any = {};
    
    const fieldMapping: Record<string, string> = {
      document_template: 'documentTemplate',
      primary_color: 'primaryColor',
      show_logo: 'showLogo',
      show_company_name: 'showCompanyName',
      show_company_address: 'showCompanyAddress',
      show_company_email: 'showCompanyEmail',
      show_company_phone: 'showCompanyPhone',
      show_company_website: 'showCompanyWebsite',
      show_company_siret: 'showCompanySiret',
      show_company_ice: 'showCompanyIce',
      show_client_address: 'showClientAddress',
      show_project_info: 'showProjectInfo',
      show_notes: 'showNotes',
      show_payment_terms: 'showPaymentTerms',
      show_bank_details: 'showBankDetails',
      show_signature_area: 'showSignatureArea',
      table_header_color: 'tableHeaderColor',
      table_alternate_color: 'tableAlternateColor',
      logo_position: 'logoPosition',
      font_family: 'fontFamily',
      font_size: 'fontSize',
      line_spacing: 'lineSpacing',
      margin_top: 'marginTop',
      margin_right: 'marginRight',
      margin_bottom: 'marginBottom',
      margin_left: 'marginLeft',
      header_text: 'headerText',
      footer_text: 'footerText',
      legal_mentions: 'legalMentions',
      show_payment_details: 'showPaymentDetails',
      show_legal_mentions: 'showLegalMentions'
    };

    for (const [backendKey, frontendKey] of Object.entries(fieldMapping)) {
      if (backendKey in data) {
        converted[frontendKey] = data[backendKey];
      }
    }

    return converted as DocumentAppearanceSettings;
  }

  /**
   * Récupère les paramètres d'apparence du tenant actuel
   */
  async getAppearanceSettings(): Promise<DocumentAppearanceSettings> {
    console.log('📥 DocumentAppearanceAPI.getAppearanceSettings - URL:', `${this.baseUrl}/document_appearance/`);
    console.log('📥 DocumentAppearanceAPI.getAppearanceSettings - Tenant ID from localStorage:', localStorage.getItem('tenantId'));
    
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/`);
    
    console.log('📥 DocumentAppearanceAPI.getAppearanceSettings - Response status:', response.status);
    console.log('📥 DocumentAppearanceAPI.getAppearanceSettings - Raw response data:', response.data);
    
    const convertedResponse = this.convertFromSnakeCase(response.data);
    console.log('📥 DocumentAppearanceAPI.getAppearanceSettings - Converted response:', convertedResponse);
    
    return convertedResponse;
  }

  /**
   * Convertit les noms de champs de camelCase vers snake_case pour l'API backend
   */
  private convertToSnakeCase(settings: Partial<DocumentAppearanceSettings>): any {
    const converted: any = {};
    
    const fieldMapping: Record<string, string> = {
      documentTemplate: 'document_template',
      primaryColor: 'primary_color',
      showLogo: 'show_logo',
      showCompanyName: 'show_company_name',
      showCompanyAddress: 'show_company_address',
      showCompanyEmail: 'show_company_email',
      showCompanyPhone: 'show_company_phone',
      showCompanyWebsite: 'show_company_website',
      showCompanySiret: 'show_company_siret',
      showCompanyIce: 'show_company_ice',
      showClientAddress: 'show_client_address',
      showProjectInfo: 'show_project_info',
      showNotes: 'show_notes',
      showPaymentTerms: 'show_payment_terms',
      showBankDetails: 'show_bank_details',
      showSignatureArea: 'show_signature_area',
      tableHeaderColor: 'table_header_color',
      tableAlternateColor: 'table_alternate_color',
      logoPosition: 'logo_position',
      fontFamily: 'font_family',
      fontSize: 'font_size',
      lineSpacing: 'line_spacing',
      marginTop: 'margin_top',
      marginRight: 'margin_right',
      marginBottom: 'margin_bottom',
      marginLeft: 'margin_left',
      headerText: 'header_text',
      footerText: 'footer_text',
      legalMentions: 'legal_mentions',
      showPaymentDetails: 'show_payment_details',
      showLegalMentions: 'show_legal_mentions'
    };

    for (const [frontendKey, backendKey] of Object.entries(fieldMapping)) {
      if (frontendKey in settings) {
        converted[backendKey] = (settings as any)[frontendKey];
      }
    }

    return converted;
  }

  /**
   * Met à jour les paramètres d'apparence du tenant actuel
   */
  async updateAppearanceSettings(settings: Partial<DocumentAppearanceSettings>): Promise<DocumentAppearanceSettings> {
    console.log('🔄 DocumentAppearanceAPI.updateAppearanceSettings - Input settings:', settings);
    const convertedSettings = this.convertToSnakeCase(settings);
    console.log('🔄 DocumentAppearanceAPI.updateAppearanceSettings - Converted settings for API:', convertedSettings);
    console.log('🔄 DocumentAppearanceAPI.updateAppearanceSettings - URL:', `${this.baseUrl}/document_appearance/`);
    console.log('🔄 DocumentAppearanceAPI.updateAppearanceSettings - Tenant ID from localStorage:', localStorage.getItem('tenantId'));
    
    const response = await apiClient.patch(`${this.baseUrl}/document_appearance/`, convertedSettings);
    
    console.log('✅ DocumentAppearanceAPI.updateAppearanceSettings - Response status:', response.status);
    console.log('✅ DocumentAppearanceAPI.updateAppearanceSettings - Response data:', response.data);
    
    const convertedResponse = this.convertFromSnakeCase(response.data);
    console.log('✅ DocumentAppearanceAPI.updateAppearanceSettings - Converted response:', convertedResponse);
    
    return convertedResponse;
  }

  /**
   * Remplace complètement les paramètres d'apparence du tenant actuel
   */
  async replaceAppearanceSettings(settings: DocumentAppearanceSettings): Promise<DocumentAppearanceSettings> {
    const convertedSettings = this.convertToSnakeCase(settings);
    const response = await apiClient.put(`${this.baseUrl}/document_appearance/`, convertedSettings);
    return this.convertFromSnakeCase(response.data);
  }

  /**
   * Récupère les valeurs par défaut des paramètres d'apparence
   */
  async getDefaults(): Promise<DocumentAppearanceSettings> {
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/defaults/`);
    return this.convertFromSnakeCase(response.data);
  }

  /**
   * Récupère la liste des templates disponibles
   */
  async getTemplateChoices(): Promise<DocumentTemplate[]> {
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/templates/`);
    return response.data;
  }

  /**
   * Récupère la liste des couleurs prédéfinies
   */
  async getColorPresets(): Promise<ColorPreset[]> {
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/colors/`);
    return response.data;
  }

  /**
   * Récupère les modèles prédéfinis complets
   */
  async getTemplatePresets(): Promise<Record<string, DocumentTemplatePreset>> {
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/presets/`);
    return response.data;
  }
}

export const documentAppearanceAPI = new DocumentAppearanceAPI();