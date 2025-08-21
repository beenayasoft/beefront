/**
 * Page de création d'un nouveau devis - Version moderne
 * Utilise le nouveau wizard avec design system cohérent
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QuoteCreateWizard from '../components/quotes/modern/QuoteCreateWizard';

interface LocationState {
  preselectedTierId?: string;
  opportunityId?: string;
  opportunityName?: string;
}

/**
 * Page de création d'un nouveau devis
 */
const DevisNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les données d'initialisation depuis la navigation
  const initialData = location.state as LocationState;
  
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
      initialData={initialData}
    />
  );
};

export default DevisNew;
