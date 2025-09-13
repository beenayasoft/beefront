/**
 * Context React pour la gestion globale de la devise
 * Intègre le CurrencyService et fournit l'état global de devise à toute l'app
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import CurrencyService, { CurrencyConfig } from '@/lib/services/currencyService';

interface CurrencyContextType {
  // État actuel
  config: CurrencyConfig;
  isLoading: boolean;
  error: string | null;
  
  // Fonctions de formatage
  formatCurrency: (amount: number | string | undefined | null, options?: {
    showSymbol?: boolean;
    decimalPlaces?: number;
    useGrouping?: boolean;
  }) => string;
  
  parseCurrency: (formattedAmount: string) => number;
  getCurrencyCode: () => string;
  getCurrencySymbol: () => string;
  getLocale: () => string;
  
  // Actions
  initializeTenant: (tenantId?: string) => Promise<void>;
  detectAndApplyCurrency: (tenantId: string) => Promise<boolean>;
  updateCurrency: (tenantId: string, currencyCode: string) => Promise<boolean>;
  getSupportedCurrencies: () => Promise<Array<{
    code: string;
    symbol: string;
    name: string;
    countries: Array<{ code: string; name: string }>;
  }>>;
  
  // Utilitaires
  refresh: () => Promise<void>;
  clearError: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  tenantId?: string;
  autoInitialize?: boolean;
}

export function CurrencyProvider({ children, tenantId, autoInitialize = true }: CurrencyProviderProps) {
  const [config, setConfig] = useState<CurrencyConfig>(CurrencyService.getCurrentConfig());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialisation automatique
  useEffect(() => {
    if (autoInitialize) {
      initializeTenant(tenantId);
    }
  }, [tenantId, autoInitialize]);

  // Synchronisation avec le service
  useEffect(() => {
    const updateConfig = () => {
      setConfig(CurrencyService.getCurrentConfig());
    };

    // Écouter les changements de configuration
    const interval = setInterval(updateConfig, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const initializeTenant = async (targetTenantId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await CurrencyService.initializeFromTenant(targetTenantId);
      setConfig(CurrencyService.getCurrentConfig());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'initialisation';
      setError(errorMessage);
      console.error('Erreur initialisation devise:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAndApplyCurrency = async (targetTenantId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await CurrencyService.applyDetectedCurrency(targetTenantId);
      if (success) {
        setConfig(CurrencyService.getCurrentConfig());
        return true;
      } else {
        setError('Impossible de détecter et appliquer la devise automatiquement');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la détection';
      setError(errorMessage);
      console.error('Erreur détection devise:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrency = async (targetTenantId: string, currencyCode: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await CurrencyService.updateCurrency(targetTenantId, currencyCode);
      if (success) {
        setConfig(CurrencyService.getCurrentConfig());
        return true;
      } else {
        setError('Impossible de mettre à jour la devise');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      console.error('Erreur mise à jour devise:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getSupportedCurrencies = async () => {
    setError(null);
    try {
      return await CurrencyService.getSupportedCurrencies();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      console.error('Erreur récupération devises:', err);
      return [];
    }
  };

  const refresh = async () => {
    const currentTenantId = tenantId || localStorage.getItem('tenantId') || undefined;
    await initializeTenant(currentTenantId);
  };

  const clearError = () => {
    setError(null);
  };

  // Fonctions de formatage qui utilisent la config actuelle
  const formatCurrency = (
    amount: number | string | undefined | null, 
    options?: {
      showSymbol?: boolean;
      decimalPlaces?: number;
      useGrouping?: boolean;
    }
  ) => CurrencyService.formatCurrency(amount, options);

  const parseCurrency = (formattedAmount: string) => CurrencyService.parseCurrency(formattedAmount);
  const getCurrencyCode = () => CurrencyService.getCurrencyCode();
  const getCurrencySymbol = () => CurrencyService.getCurrencySymbol();
  const getLocale = () => CurrencyService.getLocale();

  const contextValue: CurrencyContextType = {
    // État
    config,
    isLoading,
    error,
    
    // Fonctions de formatage
    formatCurrency,
    parseCurrency,
    getCurrencyCode,
    getCurrencySymbol,
    getLocale,
    
    // Actions
    initializeTenant,
    detectAndApplyCurrency,
    updateCurrency,
    getSupportedCurrencies,
    
    // Utilitaires
    refresh,
    clearError
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte de devise
 */
export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  
  return context;
}

/**
 * Hook pour formatage rapide (sans accès au contexte complet)
 */
export function useFormatCurrency() {
  const { formatCurrency } = useCurrency();
  return formatCurrency;
}

/**
 * Hook pour les informations de base sur la devise
 */
export function useCurrencyInfo() {
  const { config, getCurrencyCode, getCurrencySymbol, getLocale } = useCurrency();
  
  return {
    config,
    currencyCode: getCurrencyCode(),
    currencySymbol: getCurrencySymbol(),
    locale: getLocale()
  };
}

export default CurrencyContext;