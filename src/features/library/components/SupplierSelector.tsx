/**
 * Composant SupplierSelector - Sélecteur de fournisseur avec intégration CRM
 * Utilise les contrats de données pour une intégration typée et fiable
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown, Search, Building, AlertCircle, Loader2, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { useSupplierIntegration, useSupplierDetails } from '../hooks/useSupplierIntegration';
import {
  SupplierSelectorProps,
  CRMSupplierSummary,
  SUPPLIER_DEFAULTS,
  formatSupplierDisplay
} from '../types/supplier-contracts';
import { SupplierQuickCreateForm } from './SupplierQuickCreateForm';
import { crmApi } from '@/features/crm/api/crm';
import { useQueryClient } from '@tanstack/react-query';

export function SupplierSelector({
  value,
  onChange,
  placeholder = "Sélectionner un fournisseur...",
  disabled = false,
  required = false,
  className
}: SupplierSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  const {
    suppliers,
    loading,
    error,
    searchSuppliers,
    getSupplierDetails,
    sortSuppliersByRelevance
  } = useSupplierIntegration();

  // Fournisseur sélectionné actuel
  const selectedSupplier = useMemo(() => {
    return (suppliers || []).find(s => s.id === value) || null;
  }, [suppliers, value]);

  // Fournisseurs triés par pertinence
  const sortedSuppliers = useMemo(() => {
    const suppliersList = suppliers || [];
    if (!searchQuery || suppliersList.length === 0) return suppliersList;
    return sortSuppliersByRelevance(suppliersList);
  }, [suppliers, sortSuppliersByRelevance, searchQuery]);

  // Gestion de la recherche avec debounce
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query) {
      // Clear selection si on efface la recherche
      onChange(null);
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
      if (query.length >= SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH) {
        try {
          searchSuppliers(query);
        } catch (error) {
          console.error('Search failed:', error);
        }
      }
    }
  }, [onChange, searchSuppliers]);

  // Gestion de la sélection
  const handleSupplierSelect = useCallback(async (supplierId: string) => {
    const supplier = (suppliers || []).find(s => s.id === supplierId);
    if (supplier) {
      console.log('✅ Fournisseur sélectionné:', supplier);
      
      // Mise à jour état local
      setSearchQuery(supplier.nom);
      setIsDropdownOpen(false);
      
      // Pour l'instant, utiliser directement les données de recherche
      // TODO: Réactiver la récupération des détails une fois l'API /api/suppliers/ configurée
      onChange(supplierId, supplier);
      
      /* 
      // Récupérer les détails complets si nécessaire (désactivé temporairement)
      try {
        const fullDetails = await getSupplierDetails(supplierId);
        onChange(supplierId, fullDetails ? {
          id: fullDetails.id,
          nom: fullDetails.nom,
          siret: fullDetails.siret,
          numero_tva: fullDetails.numero_tva,
          email: fullDetails.email,
          telephone: fullDetails.telephone,
          relation: fullDetails.relation
        } : supplier);
      } catch (error) {
        // Fallback sur les données de recherche
        onChange(supplierId, supplier);
      }
      */
    }
  }, [suppliers, getSupplierDetails, onChange]);

  // Gestion de la déselection
  const handleClearSelection = useCallback(() => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    onChange(null);
    inputRef.current?.focus();
  }, [onChange]);

  // Gestion de la création de fournisseur
  const handleCreateSupplier = useCallback(async (supplierData: any) => {
    try {
      console.log('🚀 Création nouveau fournisseur:', supplierData);
      
      // Transformer les données pour l'API CRM
      const tierData = {
        nom: supplierData.nom,
        type: 'entreprise',
        relation: 'fournisseur',
        siret: supplierData.siret,
        numero_tva: supplierData.numero_tva,
        email: supplierData.email,
        telephone: supplierData.telephone,
        site_web: supplierData.site_web,
        notes: supplierData.notes,
        adresses: [{
          type: 'principale',
          rue: supplierData.adresse.rue,
          ville: supplierData.adresse.ville,
          code_postal: supplierData.adresse.code_postal,
          pays: supplierData.adresse.pays,
          est_principale: true
        }]
      };
      
      const newTier = await crmApi.tiers.createTier(tierData);
      
      // Invalider le cache des recherches
      queryClient.invalidateQueries({ queryKey: ['supplier-search'] });
      
      // Auto-sélectionner le nouveau fournisseur
      const newSupplier: CRMSupplierSummary = {
        id: newTier.id,
        nom: newTier.nom,
        siret: newTier.siret || '',
        numero_tva: newTier.numero_tva || '',
        email: newTier.email || '',
        telephone: newTier.telephone || '',
        relation: 'fournisseur'
      };
      
      // Mise à jour état local et callbacks directement
      setSearchQuery(newSupplier.nom);
      setIsDropdownOpen(false);
      onChange(newSupplier.id, newSupplier);
      setShowCreateDialog(false);
      
    } catch (error) {
      console.error('❌ Erreur création fournisseur:', error);
      throw error;
    }
  }, [queryClient, onChange]);

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

  // Hook pour récupérer les détails du fournisseur si on a un ID mais pas de données
  const { data: supplierDetails, isLoading: loadingDetails } = useSupplierDetails(
    value && !selectedSupplier ? value : null
  );

  // SYNCHRONISATION AVEC PROPS EXTERNES
  useEffect(() => {
    if (selectedSupplier && !searchQuery) {
      setSearchQuery(selectedSupplier.nom);
    } else if (supplierDetails && !searchQuery) {
      // Si on a récupéré les détails via l'ID, initialiser le nom
      setSearchQuery(supplierDetails.nom);
    }
  }, [selectedSupplier, supplierDetails, searchQuery]);

  return (
    <div className="space-y-2">
      {/* CONTENEUR PRINCIPAL */}
      <div className="flex items-center gap-2">
        
        {/* INPUT DE RECHERCHE */}
        <div className="flex-1 relative">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "h-11 pl-10 pr-8 Beenaya-input",
                className
              )}
              onFocus={() => {
                if (searchQuery.length >= 2) {
                  setIsDropdownOpen(true);
                }
              }}
            />
            
            {/* ICÔNES INPUT */}
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            {searchQuery && (
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
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
            >
              {/* LOADING STATE */}
              {(loading || loadingDetails) && (
                <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {loadingDetails ? 'Chargement du fournisseur...' : 'Recherche en cours...'}
                </div>
              )}

              {/* ERROR STATE */}
              {error && (
                <div className="p-4 text-center text-sm text-red-600">
                  ⚠️ Erreur de connexion. Réessayez.
                </div>
              )}

              {/* RÉSULTATS */}
              {!loading && sortedSuppliers.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                    {sortedSuppliers.length} résultat(s) trouvé(s)
                  </div>
                  
                  {sortedSuppliers.map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      onClick={() => handleSupplierSelect(supplier.id)}
                      className="w-full p-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
                    >
                      {/* ICÔNE FOURNISSEUR */}
                      <Building className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      
                      {/* INFOS FOURNISSEUR */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{supplier.nom}</span>
                          <Badge variant="default" className="text-xs">
                            Fournisseur
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {supplier.siret && (
                            <span className="truncate">
                              📍 SIRET: {supplier.siret}
                            </span>
                          )}
                          {supplier.email && (
                            <Badge variant="outline" className="text-xs">
                              Email
                            </Badge>
                          )}
                          {supplier.telephone && (
                            <Badge variant="outline" className="text-xs">
                              Tél
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* AUCUN RÉSULTAT */}
              {!loading && !error && sortedSuppliers.length === 0 && searchQuery.length >= SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Aucun fournisseur trouvé pour "{searchQuery}"
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
                    Créer le fournisseur "{searchQuery}"
                  </Button>
                </div>
              )}

              {/* MESSAGE D'AIDE */}
              {searchQuery.length < SUPPLIER_DEFAULTS.SEARCH_MIN_LENGTH && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Saisissez au moins 2 caractères pour rechercher
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOUTON CRÉATION RAPIDE */}
        <Button 
          type="button"
          variant="outline" 
          size="icon" 
          className="h-11 w-11 flex-shrink-0"
          onClick={() => setShowCreateDialog(true)}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* TEXTE D'AIDE */}
      <p className="text-xs text-muted-foreground">
        💡 Tapez au moins 2 caractères pour rechercher ou cliquez sur "+" pour créer un nouveau fournisseur
      </p>

      {/* MESSAGE D'AIDE POUR LE CHAMP REQUIS */}
      {required && !selectedSupplier && (
        <p className="text-xs text-destructive">
          Veuillez sélectionner un fournisseur
        </p>
      )}

      {/* DIALOG CRÉATION FOURNISSEUR */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full mx-auto my-auto rounded-2xl border bg-white">
          <div className="max-h-[80vh] overflow-y-auto">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <DialogTitle>Créer un nouveau fournisseur</DialogTitle>
              <DialogDescription>
                Remplissez les informations ci-dessous pour créer un nouveau fournisseur.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6">
              <SupplierQuickCreateForm
                onSubmit={handleCreateSupplier}
                onCancel={() => setShowCreateDialog(false)}
                defaultName={searchQuery}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}