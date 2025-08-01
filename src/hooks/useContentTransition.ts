import { useEffect, useState } from 'react';

interface UseContentTransitionProps {
  isLoading: boolean;
  delay?: number;
}

export function useContentTransition({ isLoading, delay = 200 }: UseContentTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (!isLoading) {
      // Délai léger pour laisser le skeleton visible un moment
      const timer = setTimeout(() => {
        setShouldRender(false);
        // Puis déclencher l'animation d'entrée du contenu
        setTimeout(() => setIsVisible(true), 50);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setShouldRender(true);
    }
  }, [isLoading, delay]);

  return {
    shouldShowSkeleton: shouldRender,
    contentClassName: `content-transition ${isVisible ? 'content-enter-active' : 'content-enter'}`
  };
}
