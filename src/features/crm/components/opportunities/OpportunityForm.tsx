import { useState, useEffect, useCallback } from "react";
import { Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogHeader,
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpportunityClientSelector } from "./OpportunityClientSelector";
import { Opportunity, OpportunityStatus, OpportunitySource } from "../../types/opportunities.types";
import { TierData } from "../../api";
import { crmApi } from "@/features/crm/api";
import { usersService } from "@/lib/services/usersService";
import { User } from "@/lib/api/users";
import { formatCurrency, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ClientSearchItem } from "@/features/crm/hooks/useClientSearchForOpportunities";
import { useCurrencyInfo, useFormatCurrency } from "@/contexts/CurrencyContext";

interface OpportunityFormProps {
  opportunity?: Partial<Opportunity>;
  onSubmit: (values: Partial<Opportunity>) => void;
  onCancel: () => void;
  isEditing?: boolean;
  preselectedTierId?: string;
  disableTierSelection?: boolean;
}

export function OpportunityForm({
  opportunity,
  onSubmit,
  onCancel,
  isEditing = false,
  preselectedTierId,
  disableTierSelection,
}: OpportunityFormProps) {
  const { toast } = useToast();
  const { currencyCode, currencySymbol } = useCurrencyInfo();
  const formatCurrencyWithSymbol = useFormatCurrency();
  
  const [formData, setFormData] = useState<Partial<Opportunity>>(
    opportunity || {
      name: "",
      tierId: "",
      tierName: "",
      tierType: [],
      stage: "new",
      estimatedAmount: 1000,
      probability: 20,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      source: "website",
      description: "",
      assignedTo: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedClientData, setSelectedClientData] = useState<any>(null);
  
  // Nouvel état pour les utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Initialisation de la sélection client si pré-sélectionné
  useEffect(() => {
    if (preselectedTierId && !opportunity?.tierId && !selectedClientData) {
      // Si on a un ID pré-sélectionné, on va chercher les infos du client
      const loadPreselectedClient = async () => {
        try {
          const tierDetails = await crmApi.tiers.getTierDetails(preselectedTierId);
          const clientData: ClientSearchItem = {
            id: tierDetails.id,
            nom: tierDetails.nom,
            type: tierDetails.type,
            relation: tierDetails.relation,
            adresse: tierDetails.adresses?.[0] ? {
              rue: tierDetails.adresses[0].rue,
              ville: tierDetails.adresses[0].ville,
              code_postal: tierDetails.adresses[0].code_postal
            } : undefined
          };
          
          setSelectedClientData(clientData);
          setFormData(prev => ({
            ...prev,
            tierId: clientData.id,
            tierName: clientData.nom,
            tierType: [clientData.type],
          }));
          
          toast({
            title: "Client pré-sélectionné",
            description: `Le client "${clientData.nom}" a été automatiquement sélectionné`,
          });
        } catch (error) {
          console.error('❌ Erreur lors du chargement du client pré-sélectionné:', error);
        }
      };
      
      loadPreselectedClient();
    }
  }, [preselectedTierId, opportunity?.tierId, selectedClientData, toast]);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        
        const usersList = await usersService.getUsers();
        setUsers(usersList);
        
        console.log(`✅ Chargé ${usersList.length} utilisateurs pour le formulaire`);
        
        // Assigner automatiquement l'utilisateur courant si c'est une nouvelle opportunité
        if (!isEditing && !opportunity?.assignedTo && usersList.length > 0) {
          // Récupérer l'utilisateur courant
          const currentUser = await usersService.getCurrentUser();
          if (currentUser) {
            console.log(`🔄 Assignation automatique à l'utilisateur courant: ${currentUser.username}`);
            setFormData(prev => ({
              ...prev,
              assignedTo: currentUser.id
            }));
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        setUsersError(error instanceof Error ? error.message : 'Erreur inconnue');
        
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des utilisateurs. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [toast, isEditing, opportunity?.assignedTo]);

  // Mettre à jour le formulaire si l'opportunité change
  useEffect(() => {
    if (opportunity) {
      setFormData(opportunity);
    }
  }, [opportunity]);

  // ✅ CORRÉLATION ÉTAPE/PROBABILITÉ (comme dans le modèle Django)
  useEffect(() => {
    if (formData.stage) {
      let newProbability = formData.probability;
      
      switch (formData.stage) {
        case 'new':
          newProbability = 10;
          break;
        case 'needs_analysis':
          newProbability = 30;
          break;
        case 'negotiation':
          newProbability = 60;
          break;
        case 'won':
          newProbability = 100;
          break;
        case 'lost':
          newProbability = 0;
          break;
        default:
          // Garder la probabilité actuelle si étape inconnue
          break;
      }
      
      // Mettre à jour seulement si la probabilité a changé
      if (newProbability !== formData.probability) {
        console.log(`🔗 Corrélation étape/probabilité: ${formData.stage} → ${newProbability}%`);
        setFormData(prev => ({
          ...prev,
          probability: newProbability
        }));
      }
    }
  }, [formData.stage]); // Se déclenche uniquement quand l'étape change

  // Gérer les changements de champs
  const handleInputChange = (field: string, value: string | number | null) => {
    // Traitement spécial pour assignedTo
    if (field === "assignedTo" && value === "none") {
      setFormData((prev) => ({
        ...prev,
        [field]: "", // Utiliser une chaîne vide pour le formulaire
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Gérer le changement de client/prospect
  const handleTierChange = (tierId: string) => {
    console.log('🔄 Changement de client:', tierId);
    setFormData((prev) => ({
      ...prev,
      tierId,
      // Les autres champs seront mis à jour via onSelectedClientChange
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors.tierId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tierId;
        return newErrors;
      });
    }
  };

  // Gérer les données détaillées du client sélectionné
  const handleSelectedClientChange = (client: any) => {
    console.log('📋 Données client mises à jour:', client);
    setSelectedClientData(client);
    if (client) {
      setFormData((prev) => ({
        ...prev,
        tierId: client.id,
        tierName: client.name,
        tierType: [client.type],
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) {
      newErrors.name = "Le nom est requis";
    }
    
    if (!formData.tierId) {
      newErrors.tierId = "Le client/prospect est requis";
    }
    
    if (!formData.stage) {
      newErrors.stage = "Le statut est requis";
    }
    
    if (!formData.estimatedAmount && formData.estimatedAmount !== 0) {
      newErrors.estimatedAmount = "Le montant estimé est requis";
    } else if (formData.estimatedAmount <= 0) {
      newErrors.estimatedAmount = "Le montant estimé doit être supérieur à 0";
    }
    
    // ✅ SUPPRIMÉ : Validation probabilité (calculée automatiquement)
    // La probabilité est maintenant calculée automatiquement selon l'étape
    
    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = "La date de clôture prévue est requise";
    }
    
    if (!formData.source) {
      newErrors.source = "La source est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Logs détaillés avant soumission
      console.log('📝 Soumission du formulaire avec données:', formData);
      console.log('🔍 Vérification des champs obligatoires:');
      console.log(' - name:', formData.name ? '✅' : '❌', typeof formData.name, formData.name);
      console.log(' - tierId:', formData.tierId ? '✅' : '❌', typeof formData.tierId, formData.tierId);
      console.log(' - stage:', formData.stage ? '✅' : '❌', typeof formData.stage, formData.stage);
      console.log(' - estimatedAmount:', formData.estimatedAmount !== undefined ? '✅' : '❌', typeof formData.estimatedAmount, formData.estimatedAmount);
      console.log(' - probability:', formData.probability !== undefined ? '✅' : '❌', typeof formData.probability, formData.probability);
      console.log(' - expectedCloseDate:', formData.expectedCloseDate ? '✅' : '❌', typeof formData.expectedCloseDate, formData.expectedCloseDate);
      console.log(' - source:', formData.source ? '✅' : '❌', typeof formData.source, formData.source);
      
      console.log('🚨 ANALYSE DÉTAILLÉE DE TOUTES LES PROPRIÉTÉS:');
      Object.entries(formData).forEach(([key, value]) => {
        console.log(`   ${key}:`, typeof value, Array.isArray(value) ? '(ARRAY!)' : '', value);
      });
      
      // Nettoyer les données avant envoi pour éviter les arrays indésirables
      const cleanedData = {
        ...formData,
        // S'assurer que tierId est une string
        tierId: Array.isArray(formData.tierId) ? formData.tierId[0] : formData.tierId,
        // S'assurer que estimatedAmount est un number
        estimatedAmount: Array.isArray(formData.estimatedAmount) ? Number(formData.estimatedAmount[0]) : formData.estimatedAmount,
        // S'assurer que expectedCloseDate est une string
        expectedCloseDate: Array.isArray(formData.expectedCloseDate) ? formData.expectedCloseDate[0] : formData.expectedCloseDate,
        // tierType doit rester un array
        tierType: Array.isArray(formData.tierType) ? formData.tierType : [formData.tierType]
      };
      
      console.log('🧹 Données nettoyées:', cleanedData);
      
      onSubmit(cleanedData);
    }
  };


  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-Beenaya-500 to-Beenaya-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold">💼</span>
          </div>
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 mt-1">
              {isEditing ? 'Modifiez les informations de cette opportunité' : 'Créez une nouvelle opportunité commerciale'}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-Beenaya-600">💼</span>
                Informations de base
              </CardTitle>
              <CardDescription>
                Renseignez les informations principales de l'opportunité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className={`text-sm font-medium ${
                    errors.name ? "text-red-600" : "text-neutral-700"
                  }`}>
                    Nom de l'opportunité <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`Beenaya-input ${
                      errors.name ? "border-red-500 focus:border-red-500" : ""
                    }`}
                    placeholder="Ex: Rénovation Villa Dupont"
                  />
                  {errors.name && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tierId" className={`text-sm font-medium ${
                      errors.tierId ? "text-red-600" : "text-neutral-700"
                    }`}>
                      Client/Prospect <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      {preselectedTierId && formData.tierId === preselectedTierId && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Pré-sélectionné
                        </span>
                      )}
                      {disableTierSelection && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Client du devis
                        </span>
                      )}
                    </div>
                  </div>
                  <OpportunityClientSelector
                    value={formData.tierId || ""}
                    onValueChange={handleTierChange}
                    selectedClientData={selectedClientData}
                    onSelectedClientChange={handleSelectedClientChange}
                    placeholder="Rechercher un client/prospect..."
                    disabled={disableTierSelection}
                    className={errors.tierId ? "border-red-500" : ""}
                    error={!!errors.tierId}
                  />
                  {errors.tierId && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.tierId}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="Beenaya-input resize-none"
                  placeholder="Description détaillée du projet, besoins spécifiques, contexte..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Détails de l'opportunité */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-purple-600">⚡</span>
                Détails de l'opportunité
              </CardTitle>
              <CardDescription>
                Définissez l'étape, la source et le responsable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stage" className={`text-sm font-medium ${
                    errors.stage ? "text-red-600" : "text-neutral-700"
                  }`}>
                    Étape <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => handleInputChange("stage", value)}
                  >
                    <SelectTrigger className={`Beenaya-input ${
                      errors.stage ? "border-red-500" : ""
                    }`}>
                      <SelectValue placeholder="Sélectionner une étape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <div className="flex items-center justify-between w-full">
                          <span>Nouvelle</span>
                          <span className="text-xs text-neutral-500 ml-4">10%</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="needs_analysis">
                        <div className="flex items-center justify-between w-full">
                          <span>Analyse des besoins</span>
                          <span className="text-xs text-neutral-500 ml-4">30%</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="negotiation">
                        <div className="flex items-center justify-between w-full">
                          <span>Négociation</span>
                          <span className="text-xs text-neutral-500 ml-4">60%</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="won">
                        <div className="flex items-center justify-between w-full">
                          <span>Gagnée</span>
                          <span className="text-xs text-green-600 ml-4">100%</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lost">
                        <div className="flex items-center justify-between w-full">
                          <span>Perdue</span>
                          <span className="text-xs text-red-600 ml-4">0%</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.stage && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.stage}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="source" className={`text-sm font-medium ${
                    errors.source ? "text-red-600" : "text-neutral-700"
                  }`}>
                    Source <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => handleInputChange("source", value as OpportunitySource)}
                  >
                    <SelectTrigger className={`Beenaya-input ${
                      errors.source ? "border-red-500" : ""
                    }`}>
                      <SelectValue placeholder="Sélectionner une source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Site web</SelectItem>
                      <SelectItem value="referral">Recommandation</SelectItem>
                      <SelectItem value="cold_call">Démarchage téléphonique</SelectItem>
                      <SelectItem value="exhibition">Salon/Exposition</SelectItem>
                      <SelectItem value="partner">Partenaire</SelectItem>
                      <SelectItem value="social_media">Réseaux sociaux</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.source && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.source}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Responsable */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-amber-600">👥</span>
                Responsable
              </CardTitle>
              <CardDescription>
                Assignez un responsable à cette opportunité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="assignedTo" className="text-sm font-medium text-neutral-700">
                  Responsable
                </Label>
                <Select
                  value={formData.assignedTo || ""}
                  onValueChange={(value) => handleInputChange("assignedTo", value)}
                >
                  <SelectTrigger className="Beenaya-input">
                    <SelectValue placeholder={usersLoading ? "Chargement..." : "Sélectionner un responsable"} />
                    {usersLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun responsable</SelectItem>
                    {usersError ? (
                      <div className="p-2 text-xs text-red-500">
                        ❌ {usersError}
                      </div>
                    ) : users.length === 0 && !usersLoading ? (
                      <div className="p-2 text-xs text-neutral-500">
                        Aucun utilisateur trouvé
                      </div>
                    ) : (
                      users.map((user) => (
                        user.id ? (
                          <SelectItem key={user.id} value={user.id}>
                            {usersService.formatUserName(user)}
                          </SelectItem>
                        ) : null
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">
                  Sélectionnez un responsable pour cette opportunité (optionnel).
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Informations financières */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-emerald-600">💰</span>
                Informations financières
              </CardTitle>
              <CardDescription>
                Définissez le montant et la date de clôture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estimatedAmount" className={`text-sm font-medium ${
                    errors.estimatedAmount ? "text-red-600" : "text-neutral-700"
                  }`}>
                    Montant estimé ({currencyCode}) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="estimatedAmount"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.estimatedAmount || ""}
                      onChange={(e) => handleInputChange("estimatedAmount", parseFloat(e.target.value))}
                      className={`Beenaya-input pr-12 ${
                        errors.estimatedAmount ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-500 text-sm">
                      {currencySymbol}
                    </div>
                  </div>
                  {errors.estimatedAmount && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.estimatedAmount}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedCloseDate" className={`text-sm font-medium ${
                    errors.expectedCloseDate ? "text-red-600" : "text-neutral-700"
                  }`}>
                    Date de clôture prévue <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expectedCloseDate"
                    type="date"
                    value={formData.expectedCloseDate || ""}
                    onChange={(e) => handleInputChange("expectedCloseDate", e.target.value)}
                    className={`Beenaya-input ${
                      errors.expectedCloseDate ? "border-red-500 focus:border-red-500" : ""
                    }`}
                  />
                  {errors.expectedCloseDate && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      {errors.expectedCloseDate}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="probability" className={`text-sm font-medium ${
                    errors.probability ? "text-red-600" : "text-neutral-700"
                  }`}>
                    Probabilité (%) <span className="text-red-500">*</span>
                  </Label>
                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    ✨ Auto
                  </span>
                </div>
                <Input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability || ""}
                  readOnly
                  className="Beenaya-input bg-neutral-50 cursor-not-allowed"
                  placeholder="20"
                />
                <p className="text-xs text-neutral-500">
                  🔗 La probabilité est automatiquement ajustée selon l'étape sélectionnée
                </p>
                {errors.probability && (
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    {errors.probability}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Raison de perte (si applicable) */}
          {formData.stage === 'lost' && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2 text-red-700">
                  <span className="text-red-600">⚠️</span>
                  Raison de la perte
                </CardTitle>
                <CardDescription className="text-red-600">
                  Documentez les raisons de la perte de cette opportunité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="lossReason" className={`text-sm font-medium ${
                      errors.lossReason ? "text-red-600" : "text-red-700"
                    }`}>
                      Raison <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.lossReason || ""}
                      onValueChange={(value) => handleInputChange("lossReason", value)}
                    >
                      <SelectTrigger className={`Beenaya-input ${
                        errors.lossReason ? "border-red-500" : ""
                      }`}>
                        <SelectValue placeholder="Sélectionner une raison" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Prix trop élevé</SelectItem>
                        <SelectItem value="competitor">Concurrent choisi</SelectItem>
                        <SelectItem value="timing">Mauvais timing</SelectItem>
                        <SelectItem value="no_budget">Pas de budget</SelectItem>
                        <SelectItem value="no_need">Pas de besoin réel</SelectItem>
                        <SelectItem value="no_decision">Pas de décision prise</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.lossReason && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        {errors.lossReason}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lossDescription" className="text-sm font-medium text-red-700">
                      Description
                    </Label>
                    <Textarea
                      id="lossDescription"
                      value={formData.lossDescription || ""}
                      onChange={(e) => handleInputChange("lossDescription", e.target.value)}
                      className="Beenaya-input resize-none"
                      placeholder="Détails sur les raisons de la perte..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résumé */}
          <div className="p-4 bg-neutral-50 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-neutral-700">Montant pondéré:</span>
              <span className="font-semibold text-lg">
                {formatCurrencyWithSymbol((formData.estimatedAmount || 0) * (formData.probability || 0) / 100, { showSymbol: true })}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Le montant pondéré est calculé en multipliant le montant estimé par la probabilité de succès.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full md:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="w-full md:w-auto Beenaya-button"
          >
            <Check className="mr-2 h-4 w-4" />
            {isEditing ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}