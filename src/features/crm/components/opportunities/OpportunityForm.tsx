import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Opportunity, OpportunityStatus, OpportunitySource } from "../../types/opportunities.types";
import { TierData } from "../../api/tiers";
import { crmApi } from "@/features/crm/api";
import { usersService } from "@/lib/services/usersService";
import { User } from "@/lib/api/users";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
      assignedTo: "", // Changer null à chaîne vide pour éviter les erreurs de validation
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tiersError, setTiersError] = useState<string | null>(null);
  
  // Nouvel état pour les utilisateurs
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Charger les tiers depuis l'API
  useEffect(() => {
    const loadTiers = async () => {
      try {
        setTiersLoading(true);
        setTiersError(null);
        
        // Récupérer clients et prospects séparément puis les combiner
        const [clientsResponse, prospectsResponse] = await Promise.all([
          crmApi.tiers.getTiers(1, 100, { relation: 'client' }),
          crmApi.tiers.getTiers(1, 100, { relation: 'prospect' })
        ]);
        
        const allTiers = [...clientsResponse.results, ...prospectsResponse.results];
        setTiers(allTiers);
        
        console.log(`✅ Chargé ${allTiers.length} clients/prospects pour le formulaire`);
        
        // 🚀 Phase 4 : Pré-sélectionner le tier si fourni
        if (preselectedTierId && !opportunity?.tierId) {
          const preselectedTier = allTiers.find(tier => tier.id === preselectedTierId);
          if (preselectedTier) {
            console.log(`🎯 Pré-sélection du tier:`, preselectedTier);
            setFormData(prev => ({
              ...prev,
              tierId: preselectedTier.id,
              tierName: preselectedTier.nom,
              tierType: [preselectedTier.type],
            }));
            
            toast({
              title: "Client pré-sélectionné",
              description: `Le client "${preselectedTier.nom}" a été automatiquement sélectionné`,
            });
          } else {
            console.warn(`⚠️ Tier ${preselectedTierId} non trouvé dans la liste des clients/prospects`);
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des tiers:', error);
        setTiersError(error instanceof Error ? error.message : 'Erreur inconnue');
        
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des clients/prospects. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setTiersLoading(false);
      }
    };

    loadTiers();
  }, [toast, preselectedTierId, opportunity?.tierId]);

  // Charger les utilisateurs depuis l'API avec timeout optimisé
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        
        // Chargement en parallèle avec timeout réduit
        const [usersList, currentUser] = await Promise.allSettled([
          Promise.race([
            usersService.getUsers(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout - Utilisateurs')), 10000)
            )
          ]),
          Promise.race([
            usersService.getCurrentUser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout - Utilisateur courant')), 10000)
            )
          ])
        ]);
        
        // Traiter la liste des utilisateurs
        if (usersList.status === 'fulfilled') {
          setUsers(usersList.value as any[]);
          console.log(`✅ Chargé ${(usersList.value as any[]).length} utilisateurs pour le formulaire`);
        } else {
          console.warn('⚠️ Échec du chargement des utilisateurs, utilisation du fallback');
          // Le service a déjà un fallback avec des utilisateurs par défaut
          const fallbackUsers = await usersService.getUsers();
          setUsers(fallbackUsers);
        }
        
        // Assigner automatiquement l'utilisateur courant si c'est une nouvelle opportunité
        if (!isEditing && !opportunity?.assignedTo) {
          if (currentUser.status === 'fulfilled' && currentUser.value) {
            const user = currentUser.value as any;
            console.log(`🔄 Assignation automatique à l'utilisateur courant: ${user.username}`);
            setFormData(prev => ({
              ...prev,
              assignedTo: user.id
            }));
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        setUsersError('Service utilisateurs indisponible');
        
        // Utiliser le fallback même en cas d'erreur
        try {
          const fallbackUsers = await usersService.getUsers();
          setUsers(fallbackUsers);
          console.log('⚠️ Utilisation des utilisateurs par défaut suite à l\'erreur');
        } catch (fallbackError) {
          console.error('❌ Échec du fallback utilisateurs:', fallbackError);
        }
        
        toast({
          title: "Service utilisateurs lent",
          description: "Utilisation des utilisateurs par défaut.",
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
    const selectedTier = tiers.find((tier) => tier.id === tierId);
    if (selectedTier) {
      setFormData((prev) => ({
        ...prev,
        tierId,
        tierName: selectedTier.nom,
        tierType: [selectedTier.type],
      }));
      
      // Effacer l'erreur pour ce champ
      if (errors.tierId) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.tierId;
          return newErrors;
        });
      }
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
      console.log(' - name:', formData.name ? '✅' : '❌');
      console.log(' - tierId:', formData.tierId ? '✅' : '❌');
      console.log(' - stage:', formData.stage ? '✅' : '❌');
      console.log(' - estimatedAmount:', formData.estimatedAmount !== undefined ? '✅' : '❌', formData.estimatedAmount);
      console.log(' - probability:', formData.probability !== undefined ? '✅' : '❌', formData.probability);
      console.log(' - expectedCloseDate:', formData.expectedCloseDate ? '✅' : '❌', formData.expectedCloseDate);
      console.log(' - source:', formData.source ? '✅' : '❌');
      
      onSubmit(formData);
    }
  };

  // Remplacer le champ assignedTo désactivé par un Select avec les utilisateurs
  const renderAssignedToField = () => (
    <div className="space-y-2">
      <Label htmlFor="assignedTo">
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
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations de base</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>
              Nom de l'opportunité <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`Beenaya-input ${errors.name ? "border-red-500" : ""}`}
              placeholder="Ex: Rénovation Villa Dupont"
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tierId" className={errors.tierId ? "text-red-500" : ""}>
              Client/Prospect <span className="text-red-500">*</span>
              {/* 🚀 Phase 4 : Indicateur de pré-sélection */}
              {preselectedTierId && formData.tierId === preselectedTierId && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ✓ Pré-sélectionné depuis la fiche client
                </span>
              )}
              {disableTierSelection && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  ✓ Client du devis
                </span>
              )}
            </Label>
            <Select
              value={formData.tierId}
              onValueChange={handleTierChange}
              disabled={tiersLoading || disableTierSelection}
            >
              <SelectTrigger className={`Beenaya-input ${errors.tierId ? "border-red-500" : ""} ${
                preselectedTierId && formData.tierId === preselectedTierId 
                  ? "border-green-500 bg-green-50 ring-2 ring-green-200" 
                  : ""
              }`}>
                <SelectValue 
                  placeholder={
                    tiersLoading 
                      ? "Chargement des clients..." 
                      : tiersError 
                        ? "Erreur de chargement" 
                        : "Sélectionner un client/prospect"
                  } 
                />
                {tiersLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </SelectTrigger>
              <SelectContent>
                {tiersError ? (
                  <SelectItem value="error" disabled>
                    ❌ {tiersError}
                  </SelectItem>
                ) : tiers.length === 0 && !tiersLoading ? (
                  <SelectItem value="empty" disabled>
                    Aucun client/prospect trouvé
                  </SelectItem>
                ) : (
                  tiers.map((tier) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      <div className="flex items-center space-x-2">
                        <span>{tier.nom}</span>
                        {tier.type && (
                          <span className="text-xs text-neutral-500">
                            ({tier.type})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.tierId && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.tierId}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="Beenaya-input resize-none"
            placeholder="Description du projet"
            rows={3}
          />
        </div>
      </div>

      {/* Détails de l'opportunité */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Détails de l'opportunité</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stage" className={errors.stage ? "text-red-500" : ""}>
              Étape <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.stage}
              onValueChange={(value) => handleInputChange("stage", value)}
            >
              <SelectTrigger className={`Beenaya-input ${errors.stage ? "border-red-500" : ""}`}>
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
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.stage}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source" className={errors.source ? "text-red-500" : ""}>
              Source <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.source}
              onValueChange={(value) => handleInputChange("source", value as OpportunitySource)}
            >
              <SelectTrigger className={`Beenaya-input ${errors.source ? "border-red-500" : ""}`}>
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
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.source}
              </p>
            )}
          </div>
          
          {renderAssignedToField()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedAmount" className={errors.estimatedAmount ? "text-red-500" : ""}>
              Montant estimé (MAD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimatedAmount"
              type="number"
              min="0"
              step="1000"
              value={formData.estimatedAmount || ""}
              onChange={(e) => handleInputChange("estimatedAmount", parseFloat(e.target.value))}
              className={`Beenaya-input ${errors.estimatedAmount ? "border-red-500" : ""}`}
              placeholder="0"
            />
            {errors.estimatedAmount && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.estimatedAmount}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="probability" className={errors.probability ? "text-red-500" : ""}>
              Probabilité (%) <span className="text-red-500">*</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                ✨ Calculée automatiquement
              </span>
            </Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={formData.probability || ""}
              readOnly
              className={`Beenaya-input bg-neutral-50 cursor-not-allowed ${errors.probability ? "border-red-500" : "border-blue-300"}`}
              placeholder="20"
            />
            <p className="text-xs text-neutral-500">
              🔗 La probabilité est automatiquement ajustée selon l'étape sélectionnée
            </p>
            {errors.probability && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.probability}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expectedCloseDate" className={errors.expectedCloseDate ? "text-red-500" : ""}>
              Date de clôture prévue <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate || ""}
              onChange={(e) => handleInputChange("expectedCloseDate", e.target.value)}
              className={`Beenaya-input ${errors.expectedCloseDate ? "border-red-500" : ""}`}
            />
            {errors.expectedCloseDate && (
              <p className="text-xs text-red-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.expectedCloseDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Raison de perte (si applicable) */}
      {formData.stage === 'lost' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Raison de la perte</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lossReason" className={errors.lossReason ? "text-red-500" : ""}>
                Raison <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.lossReason || ""}
                onValueChange={(value) => handleInputChange("lossReason", value)}
              >
                <SelectTrigger className={`Beenaya-input ${errors.lossReason ? "border-red-500" : ""}`}>
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
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.lossReason}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lossDescription">
                Description
              </Label>
              <Textarea
                id="lossDescription"
                value={formData.lossDescription || ""}
                onChange={(e) => handleInputChange("lossDescription", e.target.value)}
                className="Beenaya-input resize-none"
                placeholder="Détails sur la raison de la perte"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Montant pondéré */}
      <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-neutral-700 dark:text-neutral-300">Montant pondéré:</span>
          <span className="font-semibold text-lg">
            {formatCurrency((formData.estimatedAmount || 0) * (formData.probability || 0) / 100)} MAD
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Le montant pondéré est calculé en multipliant le montant estimé par la probabilité de succès.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="Beenaya-button-primary">
          <Check className="mr-2 h-4 w-4" />
          {isEditing ? "Mettre à jour" : "Créer l'opportunité"}
        </Button>
      </DialogFooter>
    </form>
  );
}