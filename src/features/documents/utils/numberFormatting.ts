/**
 * Utilitaires pour le formatage des numéros de documents
 * Gère le remplacement des variables dans les formats de numérotation
 */

/**
 * Formate un numéro selon le format configuré dans les settings
 * @param format Format configuré (ex: "BRE-{AAAA}-{XXXX}-2025")
 * @param number Numéro séquentiel
 * @returns Numéro formaté (ex: "BRE-2025-0007-2025")
 */
export function formatNumberWithSettings(format: string, number: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let formattedNumber = format;

  // Remplacer les variables par leurs valeurs
  const replacements = {
    '{AAAA}': year.toString(),
    '{AA}': year.toString().slice(-2),
    '{MM}': month,
    '{DD}': day,
    '{XXXX}': number.toString().padStart(4, '0'),
    '{XXX}': number.toString().padStart(3, '0'),
    '{XX}': number.toString().padStart(2, '0'),
    '{X}': number.toString()
  };

  Object.entries(replacements).forEach(([variable, value]) => {
    formattedNumber = formattedNumber.replace(new RegExp(`\\${variable}`, 'g'), value);
  });

  return formattedNumber;
}

/**
 * Extrait le prochain numéro séquentiel depuis un format de numérotation
 * @param numberingSettings Settings de numérotation
 * @param documentType Type de document ('quote' | 'invoice')
 * @returns Le prochain numéro séquentiel
 */
export function getNextSequentialNumber(numberingSettings: any[], documentType: string): number {
  const settings = numberingSettings?.find(s => s.document_type === documentType);
  
  // Vérifier différentes propriétés selon la structure des settings
  if (documentType === 'quote') {
    return settings?.nextQuoteNumber || settings?.next_number || 1;
  } else if (documentType === 'invoice') {
    return settings?.nextInvoiceNumber || settings?.next_number || 1;
  }
  
  return settings?.next_number || 1;
}

/**
 * Obtient le format configuré pour un type de document
 * @param numberingSettings Settings de numérotation
 * @param documentType Type de document ('quote' | 'invoice')
 * @returns Le format configuré ou un format par défaut
 */
export function getDocumentFormat(numberingSettings: any[], documentType: string): string {
  const settings = numberingSettings?.find(s => s.document_type === documentType);
  
  // Priorité 1: custom_format
  if (settings?.custom_format) {
    return settings.custom_format;
  }
  
  // Priorité 2: quoteFormat ou invoiceFormat (depuis NumberingFormatForm)
  if (documentType === 'quote' && settings?.quoteFormat) {
    return settings.quoteFormat;
  }
  if (documentType === 'invoice' && settings?.invoiceFormat) {
    return settings.invoiceFormat;
  }
  
  // Priorité 3: prefix avec variables (format complet)
  if (settings?.prefix && (
    settings.prefix.includes('{AAAA}') || 
    settings.prefix.includes('{AA}') || 
    settings.prefix.includes('{XXXX}') ||
    settings.prefix.includes('{XXX}') ||
    settings.prefix.includes('{XX}') ||
    settings.prefix.includes('{X}')
  )) {
    return settings.prefix;
  }
  
  // Priorité 4: construire le format avec prefix simple
  if (documentType === 'quote') {
    return settings?.prefix ? `${settings.prefix}-{AAAA}-{XXXX}` : 'DEV-{AAAA}-{XXXX}';
  } else if (documentType === 'invoice') {
    return settings?.prefix ? `${settings.prefix}-{AAAA}-{XXXX}` : 'FAC-{AAAA}-{XXXX}';
  }
  
  return 'DOC-{AAAA}-{XXXX}';
}