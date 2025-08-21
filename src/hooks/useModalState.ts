/**
 * Hook personnalisé pour gérer l'état des modals de manière sécurisée
 * Évite les problèmes d'états figés et de nettoyage incomplet
 * 
 * @example
 * ```tsx
 * import { useModalState, createSafeSubmitHandler } from '@/hooks/useModalState';
 * 
 * function MyComponent() {
 *   const editModal = useModalState<User>();
 *   const deleteModal = useModalState<User>();
 * 
 *   const handleSubmit = createSafeSubmitHandler(
 *     editModal,
 *     async (userData) => {
 *       await api.updateUser(editModal.data.id, userData);
 *     },
 *     () => console.log('Success!'),
 *     (error) => console.error('Error:', error)
 *   );
 * 
 *   return (
 *     <div>
 *       <Dialog open={editModal.isOpen} onOpenChange={(open) => !open && editModal.actions.close()}>
 *         <UserForm 
 *           user={editModal.data} 
 *           onSubmit={handleSubmit}
 *           isSubmitting={editModal.isSubmitting}
 *         />
 *       </Dialog>
 *     </div>
 *   );
 * }
 * ```
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { forceCleanModalOrphans, debugModalState, isUIBlocked } from '@/utils/modalDebug';

export interface ModalState {
  isOpen: boolean;
  data?: any;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export interface ModalActions<T = any> {
  open: (data?: T) => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
  forceClose: () => void;
}

export interface UseModalStateReturn<T = any> extends ModalState {
  actions: ModalActions<T>;
}

/**
 * Hook personnalisé pour gérer l'état des modals de manière sécurisée
 * Évite les problèmes d'états figés et de nettoyage incomplet
 */
export function useModalState<T = any>(
  initialState: Partial<ModalState> = {}
): UseModalStateReturn<T> {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    data: undefined,
    isLoading: false,
    isSubmitting: false,
    ...initialState,
  });

  // Référence pour éviter les états obsolètes
  const stateRef = useRef(state);
  stateRef.current = state;

  // Timer pour forcer la fermeture si nécessaire
  const forceCloseTimerRef = useRef<NodeJS.Timeout>();

  const actions: ModalActions<T> = {
    open: useCallback((data?: T) => {
      // Nettoyer tout timer en cours
      if (forceCloseTimerRef.current) {
        clearTimeout(forceCloseTimerRef.current);
      }

      setState({
        isOpen: true,
        data,
        isLoading: false,
        isSubmitting: false,
      });
    }, []),

    close: useCallback(() => {
      setState(prev => ({
        ...prev,
        isOpen: false,
        isLoading: false,
        isSubmitting: false,
      }));
      
      // Nettoyage différé pour éviter les race conditions
      setTimeout(() => {
        setState(prev => {
          // Seulement nettoyer si la modale est toujours fermée
          if (!prev.isOpen) {
            return {
              ...prev,
              data: undefined,
            };
          }
          return prev;
        });
      }, 300); // Délai augmenté pour laisser les animations se terminer
      
      // Cleanup DOM séparé pour éviter l'interférence - DÉSACTIVÉ TEMPORAIREMENT
      // pour éviter les conflits avec les toasts
      setTimeout(() => {
        // const cleanedCount = forceCleanModalOrphans();
        
        // Diagnostic automatique après cleanup
        setTimeout(() => {
          const blockStatus = isUIBlocked();
          if (blockStatus.blocked) {
            console.warn('⚠️ UI potentiellement bloquée après fermeture modale:', blockStatus.details);
            // Nettoyage forcé supplémentaire - DÉSACTIVÉ
            // forceCleanModalOrphans();
          } else {
            console.log('✅ UI libre après fermeture de modale');
          }
        }, 100);
      }, 400);
    }, []),

    setLoading: useCallback((loading: boolean) => {
      setState(prev => ({
        ...prev,
        isLoading: loading,
      }));
    }, []),

    setSubmitting: useCallback((submitting: boolean) => {
      setState(prev => ({
        ...prev,
        isSubmitting: submitting,
      }));
      
      // Protection contre les états figés : forcer la réinitialisation après 30s
      if (submitting) {
        forceCloseTimerRef.current = setTimeout(() => {
            setState({
            isOpen: false,
            data: undefined,
            isLoading: false,
            isSubmitting: false,
          });
        }, 30000);
      } else if (forceCloseTimerRef.current) {
        clearTimeout(forceCloseTimerRef.current);
      }
    }, []),

    reset: useCallback(() => {
      if (forceCloseTimerRef.current) {
        clearTimeout(forceCloseTimerRef.current);
      }
      
      setState({
        isOpen: false,
        data: undefined,
        isLoading: false,
        isSubmitting: false,
      });
    }, []),

    forceClose: useCallback(() => {
      if (forceCloseTimerRef.current) {
        clearTimeout(forceCloseTimerRef.current);
      }
      
      setState({
        isOpen: false,
        data: undefined,
        isLoading: false,
        isSubmitting: false,
      });
      
      setTimeout(() => {
        // forceCleanModalOrphans(); // DÉSACTIVÉ pour éviter les conflits avec les toasts
      }, 100);
    }, []),
  };

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (forceCloseTimerRef.current) {
        clearTimeout(forceCloseTimerRef.current);
      }
    };
  }, []);

  // Gestionnaire d'échappement global
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isOpen && !state.isSubmitting) {
        actions.close();
      }
    };

    if (state.isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [state.isOpen, state.isSubmitting, actions]);

  return {
    ...state,
    actions,
  };
}

/**
 * Hook pour gérer plusieurs modals en même temps
 */
export function useMultiModalState<T extends Record<string, any>>(
  modalKeys: (keyof T)[]
): Record<keyof T, UseModalStateReturn> {
  const modals = {} as Record<keyof T, UseModalStateReturn>;
  
  modalKeys.forEach(key => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[key] = useModalState();
  });

  return modals;
}

/**
 * Utilitaire pour créer une fonction de soumission sécurisée
 */
export function createSafeSubmitHandler<T>(
  modal: UseModalStateReturn,
  submitFn: (data: T) => Promise<void>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error, data: T) => void
) {
  return async (data: T) => {
    if (modal.isSubmitting) {
      return;
    }

    try {
      modal.actions.setSubmitting(true);
      await submitFn(data);
      onSuccess?.(data);
      modal.actions.close();
    } catch (error) {
      onError?.(error as Error, data);
    } finally {
      modal.actions.setSubmitting(false);
    }
  };
} 