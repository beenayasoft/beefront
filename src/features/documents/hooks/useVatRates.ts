/**
 * Hook React pour la gestion des taux de TVA tenant-specific
 * Phase 2 : Remplacement des taux hardcodés par des appels dynamiques
 */
import { useState, useEffect, useCallback } from 'react';
import { VATRateInfo } from '../types/quotes.types';
import { tenantVatRatesApi } from '../api/tenantVatRates';

interface VatRatesState {
  vatRates: VATRateInfo[];
  defaultVatRate: VATRateInfo | null;
  loading: boolean;
  error: string | null;
}

export const useVatRates = (autoLoad = true) => {
  const [state, setState] = useState<VatRatesState>({
    vatRates: [],
    defaultVatRate: null,
    loading: false,
    error: null
  });

  const loadVatRates = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [vatRates, defaultVatRate] = await Promise.all([
        tenantVatRatesApi.getVatRates(),
        tenantVatRatesApi.getDefaultVatRate()
      ]);

      setState({
        vatRates: vatRates.filter(rate => rate.is_active),
        defaultVatRate,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur de chargement des taux de TVA'
      }));
    }
  }, []);

  const getVatRateByCode = useCallback((code: string): VATRateInfo | undefined => {
    return state.vatRates.find(rate => rate.code === code && rate.is_active);
  }, [state.vatRates]);

  const formatVatRate = useCallback((code: string): string => {
    const vatRate = getVatRateByCode(code);
    return vatRate ? vatRate.rate_display || `${vatRate.rate}%` : `${code}%`;
  }, [getVatRateByCode]);

  useEffect(() => {
    if (autoLoad) {
      loadVatRates();
    }
  }, [autoLoad, loadVatRates]);

  return {
    vatRates: state.vatRates,
    defaultVatRate: state.defaultVatRate,
    loading: state.loading,
    error: state.error,
    loadVatRates,
    getVatRateByCode,
    formatVatRate,
    hasVatRates: state.vatRates.length > 0,
    isReady: !state.loading && state.vatRates.length > 0
  };
};

export default useVatRates;