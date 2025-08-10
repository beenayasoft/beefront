/**
 * Hook intelligent pour la gestion des taux de TVA
 * Fournit une logique intelligente et proactive pour les taux de TVA
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VATRateInfo } from '../types/quotes.types';
import { tenantVatRatesApi, CreateVatRateData, VatRateCreationResult } from '../api/tenantVatRates';
import VatRateIntelligenceService, { VatRateTemplate } from '../services/vatRateIntelligence';

// Hook pour récupérer les informations du tenant actuel depuis l'API
const useTenantInfo = () => {
  const [tenantInfo, setTenantInfo] = useState({
    country: 'MA', // Maroc par défaut pour Beenaya
    currency: 'MAD',
    tenantId: localStorage.getItem('tenantId') || '',
    detected_location: null as any
  });

  useEffect(() => {
    const fetchTenantInfo = async () => {
      const tenantId = localStorage.getItem('tenantId');
      if (!tenantId) return;

      try {
        // Appeler l'API pour récupérer les informations tenant complètes
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/tenants/current_tenant_info/`, {
          headers: {
            'X-Tenant-ID': tenantId,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTenantInfo({
            country: data.country || 'MA',
            currency: data.settings?.currency || 'MAD',
            tenantId: tenantId,
            detected_location: data.detected_location,
            // Inclure toutes les données tenant pour la détection intelligente
            ...data
          });
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération des informations tenant:', error);
      }
    };

    fetchTenantInfo();
  }, []);

  return tenantInfo;
};

export interface SmartVatRatesState {
  // Données des taux de TVA
  vatRates: VATRateInfo[];
  loading: boolean;
  error: Error | null;
  
  // États intelligents
  isEmpty: boolean;
  hasDefaultRate: boolean;
  canCreateQuickly: boolean;
  needsConfiguration: boolean;
  
  // Informations contextuelles
  defaultVatRate: VATRateInfo | null;
  suggestedRates: VatRateTemplate[];
  detectedCountry: string;
  
  // Actions
  actions: {
    refresh: () => Promise<void>;
    createVatRate: (data: CreateVatRateData) => Promise<VATRateInfo>;
    quickCreate: (rate: number, name?: string, isDefault?: boolean) => Promise<VATRateInfo>;
    bulkCreate: (templates: VatRateTemplate[]) => Promise<VatRateCreationResult>;
    setupInitial: () => Promise<VatRateCreationResult>;
    setDefault: (id: string) => Promise<VATRateInfo>;
    delete: (id: string) => Promise<void>;
  };
}

/**
 * Hook intelligent pour les taux de TVA
 */
