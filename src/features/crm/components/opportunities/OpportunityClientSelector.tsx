/**
 * OpportunityClientSelector - Composant de sélection de client REFACTORISÉ
 * 
 * NOUVELLE ARCHITECTURE :
 * - Input natif avec dropdown absolu (pas de Popover/Portal)
 * - État local minimal (3 variables)
 * - Compatible modal/dialog natif
 * - Focus management HTML standard
 * - Performance optimisée
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Building2, User, X, Loader2, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { crmApi } from '@/features/crm/api/crm';
import { ClientQuickCreateForm } from '@/features/documents/components/quotes/modern/forms/ClientQuickCreateForm';
import { useQueryClient } from '@tanstack/react-query';

// Types simplifiés
interface ClientSearchResult {
  id: string;
  name: string;
  type: string;
  relation: string;
  adressePrincipale?: {
    rue: string;
    ville: string;
    code_postal: string;
  };
}

interface Props {
  value?: string;
  onValueChange: (clientId: string) => void;
  selectedClientData?: ClientSearchResult | null;
  onSelectedClientChange?: (client: ClientSearchResult | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export const OpportunityClientSelector: React.FC<Props> = ({
  value,
  onValueChange,
  selectedClientData,
  onSelectedClientChange,
  placeholder = "Rechercher un client/prospect...",
  disabled = false,
  className,
  error = false
}) => {
  // ÉTAT LOCAL MINIMAL (3 variables seulement)
  const [searchQuery, setSearchQuery] = useState(selectedClientData?.name || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Refs pour gestion DOM
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // RECHERCHE CLIENT - React Query direct, sans sur-couche
  const { data: searchResults = [], isLoading, error: searchError } = useQuery({
    queryKey: ['client-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      console.log('🔍 Recherche client:', searchQuery);
      
      const clients = await crmApi.tiers.getClients(searchQuery, {
        page_size: 20
      });
      
      // Transformation minimale des données
      const results: ClientSearchResult[] = clients.map(client => ({
        id: client.id,
        name: client.name,
        type: client.type,
        relation: client.relation,
        adressePrincipale: client.adressePrincipale
      }));
      
      console.log('📊 Résultats:', results.length);
      return results;
    },
    enabled: Boolean(searchQuery && searchQuery.length >= 2),
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // GESTIONNAIRES D'ÉVÉNEMENTS
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      // Clear selection si on efface la recherche
      onSelectedClientChange?.(null);
      onValueChange('');
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
    }
  }, [onSelectedClientChange, onValueChange]);

  const handleClientSelect = useCallback((client: ClientSearchResult) => {
    console.log('✅ Client sélectionné:', client);
    
    // Mise à jour état local
    setSearchQuery(client.name);
    setIsDropdownOpen(false);
    
    // Callbacks parent
    onValueChange(client.id);
    onSelectedClientChange?.(client);
  }, [onValueChange, onSelectedClientChange]);

  const handleClearSelection = useCallback(() => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    onSelectedClientChange?.(null);
    onValueChange('');
    inputRef.current?.focus();
  }, [onSelectedClientChange, onValueChange]);

  const handleCreateClient = useCallback(async (clientData: any) => {
    try {
      console.log('🚀 Création nouveau client:', clientData);
      
      const newTier = await crmApi.tiers.createTier(clientData);
      
      // Invalider cache
      queryClient.invalidateQueries({ queryKey: ['client-search'] });
      
      // Auto-select nouveau client
      const newClient: ClientSearchResult = {
        id: newTier.id,
        name: newTier.nom,
        type: newTier.type,
        relation: newTier.relation,
        adressePrincipale: newTier.adresses?.[0]
      };
      
      handleClientSelect(newClient);
      setShowCreateDialog(false);
      
    } catch (error) {
      console.error('❌ Erreur création client:', error);
      throw error;
    }
  }, [queryClient, handleClientSelect]);

  // FERMETURE DROPDOWN AU CLIC EXTÉRIEUR
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // SYNCHRONISATION AVEC PROPS EXTERNES
  useEffect(() => {
    if (selectedClientData) {
      // Toujours afficher le nom du client sélectionné
      setSearchQuery(selectedClientData.name);
      // Fermer le dropdown si le composant est désactivé
      if (disabled) {
        setIsDropdownOpen(false);
      }
    }
  }, [selectedClientData, disabled]);

  // HELPERS D'AFFICHAGE
  const formatClientType = (type: string) => type === 'entreprise' ? 'Entreprise' : 'Particulier';
  const formatRelation = (relation: string) => relation === 'client' ? 'Client' : 'Prospect';
  const formatAddress = (address?: ClientSearchResult['adressePrincipale']) => {
    return address ? `${address.rue}, ${address.code_postal} ${address.ville}` : null;
  };

  return (
    <div className="space-y-2">
      {/* INFO CLIENT PRÉSÉLECTIONNÉ */}
      {disabled && selectedClientData && (
        <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {selectedClientData.type === 'entreprise' ? (
                <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
              ) : (
                <User className="h-4 w-4 text-green-600 flex-shrink-0" />
              )}
              <span className="font-medium text-emerald-800 truncate">
                {selectedClientData.name}
              </span>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                {formatClientType(selectedClientData.type)}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
                {formatRelation(selectedClientData.relation)}
              </Badge>
            </div>
            {selectedClientData.adressePrincipale && (
              <p className="text-xs text-emerald-600 mt-1 truncate">
                📍 {formatAddress(selectedClientData.adressePrincipale)}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* CONTENEUR PRINCIPAL */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        
        {/* INPUT DE RECHERCHE */}
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={disabled ? (selectedClientData ? selectedClientData.name : "Client sélectionné") : placeholder}
              disabled={disabled}
              readOnly={disabled}
              className={cn(
                "h-11 pl-10 pr-8 Beenaya-input",
                error && "border-red-500",
                disabled && "bg-gray-50 text-gray-700 cursor-not-allowed",
                className
              )}
              onFocus={() => {
                if (!disabled && searchQuery && searchQuery.length >= 2) {
                  setIsDropdownOpen(true);
                }
              }}
            />
            
            {/* ICÔNES INPUT */}
            {disabled && selectedClientData ? (
              <Check className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-600" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            
            {searchQuery && !disabled && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* DROPDOWN RÉSULTATS - ABSOLU, PAS DE PORTAL */}
          {isDropdownOpen && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 sm:max-h-80 overflow-y-auto"
            >
              {/* LOADING STATE */}
              {isLoading && (
                <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recherche en cours...
                </div>
              )}

              {/* ERROR STATE */}
              {searchError && (
                <div className="p-4 text-center text-sm text-red-600">
                  ⚠️ Erreur de connexion. Réessayez.
                </div>
              )}

              {/* RÉSULTATS */}
              {!isLoading && searchResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                    {searchResults.length} résultat(s) trouvé(s)
                  </div>
                  
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full p-2 sm:p-3 hover:bg-gray-50 flex items-start gap-2 sm:gap-3 text-left transition-colors"
                    >
                      {/* ICÔNE TYPE CLIENT */}
                      {client.type === 'entreprise' ? (
                        <Building2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <User className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      
                      {/* INFOS CLIENT */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{client.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatClientType(client.type)}
                          </Badge>
                          <Badge 
                            variant={client.relation === 'client' ? 'default' : 'outline'} 
                            className="text-xs"
                          >
                            {formatRelation(client.relation)}
                          </Badge>
                        </div>
                        
                        {client.adressePrincipale && (
                          <div className="text-xs text-muted-foreground truncate">
                            📍 {formatAddress(client.adressePrincipale)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* AUCUN RÉSULTAT */}
              {!isLoading && !searchError && searchResults.length === 0 && searchQuery && searchQuery.length >= 2 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Aucun client trouvé pour "{searchQuery}"
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowCreateDialog(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le client "{searchQuery}"
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOUTON CRÉATION RAPIDE */}
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="h-11 sm:w-11 flex-shrink-0 px-4 sm:px-0 justify-center"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
          <span className="ml-2 sm:hidden">Nouveau client</span>
        </Button>
      </div>

      {/* TEXTE D'AIDE */}
      <p className="text-xs text-muted-foreground">
        💡 Tapez au moins 2 caractères pour rechercher ou cliquez sur "+" pour créer un nouveau client
      </p>

      {/* DIALOG CRÉATION CLIENT */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                defaultName={searchQuery}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunityClientSelector;