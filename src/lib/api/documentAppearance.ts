import { apiClient } from './client';

export interface DocumentAppearanceSettings {
  primaryColor: string;
  fontFamily?: string;
  showLogo: boolean;
  logoSize: number; // Taille du logo en pixels (8-30)
  // Nouveaux champs pour la gestion avancée du logo
  logoData?: string;
  logoPositionType?: 'left' | 'top' | 'header';
  logoCenterInHeader?: boolean;
  // Champs existants
  showCompanyName: boolean;
  showCompanySlogan: boolean;
  showCompanyAddress: boolean;
  showCompanyEmail: boolean;
  showCompanyPhone: boolean;
  showCompanyWebsite: boolean;
  showCompanySiret: boolean;
  showCompanyVat: boolean; // ICE au Maroc = numéro de TVA
  showClientAddress: boolean;
  showProjectInfo: boolean;
  showNotes: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;
  showSignatureArea: boolean;
  logoPosition?: 'left' | 'center' | 'right'; // Maintenu pour compatibilité
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
  // Nouveaux champs pour les styles de tableaux
  tableBorderStyle?: 'straight' | 'rounded';
  tableBorderHorizontal?: boolean;
  tableBorderVertical?: boolean;
  tableBorderWidth?: number;
  tableBorderColor?: string;
  sectionContrast?: boolean;
  sectionContrastColor?: string;
  showSectionSubtotals?: boolean;
  tableRowPadding?: number;
  tableColumnSpacing?: number;
  // Nouveaux champs pour les moyens de paiement
  showPaymentMethods?: boolean;
  paymentMethodsTitle?: string;
  paymentMethodsLayout?: 'horizontal' | 'vertical' | 'grid';
  paymentMethodsStyle?: 'modern' | 'classic' | 'minimal';
  // Champs existants
  showPaymentDetails?: boolean;
  showLegalMentions?: boolean;
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

export interface LogoPositionChoice {
  value: 'left' | 'top' | 'header';
  label: string;
  description: string;
}

export interface TableBorderStyleChoice {
  value: 'straight' | 'rounded';
  label: string;
  description: string;
}

export interface TableStylePreset {
  name: string;
  description: string;
  config: {
    tableBorderStyle: 'straight' | 'rounded';
    tableBorderHorizontal: boolean;
    tableBorderVertical: boolean;
    tableBorderWidth: number;
    sectionContrast: boolean;
    tableRowPadding: number;
    tableColumnSpacing: number;
  };
}

export interface TableStyleChoices {
  border_styles: TableBorderStyleChoice[];
  predefined_styles: Record<string, TableStylePreset>;
}

class DocumentAppearanceAPI {
  private baseUrl = '';