export const useSmartVatRates = (): SmartVatRatesState => {
  const queryClient = useQueryClient();
  const tenantInfo = useTenantInfo();
  
  // Query pour récupérer les taux de TVA
  const {
    data: vatRates = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['vatRates', tenantInfo.tenantId],
    queryFn: () => tenantVatRatesApi.getVatRates(),
    enabled: !!tenantInfo.tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  // Mutations pour les actions CRUD
  const createMutation = useMutation({
    mutationFn: tenantVatRatesApi.createVatRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] });
    }
  });

  const bulkCreateMutation = useMutation({
    mutationFn: tenantVatRatesApi.bulkCreateVatRates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVatRateData> }) =>
      tenantVatRatesApi.updateVatRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: tenantVatRatesApi.deleteVatRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vatRates'] });
    }
  });

  // États dérivés intelligents
  const isEmpty = useMemo(() => !loading && vatRates.length === 0, [loading, vatRates]);
  
  const defaultVatRate = useMemo(() => 
    vatRates.find(rate => rate.is_default && rate.is_active) || null,
    [vatRates]
  );
  
  const hasDefaultRate = useMemo(() => !!defaultVatRate, [defaultVatRate]);
  
  const canCreateQuickly = useMemo(() => 
    !loading && (isEmpty || !hasDefaultRate),
    [loading, isEmpty, hasDefaultRate]
  );
  
  const needsConfiguration = useMemo(() => 
    !loading && isEmpty,
    [loading, isEmpty]
  );

  // Détection intelligente du pays et suggestions
  const detectedCountry = useMemo(() =>
    VatRateIntelligenceService.detectCountryFromTenant(tenantInfo),
    [tenantInfo]
  );

  const suggestedRates = useMemo(() => {
    if (!isEmpty) return [];
    return VatRateIntelligenceService.getCommonVatRates(detectedCountry);
  }, [isEmpty, detectedCountry]);

  // Actions
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const createVatRate = useCallback(async (data: CreateVatRateData): Promise<VATRateInfo> => {
    return await createMutation.mutateAsync(data);
  }, [createMutation]);

  const quickCreate = useCallback(async (
    rate: number, 
    name?: string, 
    isDefault: boolean = false
  ): Promise<VATRateInfo> => {
    return await tenantVatRatesApi.quickCreateVatRate(rate, name, isDefault);
  }, []);

  const bulkCreate = useCallback(async (templates: VatRateTemplate[]): Promise<VatRateCreationResult> => {
    const vatRatesData = templates.map(template => ({
      code: template.code,
      name: template.name,
      rate: template.rate,
      description: template.description,
      is_default: template.is_default,
      is_active: true
    }));

    return await bulkCreateMutation.mutateAsync({ vat_rates: vatRatesData });
  }, [bulkCreateMutation]);

  const setupInitial = useCallback(async (): Promise<VatRateCreationResult> => {
    const initialSetup = VatRateIntelligenceService.generateInitialSetup(detectedCountry);
    
    if (initialSetup.recommended.length === 0) {
      throw new Error(`Aucune configuration disponible pour le pays: ${detectedCountry}`);
    }

    return await bulkCreate(initialSetup.recommended);
  }, [detectedCountry, bulkCreate]);

  const setDefault = useCallback(async (id: string): Promise<VATRateInfo> => {
    return await updateMutation.mutateAsync({ 
      id, 
      data: { is_default: true } 
    });
  }, [updateMutation]);

  const deleteVatRate = useCallback(async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    // Données
    vatRates,
    loading: loading || createMutation.isPending || bulkCreateMutation.isPending,
    error: error || createMutation.error || bulkCreateMutation.error || updateMutation.error || deleteMutation.error,
    
    // États intelligents
    isEmpty,
    hasDefaultRate,
    canCreateQuickly,
    needsConfiguration,
    
    // Contexte
    defaultVatRate,
    suggestedRates,
    detectedCountry,
    
    // Actions
    actions: {
      refresh,
      createVatRate,
      quickCreate,
      bulkCreate,
      setupInitial,
      setDefault: setDefault,
      delete: deleteVatRate
    }
  };
};

/**
 * Hook simplifié pour utilisation dans les composants simples
 */
export const useVatRatesSimple = () => {
  const { vatRates, loading, error, isEmpty, defaultVatRate, actions } = useSmartVatRates();
  
  return {
    vatRates,
    loading,
    error,
    isEmpty,
    defaultVatRate,
    refresh: actions.refresh,
    quickCreate: actions.quickCreate
  };
};

/**
 * Hook pour la validation et suggestions contextuelles
 */
export const useVatRateValidation = () => {
  const { detectedCountry } = useSmartVatRates();
  
  const validateRate = useCallback((rate: number) => {
    return VatRateIntelligenceService.validateVatRateForCountry(rate, detectedCountry);
  }, [detectedCountry]);

  const getSuggestions = useCallback((currentRates: VATRateInfo[] = []) => {
    const availableRates = VatRateIntelligenceService.getCommonVatRates(detectedCountry);
    const existingCodes = new Set(currentRates.map(r => r.code));
    
    return availableRates.filter(rate => !existingCodes.has(rate.code));
  }, [detectedCountry]);

  return {
    validateRate,
    getSuggestions,
    detectedCountry
  };
};

export default useSmartVatRates;