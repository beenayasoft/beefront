/**
 * Étape client pour l'édition de devis
 * Affiche les informations client existantes sans recherche
 */
import React from 'react';
import { User, Building2, MapPin, Edit } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';
import { Quote } from '../../../types/quotes.types';

interface EditClientStepProps {
  wizard: UseQuoteWizard;
  quote: Quote;
}

export const EditClientStep: React.FC<EditClientStepProps> = ({ wizard, quote }) => {
  return (
    <div className="space-y-6">
      {/* Information sur le mode édition */}
      <Alert>
        <Edit className="h-4 w-4" />
        <AlertDescription>
          En mode édition, les informations client sont fixées et proviennent du devis existant.
        </AlertDescription>
      </Alert>

      {/* Informations client du devis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informations client
            <Badge variant="secondary">Devis #{quote.number}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nom/Entreprise */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {quote.clientName || 'Client non spécifié'}
              </div>
              <div className="text-sm text-gray-500">
                Nom du client ou entreprise
              </div>
            </div>
          </div>

          {/* Adresse */}
          {quote.clientAddress && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-gray-900">
                  {quote.clientAddress}
                </div>
                <div className="text-sm text-gray-500">
                  Adresse du client
                </div>
              </div>
            </div>
          )}

          {/* Informations supplémentaires */}
          {quote.clientInfo && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700 mb-1">
                Informations complémentaires
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                {quote.clientInfo.name && (
                  <div><strong>Nom :</strong> {quote.clientInfo.name}</div>
                )}
                {quote.clientInfo.email && (
                  <div><strong>Email :</strong> {quote.clientInfo.email}</div>
                )}
                {quote.clientInfo.phone && (
                  <div><strong>Téléphone :</strong> {quote.clientInfo.phone}</div>
                )}
                {quote.clientInfo.contactName && (
                  <div><strong>Contact :</strong> {quote.clientInfo.contactName}</div>
                )}
                {quote.clientInfo.address && quote.clientInfo.address !== quote.clientAddress && (
                  <div><strong>Adresse :</strong> {quote.clientInfo.address}</div>
                )}
              </div>
            </div>
          )}

          {/* Note d'information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <strong>Note :</strong> Pour modifier les informations client, vous pouvez utiliser 
              l'étape "Projet" qui permet d'ajuster les détails du client et du projet.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClientStep;