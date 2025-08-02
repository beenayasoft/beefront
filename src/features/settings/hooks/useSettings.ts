import { useState, useEffect } from 'react';
import { settingsApi } from '../api/settings';
import { TenantInfo } from '../types/tenant';
import { toast } from '@/hooks/use-toast';

export function useSettings() {
  const [tenantData, setTenantData] = useState<TenantInfo>({} as TenantInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch tenant data
  const fetchTenantData = async () => {
    try {
      setIsLoading(true);
      const data = await settingsApi.getCurrentTenantInfo();
      setTenantData(data);
      setHasChanges(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données du tenant:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les données de votre entreprise.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update tenant data locally
  const updateTenantData = (partialData: Partial<TenantInfo>) => {
    setTenantData(prev => ({
      ...prev,
      ...partialData
    }));
    setHasChanges(true);
  };

  // Save changes to backend
  const saveTenantData = async () => {
    setIsSaving(true);
    try {
      const updatedData = await settingsApi.updateCurrentTenant(tenantData);
      setTenantData(updatedData);
      setHasChanges(false);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement des paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchTenantData();
  }, []);

  return {
    tenantData,
    isLoading,
    isSaving,
    hasChanges,
    updateTenantData,
    saveTenantData,
    refetch: fetchTenantData,
  };
}