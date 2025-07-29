import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicePreview } from "@/features/documents/components/invoices/InvoicePreview";
import { QuotePreview } from "@/features/documents/components/quotes/QuotePreview";
import { PaginatedPreview } from "@/features/documents/components/shared/PaginatedPreview";
import { cn } from "@/lib/utils";
import { documentAppearanceAPI, type DocumentAppearanceSettings, type ColorPreset, type DocumentTemplatePreset } from "@/lib/api/documentAppearance";
import { apiClient } from "@/lib/api/client";
import { toast } from "@/components/ui/use-toast";

// Sample data for previews
const sampleInvoice = {
  id: "preview",
  number: "FAC-2025-001",
  status: "sent",
  clientId: "1",
  clientName: "Dupont Construction",
  clientAddress: "15 rue des Bâtisseurs, 75001 Paris",
  projectId: "1",
  projectName: "Villa Moderne",
  projectAddress: "123 Rue de la Paix, Casablanca",
  issueDate: "2025-01-15",
  dueDate: "2025-02-15",
  paymentTerms: 30,
  items: [
    {
      id: "1",
      type: "chapter",
      position: 1,
      designation: "Travaux préparatoires",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      totalHT: 0,
      totalTTC: 0,
    },
    {
      id: "2",
      type: "work",
      parentId: "1",
      position: 1,
      reference: "PREP-001",
      designation: "Préparation du chantier",
      description: "Installation et sécurisation de la zone de travail",
      unit: "forfait",
      quantity: 1,
      unitPrice: 500,
      vatRate: 20,
      totalHT: 500,
      totalTTC: 600,
    },
    {
      id: "3",
      type: "chapter",
      position: 2,
      designation: "Peinture",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      totalHT: 0,
      totalTTC: 0,
    },
    {
      id: "4",
      type: "work",
      parentId: "3",
      position: 1,
      reference: "PEINT-001",
      designation: "Peinture murs et plafonds",
      description: "Peinture acrylique blanche mate",
      unit: "m²",
      quantity: 120,
      unitPrice: 25,
      vatRate: 20,
      totalHT: 3000,
      totalTTC: 3600,
    },
  ],
  notes: "Facture réglée par virement bancaire.",
  termsAndConditions: "Paiement à réception de facture.",
  totalHT: 3500,
  totalVAT: 700,
  totalTTC: 4200,
  paidAmount: 0,
  remainingAmount: 4200,
  payments: [],
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
  createdBy: "admin",
};

const sampleQuote = {
  id: "preview",
  number: "DEV-2025-001",
  status: "sent",
  clientId: "1",
  clientName: "Dupont Construction",
  clientAddress: "15 rue des Bâtisseurs, 75001 Paris",
  projectId: "1",
  projectName: "Villa Moderne",
  projectAddress: "123 Rue de la Paix, Casablanca",
  issueDate: "2025-01-15",
  expiryDate: "2025-02-15",
  validityPeriod: 30,
  items: [
    {
      id: "1",
      type: "chapter",
      position: 1,
      designation: "Travaux préparatoires",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      totalHT: 0,
      totalTTC: 0,
    },
    {
      id: "2",
      type: "work",
      parentId: "1",
      position: 1,
      reference: "PREP-001",
      designation: "Préparation du chantier",
      description: "Installation et sécurisation de la zone de travail",
      unit: "forfait",
      quantity: 1,
      unitPrice: 500,
      vatRate: 20,
      totalHT: 500,
      totalTTC: 600,
    },
    {
      id: "3",
      type: "chapter",
      position: 2,
      designation: "Peinture",
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      totalHT: 0,
      totalTTC: 0,
    },
    {
      id: "4",
      type: "work",
      parentId: "3",
      position: 1,
      reference: "PEINT-001",
      designation: "Peinture murs et plafonds",
      description: "Peinture acrylique blanche mate",
      unit: "m²",
      quantity: 120,
      unitPrice: 25,
      vatRate: 20,
      totalHT: 3000,
      totalTTC: 3600,
    },
  ],
  notes: "Travaux à réaliser sous 3 semaines après acceptation du devis.",
  termsAndConditions: "Acompte de 30% à la signature. Solde à la fin des travaux.",
  totalHT: 3500,
  totalVAT: 700,
  totalTTC: 4200,
  createdAt: "2025-01-15T10:00:00Z",
  updatedAt: "2025-01-15T10:00:00Z",
  createdBy: "admin",
};

