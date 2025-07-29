/**
 * Hook React pour la gestion des conditions de paiement tenant-specific
 * Phase 2 : Récupération dynamique depuis le backend
 */
import { useState, useEffect, useCallback } from 'react';
import { PaymentTerm, paymentTermsApi } from '../api/paymentTerms';

interface PaymentTermsState {
  paymentTerms: PaymentTerm[];
  defaultPaymentTerm: PaymentTerm | null;
  loading: boolean;
  error: string | null;
}

export const usePaymentTerms = (autoLoad = true) => {
  const [state, setState] = useState<PaymentTermsState>({
    paymentTerms: [],
    defaultPaymentTerm: null,
    loading: false,
    error: null
  });

  const loadPaymentTerms = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const [paymentTerms, defaultPaymentTerm] = await Promise.all([
        paymentTermsApi.getPaymentTerms(),
        paymentTermsApi.getDefaultPaymentTerm()
      ]);

      setState({
        paymentTerms: paymentTerms.filter(term => term.is_active),
        defaultPaymentTerm,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur de chargement des conditions de paiement'
      }));
    }
  }, []);

  const getPaymentTermById = useCallback((id: string): PaymentTerm | undefined => {
    return state.paymentTerms.find(term => term.id === id && term.is_active);
  }, [state.paymentTerms]);

  const getPaymentTermByDays = useCallback((days: number): PaymentTerm | undefined => {
    return state.paymentTerms.find(term => term.days === days && term.is_active);
  }, [state.paymentTerms]);

  useEffect(() => {
    if (autoLoad) {
      loadPaymentTerms();
    }
  }, [autoLoad, loadPaymentTerms]);

  return {
    paymentTerms: state.paymentTerms,
    defaultPaymentTerm: state.defaultPaymentTerm,
    loading: state.loading,
    error: state.error,
    loadPaymentTerms,
    getPaymentTermById,
    getPaymentTermByDays,
    hasPaymentTerms: state.paymentTerms.length > 0,
    isReady: !state.loading && state.paymentTerms.length > 0
  };
};

export default usePaymentTerms;