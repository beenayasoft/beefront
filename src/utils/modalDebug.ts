/**
 * Utilitaires de debugging et nettoyage pour les modales
 * Résout les problèmes d'overlays orphelins et d'UI bloquée
 */

export interface ModalDebugInfo {
  overlays: Element[];
  portals: Element[];
  focusTraps: Element[];
  backdropCount: number;
  totalOrphanElements: number;
}

/**
 * Analyse l'état des modales et overlays dans le DOM
 */
export function debugModalState(): ModalDebugInfo {
  const overlays = Array.from(document.querySelectorAll(
    '[data-radix-dialog-overlay], [data-dialog-overlay], .ReactModal__Overlay, .modal-backdrop'
  ));
  
  const portals = Array.from(document.querySelectorAll(
    '[data-radix-portal], [data-radix-popper-content-wrapper]'
  ));
  
  const focusTraps = Array.from(document.querySelectorAll(
    '[data-radix-focus-guard], [data-focus-trap], .focus-trap'
  ));
  
  const backdropCount = document.querySelectorAll('.backdrop, .overlay').length;
  
  return {
    overlays,
    portals,
    focusTraps,
    backdropCount,
    totalOrphanElements: overlays.length + portals.length + focusTraps.length
  };
}

/**
 * Nettoie agressivement tous les éléments de modal orphelins
 */
export function forceCleanModalOrphans(): number {
  let cleanedCount = 0;
  
  console.log('🧹 Début du nettoyage des orphelins...');
  
  // 1. Nettoyer les overlays et backdropss
  const overlaySelectors = [
    '[data-radix-dialog-overlay]',
    '[data-dialog-overlay]',
    '.ReactModal__Overlay',
    '.modal-backdrop',
    '.backdrop',
    '.overlay',
    '[data-state="closed"][data-radix-dialog-overlay]', // Overlays fermés mais toujours présents
    'div[style*="position: fixed"][style*="inset: 0"]' // Overlays avec styles inline
  ];
  
  overlaySelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      console.log(`🧹 Suppression overlay orphelin: ${selector}`);
      el.remove();
      cleanedCount++;
    });
  });
  
  // 2. Nettoyer les portals Radix
  const portalSelectors = [
    '[data-radix-portal]',
    '[data-radix-popper-content-wrapper]',
    '[data-radix-collection-item]'
  ];
  
  portalSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      // Vérifier si le portal est vraiment orphelin (pas de contenu visible)
      // ET s'assurer que ce n'est pas un toast
      if ((el.children.length === 0 || !el.querySelector('[data-state="open"]')) &&
          !el.closest('[data-radix-toast-viewport]') &&
          !el.closest('[data-sonner-toaster]') &&
          !el.hasAttribute('data-radix-toast-viewport') &&
          !el.querySelector('[data-radix-toast-root]')) {
        console.log(`🧹 Suppression portal orphelin: ${selector}`);
        el.remove();
        cleanedCount++;
      }
    });
  });
  
  // 3. Nettoyer les focus traps
  const focusTrapSelectors = [
    '[data-radix-focus-guard]',
    '[data-focus-trap]',
    '.focus-trap'
  ];
  
  focusTrapSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      console.log(`🧹 Suppression focus trap orphelin: ${selector}`);
      el.remove();
      cleanedCount++;
    });
  });
  
  // 4. Nettoyer tous les éléments avec pointer-events: none qui pourraient bloquer
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    const styles = window.getComputedStyle(el);
    if (styles.position === 'fixed' && 
        parseInt(styles.zIndex || '0') > 100 && 
        (styles.pointerEvents === 'none' || styles.visibility === 'hidden') &&
        !el.closest('[data-radix-toast-viewport]') && 
        !el.closest('[data-sonner-toaster]') &&
        !el.hasAttribute('data-radix-toast-root') &&
        !el.hasAttribute('data-radix-toast-viewport') &&
        !el.hasAttribute('data-radix-toast-title') &&
        !el.hasAttribute('data-radix-toast-description') &&
        !el.querySelector('[data-radix-toast-root]')) { // Éviter de supprimer les toasts
      console.log(`🧹 Suppression élément bloquant: ${el.tagName}`, el);
      el.remove();
      cleanedCount++;
    }
  });

  // 5. Restaurer le scroll
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
  document.body.style.pointerEvents = '';
  
  // 6. Supprimer les attributs de modal du body
  document.body.removeAttribute('data-scroll-locked');
  document.body.removeAttribute('data-radix-scroll-area-viewport');
  document.body.classList.remove('modal-open', 'overflow-hidden');
  
  // 7. Restaurer le focus si nécessaire
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur?.();
  }
  
  console.log(`✅ Nettoyage terminé: ${cleanedCount} éléments supprimés`);
  return cleanedCount;
}

/**
 * Vérifie si l'UI est bloquée par des overlays invisibles
 */
