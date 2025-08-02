import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentPreview } from "@/components/ui/DocumentPreview";
import { cn } from "@/lib/utils";
import { tenantApi } from "@/lib/api/tenant";
import { TenantInfo, DocumentNumbering } from "@/lib/types/tenant";
import { useDocumentAppearance } from "@/features/settings/hooks/useDocumentAppearance";
import { extractColorsFromLogo } from "@/lib/utils/colorExtraction";

// Fonction pour générer un numéro d'exemple basé sur la configuration
const generateSampleDocumentNumber = (
  documentType: "invoice" | "quote", 
  documentNumbering?: DocumentNumbering[]
): string => {
  // Trouver la configuration pour le type de document
  const config = documentNumbering?.find(config => {
    const type = documentType === "invoice" ? "invoice" : "quote";
    return config.document_type === type;
  });

  if (!config) {
    // Fallback si pas de configuration
    return documentType === "invoice" ? "FAC-2025-001" : "DEV-2025-001";
  }

  // Variables pour les remplacements
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const exampleNumber = config.next_number || 1;
  const paddedNumber = String(exampleNumber).padStart(config.padding || 3, '0');
  
  // Fonction pour remplacer les placeholders dans n'importe quel texte
  const replacePlaceholders = (text: string): string => {
    return text
      .replace(/\{prefix\}/g, config.prefix || '')
      .replace(/\{year\}/g, year)
      .replace(/\{month\}/g, month)
      .replace(/\{day\}/g, day)
      .replace(/\{number\}/g, paddedNumber)
      .replace(/\{suffix\}/g, config.suffix || '')
      // Variables supplémentaires courantes
      .replace(/\{YYYY\}/g, year)
      .replace(/\{AAAA\}/g, year)
      .replace(/\{MM\}/g, month)
      .replace(/\{DD\}/g, day)
      .replace(/\{XXXX\}/g, paddedNumber)
      .replace(/\{XXX\}/g, paddedNumber)
      .replace(/\{NNN\}/g, paddedNumber);
  };

  // Si un format personnalisé existe, l'utiliser
  if (config.custom_format) {
    return replacePlaceholders(config.custom_format);
  }

  // Sinon, utiliser la construction classique
  let number = "";
  const separator = config.separator || "-";
  
  // Vérifier si le préfixe contient déjà des placeholders de date
  const prefixHasDatePlaceholders = config.prefix && 
    (/\{(AAAA|YYYY|year)\}/.test(config.prefix) || 
     /\{(MM|month)\}/.test(config.prefix) || 
     /\{(DD|day)\}/.test(config.prefix));
  
  // Préfixe avec remplacement des placeholders
  if (config.prefix) {
    number += replacePlaceholders(config.prefix);
  }
  
  // Année si configurée ET si le préfixe ne contient pas déjà de placeholder d'année
  if (config.include_year && !prefixHasDatePlaceholders) {
    number += (number ? separator : "") + year;
  }
  
  // Mois si configuré ET si le préfixe ne contient pas déjà de placeholder de mois
  if (config.include_month && !(config.prefix && /\{(MM|month)\}/.test(config.prefix))) {
    number += (number ? separator : "") + month;
  }
  
  // Jour si configuré ET si le préfixe ne contient pas déjà de placeholder de jour
  if (config.include_day && !(config.prefix && /\{(DD|day)\}/.test(config.prefix))) {
    number += (number ? separator : "") + day;
  }
  
  // Numéro avec padding (seulement si le préfixe ne contient pas déjà de placeholder de numéro)
  if (!(config.prefix && /\{(XXXX|XXX|NNN|number)\}/.test(config.prefix))) {
    number += (number ? separator : "") + paddedNumber;
  }
  
  // Suffixe avec remplacement des placeholders
  if (config.suffix) {
    number += separator + replacePlaceholders(config.suffix);
  }
  
  return number || "EXEMPLE-001";
};

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

// Données d'exemple pour le devis
const sampleQuote = {
  id: "preview-quote",
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
  appearanceSettings?: {
    primaryColor: string;
    fontFamily?: string;
    fontSize?: number;
    showLogo: boolean;
    logoSize: number;
    showCompanyName: boolean;
    showCompanySlogan: boolean;
    showCompanyAddress: boolean;
    showCompanyPhone: boolean;
    showCompanyEmail: boolean;
    showCompanySiret: boolean;
    showCompanyVat: boolean;
    showClientAddress: boolean;
    showProjectInfo: boolean;
    showNotes: boolean;
    showPaymentTerms: boolean;
    showBankDetails: boolean;
    showSignatureArea: boolean;
    showLegalMentions: boolean;
    // Options de style du tableau
    tableBorderStyle?: 'straight' | 'rounded';
    tableBorderHorizontal?: boolean;
    tableBorderVertical?: boolean;
    sectionContrast?: boolean;
    showSectionSubtotals?: boolean;
  };
  onChange?: (data: any) => void; // Rendre onChange optionnel
}

