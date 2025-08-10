/**
 * Hook pour gérer la configuration initiale du tenant
 */

import { useState, useCallback } from 'react';

interface TenantData {
  id: string;
  name: string;
  detected_location?: {
    ip_address?: string;
    country_code: string;
    country_name: string;
    currency: string;
    timezone: string;
    language: string;
    city?: string;
    region?: string;
    vat_rates_created?: number;
    detection_error?: string;
  };
  country?: string;
  city?: string;
  postal_code?: string;
  settings?: {
    currency?: string;
    timezone?: string;
    language?: string;
  };
}

export const useTenantSetup = () => {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [tenantData, setTenantData] = useState<TenantData | null>(null);

  const openSetup = useCallback((data: TenantData) => {
    setTenantData(data);
    setIsSetupOpen(true);
  }, []);

  const closeSetup = useCallback(() => {
    setIsSetupOpen(false);
    setTenantData(null);
  }, []);

  const handleSetupSuccess = useCallback((updatedData: any) => {
    // Ici vous pouvez mettre à jour le contexte global du tenant
    // par exemple via un context provider ou état global
    console.log('Tenant setup completed:', updatedData);
    closeSetup();
  }, [closeSetup]);

  // Vérifier si le tenant nécessite une configuration
  const needsSetup = useCallback((data: TenantData): boolean => {
    // Le tenant nécessite une configuration si :
    // 1. Il a des données de détection à valider
    // 2. Il n'a pas de taux de TVA configurés
    // 3. Il manque des informations essentielles

    if (data.detected_location) {
      // Si on a détecté des données via IP, proposer la validation
      return true;
    }

    if (data.detected_location?.vat_rates_created === 0) {
      // Si aucun taux de TVA n'a été créé, configuration requise
      return true;
    }

    if (!data.country || !data.settings?.currency) {
      // Si des données essentielles manquent
      return true;
    }

    return false;
  }, []);

  return {
    isSetupOpen,
    tenantData,
    openSetup,
    closeSetup,
    handleSetupSuccess,
    needsSetup
  };
};

export default useTenantSetup;