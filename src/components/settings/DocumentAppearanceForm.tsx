import { useState } from "react";
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
import { InvoicePreview } from "@/components/invoices/InvoicePreview";
import { QuotePreview } from "@/components/quotes/QuotePreview";
import { cn } from "@/lib/utils";

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
  appearanceSettings: {
    documentTemplate: "modern" | "classic" | "minimal";
    primaryColor: string;
    showLogo: boolean;
    showClientAddress: boolean;
    showProjectInfo: boolean;
    showNotes: boolean;
    showPaymentTerms: boolean;
    showBankDetails: boolean;
    showSignatureArea: boolean;
  };
  onChange: (data: any) => void;
}

export function DocumentAppearanceForm({ appearanceSettings, onChange }: DocumentAppearanceFormProps) {
  const [previewType, setPreviewType] = useState<"invoice" | "quote">("invoice");
  
  const handleInputChange = (field: string, value: string | boolean) => {
    onChange({ ...appearanceSettings, [field]: value });
  };
  
  const colorPresets = [
    { name: "Bleu Benaya", value: "#1B333F" },
    { name: "Bleu Roi", value: "#1E40AF" },
    { name: "Vert Émeraude", value: "#047857" },
    { name: "Rouge Rubis", value: "#B91C1C" },
    { name: "Violet Améthyste", value: "#7E22CE" },
    { name: "Orange Mandarine", value: "#C2410C" },
  ];

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

      {/* Color Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Couleur principale
        </h3>
        
        <div className="space-y-4">
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
      </div>

      {/* Visibility Options */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Éléments à afficher
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showLogo" className="cursor-pointer">
              Logo de l'entreprise
            </Label>
            <Switch
              id="showLogo"
              checked={appearanceSettings.showLogo}
              onCheckedChange={(checked) => handleInputChange("showLogo", checked)}
            />
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
        
        <Tabs value={previewType} onValueChange={(value) => setPreviewType(value as "invoice" | "quote")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoice">Facture</TabsTrigger>
            <TabsTrigger value="quote">Devis</TabsTrigger>
          </TabsList>
          
          <div className="mt-4 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white">
            <div className="max-h-[500px] overflow-y-auto">
              <TabsContent value="invoice" className="m-0">
                <InvoicePreview invoice={sampleInvoice} />
              </TabsContent>
              
              <TabsContent value="quote" className="m-0">
                <QuotePreview quote={sampleQuote} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}