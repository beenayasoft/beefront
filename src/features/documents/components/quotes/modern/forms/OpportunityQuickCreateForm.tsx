/**
 * Formulaire de création rapide d'opportunité
 * Pour l'étape opportunité du wizard de devis
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, DollarSign, TrendingUp, Calendar, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { CreateOpportunityData, OpportunityStatus } from '@/features/crm/types/crm.types';
import { ClientOption } from '@/features/crm/types/crm.types';

// Schéma de validation
const opportunityFormSchema = z.object({
  name: z.string()
    .min(1, 'Le nom de l\'opportunité est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  stage: z.nativeEnum(OpportunityStatus, {
    errorMap: () => ({ message: 'Sélectionnez un statut valide' })
  }),
  
  estimated_amount: z.coerce.number()
    .min(0, 'Le montant doit être positif')
    .max(999999999, 'Montant trop élevé'),
  
  probability: z.coerce.number()
    .min(0, 'La probabilité doit être entre 0 et 100')
    .max(100, 'La probabilité doit être entre 0 et 100'),
  
  expected_close_date: z.string()
    .min(1, 'La date de clôture prévue est requise')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'La date de clôture doit être dans le futur'),
  
  source: z.string()
    .min(1, 'La source est requise')
    .max(50, 'La source ne peut pas dépasser 50 caractères'),
  
  description: z.string()
    .optional()
    .refine((val) => !val || val.length <= 500, 'La description ne peut pas dépasser 500 caractères')
});

type OpportunityFormData = z.infer<typeof opportunityFormSchema>;

interface OpportunityQuickCreateFormProps {
  client: ClientOption;
  defaultName?: string;
  onSubmit: (data: CreateOpportunityData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Configuration des statuts d'opportunité
const STAGE_OPTIONS = [
  { 
    value: OpportunityStatus.NEW, 
    label: 'Nouvelle', 
    description: 'Opportunité identifiée',
    probability: 10
  },
  { 
    value: OpportunityStatus.NEEDS_ANALYSIS, 
    label: 'Analyse des besoins', 
    description: 'Qualification en cours',
    probability: 25
  },
  { 
    value: OpportunityStatus.NEGOTIATION, 
    label: 'Négociation', 
    description: 'Proposition envoyée',
    probability: 60
  }
];

// Sources d'opportunité - mapping avec les valeurs du backend
const SOURCE_OPTIONS = [
  { value: 'website', label: 'Site web' },
  { value: 'referral', label: 'Recommandation' },
  { value: 'cold_call', label: 'Démarchage téléphonique' },
  { value: 'partner', label: 'Partenaire' },
  { value: 'exhibition', label: 'Salon/Exposition' },
  { value: 'other', label: 'Autre' }
];

export const OpportunityQuickCreateForm: React.FC<OpportunityQuickCreateFormProps> = ({
  client,
  defaultName = '',
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: {
      name: defaultName,
      stage: OpportunityStatus.NEW,
      estimated_amount: 0,
      probability: 10,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
      source: 'website', // Utiliser la valeur backend
      description: ''
    }
  });

  // Ajuster automatiquement la probabilité selon le statut
  const handleStageChange = (stage: OpportunityStatus) => {
    const stageConfig = STAGE_OPTIONS.find(s => s.value === stage);
    if (stageConfig) {
      form.setValue('probability', stageConfig.probability);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (data: OpportunityFormData) => {
    try {
      const opportunityData: CreateOpportunityData = {
        ...data,
        tier: client.id
      };
      
      console.log('📝 Données formulaire transformées:', opportunityData);
      
      await onSubmit(opportunityData);
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      
      // Gestion spécifique des erreurs de validation
      if (error?.response?.status === 400 && error?.response?.data) {
        const errorData = error.response.data;
        
        // Traiter les erreurs de champs pour les afficher dans le formulaire
        Object.keys(errorData).forEach(fieldName => {
          const fieldErrors = Array.isArray(errorData[fieldName]) 
            ? errorData[fieldName] 
            : [errorData[fieldName]];
          
          // Essayer de mapper l'erreur sur le bon champ du formulaire
          if (form.getValues(fieldName as any) !== undefined) {
            form.setError(fieldName as any, {
              type: 'server',
              message: fieldErrors.join(', ')
            });
          }
        });
      }
      
      // Relancer l'erreur pour qu'elle soit gérée par le composant parent
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informations client */}
        <Card className="bg-gray-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Client sélectionné</h4>
                <p className="text-sm text-gray-600">{client.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Nom de l'opportunité *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Rénovation cuisine Mr. Martin"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleStageChange(value as OpportunityStatus);
                  }} 
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STAGE_OPTIONS.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        <div>
                          <div className="font-medium">{stage.label}</div>
                          <div className="text-xs text-gray-500">{stage.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Comment avez-vous obtenu cette opportunité ?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCE_OPTIONS.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Informations commerciales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="estimated_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Montant estimé (€) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="probability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Probabilité (%) *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected_close_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date de clôture prévue *
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez brièvement cette opportunité, les besoins du client, les enjeux..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer l'opportunité
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OpportunityQuickCreateForm;