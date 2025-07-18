import { useState } from "react";
import { User, AlertCircle, Loader2, Check, MapPin, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { 
  ParticulierFormValues,
  particulierFlags,
  AdresseParticulier
} from "./types/particulier";
import { useParticulierForm } from "./hooks/useParticulierForm";

interface ParticulierFormProps {
  onSubmit: (values: ParticulierFormValues) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<ParticulierFormValues>;
  isEditing?: boolean;
  loading?: boolean;
  error?: string | null;
}

export function ParticulierForm({ 
  onSubmit, 
  onCancel, 
  initialValues,
  isEditing = false,
  loading = false,
  error: externalError
}: ParticulierFormProps) {
  const {
    form,
    handleSubmit,
    isLoading,
    errors,
    hasErrors,
    canSubmit,
    getFormProgress,
    // Gestion des adresses
    addAdresse,
    removeAdresse,
    updateAdresse,
    setAdressePrincipale,
  } = useParticulierForm({
    onSubmit,
    initialValues,
    mode: isEditing ? "edit" : "create"
  });

  const displayError = externalError || (hasErrors ? errors[0]?.message : null);
  const formLoading = loading || isLoading;
  const progress = getFormProgress();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">
                {isEditing ? "Modifier le particulier" : "Nouveau particulier"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Seul le nom est obligatoire
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>

        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        {/* Onglets de navigation */}
        <Tabs defaultValue="identite" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identite" className="text-green-700">
              <User className="w-4 h-4 mr-2" />
              Identité
            </TabsTrigger>
            <TabsTrigger value="relations" className="text-green-700">
              Relations
            </TabsTrigger>
            <TabsTrigger value="adresses" className="text-green-700">
              <MapPin className="w-4 h-4 mr-2" />
              Adresses
            </TabsTrigger>
          </TabsList>

          {/* Onglet Identité */}
          <TabsContent value="identite" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom - OBLIGATOIRE */}
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Nom *
                          <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Dupont" 
                            disabled={formLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Nom de famille de la personne
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Prénom */}
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: Jean" 
                            disabled={formLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Contact direct */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Informations de contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="jean.dupont@email.com" 
                              disabled={formLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telephone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="01 23 45 67 89" 
                              disabled={formLoading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Relations commerciales */}
          <TabsContent value="relations" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Relation commerciale *
                  <Badge variant="outline" className="text-xs">Une seule sélection</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="relation"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange([value])} // Convertir en array pour compatibilité
                          value={field.value?.[0] || ""} // Prendre le premier élément ou vide
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                          disabled={formLoading}
                        >
                          {particulierFlags.map((flag) => (
                            <div key={flag.id} className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={flag.id} 
                                id={flag.id}
                                disabled={formLoading}
                              />
                              <FormLabel
                                htmlFor={flag.id}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {flag.label}
                              </FormLabel>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Sélectionnez la relation commerciale principale avec cette personne
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Adresses */}
          <TabsContent value="adresses" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Adresses personnelles</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAdresse}
                  disabled={formLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une adresse
                </Button>
              </CardHeader>
              <CardContent>
                {form.watch("adresses")?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucune adresse ajoutée</p>
                    <p className="text-sm">L'adresse est optionnelle mais recommandée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.watch("adresses")?.map((adresse, index) => (
                      <AdresseParticulierCard
                        key={index}
                        adresse={adresse}
                        index={index}
                        onUpdate={(updatedAdresse) => updateAdresse(index, updatedAdresse)}
                        onRemove={() => removeAdresse(index)}
                        onSetPrincipale={() => setAdressePrincipale(index)}
                        disabled={formLoading}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit || formLoading}
            className="min-w-[120px]"
          >
            {formLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {isEditing ? "Modifier" : "Créer"}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

// Composant pour une carte d'adresse particulier
interface AdresseParticulierCardProps {
  adresse: AdresseParticulier;
  index: number;
  onUpdate: (adresse: AdresseParticulier) => void;
  onRemove: () => void;
  onSetPrincipale: () => void;
  disabled: boolean;
}

function AdresseParticulierCard({ 
  adresse, 
  index, 
  onUpdate, 
  onRemove, 
  onSetPrincipale, 
  disabled 
}: AdresseParticulierCardProps) {
  return (
    <Card className={`transition-all ${adresse.principale ? 'ring-2 ring-green-200 border-green-300' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="font-medium">{adresse.libelle}</span>
            {adresse.principale && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Star className="w-3 h-3 mr-1" />
                Principale
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!adresse.principale && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSetPrincipale}
                disabled={disabled}
                title="Définir comme adresse principale"
              >
                <Star className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Libellé *</label>
          <Input
            value={adresse.libelle}
            onChange={(e) => onUpdate({ ...adresse, libelle: e.target.value })}
            placeholder="Ex: Domicile, Résidence secondaire..."
            disabled={disabled}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Rue *</label>
          <Input
            value={adresse.rue}
            onChange={(e) => onUpdate({ ...adresse, rue: e.target.value })}
            placeholder="Numéro et nom de rue"
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Code postal *</label>
            <Input
              value={adresse.codePostal}
              onChange={(e) => onUpdate({ ...adresse, codePostal: e.target.value })}
              placeholder="75001"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Ville *</label>
            <Input
              value={adresse.ville}
              onChange={(e) => onUpdate({ ...adresse, ville: e.target.value })}
              placeholder="Paris"
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Pays</label>
          <Input
            value={adresse.pays || "France"}
            onChange={(e) => onUpdate({ ...adresse, pays: e.target.value })}
            placeholder="France"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
} 