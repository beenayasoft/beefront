/**
 * Étape de sélection de client avec recherche intelligente et création rapide
 * Interface moderne avec Command palette et création contextuelle
 */
import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, User, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';
import { QuoteClientSelector } from '../../QuoteClientSelector';
import { crmApi } from '@/features/crm/api/crm';

interface ClientSelectionStepProps {
  wizard: UseQuoteWizard;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({ wizard }) => {
  
  // Pré-sélection automatique du client si fourni dans les données initiales
  useEffect(() => {
    const preselectedTierId = wizard.initialData?.preselectedTierId;
    
    if (preselectedTierId && !wizard.client) {
      console.log('🔍 Auto-sélection du client depuis les données initiales:', preselectedTierId);
      
      // Récupérer les détails du client
      crmApi.tiers.getTierDetails(preselectedTierId)
        .then(tierDetails => {
          // Convertir les données du tiers en format ClientOption
          const clientOption = {
            id: tierDetails.id,
            name: tierDetails.nom,
            type: tierDetails.type,
            relation: tierDetails.relation,
            address: tierDetails.adressePrincipale ? 
              `${tierDetails.adressePrincipale.rue}, ${tierDetails.adressePrincipale.code_postal} ${tierDetails.adressePrincipale.ville}` : 
              undefined,
            email: tierDetails.email,
            phone: tierDetails.telephone
          };
          
          console.log('✅ Client récupéré automatiquement:', clientOption.name);
          wizard.setClient(clientOption);
        })
        .catch(error => {
          console.error('❌ Erreur lors de la récupération du client pré-sélectionné:', error);
        });
    }
  }, [wizard.initialData?.preselectedTierId, wizard.client, wizard.setClient]);
  
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
          Sélectionnez un client existant ou créez-en un nouveau pour commencer votre devis.
        </AlertDescription>
      </Alert>
      
      {/* Sélecteur de client moderne */}
      <div className="space-y-4">
        <QuoteClientSelector
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
          placeholder="Rechercher un client ou prospect..."
          required
        />
        
        {/* Client sélectionné - Affichage détaillé */}
        {wizard.client && (
          <Card className="border-green-200 bg-green-50 mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {wizard.client.type === 'entreprise' ? (
                    <Building2 className="h-5 w-5 text-blue-600" />
                  ) : (
                    <User className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{wizard.client.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {formatClientType(wizard.client.type)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/tiers/${wizard.client?.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => wizard.setClient(null)}
                  >
                    Changer
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Adresse */}
                {wizard.client.adressePrincipale && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <MapPin className="h-4 w-4" />
                      Adresse principale
                    </div>
                    <p className="text-sm text-gray-600 pl-6">
                      {formatAddress(wizard.client.adressePrincipale)}
                    </p>
                  </div>
                )}
                
                {/* Informations de contact (si disponibles) */}
                {wizard.client.email && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                    <p className="text-sm text-gray-600 pl-6">
                      {wizard.client.email}
                    </p>
                  </div>
                )}
                
                {wizard.client.telephone && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </div>
                    <p className="text-sm text-gray-600 pl-6">
                      {wizard.client.telephone}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Aide contextuelle */}
      {!wizard.client && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Search className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">
                  Comment sélectionner un client ?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tapez le nom de votre client dans la barre de recherche</li>
                  <li>• Sélectionnez-le dans la liste des résultats</li>
                  <li>• Ou créez un nouveau client avec le bouton "+"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Validation */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {wizard.isValid.client ? (
            <>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">
                Client sélectionné
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-600">
                Sélectionnez un client pour continuer
              </span>
            </>
          )}
        </div>
        
        {wizard.isValid.client && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✓ Étape validée
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ClientSelectionStep;