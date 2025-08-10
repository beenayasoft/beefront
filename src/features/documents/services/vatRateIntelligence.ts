/**
 * Service d'intelligence pour les taux de TVA par pays
 * Fournit les taux standards et recommandations contextuelles
 */

export interface VatRateTemplate {
  code: string;
  name: string;
  rate: number;
  description: string;
  is_default: boolean;
  is_common: boolean; // Indique si c'est un taux couramment utilisé
}

export interface CountryVatInfo {
  country: string;
  countryCode: string;
  currency: string;
  standardRates: VatRateTemplate[];
  reducedRates: VatRateTemplate[];
  specialRates: VatRateTemplate[];
}

class VatRateIntelligenceService {
  /**
   * Base de données des taux de TVA par pays
   * Source: Données officielles des administrations fiscales
   */
  private static readonly COUNTRY_VAT_DATA: Record<string, CountryVatInfo> = {
    'FR': {
      country: 'France',
      countryCode: 'FR',
      currency: 'EUR',
      standardRates: [
        {
          code: '20',
          name: 'TVA Normale',
          rate: 20,
          description: 'Taux normal applicable à la plupart des biens et services',
          is_default: true,
          is_common: true
        }
      ],
      reducedRates: [
        {
          code: '10',
          name: 'TVA Intermédiaire',
          rate: 10,
          description: 'Restauration, transport, travaux de logement',
          is_default: false,
          is_common: true
        },
        {
          code: '5.5',
          name: 'TVA Réduite',
          rate: 5.5,
          description: 'Produits alimentaires, livres, spectacles',
          is_default: false,
          is_common: true
        },
        {
          code: '2.1',
          name: 'TVA Super-réduite',
          rate: 2.1,
          description: 'Médicaments, presse',
          is_default: false,
          is_common: false
        }
      ],
      specialRates: [
        {
          code: '0',
          name: 'TVA 0%',
          rate: 0,
          description: 'Exports, opérations exonérées',
          is_default: false,
          is_common: true
        }
      ]
    },

    'MA': {
      country: 'Maroc',
      countryCode: 'MA',
      currency: 'MAD',
      standardRates: [
        {
          code: '20',
          name: 'TVA Normale',
          rate: 20,
          description: 'Taux normal applicable à la plupart des biens et services',
          is_default: true,
          is_common: true
        }
      ],
      reducedRates: [
        {
          code: '14',
          name: 'TVA Réduite',
          rate: 14,
          description: 'Certains produits et services spécifiques',
          is_default: false,
          is_common: true
        },
        {
          code: '10',
          name: 'TVA Réduite Spéciale',
          rate: 10,
          description: 'Certains produits alimentaires et services',
          is_default: false,
          is_common: true
        },
        {
          code: '7',
          name: 'TVA Très Réduite',
          rate: 7,
          description: 'Produits de première nécessité',
          is_default: false,
          is_common: false
        }
      ],
      specialRates: [
        {
          code: '0',
          name: 'TVA 0%',
          rate: 0,
          description: 'Exports, opérations exonérées',
          is_default: false,
          is_common: true
        }
      ]
    },

    'BE': {
      country: 'Belgique',
      countryCode: 'BE',
      currency: 'EUR',
      standardRates: [
        {
          code: '21',
          name: 'TVA Normale',
          rate: 21,
          description: 'Taux normal applicable à la plupart des biens et services',
          is_default: true,
          is_common: true
        }
      ],
      reducedRates: [
        {
          code: '12',
          name: 'TVA Intermédiaire',
          rate: 12,
          description: 'Margarine, produits d\'origine sociale',
          is_default: false,
          is_common: true
        },
        {
          code: '6',
          name: 'TVA Réduite',
          rate: 6,
          description: 'Produits alimentaires, médicaments, livres',
          is_default: false,
          is_common: true
        }
      ],
      specialRates: [
        {
          code: '0',
          name: 'TVA 0%',
          rate: 0,
          description: 'Exports, opérations exonérées',
          is_default: false,
          is_common: true
        }
      ]
    },

    'ES': {
      country: 'Espagne',
      countryCode: 'ES',
      currency: 'EUR',
      standardRates: [
        {
          code: '21',
          name: 'IVA General',
          rate: 21,
          description: 'Tipo general aplicable a la mayoría de bienes y servicios',
          is_default: true,
          is_common: true
        }
      ],
      reducedRates: [
        {
          code: '10',
          name: 'IVA Reducido',
          rate: 10,
          description: 'Transporte, hostelería, servicios culturales',
          is_default: false,
          is_common: true
        },
        {
          code: '4',
          name: 'IVA Superreducido',
          rate: 4,
          description: 'Productos alimentarios básicos, medicamentos, libros',
          is_default: false,
          is_common: true
        }
      ],
      specialRates: [
        {
          code: '0',
          name: 'IVA 0%',
          rate: 0,
          description: 'Exportaciones, operaciones exentas',
          is_default: false,
          is_common: true
        }
      ]
    }
  };

  /**
   * Obtient les taux de TVA recommandés pour un pays
   */
  static getCountryVatRates(countryCode: string): CountryVatInfo | null {
    return this.COUNTRY_VAT_DATA[countryCode.toUpperCase()] || null;
  }

  /**
   * Obtient les taux les plus couramment utilisés pour un pays
   */
  static getCommonVatRates(countryCode: string): VatRateTemplate[] {
    const countryData = this.getCountryVatRates(countryCode);
    if (!countryData) return [];

    const allRates = [
      ...countryData.standardRates,
      ...countryData.reducedRates,
      ...countryData.specialRates
    ];

    return allRates.filter(rate => rate.is_common);
  }

