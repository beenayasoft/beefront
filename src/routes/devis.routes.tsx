/**
 * Configuration des routes pour le module devis
 */
import React from 'react';
import { RouteObject } from 'react-router-dom';
import DevisPage from '../pages/Devis';
import DevisNew from '../pages/DevisNew';
import QuoteDetail from '../pages/QuoteDetail';
import QuoteEditor from '../pages/QuoteEditor';

/**
 * Routes pour le module devis
 */
export const devisRoutes: RouteObject[] = [
  {
    path: '/devis',
    element: <DevisPage />
  },
  {
    path: '/devis/nouveau',
    element: <DevisNew />
  },
  {
    path: '/devis/:id',
    element: <QuoteDetail />
  },
  {
    path: '/devis/:id/edit',
    element: <QuoteEditor />
  }
];

export default devisRoutes;

