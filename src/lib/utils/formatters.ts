/**
 * Utilitaires de formatage pour l'application
 */

import CurrencyService from '@/lib/services/currencyService';

/**
 * Formate un montant selon la devise du tenant
 * @param amount Montant à formater
 * @param options Options de formatage
 * @returns Chaîne formatée
 */
export const formatCurrency = (
  amount: number | string | undefined,
  options: {
    showSymbol?: boolean;
    decimalPlaces?: number;
    useGrouping?: boolean;
  } = {}
): string => {
  return CurrencyService.formatCurrency(amount, options);
};

/**
 * Formate une date au format français
 * @param dateString Chaîne de date ISO ou objet Date
 * @param options Options de formatage
 * @returns Date formatée
 */
export const formatDate = (
  dateString: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' }
): string => {
  if (!dateString) {
    return '';
  }

  // Convertir en objet Date si nécessaire
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  // Formater avec l'API Intl
  return new Intl.DateTimeFormat('fr-FR', options).format(date);
};

/**
 * Formate une date au format court (JJ/MM/AAAA)
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns Date formatée
 */
export const formatShortDate = (dateString: string | Date | undefined): string => {
  return formatDate(dateString, { dateStyle: 'short' });
};

/**
 * Formate une date et heure
 * @param dateString Chaîne de date ISO ou objet Date
 * @returns Date et heure formatées
 */
export const formatDateTime = (dateString: string | Date | undefined): string => {
  return formatDate(dateString, { dateStyle: 'short', timeStyle: 'short' });
};

/**
 * Formate un pourcentage
 * @param value Valeur à formater
 * @param options Options de formatage
 * @returns Pourcentage formaté
 */
export const formatPercent = (
  value: number | string | undefined,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (value === undefined || value === null) {
    return '0%';
  }

  // Convertir en nombre si nécessaire
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Formater avec l'API Intl
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options
  }).format(numericValue / 100); // Diviser par 100 car l'API Intl multiplie par 100
};

/**
 * Formate un nombre
 * @param value Valeur à formater
 * @param options Options de formatage
 * @returns Nombre formaté
 */
export const formatNumber = (
  value: number | string | undefined,
  options: Intl.NumberFormatOptions = {}
): string => {
  if (value === undefined || value === null) {
    return '0';
  }

  // Convertir en nombre si nécessaire
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  // Formater avec l'API Intl
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  }).format(numericValue);
};