export function isUIBlocked(): { blocked: boolean; details: any } {
  // Vérifier s'il y a des overlays avec z-index élevé
  const highZIndexElements = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const zIndex = window.getComputedStyle(el).zIndex;
      return zIndex && parseInt(zIndex) > 1000;
    })
    .map(el => ({
      tag: el.tagName,
      class: el.className,
      zIndex: window.getComputedStyle(el).zIndex,
      attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`),
      position: window.getComputedStyle(el).position
    }));
  
  // Vérifier s'il y a des éléments avec pointer-events bloqués
  const problematicOverlays = Array.from(document.querySelectorAll('div'))
    .filter(el => {
      const styles = window.getComputedStyle(el);
      return styles.position === 'fixed' && 
             parseInt(styles.zIndex || '0') > 100 && 
             el.getBoundingClientRect().width > 0 &&
             el.getBoundingClientRect().height > 0;
    })
    .map(el => ({
      tag: el.tagName,
      class: el.className,
      zIndex: window.getComputedStyle(el).zIndex,
      pointerEvents: window.getComputedStyle(el).pointerEvents,
      visibility: window.getComputedStyle(el).visibility,
      opacity: window.getComputedStyle(el).opacity,
      rect: el.getBoundingClientRect(),
      attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`)
    }));

  const bodyAttrs = Array.from(document.body.attributes).map(attr => `${attr.name}="${attr.value}"`);
  const bodyStyles = {
    overflow: document.body.style.overflow,
    pointerEvents: document.body.style.pointerEvents,
    position: document.body.style.position
  };

  const details = {
    highZIndexElements,
    problematicOverlays,
    bodyAttributes: bodyAttrs,
    bodyStyles,
    totalBlockingElements: highZIndexElements.length + problematicOverlays.length
  };
  
  console.log('🔍 Diagnostic UI bloquée:', details);
  
  return {
    blocked: details.totalBlockingElements > 0,
    details
  };
}

/**
 * Hook de debugging automatique (à utiliser en développement)
 */
export function setupModalDebugMonitor() {
  if (process.env.NODE_ENV !== 'development') return;
  
  let checkInterval: NodeJS.Timeout;
  
  const startMonitoring = () => {
    checkInterval = setInterval(() => {
      const info = debugModalState();
      if (info.totalOrphanElements > 0) {
        console.warn('🚨 Éléments modales orphelins détectés:', info);
        
        // Auto-nettoyage après 5 secondes si pas d'interaction
        setTimeout(() => {
          const newInfo = debugModalState();
          if (newInfo.totalOrphanElements > 0) {
            console.warn('🧹 Nettoyage automatique des orphelins...');
            forceCleanModalOrphans();
          }
        }, 5000);
      }
    }, 2000);
  };
  
  const stopMonitoring = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  };
  
  // Démarrer le monitoring
  startMonitoring();
  
  // Nettoyer au démontage
  return stopMonitoring;
}

/**
 * Utilitaire pour tester si un élément bloque les interactions
 */
export function testElementInteraction(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  // Tester si l'élément au centre est bien celui attendu
  const elementAtPoint = document.elementFromPoint(centerX, centerY);
  return elementAtPoint === element || element.contains(elementAtPoint);
}

/**
 * Fonction d'urgence pour débloquer complètement l'UI
 * À utiliser en dernier recours
 */
export function emergencyUnblockUI(): void {
  console.warn('🚨 DÉBLOCAGE D\'URGENCE DE L\'UI');
  
  // 1. Supprimer TOUS les éléments de modal possibles
  const modalSelectors = [
    '[data-radix-dialog-overlay]',
    '[data-radix-dialog-content]',
    '[data-radix-portal]',
    '[data-radix-popper-content-wrapper]',
    '[data-radix-focus-guard]',
    '[data-state="closed"]',
    '.ReactModal__Overlay',
    '.modal-backdrop'
  ];
  
  modalSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      console.log(`🧹 URGENCE: Suppression ${selector}`, el);
      el.remove();
    });
  });
  
  // 2. Restaurer complètement le body
  document.body.style.cssText = '';
  document.documentElement.style.cssText = '';
  
  // 3. Supprimer tous les attributs data-*
  Array.from(document.body.attributes).forEach(attr => {
    if (attr.name.startsWith('data-')) {
      document.body.removeAttribute(attr.name);
    }
  });
  
  // 4. Nettoyer les classes
  document.body.className = document.body.className
    .split(' ')
    .filter(cls => !cls.includes('modal') && !cls.includes('overflow'))
    .join(' ');
  
  // 5. Forcer le focus sur le body
  document.body.focus();
  if (document.activeElement && document.activeElement !== document.body) {
    (document.activeElement as HTMLElement).blur();
  }
  
  // 6. Supprimer tous les éléments avec z-index > 1000
  document.querySelectorAll('*').forEach(el => {
    const zIndex = window.getComputedStyle(el).zIndex;
    if (zIndex && parseInt(zIndex) > 1000 && 
        !el.closest('[data-sonner-toaster]') &&
        !el.closest('[data-radix-toast-viewport]') &&
        !el.hasAttribute('data-radix-toast-viewport') &&
        !el.hasAttribute('data-radix-toast-root') &&
        !el.querySelector('[data-radix-toast-root]')) {
      console.log(`🧹 URGENCE: Suppression z-index élevé`, el);
      el.remove();
    }
  });
  
  console.log('✅ DÉBLOCAGE D\'URGENCE TERMINÉ');
}

/**
 * Expose la fonction d'urgence globalement pour les développeurs
 */
if (typeof window !== 'undefined') {
  (window as any).emergencyUnblockUI = emergencyUnblockUI;
  (window as any).debugModalState = debugModalState;
  (window as any).forceCleanModalOrphans = forceCleanModalOrphans;
  (window as any).isUIBlocked = isUIBlocked;
}