/**
 * QuoteClientSelector - Composant de sélection de client pour les devis
 * Basé sur InvoiceClientSelector avec design cohérent
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Building2, User, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { crmApi } from '@/features/crm/api/crm';
import { ClientQuickCreateForm } from './modern/forms/ClientQuickCreateForm';
import { useQueryClient } from '@tanstack/react-query';

// Types
interface ClientSearchResult {
  id: string;
  name: string;
  type: string;
  relation: string;
  address?: string;
  email?: string;
  phone?: string;
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
  required?: boolean;
}

export const QuoteClientSelector: React.FC<Props> = ({
  value,
  onValueChange,
  selectedClientData,
  onSelectedClientChange,
  placeholder = "Rechercher un client...",
  disabled = false,
  className,
  error = false,
  required = false
}) => {
  // ÉTAT LOCAL
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // RECHERCHE CLIENT
  const { data: searchResults = [], isLoading, error: searchError } = useQuery({
    queryKey: ['quote-client-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      console.log('🔍 Recherche client devis:', searchQuery);
      
      const clients = await crmApi.tiers.getClients(searchQuery, {
        page_size: 20
      });
      
      // Transformation des données
      const results: ClientSearchResult[] = clients.map(client => ({
        id: client.id,
        name: client.name,
        type: client.type,
        relation: client.relation,
        address: client.address,
        email: client.email,
        phone: client.phone,
        adressePrincipale: client.adressePrincipale
      }));
      
      console.log('📊 Résultats devis:', results.length);
      return results;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // GESTIONNAIRES
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      onSelectedClientChange?.(null);
      onValueChange('');
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
    }
  }, [onSelectedClientChange, onValueChange]);

  const handleClientSelect = useCallback((client: ClientSearchResult) => {
    console.log('✅ Client devis sélectionné:', client);
    
    setSearchQuery(client.name);
    setIsDropdownOpen(false);
    
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
      console.log('🚀 Création nouveau client devis:', clientData);
      
      const newTier = await crmApi.tiers.createTier(clientData);
      
      // Invalider cache
      queryClient.invalidateQueries({ queryKey: ['quote-client-search'] });
      
      // Auto-select nouveau client
      const newClient: ClientSearchResult = {
        id: newTier.id,
        name: newTier.nom,
        type: newTier.type,
        relation: newTier.relation,
        address: newTier.adresses?.[0] ? 
          `${newTier.adresses[0].rue}, ${newTier.adresses[0].code_postal} ${newTier.adresses[0].ville}` : 
          undefined,
        adressePrincipale: newTier.adresses?.[0]
      };
      
      handleClientSelect(newClient);
      setShowCreateDialog(false);
      
    } catch (error) {
      console.error('❌ Erreur création client devis:', error);
      throw error;
    }
  }, [queryClient, handleClientSelect]);

  // FERMETURE DROPDOWN
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

  // SYNCHRONISATION
  useEffect(() => {
    if (selectedClientData && !searchQuery) {
      setSearchQuery(selectedClientData.name);
    }
  }, [selectedClientData, searchQuery]);

  // HELPERS
  const formatClientType = (type: string) => type === 'entreprise' ? 'Entreprise' : 'Particulier';
  const formatRelation = (relation: string) => relation === 'client' ? 'Client' : 'Prospect';
  const formatAddress = (client: ClientSearchResult) => {
    if (client.adressePrincipale) {
      return `${client.adressePrincipale.rue}, ${client.adressePrincipale.code_postal} ${client.adressePrincipale.ville}`;
    }
    return client.address;
  };

  return (
    <div className="space-y-2">
      {/* LABEL */}
      <Label 
        htmlFor="quote-client-search" 
        className={cn(
          "text-sm font-medium",
          error ? "text-red-600" : "text-neutral-700"
        )}
      >
        Client/Prospect {required && <span className="text-red-500">*</span>}
      </Label>

      {/* CONTENEUR PRINCIPAL */}
      <div className="flex items-center gap-2">
        
        {/* INPUT DE RECHERCHE */}
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              id="quote-client-search"
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "h-11 pl-10 pr-8 bg-white/60 backdrop-blur-sm",
                error && "border-red-500 focus:border-red-500",
                selectedClientData && "border-green-500/50 bg-green-50/50",
                className
              )}
              onFocus={() => {
                if (searchQuery.length >= 2) {
                  setIsDropdownOpen(true);
                }
              }}
            />
            
            {/* ICÔNES */}
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            
            {selectedClientData && (
              <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
            )}
            
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3 text-neutral-400" />
              </button>
            )}
          </div>

          {/* DROPDOWN RÉSULTATS */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {/* LOADING */}
              {isLoading && (
                <div className="p-4 flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recherche en cours...
                </div>
              )}

              {/* ERROR */}
              {searchError && (
                <div className="p-4 text-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                  Erreur de connexion. Réessayez.
                </div>
              )}

              {/* RÉSULTATS */}
              {!isLoading && searchResults.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-neutral-500 border-b bg-gray-50">
                    {searchResults.length} client(s) trouvé(s)
                  </div>
                  
                  {searchResults.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => handleClientSelect(client)}
                      className="w-full p-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors border-b last:border-b-0"
                    >
                      {/* ICÔNE TYPE */}
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
                        
                        {formatAddress(client) && (
                          <div className="text-xs text-neutral-500 truncate mb-1">
                            📍 {formatAddress(client)}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                          {client.email && (
                            <span>📧 {client.email}</span>
                          )}
                          {client.phone && (
                            <span>📞 {client.phone}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* AUCUN RÉSULTAT */}
              {!isLoading && !searchError && searchResults.length === 0 && searchQuery.length >= 2 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-neutral-500 mb-3">
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
          className="h-11 px-3 flex-shrink-0"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled}
          title="Créer un nouveau client"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* MESSAGE D'ERREUR */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="w-3 h-3" />
          Le client est requis
        </div>
      )}

      {/* AIDE */}
      <p className="text-xs text-neutral-500">
        💡 Tapez au moins 2 caractères pour rechercher un client ou prospect
      </p>

      {/* CLIENT SÉLECTIONNÉ */}
      {selectedClientData && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {selectedClientData.type === 'entreprise' ? (
              <Building2 className="h-4 w-4 text-blue-600" />
            ) : (
              <User className="h-4 w-4 text-green-600" />
            )}
            <span className="font-medium text-sm">{selectedClientData.name}</span>
            <Badge variant="secondary" className="text-xs">
              {formatClientType(selectedClientData.type)}
            </Badge>
            <Badge 
              variant={selectedClientData.relation === 'client' ? 'default' : 'outline'} 
              className="text-xs"
            >
              {formatRelation(selectedClientData.relation)}
            </Badge>
            <Check className="h-4 w-4 text-green-600 ml-auto" />
          </div>
          
          {(formatAddress(selectedClientData) || selectedClientData.email || selectedClientData.phone) && (
            <div className="text-xs text-neutral-600 space-y-1">
              {formatAddress(selectedClientData) && (
                <div>📍 {formatAddress(selectedClientData)}</div>
              )}
              {selectedClientData.email && (
                <div>📧 {selectedClientData.email}</div>
              )}
              {selectedClientData.phone && (
                <div>📞 {selectedClientData.phone}</div>
              )}
            </div>
          )}
        </div>
      )}

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

export default QuoteClientSelector;