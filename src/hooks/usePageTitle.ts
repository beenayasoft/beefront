/**
 * Hook pour gérer les titres dynamiques des pages
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UsePageTitleOptions {
  title?: string;
  suffix?: string;
}

/**
 * Hook pour définir le titre de la page dynamiquement
 * @param title - Titre principal de la page
 * @param suffix - Suffixe (par défaut "Beenaya")
 */
export const usePageTitle = (title?: string, suffix: string = 'Beenaya') => {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${suffix}`;
    } else {
      document.title = suffix;
    }
  }, [title, suffix]);
};

/**
 * Hook pour définir automatiquement le titre basé sur la route
 */
export const useAutoPageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Beenaya';

    // Mapping des routes vers les titres
    const routeTitles: Record<string, string> = {
      '/': 'Tableau de bord',
      '/dashboard': 'Tableau de bord',
      '/opportunities': 'Opportunités',
      '/tiers': 'Tiers',
      '/clients': 'Clients',
      '/fournisseurs': 'Fournisseurs',
      '/prospects': 'Prospects',
      '/devis': 'Devis',
      '/quotes': 'Devis',
      '/documents': 'Documents',
      '/library': 'Bibliothèque d\'ouvrages',
      '/bibliotheque': 'Bibliothèque d\'ouvrages',
      '/interventions': 'Interventions',
      '/settings': 'Paramètres',
      '/profile': 'Profil',
      '/admin': 'Administration',
      '/users': 'Utilisateurs',
      '/auth/login': 'Connexion',
      '/auth/register': 'Inscription',
    };

    // Recherche exacte
    if (routeTitles[path]) {
      title = `${routeTitles[path]} | Beenaya`;
    } else {
      // Recherche par pattern pour les routes dynamiques
      if (path.startsWith('/opportunities/')) {
        title = 'Détail opportunité | Beenaya';
      } else if (path.startsWith('/tiers/')) {
        title = 'Détail tiers | Beenaya';
      } else if (path.startsWith('/quotes/') && path.includes('/edit')) {
        title = 'Modifier devis | Beenaya';
      } else if (path.startsWith('/quotes/') && path.includes('/new')) {
        title = 'Nouveau devis | Beenaya';
      } else if (path.startsWith('/quotes/')) {
        title = 'Détail devis | Beenaya';
      } else if (path.startsWith('/library/') || path.startsWith('/bibliotheque/')) {
        // Routes de la bibliothèque
        if (path.includes('/work/')) {
          title = 'Détail ouvrage | Beenaya';
        } else if (path.includes('/material/')) {
          title = 'Détail matériau | Beenaya';
        } else if (path.includes('/labor/')) {
          title = 'Détail main d\'œuvre | Beenaya';
        } else {
          title = 'Bibliothèque d\'ouvrages | Beenaya';
        }
      } else if (path.startsWith('/interventions/')) {
        title = 'Détail intervention | Beenaya';
      } else {
        // Titre par défaut pour les routes non mappées
        title = 'Beenaya - Solution de gestion d\'entreprise';
      }
    }

    document.title = title;
  }, [location.pathname]);
};

/**
 * Utility pour obtenir le titre d'une route sans changer le titre actuel
 */
export const getRouteTitle = (path: string): string => {
  const routeTitles: Record<string, string> = {
    '/': 'Tableau de bord',
    '/dashboard': 'Tableau de bord',
    '/opportunities': 'Opportunités',
    '/tiers': 'Tiers',
    '/clients': 'Clients',
    '/fournisseurs': 'Fournisseurs',
    '/prospects': 'Prospects',
    '/devis': 'Devis',
    '/quotes': 'Devis',
    '/documents': 'Documents',
    '/library': 'Bibliothèque d\'ouvrages',
    '/bibliotheque': 'Bibliothèque d\'ouvrages',
    '/interventions': 'Interventions',
    '/settings': 'Paramètres',
    '/profile': 'Profil',
    '/admin': 'Administration',
    '/users': 'Utilisateurs',
    '/auth/login': 'Connexion',
    '/auth/register': 'Inscription',
  };

  if (routeTitles[path]) {
    return routeTitles[path];
  }

  // Patterns pour les routes dynamiques
  if (path.startsWith('/opportunities/')) {
    return 'Détail opportunité';
  } else if (path.startsWith('/tiers/')) {
    return 'Détail tiers';
  } else if (path.startsWith('/quotes/')) {
    return 'Devis';
  } else if (path.startsWith('/library/') || path.startsWith('/bibliotheque/')) {
    if (path.includes('/work/')) {
      return 'Détail ouvrage';
    } else if (path.includes('/material/')) {
      return 'Détail matériau';
    } else if (path.includes('/labor/')) {
      return 'Détail main d\'œuvre';
    } else {
      return 'Bibliothèque d\'ouvrages';
    }
  } else if (path.startsWith('/interventions/')) {
    return 'Interventions';
  }

  return 'Beenaya';
};