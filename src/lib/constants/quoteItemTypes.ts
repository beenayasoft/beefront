/**
 * Configuration des types d'éléments de devis pour l'interface BTP
 */
import { QuoteItemType, QuoteItemTypeConfig, BTPUnits } from '@/features/documents/types';

/**
 * Configuration complète des types d'éléments
 */
export const QUOTE_ITEM_TYPE_CONFIGS: Record<QuoteItemType, QuoteItemTypeConfig> = {
  [QuoteItemType.PRODUCT]: {
    type: QuoteItemType.PRODUCT,
    label: 'Produit',
    description: 'Matériaux, fournitures, équipements',
    icon: '📦',
    allowPricing: true,
    allowQuantity: true,
    defaultUnit: BTPUnits.UNIT,
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  [QuoteItemType.SERVICE]: {
    type: QuoteItemType.SERVICE,
    label: 'Service',
    description: 'Prestations, main d\'œuvre, études',
    icon: '⚡',
    allowPricing: true,
    allowQuantity: true,
    defaultUnit: BTPUnits.HOUR,
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  [QuoteItemType.WORK]: {
    type: QuoteItemType.WORK,
    label: 'Ouvrage',
    description: 'Travaux composés, lots techniques',
    icon: '🏗️',
    allowPricing: true,
    allowQuantity: true,
    defaultUnit: BTPUnits.SQUARE_METER,
    color: 'bg-purple-50 border-purple-200 text-purple-800'
  },
  [QuoteItemType.CHAPTER]: {
    type: QuoteItemType.CHAPTER,
    label: 'Chapitre',
    description: 'Section principale, lot de travaux',
    icon: '📑',
    allowPricing: false,
    allowQuantity: false,
    color: 'bg-gray-50 border-gray-300 text-gray-800'
  },
  [QuoteItemType.SECTION]: {
    type: QuoteItemType.SECTION,
    label: 'Sous-section',
    description: 'Sous-partie d\'un chapitre',
    icon: '📄',
    allowPricing: false,
    allowQuantity: false,
    color: 'bg-gray-25 border-gray-200 text-gray-700'
  },
  [QuoteItemType.DISCOUNT]: {
    type: QuoteItemType.DISCOUNT,
    label: 'Remise',
    description: 'Réduction commerciale',
    icon: '💰',
    allowPricing: true,
    allowQuantity: false,
    defaultUnit: BTPUnits.PERCENT,
    color: 'bg-red-50 border-red-200 text-red-800'
  },
  [QuoteItemType.FREE_TEXT]: {
    type: QuoteItemType.FREE_TEXT,
    label: 'Texte libre',
    description: 'Commentaires, notes, descriptions',
    icon: '📝',
    allowPricing: false,
    allowQuantity: false,
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  [QuoteItemType.SEPARATOR]: {
    type: QuoteItemType.SEPARATOR,
    label: 'Séparateur',
    description: 'Ligne de séparation visuelle',
    icon: '➖',
    allowPricing: false,
    allowQuantity: false,
    color: 'bg-gray-100 border-gray-300 text-gray-600'
  }
};

/**
 * Unités de mesure avec leurs labels
 */
export const BTP_UNITS_LABELS: Record<BTPUnits, string> = {
  [BTPUnits.UNIT]: 'Unité',
  [BTPUnits.SQUARE_METER]: 'Mètre carré',
  [BTPUnits.CUBIC_METER]: 'Mètre cube',
  [BTPUnits.LINEAR_METER]: 'Mètre linéaire',
  [BTPUnits.KILOGRAM]: 'Kilogramme',
  [BTPUnits.TONNE]: 'Tonne',
  [BTPUnits.LITER]: 'Litre',
  [BTPUnits.HOUR]: 'Heure',
  [BTPUnits.DAY]: 'Jour',
  [BTPUnits.WEEK]: 'Semaine',
  [BTPUnits.MONTH]: 'Mois',
  [BTPUnits.PACKAGE]: 'Forfait',
  [BTPUnits.PERCENT]: 'Pourcentage'
};

/**
 * Types d'éléments organisés par catégorie
 */
export const QUOTE_ITEM_CATEGORIES = {
  content: {
    label: 'Contenu',
    types: [QuoteItemType.PRODUCT, QuoteItemType.SERVICE, QuoteItemType.WORK]
  },
  structure: {
    label: 'Structure',
    types: [QuoteItemType.CHAPTER, QuoteItemType.SECTION]
  },
  formatting: {
    label: 'Mise en forme',
    types: [QuoteItemType.FREE_TEXT, QuoteItemType.SEPARATOR]
  },
  commercial: {
    label: 'Commercial',
    types: [QuoteItemType.DISCOUNT]
  }
};

/**
 * Fonction utilitaire pour obtenir la configuration d'un type
 */
export const getQuoteItemTypeConfig = (type: QuoteItemType): QuoteItemTypeConfig => {
  return QUOTE_ITEM_TYPE_CONFIGS[type];
};

/**
 * Fonction utilitaire pour vérifier si un type permet la tarification
 */
export const allowsPricing = (type: QuoteItemType): boolean => {
  return QUOTE_ITEM_TYPE_CONFIGS[type].allowPricing;
};

/**
 * Fonction utilitaire pour vérifier si un type permet les quantités
 */
export const allowsQuantity = (type: QuoteItemType): boolean => {
  return QUOTE_ITEM_TYPE_CONFIGS[type].allowQuantity;
};

/**
 * Fonction utilitaire pour obtenir l'unité par défaut
 */
export const getDefaultUnit = (type: QuoteItemType): BTPUnits | undefined => {
  return QUOTE_ITEM_TYPE_CONFIGS[type].defaultUnit;
};