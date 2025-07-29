/**
 * Service de calculs métier côté frontend
 * Synchronisé avec la logique backend du Document-Service
 */

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vatAmount: number;
  total: number;
}

export interface ItemCalculationData {
  quantity: number;
  unitPrice: number;
  discountPercentage?: number;
  vatRate?: number;
}

export interface DocumentCalculationData {
  items: ItemCalculationData[];
  globalDiscountPercentage?: number;
  globalVatRate?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RoundingOptions {
  decimals: number;
  method: 'round' | 'floor' | 'ceil';
}

/**
 * Service de calcul pour les documents (devis, factures)
 */
export class CalculationService {
  /**
   * Taux de TVA par défaut (pour compatibilité avec l'ancien système)
   * @deprecated Utiliser les taux de TVA dynamiques à la place
   */
  private readonly VAT_RATES = {
    EXEMPT: 0,
    REDUCED_55: 5.5,
    REDUCED_10: 10,
    STANDARD: 20
  };

  /**
   * Arrondit un montant selon les options spécifiées
   */
  private roundAmount(amount: number, options: RoundingOptions = this.DEFAULT_ROUNDING): number {
    const multiplier = Math.pow(10, options.decimals);
    
    switch (options.method) {
      case 'floor':
        return Math.floor(amount * multiplier) / multiplier;
      case 'ceil':
        return Math.ceil(amount * multiplier) / multiplier;
      default:
        return Math.round(amount * multiplier) / multiplier;
    }
  }

  /**
   * Calcule les totaux pour un élément individuel
   */
  calculateItemTotals(item: ItemCalculationData, roundingOptions?: RoundingOptions): CalculationResult {
    const {
      quantity = 0,
      unitPrice = 0,
      discountPercentage = 0,
      vatRate = 20
    } = item;

    // Sous-total HT
    const subtotal = this.roundAmount(quantity * unitPrice, roundingOptions);

    // Remise
    const discountAmount = this.roundAmount(
      subtotal * (discountPercentage / 100),
      roundingOptions
    );

    // Sous-total après remise
    const subtotalAfterDiscount = this.roundAmount(
      subtotal - discountAmount,
      roundingOptions
    );

    // TVA
    const vatAmount = this.roundAmount(
      subtotalAfterDiscount * (vatRate / 100),
      roundingOptions
    );

    // Total TTC
    const total = this.roundAmount(
      subtotalAfterDiscount + vatAmount,
      roundingOptions
    );

    return {
      subtotal,
      discountAmount,
      subtotalAfterDiscount,
      vatAmount,
      total
    };
  }

  /**
   * Calcule les totaux pour un document complet
   */
  calculateDocumentTotals(
    document: DocumentCalculationData,
    roundingOptions?: RoundingOptions
  ): CalculationResult {
    const { items, globalDiscountPercentage = 0, globalVatRate } = document;

    let totalSubtotal = 0;
    let totalDiscountAmount = 0;
    let totalSubtotalAfterDiscount = 0;
    let totalVatAmount = 0;

    // Calculer chaque élément
    items.forEach(item => {
      const itemResult = this.calculateItemTotals(item, roundingOptions);
      totalSubtotal += itemResult.subtotal;
      totalDiscountAmount += itemResult.discountAmount;
      totalSubtotalAfterDiscount += itemResult.subtotalAfterDiscount;
      totalVatAmount += itemResult.vatAmount;
    });

    // Appliquer une remise globale si définie
    if (globalDiscountPercentage > 0) {
      const globalDiscountAmount = this.roundAmount(
        totalSubtotalAfterDiscount * (globalDiscountPercentage / 100),
        roundingOptions
      );
      totalDiscountAmount += globalDiscountAmount;
      totalSubtotalAfterDiscount -= globalDiscountAmount;
    }

    // Recalculer la TVA si un taux global est défini
    if (globalVatRate !== undefined) {
      totalVatAmount = this.roundAmount(
        totalSubtotalAfterDiscount * (globalVatRate / 100),
        roundingOptions
      );
    }

    const total = this.roundAmount(
      totalSubtotalAfterDiscount + totalVatAmount,
      roundingOptions
    );

    return {
      subtotal: this.roundAmount(totalSubtotal, roundingOptions),
      discountAmount: this.roundAmount(totalDiscountAmount, roundingOptions),
      subtotalAfterDiscount: this.roundAmount(totalSubtotalAfterDiscount, roundingOptions),
      vatAmount: this.roundAmount(totalVatAmount, roundingOptions),
      total
    };
  }

