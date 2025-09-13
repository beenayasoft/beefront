/**
 * Service unifié de gestion des devises et formatage
 * Intègre les données du tenant-service backend et élimine le hardcoding
 */

import { tenantApi } from '@/lib/api/tenant';

export interface CurrencyConfig {
  code: string;           // MAD, EUR, USD, etc.
  symbol: string;         // DH, €, $, etc.
  position: 'before' | 'after';
  locale: string;         // fr-MA, fr-FR, en-US, etc.
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
}

export interface TenantCurrencyInfo {
  currency: string;
  currency_symbol: string;
  currency_position: 'before' | 'after';
  locale: string;
  timezone: string;
  language: string;
}

export class CurrencyService {
  private static _instance: CurrencyService;
  private static _currentConfig: CurrencyConfig | null = null;
  private static _cache: Map<string, TenantCurrencyInfo> = new Map();

  // Configuration par défaut (fallback)
  private static readonly DEFAULT_CONFIG: CurrencyConfig = {
    code: 'MAD',
    symbol: 'DH',
    position: 'after',
    locale: 'fr-MA',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    decimalPlaces: 2
  };

  // Mapping des locales vers les configurations de formatage
  private static readonly LOCALE_CONFIGS: Record<string, Partial<CurrencyConfig>> = {
    'fr-MA': { decimalSeparator: ',', thousandsSeparator: ' ' },
    'fr-FR': { decimalSeparator: ',', thousandsSeparator: ' ' },
    'en-US': { decimalSeparator: '.', thousandsSeparator: ',' },
    'en-GB': { decimalSeparator: '.', thousandsSeparator: ',' },
    'de-DE': { decimalSeparator: ',', thousandsSeparator: '.' },
    'ar-MA': { decimalSeparator: ',', thousandsSeparator: ' ' },
    'ar-AE': { decimalSeparator: '.', thousandsSeparator: ',' }
  };

  /**
   * Obtient l'instance singleton
   */
  public static getInstance(): CurrencyService {
    if (!CurrencyService._instance) {
      CurrencyService._instance = new CurrencyService();
    }
    return CurrencyService._instance;
  }

  /**
   * Initialise le service avec les informations du tenant
   */
  public static async initializeFromTenant(tenantId?: string): Promise<void> {
    if (!tenantId) {
      tenantId = localStorage.getItem('tenantId') || undefined;
    }

    if (tenantId) {
      try {
        const tenantInfo = await CurrencyService.fetchTenantCurrencyInfo(tenantId);
        if (tenantInfo) {
          CurrencyService.setCurrentConfig(CurrencyService.createConfigFromTenantInfo(tenantInfo));
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la devise:', error);
        CurrencyService.setCurrentConfig(CurrencyService.DEFAULT_CONFIG);
      }
    } else {
      CurrencyService.setCurrentConfig(CurrencyService.DEFAULT_CONFIG);
    }
  }

  /**
   * Récupère les informations de devise du tenant depuis le backend
   */
  private static async fetchTenantCurrencyInfo(tenantId: string): Promise<TenantCurrencyInfo | null> {
    // Vérifier le cache d'abord
    if (CurrencyService._cache.has(tenantId)) {
      return CurrencyService._cache.get(tenantId)!;
    }

    try {
      // Utiliser l'API client existant au lieu de fetch direct
      const data = await tenantApi.getCurrentTenantInfo();
      
      const currencyInfo: TenantCurrencyInfo = {
        currency: data.settings?.currency || 'MAD',
        currency_symbol: data.settings?.currency_symbol || 'DH',
        currency_position: data.settings?.currency_position || 'after',
        locale: data.settings?.locale || 'fr-MA',
        timezone: data.settings?.timezone || 'Africa/Casablanca',
        language: data.settings?.language || 'fr'
      };

      // Mettre en cache (5 minutes)
      CurrencyService._cache.set(tenantId, currencyInfo);
      setTimeout(() => CurrencyService._cache.delete(tenantId), 5 * 60 * 1000);

      return currencyInfo;
    } catch (error) {
      console.error('Erreur lors de la récupération des infos tenant:', error);
    }

    return null;
  }

  /**
   * Crée une CurrencyConfig depuis les données du tenant
   */
  private static createConfigFromTenantInfo(tenantInfo: TenantCurrencyInfo): CurrencyConfig {
    const localeConfig = CurrencyService.LOCALE_CONFIGS[tenantInfo.locale] || {};
    
    return {
      code: tenantInfo.currency,
      symbol: tenantInfo.currency_symbol,
      position: tenantInfo.currency_position,
      locale: tenantInfo.locale,
      decimalSeparator: localeConfig.decimalSeparator || ',',
      thousandsSeparator: localeConfig.thousandsSeparator || ' ',
      decimalPlaces: 2
    };
  }

  /**
   * Définit la configuration actuelle
   */
  public static setCurrentConfig(config: CurrencyConfig): void {
    CurrencyService._currentConfig = config;
  }

  /**
   * Obtient la configuration actuelle
   */
  public static getCurrentConfig(): CurrencyConfig {
    return CurrencyService._currentConfig || CurrencyService.DEFAULT_CONFIG;
  }

  /**
   * Formate un montant selon la devise actuelle
   */
  public static formatCurrency(
    amount: number | string | undefined | null,
    options: {
      showSymbol?: boolean;
      decimalPlaces?: number;
      useGrouping?: boolean;
    } = {}
  ): string {
    const config = CurrencyService.getCurrentConfig();
    
    // Valeurs par défaut
    const {
      showSymbol = true,
      decimalPlaces = config.decimalPlaces,
      useGrouping = true
    } = options;

    // Conversion en nombre
    let numericAmount: number;
    if (typeof amount === 'string') {
      numericAmount = parseFloat(amount.replace(/[^\d.-]/g, ''));
    } else if (typeof amount === 'number') {
      numericAmount = amount;
    } else {
      numericAmount = 0;
    }

    if (isNaN(numericAmount)) {
      numericAmount = 0;
    }

    // Formatage avec Intl.NumberFormat pour respecter la locale
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'decimal',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
      useGrouping
    });

