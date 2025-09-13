/**
 * Page des paramètres de documents
 * Intègre la configuration d'apparence dans l'interface des settings
 */
import React from 'react';
import { DocumentAppearanceSettings } from '../components/DocumentAppearanceSettings';

export const DocumentSettings: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <DocumentAppearanceSettings />
    </div>
  );
};

export default DocumentSettings;