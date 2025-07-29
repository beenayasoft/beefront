// Composants principaux de liste et affichage
export { QuoteStats } from './QuoteStats';
export { QuoteFilters } from './QuoteFilters';
export { QuoteList } from './QuoteList';
export { default as QuotePreviewComponent } from './QuotePreview';
export { default as QuoteForm } from './QuoteForm';

// Composants d'édition (déjà existants dans /editor)
export * from './editor';

// Composants de liste (déjà existants dans /list)
export * from './list';

// Composants de la bibliothèque (déjà existants dans /library)
export * from './library';

// Composants de modals
export { ConvertToInvoiceModal } from './ConvertToInvoiceModal';
export { ValidateQuoteModal } from './ValidateQuoteModal';
export { SendQuoteModal } from './SendQuoteModal';

// PHASE 1 - Nouveaux composants de la fiche devis (types corrigés)
export { QuoteDetailCard } from './QuoteDetailCard';
export { QuoteItemsTable } from './QuoteItemsTable';
export { QuoteStatusBadge } from './QuoteStatusBadge';
export { QuoteActions } from './QuoteActions';

// PHASE 2 - Composants de gestion avancée des éléments
export { QuoteItemsList } from './QuoteItemsList';
export { QuoteItemForm } from './QuoteItemForm';
export { BulkItemOperations } from './BulkItemOperations';
export { QuoteEditor as QuoteEditorComponent } from './QuoteEditor'; 