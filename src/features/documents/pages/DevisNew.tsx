/**
 * Page de création d'un nouveau devis - Version moderne
 * Utilise le nouveau wizard avec design system cohérent
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuoteCreateWizard from '../components/quotes/modern/QuoteCreateWizard';

/**
 * Page de création d'un nouveau devis
 */
const DevisNew: React.FC = () => {
  const navigate = useNavigate();
  
  // Gérer la création réussie du devis
  const handleQuoteCreated = (quoteId: string) => {
    navigate(`/devis/${quoteId}`);
  };
  
  // Gérer l'annulation
  const handleCancel = () => {
    navigate('/devis');
  };
  
  return (
    <QuoteCreateWizard
      onQuoteCreated={handleQuoteCreated}
      onCancel={handleCancel}
    />
  );
};

export default DevisNew;
