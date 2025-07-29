/**
 * Example d'utilisation de QuoteDetailCard
 * Démontre l'intégration avec les nouveaux types corrigés de la Phase 1
 */
import React from 'react';
import { QuoteDetailCard } from './QuoteDetailCard';
import { Quote, QuoteItem } from '../../types/quotes.types';

// Exemple de données de test avec les nouveaux types
const mockQuoteItems: QuoteItem[] = [
  {
    id: '1',
    type: 'material',
    position: 1,
    designation: 'Béton C25/30',
    description: 'Béton prêt à l\'emploi pour fondations',
    unit: 'm³',
    quantity: 15,
    unitPrice: 120.00,
    discount: 0,
    vatRate: '20', // ✅ String au lieu de number
    totalHt: 1800.00,
    totalTtc: 2160.00,
    reference: 'BET-C25-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    type: 'labor',
    position: 2,
    designation: 'Main d\'œuvre coffreur',
    description: 'Pose et décoffrage des fondations',
    unit: 'h',
    quantity: 24,
    unitPrice: 35.00,
    discount: 5,
    vatRate: '20', // ✅ String au lieu de number
    totalHt: 798.00,
    totalTtc: 957.60,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    type: 'work',
    position: 3,
    designation: 'Ouvrage complet - Fondations',
    description: 'Ensemble fondations avec béton et ferraillage',
    unit: 'forfait',
    quantity: 1,
    unitPrice: 3500.00,
    discount: 10,
    vatRate: '10', // ✅ Taux réduit comme string
    totalHt: 3150.00,
    totalTtc: 3465.00,
    workId: 'WORK-FOND-001',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockQuote: Quote = {
  id: 'quote-123',
  number: 'DEV-2025-021',
  // ✅ tierId supprimé - isolation automatique par schéma tenant
  clientName: 'Patricia Gomes',
  clientAddress: 'rue Poulain, 76133 Sainte Guy',
  projectName: 'Devis - Opportunité normale',
  projectAddress: 'Chantier rue Poulain',
  projectReference: 'PROJ-2025-001',
  issueDate: '2025-06-25',
  expiryDate: '2025-07-25',
  validityPeriod: 30,
  notes: 'Devis pour construction fondations',
  termsAndConditions: 'Conditions générales standard',
  status: 'draft',
  statusDisplay: 'Brouillon',
  opportunityId: 'opp-456',
  margin: 15,
  totalHt: 5748.00,
  totalVat: 1062.60,
  totalTtc: 6810.60,
  itemsCount: 3,
  items: mockQuoteItems,
  createdAt: '2025-06-25T00:00:00Z',
  updatedAt: '2025-06-25T00:00:00Z',
  createdBy: 'elvisiex@live.fr'
};

/**
 * Composant d'exemple
 */
export const QuoteDetailCardExample: React.FC = () => {
  const handleBack = () => {
    console.log('Retour à la liste');
  };

  const handleEdit = () => {
    console.log('Éditer le devis');
  };

  const handleSend = () => {
    console.log('Envoyer le devis');
  };

  const handleDuplicate = () => {
    console.log('Dupliquer le devis');
  };

  const handleDownloadPdf = () => {
    console.log('Télécharger PDF');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <QuoteDetailCard
        quote={mockQuote}
        onBack={handleBack}
        onEdit={handleEdit}
        onSend={handleSend}
        onDuplicate={handleDuplicate}
        onDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
};

export default QuoteDetailCardExample;