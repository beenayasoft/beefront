/**
 * Étape de sélection de client pour les factures
 * Réutilise la logique des devis avec adaptation
 */
import React from 'react';
import { Search, Plus, Building2, User, MapPin, Phone, Mail } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseInvoiceWizard } from '../../../hooks/useInvoiceWizard';
import { InvoiceClientSelector } from '../../InvoiceClientSelector';

interface ClientSelectionStepProps {
  wizard: UseInvoiceWizard;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({ wizard }) => {
  
  // Formatage des informations client
  const formatClientType = (type: string) => {
    return type === 'entreprise' ? 'Entreprise' : 'Particulier';
  };
  
  const formatAddress = (address: any) => {
    if (!address) return 'Adresse non renseignée';
    return `${address.rue}, ${address.codePostal} ${address.ville}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Search className="h-4 w-4" />
        <AlertDescription>
          Sélectionnez un client existant ou créez-en un nouveau pour votre facture.
        </AlertDescription>
      </Alert>
      
      {/* Sélecteur de client */}
      <div className="space-y-4">
        <InvoiceClientSelector
          value={wizard.client?.id || ""}
          onValueChange={(clientId) => {
            // Géré par onSelectedClientChange
          }}
          selectedClientData={wizard.client ? {
            id: wizard.client.id,
            name: wizard.client.name,
            type: wizard.client.type,
            relation: wizard.client.relation || 'client',
            address: wizard.client.adressePrincipale ? 
              `${wizard.client.adressePrincipale.rue}, ${wizard.client.adressePrincipale.codePostal} ${wizard.client.adressePrincipale.ville}` : 
              undefined,
            email: wizard.client.email,
            phone: wizard.client.telephone,
            adressePrincipale: wizard.client.adressePrincipale
          } : null}
          onSelectedClientChange={(client) => {
            if (client) {
              // Adapter le format du client pour le wizard
              const adaptedClient = {
                id: client.id,
                name: client.name,
                type: client.type,
                relation: client.relation,
                email: client.email,
                telephone: client.phone,
                adressePrincipale: client.adressePrincipale
              };
              wizard.setClient(adaptedClient);
            } else {
              wizard.setClient(null);
            }
          }}
          placeholder="Rechercher un client..."
          required
        />
      </div>
      
      {/* Aperçu du client sélectionné */}
      {wizard.client && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {wizard.client.type === 'entreprise' ? (
                <Building2 className="h-5 w-5 text-blue-600" />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
              {wizard.client.name}
              <Badge variant="secondary" className="text-xs">
                {formatClientType(wizard.client.type)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {wizard.client.adressePrincipale && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium">Adresse</div>
                    <div className="text-gray-600">
                      {formatAddress(wizard.client.adressePrincipale)}
                    </div>
                  </div>
                </div>
              )}
              
              {wizard.client.telephone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">Téléphone</div>
                    <div className="text-gray-600">{wizard.client.telephone}</div>
                  </div>
                </div>
              )}
              
              {wizard.client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-gray-600">{wizard.client.email}</div>
                  </div>
                </div>
              )}
            </div>
            
            {(!wizard.client.adressePrincipale || !wizard.client.telephone || !wizard.client.email) && (
              <Alert className="mt-4">
                <AlertDescription className="text-sm">
                  💡 Certaines informations client sont manquantes. Vous pourrez les compléter plus tard.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* État de validation */}
      {!wizard.client && (
        <Alert>
          <AlertDescription>
            ⚠️ Veuillez sélectionner un client pour continuer.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};