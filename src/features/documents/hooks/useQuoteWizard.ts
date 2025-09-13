/**
 * Hook principal pour gérer l'état du wizard de création de devis
 * Centralise toute la logique de workflow et validation
 */
import { useState, useCallback, useEffect } from 'react';
import { CreateQuoteData, CreateQuoteItemData } from '../types/quotes.types';
import { ClientOption, OpportunityOption } from '@/features/crm/types/crm.types';
import { quotesApi } from '../api/quotes';
import { settingsApi } from '@/features/settings/api/settings';
import { formatNumberWithSettings, getDocumentFormat, getNextSequentialNumber } from '../utils/numberFormatting';

export type WizardStep = 'client' | 'opportunity' | 'project' | 'items' | 'review';

export interface QuoteWizardState {
  // Étape actuelle
  currentStep: WizardStep;
  
  // Workflow dynamique
  steps: WizardStep[];
  isProspectWorkflow: boolean;
  
  // Données collectées
  client: ClientOption | null;
  opportunity: OpportunityOption | null;
  projectDetails: {
    name: string;
    address: string;
    reference: string;
    notes: string;
  };
  items: CreateQuoteItemData[];
  
  // Métadonnées
  validityPeriod: number;
  termsAndConditions: string;
  
  // États
  isValid: Record<WizardStep, boolean>;
  isDirty: boolean;
  
  // Données de pré-remplissage
  initialData?: {
    preselectedTierId?: string;
    opportunityId?: string;
    opportunityName?: string;
  };
}

export interface QuoteWizardActions {
  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  
  // Mise à jour des données
  setClient: (client: ClientOption | null) => void;
  setOpportunity: (opportunity: OpportunityOption | null) => void;
  updateProjectDetails: (details: Partial<QuoteWizardState['projectDetails']>) => void;
  updateItems: (items: CreateQuoteItemData[]) => void;
  addItem: (item: CreateQuoteItemData) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: CreateQuoteItemData) => void;
  
  // Génération finale
  generateQuoteData: () => Promise<CreateQuoteData>;
  
  // Gestion du compteur
  incrementQuoteCounter: () => Promise<void>;
  
  // Validation
  validateStep: (step: WizardStep) => boolean;
  validateAll: () => boolean;
  
  // Reset
  reset: () => void;
}

// Workflows selon le type de client
const PROSPECT_WORKFLOW: WizardStep[] = ['client', 'opportunity', 'items', 'review'];
const DEFAULT_WORKFLOW: WizardStep[] = ['client', 'opportunity', 'project', 'items', 'review'];

// Note: CLIENT_WORKFLOW supprimé - on utilise maintenant DEFAULT_WORKFLOW pour tous les clients
// Ceci garantit que l'étape opportunité est toujours présente dans le workflow

const INITIAL_STATE: QuoteWizardState = {
  currentStep: 'client',
  steps: DEFAULT_WORKFLOW,
  isProspectWorkflow: false,
  client: null,
  opportunity: null,
  projectDetails: {
    name: '',
    address: '',
    reference: '',
    notes: ''
  },
  items: [],
  validityPeriod: 30,
  termsAndConditions: 'Conditions générales de vente applicables.',
  isValid: {
    client: false,
    opportunity: false,
    project: false,
    items: false,
    review: false
  },
  isDirty: false
};

interface InitialData {
  preselectedTierId?: string;
  opportunityId?: string;
  opportunityName?: string;
}

