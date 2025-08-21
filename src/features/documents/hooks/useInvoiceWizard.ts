/**
 * Hook pour gérer le wizard de création de factures
 * Adapté depuis useQuoteWizard
 */
import { useState, useCallback } from 'react';
import { CreateInvoiceData } from '../types/invoices.types';
import { CreateInvoiceRequest } from '../api/invoices';
import { settingsApi } from '@/features/settings/api/settings';

export type WizardStep = 'client' | 'quote' | 'items' | 'review';

export interface UseInvoiceWizard {
  // État du wizard
  currentStep: WizardStep;
  steps: WizardStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isValid: Record<WizardStep, boolean>;
  
  // Navigation
  goToStep: (step: WizardStep) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  
  // Données du formulaire
  client: any;
  setClient: (client: any) => void;
  
  selectedQuote: any;
  setSelectedQuote: (quote: any) => void;
  
  invoiceDetails: {
    issueDate: string;
    dueDate: string;
    paymentTerms: number;
    notes: string;
    termsAndConditions: string;
    number?: string; // Numéro de facture généré
  };
  setInvoiceDetails: (details: Partial<UseInvoiceWizard['invoiceDetails']>) => void;
  
  items: any[];
  setItems: (items: any[]) => void;
  addItem: (item: any) => void;
  updateItem: (index: number, item: any) => void;
  removeItem: (index: number) => void;
  
  // Validation
  validateStep: (step: WizardStep) => boolean;
  validateAll: () => boolean;
  
  // Génération des données finales
  generateInvoiceData: () => CreateInvoiceRequest;
  
  // Incrémentation du compteur
  incrementInvoiceCounter: () => Promise<void>;
  
  // Réinitialisation
  reset: () => void;
}

const WORKFLOW_STEPS: WizardStep[] = ['client', 'quote', 'items', 'review'];

