/**
 * 🔄 SERVICE DE SYNCHRONISATION GLOBAL
 * 
 * Gère automatiquement la synchronisation entre :
 * - Opportunités ↔ Devis
 * - Devis ↔ Opportunités  
 * - Navigation inter-pages
 * - Mises à jour en temps réel
 */

export interface SyncEvent {
  type: 'opportunity_updated' | 'quote_created' | 'quote_updated' | 'quote_deleted' | 'quote_status_changed';
  entityId: string;
  relatedEntityId?: string; // ID de l'entité liée (ex: opportunityId pour un devis)
  data?: any;
  action?: string;
}

export interface SyncListener {
  id: string;
  entityType: 'opportunity' | 'quote';
  entityId: string;
  callback: (event: SyncEvent) => void;
}

class SyncService {
  private listeners: Map<string, SyncListener[]> = new Map();
  private debugMode = true;

  constructor() {
    if (this.debugMode) {
      console.log('🔄 SyncService initialisé');
    }
  }

  /**
   * 📡 ÉMETTRE UN ÉVÉNEMENT DE SYNCHRONISATION
   */
  emit(event: SyncEvent) {
    if (this.debugMode) {
      console.log(`🔄 SyncService.emit:`, event);
    }

    // Notifier les listeners directs (même entité)
    const directListeners = this.listeners.get(`${event.type}:${event.entityId}`) || [];
    directListeners.forEach(listener => {
      try {
        listener.callback(event);
      } catch (error) {
        console.error('❌ Erreur dans un listener de synchronisation:', error);
      }
    });

    // Notifier les listeners liés (entité associée)
    if (event.relatedEntityId) {
      const relatedKey = event.type.includes('quote') ? 
        `opportunity_updated:${event.relatedEntityId}` : 
        `quote_updated:${event.relatedEntityId}`;
      
      const relatedListeners = this.listeners.get(relatedKey) || [];
      relatedListeners.forEach(listener => {
        try {
          listener.callback(event);
        } catch (error) {
          console.error('❌ Erreur dans un listener de synchronisation (related):', error);
        }
      });
    }

    // Événements globaux pour tous les listeners
    const globalListeners = this.listeners.get('*') || [];
    globalListeners.forEach(listener => {
      try {
        listener.callback(event);
      } catch (error) {
        console.error('❌ Erreur dans un listener global:', error);
      }
    });
  }

  /**
   * 👂 S'ABONNER AUX ÉVÉNEMENTS
   */
  subscribe(eventKey: string, listener: SyncListener): () => void {
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, []);
    }

    this.listeners.get(eventKey)!.push(listener);
    
    if (this.debugMode) {
      console.log(`👂 SyncService: Nouveau listener pour "${eventKey}"`, listener);
    }

    // Retourner la fonction de désabonnement
    return () => {
      const listeners = this.listeners.get(eventKey);
      if (listeners) {
        const index = listeners.findIndex(l => l.id === listener.id);
        if (index !== -1) {
          listeners.splice(index, 1);
          if (this.debugMode) {
            console.log(`👋 SyncService: Listener retiré pour "${eventKey}"`, listener.id);
          }
        }
      }
    };
  }

  /**
   * 🎯 HELPERS SPÉCIFIQUES POUR LES ENTITÉS
   */

  // 📄 ÉVÉNEMENTS DEVIS
  notifyQuoteCreated(quoteId: string, opportunityId?: string, quoteData?: any) {
    this.emit({
      type: 'quote_created',
      entityId: quoteId,
      relatedEntityId: opportunityId,
      data: quoteData,
      action: 'created'
    });
  }

  notifyQuoteUpdated(quoteId: string, opportunityId?: string, quoteData?: any) {
    this.emit({
      type: 'quote_updated',
      entityId: quoteId,
      relatedEntityId: opportunityId,
      data: quoteData,
      action: 'updated'
    });
  }

  notifyQuoteStatusChanged(quoteId: string, newStatus: string, opportunityId?: string, quoteData?: any) {
    this.emit({
      type: 'quote_status_changed',
      entityId: quoteId,
      relatedEntityId: opportunityId,
      data: { ...quoteData, status: newStatus },
      action: newStatus
    });
  }

  notifyQuoteDeleted(quoteId: string, opportunityId?: string) {
    this.emit({
      type: 'quote_deleted',
      entityId: quoteId,
      relatedEntityId: opportunityId,
      action: 'deleted'
    });
  }

  // 🎯 ÉVÉNEMENTS OPPORTUNITÉS
  notifyOpportunityUpdated(opportunityId: string, opportunityData?: any, relatedQuoteIds?: string[]) {
    this.emit({
      type: 'opportunity_updated',
      entityId: opportunityId,
      data: opportunityData,
      action: 'updated'
    });

    // Notifier aussi tous les devis liés
    relatedQuoteIds?.forEach(quoteId => {
      this.emit({
        type: 'opportunity_updated',
        entityId: opportunityId,
        relatedEntityId: quoteId,
        data: opportunityData,
        action: 'updated'
      });
    });
  }

  /**
   * 🔧 UTILITAIRES
   */
  
  // Générer un ID unique pour les listeners
  generateListenerId(prefix: string = 'listener'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Nettoyer tous les listeners (utile pour les tests)
  clearAllListeners() {
    this.listeners.clear();
    if (this.debugMode) {
      console.log('🧹 Tous les listeners supprimés');
    }
  }

  // Obtenir des statistiques sur les listeners
  getStats() {
    const stats = {
      totalEventTypes: this.listeners.size,
      totalListeners: 0,
      eventTypes: Array.from(this.listeners.keys()),
    };

    this.listeners.forEach(listeners => {
      stats.totalListeners += listeners.length;
    });

    return stats;
  }

  // Activer/désactiver le mode debug
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
    console.log(`🐛 SyncService debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }
}

// Instance singleton
export const syncService = new SyncService();

/**
 * 🪝 HOOK REACT POUR L'UTILISATION SIMPLIFIÉE
 */
import { useEffect, useRef } from 'react';

export function useSyncListener(
  eventType: SyncEvent['type'],
  entityId: string,
  callback: (event: SyncEvent) => void,
  deps: React.DependencyList = []
) {
  const listenerIdRef = useRef<string>();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Générer un ID unique pour ce listener
    if (!listenerIdRef.current) {
      listenerIdRef.current = syncService.generateListenerId('hook');
    }

    // S'abonner aux événements
    const eventKey = `${eventType}:${entityId}`;
    const listener: SyncListener = {
      id: listenerIdRef.current,
      entityType: eventType.includes('quote') ? 'quote' : 'opportunity',
      entityId,
      callback
    };

    unsubscribeRef.current = syncService.subscribe(eventKey, listener);

    // Nettoyer à la destruction
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [eventType, entityId, ...deps]);

  // Nettoyer à la destruction du composant
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);
}

/**
 * 🪝 HOOK GLOBAL POUR ÉCOUTER TOUS LES ÉVÉNEMENTS
 */
export function useGlobalSyncListener(
  callback: (event: SyncEvent) => void,
  deps: React.DependencyList = []
) {
  const listenerIdRef = useRef<string>();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!listenerIdRef.current) {
      listenerIdRef.current = syncService.generateListenerId('global');
    }

    const listener: SyncListener = {
      id: listenerIdRef.current,
      entityType: 'opportunity', // Type par défaut
      entityId: '*',
      callback
    };

    unsubscribeRef.current = syncService.subscribe('*', listener);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [...deps]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);
}

export default syncService; 