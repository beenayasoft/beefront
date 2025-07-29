/**
 * Service de gestion des workflows côté frontend
 * Synchronisé avec la logique backend du Document-Service
 */

export type DocumentStatus = 
  | 'draft' 
  | 'pending_validation' 
  | 'validated' 
  | 'sent' 
  | 'accepted' 
  | 'rejected' 
  | 'cancelled' 
  | 'expired';

export type DocumentType = 'quote' | 'invoice';

export interface StatusTransition {
  from: DocumentStatus;
  to: DocumentStatus;
  label: string;
  description: string;
  requiresValidation: boolean;
  requiresConfirmation: boolean;
  reversible: boolean;
  icon: string;
  color: string;
}

export interface WorkflowRule {
  documentType: DocumentType;
  status: DocumentStatus;
  allowedTransitions: DocumentStatus[];
  requiredFields: string[];
  businessRules: Array<{
    rule: string;
    errorMessage: string;
    validator: (document: any) => boolean;
  }>;
}

export interface TransitionValidation {
  canTransition: boolean;
  errors: string[];
  warnings: string[];
  requiredActions: string[];
}

class WorkflowServiceClass {
  private readonly STATUS_TRANSITIONS: StatusTransition[] = [
    {
      from: 'draft',
      to: 'pending_validation',
      label: 'Soumettre pour validation',
      description: 'Soumet le document pour validation interne',
      requiresValidation: true,
      requiresConfirmation: false,
      reversible: true,
      icon: '📋',
      color: 'blue'
    },
    {
      from: 'pending_validation',
      to: 'validated',
      label: 'Valider',
      description: 'Valide le document et le rend prêt à envoyer',
      requiresValidation: true,
      requiresConfirmation: false,
      reversible: false,
      icon: '✅',
      color: 'green'
    },
    {
      from: 'pending_validation',
      to: 'draft',
      label: 'Retourner en brouillon',
      description: 'Remet le document en brouillon pour modifications',
      requiresValidation: false,
      requiresConfirmation: true,
      reversible: true,
      icon: '📝',
      color: 'gray'
    },
    {
      from: 'validated',
      to: 'sent',
      label: 'Envoyer',
      description: 'Envoie le document au client',
      requiresValidation: true,
      requiresConfirmation: false,
      reversible: false,
      icon: '📤',
      color: 'blue'
    },
    {
      from: 'sent',
      to: 'accepted',
      label: 'Marquer comme accepté',
      description: 'Le client a accepté le document',
      requiresValidation: false,
      requiresConfirmation: true,
      reversible: false,
      icon: '🎉',
      color: 'green'
    },
    {
      from: 'sent',
      to: 'rejected',
      label: 'Marquer comme rejeté',
      description: 'Le client a rejeté le document',
      requiresValidation: false,
      requiresConfirmation: true,
      reversible: false,
      icon: '❌',
      color: 'red'
    },
    {
      from: 'draft',
      to: 'cancelled',
      label: 'Annuler',
      description: 'Annule le document',
      requiresValidation: false,
      requiresConfirmation: true,
      reversible: false,
      icon: '🚫',
      color: 'red'
    },
    {
      from: 'pending_validation',
      to: 'cancelled',
      label: 'Annuler',
      description: 'Annule le document',
      requiresValidation: false,
      requiresConfirmation: true,
      reversible: false,
      icon: '🚫',
      color: 'red'
    },
    {
      from: 'validated',
      to: 'cancelled',
      label: 'Annuler',
      description: 'Annule le document',
      requiresValidation: false,
      requiresConfirmation: true,
      reversible: false,
      icon: '🚫',
      color: 'red'
    }
  ];

