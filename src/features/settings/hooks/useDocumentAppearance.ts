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
      const data = await documentAppearanceAPI.getAppearanceSettings();
      setSettings(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des paramètres d'apparence:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les paramètres d'apparence.",
        variant: "destructive",
      });
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