export const useInvoiceWizard = (): UseInvoiceWizard => {
  // État du workflow
  const [currentStep, setCurrentStep] = useState<WizardStep>('client');
  
  // Données du formulaire
  const [client, setClient] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [invoiceDetails, setInvoiceDetailsState] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: 30,
    notes: '',
    termsAndConditions: '',
    number: '' // Numéro de facture généré
  });
  const [items, setItems] = useState<any[]>([]);
  
  // Validation des étapes
  const validateStep = useCallback((step: WizardStep): boolean => {
    switch (step) {
      case 'client':
        return !!client?.id;
        
      case 'quote':
        return !!selectedQuote?.id;
        
      case 'items':
        return items.length > 0;
        
      case 'review':
        return validateStep('client') && validateStep('quote') && validateStep('items');
        
      default:
        return false;
    }
  }, [client, selectedQuote, items]);
  
  // État de validation de toutes les étapes
  const isValid = WORKFLOW_STEPS.reduce((acc, step) => {
    acc[step] = validateStep(step);
    return acc;
  }, {} as Record<WizardStep, boolean>);
  
  // Navigation
  const currentStepIndex = WORKFLOW_STEPS.indexOf(currentStep);
  const canGoNext = currentStepIndex < WORKFLOW_STEPS.length - 1;
  const canGoPrevious = currentStepIndex > 0;
  
  const goToStep = useCallback((step: WizardStep) => {
    if (WORKFLOW_STEPS.includes(step)) {
      setCurrentStep(step);
    }
  }, []);
  
  const goToNext = useCallback(() => {
    if (canGoNext) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(WORKFLOW_STEPS[nextIndex]);
    }
  }, [canGoNext, currentStepIndex]);
  
  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(WORKFLOW_STEPS[prevIndex]);
    }
  }, [canGoPrevious, currentStepIndex]);
  
  // Gestion du devis sélectionné
  const handleSetSelectedQuote = useCallback((quote: any) => {
    setSelectedQuote(quote);
    
    // Pré-remplir les items depuis le devis sélectionné avec tous les détails
    if (quote?.items && Array.isArray(quote.items) && quote.items.length > 0) {
      console.log('🔄 Remplissage automatique des articles depuis le devis:', quote.number);
      console.log('📦 Nombre d\'articles à copier:', quote.items.length);
      console.log('📄 Structure du premier article:', quote.items[0]);
      
      const mappedItems = quote.items.map((item: any, index: number) => {
        console.log(`📋 Article ${index + 1}:`, {
          designation: item.designation,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          vatRate: item.vatRate
        });
        
        return {
          type: item.type || 'material',
          parent: item.parent,
          position: item.position !== undefined ? item.position : index,
          reference: item.reference || '',
          designation: item.designation || `Article ${index + 1}`,
          description: item.description || '',
          unit: item.unit || 'unité',
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          discount: parseFloat(item.discount) || 0,
          vatRate: String(item.vatRate || '20'),
          workId: item.workId,
          // ID unique pour la facture
          id: `invoice-${quote.id}-${index}-${Date.now()}`
        };
      });
      
      setItems(mappedItems);
      console.log('✅ Articles copiés avec succès:', mappedItems.length);
      console.log('📊 Détails des articles mappés:', mappedItems);
    } else {
      console.log('⚠️ Aucun article trouvé dans le devis ou articles vides');
      console.log('📄 Structure du devis reçu:', quote);
      setItems([]);
    }
    
    // Pré-remplir les détails de facture avec les infos du devis
    setInvoiceDetailsState(prev => ({
      ...prev,
      notes: quote.notes || '',
      termsAndConditions: quote.termsAndConditions || ''
    }));
  }, []);

  // Gestion des détails de facture
  const setInvoiceDetails = useCallback((updates: Partial<typeof invoiceDetails>) => {
    setInvoiceDetailsState(prev => {
      const updated = { ...prev, ...updates };
      
      // Calcul automatique de la date d'échéance
      if (updated.issueDate && updated.paymentTerms) {
        const issueDate = new Date(updated.issueDate);
        const dueDate = new Date(issueDate);
        dueDate.setDate(issueDate.getDate() + updated.paymentTerms);
        updated.dueDate = dueDate.toISOString().split('T')[0];
      }
      
      return updated;
    });
  }, []);
  
  // Gestion des items
  const addItem = useCallback((item: any) => {
    setItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
  }, []);
  
  const updateItem = useCallback((index: number, item: any) => {
    setItems(prev => prev.map((existing, i) => i === index ? { ...existing, ...item } : existing));
  }, []);
  
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  // Validation globale
  const validateAll = useCallback(() => {
    return WORKFLOW_STEPS.every(step => validateStep(step));
  }, [validateStep]);
  
  // Génération des données pour l'API
  const generateInvoiceData = useCallback((): CreateInvoiceRequest => {
    if (!validateAll()) {
      throw new Error('Données du formulaire incomplètes');
    }
    
    console.log('🔢 Génération des données de facture avec numéro:', invoiceDetails.number);
    
    return {
      number: invoiceDetails.number || undefined, // ✅ Inclure le numéro généré
      tier: client.id,
      client_name: client.name,
      client_address: client.adressePrincipale ? 
        `${client.adressePrincipale.rue}, ${client.adressePrincipale.codePostal} ${client.adressePrincipale.ville}` : 
        undefined,
      project_name: selectedQuote?.projectName || undefined,
      project_address: selectedQuote?.projectAddress || undefined,
      project_reference: selectedQuote?.projectReference || undefined,
      quote_id: selectedQuote?.id, // Référence vers le devis d'origine
      quote_number: selectedQuote?.number, // Numéro du devis d'origine
      issue_date: invoiceDetails.issueDate,
      due_date: invoiceDetails.dueDate,
      payment_terms: invoiceDetails.paymentTerms,
      notes: invoiceDetails.notes || undefined,
      terms_and_conditions: invoiceDetails.termsAndConditions || undefined,
      items: items.map(item => ({
        type: item.type || 'material',
        parent: item.parent,
        position: item.position || 0,
        reference: item.reference,
        designation: item.designation,
        description: item.description || '',
        unit: item.unit || 'unité',
        quantity: parseFloat(item.quantity) || 1,
        unit_price: parseFloat(item.unitPrice) || 0, // ✅ Conversion vers snake_case
        discount: parseFloat(item.discount) || 0,
        vat_rate: item.vatRate || '20', // ✅ Conversion vers snake_case
        work_id: item.workId // ✅ Conversion vers snake_case
      }))
    };
  }, [client, selectedQuote, invoiceDetails, items, validateAll]);
  
  // Incrémentation du compteur de factures
  const incrementInvoiceCounter = useCallback(async (): Promise<void> => {
    try {
      // Récupérer les informations du tenant pour obtenir la configuration de numérotation
      const tenantInfo = await settingsApi.getCurrentTenantInfo();
      const numberingSettings = tenantInfo.document_numbering || [];
      
      // Trouver la configuration pour les factures
      const invoiceSettings = numberingSettings.find(s => s.document_type === 'invoice');
      
      if (invoiceSettings && invoiceSettings.id) {
        // Incrémenter le compteur en mettant à jour toute la configuration
        const updatedSettings = numberingSettings.map(setting => {
          if (setting.document_type === 'invoice') {
            return {
              ...setting,
              next_number: (setting.next_number || 1) + 1
            };
          }
          return setting;
        });
        
        // Mettre à jour la configuration de numérotation
        await settingsApi.updateDocumentNumbering(updatedSettings);
        
        console.log('📈 Compteur de factures incrémenté:', {
          ancien: invoiceSettings.next_number,
          nouveau: (invoiceSettings.next_number || 1) + 1
        });
      } else {
        console.log('⚠️ Pas de configuration de numérotation trouvée pour les factures');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'incrémentation du compteur de factures:', error);
      throw error;
    }
  }, []);
  
  // Réinitialisation
  const reset = useCallback(() => {
    setCurrentStep('client');
    setClient(null);
    setSelectedQuote(null);
    setInvoiceDetailsState({
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentTerms: 30,
      notes: '',
      termsAndConditions: '',
      number: ''
    });
    setItems([]);
  }, []);
  
  return {
    // État du wizard
    currentStep,
    steps: WORKFLOW_STEPS,
    canGoNext,
    canGoPrevious,
    isValid,
    
    // Navigation
    goToStep,
    goToNext,
    goToPrevious,
    
    // Données
    client,
    setClient,
    selectedQuote,
    setSelectedQuote: handleSetSelectedQuote,
    invoiceDetails,
    setInvoiceDetails,
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,
    
    // Validation
    validateStep,
    validateAll,
    
    // Génération
    generateInvoiceData,
    
    // Incrémentation
    incrementInvoiceCounter,
    
    // Utilitaires
    reset
  };
};