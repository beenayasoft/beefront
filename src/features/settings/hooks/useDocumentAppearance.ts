/**
 * Hook pour gérer les paramètres d'apparence des documents
 * Gère la récupération, mise à jour et sauvegarde des configurations
 */
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { documentAppearanceApi } from '../api/documentAppearance';

// Interface pour la configuration d'apparence
export interface DocumentAppearanceConfig {
  // Configuration générale
  documentTemplate: 'modern' | 'classic' | 'minimal';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;

  // Logo et branding
  showLogo: boolean;
  logoSize: number;
  logoPositionType: 'left' | 'center' | 'right';
  logoCenterInHeader: boolean;

  // Informations entreprise
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showCompanyEmail: boolean;
  showCompanyPhone: boolean;
  showCompanyWebsite: boolean;
  showCompanySiret: boolean;
  showCompanyIce: boolean;

  // Informations client et projet
  showClientAddress: boolean;
  showProjectInfo: boolean;

  // Contenu et notes
  showNotes: boolean;
  showPaymentTerms: boolean;
  showBankDetails: boolean;
  showSignatureArea: boolean;

  // Style des tableaux
  tableHeaderColor: string;
  tableAlternateColor: string;
  tableBorderStyle: 'straight' | 'rounded';
  tableBorderHorizontal: boolean;
  tableBorderVertical: boolean;
  tableBorderWidth: number;
  tableBorderColor: string;
  sectionContrast: boolean;
  sectionContrastColor: string;
  showSectionSubtotals: boolean;
  tableRowPadding: number;
  tableColumnSpacing: number;

  // Moyens de paiement
  showPaymentMethods: boolean;
  paymentMethodsTitle: string;
  paymentMethodsLayout: 'horizontal' | 'vertical' | 'grid';
  paymentMethodsStyle: 'modern' | 'classic' | 'minimal';
}

// Configuration par défaut
const defaultConfig: DocumentAppearanceConfig = {
  documentTemplate: 'modern',
  primaryColor: '#1B333F',
  secondaryColor: '#64748B',
  fontFamily: 'Inter',
  fontSize: 11,
  
  showLogo: true,
  logoSize: 60,
  logoPositionType: 'left',
  logoCenterInHeader: false,
  
  showCompanyName: true,
  showCompanyAddress: true,
  showCompanyEmail: true,
  showCompanyPhone: true,
  showCompanyWebsite: true,
  showCompanySiret: true,
  showCompanyIce: true,
  
  showClientAddress: true,
  showProjectInfo: true,
  
  showNotes: true,
  showPaymentTerms: true,
  showBankDetails: true,
  showSignatureArea: true,
  
  tableHeaderColor: '#F8F9FA',
  tableAlternateColor: '#F2F2F2',
  tableBorderStyle: 'rounded',
  tableBorderHorizontal: true,
  tableBorderVertical: true,
  tableBorderWidth: 1,
  tableBorderColor: '#E2E8F0',
  sectionContrast: true,
  sectionContrastColor: '#EEF2FF',
  showSectionSubtotals: true,
  tableRowPadding: 8,
  tableColumnSpacing: 12,
  
  showPaymentMethods: true,
  paymentMethodsTitle: 'Moyens de paiement',
  paymentMethodsLayout: 'horizontal',
  paymentMethodsStyle: 'modern'
};

interface UseDocumentAppearanceReturn {
  config: DocumentAppearanceConfig;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  updateConfig: (field: keyof DocumentAppearanceConfig, value: any) => void;
  updateMultipleConfig: (updates: Partial<DocumentAppearanceConfig>) => void;
  saveConfig: () => Promise<void>;
  resetToDefault: () => void;
  reloadConfig: () => Promise<void>;
  exportConfig: () => string;
  importConfig: (jsonConfig: string) => boolean;
}

/**
 * Hook principal pour gérer l'apparence des documents
 */