  private readonly WORKFLOW_RULES: WorkflowRule[] = [
    {
      documentType: 'quote',
      status: 'draft',
      allowedTransitions: ['pending_validation', 'cancelled'],
      requiredFields: ['client_id', 'title'],
      businessRules: [
        {
          rule: 'must_have_items',
          errorMessage: 'Le devis doit contenir au moins un élément',
          validator: (doc) => doc.items && doc.items.length > 0
        },
        {
          rule: 'valid_amounts',
          errorMessage: 'Les montants doivent être valides',
          validator: (doc) => doc.total_amount > 0
        }
      ]
    },
    {
      documentType: 'quote',
      status: 'pending_validation',
      allowedTransitions: ['validated', 'draft', 'cancelled'],
      requiredFields: ['client_id', 'title', 'quote_number'],
      businessRules: [
        {
          rule: 'complete_client_info',
          errorMessage: 'Les informations client doivent être complètes',
          validator: (doc) => doc.client && doc.client.email
        }
      ]
    },
    {
      documentType: 'quote',
      status: 'validated',
      allowedTransitions: ['sent', 'cancelled'],
      requiredFields: ['client_id', 'title', 'quote_number', 'valid_until'],
      businessRules: [
        {
          rule: 'future_expiry',
          errorMessage: 'La date d\'expiration doit être dans le futur',
          validator: (doc) => new Date(doc.valid_until) > new Date()
        }
      ]
    },
    {
      documentType: 'quote',
      status: 'sent',
      allowedTransitions: ['accepted', 'rejected'],
      requiredFields: [],
      businessRules: []
    },
    {
      documentType: 'invoice',
      status: 'draft',
      allowedTransitions: ['pending_validation', 'cancelled'],
      requiredFields: ['client_id', 'title'],
      businessRules: [
        {
          rule: 'must_have_items',
          errorMessage: 'La facture doit contenir au moins un élément',
          validator: (doc) => doc.items && doc.items.length > 0
        }
      ]
    },
    {
      documentType: 'invoice',
      status: 'validated',
      allowedTransitions: ['sent'],
      requiredFields: ['client_id', 'title', 'invoice_number', 'due_date'],
      businessRules: [
        {
          rule: 'future_due_date',
          errorMessage: 'La date d\'échéance doit être dans le futur',
          validator: (doc) => new Date(doc.due_date) > new Date()
        }
      ]
    }
  ];

  /**
   * Vérifie si une transition est autorisée
   */
  canTransition(
    documentType: DocumentType,
    currentStatus: DocumentStatus,
    targetStatus: DocumentStatus
  ): boolean {
    const rule = this.getWorkflowRule(documentType, currentStatus);
    return rule ? rule.allowedTransitions.includes(targetStatus) : false;
  }

  /**
   * Obtient les transitions possibles depuis un statut donné
   */
  getAvailableTransitions(
    documentType: DocumentType,
    currentStatus: DocumentStatus
  ): StatusTransition[] {
    const rule = this.getWorkflowRule(documentType, currentStatus);
    if (!rule) return [];

    return this.STATUS_TRANSITIONS.filter(transition => 
      transition.from === currentStatus && 
      rule.allowedTransitions.includes(transition.to)
    );
  }

  /**
   * Valide une transition avant de l'effectuer
   */
  validateTransition(
    documentType: DocumentType,
    currentStatus: DocumentStatus,
    targetStatus: DocumentStatus,
    document: any
  ): TransitionValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const requiredActions: string[] = [];

    // Vérifier si la transition est autorisée
    if (!this.canTransition(documentType, currentStatus, targetStatus)) {
      errors.push(`Transition de ${currentStatus} vers ${targetStatus} non autorisée`);
      return {
        canTransition: false,
        errors,
        warnings,
        requiredActions
      };
    }

    // Obtenir les règles pour le statut cible
    const targetRule = this.getWorkflowRule(documentType, targetStatus);
    if (!targetRule) {
      errors.push(`Règles non définies pour le statut ${targetStatus}`);
      return {
        canTransition: false,
        errors,
        warnings,
        requiredActions
      };
    }

    // Vérifier les champs requis
    targetRule.requiredFields.forEach(field => {
      if (!document[field] || document[field] === '') {
        errors.push(`Le champ ${field} est requis`);
        requiredActions.push(`Renseigner le champ ${field}`);
      }
    });

    // Vérifier les règles métier
    targetRule.businessRules.forEach(rule => {
      try {
        if (!rule.validator(document)) {
          errors.push(rule.errorMessage);
          requiredActions.push(`Corriger: ${rule.errorMessage}`);
        }
      } catch (error) {
        errors.push(`Erreur lors de la validation de la règle ${rule.rule}`);
      }
    });

    // Obtenir les détails de la transition
    const transition = this.STATUS_TRANSITIONS.find(t => 
      t.from === currentStatus && t.to === targetStatus
    );

    if (transition?.requiresConfirmation) {
      warnings.push('Cette action nécessite une confirmation');
    }

    // Vérifications spéciales selon le type de document
    if (documentType === 'quote' && targetStatus === 'sent') {
      if (!document.client?.email) {
        errors.push('L\'email du client est requis pour l\'envoi');
        requiredActions.push('Ajouter l\'email du client');
      }
    }

