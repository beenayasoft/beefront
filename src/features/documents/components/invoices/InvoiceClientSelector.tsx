/**
 * InvoiceClientSelector - Composant de sélection de client pour les factures
 * Inspiré du OpportunityClientSelector avec design moderne
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, Building2, User, X, Loader2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { crmApi } from '@/features/crm/api/crm';

// Types
interface ClientSearchResult {
  id: string;
  name: string;
  type: string;
  relation: string;
  address?: string;
  email?: string;
  phone?: string;
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

export const InvoiceClientSelector: React.FC<Props> = ({
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
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // RECHERCHE CLIENT
  const { data: searchResults = [], isLoading, error: searchError } = useQuery({
    queryKey: ['invoice-client-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      console.log('🔍 Recherche client facture:', searchQuery);
      
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
        phone: client.phone
      }));
      
      console.log('📊 Résultats facture:', results.length);
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
    console.log('✅ Client facture sélectionné:', client);
    
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

  return (
    <div className="space-y-2">
      {/* LABEL */}
      <Label 
        htmlFor="client-search" 
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
              id="client-search"
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "h-11 pl-10 pr-8 bg-white/60 backdrop-blur-sm",
                error && "border-red-500 focus:border-red-500",
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
                        
                        {client.address && (
                          <div className="text-xs text-neutral-500 truncate mb-1">
                            📍 {client.address}
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
                  <p className="text-xs text-neutral-400">
                    💡 Vous pouvez créer un nouveau client dans le module CRM
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOUTON NOUVEAU CLIENT */}
        <Button 
          type="button"
          variant="outline" 
          size="sm" 
          className="h-11 px-3 flex-shrink-0"
          onClick={() => {
            // Rediriger vers la création de client
            window.open('/crm/tiers/nouveau?return=factures', '_blank');
          }}
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
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
          </div>
          
          {(selectedClientData.address || selectedClientData.email || selectedClientData.phone) && (
            <div className="mt-2 text-xs text-neutral-600 space-y-1">
              {selectedClientData.address && (
                <div>📍 {selectedClientData.address}</div>
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
    </div>
  );
};

export default InvoiceClientSelector;