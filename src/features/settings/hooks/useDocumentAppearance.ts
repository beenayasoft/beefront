import { useState, useEffect } from 'react';
import { documentAppearanceAPI, DocumentAppearanceSettings } from '@/lib/api/documentAppearance';
import { toast } from '@/hooks/use-toast';

export function useDocumentAppearance() {
  const [settings, setSettings] = useState<DocumentAppearanceSettings>({} as DocumentAppearanceSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier que le tenant ID est valide avant de faire la requête
      const tenantId = localStorage.getItem('tenantId');
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!tenantId || !uuidRegex.test(tenantId.replace(/[\xa0\u00A0\u2000-\u200B\uFEFF]/g, '').trim())) {
        console.error('❌ Tenant ID invalide ou manquant, utilisation des valeurs par défaut');
        throw new Error('Tenant ID invalide');
      }
      
      const data = await documentAppearanceAPI.getAppearanceSettings();
      setSettings(data);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des paramètres d'apparence:", error);
      
      // Valeurs par défaut en cas d'erreur
      const defaultSettings: DocumentAppearanceSettings = {
        primaryColor: '#1B333F',
        showLogo: true,
        logoSize: 16,
        showCompanyName: true,
        showCompanySlogan: true,
        showCompanyAddress: true,
        showCompanyEmail: true,
        showCompanyPhone: true,
        showCompanyWebsite: false,
        showCompanySiret: true,
        showCompanyVat: true,
        showClientAddress: true,
        showProjectInfo: true,
        showNotes: true,
        showPaymentTerms: true,
        showBankDetails: true,
        showSignatureArea: true,
      };
      
      setSettings(defaultSettings);
      
      // Afficher l'erreur seulement si ce n'est pas un problème de réseau/backend
      if (error?.response?.status !== 500) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les paramètres d'apparence. Valeurs par défaut utilisées.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<DocumentAppearanceSettings>) => {
    setIsSaving(true);
    try {
      const updatedSettings = await documentAppearanceAPI.updateAppearanceSettings({
        ...settings,
        ...newSettings,
      });
      setSettings(updatedSettings);
      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres d'apparence ont été mis à jour.",
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres d'apparence:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres d'apparence.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    refetch: fetchSettings,
  };
}