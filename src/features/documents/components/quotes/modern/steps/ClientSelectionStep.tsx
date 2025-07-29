/**
 * Étape de sélection de client avec recherche intelligente et création rapide
 * Interface moderne avec Command palette et création contextuelle
 */
import React, { useState } from 'react';
import { Search, Plus, Building2, User, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';
import { useClientSearch } from '../../../../hooks/useClientSearch';
import { ClientOption } from '@/features/crm/types/crm.types';
import { ClientQuickCreateForm } from '../forms/ClientQuickCreateForm';

interface ClientSelectionStepProps {
  wizard: UseQuoteWizard;
}

export const ClientSelectionStep: React.FC<ClientSelectionStepProps> = ({ wizard }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const clientSearch = useClientSearch({
    initialClient: wizard.client,
    onClientSelect: (client) => {
      wizard.setClient(client);
      setIsCommandOpen(false);
    },
    onClientCreate: (client) => {
      wizard.setClient(client);
      setShowCreateDialog(false);
    }
  });
  
  // Formatage des informations client
  const formatClientType = (type: string) => {
    return type === 'entreprise' ? 'Entreprise' : 'Particulier';
  };
  
  const formatAddress = (address: any) => {
    if (!address) return 'Adresse non renseignée';
    return `${address.rue}, ${address.codePostal} ${address.ville}`;
  };
  
  // Gestion de la création rapide
  const handleCreateClient = async (clientData: any) => {
    try {
      console.log('🚀 Tentative création client avec données:', JSON.stringify(clientData, null, 2));
      await clientSearch.createClient(clientData);
    } catch (error: any) {
      console.error('❌ Erreur détaillée création client:', error);
      console.error('❌ Response data:', error?.response?.data);
      console.error('❌ Response status:', error?.response?.status);
      console.error('❌ Response headers:', error?.response?.headers);
    }
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
      
      {/* Recherche de client */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Popover open={isCommandOpen} onOpenChange={setIsCommandOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isCommandOpen}
                  className="w-full justify-between h-12 text-left"
                >
                  {wizard.client ? (
                    <div className="flex items-center gap-3">
                      {wizard.client.type === 'entreprise' ? (
                        <Building2 className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-green-600" />
                      )}
                      <div>
                        <span className="font-medium">{wizard.client.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({formatClientType(wizard.client.type)})
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Search className="h-4 w-4" />
                      <span>Rechercher un client...</span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              
              <PopoverContent className="w-full max-w-[600px] min-w-[320px] p-0" align="start" side="bottom" sideOffset={4}>
                <Command>
                  <CommandInput 
                    placeholder="Tapez le nom du client..."
                    value={clientSearch.query}
                    onValueChange={clientSearch.setQuery}
                  />
                  
                  <CommandList className="max-h-80">
                    <CommandEmpty className="p-4">
                      <div className="text-center space-y-3">
                        <p className="text-sm text-gray-500">
                          Aucun client trouvé pour "{clientSearch.query}"
                        </p>
                        {clientSearch.query && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setShowCreateDialog(true);
                              setIsCommandOpen(false);
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Créer le client "{clientSearch.query}"
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    
                    {clientSearch.isLoading && (
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    )}
                    
                    {clientSearch.results.length > 0 && (
                      <CommandGroup heading={`${clientSearch.results.length} client(s) trouvé(s)`}>
                        {clientSearch.results.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.id}
                            onSelect={() => clientSearch.selectClient(client)}
                            className="p-3 cursor-pointer"
                          >
                            <div className="flex items-start gap-3 w-full">
                              {client.type === 'entreprise' ? (
                                <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                              ) : (
                                <User className="h-5 w-5 text-green-600 mt-0.5" />
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {client.name}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {formatClientType(client.type)}
                                  </Badge>
                                </div>
                                
                                {client.adressePrincipale && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">
                                      {formatAddress(client.adressePrincipale)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[85vh] w-[90vw] sm:w-full mx-auto my-auto rounded-2xl border bg-white">
              <div className="max-h-[75vh] overflow-y-auto">
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                <DialogTitle>Créer un nouveau client</DialogTitle>
                <DialogDescription>
                  Remplissez les informations ci-dessous pour créer un nouveau client.
                </DialogDescription>
              </DialogHeader>
              <div className="px-6 py-4">
                <ClientQuickCreateForm
                  onSubmit={handleCreateClient}
                  onCancel={() => setShowCreateDialog(false)}
                  defaultName={clientSearch.query}
                />
              </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Client sélectionné - Affichage détaillé */}
        {wizard.client && (
          <Card className="border-green-200 bg-green-50">
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