  /**
   * Obtient le taux par défaut pour un pays
   */
  static getDefaultVatRate(countryCode: string): VatRateTemplate | null {
    const countryData = this.getCountryVatRates(countryCode);
    if (!countryData) return null;

    const allRates = [
      ...countryData.standardRates,
      ...countryData.reducedRates,
      ...countryData.specialRates
    ];

    return allRates.find(rate => rate.is_default) || null;
  }

  /**
   * Obtient tous les taux disponibles pour un pays, organisés par catégorie
   */
  static getAllVatRates(countryCode: string): VatRateTemplate[] {
    const countryData = this.getCountryVatRates(countryCode);
    if (!countryData) return [];

    return [
      ...countryData.standardRates,
      ...countryData.reducedRates,
      ...countryData.specialRates
    ];
  }

  /**
   * Génère des suggestions de configuration initiale
   */
  static generateInitialSetup(countryCode: string): {
    recommended: VatRateTemplate[];
    optional: VatRateTemplate[];
    country: string;
  } {
    const countryData = this.getCountryVatRates(countryCode);
    
    if (!countryData) {
      return {
        recommended: [],
        optional: [],
        country: 'Inconnu'
      };
    }

    const allRates = this.getAllVatRates(countryCode);
    const recommended = allRates.filter(rate => rate.is_common);
    const optional = allRates.filter(rate => !rate.is_common);

    return {
      recommended,
      optional,
      country: countryData.country
    };
  }

  /**
   * Détecte le pays probable basé sur les informations du tenant
   * Priorise les données de géolocalisation IP si disponibles
   */
  static detectCountryFromTenant(tenant: any): string {
    // 1. Priorité: données de géolocalisation IP détectées lors de la création
    if (tenant?.detected_location?.country_code) {
      return tenant.detected_location.country_code;
    }

    // 2. Pays explicite du tenant (modifié par l'utilisateur)
    if (tenant?.country) {
      const countryMappings: Record<string, string> = {
        'France': 'FR',
        'Maroc': 'MA',
        'Morocco': 'MA',
        'Belgique': 'BE',
        'Belgium': 'BE',
        'Espagne': 'ES',
        'Spain': 'ES',
        'Suisse': 'CH',
        'Switzerland': 'CH',
        'Canada': 'CA',
        'États-Unis': 'US',
        'United States': 'US',
        'Royaume-Uni': 'GB',
        'United Kingdom': 'GB'
      };
      
      return countryMappings[tenant.country] || tenant.country;
    }

    // 3. Détection par devise (si elle a été configurée intelligemment)
    if (tenant?.settings?.currency) {
      const currencyMappings: Record<string, string> = {
        'EUR': 'FR', // Par défaut France pour EUR
        'MAD': 'MA',
        'CHF': 'CH',
        'CAD': 'CA',
        'USD': 'US',
        'GBP': 'GB'
      };
      
      const detectedCountry = currencyMappings[tenant.settings.currency];
      if (detectedCountry) return detectedCountry;
    }

    // 4. Détection par code postal (exemples)
    if (tenant?.postal_code) {
      const postalCode = tenant.postal_code.toString();
      if (/^[0-9]{5}$/.test(postalCode)) return 'FR';
      if (/^[0-9]{5}$/.test(postalCode) && parseInt(postalCode) >= 20000) return 'MA';
      if (/^[0-9]{4}$/.test(postalCode)) return 'BE';
      if (/^[0-9]{4}$/.test(postalCode) && parseInt(postalCode) >= 1000) return 'CH';
    }

    // 5. Détection par domaine email
    if (tenant?.email) {
      const domain = tenant.email.split('@')[1]?.toLowerCase();
      if (domain?.endsWith('.fr')) return 'FR';
      if (domain?.endsWith('.ma')) return 'MA';
      if (domain?.endsWith('.be')) return 'BE';
      if (domain?.endsWith('.es')) return 'ES';
      if (domain?.endsWith('.ch')) return 'CH';
      if (domain?.endsWith('.ca')) return 'CA';
      if (domain?.endsWith('.us') || domain?.endsWith('.com')) return 'US';
      if (domain?.endsWith('.uk') || domain?.endsWith('.co.uk')) return 'GB';
    }

    // Défaut: Maroc (contexte Beenaya)
    return 'MA';
  }

  /**
   * Formate un taux de TVA pour l'affichage
   */
  static formatVatRate(rate: VatRateTemplate): string {
    return `${rate.name} (${rate.rate}%)`;
  }

  /**
   * Valide qu'un taux de TVA est correct pour un pays
   */
  static validateVatRateForCountry(rate: number, countryCode: string): {
    isValid: boolean;
    warning?: string;
    suggestion?: string;
  } {
    const countryData = this.getCountryVatRates(countryCode);
    
    if (!countryData) {
      return { isValid: true }; // Pas de validation si pays inconnu
    }

    const allRates = this.getAllVatRates(countryCode);
    const existingRate = allRates.find(r => r.rate === rate);

    if (existingRate) {
      return { isValid: true };
    }

    // Vérification de cohérence
    const maxRate = Math.max(...allRates.map(r => r.rate));
    
    if (rate > maxRate + 5) {
      return {
        isValid: false,
        warning: `Ce taux semble élevé pour ${countryData.country}`,
        suggestion: `Le taux maximum habituel est ${maxRate}%`
      };
    }

    return { isValid: true };
  }

  /**
   * Obtient la liste des pays supportés
   */
  static getSupportedCountries(): Array<{ code: string; name: string; currency: string }> {
    return Object.entries(this.COUNTRY_VAT_DATA).map(([code, data]) => ({
      code,
      name: data.country,
      currency: data.currency
    }));
  }
}

export default VatRateIntelligenceService;