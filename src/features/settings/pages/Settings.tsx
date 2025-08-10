import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Building, Mail, Bell, Shield, Palette, Database, DollarSign, Calendar, FileText, Users, Printer, Cloud, Globe, Eye, EyeOff, Save, CreditCard, Receipt, Hash, FileText as FileText2, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
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
import { CompanyIdentityForm } from "@/features/settings/components/CompanyIdentityForm";
import { LegalFinancialForm } from "@/features/settings/components/LegalFinancialForm";
import { VatRatesManagement } from "@/features/settings/components/VatRatesManagement";
import { PaymentTermsManagement } from "@/features/settings/components/PaymentTermsManagement";
import { NumberingFormatForm } from "@/features/settings/components/NumberingFormatForm";
import { DocumentAppearanceForm } from "@/features/settings/components/DocumentAppearanceForm";
import { PaymentMethodsManagement } from "@/features/payment-methods/components/PaymentMethodsManagement";

// Import settings API and types
import { settingsApi } from "@/features/settings";
import { TenantInfo, VatRate, PaymentTerm, DocumentNumbering } from "@/lib/types/tenant";
import { authApi } from "@/lib/api/auth";
import { UserAvatar } from "@/components/ui/UserAvatar";

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
    id: "payment-methods",
    label: "Moyens de paiement",
    icon: Receipt,
    description: "Gestion des moyens de paiement",
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
  const { user, updateUser } = useAuth();
  // Récupérer la section active depuis localStorage ou utiliser "company" par défaut
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('settings-active-section') || "company";
  });
  // État pour gérer l'affichage des sous-sections
  const [isInSubSection, setIsInSubSection] = useState(false);
  const [subSectionTitle, setSubSectionTitle] = useState("");
  
  // État pour gérer l'expansion/réduction de la navigation
  const [isNavCollapsed, setIsNavCollapsed] = useState(() => {
    return localStorage.getItem('settings-nav-collapsed') === 'true';
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Tenant data state
  const [tenantData, setTenantData] = useState<TenantInfo>({} as TenantInfo);
  
  // User data state for profile section
  const [userData, setUserData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: ''
  });

  // Sync user data when user changes
  useEffect(() => {
    if (user) {
      setUserData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: ''
      });
    }
  }, [user]);

  // Fetch tenant data on component mount
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setIsLoading(true);
        const data = await settingsApi.getCurrentTenantInfo();
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

  // Handle user data updates
  const handleUserDataUpdate = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  // Mark form as dirty when changes are made
  useEffect(() => {
    setHasChanges(true);
  }, [
    tenantData,
  ]);

  // Fonction pour changer de section et la sauvegarder
  const handleSectionChange = (sectionId: string) => {
    // Si on clique sur "documents", on navigue vers la sous-section
    if (sectionId === "documents") {
      setIsInSubSection(true);
      setSubSectionTitle("Apparence des documents");
      setActiveSection(sectionId);
    } else {
      setActiveSection(sectionId);
      setIsInSubSection(false);
      setSubSectionTitle("");
    }
    localStorage.setItem('settings-active-section', sectionId);
  };

  // Fonction pour revenir à la vue principale
  const handleBackToMain = () => {
    setIsInSubSection(false);
    setSubSectionTitle("");
  };

  // Fonction pour toggle l'état de la navigation
  const toggleNavCollapse = () => {
    const newState = !isNavCollapsed;
    setIsNavCollapsed(newState);
    localStorage.setItem('settings-nav-collapsed', newState.toString());
  };

  // Handle save button click
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Si on est dans la section profil, sauvegarder les données utilisateur
      if (activeSection === 'profile') {
        await authApi.updateUserInfo({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone
        });
        
        toast({
          title: "Profil mis à jour",
          description: "Vos informations personnelles ont été mises à jour avec succès.",
        });
      } else {
        // Pour les autres sections, sauvegarder les données du tenant
        await settingsApi.updateCurrentTenant(tenantData);
        
        toast({
          title: "Paramètres enregistrés",
          description: "Vos modifications ont été enregistrées avec succès.",
        });
      }

      setIsSaving(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des paramètres:", error);
      setIsSaving(false);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement.",
        variant: "destructive",
      });
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez utiliser un fichier PNG, JPG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille du fichier ne doit pas dépasser 2MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const result = await authApi.uploadAvatar(file);
      
      toast({
        title: "Avatar mis à jour",
        description: result.message,
      });

      // Mettre à jour les données utilisateur dans le contexte avec la nouvelle URL de l'avatar
      const userData = await authApi.getUserInfo();
      if (userData) {
        // Utiliser updateUser du contexte d'authentification pour persister l'avatar
        if (typeof updateUser === 'function') {
          updateUser(userData);
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'upload de l'avatar.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar deletion
  const handleAvatarDelete = async () => {
    try {
      setIsSaving(true);
      const result = await authApi.deleteAvatar();
      
      toast({
        title: "Avatar supprimé",
        description: result.message,
      });

      // Mettre à jour les données utilisateur dans le contexte pour supprimer l'avatar
      const userData = await authApi.getUserInfo();
      if (userData) {
        // Utiliser updateUser du contexte d'authentification
        updateUser(userData);
      }
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avatar:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'avatar.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCompanyIdentitySettings = () => (
    <div className="space-y-6">
      <div className="Beenaya-card">
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
      <div className="Beenaya-card space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Fiscalité & Informations bancaires
          </h2>
          <CreditCard className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
        </div>

        <Tabs defaultValue="legal">
          <TabsList className="Beenaya-tabs-list">
            <TabsTrigger value="legal" className="Beenaya-tab">
              Informations légales & bancaires
            </TabsTrigger>
            <TabsTrigger value="vat" className="Beenaya-tab">
              Taux de TVA
            </TabsTrigger>
            <TabsTrigger value="payment" className="Beenaya-tab">
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
      <div className="Beenaya-card">
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
      <div className="Beenaya-card">
        <h3 className="font-medium text-lg mb-4">Apparence des documents</h3>
        <DocumentAppearanceForm
          appearanceSettings={tenantData.document_appearance}
          onChange={(appearanceSettings) => handleTenantDataUpdate({ document_appearance: appearanceSettings })}
        />
      </div>
    </div>
  );

  const renderPaymentMethodsSettings = () => (
    <div className="space-y-6">
      <div className="Beenaya-card">
        <PaymentMethodsManagement />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="Beenaya-card">
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

      <div className="Beenaya-card">
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
      <div className="Beenaya-card">
        <h3 className="font-medium text-lg mb-4">Mot de passe</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                className="Beenaya-input pr-10"
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
            <Input id="newPassword" type="password" className="Beenaya-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="Beenaya-input"
            />
          </div>
          <Button className="Beenaya-button-primary">
            Mettre à jour le mot de passe
          </Button>
        </div>
      </div>

      <div className="Beenaya-card">
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

      <div className="Beenaya-card">
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
      <div className="Beenaya-card">
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

      <div className="Beenaya-card">
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

      <div className="Beenaya-card">
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

  const renderProfileSettings = () => {
    // Obtenir les initiales de l'utilisateur pour l'avatar
    const getInitials = () => {
      if (user?.first_name && user?.last_name) {
        return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
      }
      if (user?.first_name) {
        return user.first_name.charAt(0).toUpperCase();
      }
      if (user?.username) {
        return user.username.charAt(0).toUpperCase();
      }
      return "U";
    };

    return (
      <div className="space-y-6">
        <div className="Beenaya-card">
          <h3 className="font-medium text-lg mb-4">Informations personnelles</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={userData.first_name}
                onChange={(e) => handleUserDataUpdate('first_name', e.target.value)}
                className="Beenaya-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={userData.last_name}
                onChange={(e) => handleUserDataUpdate('last_name', e.target.value)}
                className="Beenaya-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleUserDataUpdate('email', e.target.value)}
                className="Beenaya-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => handleUserDataUpdate('phone', e.target.value)}
                className="Beenaya-input"
                placeholder="+212 6 12 34 56 78"
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="bio">Biographie</Label>
            <Textarea
              id="bio"
              value={userData.bio}
              onChange={(e) => handleUserDataUpdate('bio', e.target.value)}
              placeholder="Quelques mots sur vous..."
              className="Beenaya-input min-h-[100px]"
            />
          </div>
        </div>

        <div className="Beenaya-card">
          <h3 className="font-medium text-lg mb-4">Photo de profil</h3>
          
          <div className="flex items-center gap-4">
            <UserAvatar 
              size="xl" 
              className="border-2 border-Beenaya-200 dark:border-Beenaya-800"
              fallbackClassName="bg-Beenaya-900 text-white" 
            />
            <div className="space-y-2">
              <input
                type="file"
                id="avatar-upload"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isSaving}
                >
                  {isSaving ? "Upload..." : "Changer la photo"}
                </Button>
                {user?.avatar && (
                  <Button 
                    variant="outline" 
                    onClick={handleAvatarDelete}
                    disabled={isSaving}
                    className="text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </Button>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                PNG, JPG, WebP jusqu'à 2MB
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      case "payment-methods":
        return renderPaymentMethodsSettings();
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
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Bouton retour pour les sous-sections */}
            {isInSubSection && (
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Retour</span>
              </button>
            )}
            
            <div>
              <h1 className="text-2xl font-bold">
                {isInSubSection ? subSectionTitle : "Paramètres"}
              </h1>
              <p className="text-Beenaya-100 mt-1">
                {isInSubSection 
                  ? "Personnalisez l'apparence de vos documents" 
                  : "Configurez votre application Beenaya"
                }
              </p>
            </div>
          </div>
          <SettingsIcon className="w-8 h-8 text-white/80" />
        </div>
      </div>

      {/* Conditional Layout: Sous-section pleine largeur ou layout normal */}
      {isInSubSection ? (
        /* Layout pour sous-sections - pleine largeur */
        <div className="w-full">
          {activeSection === "documents" && (
            <DocumentAppearanceForm />
          )}
        </div>
      ) : (
        /* Layout normal avec navigation */
        <div className={`grid grid-cols-1 gap-6 ${isNavCollapsed ? 'lg:grid-cols-[4rem_1fr]' : 'lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]'}`}>
          {/* Settings Navigation */}
          <div className={`transition-all duration-300 ${isNavCollapsed ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
            <div className="Beenaya-card relative">
              {/* Header avec bouton toggle */}
              <div className="flex items-center justify-between mb-4">
                {!isNavCollapsed && (
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    Configuration
                  </h3>
                )}
                <button
                  onClick={toggleNavCollapse}
                  className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  title={isNavCollapsed ? "Étendre la navigation" : "Réduire la navigation"}
                >
                  {isNavCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  )}
                </button>
              </div>
              
              <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center rounded-lg transition-all duration-200 relative group",
                      isNavCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2 text-left",
                      activeSection === section.id
                        ? "bg-Beenaya-900 text-white"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    )}
                    title={isNavCollapsed ? section.label : undefined}
                  >
                    <Icon className={cn("w-4 h-4", isNavCollapsed ? "flex-shrink-0" : "")} />
                    
                    {!isNavCollapsed && (
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
                    )}
                    
                    {/* Tooltip pour mode réduit */}
                    {isNavCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        <div className="flex items-center gap-1">
                          <span>{section.label}</span>
                        </div>
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-neutral-900 rotate-45"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className={`transition-all duration-300 ${isNavCollapsed ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <div className="space-y-6">
            {renderSectionContent()}

            {/* Save Button */}
            {hasChanges && (
              <div className="fixed bottom-6 right-6 z-50">
                <Button 
                  className="Beenaya-button-primary shadow-lg"
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
      )}
    </div>
  );
}