export function DocumentAppearanceForm({ appearanceSettings, onChange }: DocumentAppearanceFormProps) {
  const [previewType, setPreviewType] = useState<"invoice" | "quote">("invoice");
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);
  const [autoThemeFromLogo, setAutoThemeFromLogo] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  
  // Utiliser le hook pour gérer les paramètres d'apparence
  const { settings: apiSettings, isLoading: isLoadingSettings, updateSettings } = useDocumentAppearance();
  
  // Données d'exemple dynamiques basées sur le tenant
  const getDynamicSampleData = () => {
    const baseInvoice = {
      ...sampleInvoice,
      number: generateSampleDocumentNumber("invoice", tenantInfo?.document_numbering)
    };
    
    const baseQuote = {
      ...sampleQuote,
      number: generateSampleDocumentNumber("quote", tenantInfo?.document_numbering)
    };
    
    return { baseInvoice, baseQuote };
  };
  
  // Provide default values if appearanceSettings is undefined
  const defaultSettings = {
    primaryColor: "#1B333F",
    fontFamily: "Inter",
    fontSize: 11,
    showLogo: true,
    logoSize: 12, // Taille par défaut en pixels
    showCompanyName: true,
    showCompanySlogan: true,
    showCompanyAddress: true,
    showCompanyPhone: true,
    showCompanyEmail: true,
    showCompanySiret: true,
    showCompanyVat: true,
    showClientAddress: true,
    showProjectInfo: true,
    showNotes: true,
    showPaymentTerms: true,
    showBankDetails: true,
    showSignatureArea: true,
    showLegalMentions: true,
    // Valeurs par défaut pour le style du tableau
    tableBorderStyle: 'rounded' as 'straight' | 'rounded',
    tableBorderHorizontal: true,
    tableBorderVertical: true,
    sectionContrast: true,
    showSectionSubtotals: true,
  };
  
  // Utiliser les paramètres de l'API en priorité, puis les props si disponibles, sinon les valeurs par défaut
  const settings = {
    ...defaultSettings,
    ...appearanceSettings, // Props from Settings.tsx (lower priority)
    ...apiSettings        // API settings have highest priority
  };
  
  const handleInputChange = async (field: string, value: string | boolean | number) => {
    // S'assurer que les valeurs numériques sont bien des nombres
    let cleanValue = value;
    if (Array.isArray(value)) {
      console.warn('⚠️ Valeur reçue sous forme de tableau, extraction du premier élément:', value);
      cleanValue = value[0];
    }
    
    // Pour les champs numériques, s'assurer que c'est bien un nombre
    if (field === 'fontSize' || field === 'logoSize') {
      cleanValue = typeof cleanValue === 'number' ? cleanValue : Number(cleanValue);
    }
    
    const newSettings = { ...settings, [field]: cleanValue };
    
    console.log('🔄 DocumentAppearanceForm.handleInputChange - Field:', field, 'Original value:', value, 'Clean value:', cleanValue);
    console.log('🔄 DocumentAppearanceForm.handleInputChange - New settings:', newSettings);
    
    // Appeler onChange si fourni (pour compatibilité avec Settings.tsx)
    if (onChange) {
      onChange(newSettings);
    }
    
    // Sauvegarder directement via l'API documentAppearance
    try {
      console.log('💾 DocumentAppearanceForm.handleInputChange - Saving to API:', { [field]: cleanValue });
      console.log('💾 DocumentAppearanceForm.handleInputChange - Value type:', typeof cleanValue, 'Value:', cleanValue);
      await updateSettings({ [field]: cleanValue });
      console.log('✅ DocumentAppearanceForm.handleInputChange - Saved successfully');
    } catch (error) {
      console.error('❌ DocumentAppearanceForm.handleInputChange - Error saving:', error);
    }
  };

  // Fonction pour gérer l'upload du logo avec extraction automatique des couleurs
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide.');
      return;
    }

    try {
      setIsExtractingColors(true);

      // Si l'option de thème automatique est activée, extraire les couleurs
      if (autoThemeFromLogo) {
        console.log('🎨 Extraction des couleurs du logo en cours...');
        const extractedColors = await extractColorsFromLogo(file);
        console.log('🎨 Couleurs extraites:', extractedColors);

        // Appliquer la couleur primaire extraite
        await handleInputChange('primaryColor', extractedColors.primary);
        
        // Optionnel: stocker les autres couleurs pour usage futur
        console.log('✅ Couleur primaire appliquée:', extractedColors.primary);
      }

      // Ici vous pourriez aussi gérer l'upload du logo lui-même
      // Par exemple, convertir en base64 ou uploader vers un serveur
      console.log('📁 Logo sélectionné:', file.name, file.size, 'bytes');
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des couleurs:', error);
      alert('Erreur lors de l\'analyse du logo. La couleur n\'a pas été mise à jour.');
    } finally {
      setIsExtractingColors(false);
    }
  };

  // Récupérer les informations du tenant au chargement
  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        setIsLoadingTenant(true);
        const info = await tenantApi.getCurrentTenantInfo();
        setTenantInfo(info);
      } catch (error) {
        console.error('Erreur lors de la récupération des informations du tenant:', error);
      } finally {
        setIsLoadingTenant(false);
      }
    };

    fetchTenantInfo();
  }, []);

  const colorPresets = [
    { name: "Bleu Beenaya", value: "#1B333F" },
    { name: "Bleu Roi", value: "#1E40AF" },
    { name: "Vert Émeraude", value: "#047857" },
    { name: "Rouge Rubis", value: "#B91C1C" },
    { name: "Violet Améthyste", value: "#7E22CE" },
    { name: "Orange Mandarine", value: "#C2410C" },
  ];

  return (
    <div className="h-full">
      {/* Layout principal : responsive avec aperçu sticky sur mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-6 h-full">
        
        {/* Aperçu mobile sticky (visible uniquement sur mobile) */}
        <div className="lg:hidden order-first">
          <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 pb-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  📄 Aperçu
                </h3>
                <Select value={previewType} onValueChange={(value) => setPreviewType(value as "invoice" | "quote")}>
                  <SelectTrigger className="w-20 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Facture</SelectItem>
                    <SelectItem value="quote">Devis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-md overflow-hidden bg-white shadow-sm">
                <div className="h-32 overflow-y-auto">
                  {isLoadingTenant || isLoadingSettings ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-xs text-neutral-500">Chargement...</div>
                    </div>
                  ) : (
                    <div className="scale-50 origin-top-left w-[200%] h-[200%]">
                      <DocumentPreview 
                        document={previewType === "invoice" ? getDynamicSampleData().baseInvoice : getDynamicSampleData().baseQuote} 
                        documentType={previewType} 
                        tenantInfo={tenantInfo}
                        appearanceSettings={settings} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Colonne de gauche : Paramètres avec accordéons */}
        <div className="space-y-1 overflow-auto lg:order-first">
          <Accordion type="multiple" defaultValue={["style", "logo", "elements"]} className="w-full space-y-1">
            
            {/* Section 1: Style général */}
            <AccordionItem value="style" className="border-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  🎨 Style général
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                {/* Font Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Police de caractères</Label>
                  <Select value={settings.fontFamily || "Inter"} onValueChange={(value) => handleInputChange("fontFamily", value)}>
                    <SelectTrigger className="Beenaya-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter (Moderne)</SelectItem>
                      <SelectItem value="Arial">Arial (Classique)</SelectItem>
                      <SelectItem value="Helvetica">Helvetica (Professionnel)</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman (Traditionnel)</SelectItem>
                      <SelectItem value="Georgia">Georgia (Élégant)</SelectItem>
                      <SelectItem value="Roboto">Roboto (Google)</SelectItem>
                      <SelectItem value="Open Sans">Open Sans (Lisible)</SelectItem>
                      <SelectItem value="Lato">Lato (Corporate)</SelectItem>
                      <SelectItem value="Montserrat">Montserrat (Design)</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro (Adobe)</SelectItem>
                      <SelectItem value="Nunito">Nunito (Amical)</SelectItem>
                      <SelectItem value="Poppins">Poppins (Moderne Arrondi)</SelectItem>
                      <SelectItem value="Calibri">Calibri (Microsoft)</SelectItem>
                      <SelectItem value="Segoe UI">Segoe UI (Windows)</SelectItem>
                      <SelectItem value="SF Pro Display">SF Pro Display (Apple)</SelectItem>
                      <SelectItem value="system-ui">Système (Police par défaut)</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display (Serif Élégant)</SelectItem>
                      <SelectItem value="Merriweather">Merriweather (Lecture)</SelectItem>
                      <SelectItem value="Crimson Text">Crimson Text (Académique)</SelectItem>
                      <SelectItem value="IBM Plex Sans">IBM Plex Sans (Tech)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                {/* Thème automatique depuis le logo */}
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoTheme" className="cursor-pointer font-medium text-blue-900">
                        🎨 Thème automatique depuis le logo
                      </Label>
                      <p className="text-xs text-blue-700 mt-1">
                        Génère automatiquement les couleurs du thème à partir de votre logo
                      </p>
                    </div>
                    <Switch
                      id="autoTheme"
                      checked={autoThemeFromLogo}
                      onCheckedChange={setAutoThemeFromLogo}
                    />
                  </div>
                  
                  {autoThemeFromLogo && (
                    <div className="space-y-2">
                      <Label className="text-sm text-blue-800">Uploader votre logo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-xs"
                          disabled={isExtractingColors}
                        />
                        {isExtractingColors && (
                          <div className="text-xs text-blue-600 flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Analyse...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Couleur principale</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {colorPresets.map((color) => (
                        <div
                          key={color.value}
                          className={cn(
                            "w-7 h-7 rounded-full cursor-pointer border-2",
                            settings.primaryColor === color.value 
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
                          value={settings.primaryColor}
                          onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                          className="w-7 h-7 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                        <span className="ml-2 text-xs">{settings.primaryColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Style du tableau */}
                <div className="space-y-3 border-t border-neutral-200 pt-3 mt-4">
                  <Label className="text-sm font-medium text-neutral-700">📊 Style du tableau</Label>
                  
                  {/* Bordures du tableau */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-neutral-600">Bordures</Label>
                    <div className="space-y-2 ml-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-neutral-600">Style des bordures</Label>
                        <Select 
                          value={settings.tableBorderStyle || 'rounded'} 
                          onValueChange={(value) => handleInputChange("tableBorderStyle", value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rounded">Arrondies</SelectItem>
                            <SelectItem value="straight">Droites</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tableBorderHorizontal" className="cursor-pointer text-xs">
                          Bordures horizontales
                        </Label>
                        <Switch
                          id="tableBorderHorizontal"
                          checked={settings.tableBorderHorizontal}
                          onCheckedChange={(checked) => handleInputChange("tableBorderHorizontal", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tableBorderVertical" className="cursor-pointer text-xs">
                          Bordures verticales
                        </Label>
                        <Switch
                          id="tableBorderVertical"
                          checked={settings.tableBorderVertical}
                          onCheckedChange={(checked) => handleInputChange("tableBorderVertical", checked)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Apparence des lignes */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-neutral-600">Apparence</Label>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sectionContrast" className="cursor-pointer text-xs">
                          Lignes alternées/contrastées
                        </Label>
                        <Switch
                          id="sectionContrast"
                          checked={settings.sectionContrast}
                          onCheckedChange={(checked) => handleInputChange("sectionContrast", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showSectionSubtotals" className="cursor-pointer text-xs">
                          Sous-totaux dans les sections
                        </Label>
                        <Switch
                          id="showSectionSubtotals"
                          checked={settings.showSectionSubtotals}
                          onCheckedChange={(checked) => handleInputChange("showSectionSubtotals", checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 2: Logo et en-tête */}
            <AccordionItem value="logo" className="border-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  🏢 Logo et en-tête
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo" className="cursor-pointer">
                    Logo de l'entreprise
                  </Label>
                  <Switch
                    id="showLogo"
                    checked={settings.showLogo}
                    onCheckedChange={(checked) => handleInputChange("showLogo", checked)}
                  />
                </div>
                
                {settings.showLogo && (
                  <div className="ml-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm text-neutral-600">Taille du logo</Label>
                      <span className="text-xs text-neutral-500">{settings.logoSize}×{settings.logoSize} px</span>
                    </div>
                    <div className="px-1">
                      <Slider
                        value={[settings.logoSize]}
                        onValueChange={([value]) => handleInputChange("logoSize", value)}
                        min={8}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-neutral-400 mt-0.5">
                        <span>8px</span>
                        <span>30px</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyName" className="cursor-pointer">
                    Nom de l'entreprise
                  </Label>
                  <Switch
                    id="showCompanyName"
                    checked={settings.showCompanyName}
                    onCheckedChange={(checked) => handleInputChange("showCompanyName", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanySlogan" className="cursor-pointer">
                    Slogan/description
                  </Label>
                  <Switch
                    id="showCompanySlogan"
                    checked={settings.showCompanySlogan}
                    onCheckedChange={(checked) => handleInputChange("showCompanySlogan", checked)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Section 3: Éléments du document */}
            <AccordionItem value="elements" className="border-0 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  📋 Éléments du document
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 space-y-3">
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showClientAddress" className="cursor-pointer">
                    Adresse du client
                  </Label>
                  <Switch
                    id="showClientAddress"
                    checked={settings.showClientAddress}
                    onCheckedChange={(checked) => handleInputChange("showClientAddress", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showProjectInfo" className="cursor-pointer">
                    Informations du projet
                  </Label>
                  <Switch
                    id="showProjectInfo"
                    checked={settings.showProjectInfo}
                    onCheckedChange={(checked) => handleInputChange("showProjectInfo", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showNotes" className="cursor-pointer">
                    Notes
                  </Label>
                  <Switch
                    id="showNotes"
                    checked={settings.showNotes}
                    onCheckedChange={(checked) => handleInputChange("showNotes", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showPaymentTerms" className="cursor-pointer">
                    Conditions de paiement
                  </Label>
                  <Switch
                    id="showPaymentTerms"
                    checked={settings.showPaymentTerms}
                    onCheckedChange={(checked) => handleInputChange("showPaymentTerms", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showBankDetails" className="cursor-pointer">
                    Coordonnées bancaires
                  </Label>
                  <Switch
                    id="showBankDetails"
                    checked={settings.showBankDetails}
                    onCheckedChange={(checked) => handleInputChange("showBankDetails", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showSignatureArea" className="cursor-pointer">
                    Zone de signature (devis uniquement)
                  </Label>
                  <Switch
                    id="showSignatureArea"
                    checked={settings.showSignatureArea}
                    onCheckedChange={(checked) => handleInputChange("showSignatureArea", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLegalMentions" className="cursor-pointer">
                    Mentions légales
                  </Label>
                  <Switch
                    id="showLegalMentions"
                    checked={settings.showLegalMentions}
                    onCheckedChange={(checked) => handleInputChange("showLegalMentions", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyAddress" className="cursor-pointer">
                    Adresse de l'entreprise (pied de page)
                  </Label>
                  <Switch
                    id="showCompanyAddress"
                    checked={settings.showCompanyAddress}
                    onCheckedChange={(checked) => handleInputChange("showCompanyAddress", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyPhone" className="cursor-pointer">
                    Téléphone de l'entreprise (pied de page)
                  </Label>
                  <Switch
                    id="showCompanyPhone"
                    checked={settings.showCompanyPhone}
                    onCheckedChange={(checked) => handleInputChange("showCompanyPhone", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyEmail" className="cursor-pointer">
                    Email de l'entreprise (pied de page)
                  </Label>
                  <Switch
                    id="showCompanyEmail"
                    checked={settings.showCompanyEmail}
                    onCheckedChange={(checked) => handleInputChange("showCompanyEmail", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanySiret" className="cursor-pointer">
                    SIRET (pied de page)
                  </Label>
                  <Switch
                    id="showCompanySiret"
                    checked={settings.showCompanySiret}
                    onCheckedChange={(checked) => handleInputChange("showCompanySiret", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompanyVat" className="cursor-pointer">
                    Numéro de TVA (pied de page)
                  </Label>
                  <Switch
                    id="showCompanyVat"
                    checked={settings.showCompanyVat}
                    onCheckedChange={(checked) => handleInputChange("showCompanyVat", checked)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Colonne de droite : Aperçu du document (desktop uniquement) */}
        <div className="hidden lg:block">
          <div className="sticky top-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  📄 Aperçu en temps réel
                </h3>
                
                {/* Sélecteur de type de document */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600">Type:</span>
                  <Select value={previewType} onValueChange={(value) => setPreviewType(value as "invoice" | "quote")}>
                    <SelectTrigger className="w-20 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Facture</SelectItem>
                      <SelectItem value="quote">Devis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
                  {isLoadingTenant || isLoadingSettings ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-sm text-neutral-500">Chargement des informations...</div>
                    </div>
                  ) : (
                    <DocumentPreview 
                      document={previewType === "invoice" ? getDynamicSampleData().baseInvoice : getDynamicSampleData().baseQuote} 
                      documentType={previewType} 
                      tenantInfo={tenantInfo}
                      appearanceSettings={settings} 
                    />
                  )}
                </div>
              </div>
              
              <div className="text-xs text-neutral-500 text-center">
                💡 L'aperçu se met à jour automatiquement
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}