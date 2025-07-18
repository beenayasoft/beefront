import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un nombre en format monétaire
 * @param value - Valeur à formater
 * @param fractionDigits - Nombre de décimales (défaut: 2)
 * @returns Chaîne formatée
 */
export function formatCurrency(value?: number | null, fractionDigits = 2): string {
  if (value === undefined || value === null) {
    return '0,00';
  }
  
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}
