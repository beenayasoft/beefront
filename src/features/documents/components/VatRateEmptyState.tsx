/**
 * Modal contextuelle intelligente pour la configuration initiale des taux de TVA
 * S'affiche automatiquement quand aucun taux n'est configuré
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calculator, 
  MapPin, 
  Zap, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Settings,
  Globe
} from "lucide-react";
import { useSmartVatRates } from '../hooks/useSmartVatRates';
import VatRateIntelligenceService, { VatRateTemplate } from '../services/vatRateIntelligence';
import { CreateVatRateData } from '../api/tenantVatRates';

interface VatRateEmptyStateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SelectedRate extends VatRateTemplate {
  selected: boolean;
}

export function VatRateEmptyState({ isOpen, onClose, onSuccess }: VatRateEmptyStateProps) {
  const { 
    loading, 
    detectedCountry, 
    suggestedRates, 
    actions 
  } = useSmartVatRates();

  const [activeTab, setActiveTab] = useState<'intelligent' | 'manual'>('intelligent');
  const [selectedRates, setSelectedRates] = useState<SelectedRate[]>([]);
  const [customRate, setCustomRate] = useState({ rate: '', name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [creationResult, setCreationResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  // Initialiser les taux suggérés
  useEffect(() => {
    if (suggestedRates.length > 0) {
      const initialRates = suggestedRates.map(rate => ({
        ...rate,
        selected: rate.is_default || rate.is_common
      }));
      setSelectedRates(initialRates);
    }
  }, [suggestedRates]);

  // Informations sur le pays détecté
  const countryInfo = VatRateIntelligenceService.getCountryVatRates(detectedCountry);

  const handleRateToggle = (index: number) => {
    setSelectedRates(prev => 
      prev.map((rate, i) => 
        i === index ? { ...rate, selected: !rate.selected } : rate
      )
    );
  };

  const handleIntelligentSetup = async () => {
    const ratesToCreate = selectedRates.filter(rate => rate.selected);
    
    if (ratesToCreate.length === 0) {
      return;
    }

    setIsCreating(true);
    try {
      const result = await actions.bulkCreate(ratesToCreate);
      
      setCreationResult({
        success: result.created.length,
        errors: result.errors.map(e => `${e.code}: ${e.message}`)
      });

      if (result.created.length > 0) {
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 2000);
      }
    } catch (error: any) {
      setCreationResult({
        success: 0,
        errors: [error.message || 'Erreur lors de la création']
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleManualCreate = async () => {
    if (!customRate.rate || !customRate.name) {
      return;
    }

    setIsCreating(true);
    try {
      const vatRateData: CreateVatRateData = {
        code: customRate.rate,
        name: customRate.name,
        rate: parseFloat(customRate.rate),
        description: customRate.description || `Taux de TVA à ${customRate.rate}%`,
        is_default: true,
        is_active: true
      };

      await actions.createVatRate(vatRateData);
      
      setCreationResult({
        success: 1,
        errors: []
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error: any) {
      setCreationResult({
        success: 0,
        errors: [error.message || 'Erreur lors de la création']
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSkip = () => {
    // Permettre de continuer sans configuration (pour les cas d'urgence)
    onClose();
  };

  if (loading) {
    return (
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Configuration des taux de TVA
          </DialogTitle>
          <DialogDescription>
            Aucun taux de TVA n'est configuré pour votre tenant. 
            Configurons cela ensemble pour que vous puissiez créer vos documents.
          </DialogDescription>
        </DialogHeader>

        {/* Informations contextuelles */}
        {countryInfo && (
          <Card className="border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Pays détecté : {countryInfo.country}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-neutral-600">
                Nous avons détecté que vous êtes au {countryInfo.country}. 
                Voici les taux de TVA standards pour faciliter votre configuration.
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="intelligent" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Configuration intelligente
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration manuelle
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intelligent" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Taux recommandés pour {countryInfo?.country || 'votre pays'}
              </h4>
              
              {selectedRates.length > 0 ? (
                <div className="space-y-2">
                  {selectedRates.map((rate, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-neutral-50"
                    >
                      <Checkbox
                        id={`rate-${index}`}
                        checked={rate.selected}
                        onCheckedChange={() => handleRateToggle(index)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label 
                            htmlFor={`rate-${index}`} 
                            className="font-medium cursor-pointer"
                          >
                            {rate.name} ({rate.rate}%)
                          </Label>
                          {rate.is_default && (
                            <Badge variant="secondary" className="text-xs">
                              Par défaut
                            </Badge>
                          )}
                          {rate.is_common && (
                            <Badge variant="outline" className="text-xs">
                              Courant
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          {rate.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Aucun taux prédéfini disponible pour ce pays. 
                    Utilisez la configuration manuelle.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="custom-rate">Taux (%)</Label>
                  <Input
                    id="custom-rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={customRate.rate}
                    onChange={(e) => setCustomRate(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="custom-name">Nom du taux</Label>
                  <Input
                    id="custom-name"
                    value={customRate.name}
                    onChange={(e) => setCustomRate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="TVA Normale"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="custom-description">Description (optionnelle)</Label>
                <Input
                  id="custom-description"
                  value={customRate.description}
                  onChange={(e) => setCustomRate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Taux normal applicable à la plupart des biens et services"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Résultat de la création */}
        {creationResult && (
          <Alert className={creationResult.success > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {creationResult.success > 0 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>
              {creationResult.success > 0 && (
                <div className="text-green-700">
                  ✅ {creationResult.success} taux de TVA créé(s) avec succès !
                </div>
              )}
              {creationResult.errors.length > 0 && (
                <div className="text-red-700">
                  ❌ Erreurs : {creationResult.errors.join(', ')}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleSkip} disabled={isCreating}>
            Ignorer pour le moment
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isCreating}>
              Annuler
            </Button>
            
            {activeTab === 'intelligent' ? (
              <Button 
                onClick={handleIntelligentSetup} 
                disabled={isCreating || selectedRates.filter(r => r.selected).length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Configurer ({selectedRates.filter(r => r.selected).length} taux)
              </Button>
            ) : (
              <Button 
                onClick={handleManualCreate}
                disabled={isCreating || !customRate.rate || !customRate.name}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer le taux
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}