import { useState, useMemo, useCallback } from 'react';
import { WorkflowService, DocumentStatus, DocumentType, TransitionValidation } from '@/lib/services/WorkflowService';

/**
 * Hook pour la gestion des workflows de documents
 */
export function useWorkflow(
  documentType: DocumentType,
  currentStatus: DocumentStatus,
  document: any
) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastValidation, setLastValidation] = useState<TransitionValidation | null>(null);

  // Obtenir les transitions disponibles
  const availableTransitions = useMemo(() => 
    WorkflowService.getAvailableTransitions(documentType, currentStatus),
    [documentType, currentStatus]
  );

  // Obtenir les détails du statut actuel
  const statusDetails = useMemo(() => 
    WorkflowService.getStatusDetails(currentStatus),
    [currentStatus]
  );

  // Vérifier si le document est modifiable
  const isEditable = useMemo(() => 
    WorkflowService.isEditable(currentStatus),
    [currentStatus]
  );

  // Vérifier si le statut est final
  const isFinal = useMemo(() => 
    WorkflowService.isFinalStatus(currentStatus),
    [currentStatus]
  );

  // Obtenir l'historique du workflow
  const workflowHistory = useMemo(() => 
    WorkflowService.getWorkflowHistory(documentType, currentStatus),
    [documentType, currentStatus]
  );

  // Valider une transition
  const validateTransition = useCallback((targetStatus: DocumentStatus) => {
    const validation = WorkflowService.validateTransition(
      documentType,
      currentStatus,
      targetStatus,
      document
    );
    setLastValidation(validation);
    return validation;
  }, [documentType, currentStatus, document]);

  // Vérifier si une transition est possible
  const canTransition = useCallback((targetStatus: DocumentStatus) => {
    return WorkflowService.canTransition(documentType, currentStatus, targetStatus);
  }, [documentType, currentStatus]);

  // Effectuer une transition (simulation côté client)
  const performTransition = useCallback(async (
    targetStatus: DocumentStatus,
    onTransition?: (status: DocumentStatus) => Promise<void>
  ) => {
    if (!canTransition(targetStatus)) {
      throw new Error('Transition non autorisée');
    }

    const validation = validateTransition(targetStatus);
    if (!validation.canTransition) {
      throw new Error(validation.errors.join(', '));
    }

    setIsTransitioning(true);
    try {
      if (onTransition) {
        await onTransition(targetStatus);
      }
    } finally {
      setIsTransitioning(false);
    }
  }, [canTransition, validateTransition]);

  // Obtenir les notifications automatiques
  const getNotifications = useCallback(() => 
    WorkflowService.getAutomaticNotifications(documentType, currentStatus),
    [documentType, currentStatus]
  );

  // Obtenir les actions recommandées
  const getRecommendedActions = useCallback(() => {
    const actions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      description: string;
    }> = [];

    if (currentStatus === 'draft') {
      actions.push({
        action: 'add_items',
        priority: 'high',
        description: 'Ajouter des éléments au document'
      });
    }

    if (currentStatus === 'validated' && documentType === 'quote') {
      actions.push({
        action: 'send_to_client',
        priority: 'high',
        description: 'Envoyer le devis au client'
      });
    }

    if (currentStatus === 'sent') {
      actions.push({
        action: 'follow_up',
        priority: 'medium',
        description: 'Faire un suivi client'
      });
    }

    return actions;
  }, [currentStatus, documentType]);

  return {
    // État
    currentStatus,
    statusDetails,
    isEditable,
    isFinal,
    isTransitioning,
    lastValidation,

    // Transitions
    availableTransitions,
    canTransition,
    validateTransition,
    performTransition,

    // Historique et context
    workflowHistory,
    getNotifications,
    getRecommendedActions,

    // Utilitaires
    service: WorkflowService
  };
}

/**
 * Hook pour surveiller les changements de statut
 */
export function useStatusMonitor(
  documentId: string,
  currentStatus: DocumentStatus,
  onStatusChange?: (newStatus: DocumentStatus) => void
) {
  const [statusHistory, setStatusHistory] = useState<Array<{
    status: DocumentStatus;
    timestamp: Date;
    user?: string;
    reason?: string;
  }>>([]);

  const addStatusChange = useCallback((
    newStatus: DocumentStatus,
    user?: string,
    reason?: string
  ) => {
    const change = {
      status: newStatus,
      timestamp: new Date(),
      user,
      reason
    };

    setStatusHistory(prev => [change, ...prev]);
    
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  }, [onStatusChange]);

  const getStatusDuration = useCallback((status: DocumentStatus) => {
    const statusChanges = statusHistory.filter(h => h.status === status);
    if (statusChanges.length === 0) return null;

    const start = statusChanges[statusChanges.length - 1].timestamp;
    const end = statusChanges.length > 1 
      ? statusChanges[statusChanges.length - 2].timestamp 
      : new Date();

    return end.getTime() - start.getTime();
  }, [statusHistory]);

  return {
    statusHistory,
    addStatusChange,
    getStatusDuration,
    currentDuration: getStatusDuration(currentStatus)
  };
}

/**
 * Hook pour les règles métier personnalisées
 */
export function useBusinessRules(documentType: DocumentType) {
  const [customRules, setCustomRules] = useState<Array<{
    id: string;
    name: string;
    condition: (document: any) => boolean;
    action: 'block' | 'warn' | 'suggest';
    message: string;
  }>>([]);

  const addRule = useCallback((rule: {
    id: string;
    name: string;
    condition: (document: any) => boolean;
    action: 'block' | 'warn' | 'suggest';
    message: string;
  }) => {
    setCustomRules(prev => [...prev, rule]);
  }, []);

  const removeRule = useCallback((ruleId: string) => {
    setCustomRules(prev => prev.filter(rule => rule.id !== ruleId));
  }, []);

  const validateDocument = useCallback((document: any) => {
    const results = customRules.map(rule => ({
      rule,
      passed: rule.condition(document)
    }));

    const blocking = results.filter(r => !r.passed && r.rule.action === 'block');
    const warnings = results.filter(r => !r.passed && r.rule.action === 'warn');
    const suggestions = results.filter(r => !r.passed && r.rule.action === 'suggest');

    return {
      canProceed: blocking.length === 0,
      blocking: blocking.map(r => r.rule.message),
      warnings: warnings.map(r => r.rule.message),
      suggestions: suggestions.map(r => r.rule.message)
    };
  }, [customRules]);

  // Règles prédéfinies selon le type de document
  const getDefaultRules = useCallback(() => {
    if (documentType === 'quote') {
      return [
        {
          id: 'quote_expiry',
          name: 'Date d\'expiration',
          condition: (doc: any) => doc.valid_until && new Date(doc.valid_until) > new Date(),
          action: 'block' as const,
          message: 'La date d\'expiration doit être dans le futur'
        },
        {
          id: 'quote_amount_limit',
          name: 'Montant maximum',
          condition: (doc: any) => doc.total_amount <= 100000,
          action: 'warn' as const,
          message: 'Devis avec montant élevé (>100k€)'
        }
      ];
    }

    if (documentType === 'invoice') {
      return [
        {
          id: 'invoice_due_date',
          name: 'Date d\'échéance',
          condition: (doc: any) => doc.due_date && new Date(doc.due_date) > new Date(),
          action: 'block' as const,
          message: 'La date d\'échéance doit être dans le futur'
        }
      ];
    }

    return [];
  }, [documentType]);

  return {
    customRules,
    addRule,
    removeRule,
    validateDocument,
    getDefaultRules
  };
}