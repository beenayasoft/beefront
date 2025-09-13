import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CurrencyService from '@/lib/services/currencyService';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un nombre en format monétaire avec suffixes k/M pour les grandes valeurs
 * @param value - Valeur à formater
 * @param fractionDigits - Nombre de décimales (défaut: 2)
 * @param useShortFormat - Utiliser le format court avec k/M (défaut: false)
 * @returns Chaîne formatée
 */
export function formatCurrency(value?: number | string | null, fractionDigits = 2, useShortFormat = false): string {
  if (value === undefined || value === null) {
    return CurrencyService.formatCurrency(0, { decimalPlaces: fractionDigits, showSymbol: false });
  }
  
  // Convertir en nombre si c'est une chaîne
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Vérifier si c'est un nombre valide
  if (isNaN(numValue)) {
    return CurrencyService.formatCurrency(0, { decimalPlaces: fractionDigits, showSymbol: false });
  }
  
  // Si le format court est activé et la valeur est suffisamment grande
  if (useShortFormat) {
    const absValue = Math.abs(numValue);
    const config = CurrencyService.getCurrentConfig();
    
    // Millions (≥ 1 000 000)
    if (absValue >= 1000000) {
      const millions = numValue / 1000000;
      return `${millions.toLocaleString(config.locale, {
        minimumFractionDigits: millions % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 1,
      })}M`;
    }
    
    // Milliers (≥ 10 000)
    if (absValue >= 10000) {
      const thousands = numValue / 1000;
      return `${thousands.toLocaleString(config.locale, {
        minimumFractionDigits: thousands % 1 === 0 ? 0 : 1,
        maximumFractionDigits: 1,
      })}k`;
    }
  }
  
  // Format normal sans symbole de devise (comme l'original)
  return CurrencyService.formatCurrency(numValue, { 
    decimalPlaces: fractionDigits, 
    showSymbol: false 
  });
}
