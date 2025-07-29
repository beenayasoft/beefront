import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Building, Mail, Bell, Shield, Palette, Database, DollarSign, Calendar, FileText, Users, Printer, Cloud, Globe, Eye, EyeOff, Save, CreditCard, Receipt, Hash, FileText as FileText2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// Import custom components
import { CompanyIdentityForm } from "@/components/settings/CompanyIdentityForm";
import { LegalFinancialForm } from "@/components/settings/LegalFinancialForm";
import { VatRatesManagement } from "@/components/settings/VatRatesManagement";
import { PaymentTermsManagement } from "@/components/settings/PaymentTermsManagement";
import { NumberingFormatForm } from "@/components/settings/NumberingFormatForm";
import { DocumentAppearanceForm } from "@/components/settings/DocumentAppearanceForm";

// Import tenant API and types
import { tenantApi } from "@/lib/api/tenant";
import { TenantInfo, VatRate, PaymentTerm, DocumentNumbering } from "@/lib/types/tenant";
import { transformFrontendToBackend } from "@/features/settings/utils/tenantTransformers";

// Define the settings sections
const settingsSections = [
  {
    id: "profile",
    label: "Profil",
    icon: User,
    description: "Informations personnelles et compte",
  },
  {
    id: "company",
    label: "Mon Entreprise",
    icon: Building,
    description: "Informations de votre entreprise",
  },
  {
    id: "fiscal",
    label: "Fiscalité & Banque",
    icon: CreditCard,
    description: "Paramètres fiscaux et bancaires",
  },
  {
    id: "numbering",
    label: "Numérotation",
    icon: Hash,
    description: "Format des numéros de documents",
  },
  {
    id: "documents",
    label: "Apparence des documents",
    icon: FileText2,
    description: "Personnalisation des devis et factures",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Préférences de notifications",
  },
  {
    id: "security",
    label: "Sécurité",
    icon: Shield,
    description: "Mot de passe et sécurité",
  },
  {
    id: "data",
    label: "Données",
    icon: Database,
    description: "Sauvegarde et exportation",
  },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("company");
  const [showPassword, setShowPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Tenant data state
  const [tenantData, setTenantData] = useState<TenantInfo>({} as TenantInfo);

  // Fetch tenant data on component mount
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setIsLoading(true);
        const data = await tenantApi.getCurrentTenantInfo();
        setTenantData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données du tenant:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les données de votre entreprise.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  // Handle tenant data updates
  const handleTenantDataUpdate = (partialData: Partial<TenantInfo>) => {
    setTenantData(prev => ({
      ...prev,
      ...partialData
    }));
    setHasChanges(true);
  };

  // Mark form as dirty when changes are made
  useEffect(() => {
    setHasChanges(true);
  }, [
    tenantData,
  ]);

  // Handle save button click
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Récupérer l'ID du tenant actuel
      const tenantId = tenantData.id;

      // Transformer les données du frontend vers le format backend
      const backendData = transformFrontendToBackend(tenantData);
      
      console.log('Données transformées pour le backend:', backendData);
      
      await tenantApi.updateCurrentTenant(backendData);

      // Mettre à jour les taux de TVA
      if (tenantData.vat_rates && tenantData.vat_rates.length > 0) {
        await tenantApi.updateVatRates(tenantData.vat_rates);
      }

      // Mettre à jour les conditions de paiement
      if (tenantData.payment_terms && tenantData.payment_terms.length > 0) {
        await tenantApi.updatePaymentTerms(tenantData.payment_terms);
      }
      
      // Nous n'utilisons plus l'endpoint séparé pour document_numbering
      // car nous l'incluons dans la mise à jour principale du tenant

      setIsSaving(false);
      setHasChanges(false);
      toast({
        title: "Paramètres enregistrés",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres:", error);
      setIsSaving(false);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement des paramètres.",
        variant: "destructive",
      });
    }
  };

  const renderCompanyIdentitySettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Identité de l'entreprise</h3>
        <CompanyIdentityForm
          companyData={tenantData}
          onChange={handleTenantDataUpdate}
        />
      </div>
    </div>
  );

  const renderFinancialSettings = () => {
    return (
      <div className="benaya-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Fiscalité & Informations bancaires
          </h2>
          <CreditCard className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </div>

        <Tabs defaultValue="legal">
          <TabsList className="benaya-tabs-list">
            <TabsTrigger value="legal" className="benaya-tab">
              Informations légales & bancaires
            </TabsTrigger>
            <TabsTrigger value="vat" className="benaya-tab">
              Taux de TVA
            </TabsTrigger>
            <TabsTrigger value="payment" className="benaya-tab">
              Conditions de paiement
            </TabsTrigger>
          </TabsList>
          <TabsContent value="legal" className="pt-4">
            <LegalFinancialForm tenantData={tenantData} onChange={handleTenantDataUpdate} />
          </TabsContent>
          <TabsContent value="vat" className="pt-4">
            <VatRatesManagement
              vatRates={tenantData.vat_rates || []}
              onChange={(vatRates) => handleTenantDataUpdate({ vat_rates: vatRates })}
            />
          </TabsContent>
          <TabsContent value="payment" className="pt-4">
            <PaymentTermsManagement
              paymentTerms={tenantData.payment_terms || []}
              onChange={(paymentTerms) => handleTenantDataUpdate({ payment_terms: paymentTerms })}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderNumberingSettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Format de numérotation</h3>
        <NumberingFormatForm
          numberingSettings={{
            quoteFormat: tenantData.document_numbering?.find(d => d.document_type === 'quote')?.prefix || "DEV-{AAAA}-{XXXX}",
            invoiceFormat: tenantData.document_numbering?.find(d => d.document_type === 'invoice')?.prefix || "FAC-{AAAA}-{XXXX}",
            resetFrequency: tenantData.document_numbering?.find(d => d.document_type === 'quote')?.reset_yearly ? "yearly" : 
                          tenantData.document_numbering?.find(d => d.document_type === 'quote')?.reset_monthly ? "monthly" : "never",
            nextQuoteNumber: tenantData.document_numbering?.find(d => d.document_type === 'quote')?.next_number || 1,
            nextInvoiceNumber: tenantData.document_numbering?.find(d => d.document_type === 'invoice')?.next_number || 1
          }}
          onChange={(numberingSettings) => {
            // Convertir l'objet numberingSettings en tableau document_numbering
            const documentNumbering = [
              {
                document_type: 'quote',
                prefix: numberingSettings.quoteFormat,
                padding: 4,
                next_number: numberingSettings.nextQuoteNumber,
                include_year: numberingSettings.quoteFormat.includes('{AAAA}') || numberingSettings.quoteFormat.includes('{AA}'),
                include_month: numberingSettings.quoteFormat.includes('{MM}'),
                reset_yearly: numberingSettings.resetFrequency === 'yearly',
                reset_monthly: numberingSettings.resetFrequency === 'monthly'
              },
              {
                document_type: 'invoice',
                prefix: numberingSettings.invoiceFormat,
                padding: 4,
                next_number: numberingSettings.nextInvoiceNumber,
                include_year: numberingSettings.invoiceFormat.includes('{AAAA}') || numberingSettings.invoiceFormat.includes('{AA}'),
                include_month: numberingSettings.invoiceFormat.includes('{MM}'),
                reset_yearly: numberingSettings.resetFrequency === 'yearly',
                reset_monthly: numberingSettings.resetFrequency === 'monthly'
              }
            ];
            handleTenantDataUpdate({ document_numbering: documentNumbering });
          }}
        />
      </div>
    </div>
  );

  const renderDocumentAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Apparence des documents</h3>
        <DocumentAppearanceForm
          appearanceSettings={tenantData.document_appearance}
          onChange={(appearanceSettings) => handleTenantDataUpdate({ document_appearance: appearanceSettings })}
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Notifications email</h3>

        <div className="space-y-4">
          {[
            {
              title: "Nouveaux devis",
              description: "Quand un nouveau devis est créé",
              defaultChecked: true,
            },
            {
              title: "Factures payées",
              description: "Quand une facture est marquée comme payée",
              defaultChecked: true,
            },
            {
              title: "Échéances proches",
              description: "Rappels d'échéances dans 3 jours",
              defaultChecked: true,
            },
            {
              title: "Stock faible",
              description: "Quand un article atteint le stock minimum",
              defaultChecked: false,
            },
            {
              title: "Rapport hebdomadaire",
              description: "Résumé des activités de la semaine",
              defaultChecked: false,
            },
          ].map((notification) => (
            <div
              key={notification.title}
              className="flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <Label className="font-medium">{notification.title}</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {notification.description}
                </p>
              </div>
              <Switch defaultChecked={notification.defaultChecked} />
            </div>
          ))}
        </div>
      </div>

      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Notifications push</h3>

        <div className="space-y-4">
          {[
            {
              title: "Interventions urgentes",
              description: "Notifications pour les interventions urgentes",
              defaultChecked: true,
            },
            {
              title: "Messages clients",
              description: "Nouveaux messages de clients",
              defaultChecked: true,
            },
            {
              title: "Mises à jour système",
              description: "Nouvelles fonctionnalités et corrections",
              defaultChecked: false,
            },
          ].map((notification) => (
            <div
              key={notification.title}
              className="flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <Label className="font-medium">{notification.title}</Label>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {notification.description}
                </p>
              </div>
              <Switch defaultChecked={notification.defaultChecked} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Mot de passe</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                className="benaya-input pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input id="newPassword" type="password" className="benaya-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="benaya-input"
            />
          </div>
          <Button className="benaya-button-primary">
            Mettre à jour le mot de passe
          </Button>
        </div>
      </div>

      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Authentification à deux facteurs</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Activer 2FA</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Utiliser une application d'authentification
              </p>
            </div>
            <Switch />
          </div>
          <Button variant="outline">Configurer l'authentificateur</Button>
        </div>
      </div>

      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Sessions actives</h3>

        <div className="space-y-3">
          {[
            {
              device: "Chrome sur Windows",
              location: "Casablanca, Maroc",
              lastActive: "Maintenant",
              current: true,
            },
            {
              device: "Safari sur iPhone",
              location: "Rabat, Maroc",
              lastActive: "Il y a 2 heures",
              current: false,
            },
          ].map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                      Actuelle
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {session.location} • {session.lastActive}
                </p>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm">
                  Déconnecter
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Sauvegarde automatique</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Sauvegarde quotidienne</Label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Sauvegarde automatique tous les jours à 2h00
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="space-y-2">
            <Label>Dernière sauvegarde</Label>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              20/01/2025 à 02:00 (Succès)
            </p>
          </div>
          <Button variant="outline">Créer une sauvegarde maintenant</Button>
        </div>
      </div>

      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Exportation de données</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Clients", description: "Liste complète des clients" },
              { label: "Devis", description: "Tous les devis créés" },
              { label: "Factures", description: "Historique des factures" },
              { label: "Stock", description: "Inventaire complet" },
            ].map((dataType) => (
              <div
                key={dataType.label}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                <h4 className="font-medium">{dataType.label}</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {dataType.description}
                </p>
                <Button variant="outline" size="sm">
                  Exporter CSV
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Suppression de compte</h3>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Supprimer définitivement mon compte
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Toutes vos données seront supprimées définitivement. Cette action
              ne peut pas être annulée.
            </p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-300">
            Supprimer mon compte
          </Button>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Informations personnelles</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              defaultValue="Jean"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              defaultValue="Dupont"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue="jean@benaya.fr"
              className="benaya-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              defaultValue="+212 6 12 34 56 78"
              className="benaya-input"
            />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="bio">Biographie</Label>
          <Textarea
            id="bio"
            placeholder="Quelques mots sur vous..."
            className="benaya-input min-h-[100px]"
          />
        </div>
      </div>

      <div className="benaya-card">
        <h3 className="font-medium text-lg mb-4">Photo de profil</h3>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-benaya-900 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">J</span>
          </div>
          <div className="space-y-2">
            <Button variant="outline">Changer la photo</Button>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              PNG, JPG jusqu'à 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSettings();
      case "company":
        return renderCompanyIdentitySettings();
      case "fiscal":
        return renderFinancialSettings();
      case "numbering":
        return renderNumberingSettings();
      case "documents":
        return renderDocumentAppearanceSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "data":
        return renderDataSettings();
      default:
        return renderCompanyIdentitySettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-benaya-100 mt-1">
              Configurez votre application Benaya
            </p>
          </div>
          <SettingsIcon className="w-8 h-8 text-white/80" />
        </div>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="benaya-card">
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
              Configuration
            </h3>
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                      activeSection === section.id
                        ? "bg-benaya-900 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{section.label}</div>
                      <div
                        className={cn(
                          "text-xs",
                          activeSection === section.id
                            ? "text-white/80"
                            : "text-neutral-500 dark:text-neutral-400",
                        )}
                      >
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {renderSectionContent()}

            {/* Save Button */}
            {hasChanges && (
              <div className="fixed bottom-6 right-6 z-50">
                <Button 
                  className="benaya-button-primary shadow-lg"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}