  /**
   * Convertit les noms de champs de snake_case vers camelCase depuis l'API backend
   */
  private convertFromSnakeCase(data: any): DocumentAppearanceSettings {
    const converted: any = {};
    
    // Conversion pour logoSize - conversion du pourcentage backend vers pixels frontend
    if ('logo_size' in data) {
      // Convertir le pourcentage (50-200%) vers pixels (8-30px)
      const percentage = data.logo_size;
      // Formule: pixels = 8 + ((percentage - 50) / 150) * 22
      const pixels = Math.round(8 + ((percentage - 50) / 150) * 22);
      converted.logoSize = Math.max(8, Math.min(30, pixels));
    }
    
    const fieldMapping: Record<string, string> = {
      primary_color: 'primaryColor',
      font_family: 'fontFamily',
      font_size: 'fontSize',
      show_logo: 'showLogo',
      // Nouveaux champs pour le logo
      logo_data: 'logoData',
      // logo_size est géré spécialement ci-dessus
      logo_position_type: 'logoPositionType',
      logo_center_in_header: 'logoCenterInHeader',
      // Champs existants
      show_company_name: 'showCompanyName',
      show_company_slogan: 'showCompanySlogan',
      show_company_address: 'showCompanyAddress',
      show_company_email: 'showCompanyEmail',
      show_company_phone: 'showCompanyPhone',
      show_company_website: 'showCompanyWebsite',
      show_company_siret: 'showCompanySiret',
      show_company_ice: 'showCompanyVat', // ICE = numéro de TVA au Maroc
      show_client_address: 'showClientAddress',
      show_project_info: 'showProjectInfo',
      show_notes: 'showNotes',
      show_payment_terms: 'showPaymentTerms',
      show_bank_details: 'showBankDetails',
      show_signature_area: 'showSignatureArea',
      table_header_color: 'tableHeaderColor',
      table_alternate_color: 'tableAlternateColor',
      // Nouveaux champs pour les styles de tableaux
      table_border_style: 'tableBorderStyle',
      table_border_horizontal: 'tableBorderHorizontal',
      table_border_vertical: 'tableBorderVertical',
      table_border_width: 'tableBorderWidth',
      table_border_color: 'tableBorderColor',
      section_contrast: 'sectionContrast',
      section_contrast_color: 'sectionContrastColor',
      show_section_subtotals: 'showSectionSubtotals',
      table_row_padding: 'tableRowPadding',
      table_column_spacing: 'tableColumnSpacing',
      // Nouveaux champs pour les moyens de paiement
      show_payment_methods: 'showPaymentMethods',
      payment_methods_title: 'paymentMethodsTitle',
      payment_methods_layout: 'paymentMethodsLayout',
      payment_methods_style: 'paymentMethodsStyle',
      // Champs existants
      logo_position: 'logoPosition', // Maintenu pour compatibilité
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
    
    // Vérification simple du tenant ID
    const rawTenantId = localStorage.getItem('tenantId');
    if (rawTenantId) {
      console.log('📥 Tenant ID actuel:', rawTenantId);
    }
    
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
    
    // Conversion pour logoSize - conversion des pixels frontend vers pourcentage backend
    if ('logoSize' in settings) {
      const pixels = settings.logoSize as number;
      // Formule inverse: percentage = 50 + ((pixels - 8) / 22) * 150
      const percentage = Math.round(50 + ((pixels - 8) / 22) * 150);
      converted.logo_size = Math.max(50, Math.min(200, percentage));
    }
    
    const fieldMapping: Record<string, string> = {
      primaryColor: 'primary_color',
      fontFamily: 'font_family',
      fontSize: 'font_size',
      showLogo: 'show_logo',
      // Nouveaux champs pour le logo
      logoData: 'logo_data',
      // logoSize est géré spécialement ci-dessus
      logoPositionType: 'logo_position_type',
      logoCenterInHeader: 'logo_center_in_header',
      // Champs existants
      showCompanyName: 'show_company_name',
      showCompanySlogan: 'show_company_slogan',
      showCompanyAddress: 'show_company_address',
      showCompanyEmail: 'show_company_email',
      showCompanyPhone: 'show_company_phone',
      showCompanyWebsite: 'show_company_website',
      showCompanySiret: 'show_company_siret',
      showCompanyVat: 'show_company_ice', // ICE = numéro de TVA au Maroc
      showClientAddress: 'show_client_address',
      showProjectInfo: 'show_project_info',
      showNotes: 'show_notes',
      showPaymentTerms: 'show_payment_terms',
      showBankDetails: 'show_bank_details',
      showSignatureArea: 'show_signature_area',
      tableHeaderColor: 'table_header_color',
      tableAlternateColor: 'table_alternate_color',
      // Nouveaux champs pour les styles de tableaux
      tableBorderStyle: 'table_border_style',
      tableBorderHorizontal: 'table_border_horizontal',
      tableBorderVertical: 'table_border_vertical',
      tableBorderWidth: 'table_border_width',
      tableBorderColor: 'table_border_color',
      sectionContrast: 'section_contrast',
      sectionContrastColor: 'section_contrast_color',
      showSectionSubtotals: 'show_section_subtotals',
      tableRowPadding: 'table_row_padding',
      tableColumnSpacing: 'table_column_spacing',
      // Nouveaux champs pour les moyens de paiement
      showPaymentMethods: 'show_payment_methods',
      paymentMethodsTitle: 'payment_methods_title',
      paymentMethodsLayout: 'payment_methods_layout',
      paymentMethodsStyle: 'payment_methods_style',
      // Champs existants
      logoPosition: 'logo_position', // Maintenu pour compatibilité
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

  /**
   * Récupère les choix de position du logo
   */
  async getLogoPositionChoices(): Promise<LogoPositionChoice[]> {
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/logo_positions/`);
    return response.data;
  }

  /**
   * Récupère les choix de styles de tableaux
   */
  async getTableStyleChoices(): Promise<TableStyleChoices> {
    const response = await apiClient.get(`${this.baseUrl}/document_appearance/table_styles/`);
    return response.data;
  }
}

export const documentAppearanceAPI = new DocumentAppearanceAPI();

// L'intercepteur principal dans client.ts gère déjà le nettoyage des headers