/**
 * API client pour les paramètres d'apparence des documents
 * Utilise l'API tenant-service pour la configuration des PDF
 */
import { apiClient } from '@/lib/api/client';
import { DocumentAppearanceConfig } from '../hooks/useDocumentAppearance';

// Interface pour la réponse de l'API tenant
interface TenantInfoResponse {
  id: string;
  name: string;
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
  document_appearance?: any; // Configuration d'apparence en snake_case
  vat_rates?: any[];
  payment_terms?: any[];
  document_numbering?: any[];
}

/**
 * API pour les paramètres d'apparence des documents
 */
export const documentAppearanceApi = {
  /**
   * Récupère les paramètres d'apparence du tenant courant
   */
  async getSettings(): Promise<DocumentAppearanceConfig> {
    try {
      console.log('🔍 Récupération des paramètres d\'apparence via tenant-service...');
      const response = await apiClient.get<TenantInfoResponse>('/tenants/current_tenant_info/');
      
      console.log('📡 Réponse API tenant getSettings:', response.data);
      
      if (response.data && response.data.document_appearance) {
        console.log('✅ Paramètres bruts du tenant-service:', response.data.document_appearance);
        
        // Transformer les données du backend (snake_case) vers le frontend (camelCase)
        const transformedData = transformFromSnakeCase(response.data.document_appearance);
        console.log('🔄 Paramètres transformés pour le frontend:', transformedData);
        
        return transformedData;
      }
      
      // Si pas de configuration trouvée, retourner la config par défaut
      console.warn('⚠️ Aucune configuration d\'apparence trouvée, utilisation des paramètres par défaut');
      return getDefaultConfig();
      
    } catch (error: any) {
      console.warn('⚠️ Erreur récupération paramètres:', error?.response?.status, error?.message);
      console.warn('🔄 ATTENTION: Utilisation des paramètres par défaut (showLogo: true)');
      // Retourner la configuration par défaut si l'API échoue
      return getDefaultConfig();
    }
  },

  /**
   * Sauvegarde les paramètres d'apparence (alias pour updateSettings)
   */
  async saveSettings(config: DocumentAppearanceConfig): Promise<DocumentAppearanceConfig> {
    return this.updateSettings(config);
  },

  /**
   * Met à jour les paramètres d'apparence via tenant-service
   */
  async updateSettings(config: DocumentAppearanceConfig): Promise<DocumentAppearanceConfig> {
    try {
      // Transformer les données camelCase en snake_case pour l'API
      const transformedConfig = transformToSnakeCase(config);
      console.log('💾 Sauvegarde des paramètres via tenant-service:', config);
      console.log('🔄 Données transformées pour l\'API tenant:', transformedConfig);
      
      // Mise à jour partielle via PATCH avec document_appearance
      const response = await apiClient.patch<TenantInfoResponse>(
        '/tenants/current_tenant_info/',
        {
          document_appearance: transformedConfig
        }
      );
      
      console.log('📡 Réponse API tenant updateSettings:', response.data);
      
      if (response.data && response.data.document_appearance) {
        console.log('✅ Paramètres sauvegardés avec succès dans tenant-service');
        // Transformer les données de réponse du backend vers le frontend
        const result = transformFromSnakeCase(response.data.document_appearance);
        console.log('🔄 Données finales transformées:', result);
        return result;
      } else {
        throw new Error('Réponse invalide du tenant-service');
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde tenant-service:', error?.response?.data || error?.message);
      throw error;
    }
  },

  /**
   * Supprime les paramètres personnalisés (retour aux paramètres par défaut)
   */
  async resetToDefault(): Promise<DocumentAppearanceConfig> {
    try {
      // Remettre à la configuration par défaut via le tenant-service
      const defaultConfig = getDefaultConfig();
      const transformedConfig = transformToSnakeCase(defaultConfig);
      
      const response = await apiClient.patch<TenantInfoResponse>(
        '/tenants/current_tenant_info/',
        {
          document_appearance: transformedConfig
        }
      );
      
      if (response.data && response.data.document_appearance) {
        return transformFromSnakeCase(response.data.document_appearance);
      }
      
      return defaultConfig;
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      return getDefaultConfig();
    }
  },

  /**
   * Exporte la configuration au format JSON
   */
  async exportConfiguration(): Promise<Blob> {
    try {
      const config = await this.getSettings();
      const jsonString = JSON.stringify(config, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      console.error('❌ Erreur lors de l\'export:', error);
      throw error;
    }
  },

  /**
   * Importe une configuration depuis un fichier JSON
   */
  async importConfiguration(configFile: File): Promise<DocumentAppearanceConfig> {
    try {
      const fileContent = await configFile.text();
      const config = JSON.parse(fileContent) as DocumentAppearanceConfig;
      return await this.updateSettings(config);
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
      throw new Error('Fichier de configuration invalide');
    }
  },

  /**
   * Prévisualise une configuration sans la sauvegarder
   * Note: Cette fonction nécessiterait une implémentation côté document-service
   */
  async previewConfiguration(config: DocumentAppearanceConfig, documentId: string): Promise<Blob> {
    // Cette fonctionnalité nécessiterait une API dédiée dans le document-service
    // Pour l'instant, on lève une erreur
    throw new Error('Fonctionnalité de prévisualisation non disponible');
  }
};

/**
 * Configuration par défaut
 */
function getDefaultConfig(): DocumentAppearanceConfig {
  return {
    documentTemplate: 'modern',
    primaryColor: '#1B333F',
    secondaryColor: '#64748B',
    fontFamily: 'Inter',
    fontSize: 11,
    
    showLogo: true,
    logoSize: 60,
    logoPositionType: 'left',
    logoCenterInHeader: false,
    
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyEmail: true,
    showCompanyPhone: true,
    showCompanyWebsite: true,
    showCompanySiret: true,
    showCompanyIce: true,
    
    showClientAddress: true,
    showProjectInfo: true,
    
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: true,
    
    tableHeaderColor: '#F8F9FA',
    tableAlternateColor: '#F2F2F2',
    tableBorderStyle: 'rounded',
    tableBorderHorizontal: true,
    tableBorderVertical: true,
    tableBorderWidth: 1,
    tableBorderColor: '#E2E8F0',
    sectionContrast: true,
    sectionContrastColor: '#EEF2FF',
    showSectionSubtotals: true,
    tableRowPadding: 8,
    tableColumnSpacing: 12,
    
    showPaymentMethods: true,
    paymentMethodsTitle: 'Moyens de paiement',
    paymentMethodsLayout: 'horizontal',
    paymentMethodsStyle: 'modern'
  };
}

/**
 * Transforme les clés snake_case en camelCase depuis l'API
 */
function transformFromSnakeCase(data: any): DocumentAppearanceConfig {
  // Si les données sont nulles/undefined, retourner la config par défaut
  if (!data || typeof data !== 'object') {
    console.warn('⚠️ Données invalides reçues du backend, utilisation de la config par défaut');
    return getDefaultConfig();
  }

  const camelCaseConfig: any = {};
  
  // Mapping inverse des clés snake_case vers camelCase
  const keyMapping: Record<string, string> = {
    // Propriétés principales
    'document_template': 'documentTemplate',
    'primary_color': 'primaryColor',
    'secondary_color': 'secondaryColor',
    'font_family': 'fontFamily',
    'font_size': 'fontSize',
    
    // Logo
    'show_logo': 'showLogo',
    'logo_size': 'logoSize',
    'logo_position_type': 'logoPositionType',
    'logo_center_in_header': 'logoCenterInHeader',
    'logo_data': 'logoData',
    'logo_position': 'logoPositionType', // Mapping pour logo_position du backend
    'logo_position_display': 'logoPositionDisplay', // Nouveau champ du backend
    
    // En-tête et pied de page
    'header_text': 'headerText',
    'footer_text': 'footerText',
    
    // Informations entreprise
    'show_company_name': 'showCompanyName',
    'show_company_address': 'showCompanyAddress',
    'show_company_email': 'showCompanyEmail',
    'show_company_phone': 'showCompanyPhone',
    'show_company_website': 'showCompanyWebsite',
    'show_company_siret': 'showCompanySiret',
    'show_company_ice': 'showCompanyIce',
    
    // Affichage sections
    'show_client_address': 'showClientAddress',
    'show_project_info': 'showProjectInfo',
    'show_notes': 'showNotes',
    'show_payment_terms': 'showPaymentTerms',
    'show_bank_details': 'showBankDetails',
    'show_signature_area': 'showSignatureArea',
    'show_payment_details': 'showPaymentDetails',
    'show_legal_mentions': 'showLegalMentions',
    'legal_mentions': 'legalMentions',
    
    // Marges et espacement
    'line_spacing': 'lineSpacing',
    'margin_top': 'marginTop',
    'margin_right': 'marginRight',
    'margin_bottom': 'marginBottom',
    'margin_left': 'marginLeft',
    
    // Tableaux
    'table_header_color': 'tableHeaderColor',
    'table_alternate_color': 'tableAlternateColor',
    'table_border_style': 'tableBorderStyle',
    'table_border_horizontal': 'tableBorderHorizontal',
    'table_border_vertical': 'tableBorderVertical',
    'table_border_width': 'tableBorderWidth',
    'table_border_color': 'tableBorderColor',
    'section_contrast': 'sectionContrast',
    'section_contrast_color': 'sectionContrastColor',
    'show_section_subtotals': 'showSectionSubtotals',
    'table_row_padding': 'tableRowPadding',
    'table_column_spacing': 'tableColumnSpacing',
    
    // Moyens de paiement
    'show_payment_methods': 'showPaymentMethods',
    'payment_methods_title': 'paymentMethodsTitle',
    'payment_methods_layout': 'paymentMethodsLayout',
    'payment_methods_style': 'paymentMethodsStyle'
  };
  
  // Vérifier si les données sont déjà en camelCase (clé 'showLogo' existe)
  if (data.hasOwnProperty('showLogo') || data.hasOwnProperty('primaryColor')) {
    console.log('ℹ️ Données déjà en camelCase, pas de transformation nécessaire');
    return data as DocumentAppearanceConfig;
  }
  
  // Transformer chaque clé de snake_case vers camelCase
  Object.entries(data).forEach(([key, value]) => {
    const camelKey = keyMapping[key] || key;
    camelCaseConfig[camelKey] = value;
  });
  
  // Commencer avec les données transformées du backend
  // Puis ajouter seulement les valeurs par défaut pour les clés manquantes
  const defaultConfig = getDefaultConfig();
  const finalConfig: any = { ...camelCaseConfig }; // Priorité aux données backend !
  
  // Ajouter seulement les valeurs par défaut pour les clés qui n'existent pas dans les données backend
  Object.entries(defaultConfig).forEach(([key, defaultValue]) => {
    if (finalConfig[key] === undefined || finalConfig[key] === null) {
      finalConfig[key] = defaultValue;
      console.log(`🔧 Valeur par défaut appliquée pour ${key}: ${defaultValue}`);
    } else {
      console.log(`✅ Valeur du backend conservée pour ${key}: ${finalConfig[key]} (type: ${typeof finalConfig[key]})`);
    }
  });
  
  // CORRECTION CRITIQUE : Si le backend a des valeurs explicites, les conserver ABSOLUMENT
  // Ne pas les écraser avec les valeurs par défaut
  Object.entries(camelCaseConfig).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      finalConfig[key] = value;
      console.log(`🔒 Valeur backend FORCÉE pour ${key}: ${value} (priorité absolue)`);
    }
  });
  
  console.log('🔄 Transformation snake_case → camelCase:', { 
    original: data, 
    camelCased: camelCaseConfig,
    final: finalConfig 
  });
  
  return finalConfig as DocumentAppearanceConfig;
}

