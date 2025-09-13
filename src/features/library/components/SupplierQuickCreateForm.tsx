/**
 * Formulaire de création rapide de fournisseur
 * Interface optimisée pour créer un fournisseur en contexte de création de matériau
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, Phone, Mail, Save, X, AlertCircle, Loader2, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schéma de validation pour fournisseur
const supplierSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  type: z.enum(['entreprise', 'particulier'], {
    required_error: 'Le type de fournisseur est requis'
  }),
  
  // Informations entreprise (optionnelles)
  siret: z.string().optional(),
  numero_tva: z.string().optional(),
  
  // Adresse (maintenant optionnelle)
  adresse: z.object({
    rue: z.string().optional(),
    ville: z.string().optional(),
    code_postal: z.string().optional(),
    pays: z.string().default('France')
  }).optional(),
  
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
      type: 'entreprise', // Par défaut entreprise
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

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const selectedType = watch('type');

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

      {/* Sélecteur de type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-purple-600" />
            Type de fournisseur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm">
              Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as 'entreprise' | 'particulier')}
            >
              <SelectTrigger className={`Beenaya-input ${errors.type ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entreprise">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Entreprise</span>
                  </div>
                </SelectItem>
                <SelectItem value="particulier">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span>Particulier</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.type.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations générales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {selectedType === 'entreprise' ? (
              <Building2 className="w-4 h-4 text-blue-600" />
            ) : (
              <User className="w-4 h-4 text-green-600" />
            )}
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom" className="text-sm">
              {selectedType === 'entreprise' ? 'Nom de l\'entreprise' : 'Nom du particulier'} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nom"
              {...register('nom')}
              placeholder={selectedType === 'entreprise' ? "Ex: BTP Matériaux SARL" : "Ex: M. Jean Dupont"}
              className={errors.nom ? "border-destructive" : ""}
            />
            {errors.nom && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.nom.message}
              </p>
            )}
          </div>

          {selectedType === 'entreprise' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siret" className="text-sm">SIRET</Label>
                <Input
                  id="siret"
                  {...register('siret')}
                  placeholder="12345678901234"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero_tva" className="text-sm">N° TVA</Label>
                <Input
                  id="numero_tva"
                  {...register('numero_tva')}
                  placeholder="FR12345678901"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adresse (optionnelle) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Adresse <span className="text-xs text-neutral-500 font-normal">(optionnelle)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rue" className="text-sm">
              Rue
            </Label>
            <Input
              id="rue"
              {...register('adresse.rue')}
              placeholder="123 Rue de la Paix"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code_postal" className="text-sm">
                Code postal
              </Label>
              <Input
                id="code_postal"
                {...register('adresse.code_postal')}
                placeholder="75001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ville" className="text-sm">
                Ville
              </Label>
              <Input
                id="ville"
                {...register('adresse.ville')}
                placeholder="Paris"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pays" className="text-sm">Pays</Label>
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
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={selectedType === 'entreprise' ? "contact@fournisseur.fr" : "jean.dupont@email.fr"}
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
              <Label htmlFor="telephone" className="text-sm">Téléphone</Label>
              <Input
                id="telephone"
                {...register('telephone')}
                placeholder="01 23 45 67 89"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site_web" className="text-sm">Site web</Label>
            <Input
              id="site_web"
              {...register('site_web')}
              placeholder={selectedType === 'entreprise' ? "https://www.fournisseur.fr" : "https://artisan-dupont.fr"}
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
            <Label htmlFor="notes" className="text-sm">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes ou commentaires sur ce fournisseur..."
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