export function useDocumentAppearance(): UseDocumentAppearanceReturn {
  const { toast } = useToast();
  
  // États
  const [config, setConfig] = useState<DocumentAppearanceConfig>(defaultConfig);
  const [originalConfig, setOriginalConfig] = useState<DocumentAppearanceConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Charger la configuration depuis l'API
  const loadConfig = useCallback(async () => {
    console.log('🔄 Chargement de la configuration...');
    setIsLoading(true);
    setIsError(false);
    
    try {
      const savedConfig = await documentAppearanceApi.getSettings();
      
      console.log('✅ Configuration chargée avec succès:', savedConfig);
      setConfig(savedConfig);
      setOriginalConfig(savedConfig);
      setHasUnsavedChanges(false);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement de la configuration:', error);
      setIsError(true);
      
      // En cas d'erreur, utiliser la configuration par défaut
      console.log('🔄 Basculement vers la configuration par défaut');
      setConfig(defaultConfig);
      setOriginalConfig(defaultConfig);
      
      // Ne pas afficher de toast d'erreur si c'est juste que l'endpoint n'existe pas encore
      const isNotFoundError = error?.response?.status === 404 || error?.message?.includes('404');
      if (!isNotFoundError) {
        toast({
          title: 'Configuration par défaut chargée',
          description: 'Impossible de charger la configuration personnalisée. Utilisation des paramètres par défaut.',
          variant: 'default'
        });
      }
    } finally {
      setIsLoading(false);
      console.log('🏁 Fin du chargement de la configuration');
    }
  }, [toast]);

  // Charger au montage du composant
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Mettre à jour un seul champ
  const updateConfig = useCallback((field: keyof DocumentAppearanceConfig, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      return newConfig;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Mettre à jour plusieurs champs à la fois
  const updateMultipleConfig = useCallback((updates: Partial<DocumentAppearanceConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      return newConfig;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Sauvegarder la configuration
  const saveConfig = useCallback(async () => {
    if (!hasUnsavedChanges) return;
    
    setIsSaving(true);
    console.log('💾 [useDocumentAppearance] Début de la sauvegarde des paramètres...');
    console.log('💾 [useDocumentAppearance] Config à sauvegarder:', config);
    console.log('💾 [useDocumentAppearance] showLogo value:', config.showLogo);
    
    try {
      console.log('💾 [useDocumentAppearance] Appel de documentAppearanceApi.updateSettings...');
      const updatedConfig = await documentAppearanceApi.updateSettings(config);
      
      console.log('✅ Paramètres sauvegardés, conservation de nos modifications locales');
      // Ne PAS écraser avec la réponse du backend, garder nos modifications
      setOriginalConfig(config); // Marquer nos modifications comme "sauvegardées"
      setHasUnsavedChanges(false);
      
      // Forcer un rechargement pour vérifier la persistance
      setTimeout(async () => {
        console.log('🔄 Vérification de la persistance des paramètres...');
        try {
          const verificationConfig = await documentAppearanceApi.getSettings();
          console.log('🧪 Paramètres après rechargement:', verificationConfig);
          
          // Comparer les valeurs critiques pour s'assurer qu'elles ont bien été sauvegardées
          const showLogoOriginal = config.showLogo;
          const showLogoVerification = verificationConfig.showLogo;
          const templateOriginal = config.documentTemplate;
          const templateVerification = verificationConfig.documentTemplate;
          
          if (showLogoOriginal !== showLogoVerification) {
            console.error('❌ PROBLÈME: showLogo pas sauvegardé correctement', {
              envoyé: showLogoOriginal,
              récupéré: showLogoVerification
            });
          }
          
          if (templateOriginal !== templateVerification) {
            console.error('❌ PROBLÈME: documentTemplate pas sauvegardé correctement', {
              envoyé: templateOriginal,
              récupéré: templateVerification
            });
          }
          
          if (showLogoOriginal === showLogoVerification && templateOriginal === templateVerification) {
            console.log('✅ Vérification OK: les paramètres sont bien persistés');
          }
          
        } catch (error) {
          console.warn('⚠️ Impossible de vérifier la persistance:', error);
        }
      }, 1000);
      
      toast({
        title: 'Configuration sauvegardée',
        description: 'Les paramètres d\'apparence ont été mis à jour avec succès.'
      });
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde complète:', error);
      
      let errorMessage = 'Impossible de sauvegarder les paramètres.';
      
      // Fournir des messages d'erreur plus spécifiques
      if (error?.response?.status === 404) {
        errorMessage = 'Service de configuration non disponible. Vérifiez que vous êtes connecté.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Données de configuration invalides.';
      }
      
      toast({
        title: 'Erreur de sauvegarde',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [config, hasUnsavedChanges, toast]);

  // Reset vers la configuration par défaut
  const resetToDefault = useCallback(() => {
    setConfig(defaultConfig);
    setHasUnsavedChanges(true);
    toast({
      title: 'Configuration réinitialisée',
      description: 'Les paramètres par défaut ont été restaurés.'
    });
  }, [toast]);

  // Recharger la configuration depuis l'API
  const reloadConfig = useCallback(async () => {
    if (hasUnsavedChanges) {
      // Demander confirmation si des changements non sauvegardés existent
      if (!confirm('Des modifications non sauvegardées seront perdues. Continuer ?')) {
        return;
      }
    }
    await loadConfig();
  }, [hasUnsavedChanges, loadConfig]);

  // Exporter la configuration en JSON
  const exportConfig = useCallback(() => {
    try {
      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        config: config
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      toast({
        title: 'Erreur d\'export',
        description: 'Impossible d\'exporter la configuration.',
        variant: 'destructive'
      });
      return '';
    }
  }, [config, toast]);

  // Importer une configuration depuis JSON
  const importConfig = useCallback((jsonConfig: string): boolean => {
    try {
      const importData = JSON.parse(jsonConfig);
      
      // Validation basique
      if (!importData.config) {
        throw new Error('Format de configuration invalide');
      }
      
      // Merger avec la configuration par défaut pour assurer la compatibilité
      const mergedConfig = {
        ...defaultConfig,
        ...importData.config
      };
      
      // Valider les champs critiques
      if (!mergedConfig.primaryColor || !mergedConfig.fontFamily) {
        throw new Error('Configuration incomplète');
      }
      
      setConfig(mergedConfig);
      setHasUnsavedChanges(true);
      
      toast({
        title: 'Configuration importée',
        description: 'La configuration a été importée avec succès.'
      });
      
      return true;
      
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast({
        title: 'Erreur d\'import',
        description: 'Format de configuration invalide.',
        variant: 'destructive'
      });
      return false;
    }
  }, [toast]);

  // Détecter les changements non sauvegardés
  useEffect(() => {
    const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasUnsavedChanges(hasChanges);
  }, [config, originalConfig]);

  return {
    config,
    isLoading,
    isError,
    isSaving,
    hasUnsavedChanges,
    updateConfig,
    updateMultipleConfig,
    saveConfig,
    resetToDefault,
    reloadConfig,
    exportConfig,
    importConfig
  };
}

// Hook pour une utilisation simplifiée avec prévisualisation
export function useDocumentAppearancePreview() {
  const {
    config,
    isLoading,
    updateConfig,
    updateMultipleConfig,
    hasUnsavedChanges
  } = useDocumentAppearance();
  
  const [localChanges, setLocalChanges] = useState<Partial<DocumentAppearanceConfig>>({});
  
  // Configuration pour la prévisualisation (config + changements locaux)
  const previewConfig = {
    ...config,
    ...localChanges
  };
  
  // Appliquer un changement temporaire (pour la prévisualisation)
  const applyPreviewChange = useCallback((field: keyof DocumentAppearanceConfig, value: any) => {
    setLocalChanges(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Valider et appliquer les changements temporaires
  const commitPreviewChanges = useCallback(() => {
    if (Object.keys(localChanges).length > 0) {
      updateMultipleConfig(localChanges);
      setLocalChanges({});
    }
  }, [localChanges, updateMultipleConfig]);
  
  // Annuler les changements temporaires
  const cancelPreviewChanges = useCallback(() => {
    setLocalChanges({});
  }, []);
  
  return {
    config: previewConfig,
    isLoading,
    hasUnsavedChanges,
    hasPreviewChanges: Object.keys(localChanges).length > 0,
    applyPreviewChange,
    commitPreviewChanges,
    cancelPreviewChanges,
    updateConfig,
    updateMultipleConfig
  };
}

export default useDocumentAppearance;