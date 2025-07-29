/**
 * Formulaire de création rapide de client
 * Interface optimisée pour créer un client en contexte de devis
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, User, MapPin, Phone, Mail, Save, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Schéma de validation
const clientSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['entreprise', 'particulier'], {
    required_error: 'Veuillez sélectionner un type de client'
  }),
  relation: z.enum(['client', 'prospect'], {
    required_error: 'Veuillez sélectionner une relation'
  }),
  
  // Informations optionnelles
  siret: z.string().optional(),
  tva: z.string().optional(),
  
  // Adresse
  adresse: z.object({
    rue: z.string().min(1, 'La rue est requise'),
    ville: z.string().min(1, 'La ville est requise'),
    codePostal: z.string().min(4, 'Le code postal doit contenir au moins 4 caractères'),
    pays: z.string().default('France')
  }),
  
  // Contact principal
  contact: z.object({
    prenom: z.string().optional(),
    nom: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    telephone: z.string().optional()
  })
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientQuickCreateFormProps {
  onSubmit: (data: ClientFormData) => Promise<void>;
  onCancel: () => void;
  defaultName?: string;
  defaultType?: 'entreprise' | 'particulier';
}

export const ClientQuickCreateForm: React.FC<ClientQuickCreateFormProps> = ({
  onSubmit,
  onCancel,
  defaultName = '',
  defaultType = 'entreprise'
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nom: defaultName,
      type: defaultType,
      relation: 'client',
      adresse: {
        rue: '',
        ville: '',
        codePostal: '',
        pays: 'France'
      },
      contact: {
        prenom: '',
        nom: '',
        email: '',
        telephone: ''
      }
    }
  });
  
  const clientType = form.watch('type');
  
  const handleSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Formater les données selon TiersCreateSerializer du backend
      const clientData = {
        nom: data.nom,
        type: data.type, // String simple (pas array)
        relation: data.relation,
        siret: data.siret || undefined,
        tva: data.tva || undefined,
        adresses: [
          {
            libelle: 'Adresse principale',
            rue: data.adresse.rue,
            ville: data.adresse.ville,
            code_postal: data.adresse.codePostal,
            pays: data.adresse.pays,
            is_facturation: true
          }
        ],
        contacts: data.contact.prenom || data.contact.nom || data.contact.email || data.contact.telephone ? [
          {
            prenom: data.contact.prenom || '',
            nom: data.contact.nom || '',
            email: data.contact.email || undefined,
            telephone: data.contact.telephone || undefined,
            is_contact_principal_devis: true,
            is_contact_principal_facture: true
          }
        ] : []
      };
      
      console.log('📤 Données client à envoyer:', JSON.stringify(clientData, null, 2));
      console.log('📋 Données formulaire originales:', JSON.stringify(data, null, 2));
      
      await onSubmit(clientData);
    } catch (error: any) {
      console.error('❌ Erreur création client:', error);
      console.error('❌ Response data:', error?.response?.data);
      console.error('❌ Response status:', error?.response?.status);
      
      let errorMessage = 'Erreur lors de la création du client';
      
      // Vérifier si c'est une erreur de nom déjà existant
      if (error?.response?.status === 400 && error?.response?.data?.nom) {
        const nomErrors = error.response.data.nom;
        if (Array.isArray(nomErrors) && nomErrors.some((err: string) => 
          err.includes('unique') || err.includes('existe') || err.includes('already exists')
        )) {
          errorMessage = `Le nom "${data.nom}" existe déjà. Veuillez choisir un autre nom.`;
        } else {
          errorMessage = `Erreur sur le nom : ${nomErrors.join(', ')}`;
        }
      }
      // Autres erreurs de validation
      else if (error?.response?.status === 400 && error?.response?.data) {
        const responseData = error.response.data;
        if (typeof responseData === 'object') {
          const fieldErrors = Object.entries(responseData)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorMessage = fieldErrors;
        }
      }
      // Erreurs génériques
      else {
        errorMessage = error?.response?.data?.detail ||
                      error?.response?.data?.message || 
                      error?.response?.data?.error ||
                      error?.message || 
                      'Erreur lors de la création du client';
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Erreur de soumission */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      
      {/* Type de client */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Type de client *</Label>
        <RadioGroup
          value={form.watch('type')}
          onValueChange={(value) => form.setValue('type', value as 'entreprise' | 'particulier')}
          className="grid grid-cols-2 gap-4"
        >
          <div>
            <RadioGroupItem value="entreprise" id="entreprise" className="peer sr-only" />
            <Label
              htmlFor="entreprise"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Building2 className="mb-3 h-6 w-6" />
              <span className="font-medium">Entreprise</span>
              <span className="text-xs text-muted-foreground">Société, SARL, etc.</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="particulier" id="particulier" className="peer sr-only" />
            <Label
              htmlFor="particulier"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <User className="mb-3 h-6 w-6" />
              <span className="font-medium">Particulier</span>
              <span className="text-xs text-muted-foreground">Personne physique</span>
            </Label>
          </div>
        </RadioGroup>
        {form.formState.errors.type && (
          <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
        )}
      </div>
      
      <Separator />
      
      {/* Informations de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="nom" className="text-sm font-medium">
            {clientType === 'entreprise' ? 'Raison sociale' : 'Nom complet'} *
          </Label>
          <Input
            id="nom"
            {...form.register('nom')}
            placeholder={clientType === 'entreprise' ? 'Ex: ACME Corporation' : 'Ex: Jean Dupont'}
            className="mt-1"
          />
          {form.formState.errors.nom && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.nom.message}</p>
          )}
        </div>
        
        {clientType === 'entreprise' && (
          <>
            <div>
              <Label htmlFor="siret" className="text-sm font-medium">SIRET</Label>
              <Input
                id="siret"
                {...form.register('siret')}
                placeholder="Ex: 12345678901234"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tva" className="text-sm font-medium">Numéro TVA</Label>
              <Input
                id="tva"
                {...form.register('tva')}
                placeholder="Ex: FR12345678901"
                className="mt-1"
              />
            </div>
          </>
        )}
        
        <div className="md:col-span-2">
          <Label className="text-sm font-medium">Relation *</Label>
          <RadioGroup
            value={form.watch('relation')}
            onValueChange={(value) => form.setValue('relation', value as 'client' | 'prospect')}
            className="flex gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="client" id="client" />
              <Label htmlFor="client" className="text-sm">Client actuel</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prospect" id="prospect" />
              <Label htmlFor="prospect" className="text-sm">Prospect</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      
      <Separator />
      
      {/* Adresse */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <Label className="text-base font-medium">Adresse *</Label>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="rue" className="text-sm font-medium">Rue *</Label>
            <Input
              id="rue"
              {...form.register('adresse.rue')}
              placeholder="Ex: 123 rue de la République"
              className="mt-1"
            />
            {form.formState.errors.adresse?.rue && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.adresse.rue.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="codePostal" className="text-sm font-medium">Code postal *</Label>
              <Input
                id="codePostal"
                {...form.register('adresse.codePostal')}
                placeholder="Ex: 75001"
                className="mt-1"
              />
              {form.formState.errors.adresse?.codePostal && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.adresse.codePostal.message}</p>
              )}
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="ville" className="text-sm font-medium">Ville *</Label>
              <Input
                id="ville"
                {...form.register('adresse.ville')}
                placeholder="Ex: Paris"
                className="mt-1"
              />
              {form.formState.errors.adresse?.ville && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.adresse.ville.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Contact principal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <Label className="text-base font-medium">Contact principal (optionnel)</Label>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPrenom" className="text-sm font-medium">Prénom</Label>
            <Input
              id="contactPrenom"
              {...form.register('contact.prenom')}
              placeholder="Ex: Jean"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="contactNom" className="text-sm font-medium">Nom</Label>
            <Input
              id="contactNom"
              {...form.register('contact.nom')}
              placeholder="Ex: Dupont"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="contactEmail" className="text-sm font-medium">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              {...form.register('contact.email')}
              placeholder="Ex: jean.dupont@exemple.fr"
              className="mt-1"
            />
            {form.formState.errors.contact?.email && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.contact.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="contactTelephone" className="text-sm font-medium">Téléphone</Label>
            <Input
              id="contactTelephone"
              {...form.register('contact.telephone')}
              placeholder="Ex: 01 23 45 67 89"
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      {/* Boutons d'action */}
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
              Créer le client
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ClientQuickCreateForm;