    if (documentType === 'invoice' && targetStatus === 'sent') {
      if (document.total_amount === 0) {
        warnings.push('Facture avec montant nul');
      }
    }

    return {
      canTransition: errors.length === 0,
      errors,
      warnings,
      requiredActions
    };
  }

  /**
   * Obtient les détails d'un statut
   */
  getStatusDetails(status: DocumentStatus): {
    label: string;
    description: string;
    icon: string;
    color: string;
    isFinal: boolean;
  } {
    const statusConfig = {
      draft: {
        label: 'Brouillon',
        description: 'Document en cours de rédaction',
        icon: '📝',
        color: 'gray',
        isFinal: false
      },
      pending_validation: {
        label: 'En attente de validation',
        description: 'Document soumis pour validation',
        icon: '⏳',
        color: 'yellow',
        isFinal: false
      },
      validated: {
        label: 'Validé',
        description: 'Document validé, prêt à envoyer',
        icon: '✅',
        color: 'green',
        isFinal: false
      },
      sent: {
        label: 'Envoyé',
        description: 'Document envoyé au client',
        icon: '📤',
        color: 'blue',
        isFinal: false
      },
      accepted: {
        label: 'Accepté',
        description: 'Document accepté par le client',
        icon: '🎉',
        color: 'green',
        isFinal: true
      },
      rejected: {
        label: 'Rejeté',
        description: 'Document rejeté par le client',
        icon: '❌',
        color: 'red',
        isFinal: true
      },
      cancelled: {
        label: 'Annulé',
        description: 'Document annulé',
        icon: '🚫',
        color: 'red',
        isFinal: true
      },
      expired: {
        label: 'Expiré',
        description: 'Document expiré',
        icon: '⏰',
        color: 'orange',
        isFinal: true
      }
    };

    return statusConfig[status] || statusConfig.draft;
  }

  /**
   * Obtient la règle de workflow pour un type de document et un statut
   */
  private getWorkflowRule(documentType: DocumentType, status: DocumentStatus): WorkflowRule | undefined {
    return this.WORKFLOW_RULES.find(rule => 
      rule.documentType === documentType && rule.status === status
    );
  }

  /**
   * Obtient l'historique des transitions possibles
   */
  getWorkflowHistory(
    documentType: DocumentType,
    currentStatus: DocumentStatus
  ): Array<{
    status: DocumentStatus;
    canRevert: boolean;
    details: ReturnType<typeof this.getStatusDetails>;
  }> {
    // Logique simplifiée - dans un vrai système, ceci viendrait de l'historique
    const commonFlow: DocumentStatus[] = ['draft', 'pending_validation', 'validated', 'sent'];
    const currentIndex = commonFlow.indexOf(currentStatus);
    
    if (currentIndex === -1) return [];

    return commonFlow.slice(0, currentIndex + 1).map(status => ({
      status,
      canRevert: this.canTransition(documentType, currentStatus, status),
      details: this.getStatusDetails(status)
    }));
  }

  /**
   * Vérifie si un document est modifiable
   */
  isEditable(status: DocumentStatus): boolean {
    return ['draft', 'pending_validation'].includes(status);
  }

  /**
   * Vérifie si un document est dans un état final
   */
  isFinalStatus(status: DocumentStatus): boolean {
    return ['accepted', 'rejected', 'cancelled', 'expired'].includes(status);
  }

  /**
   * Obtient les notifications automatiques pour un statut
   */
  getAutomaticNotifications(
    documentType: DocumentType,
    status: DocumentStatus
  ): Array<{
    type: 'email' | 'sms' | 'internal';
    recipient: 'client' | 'team' | 'manager';
    template: string;
    delay?: number; // en minutes
  }> {
    const notifications: Array<{
      type: 'email' | 'sms' | 'internal';
      recipient: 'client' | 'team' | 'manager';
      template: string;
      delay?: number;
    }> = [];

    if (status === 'sent') {
      notifications.push({
        type: 'email',
        recipient: 'client',
        template: `${documentType}_sent`
      });
      notifications.push({
        type: 'internal',
        recipient: 'team',
        template: `${documentType}_sent_notification`
      });
    }

    if (status === 'accepted') {
      notifications.push({
        type: 'internal',
        recipient: 'team',
        template: `${documentType}_accepted`
      });
    }

    return notifications;
  }
}

export const WorkflowService = new WorkflowServiceClass();
export default WorkflowService;