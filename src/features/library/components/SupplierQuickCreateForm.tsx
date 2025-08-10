/**
 * Formulaire de création rapide de fournisseur
 * Interface optimisée pour créer un fournisseur en contexte de création de matériau
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Phone, Mail, Save, X, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Schéma de validation pour fournisseur
const supplierSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  
  // Informations entreprise
  siret: z.string().optional(),
  numero_tva: z.string().optional(),
  
  // Adresse
  adresse: z.object({
    rue: z.string().min(1, 'La rue est requise'),
    ville: z.string().min(1, 'La ville est requise'),
    code_postal: z.string().min(4, 'Le code postal doit contenir au moins 4 caractères'),
    pays: z.string().default('France')
  }),
  
  // Contact principal
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  site_web: z.string().url('URL invalide').optional().or(z.literal('')),
  
  // Notes
  notes: z.string().max(500, 'Les notes ne peuvent pas dépasser 500 caractères').optional()
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierQuickCreateFormProps {
  onSubmit: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
  defaultName?: string;
}

export const SupplierQuickCreateForm: React.FC<SupplierQuickCreateFormProps> = ({
  onSubmit,
  onCancel,
  defaultName = ''
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      nom: defaultName,
      siret: '',
      numero_tva: '',
      adresse: {
        rue: '',
        ville: '',
        code_postal: '',
        pays: 'France'
      },
      email: '',
      telephone: '',
      site_web: '',
      notes: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, watch } = form;

  const handleFormSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      await onSubmit(data);
    } catch (error: any) {
      console.error('Erreur création fournisseur:', error);
      setSubmitError(error.message || 'Une erreur est survenue lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      
      {/* Erreur globale */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Informations générales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm font-medium">
              Nom du fournisseur <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nom"
              {...register('nom')}
              placeholder="Nom de l'entreprise"
              className={errors.nom ? "border-destructive" : ""}
            />
            {errors.nom && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.nom.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siret" className="text-sm font-medium">SIRET</Label>
              <Input
                id="siret"
                {...register('siret')}
                placeholder="12345678901234"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="numero_tva" className="text-sm font-medium">N° TVA</Label>
              <Input
                id="numero_tva"
                {...register('numero_tva')}
                placeholder="FR12345678901"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Adresse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rue" className="text-sm font-medium">
              Rue <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rue"
              {...register('adresse.rue')}
              placeholder="123 Rue de la Paix"
              className={errors.adresse?.rue ? "border-destructive" : ""}
            />
            {errors.adresse?.rue && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.adresse.rue.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code_postal" className="text-sm font-medium">
                Code postal <span className="text-destructive">*</span>
              </Label>
              <Input
                id="code_postal"
                {...register('adresse.code_postal')}
                placeholder="75001"
                className={errors.adresse?.code_postal ? "border-destructive" : ""}
              />
              {errors.adresse?.code_postal && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.adresse.code_postal.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ville" className="text-sm font-medium">
                Ville <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ville"
                {...register('adresse.ville')}
                placeholder="Paris"
                className={errors.adresse?.ville ? "border-destructive" : ""}
              />
              {errors.adresse?.ville && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.adresse.ville.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pays" className="text-sm font-medium">Pays</Label>
              <Input
                id="pays"
                {...register('adresse.pays')}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600" />
            Informations de contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contact@fournisseur.fr"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-sm font-medium">Téléphone</Label>
              <Input
                id="telephone"
                {...register('telephone')}
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_web" className="text-sm font-medium">Site web</Label>
            <Input
              id="site_web"
              {...register('site_web')}
              placeholder="https://www.fournisseur.fr"
              className={errors.site_web ? "border-destructive" : ""}
            />
            {errors.site_web && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.site_web.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes ou commentaires..."
              rows={3}
              className="resize-none"
            />
            {errors.notes && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.notes.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Créer le fournisseur
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SupplierQuickCreateForm;