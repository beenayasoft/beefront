import { useState, useEffect } from "react";
import { AlertCircle, Info, Eye, RotateCcw, Calendar, Hash, Separator, Wand2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DocumentNumbering } from "@/lib/types/tenant";
import { toast } from "@/hooks/use-toast";

interface NumberingFormatFormAdvancedProps {
  documentNumbering: DocumentNumbering[];
  onChange: (documentNumbering: DocumentNumbering[]) => void;
}

type DocumentType = 'quote' | 'invoice' | 'credit_note';

const DOCUMENT_TYPES: { key: DocumentType; label: string; icon: any; defaultPrefix: string }[] = [
  { key: 'quote', label: 'Devis', icon: Calendar, defaultPrefix: 'DEV' },
  { key: 'invoice', label: 'Factures', icon: Hash, defaultPrefix: 'FAC' },
  { key: 'credit_note', label: 'Avoirs', icon: RotateCcw, defaultPrefix: 'AV' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'YYYY-MM-DD', label: '2024-07-23', description: 'Format ISO (AAAA-MM-JJ)' },
  { value: 'YYYY-MM', label: '2024-07', description: 'Année-Mois' },
  { value: 'YYYY', label: '2024', description: 'Année seulement' },
  { value: 'DD-MM-YYYY', label: '23-07-2024', description: 'Format français (JJ-MM-AAAA)' },
  { value: 'MM-DD-YYYY', label: '07-23-2024', description: 'Format américain (MM-JJ-AAAA)' },
];

const PRESET_FORMATS = [
  { name: 'Standard', format: '{prefix}-{year}-{number}', description: 'Format classique avec année' },
  { name: 'Compact', format: '{prefix}{year}{number}', description: 'Format compact sans séparateurs' },
  { name: 'Détaillé', format: '{prefix}-{year}-{month}-{day}-{number}', description: 'Avec date complète' },
  { name: 'Mensuel', format: '{prefix}-{year}{month}-{number}', description: 'Groupement par mois' },
  { name: 'Entreprise', format: '{prefix}_{year}_{number}', description: 'Format professionnel' },
];