  /**
   * Valide les montants d'un élément
   */
  validateItemAmounts(item: ItemCalculationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Vérifications obligatoires
    if (item.quantity < 0) {
      errors.push('La quantité ne peut pas être négative');
    }

    if (item.unitPrice < 0) {
      errors.push('Le prix unitaire ne peut pas être négatif');
    }

    if (item.discountPercentage && (item.discountPercentage < 0 || item.discountPercentage > 100)) {
      errors.push('Le pourcentage de remise doit être entre 0 et 100');
    }

    if (item.vatRate && item.vatRate < 0) {
      errors.push('Le taux de TVA ne peut pas être négatif');
    }

    // Vérifications d'avertissement
    if (item.quantity === 0) {
      warnings.push('La quantité est nulle');
    }

    if (item.unitPrice === 0) {
      warnings.push('Le prix unitaire est nul');
    }

    if (item.discountPercentage && item.discountPercentage > 50) {
      warnings.push('Remise élevée (>50%)');
    }

    if (item.vatRate && !Object.values(this.VAT_RATES).includes(item.vatRate)) {
      warnings.push('Taux de TVA non standard en France');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valide les montants d'un document complet
   */
  validateDocumentAmounts(document: DocumentCalculationData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Valider chaque élément
    document.items.forEach((item, index) => {
      const itemValidation = this.validateItemAmounts(item);
      
      itemValidation.errors.forEach(error => {
        errors.push(`Élément ${index + 1}: ${error}`);
      });
      
      itemValidation.warnings.forEach(warning => {
        warnings.push(`Élément ${index + 1}: ${warning}`);
      });
    });

    // Valider les paramètres globaux
    if (document.globalDiscountPercentage && 
        (document.globalDiscountPercentage < 0 || document.globalDiscountPercentage > 100)) {
      errors.push('Le pourcentage de remise globale doit être entre 0 et 100');
    }

    if (document.globalVatRate && document.globalVatRate < 0) {
      errors.push('Le taux de TVA global ne peut pas être négatif');
    }

    // Vérifications métier
    if (document.items.length === 0) {
      warnings.push('Le document ne contient aucun élément');
    }

    const totals = this.calculateDocumentTotals(document);
    if (totals.total === 0) {
      warnings.push('Le montant total du document est nul');
    }

    if (totals.total > 1000000) {
      warnings.push('Montant très élevé (>1M€)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calcule le pourcentage de marge
   */
  calculateMargin(sellingPrice: number, costPrice: number): number {
    if (costPrice === 0) return 0;
    return this.roundAmount(((sellingPrice - costPrice) / costPrice) * 100);
  }

  /**
   * Calcule le prix de vente à partir d'un coût et d'une marge
   */
  calculateSellingPrice(costPrice: number, marginPercentage: number): number {
    return this.roundAmount(costPrice * (1 + marginPercentage / 100));
  }

  /**
   * Convertit un montant HT en TTC
   */
  convertHTtoTTC(amountHT: number, vatRate: number): number {
    return this.roundAmount(amountHT * (1 + vatRate / 100));
  }

  /**
   * Convertit un montant TTC en HT
   */
  convertTTCtoHT(amountTTC: number, vatRate: number): number {
    return this.roundAmount(amountTTC / (1 + vatRate / 100));
  }

  /**
   * Calcule la répartition des taxes par taux
   */
  calculateVATBreakdown(document: DocumentCalculationData): Array<{
    rate: number;
    base: number;
    amount: number;
  }> {
    const vatBreakdown = new Map<number, { base: number; amount: number }>();

    document.items.forEach(item => {
      const vatRate = item.vatRate || 20;
      const itemTotals = this.calculateItemTotals(item);
      
      const current = vatBreakdown.get(vatRate) || { base: 0, amount: 0 };
      current.base += itemTotals.subtotalAfterDiscount;
      current.amount += itemTotals.vatAmount;
      vatBreakdown.set(vatRate, current);
    });

    return Array.from(vatBreakdown.entries()).map(([rate, values]) => ({
      rate,
      base: this.roundAmount(values.base),
      amount: this.roundAmount(values.amount)
    }));
  }

  /**
   * Retourne les taux de TVA disponibles (ancienne version)
   * @deprecated Utiliser useVatRates hook à la place
   */
  getAvailableVATRates(): Array<{ value: number; label: string }> {
    return [
      { value: this.VAT_RATES.EXEMPT, label: '0% (Exonéré)' },
      { value: this.VAT_RATES.REDUCED_55, label: '5,5% (Réduit)' },
      { value: this.VAT_RATES.REDUCED_10, label: '10% (Intermédiaire)' },
      { value: this.VAT_RATES.STANDARD, label: '20% (Normal)' }
    ];
  }
}

export const CalculationService = new CalculationService();
export default CalculationService;