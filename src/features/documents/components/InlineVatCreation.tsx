/**
 * Composant de création rapide inline de taux de TVA
 * S'affiche directement dans le sélecteur pour un ajout ultra-rapide
 */

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Plus, 
  Check, 
  X, 
  Loader2, 
  Lightbulb, 
  AlertCircle,
  Zap
} from "lucide-react";
import { useSmartVatRates, useVatRateValidation } from '../hooks/useSmartVatRates';
import { CreateVatRateData } from '../api/tenantVatRates';

interface InlineVatCreationProps {
  onSuccess?: (newVatRate: any) => void;
  onCancel?: () => void;
  showSuggestions?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export function InlineVatCreation({ 
  onSuccess, 
  onCancel, 
  showSuggestions = true,
  placeholder = "Ex: 20",
  compact = false 
}: InlineVatCreationProps) {
  const { actions, loading: globalLoading, vatRates, detectedCountry } = useSmartVatRates();
  const { validateRate, getSuggestions } = useVatRateValidation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    rate: '',
    name: '',
    description: '',
    isDefault: false
  });
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    warning?: string;
    suggestion?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Suggestions basées sur les taux existants et le pays
  const suggestions = getSuggestions(vatRates);

  // Validation en temps réel du taux
  React.useEffect(() => {
    if (formData.rate) {
      const rate = parseFloat(formData.rate);
      if (!isNaN(rate)) {
        const result = validateRate(rate);
        setValidationResult(result);
        
        // Auto-générer le nom si pas fourni
        if (!formData.name) {
          setFormData(prev => ({
            ...prev,
            name: `TVA ${rate}%`
          }));
        }
      }
    } else {
      setValidationResult(null);
    }
  }, [formData.rate, validateRate]);

  const handleRateChange = (value: string) => {
    setFormData(prev => ({ ...prev, rate: value }));
    setError(null);
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  };

  const handleSuggestionClick = (suggestion: any) => {
    setFormData({
      rate: suggestion.rate.toString(),
      name: suggestion.name,
      description: suggestion.description,
      isDefault: suggestion.is_default
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rate = parseFloat(formData.rate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Veuillez entrer un taux valide entre 0 et 100');
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom du taux est requis');
      return;
    }

    // Vérifier si le taux existe déjà
    const existingRate = vatRates.find(r => parseFloat(r.code) === rate);
    if (existingRate) {
      setError(`Un taux de ${rate}% existe déjà`);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const vatRateData: CreateVatRateData = {
        code: rate.toString(),
        name: formData.name.trim(),
        rate: rate,
        description: formData.description.trim() || `Taux de TVA à ${rate}%`,
        is_default: formData.isDefault || vatRates.length === 0, // Premier taux = défaut
        is_active: true
      };

      const newVatRate = await actions.createVatRate(vatRateData);
      
      // Reset form
      setFormData({ rate: '', name: '', description: '', isDefault: false });
      
      // Callback success
      onSuccess?.(newVatRate);
      
    } catch (error: any) {
      setError(error.response?.data?.detail || error.message || 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setFormData({ rate: '', name: '', description: '', isDefault: false });
    setError(null);
    setValidationResult(null);
    onCancel?.();
  };

  if (compact) {
    return (
      <Card className="border-dashed border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  placeholder={placeholder}
                  className="text-center"
                  disabled={isCreating}
                />
              </div>
              <span className="text-sm text-neutral-600">%</span>
              <div className="flex gap-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!formData.rate || isCreating}
                  className="h-8 w-8 p-0"
                >
                  {isCreating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert className="py-2">
                <AlertCircle className="h-3 w-3" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4 text-blue-600" />
          Ajouter un taux de TVA
        </CardTitle>
        <CardDescription className="text-xs">
          Créez rapidement un nouveau taux pour {detectedCountry}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="inline-rate" className="text-xs">Taux (%)</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="inline-rate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  placeholder={placeholder}
                  className="text-center"
                  disabled={isCreating}
                />
                <span className="text-xs text-neutral-600">%</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="inline-name" className="text-xs">Nom</Label>
              <Input
                id="inline-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="TVA Normale"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Validation feedback */}
          {validationResult && !validationResult.isValid && (
            <Alert className="py-2 border-amber-200 bg-amber-50">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <AlertDescription className="text-xs text-amber-700">
                {validationResult.warning}
                {validationResult.suggestion && (
                  <div className="mt-1 font-medium">💡 {validationResult.suggestion}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Error feedback */}
          {error && (
            <Alert className="py-2 border-red-200 bg-red-50">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <AlertDescription className="text-xs text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {vatRates.length === 0 && (
                <Badge variant="outline" className="text-xs">
                  Premier taux (défaut)
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCreating}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!formData.rate || !formData.name || isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Créer
              </Button>
            </div>
          </div>
        </form>

        {/* Suggestions rapides */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="pt-2 border-t border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-neutral-700">
                Suggestions pour {detectedCountry} :
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isCreating}
                >
                  <Zap className="h-2 w-2 mr-1" />
                  {suggestion.rate}%
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Version très compacte pour intégration dans les selects
 */
export function InlineVatCreationMini({ onSuccess, onCancel }: InlineVatCreationProps) {
  return (
    <InlineVatCreation 
      onSuccess={onSuccess}
      onCancel={onCancel}
      compact={true}
      showSuggestions={false}
    />
  );
}

export default InlineVatCreation;