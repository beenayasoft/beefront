/**
 * Module de gestion des devis
 * Exporte tous les composants, pages et services liés aux devis
 */

// API et types
export { default as quotesApi } from ../../lib/api/quotes';
export * from '../../lib/api/types/quotes.types';

// Composants
export { default as QuoteStats } from ../../components/quotes/QuoteStats';
export { default as QuoteFilters } from ../../components/quotes/QuoteFilters';
export { default as QuoteList } from ../../components/quotes/QuoteList';
export { default as QuoteForm } from ../../components/quotes/QuoteForm';

// Pages
export { default as DevisPage } from ../../pages/Devis';
export { default as DevisNew } from ../../pages/DevisNew';
export { default as QuoteDetail } from ../../pages/QuoteDetail';
export { default as QuoteEditor } from ../../pages/QuoteEditor';

// Routes
export { default as devisRoutes } from ../../routes/devis.routes';