interface DocumentAppearanceFormProps {
  onSave?: () => void;
}

export function DocumentAppearanceForm({ onSave }: DocumentAppearanceFormProps) {
  const [previewType, setPreviewType] = useState<"invoice" | "quote">("invoice");
  const [paginationMode, setPaginationMode] = useState<"simple" | "paginated">("simple");
  const [appearanceSettings, setAppearanceSettings] = useState<DocumentAppearanceSettings>({
    documentTemplate: "modern",
    primaryColor: "#1B333F",
    showLogo: true,
    showCompanyName: true,
    showCompanyAddress: true,
    showCompanyEmail: true,
    showCompanyPhone: true,
    showCompanyWebsite: true,
    showCompanySiret: true,
    showCompanyIce: true,
    showClientAddress: true,
    showProjectInfo: true,
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: true,
    tableHeaderColor: "#f8f9fa",  
    tableAlternateColor: "#f2f2f2",
    showPaymentDetails: true,
    showLegalMentions: true,
  });
  const [colorPresets, setColorPresets] = useState<ColorPreset[]>([]);
  const [templatePresets, setTemplatePresets] = useState<Record<string, DocumentTemplatePreset>>({});
  const [tenantData, setTenantData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fonction pour valider et normaliser les couleurs
  const validateColor = (color: string): string => {
    if (!color || color.trim() === '') {
      return '#1B333F'; // Couleur par défaut
    }
    
    // Si la couleur commence par #, la retourner
    if (color.startsWith('#') && color.length === 7) {
      return color;
    }
    
    // Si la couleur ne commence pas par #, l'ajouter
    if (color.length === 6 && /^[0-9A-Fa-f]{6}$/.test(color)) {
      return `#${color}`;
    }
    
    // Si format invalide, retourner la couleur par défaut
    return '#1B333F';
  };

  // Fonction pour générer un numéro de document réaliste
  const generateDocumentNumber = (type: 'invoice' | 'quote'): string => {
    if (!tenantData?.document_numbering) {
      return type === 'invoice' ? "FAC-2025-001" : "DEV-2025-001";
    }

    const documentType = type === 'invoice' ? 'invoice' : 'quote';
    const numbering = tenantData.document_numbering.find(n => n.document_type === documentType);
    
    if (!numbering) {
      return type === 'invoice' ? "FAC-2025-001" : "DEV-2025-001";
    }

    let number = "";
    
    // Ajouter le préfixe
    if (numbering.prefix) {
      number += numbering.prefix;
    }
    
    // Ajouter la date selon la configuration
    const now = new Date();
    if (numbering.include_year) {
      number += now.getFullYear().toString();
    }
    if (numbering.include_month) {
      number += (now.getMonth() + 1).toString().padStart(2, '0');
    }
    if (numbering.include_day) {
      number += now.getDate().toString().padStart(2, '0');
    }
    
    // Ajouter un séparateur si il y a déjà du contenu
    if (number && !number.endsWith('-') && !number.endsWith('_')) {
      number += '-';
    }
    
    // Ajouter le numéro séquentiel avec padding
    const sequenceNumber = (numbering.next_number || 1).toString().padStart(numbering.padding || 3, '0');
    number += sequenceNumber;
    
    // Ajouter le suffixe
    if (numbering.suffix) {
      number += numbering.suffix;
    }
    
    return number;
  };

  // Fonction pour générer des données réalistes basées sur le tenant
  const generateRealisticData = (type: 'invoice' | 'quote') => {
    // Utiliser les vraies données du tenant connecté si disponibles
    const companyName = tenantData?.name || "Votre Entreprise";
    const companyAddress = tenantData ? 
      [
        tenantData.address_line_1,
        tenantData.address_line_2, 
        `${tenantData.postal_code} ${tenantData.city}`,
        tenantData.country
      ].filter(Boolean).join('\n') 
      : "123 Rue de l'Exemple\n75000 Paris\nFrance";
    
    const companyPhone = tenantData?.phone || "01 23 45 67 89";
    const companyEmail = tenantData?.email || "contact@votre-entreprise.com";
    const companyWebsite = tenantData?.website || "";
    const companySiret = tenantData?.siret || "";
    const companyIce = tenantData?.ice || "";
    
    // Récupérer le logo depuis les settings du tenant
    const companyLogo = tenantData?.settings?.logo_data || tenantData?.settings?.logo_url || null;
    
    const baseData = {
      id: "preview",
      status: type === 'invoice' ? "sent" : "sent",
      clientId: "1", 
      clientName: "Dupont Construction",
      clientAddress: "15 rue des Bâtisseurs\n75001 Paris",
      projectId: "1",
      projectName: "Villa Moderne",
      projectAddress: "123 Rue de la Paix\nCasablanca", 
      issueDate: new Date().toISOString().split('T')[0],
      companyName,
      companyAddress, 
      companyPhone,
      companyEmail,
      companyWebsite,
      companySiret,
      companyIce,
      companyLogo,
      items: [
        {
          id: "1",
          type: "chapter",
          position: 1,
          designation: "Travaux préparatoires",
          quantity: 1,
          unitPrice: 0,
          vatRate: 20,
          totalHT: 0,
          totalTTC: 0,
        },
        {
          id: "2", 
          type: "work",
          parentId: "1",
          position: 1,
          reference: "PREP-001",
          designation: "Préparation du terrain",
          description: "Nettoyage et préparation de la surface",
          unit: "m²",
          quantity: 50,
          unitPrice: 12,
          vatRate: 20,
          totalHT: 600,
          totalTTC: 720,
        },
        {
          id: "3",
          type: "chapter", 
          position: 2,
          designation: "Travaux de finition",
          quantity: 1,
          unitPrice: 0,
          vatRate: 20,
          totalHT: 0,
          totalTTC: 0,
        },
        {
          id: "4",
          type: "work",
          parentId: "3", 
          position: 1,
          reference: "PEINT-001",
          designation: "Peinture murs et plafonds",
          description: "Peinture acrylique blanche mate",
          unit: "m²",
          quantity: 120,
          unitPrice: 25,
          vatRate: 20,
          totalHT: 3000,
          totalTTC: 3600,
        },
      ],
      notes: "Travaux à réaliser sous 3 semaines après acceptation du devis.",
      termsAndConditions: "Acompte de 30% à la signature. Solde à la fin des travaux.",
      totalHT: 3600,
      totalVAT: 720,
      totalTTC: 4320,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: tenantData?.name || "admin",
    };

    if (type === 'invoice') {
      return {
        ...baseData,
        number: generateDocumentNumber('invoice'),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: 30,
      };
    } else {
      return {
        ...baseData,
        number: generateDocumentNumber('quote'), 
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validityPeriod: 30,
      };
    }
  };

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 DocumentAppearanceForm.loadInitialData - Début du chargement');
        console.log('🔄 DocumentAppearanceForm.loadInitialData - Tenant ID from localStorage:', localStorage.getItem('tenantId'));
        
        // Charger les paramètres existants (toujours utiliser les paramètres du tenant)
        console.log('🔄 DocumentAppearanceForm.loadInitialData - Récupération des paramètres du tenant');
        const settings = await documentAppearanceAPI.getAppearanceSettings();
        console.log('✅ DocumentAppearanceForm.loadInitialData - Paramètres récupérés:', settings);
        
        // Charger les couleurs prédéfinies et templates
        console.log('🔄 DocumentAppearanceForm.loadInitialData - Chargement des données complémentaires');
        const [presets, templates, tenant] = await Promise.all([
          documentAppearanceAPI.getColorPresets(),
          documentAppearanceAPI.getTemplatePresets(),
          apiClient.get('/tenants/current_tenant_info/').then(res => res.data)
        ]);
        
        console.log('✅ DocumentAppearanceForm.loadInitialData - Données complémentaires chargées:', {
          presets: presets.length,
          templates: Object.keys(templates).length,
          tenant: tenant?.name
        });
        
        // Valider et normaliser toutes les couleurs dans les settings
        const validatedSettings = {
          ...settings,
          primaryColor: validateColor(settings.primaryColor || '#1B333F'),
          tableHeaderColor: validateColor(settings.tableHeaderColor || '#f8f9fa'),
          tableAlternateColor: validateColor(settings.tableAlternateColor || '#f2f2f2'),
          // Assurer que les nouveaux champs granulaires existent
          showCompanyName: settings.showCompanyName !== undefined ? settings.showCompanyName : true,
          showCompanyAddress: settings.showCompanyAddress !== undefined ? settings.showCompanyAddress : true,
          showCompanyEmail: settings.showCompanyEmail !== undefined ? settings.showCompanyEmail : true,
          showCompanyPhone: settings.showCompanyPhone !== undefined ? settings.showCompanyPhone : true,
          showCompanyWebsite: settings.showCompanyWebsite !== undefined ? settings.showCompanyWebsite : true,
          showCompanySiret: settings.showCompanySiret !== undefined ? settings.showCompanySiret : true,
          showCompanyIce: settings.showCompanyIce !== undefined ? settings.showCompanyIce : true,
        };
        
        console.log('✅ DocumentAppearanceForm.loadInitialData - Settings validés et normalisés:', validatedSettings);
        
        setAppearanceSettings(validatedSettings);
        setColorPresets(presets);
        setTemplatePresets(templates);
        setTenantData(tenant);
        console.log('✅ DocumentAppearanceForm.loadInitialData - États mis à jour avec succès');
      } catch (error) {
        console.error('❌ DocumentAppearanceForm.loadInitialData - Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les paramètres d'apparence",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    let processedValue = value;
    
    // Valider les couleurs
    if (typeof value === 'string' && field.toLowerCase().includes('color')) {
      processedValue = validateColor(value);
    }
    
    setAppearanceSettings(prev => ({ ...prev, [field]: processedValue }));
  };

  // Fonction pour appliquer un template prédéfini
  const applyTemplate = (templateKey: string) => {
    const template = templatePresets[templateKey];
    if (template) {
      setAppearanceSettings(prev => ({
        ...prev,
        ...template.config,
        // Valider les couleurs du template
        primaryColor: validateColor(template.config.primaryColor),
        tableHeaderColor: validateColor(template.config.tableHeaderColor),
        tableAlternateColor: validateColor(template.config.tableAlternateColor),
      }));
      
      toast({
        title: "Template appliqué",
        description: `Le template "${template.name}" a été appliqué avec succès`,
      });
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('💾 DocumentAppearanceForm.handleSave - Début sauvegarde');
      console.log('💾 DocumentAppearanceForm.handleSave - Current appearanceSettings:', appearanceSettings);
      console.log('💾 DocumentAppearanceForm.handleSave - Current tenantData:', tenantData);
      console.log('💾 DocumentAppearanceForm.handleSave - Tenant ID from localStorage:', localStorage.getItem('tenantId'));
      
      const savedSettings = await documentAppearanceAPI.updateAppearanceSettings(appearanceSettings);
      
      console.log('✅ DocumentAppearanceForm.handleSave - Settings saved successfully:', savedSettings);
      
      // Mettre à jour l'état local avec les données sauvegardées
      setAppearanceSettings(savedSettings);
      console.log('✅ DocumentAppearanceForm.handleSave - Local state updated with saved settings');
      
      toast({
        title: "Paramètres sauvegardés",
        description: "Les paramètres d'apparence ont été mis à jour avec succès",
      });
      
      onSave?.();
    } catch (error) {
      console.error('❌ DocumentAppearanceForm.handleSave - Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-500 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Chargement des paramètres...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Modèle de document
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: "modern", label: "Moderne" },
            { id: "classic", label: "Classique" },
            { id: "minimal", label: "Minimal" },
          ].map((template) => (
            <div
              key={template.id}
              className={cn(
                "cursor-pointer p-3 border rounded-lg hover:border-benaya-500 transition-colors",
                appearanceSettings.documentTemplate === template.id 
                  ? "border-benaya-500 bg-benaya-50 dark:bg-benaya-900/20" 
                  : "border-neutral-200 dark:border-neutral-700"
              )}
              onClick={() => handleInputChange("documentTemplate", template.id as any)}
            >
              <div 
                className={cn(
                  "w-full h-20 rounded mb-2 border-2",
                  template.id === "modern" ? "bg-gradient-to-r from-benaya-500/20 to-benaya-500/5" : "",
                  template.id === "classic" ? "bg-neutral-100 dark:bg-neutral-800" : "",
                  template.id === "minimal" ? "bg-white dark:bg-neutral-900" : "",
                )}
              ></div>
              <p className="text-sm font-medium text-center">{template.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Template Presets */}
      {Object.keys(templatePresets).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
            Modèles prédéfinis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(templatePresets).map(([key, template]) => (
              <div 
                key={key}
                className="cursor-pointer p-4 border rounded-lg hover:border-benaya-500 transition-colors group"
                onClick={() => applyTemplate(key)}
              >
                <div 
                  className="w-full h-16 rounded mb-3 border-2 group-hover:border-benaya-400 transition-colors"
                  style={{
                    background: template.config.primaryColor,
                    opacity: 0.1
                  }}
                ></div>
                <h4 className="font-medium text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-gray-500">{template.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: template.config.primaryColor }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: template.config.table_header_color }}
                  ></div>
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: template.config.table_alternate_color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Couleurs du document
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium mb-2 block">Couleur principale</Label>
              <div className="flex flex-wrap gap-3">
                {colorPresets.map((color) => (
                  <div
                    key={color.value}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer border-2",
                      appearanceSettings.primaryColor === color.value 
                        ? "border-neutral-900 dark:border-white" 
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleInputChange("primaryColor", color.value)}
                    title={color.name}
                  ></div>
                ))}
                
                <div className="flex items-center">
                  <Input
                    type="color"
                    value={appearanceSettings.primaryColor}
                    onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                  />
                  <span className="ml-2 text-sm">{appearanceSettings.primaryColor}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Couleur en-tête de tableau</Label>
              <div className="flex items-center">
                <Input
                  type="color"
                  value={appearanceSettings.tableHeaderColor}
                  onChange={(e) => handleInputChange("tableHeaderColor", e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                />
                <span className="ml-2 text-sm">{appearanceSettings.tableHeaderColor}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Couleur alternée du tableau</Label>
              <div className="flex items-center">
                <Input
                  type="color"
                  value={appearanceSettings.tableAlternateColor}
                  onChange={(e) => handleInputChange("tableAlternateColor", e.target.value)}
                  className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                />
                <span className="ml-2 text-sm">{appearanceSettings.tableAlternateColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Éléments à afficher
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showLogo" className="cursor-pointer">
              Afficher le logo
            </Label>
            <Switch
              id="showLogo"
              checked={appearanceSettings.showLogo}
              onCheckedChange={(checked) => handleInputChange("showLogo", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanyName" className="cursor-pointer">
              Nom de l'entreprise
            </Label>
            <Switch
              id="showCompanyName"
              checked={appearanceSettings.showCompanyName}
              onCheckedChange={(checked) => handleInputChange("showCompanyName", checked)}
            />
          </div>
          
          {/* Séparateur pour les informations d'entreprise */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-3">
              Informations détaillées de l'entreprise
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanyAddress" className="cursor-pointer">
              Adresse de l'entreprise
            </Label>
            <Switch
              id="showCompanyAddress"
              checked={appearanceSettings.showCompanyAddress}
              onCheckedChange={(checked) => handleInputChange("showCompanyAddress", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanyEmail" className="cursor-pointer">
              Email de l'entreprise
            </Label>
            <Switch
              id="showCompanyEmail"
              checked={appearanceSettings.showCompanyEmail}
              onCheckedChange={(checked) => handleInputChange("showCompanyEmail", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanyPhone" className="cursor-pointer">
              Téléphone de l'entreprise
            </Label>
            <Switch
              id="showCompanyPhone"
              checked={appearanceSettings.showCompanyPhone}
              onCheckedChange={(checked) => handleInputChange("showCompanyPhone", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanyWebsite" className="cursor-pointer">
              Site web de l'entreprise
            </Label>
            <Switch
              id="showCompanyWebsite"
              checked={appearanceSettings.showCompanyWebsite}
              onCheckedChange={(checked) => handleInputChange("showCompanyWebsite", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanySiret" className="cursor-pointer">
              SIRET
            </Label>
            <Switch
              id="showCompanySiret"
              checked={appearanceSettings.showCompanySiret}
              onCheckedChange={(checked) => handleInputChange("showCompanySiret", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showCompanyIce" className="cursor-pointer">
              ICE
            </Label>
            <Switch
              id="showCompanyIce"
              checked={appearanceSettings.showCompanyIce}
              onCheckedChange={(checked) => handleInputChange("showCompanyIce", checked)}
            />
          </div>
          
          {/* Séparateur pour les informations du client */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-3">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-3">
              Informations du client et projet
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showClientAddress" className="cursor-pointer">
              Adresse du client
            </Label>
            <Switch
              id="showClientAddress"
              checked={appearanceSettings.showClientAddress}
              onCheckedChange={(checked) => handleInputChange("showClientAddress", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showProjectInfo" className="cursor-pointer">
              Informations du projet
            </Label>
            <Switch
              id="showProjectInfo"
              checked={appearanceSettings.showProjectInfo}
              onCheckedChange={(checked) => handleInputChange("showProjectInfo", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showNotes" className="cursor-pointer">
              Notes
            </Label>
            <Switch
              id="showNotes"
              checked={appearanceSettings.showNotes}
              onCheckedChange={(checked) => handleInputChange("showNotes", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showPaymentTerms" className="cursor-pointer">
              Conditions de paiement
            </Label>
            <Switch
              id="showPaymentTerms"
              checked={appearanceSettings.showPaymentTerms}
              onCheckedChange={(checked) => handleInputChange("showPaymentTerms", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showBankDetails" className="cursor-pointer">
              Coordonnées bancaires
            </Label>
            <Switch
              id="showBankDetails"
              checked={appearanceSettings.showBankDetails}
              onCheckedChange={(checked) => handleInputChange("showBankDetails", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="showSignatureArea" className="cursor-pointer">
              Zone de signature (devis uniquement)
            </Label>
            <Switch
              id="showSignatureArea"
              checked={appearanceSettings.showSignatureArea}
              onCheckedChange={(checked) => handleInputChange("showSignatureArea", checked)}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Aperçu
        </h3>
        
        {/* Contrôle du mode de pagination */}
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium">Mode d'aperçu</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="pagination-mode" className="text-xs text-gray-600">Paginé</Label>
            <Switch
              id="pagination-mode"
              checked={paginationMode === "paginated"}
              onCheckedChange={(checked) => setPaginationMode(checked ? "paginated" : "simple")}
            />
          </div>
        </div>
        
        <Tabs value={previewType} onValueChange={(value) => setPreviewType(value as "invoice" | "quote")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoice">Facture</TabsTrigger>
            <TabsTrigger value="quote">Devis</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white">
            <div className="max-h-[600px] overflow-y-auto p-4 bg-gray-50">
              <TabsContent value="invoice" className="m-0">
                {paginationMode === "paginated" ? (
                  <PaginatedPreview 
                    document={generateRealisticData('invoice')} 
                    documentType="invoice"
                    appearanceSettings={appearanceSettings}
                    paginationConfig={{ itemsPerPage: 12, keepChaptersIntact: true, maxLinesPerItem: 3 }}
                  />
                ) : (
                  <InvoicePreview 
                    invoice={generateRealisticData('invoice')} 
                    appearanceSettings={appearanceSettings}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="quote" className="m-0">
                {paginationMode === "paginated" ? (
                  <PaginatedPreview 
                    document={generateRealisticData('quote')} 
                    documentType="quote"
                    appearanceSettings={appearanceSettings}
                    paginationConfig={{ itemsPerPage: 12, keepChaptersIntact: true, maxLinesPerItem: 3 }}
                  />
                ) : (
                  <QuotePreview 
                    quote={generateRealisticData('quote')}
                    appearanceSettings={appearanceSettings}
                  />
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : (
            "Sauvegarder"
          )}
        </Button>
      </div>
    </div>
  );
}