/**
 * Transforme les clés camelCase en snake_case pour l'API
 */
function transformToSnakeCase(config: DocumentAppearanceConfig): any {
  const snakeCaseConfig: any = {};
  
  // Mapping des clés camelCase vers snake_case
  const keyMapping: Record<string, string> = {
    // Propriétés principales
    'documentTemplate': 'document_template',
    'primaryColor': 'primary_color',
    'secondaryColor': 'secondary_color',
    'fontFamily': 'font_family',
    'fontSize': 'font_size',
    
    // Logo
    'showLogo': 'show_logo',
    'logoSize': 'logo_size',
    'logoPositionType': 'logo_position_type',
    'logoCenterInHeader': 'logo_center_in_header',
    'logoData': 'logo_data',
    'logoPositionDisplay': 'logo_position_display',
    
    // En-tête et pied de page
    'headerText': 'header_text',
    'footerText': 'footer_text',
    
    // Informations entreprise
    'showCompanyName': 'show_company_name',
    'showCompanyAddress': 'show_company_address',
    'showCompanyEmail': 'show_company_email',
    'showCompanyPhone': 'show_company_phone',
    'showCompanyWebsite': 'show_company_website',
    'showCompanySiret': 'show_company_siret',
    'showCompanyIce': 'show_company_ice',
    
    // Affichage sections
    'showClientAddress': 'show_client_address',
    'showProjectInfo': 'show_project_info',
    'showNotes': 'show_notes',
    'showPaymentTerms': 'show_payment_terms',
    'showBankDetails': 'show_bank_details',
    'showSignatureArea': 'show_signature_area',
    'showPaymentDetails': 'show_payment_details',
    'showLegalMentions': 'show_legal_mentions',
    'legalMentions': 'legal_mentions',
    
    // Marges et espacement
    'lineSpacing': 'line_spacing',
    'marginTop': 'margin_top',
    'marginRight': 'margin_right',
    'marginBottom': 'margin_bottom',
    'marginLeft': 'margin_left',
    
    // Tableaux
    'tableHeaderColor': 'table_header_color',
    'tableAlternateColor': 'table_alternate_color',
    'tableBorderStyle': 'table_border_style',
    'tableBorderHorizontal': 'table_border_horizontal',
    'tableBorderVertical': 'table_border_vertical',
    'tableBorderWidth': 'table_border_width',
    'tableBorderColor': 'table_border_color',
    'sectionContrast': 'section_contrast',
    'sectionContrastColor': 'section_contrast_color',
    'showSectionSubtotals': 'show_section_subtotals',
    'tableRowPadding': 'table_row_padding',
    'tableColumnSpacing': 'table_column_spacing',
    
    // Moyens de paiement
    'showPaymentMethods': 'show_payment_methods',
    'paymentMethodsTitle': 'payment_methods_title',
    'paymentMethodsLayout': 'payment_methods_layout',
    'paymentMethodsStyle': 'payment_methods_style'
  };
  
  // Transformer chaque clé
  Object.entries(config).forEach(([key, value]) => {
    const snakeKey = keyMapping[key] || key;
    
    // S'assurer que logoSize est un nombre
    if (key === 'logoSize' && typeof value !== 'number') {
      snakeCaseConfig[snakeKey] = parseInt(String(value)) || 60;
    } else {
      snakeCaseConfig[snakeKey] = value;
    }
  });
  
  return snakeCaseConfig;
}

export default documentAppearanceApi;