export const useQuoteWizard = (initialData?: InitialData): QuoteWizardState & QuoteWizardActions => {
  const [state, setState] = useState<QuoteWizardState>(() => {
    // Créer l'état initial avec les données pré-remplies
    let initialState = { ...INITIAL_STATE };
    
    if (initialData?.preselectedTierId) {
      console.log('📋 Pré-remplissage du wizard avec tierId:', initialData.preselectedTierId);
      // Le client sera récupéré et défini par ClientSelectionStep
      initialState.isValid.client = false; // Sera mis à jour après récupération
    }
    
    if (initialData?.opportunityId) {
      console.log('📋 Pré-remplissage du wizard avec opportunityId:', initialData.opportunityId);
      // L'opportunité sera récupérée et définie par OpportunityStep
      initialState.isValid.opportunity = false; // Sera mis à jour après récupération
    }
    
    // Stocker les données initiales dans l'état
    if (initialData) {
      initialState.initialData = initialData;
    }
    
    return initialState;
  });
  
  // Validation des étapes (accepte un état optionnel pour validation avec nouvel état)
  const validateStep = useCallback((step: WizardStep, stateToValidate?: QuoteWizardState): boolean => {
    const currentState = stateToValidate || state;
    
    switch (step) {
      case 'client':
        return !!currentState.client?.id;
      
      case 'opportunity':
        return !!currentState.opportunity?.id;
      
      case 'project':
        // Dans le workflow prospect, les détails projet sont auto-remplis depuis l'opportunité
        if (currentState.isProspectWorkflow) {
          return !!currentState.opportunity?.id; // Valide si on a une opportunité
        }
        return !!currentState.projectDetails.name.trim();
      
      case 'items':
        return currentState.items.length > 0 && currentState.items.every(item => 
          item.designation?.trim() && 
          item.quantity > 0 && 
          item.unitPrice > 0
        );
      
      case 'review':
        // Validation dynamique selon le workflow
        const requiredSteps = currentState.steps.filter(s => s !== 'review');
        return requiredSteps.every(step => validateStep(step, currentState));
      
      default:
        return false;
    }
  }, [state]);
  
  // Mise à jour de la validation (utilise le nouvel état pour valider)
  const updateValidation = useCallback((newState: QuoteWizardState) => {
    // Valider toutes les étapes possibles, pas seulement celles du workflow actuel
    const allSteps: WizardStep[] = ['client', 'opportunity', 'project', 'items', 'review'];
    const isValid = allSteps.reduce((acc, step) => ({
      ...acc,
      [step]: validateStep(step, newState)
    }), {} as Record<WizardStep, boolean>);
    
    return { ...newState, isValid };
  }, [validateStep]);
  
  // Actions de navigation (utilise le workflow dynamique)
  const goToStep = useCallback((step: WizardStep) => {
    setState(prev => updateValidation({ ...prev, currentStep: step, isDirty: true }));
  }, [updateValidation]);
  
  const nextStep = useCallback(() => {
    const currentIndex = state.steps.indexOf(state.currentStep);
    if (currentIndex < state.steps.length - 1) {
      const nextStep = state.steps[currentIndex + 1];
      goToStep(nextStep);
    }
  }, [state.currentStep, state.steps, goToStep]);
  
  const previousStep = useCallback(() => {
    const currentIndex = state.steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const prevStep = state.steps[currentIndex - 1];
      goToStep(prevStep);
    }
  }, [state.currentStep, state.steps, goToStep]);
  
  const canGoNext = useCallback(() => {
    const currentIndex = state.steps.indexOf(state.currentStep);
    return currentIndex < state.steps.length - 1 && state.isValid[state.currentStep];
  }, [state.currentStep, state.steps, state.isValid]);
  
  const canGoPrevious = useCallback(() => {
    const currentIndex = state.steps.indexOf(state.currentStep);
    return currentIndex > 0;
  }, [state.currentStep, state.steps]);
  
  // Actions de mise à jour
  const setClient = useCallback((client: ClientOption | null) => {
    setState(prev => {
      // Déterminer le workflow selon la relation client
      let newSteps: WizardStep[];
      let isProspectWorkflow: boolean;
      
      if (client?.relation === 'prospect') {
        // Workflow prospect : Pas d'étape projet séparée (se crée automatiquement depuis l'opportunité)
        newSteps = PROSPECT_WORKFLOW;
        isProspectWorkflow = true;
        console.log('🎯 Workflow PROSPECT activé : Client → Opportunité → Articles → Review');
      } else {
        // Workflow standard : toujours passer par opportunité puis projet
        newSteps = DEFAULT_WORKFLOW;
        isProspectWorkflow = false;
        console.log('📋 Workflow STANDARD activé : Client → Opportunité → Projet → Articles → Review');
        
        // Pour les clients existants, on peut pré-générer la référence projet si besoin
        if (client?.relation === 'client' && client?.id !== prev.client?.id) {
          // Appeler l'API pour pré-générer la référence de façon asynchrone
          quotesApi.getNextProjectReference().then(reference => {
            setState(current => updateValidation({
              ...current,
              projectDetails: {
                ...current.projectDetails,
                name: current.projectDetails.name || `Projet ${client.name}`,
                reference: reference,
                address: client.adressePrincipale ? 
                  `${client.adressePrincipale.rue}, ${client.adressePrincipale.codePostal} ${client.adressePrincipale.ville}` : 
                  current.projectDetails.address
              }
            }));
            
            console.log('📋 Pré-génération référence projet pour client existant:', {
              clientName: client.name,
              projectReference: reference
            });
          }).catch(error => {
            console.error('Erreur lors de la pré-génération de la référence projet:', error);
          });
        }
      }
      
      // Ajuster l'étape courante si elle n'existe plus dans le nouveau workflow
      let newCurrentStep = prev.currentStep;
      if (!newSteps.includes(prev.currentStep)) {
        newCurrentStep = newSteps[0]; // Retourner à la première étape du nouveau workflow
      }
      
      return updateValidation({ 
        ...prev, 
        client,
        steps: newSteps,
        isProspectWorkflow,
        currentStep: newCurrentStep,
        // Reset opportunity quand on change de client
        opportunity: client?.id !== prev.client?.id ? null : prev.opportunity,
        isDirty: true 
      });
    });
  }, [updateValidation]);
  
  const setOpportunity = useCallback((opportunity: OpportunityOption | null) => {
    setState(prev => {
      let newProjectDetails = prev.projectDetails;
      
      // Dans le workflow prospect, auto-remplir les détails projet à partir de l'opportunité
      if (prev.isProspectWorkflow && opportunity) {
        newProjectDetails = {
          name: opportunity.name, // Nom du projet = nom de l'opportunité
          address: prev.client?.adressePrincipale ? 
            `${prev.client.adressePrincipale.rue}, ${prev.client.adressePrincipale.codePostal} ${prev.client.adressePrincipale.ville}` : 
            '',
          reference: `OPP-${opportunity.id}`, // Référence basée sur l'opportunité
          notes: `Devis pour l'opportunité : ${opportunity.name}`
        };
        
        console.log('📋 Auto-remplissage projet depuis opportunité:', {
          opportunityName: opportunity.name,
          projectDetails: newProjectDetails
        });
      } else if (!prev.isProspectWorkflow && opportunity && !prev.projectDetails.name) {
        // Mode standard : auto-remplir seulement si pas encore défini
        newProjectDetails = { 
          ...prev.projectDetails, 
          name: opportunity.name 
        };
      }
      
      return updateValidation({ 
        ...prev, 
        opportunity,
        projectDetails: newProjectDetails,
        isDirty: true 
      });
    });
  }, [updateValidation]);
  
  const updateProjectDetails = useCallback((details: Partial<QuoteWizardState['projectDetails']>) => {
    setState(prev => updateValidation({ 
      ...prev, 
      projectDetails: { ...prev.projectDetails, ...details },
      isDirty: true 
    }));
  }, [updateValidation]);
  
  const updateItems = useCallback((items: CreateQuoteItemData[]) => {
    console.log('🔧 useQuoteWizard.updateItems - Mise à jour items:', items.length);
    setState(prev => updateValidation({ 
      ...prev, 
      items,
      isDirty: true 
    }));
  }, [updateValidation]);
  
  const addItem = useCallback((item: CreateQuoteItemData) => {
    console.log('🔧 useQuoteWizard.addItem - Ajout item:', item);
    setState(prev => {
      const newItems = [...prev.items, { ...item, position: prev.items.length }];
      console.log('🔧 useQuoteWizard.addItem - Items avant:', prev.items.length);
      console.log('🔧 useQuoteWizard.addItem - Items après:', newItems.length);
      return updateValidation({ 
        ...prev, 
        items: newItems,
        isDirty: true 
      });
    });
  }, [updateValidation]);
  
  const removeItem = useCallback((index: number) => {
    setState(prev => updateValidation({ 
      ...prev, 
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, position: i })),
      isDirty: true 
    }));
  }, [updateValidation]);
  
  const updateItem = useCallback((index: number, item: CreateQuoteItemData) => {
    setState(prev => updateValidation({ 
      ...prev, 
      items: prev.items.map((existingItem, i) => i === index ? { ...item, position: i } : existingItem),
      isDirty: true 
    }));
  }, [updateValidation]);
  
  // Génération des données finales
  const generateQuoteData = useCallback(async (): Promise<CreateQuoteData> => {
    console.log('🔧 useQuoteWizard.generateQuoteData - État actuel items:', state.items.length);
    console.log('🔧 useQuoteWizard.generateQuoteData - Items détail:', state.items);
    
    if (!state.client || !state.opportunity) {
      throw new Error('Client et opportunité requis pour générer le devis');
    }
    
    // Générer le numéro formaté selon la configuration
    let formattedNumber: string;
    try {
      // Récupérer les informations du tenant pour obtenir la configuration de numérotation
      const tenantInfo = await settingsApi.getCurrentTenantInfo();
      const numberingSettings = tenantInfo.document_numbering || [];
      
      // Obtenir le format configuré pour les devis
      const format = getDocumentFormat(numberingSettings, 'quote');
      
      // Obtenir le prochain numéro séquentiel
      const nextNumber = getNextSequentialNumber(numberingSettings, 'quote');
      
      // Formater le numéro final
      formattedNumber = formatNumberWithSettings(format, nextNumber);
      
      console.log('📊 CREATION DEVIS - Numéro généré:', formattedNumber);
    } catch (error) {
      console.error('Erreur lors de la génération du numéro formaté:', error);
      // Fallback : utiliser l'API backend
      formattedNumber = await quotesApi.getNextQuoteNumber();
      console.log('📊 CREATION DEVIS - Numéro fallback:', formattedNumber);
    }
    
    return {
      // Note: tierId retiré car gestion automatique par schéma tenant
      opportunity_id: state.opportunity.id,
      client_name: state.client.name,
      client_address: state.client.adressePrincipale ? 
        `${state.client.adressePrincipale.rue}, ${state.client.adressePrincipale.codePostal} ${state.client.adressePrincipale.ville}` : 
        state.client.address || '',
      project_name: state.projectDetails.name,
      project_address: state.projectDetails.address,
      project_reference: state.projectDetails.reference,
      issue_date: new Date().toISOString().split('T')[0],
      validity_period: state.validityPeriod,
      notes: state.projectDetails.notes,
      terms_and_conditions: state.termsAndConditions,
      items: state.items,
      number: formattedNumber // Ajouter le numéro formaté
    };
  }, [state]);
  
  // Validation complète (utilise le workflow dynamique)
  const validateAll = useCallback((stateToValidate?: QuoteWizardState) => {
    const currentState = stateToValidate || state;
    const requiredSteps = currentState.steps.filter(step => step !== 'review');
    return requiredSteps.every(step => validateStep(step, currentState));
  }, [validateStep, state]);
  
  // Incrémentation du compteur après création réussie
  const incrementQuoteCounter = useCallback(async (): Promise<void> => {
    try {
      // Récupérer les informations du tenant pour obtenir la configuration de numérotation
      const tenantInfo = await settingsApi.getCurrentTenantInfo();
      const numberingSettings = tenantInfo.document_numbering || [];
      
      // Trouver la configuration pour les devis
      const quoteSettings = numberingSettings.find(s => s.document_type === 'quote');
      
      if (quoteSettings && quoteSettings.id) {
        // Incrémenter le compteur via l'API des settings
        const updatedSettings = numberingSettings.map(setting => {
          if (setting.document_type === 'quote') {
            return {
              ...setting,
              next_number: (setting.next_number || 1) + 1
            };
          }
          return setting;
        });
        
        // Mettre à jour la configuration de numérotation
        await settingsApi.updateDocumentNumbering(updatedSettings);
        
        console.log('📈 Compteur incrémenté:', {
          ancien: quoteSettings.next_number,
          nouveau: (quoteSettings.next_number || 1) + 1
        });
      } else {
        console.warn('⚠️ Configuration de numérotation pour devis non trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'incrémentation du compteur:', error);
      throw error;
    }
  }, []);

  // Reset
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);
  
  return {
    ...state,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    setClient,
    setOpportunity,
    updateProjectDetails,
    updateItems,
    addItem,
    removeItem,
    updateItem,
    generateQuoteData,
    incrementQuoteCounter,
    validateStep,
    validateAll,
    reset
  };
};

export type UseQuoteWizard = ReturnType<typeof useQuoteWizard>;