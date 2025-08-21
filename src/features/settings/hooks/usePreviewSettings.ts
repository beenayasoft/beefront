import { useState, useEffect } from 'react';
import { useDocumentAppearance } from './useDocumentAppearance';

/**
 * Hook personnalisé pour gérer les paramètres d'aperçu en temps réel
 * Combine les paramètres sauvegardés avec les changements locaux
 */
export function usePreviewSettings() {
  const { settings: apiSettings, isLoading } = useDocumentAppearance();
  const [localChanges, setLocalChanges] = useState<any>({});
  
  // Paramètres par défaut
  const defaultSettings = {
    primaryColor: "#1B333F",
    fontFamily: "Inter",
    fontSize: 11,
    showLogo: true,
    logoSize: 12,
    showCompanyName: true,
    showCompanySlogan: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: true,
    showCompanySiret: true,
    showCompanyVat: true,
    showClientAddress: true,
    showProjectInfo: true,
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: true,
    showLegalMentions: true,
    tableBorderStyle: 'rounded' as const,
    tableBorderHorizontal: true,
    tableBorderVertical: true,
    sectionContrast: true,
    showSectionSubtotals: true,
  };

  // Combinaison finale des paramètres
  const previewSettings = {
    ...defaultSettings,
    ...apiSettings,
    ...localChanges,
  };

  // Fonction pour appliquer un changement local (sans sauvegarder)
  const applyLocalChange = (field: string, value: any) => {
    setLocalChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour réinitialiser les changements locaux
  const resetLocalChanges = () => {
    setLocalChanges({});
  };

  // Réinitialiser les changements locaux quand les paramètres API changent
  useEffect(() => {
    if (apiSettings && Object.keys(apiSettings).length > 0) {
      console.log('🔄 Réinitialisation des changements locaux suite aux nouvelles données API');
      setLocalChanges({});
    }
  }, [apiSettings]);

  return {
    previewSettings,
    localChanges,
    isLoading,
    applyLocalChange,
    resetLocalChanges,
  };
}