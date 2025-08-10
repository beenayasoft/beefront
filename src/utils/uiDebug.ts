/**
 * Diagnostic avancé pour identifier les causes de blocage UI
 * Au-delà des overlays, examine tous les aspects qui peuvent freezer l'interface
 */

export interface UIDebugInfo {
  clickBlocking: {
    hasBlockingElements: boolean;
    blockingElements: Element[];
    topMostElement: Element | null;
  };
  eventListeners: {
    count: number;
    types: string[];
  };
  reactRendering: {
    suspendedComponents: number;
    errorBoundaries: number;
  };
  styles: {
    fixedElements: Element[];
    highZIndexElements: Element[];
    invisibleOverlays: Element[];
  };
  performance: {
    isBlocked: boolean;
    reason?: string;
  };
}

/**
 * Test exhaustif de l'état de l'UI
 */
export function diagnoseUIFreeze(): UIDebugInfo {
  console.log('🔍 Diagnostic complet de l\'UI...');

  // 1. Tester les interactions de clic
  const clickBlocking = testClickInteractions();
  
  // 2. Analyser les event listeners
  const eventListeners = analyzeEventListeners();
  
  // 3. Vérifier les composants React
  const reactRendering = checkReactState();
  
  // 4. Examiner les styles problématiques
  const styles = analyzeProblematicStyles();
  
  // 5. Test de performance global
  const performance = testUIResponsiveness();

  const result = {
    clickBlocking,
    eventListeners,
    reactRendering,
    styles,
    performance
  };

  console.log('📊 Diagnostic UI complet:', result);
  return result;
}

/**
 * Test les interactions de clic sur différents points de l'écran
 */
function testClickInteractions() {
  const testPoints = [
    { x: window.innerWidth / 2, y: window.innerHeight / 2 }, // Centre
    { x: 100, y: 100 }, // Coin haut-gauche
    { x: window.innerWidth - 100, y: 100 }, // Coin haut-droit
    { x: 100, y: window.innerHeight - 100 }, // Coin bas-gauche
  ];

  const blockingElements: Element[] = [];
  let topMostElement: Element | null = null;

  testPoints.forEach(point => {
    const element = document.elementFromPoint(point.x, point.y);
    if (element) {
      const styles = window.getComputedStyle(element);
      const zIndex = parseInt(styles.zIndex || '0');
      
      // Vérifier si l'élément pourrait bloquer les clics
      if (zIndex > 1000 || 
          styles.position === 'fixed' || 
          styles.pointerEvents === 'none' ||
          element.tagName === 'DIV' && !element.textContent?.trim()) {
        blockingElements.push(element);
        
        if (!topMostElement || zIndex > parseInt(window.getComputedStyle(topMostElement).zIndex || '0')) {
          topMostElement = element;
        }
      }
    }
  });

  return {
    hasBlockingElements: blockingElements.length > 0,
    blockingElements,
    topMostElement
  };
}

/**
 * Analyse les event listeners actifs
 */
function analyzeEventListeners() {
  // Cette fonction est limitée car on ne peut pas facilement lister tous les listeners
  // Mais on peut vérifier les éléments connus problématiques
  
  const suspiciousListeners: string[] = [];
  let count = 0;

  // Vérifier les listeners sur window
  const windowEvents = ['click', 'mousedown', 'mouseup', 'keydown', 'keyup', 'scroll'];
  windowEvents.forEach(eventType => {
    // On ne peut pas compter exactement, mais on peut détecter certains patterns
    if ((window as any)[`on${eventType}`]) {
      suspiciousListeners.push(`window.on${eventType}`);
      count++;
    }
  });

  // Vérifier les listeners sur document
  const documentEvents = ['click', 'mousedown', 'keydown'];
  documentEvents.forEach(eventType => {
    if ((document as any)[`on${eventType}`]) {
      suspiciousListeners.push(`document.on${eventType}`);
      count++;
    }
  });

  return {
    count,
    types: suspiciousListeners
  };
}

/**
 * Vérifier l'état des composants React
 */
function checkReactState() {
  let suspendedComponents = 0;
  let errorBoundaries = 0;

  // Chercher des éléments avec des attributs React suspects
  const reactElements = document.querySelectorAll('[data-reactroot], [data-react-helmet]');
  
  reactElements.forEach(element => {
    // Vérifier si l'élément semble suspendu
    if (element.querySelector('.loading, .spinner, [data-loading="true"]')) {
      suspendedComponents++;
    }
    
    // Vérifier les error boundaries
    if (element.querySelector('.error-boundary, [data-error="true"]')) {
      errorBoundaries++;
    }
  });

  return {
    suspendedComponents,
    errorBoundaries
  };
}

