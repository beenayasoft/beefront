/**
 * Wizard de configuration initiale du tenant
 * S'affiche après la création d'un tenant pour valider/ajuster les données détectées
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Globe, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Eye,
  Edit3,
  Save
} from "lucide-react";
import { VatRateEmptyState } from '../../documents/components/VatRateEmptyState';
import { useSmartVatRates } from '../../documents/hooks/useSmartVatRates';

interface DetectedLocation {
  ip_address?: string;
  country_code: string;
  country_name: string;
  currency: string;
  timezone: string;
  language: string;
  city?: string;
  region?: string;
  vat_rates_created?: number;
  detection_error?: string;
}

interface TenantSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  tenantData: {
    id: string;
    name: string;
    detected_location?: DetectedLocation;
    country?: string;
    city?: string;
    postal_code?: string;
    settings?: {
      currency?: string;
      timezone?: string;
      language?: string;
    };
  };
  onSuccess?: (updatedData: any) => void;
}

interface TenantUpdateData {
  name: string;
  country: string;
  city: string;
  postal_code: string;
  settings: {
    currency: string;
    timezone: string;
    language: string;
    date_format: string;
  };
}

const SUPPORTED_COUNTRIES = [
  { code: 'MA', name: 'Maroc', currency: 'MAD' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'BE', name: 'Belgique', currency: 'EUR' },
  { code: 'ES', name: 'Espagne', currency: 'EUR' },
  { code: 'CH', name: 'Suisse', currency: 'CHF' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'US', name: 'États-Unis', currency: 'USD' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP' },
];

const SUPPORTED_CURRENCIES = [
  { code: 'MAD', name: 'Dirham marocain', symbol: 'DH' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CHF', name: 'Franc suisse', symbol: 'CHF' },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CAD' },
  { code: 'USD', name: 'Dollar américain', symbol: '$' },
  { code: 'GBP', name: 'Livre sterling', symbol: '£' },
];

const SUPPORTED_TIMEZONES = [
  { value: 'Africa/Casablanca', label: 'Casablanca (UTC+1)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Europe/Brussels', label: 'Bruxelles (UTC+1)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1)' },
  { value: 'Europe/Zurich', label: 'Zurich (UTC+1)' },
  { value: 'America/Toronto', label: 'Toronto (UTC-5)' },
  { value: 'America/New_York', label: 'New York (UTC-5)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
];

export function TenantSetupWizard({ isOpen, onClose, tenantData, onSuccess }: TenantSetupWizardProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'modify' | 'vat_rates'>('review');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [showVatRateModal, setShowVatRateModal] = useState(false);
  
  const { isEmpty: vatRatesEmpty, needsConfiguration: needsVatConfig } = useSmartVatRates();

  const [formData, setFormData] = useState<TenantUpdateData>({
    name: tenantData.name || '',
    country: tenantData.detected_location?.country_name || tenantData.country || 'Maroc',
    city: tenantData.detected_location?.city || tenantData.city || '',
    postal_code: tenantData.postal_code || '',
    settings: {
      currency: tenantData.detected_location?.currency || tenantData.settings?.currency || 'MAD',
      timezone: tenantData.detected_location?.timezone || tenantData.settings?.timezone || 'Africa/Casablanca',
      language: tenantData.detected_location?.language || tenantData.settings?.language || 'fr',
      date_format: 'DD/MM/YYYY'
    }
  });

  // Vérifier si on a besoin de configurer les taux de TVA
  useEffect(() => {
    if (vatRatesEmpty && tenantData.detected_location?.vat_rates_created === 0) {
      setActiveTab('vat_rates');
    }
  }, [vatRatesEmpty, tenantData.detected_location?.vat_rates_created]);

  const detectedLocation = tenantData.detected_location;
  const isDetectionSuccessful = detectedLocation && !detectedLocation.detection_error;

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/tenants/current_tenant_info/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantData.id
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedData = await response.json();
        onSuccess?.(updatedData);
        setIsEditing(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field.startsWith('settings.')) {
      const settingField = field.replace('settings.', '');
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Auto-ajuster la devise selon le pays
    if (field === 'country') {
      const country = SUPPORTED_COUNTRIES.find(c => c.name === value);
      if (country) {
        setFormData(prev => ({
          ...prev,
          settings: {
            ...prev.settings,
            currency: country.currency
          }
        }));
      }
    }
  };

  const handleSkipSetup = () => {
    onClose();
  };

  const handleCompleteSetup = () => {
    if (isEditing) {
      handleSaveChanges();
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Configuration de {tenantData.name}
            </DialogTitle>
            <DialogDescription>
              Nous avons configuré automatiquement votre tenant. Vérifiez et ajustez les paramètres selon vos besoins.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="review" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Révision
              </TabsTrigger>
              <TabsTrigger value="modify" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Modification
              </TabsTrigger>
              <TabsTrigger value="vat_rates" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Taux de TVA
                {needsVatConfig && <Badge variant="destructive" className="ml-1 text-xs">!</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-4">
              {/* Informations de détection */}
              {isDetectionSuccessful && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Détection automatique réussie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Localisation:</span>
                        <span>{detectedLocation.country_name}</span>
                        {detectedLocation.city && <span className="text-gray-500">({detectedLocation.city})</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Devise:</span>
                        <span>{detectedLocation.currency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Fuseau:</span>
                        <span>{detectedLocation.timezone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Langue:</span>
                        <span>{detectedLocation.language}</span>
                      </div>
                    </div>
                    {detectedLocation.vat_rates_created > 0 && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                        <span className="text-sm text-blue-800">
                          ✅ {detectedLocation.vat_rates_created} taux de TVA configurés automatiquement
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Erreur de détection */}
              {detectedLocation?.detection_error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Détection limitée: {detectedLocation.detection_error}
                    <br />
                    <span className="text-sm">Configuration par défaut appliquée (Maroc).</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Résumé des paramètres */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Paramètres configurés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Entreprise</Label>
                      <p className="text-lg font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Pays</Label>
                      <p className="text-lg">{formData.country}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Ville</Label>
                      <p className="text-lg">{formData.city || 'Non spécifiée'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Code postal</Label>
                      <p className="text-lg">{formData.postal_code || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Devise</Label>
                      <p className="text-lg">{formData.settings.currency}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Fuseau horaire</Label>
                      <p className="text-lg">{formData.settings.timezone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modify" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Modifier les paramètres</CardTitle>
                  <CardDescription>
                    Ajustez les paramètres automatiquement détectés selon vos besoins.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom de l'entreprise</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Pays</Label>
                      <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_COUNTRIES.map((country) => (
                            <SelectItem key={country.code} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleFieldChange('city', e.target.value)}
                        placeholder="Casablanca, Paris, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="postal_code">Code postal</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                        placeholder="20000, 75001, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <Select value={formData.settings.currency} onValueChange={(value) => handleFieldChange('settings.currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <Select value={formData.settings.timezone} onValueChange={(value) => handleFieldChange('settings.timezone', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_TIMEZONES.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vat_rates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration des taux de TVA</CardTitle>
                  <CardDescription>
                    {detectedLocation?.vat_rates_created > 0 
                      ? `${detectedLocation.vat_rates_created} taux de TVA ont été configurés automatiquement selon votre localisation.`
                      : 'Configurez les taux de TVA pour votre entreprise.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {needsVatConfig ? (
                    <div className="text-center py-8">
                      <Button 
                        onClick={() => setShowVatRateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Configurer les taux de TVA
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-green-600">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">Taux de TVA configurés</p>
                      <p className="text-sm text-gray-600">
                        Vous pouvez les modifier plus tard dans les paramètres.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleSkipSetup}>
              Ignorer pour le moment
            </Button>
            
            <div className="flex gap-2">
              {activeTab === 'modify' && (
                <Button 
                  onClick={handleSaveChanges} 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
              )}
              
              <Button 
                onClick={handleCompleteSetup}
                className="bg-green-600 hover:bg-green-700"
              >
                Terminer la configuration
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de configuration des taux de TVA */}
      <VatRateEmptyState
        isOpen={showVatRateModal}
        onClose={() => setShowVatRateModal(false)}
        onSuccess={() => {
          setShowVatRateModal(false);
          setActiveTab('review');
        }}
      />
    </>
  );
}