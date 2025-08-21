/**
 * Page de création de factures avec wizard moderne
 * Similaire à la création de devis
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';

import InvoiceCreateWizard from '../components/invoices/modern/InvoiceCreateWizard';

const InvoiceCreate: React.FC = () => {
  const navigate = useNavigate();
  
  const handleInvoiceCreated = (invoiceId: string) => {
    // Rediriger vers la page de détail/édition de la facture
    navigate(`/factures/${invoiceId}`);
  };
  
  const handleCancel = () => {
    // Retour à la liste des factures
    navigate('/factures');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceCreateWizard
        onInvoiceCreated={handleInvoiceCreated}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default InvoiceCreate;