import { useState } from "react";
import { AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NumberingFormatFormProps {
  numberingSettings: {
    quoteFormat: string;
    invoiceFormat: string;
    resetFrequency: "yearly" | "monthly" | "never";
    nextQuoteNumber: number;
    nextInvoiceNumber: number;
  };
  onChange: (data: any) => void;
}

export function NumberingFormatForm({ numberingSettings, onChange }: NumberingFormatFormProps) {
  // Initialiser les valeurs par défaut pour éviter les problèmes d'inputs non contrôlés
  const defaultSettings = {
    quoteFormat: "DEV-{AAAA}-{XXXX}",
    invoiceFormat: "FAC-{AAAA}-{XXXX}",
    resetFrequency: "yearly" as "yearly" | "monthly" | "never",
    nextQuoteNumber: 1,
    nextInvoiceNumber: 1
  };
  
  // Fusionner les paramètres fournis avec les valeurs par défaut
  const settings = {
    ...defaultSettings,
    ...numberingSettings
  };
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (field: string, value: string | number) => {
    onChange({ ...settings, [field]: value });
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validateFormat = (format: string): boolean => {
    // Check if format contains at least one counter placeholder
    return format.includes("{XXXX}") || format.includes("{XXX}") || format.includes("{XX}") || format.includes("{X}");
  };
  
  const handleBlur = (field: "quoteFormat" | "invoiceFormat") => {
    const format = settings[field];
    
    if (!validateFormat(format)) {
      setErrors(prev => ({
        ...prev,
        [field]: "Le format doit contenir au moins un compteur {XXXX}, {XXX}, {XX} ou {X}"
      }));
    }
  };
  
  const getPreview = (format: string | undefined, number: number | undefined): string => {
    // Si format est undefined ou null, retourner un format par défaut
    if (!format) return "Format non défini";
    if (number === undefined) number = 1;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    let preview = format;
    
    // Replace year placeholders
    preview = preview.replace(/{AAAA}/g, year.toString());
    preview = preview.replace(/{AA}/g, year.toString().slice(-2));
    
    // Replace month placeholder
    preview = preview.replace(/{MM}/g, month);
    
    // Replace counter placeholders
    const paddedNumber = number.toString().padStart(4, '0');
    preview = preview.replace(/{XXXX}/g, paddedNumber);
    preview = preview.replace(/{XXX}/g, number.toString().padStart(3, '0'));
    preview = preview.replace(/{XX}/g, number.toString().padStart(2, '0'));
    preview = preview.replace(/{X}/g, number.toString());
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* Quote Numbering */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Format de numérotation des devis
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="quoteFormat" className={errors.quoteFormat ? "text-red-500" : ""}>
              Format <span className="text-red-500">*</span>
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Utilisez les balises suivantes pour personnaliser le format:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li><code>{"{AAAA}"}</code> - Année sur 4 chiffres (ex: 2025)</li>
                    <li><code>{"{AA}"}</code> - Année sur 2 chiffres (ex: 25)</li>
                    <li><code>{"{MM}"}</code> - Mois sur 2 chiffres (ex: 01)</li>
                    <li><code>{"{XXXX}"}</code> - Compteur sur 4 chiffres (ex: 0001)</li>
                    <li><code>{"{XXX}"}</code> - Compteur sur 3 chiffres (ex: 001)</li>
                    <li><code>{"{XX}"}</code> - Compteur sur 2 chiffres (ex: 01)</li>
                    <li><code>{"{X}"}</code> - Compteur sans zéros (ex: 1)</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="quoteFormat"
            value={settings.quoteFormat || ""}
            onChange={(e) => handleInputChange("quoteFormat", e.target.value)}
            onBlur={() => handleBlur("quoteFormat")}
            placeholder="DEV-{AAAA}-{XXXX}"
            className={`benaya-input ${errors.quoteFormat ? "border-red-500" : ""}`}
          />
          {errors.quoteFormat ? (
            <p className="text-xs text-red-500 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.quoteFormat}
            </p>
          ) : (
            <p className="text-xs text-neutral-500">
              Exemple: {getPreview(settings.quoteFormat, settings.nextQuoteNumber)}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nextQuoteNumber">Prochain numéro</Label>
          <Input
            id="nextQuoteNumber"
            type="number"
            min="1"
            value={settings.nextQuoteNumber || 1}
            onChange={(e) => handleInputChange("nextQuoteNumber", parseInt(e.target.value) || 1)}
            className="benaya-input"
          />
        </div>
      </div>

      {/* Invoice Numbering */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Format de numérotation des factures
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="invoiceFormat" className={errors.invoiceFormat ? "text-red-500" : ""}>
              Format <span className="text-red-500">*</span>
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>Utilisez les balises suivantes pour personnaliser le format:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-1">
                    <li><code>{"{AAAA}"}</code> - Année sur 4 chiffres (ex: 2025)</li>
                    <li><code>{"{AA}"}</code> - Année sur 2 chiffres (ex: 25)</li>
                    <li><code>{"{MM}"}</code> - Mois sur 2 chiffres (ex: 01)</li>
                    <li><code>{"{XXXX}"}</code> - Compteur sur 4 chiffres (ex: 0001)</li>
                    <li><code>{"{XXX}"}</code> - Compteur sur 3 chiffres (ex: 001)</li>
                    <li><code>{"{XX}"}</code> - Compteur sur 2 chiffres (ex: 01)</li>
                    <li><code>{"{X}"}</code> - Compteur sans zéros (ex: 1)</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="invoiceFormat"
            value={settings.invoiceFormat || ""}
            onChange={(e) => handleInputChange("invoiceFormat", e.target.value)}
            onBlur={() => handleBlur("invoiceFormat")}
            placeholder="FAC-{AAAA}-{XXXX}"
            className={`benaya-input ${errors.invoiceFormat ? "border-red-500" : ""}`}
          />
          {errors.invoiceFormat ? (
            <p className="text-xs text-red-500 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.invoiceFormat}
            </p>
          ) : (
            <p className="text-xs text-neutral-500">
              Exemple: {getPreview(settings.invoiceFormat, settings.nextInvoiceNumber)}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="nextInvoiceNumber">Prochain numéro</Label>
          <Input
            id="nextInvoiceNumber"
            type="number"
            min="1"
            value={settings.nextInvoiceNumber || 1}
            onChange={(e) => handleInputChange("nextInvoiceNumber", parseInt(e.target.value) || 1)}
            className="benaya-input"
          />
        </div>
      </div>

      {/* Reset Frequency */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          Réinitialisation des compteurs
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="resetFrequency">Fréquence de réinitialisation</Label>
          <Select 
            value={settings.resetFrequency || "yearly"} 
            onValueChange={(value: "yearly" | "monthly" | "never") => handleInputChange("resetFrequency", value)}
          >
            <SelectTrigger className="benaya-input">
              <SelectValue placeholder="Sélectionner une fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yearly">Annuelle (1er janvier)</SelectItem>
              <SelectItem value="monthly">Mensuelle (1er de chaque mois)</SelectItem>
              <SelectItem value="never">Jamais (compteur continu)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-500">
            Détermine quand les compteurs de numérotation sont remis à 1.
          </p>
        </div>
      </div>
    </div>
  );
}