export function NumberingFormatFormAdvanced({ documentNumbering, onChange }: NumberingFormatFormAdvancedProps) {
  const [activeTab, setActiveTab] = useState<DocumentType>('quote');
  const [previewData, setPreviewData] = useState<Record<DocumentType, string>>({
    quote: '',
    invoice: '',
    credit_note: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // Obtenir la configuration pour un type de document donné
  const getConfigForType = (type: DocumentType): DocumentNumbering => {
    const existing = documentNumbering.find(d => d.document_type === type);
    if (existing) return existing;

    // Configuration par défaut
    const defaultPrefix = DOCUMENT_TYPES.find(dt => dt.key === type)?.defaultPrefix || 'DOC';
    return {
      document_type: type,
      prefix: defaultPrefix,
      suffix: '',
      padding: 3,
      next_number: 1,
      include_year: true,
      include_month: false,
      include_day: false,
      date_format: 'YYYY-MM-DD',
      separator: '-',
      custom_format: '',
      reset_yearly: true,
      reset_monthly: false,
    };
  };

  // Mettre à jour une configuration
  const updateConfig = (type: DocumentType, updates: Partial<DocumentNumbering>) => {
    const currentConfig = getConfigForType(type);
    const updatedConfig = { ...currentConfig, ...updates };
    
    const newNumbering = documentNumbering.filter(d => d.document_type !== type);
    newNumbering.push(updatedConfig);
    
    onChange(newNumbering);
    
    // Effacer l'erreur si elle existe
    const errorKey = `${type}_format`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Générer un aperçu du format
  const generatePreview = (config: DocumentNumbering): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const number = String(config.next_number).padStart(config.padding, '0');

    if (config.custom_format) {
      // Format personnalisé
      return config.custom_format
        .replace('{prefix}', config.prefix || '')
        .replace('{year}', String(year))
        .replace('{month}', month)
        .replace('{day}', day)
        .replace('{number}', number)
        .replace('{suffix}', config.suffix || '');
    } else {
      // Format standard
      const parts: string[] = [];
      
      if (config.prefix) parts.push(config.prefix);
      
      const dateParts: string[] = [];
      if (config.include_year) dateParts.push(String(year));
      if (config.include_month) dateParts.push(month);
      if (config.include_day) dateParts.push(day);
      
      if (dateParts.length > 0) {
        parts.push(dateParts.join(config.separator));
      }
      
      parts.push(number);
      
      if (config.suffix) parts.push(config.suffix);
      
      return parts.join(config.separator);
    }
  };

  // Mettre à jour les aperçus
  useEffect(() => {
    const newPreviews: Record<DocumentType, string> = {
      quote: '',
      invoice: '',
      credit_note: ''
    };

    DOCUMENT_TYPES.forEach(({ key }) => {
      const config = getConfigForType(key);
      newPreviews[key] = generatePreview(config);
    });

    setPreviewData(newPreviews);
  }, [documentNumbering]);

  // Valider un format personnalisé
  const validateCustomFormat = (format: string): boolean => {
    return format.includes('{number}');
  };

  // Copier vers le presse-papier
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copié !",
        description: "L'aperçu a été copié dans le presse-papier.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papier.",
        variant: "destructive",
      });
    }
  };

  // Appliquer un format prédéfini
  const applyPresetFormat = (preset: typeof PRESET_FORMATS[0]) => {
    const config = getConfigForType(activeTab);
    updateConfig(activeTab, {
      custom_format: preset.format,
      include_year: preset.format.includes('{year}'),
      include_month: preset.format.includes('{month}'),
      include_day: preset.format.includes('{day}'),
    });
    
    toast({
      title: "Format appliqué",
      description: `Le format "${preset.name}" a été appliqué.`,
    });
  };

  const renderBasicSettings = (config: DocumentNumbering) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${activeTab}_prefix`}>
            Préfixe
          </Label>
          <Input
            id={`${activeTab}_prefix`}
            value={config.prefix || ''}
            onChange={(e) => updateConfig(activeTab, { prefix: e.target.value })}
            placeholder="DEV"
            className="benaya-input"
          />
          <p className="text-xs text-neutral-500">
            Texte qui apparaît au début du numéro
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${activeTab}_suffix`}>
            Suffixe <span className="text-neutral-500">(optionnel)</span>
          </Label>
          <Input
            id={`${activeTab}_suffix`}
            value={config.suffix || ''}
            onChange={(e) => updateConfig(activeTab, { suffix: e.target.value })}
            placeholder="DRAFT"
            className="benaya-input"
          />
          <p className="text-xs text-neutral-500">
            Texte qui apparaît à la fin du numéro
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${activeTab}_padding`}>
            Nombre de chiffres pour le compteur
          </Label>
          <Select
            value={String(config.padding)}
            onValueChange={(value) => updateConfig(activeTab, { padding: parseInt(value) })}
          >
            <SelectTrigger className="benaya-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 chiffre (1, 2, 3...)</SelectItem>
              <SelectItem value="2">2 chiffres (01, 02, 03...)</SelectItem>
              <SelectItem value="3">3 chiffres (001, 002, 003...)</SelectItem>
              <SelectItem value="4">4 chiffres (0001, 0002, 0003...)</SelectItem>
              <SelectItem value="5">5 chiffres (00001, 00002, 00003...)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${activeTab}_next_number`}>
            Prochain numéro
          </Label>
          <Input
            id={`${activeTab}_next_number`}
            type="number"
            min="1"
            value={config.next_number}
            onChange={(e) => updateConfig(activeTab, { next_number: parseInt(e.target.value) || 1 })}
            className="benaya-input"
          />
          <p className="text-xs text-neutral-500">
            Le prochain numéro qui sera utilisé
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${activeTab}_separator`}>
          Séparateur
        </Label>
        <Select
          value={config.separator === '' ? 'none' : config.separator}
          onValueChange={(value) => updateConfig(activeTab, { separator: value === 'none' ? '' : value })}
        >
          <SelectTrigger className="benaya-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">Tiret (-)</SelectItem>
            <SelectItem value="_">Underscore (_)</SelectItem>
            <SelectItem value=".">Point (.)</SelectItem>
            <SelectItem value="/">Slash (/)</SelectItem>
            <SelectItem value="none">Aucun séparateur</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500">
          Caractère de séparation entre les parties du numéro
        </p>
      </div>
    </div>
  );

  const renderDateSettings = (config: DocumentNumbering) => (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Inclure l'année</Label>
            <p className="text-xs text-neutral-500">Ajouter l'année dans le numéro</p>
          </div>
          <Switch
            checked={config.include_year}
            onCheckedChange={(checked) => updateConfig(activeTab, { include_year: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Inclure le mois</Label>
            <p className="text-xs text-neutral-500">Ajouter le mois dans le numéro</p>
          </div>
          <Switch
            checked={config.include_month}
            onCheckedChange={(checked) => updateConfig(activeTab, { include_month: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="font-medium">Inclure le jour</Label>
            <p className="text-xs text-neutral-500">Ajouter le jour dans le numéro</p>
          </div>
          <Switch
            checked={config.include_day}
            onCheckedChange={(checked) => updateConfig(activeTab, { include_day: checked })}
          />
        </div>
      </div>

      {(config.include_year || config.include_month || config.include_day) && (
        <div className="space-y-2">
          <Label>Format de date</Label>
          <Select
            value={config.date_format}
            onValueChange={(value) => updateConfig(activeTab, { date_format: value })}
          >
            <SelectTrigger className="benaya-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-neutral-500">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );

  const renderCustomFormat = (config: DocumentNumbering) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${activeTab}_custom_format`}>
          Format personnalisé
        </Label>
        <Textarea
          id={`${activeTab}_custom_format`}
          value={config.custom_format || ''}
          onChange={(e) => updateConfig(activeTab, { custom_format: e.target.value })}
          placeholder="{prefix}-{year}-{month}-{day}-{number}"
          className="benaya-input min-h-[80px]"
        />
        <div className="text-xs text-neutral-500">
          <p className="mb-2">Variables disponibles :</p>
          <div className="grid grid-cols-2 gap-2">
            <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{'{prefix}'}</code>
            <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{'{year}'}</code>
            <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{'{month}'}</code>
            <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{'{day}'}</code>
            <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{'{number}'}</code>
            <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{'{suffix}'}</code>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Formats prédéfinis</Label>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_FORMATS.map((preset) => (
            <div
              key={preset.name}
              className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{preset.name}</div>
                <div className="text-xs text-neutral-500">{preset.description}</div>
                <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded mt-1 inline-block">
                  {preset.format}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPresetFormat(preset)}
              >
                <Wand2 className="w-3 h-3 mr-1" />
                Appliquer
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResetSettings = (config: DocumentNumbering) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="font-medium">Réinitialisation annuelle</Label>
          <p className="text-xs text-neutral-500">Remettre le compteur à 1 chaque année</p>
        </div>
        <Switch
          checked={config.reset_yearly}
          onCheckedChange={(checked) => updateConfig(activeTab, { reset_yearly: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="font-medium">Réinitialisation mensuelle</Label>
          <p className="text-xs text-neutral-500">Remettre le compteur à 1 chaque mois</p>
        </div>
        <Switch
          checked={config.reset_monthly}
          onCheckedChange={(checked) => updateConfig(activeTab, { reset_monthly: checked })}
        />
      </div>

      {config.reset_yearly && config.reset_monthly && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Attention :</strong> La réinitialisation mensuelle prendra le pas sur la réinitialisation annuelle.
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const config = getConfigForType(activeTab);

  return (
    <div className="space-y-6">
      {/* Onglets pour chaque type de document */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
        <TabsList className="grid w-full grid-cols-3">
          {DOCUMENT_TYPES.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {DOCUMENT_TYPES.map(({ key }) => (
          <TabsContent key={key} value={key} className="space-y-6">
            {/* Aperçu en temps réel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Aperçu du format
                </CardTitle>
                <CardDescription>
                  Voici à quoi ressemblera le prochain numéro généré
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border">
                  <div className="font-mono text-lg font-medium">
                    {previewData[key] || 'Format invalide'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(previewData[key], key)}
                  >
                    {copied === key ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {config.format_description && (
                  <p className="text-sm text-neutral-500 mt-2">
                    {config.format_description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Configuration */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Général</TabsTrigger>
                <TabsTrigger value="date">Date</TabsTrigger>
                <TabsTrigger value="custom">Personnalisé</TabsTrigger>
                <TabsTrigger value="reset">Réinitialisation</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Paramètres généraux</CardTitle>
                    <CardDescription>
                      Configuration de base du format de numérotation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderBasicSettings(config)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="date" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Paramètres de date</CardTitle>
                    <CardDescription>
                      Choisissez quelles parties de la date inclure dans le numéro
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderDateSettings(config)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Format personnalisé</CardTitle>
                    <CardDescription>
                      Définissez un format complètement personnalisé ou utilisez un modèle prédéfini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderCustomFormat(config)}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Réinitialisation des compteurs</CardTitle>
                    <CardDescription>
                      Configurez quand les compteurs doivent être remis à zéro
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderResetSettings(config)}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        ))}
      </Tabs>

      {/* Résumé de toutes les configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des configurations</CardTitle>
          <CardDescription>
            Aperçu de tous les formats de numérotation configurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DOCUMENT_TYPES.map(({ key, label, icon: Icon }) => {
              const typeConfig = getConfigForType(key);
              return (
                <div key={key} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="font-mono text-sm bg-neutral-100 dark:bg-neutral-800 p-2 rounded">
                    {previewData[key]}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {typeConfig.include_year && <Badge variant="secondary" className="text-xs">Année</Badge>}
                    {typeConfig.include_month && <Badge variant="secondary" className="text-xs">Mois</Badge>}
                    {typeConfig.include_day && <Badge variant="secondary" className="text-xs">Jour</Badge>}
                    {typeConfig.custom_format && <Badge variant="outline" className="text-xs">Personnalisé</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}