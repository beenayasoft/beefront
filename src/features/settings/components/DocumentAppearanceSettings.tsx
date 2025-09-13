/**
 * Interface de configuration de l'apparence des documents
 * Permet aux tenants de personnaliser leurs PDF (devis, factures, etc.)
 */
import React, { useState, useCallback, useImperativeHandle } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Eye, 
  Save, 
  RefreshCw, 
  Download, 
  Settings, 
  FileText,
  Image,
  Type,
  Layout,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DocumentPreview } from '@/features/documents/components/shared/DocumentPreview';
import { useDocumentAppearance, DocumentAppearanceConfig } from '../hooks/useDocumentAppearance';
import { useQuery } from '@tanstack/react-query';
import { tenantApi } from '@/lib/api/tenant';


// Données de devis exemple pour la prévisualisation
const mockQuote = {
  id: 'preview',
  documentType: 'quote' as const,
  number: 'DEVIS-2024-001',
  status: 'draft',
  clientName: 'Entreprise Exemple SARL',
  clientAddress: '123 Rue de la Démonstration\n75001 Paris, France',
  projectName: 'Projet de démonstration',
  projectAddress: '456 Avenue du Test, 75002 Paris',
  issueDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  items: [
    {
      id: '1',
      type: 'item',
      parentId: undefined,
      position: 1,
      reference: 'REF001',
      designation: 'Prestation exemple 1',
      description: 'Description détaillée de la prestation',
      unit: 'u',
      quantity: 2,
      unitPrice: 150.00,
      vatRate: 20,
      totalHT: 300.00,
      totalTtc: 360.00
    },
    {
      id: '2',
      type: 'item',
      parentId: undefined,
      position: 2,
      reference: 'REF002',
      designation: 'Prestation exemple 2',
      description: 'Autre prestation avec description',
      unit: 'h',
      quantity: 8,
      unitPrice: 85.00,
      vatRate: 20,
      totalHT: 680.00,
      totalTtc: 816.00
    }
  ],
  notes: 'Ceci est un exemple de notes qui apparaîtront sur le document final.',
  termsAndConditions: 'Conditions générales de vente applicables.',
  totalHT: 980.00,
  totalVAT: 196.00,
  totalTtc: 1176.00
};

interface DocumentAppearanceSettingsRef {
  saveConfig: () => Promise<void>;
  hasUnsavedChanges: boolean;
}

