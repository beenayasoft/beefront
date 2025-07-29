/**
 * Hook principal pour gérer l'état du wizard de création de devis
 * Centralise toute la logique de workflow et validation
 */
import { useState, useCallback, useEffect } from 'react';
import { CreateQuoteData, CreateQuoteItemData } from '../types/quotes.types';
import { ClientOption, OpportunityOption } from '@/features/crm/types/crm.types';
import { quotesApi } from '../api/quotes';

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
  generateQuoteData: () => CreateQuoteData;
  
  // Validation
  validateStep: (step: WizardStep) => boolean;
  validateAll: () => boolean;
  
  // Reset
  reset: () => void;
}

// Workflows selon le type de client
const PROSPECT_WORKFLOW: WizardStep[] = ['client', 'opportunity', 'items', 'review'];
const CLIENT_WORKFLOW: WizardStep[] = ['client', 'project', 'items', 'review'];
const DEFAULT_WORKFLOW: WizardStep[] = ['client', 'opportunity', 'project', 'items', 'review'];

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

export const useQuoteWizard = (): QuoteWizardState & QuoteWizardActions => {
  const [state, setState] = useState<QuoteWizardState>(INITIAL_STATE);
  
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
        // Workflow prospect : Pas d'étape projet (se crée automatiquement si opportunité gagnée)
        newSteps = PROSPECT_WORKFLOW;
        isProspectWorkflow = true;
        console.log('🎯 Workflow PROSPECT activé : Client → Opportunité → Articles → Review');
      } else if (client?.relation === 'client') {
        // Workflow client existant : Projet direct avec auto-génération de référence
        newSteps = CLIENT_WORKFLOW;
        isProspectWorkflow = false;
        console.log('🏗️ Workflow CLIENT activé : Client → Projet → Articles → Review');
        
        // Auto-générer la référence et pré-remplir les détails pour les nouveaux clients
        if (client?.id !== prev.client?.id) {
          // Appeler l'API pour générer la référence de façon asynchrone
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
            
            console.log('📋 Auto-génération référence projet pour client:', {
              clientName: client.name,
              projectReference: reference
            });
          }).catch(error => {
            console.error('Erreur lors de l\'auto-génération de la référence projet:', error);
          });
        }
      } else {
        // Workflow par défaut (rétrocompatibilité)
        newSteps = DEFAULT_WORKFLOW;
        isProspectWorkflow = false;
        console.log('📋 Workflow DEFAULT activé');
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
    setState(prev => updateValidation({ 
      ...prev, 
      items,
      isDirty: true 
    }));
  }, [updateValidation]);
  
  const addItem = useCallback((item: CreateQuoteItemData) => {
    setState(prev => updateValidation({ 
      ...prev, 
      items: [...prev.items, { ...item, position: prev.items.length }],
      isDirty: true 
    }));
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
  const generateQuoteData = useCallback((): CreateQuoteData => {
    if (!state.client || !state.opportunity) {
      throw new Error('Client et opportunité requis pour générer le devis');
    }
    
    return {
      // Note: tierId retiré car gestion automatique par schéma tenant
      opportunity_id: state.opportunity.id,
      client_name: state.client.name,
      client_address: state.client.adressePrincipale ? 
        `${state.client.adressePrincipale.rue}, ${state.client.adressePrincipale.codePostal} ${state.client.adressePrincipale.ville}` : 
        '',
      project_name: state.projectDetails.name,
      project_address: state.projectDetails.address,
      project_reference: state.projectDetails.reference,
      issue_date: new Date().toISOString().split('T')[0],
      validity_period: state.validityPeriod,
      notes: state.projectDetails.notes,
      terms_and_conditions: state.termsAndConditions,
      items: state.items
    };
  }, [state]);
  
  // Validation complète (utilise le workflow dynamique)
  const validateAll = useCallback((stateToValidate?: QuoteWizardState) => {
    const currentState = stateToValidate || state;
    const requiredSteps = currentState.steps.filter(step => step !== 'review');
    return requiredSteps.every(step => validateStep(step, currentState));
  }, [validateStep, state]);
  
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
    validateStep,
    validateAll,
    reset
  };
};

export type UseQuoteWizard = ReturnType<typeof useQuoteWizard>;