/**
 * Analyser les styles problématiques
 */
function analyzeProblematicStyles() {
  const fixedElements: Element[] = [];
  const highZIndexElements: Element[] = [];
  const invisibleOverlays: Element[] = [];

  // Scanner tous les éléments pour des styles problématiques
  const allElements = Array.from(document.querySelectorAll('*'));
  
  allElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    const zIndex = parseInt(styles.zIndex || '0');
    
    // Éléments fixed
    if (styles.position === 'fixed') {
      fixedElements.push(element);
    }
    
    // Z-index élevé
    if (zIndex > 100) {
      highZIndexElements.push(element);
    }
    
    // Overlays invisibles potentiels
    if (styles.position === 'fixed' && 
        (styles.backgroundColor === 'rgba(0, 0, 0, 0)' || 
         styles.opacity === '0' ||
         parseFloat(styles.opacity) < 0.1) &&
        zIndex > 10) {
      invisibleOverlays.push(element);
    }
  });

  return {
    fixedElements,
    highZIndexElements,
    invisibleOverlays
  };
}

/**
 * Test la réactivité générale de l'UI
 */
function testUIResponsiveness(): { isBlocked: boolean; reason?: string } {
  try {
    // Test 1: Vérifier si on peut créer des éléments DOM
    const testDiv = document.createElement('div');
    document.body.appendChild(testDiv);
    document.body.removeChild(testDiv);
    
    // Test 2: Vérifier si les animations CSS fonctionnent
    const animationTest = document.createElement('div');
    animationTest.style.cssText = 'position:fixed;top:-1000px;transition:top 0.1s;';
    document.body.appendChild(animationTest);
    
    setTimeout(() => {
      animationTest.style.top = '-999px';
    }, 10);
    
    setTimeout(() => {
      document.body.removeChild(animationTest);
    }, 200);
    
    // Test 3: Vérifier si JavaScript s'exécute normalement
    const startTime = performance.now();
    for (let i = 0; i < 100000; i++) {
      // Loop de test
    }
    const endTime = performance.now();
    
    if (endTime - startTime > 100) {
      return { isBlocked: true, reason: 'JavaScript execution is slow' };
    }
    
    return { isBlocked: false };
    
  } catch (error) {
    return { isBlocked: true, reason: `DOM manipulation error: ${error}` };
  }
}

/**
 * Force le déblocage par suppression d'éléments suspects
 */
export function forceUnblockUI(): number {
  console.warn('🚨 DÉBLOCAGE FORCÉ DE L\'UI...');
  
  let removedCount = 0;
  
  // 1. Supprimer tous les éléments avec z-index très élevé
  const highZElements = Array.from(document.querySelectorAll('*'))
    .filter(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex || '0');
      return zIndex > 9999;
    });
    
  highZElements.forEach(el => {
    console.log('🗑️ Suppression élément z-index élevé:', el);
    el.remove();
    removedCount++;
  });
  
  // 2. Réinitialiser les styles du body et html
  document.body.style.cssText = '';
  document.documentElement.style.cssText = '';
  
  // 3. Supprimer tous les overlays invisibles
  const invisibleOverlays = Array.from(document.querySelectorAll('div'))
    .filter(el => {
      const styles = window.getComputedStyle(el);
      return styles.position === 'fixed' && 
             (parseFloat(styles.opacity) < 0.1 || styles.visibility === 'hidden') &&
             parseInt(styles.zIndex || '0') > 10;
    });
    
  invisibleOverlays.forEach(el => {
    console.log('🗑️ Suppression overlay invisible:', el);
    el.remove();
    removedCount++;
  });
  
  // 4. Forcer le reflow
  document.body.offsetHeight;
  
  console.log(`✅ Déblocage terminé: ${removedCount} éléments supprimés`);
  return removedCount;
}

/**
 * Outil de diagnostic en temps réel
 */
export function startUIMonitoring() {
  console.log('🔍 Démarrage du monitoring UI...');
  
  const monitor = setInterval(() => {
    const diagnosis = diagnoseUIFreeze();
    
    if (diagnosis.performance.isBlocked || 
        diagnosis.clickBlocking.hasBlockingElements ||
        diagnosis.styles.invisibleOverlays.length > 0) {
      console.warn('🚨 Problème UI détecté:', diagnosis);
    }
  }, 5000);
  
  return () => {
    clearInterval(monitor);
    console.log('⏹️ Arrêt du monitoring UI');
  };
}