    const formattedAmount = formatter.format(numericAmount);

    // Ajout du symbole de devise selon la position
    if (showSymbol) {
      if (config.position === 'before') {
        return `${config.symbol}${formattedAmount}`;
      } else {
        return `${formattedAmount} ${config.symbol}`;
      }
    }

    return formattedAmount;
  }

  /**
   * Parse un montant formaté vers un nombre
   */
  public static parseCurrency(formattedAmount: string): number {
    const config = CurrencyService.getCurrentConfig();
    
    // Supprimer les symboles de devise et espaces
    let cleanAmount = formattedAmount
      .replace(config.symbol, '')
      .trim()
      .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '');

    // Remplacer le séparateur décimal par un point
    if (config.decimalSeparator !== '.') {
      cleanAmount = cleanAmount.replace(config.decimalSeparator, '.');
    }

    const parsed = parseFloat(cleanAmount);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Obtient uniquement le code de devise
   */
  public static getCurrencyCode(): string {
    return CurrencyService.getCurrentConfig().code;
  }

  /**
   * Obtient uniquement le symbole de devise
   */
  public static getCurrencySymbol(): string {
    return CurrencyService.getCurrentConfig().symbol;
  }

  /**
   * Obtient la locale courante
   */
  public static getLocale(): string {
    return CurrencyService.getCurrentConfig().locale;
  }

  /**
   * Invalide le cache pour un tenant
   */
  public static invalidateCache(tenantId?: string): void {
    if (tenantId) {
      CurrencyService._cache.delete(tenantId);
    } else {
      CurrencyService._cache.clear();
    }
  }

  /**
   * Détecte automatiquement la devise basée sur la géolocalisation
   */
  public static async detectCurrency(): Promise<CurrencyConfig> {
    try {
      const response = await fetch('/api/tenants/detect_location/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const detectedLocation = data.detected_location;
        
        if (detectedLocation) {
          return {
            code: detectedLocation.currency,
            symbol: detectedLocation.currency_symbol,
            position: detectedLocation.currency_position,
            locale: detectedLocation.locale,
            decimalSeparator: CurrencyService.LOCALE_CONFIGS[detectedLocation.locale]?.decimalSeparator || ',',
            thousandsSeparator: CurrencyService.LOCALE_CONFIGS[detectedLocation.locale]?.thousandsSeparator || ' ',
            decimalPlaces: 2
          };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la détection de devise:', error);
    }

    return CurrencyService.DEFAULT_CONFIG;
  }

  /**
   * Applique automatiquement la configuration détectée à un tenant
   */
  public static async applyDetectedCurrency(tenantId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/apply_location_config/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        }
      });

      if (response.ok) {
        // Invalider le cache et recharger
        CurrencyService.invalidateCache(tenantId);
        await CurrencyService.initializeFromTenant(tenantId);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de la devise détectée:', error);
    }

    return false;
  }

  /**
   * Met à jour manuellement la devise d'un tenant
   */
  public static async updateCurrency(tenantId: string, currencyCode: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/update_currency_config/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({ currency: currencyCode })
      });

      if (response.ok) {
        // Invalider le cache et recharger
        CurrencyService.invalidateCache(tenantId);
        await CurrencyService.initializeFromTenant(tenantId);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de devise:', error);
    }

    return false;
  }

  /**
   * Obtient la liste des devises supportées
   */
  public static async getSupportedCurrencies(): Promise<Array<{
    code: string;
    symbol: string;
    name: string;
    countries: Array<{ code: string; name: string }>;
  }>> {
    try {
      const response = await fetch('/api/tenants/supported_currencies/');
      if (response.ok) {
        const data = await response.json();
        return data.currencies || [];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des devises:', error);
    }
    
    return [];
  }
}

// Export des fonctions utilitaires pour compatibilité
export const formatCurrency = CurrencyService.formatCurrency;
export const parseCurrency = CurrencyService.parseCurrency;
export const getCurrencyCode = CurrencyService.getCurrencyCode;
export const getCurrencySymbol = CurrencyService.getCurrencySymbol;

export default CurrencyService;