export const DocumentAppearanceSettings = React.forwardRef<DocumentAppearanceSettingsRef>((_, ref) => {
  const { toast } = useToast();
  
  // Récupérer les informations du tenant pour le logo et les informations entreprise
  const { data: tenantInfo, isLoading: isTenantLoading } = useQuery({
    queryKey: ['tenant-info'],
    queryFn: tenantApi.getCurrentTenantInfo,
  });
  
  // Utiliser le hook pour la gestion des paramètres d'apparence
  const {
    config,
    isLoading,
    isError,
    isSaving,
    hasUnsavedChanges,
    updateConfig,
    saveConfig,
    resetToDefault,
    reloadConfig
  } = useDocumentAppearance();
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Préparer les informations de l'entreprise avec les données du tenant
  const companyInfo = {
    name: tenantInfo?.name || 'Nom de l\'entreprise',
    address: tenantInfo?.address?.full_address || 'Adresse de l\'entreprise',
    phone: tenantInfo?.phone || 'Téléphone',
    email: tenantInfo?.email || 'Email',
    website: tenantInfo?.website,
    siret: tenantInfo?.legal?.siret,
    ice: tenantInfo?.legal?.ice,
    logo: tenantInfo?.settings?.logo_base64 // Logo du tenant
  };


  // Exposer les fonctions de sauvegarde au parent via ref
  useImperativeHandle(ref, () => ({
    saveConfig,
    hasUnsavedChanges
  }));

  // Réinitialiser vers les paramètres par défaut
  const handleReset = () => {
    resetToDefault();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Apparence des Documents</h2>
          <p className="text-muted-foreground">
            Personnalisez l'apparence de vos PDF (devis, factures, etc.)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Modifications non sauvegardées
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration principale */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">
                <Settings className="w-4 h-4 mr-2" />
                Général
              </TabsTrigger>
              <TabsTrigger value="branding">
                <Image className="w-4 h-4 mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="w-4 h-4 mr-2" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="styling">
                <Palette className="w-4 h-4 mr-2" />
                Style
              </TabsTrigger>
            </TabsList>

            {/* Onglet Général */}
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Template et Mise en Page
                  </CardTitle>
                  <CardDescription>
                    Configuration générale du document
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Template</Label>
                      <Select
                        value={config.documentTemplate}
                        onValueChange={(value: 'modern' | 'classic' | 'minimal') => 
                          updateConfig('documentTemplate', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Moderne</SelectItem>
                          <SelectItem value="classic">Classique</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Police</Label>
                      <Select
                        value={config.fontFamily}
                        onValueChange={(value) => updateConfig('fontFamily', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times">Times New Roman</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Taille de police</Label>
                    <Input
                      type="number"
                      min="8"
                      max="16"
                      value={config.fontSize}
                      onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Branding */}
            <TabsContent value="branding" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Logo et Couleurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Couleurs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Couleur principale</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={config.primaryColor}
                          onChange={(e) => updateConfig('primaryColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.primaryColor}
                          onChange={(e) => updateConfig('primaryColor', e.target.value)}
                          placeholder="#1B333F"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Couleur secondaire</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                          placeholder="#64748B"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Logo */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showLogo">Afficher le logo</Label>
                      <Switch
                        checked={config.showLogo}
                        onCheckedChange={(checked) => updateConfig('showLogo', checked)}
                      />
                    </div>

                    {config.showLogo && (
                      <>
                        {/* Affichage du logo du tenant */}
                        {companyInfo.logo ? (
                          <div className="space-y-2">
                            <Label>Logo de l'entreprise</Label>
                            <div className="mt-2">
                              <img 
                                src={companyInfo.logo} 
                                alt="Logo de l'entreprise" 
                                className="max-h-16 object-contain border rounded p-2 bg-gray-50"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Le logo provient des informations de votre tenant. Pour le modifier, 
                              rendez-vous dans les paramètres de votre entreprise.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Logo de l'entreprise</Label>
                            <div className="p-4 border rounded bg-gray-50 text-center">
                              <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Aucun logo configuré. Ajoutez un logo dans les paramètres de votre entreprise.
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Taille du logo (px)</Label>
                            <Input
                              type="number"
                              min="20"
                              max="120"
                              value={config.logoSize}
                              onChange={(e) => updateConfig('logoSize', parseInt(e.target.value))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Position du logo</Label>
                            <Select
                              value={config.logoPositionType}
                              onValueChange={(value: 'left' | 'center' | 'right') => 
                                updateConfig('logoPositionType', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Gauche</SelectItem>
                                <SelectItem value="center">Centre</SelectItem>
                                <SelectItem value="right">Droite</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Contenu */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Éléments à afficher</CardTitle>
                  <CardDescription>
                    Choisissez quels éléments afficher sur vos documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Informations entreprise */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Informations entreprise</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'showCompanyName', label: 'Nom entreprise' },
                        { key: 'showCompanyAddress', label: 'Adresse' },
                        { key: 'showCompanyEmail', label: 'Email' },
                        { key: 'showCompanyPhone', label: 'Téléphone' },
                        { key: 'showCompanyWebsite', label: 'Site web' },
                        { key: 'showCompanySiret', label: 'SIRET' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm">{label}</Label>
                          <Switch
                            checked={config[key as keyof DocumentAppearanceConfig] as boolean}
                            onCheckedChange={(checked) => updateConfig(key as keyof DocumentAppearanceConfig, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Informations document */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Contenu du document</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'showClientAddress', label: 'Adresse client' },
                        { key: 'showProjectInfo', label: 'Info projet' },
                        { key: 'showNotes', label: 'Notes' },
                        { key: 'showPaymentTerms', label: 'Conditions paiement' },
                        { key: 'showSignatureArea', label: 'Zone signature' },
                        { key: 'showPaymentMethods', label: 'Moyens paiement' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm">{label}</Label>
                          <Switch
                            checked={config[key as keyof DocumentAppearanceConfig] as boolean}
                            onCheckedChange={(checked) => updateConfig(key as keyof DocumentAppearanceConfig, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Style */}
            <TabsContent value="styling" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Style des tableaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Couleur en-tête tableau</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={config.tableHeaderColor}
                          onChange={(e) => updateConfig('tableHeaderColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.tableHeaderColor}
                          onChange={(e) => updateConfig('tableHeaderColor', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Couleur lignes alternées</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={config.tableAlternateColor}
                          onChange={(e) => updateConfig('tableAlternateColor', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={config.tableAlternateColor}
                          onChange={(e) => updateConfig('tableAlternateColor', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Style des bordures</Label>
                      <Select
                        value={config.tableBorderStyle}
                        onValueChange={(value: 'straight' | 'rounded') => 
                          updateConfig('tableBorderStyle', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="straight">Droites</SelectItem>
                          <SelectItem value="rounded">Arrondies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Épaisseur bordures (px)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="5"
                        value={config.tableBorderWidth}
                        onChange={(e) => updateConfig('tableBorderWidth', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Options d'affichage</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'tableBorderHorizontal', label: 'Bordures horizontales' },
                        { key: 'tableBorderVertical', label: 'Bordures verticales' },
                        { key: 'sectionContrast', label: 'Contraste sections' },
                        { key: 'showSectionSubtotals', label: 'Sous-totaux sections' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-sm">{label}</Label>
                          <Switch
                            checked={config[key as keyof DocumentAppearanceConfig] as boolean}
                            onCheckedChange={(checked) => updateConfig(key as keyof DocumentAppearanceConfig, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Aperçu en temps réel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Aperçu en temps réel
              </CardTitle>
              <CardDescription>
                Prévisualisation de vos paramètres
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white">
                <div className="transform scale-[0.4] origin-top-left w-[250%] h-[400px] overflow-hidden">
                  <DocumentPreview 
                    document={mockQuote}
                    companyInfo={companyInfo}
                    appearanceSettings={config}
                  />
                </div>
              </div>
              
              <Button
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir en taille réelle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de prévisualisation pleine taille */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Aperçu du document</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                Fermer
              </Button>
            </div>
            
            <div className="p-4">
              <DocumentPreview 
                document={mockQuote}
                companyInfo={companyInfo}
                appearanceSettings={config}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

DocumentAppearanceSettings.displayName = 'DocumentAppearanceSettings';

export default DocumentAppearanceSettings;