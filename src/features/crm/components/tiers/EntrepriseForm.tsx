import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Trash2, 
  User, 
  MapPin, 
  AlertCircle, 
  Loader2,
  Star,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

// Import des types et hooks spécialisés
import { 
  EntrepriseFormValues,
  ContactEntreprise,
  AdresseEntreprise,
  entrepriseFlags,
  formesJuridiques
} from "./types/entreprise";
import { useEntrepriseForm } from "./hooks/useEntrepriseForm";

interface EntrepriseFormProps {
  onSubmit: (values: EntrepriseFormValues) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<EntrepriseFormValues>;
  isEditing?: boolean;
  loading?: boolean;
  error?: string | null;
}

export function EntrepriseForm({ 
  onSubmit, 
  onCancel, 
  initialValues,
  isEditing = false,
  loading = false,
  error: externalError
}: EntrepriseFormProps) {
  const [activeTab, setActiveTab] = useState("general");

  // Utiliser notre hook spécialisé entreprise
  const {
    form,
    handleSubmit,
    isLoading,
    errors,
    hasErrors,
    canSubmit,
    currentStep,
    setCurrentStep,
    getFieldError,
    isFieldRequired,
    getFormProgress,
    // Gestion des contacts
    addContact,
    removeContact,
    updateContact,
    setContactPrincipal,
    // Gestion des adresses
    addAdresse,
    removeAdresse,
    updateAdresse,
    setAdresseFacturation,
  } = useEntrepriseForm({
    onSubmit,
    initialValues,
    mode: isEditing ? "edit" : "create"
  });

  // Erreur à afficher
  const displayError = externalError || (hasErrors ? errors[0]?.message : null);
  const formLoading = loading || isLoading;

  // Progression du formulaire
  const progress = getFormProgress();

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        {/* En-tête avec progression */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">
                {isEditing ? "Modifier l'entreprise" : "Nouvelle entreprise"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Seule la raison sociale est obligatoire
              </p>
            </div>
          </div>
          {/* Barre de progression */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>

        {/* Affichage des erreurs */}
        {displayError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" disabled={formLoading}>
              <Building2 className="w-4 h-4 mr-2" />
              Entreprise
            </TabsTrigger>
            <TabsTrigger value="contacts" disabled={formLoading}>
              <User className="w-4 h-4 mr-2" />
              Contacts ({form.watch("contacts")?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="adresses" disabled={formLoading}>
              <MapPin className="w-4 h-4 mr-2" />
              Adresses ({form.watch("adresses")?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          {/* Onglet Informations Entreprise */}
          <TabsContent value="general" className="space-y-6 mt-6">
            {/* Informations principales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations principales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Raison sociale - OBLIGATOIRE */}
                <FormField
                  control={form.control}
                  name="raisonSociale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Raison sociale *
                        <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Dupont Construction SARL" 
                          disabled={formLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Nom officiel de l'entreprise tel qu'enregistré
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Forme juridique */}
                <FormField
                  control={form.control}
                  name="formeJuridique"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forme juridique</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={formLoading}>
                            <SelectValue placeholder="Sélectionnez une forme juridique" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formesJuridiques.map((forme) => (
                            <SelectItem key={forme.value} value={forme.value}>
                              {forme.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SIRET */}
                  <FormField
                    control={form.control}
                    name="siret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SIRET</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123 456 789 00012" 
                            disabled={formLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          14 chiffres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Numéro de TVA */}
                  <FormField
                    control={form.control}
                    name="numeroTVA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de TVA</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="FR12345678901" 
                            disabled={formLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Format: FR + 11 chiffres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informations légales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations légales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Code NAF */}
                  <FormField
                    control={form.control}
                    name="codeNAF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code NAF</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 4120A" 
                            disabled={formLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Capital social */}
                  <FormField
                    control={form.control}
                    name="capitalSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital social</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 10000 €" 
                            disabled={formLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Relations commerciales */}
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
                  name="flags"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange([value])} // Convertir en array pour compatibilité
                          value={field.value?.[0] || ""} // Prendre le premier élément ou vide
                          className="grid grid-cols-1 md:grid-cols-2 gap-3"
                          disabled={formLoading}
                        >
                          {entrepriseFlags.map((flag) => (
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
                        Sélectionnez la relation commerciale principale avec cette entreprise
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Contacts */}
          <TabsContent value="contacts" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Contacts de l'entreprise</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                  disabled={formLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un contact
                </Button>
              </CardHeader>
              <CardContent>
                {form.watch("contacts")?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun contact ajouté</p>
                    <p className="text-sm">Cliquez sur "Ajouter un contact" pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.watch("contacts")?.map((contact, index) => (
                      <ContactCard
                        key={index}
                        contact={contact}
                        index={index}
                        onUpdate={(updatedContact) => updateContact(index, updatedContact)}
                        onRemove={() => removeContact(index)}
                        onSetPrincipal={(type) => setContactPrincipal(index, type)}
                        disabled={formLoading}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Adresses */}
          <TabsContent value="adresses" className="space-y-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Adresses de l'entreprise</CardTitle>
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
                    <p className="text-sm">Cliquez sur "Ajouter une adresse" pour commencer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.watch("adresses")?.map((adresse, index) => (
                      <AdresseCard
                        key={index}
                        adresse={adresse}
                        index={index}
                        onUpdate={(updatedAdresse) => updateAdresse(index, updatedAdresse)}
                        onRemove={() => removeAdresse(index)}
                        onSetFacturation={() => setAdresseFacturation(index)}
                        disabled={formLoading}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer avec actions */}
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

// Composant pour une carte de contact
interface ContactCardProps {
  contact: ContactEntreprise;
  index: number;
  onUpdate: (contact: ContactEntreprise) => void;
  onRemove: () => void;
  onSetPrincipal: (type: "devis" | "facture") => void;
  disabled: boolean;
}

function ContactCard({ contact, index, onUpdate, onRemove, onSetPrincipal, disabled }: ContactCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Contact {index + 1}
            {contact.contactPrincipalDevis && (
              <Badge variant="default" className="text-xs">Principal Devis</Badge>
            )}
            {contact.contactPrincipalFacture && (
              <Badge variant="secondary" className="text-xs">Principal Facture</Badge>
            )}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Prénom *</label>
            <Input
              value={contact.prenom}
              onChange={(e) => onUpdate({ ...contact, prenom: e.target.value })}
              placeholder="Prénom"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nom *</label>
            <Input
              value={contact.nom}
              onChange={(e) => onUpdate({ ...contact, nom: e.target.value })}
              placeholder="Nom"
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Fonction</label>
          <Input
            value={contact.fonction || ""}
            onChange={(e) => onUpdate({ ...contact, fonction: e.target.value })}
            placeholder="Ex: Directeur commercial"
            disabled={disabled}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={contact.email || ""}
              onChange={(e) => onUpdate({ ...contact, email: e.target.value })}
              placeholder="contact@entreprise.com"
              disabled={disabled}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Téléphone</label>
            <Input
              value={contact.telephone || ""}
              onChange={(e) => onUpdate({ ...contact, telephone: e.target.value })}
              placeholder="01 23 45 67 89"
              disabled={disabled}
            />
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button
            type="button"
            variant={contact.contactPrincipalDevis ? "default" : "outline"}
            size="sm"
            onClick={() => onSetPrincipal("devis")}
            disabled={disabled}
          >
            <Star className="w-3 h-3 mr-1" />
            Contact principal devis
          </Button>
          <Button
            type="button"
            variant={contact.contactPrincipalFacture ? "default" : "outline"}
            size="sm"
            onClick={() => onSetPrincipal("facture")}
            disabled={disabled}
          >
            <Star className="w-3 h-3 mr-1" />
            Contact principal facture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour une carte d'adresse
interface AdresseCardProps {
  adresse: AdresseEntreprise;
  index: number;
  onUpdate: (adresse: AdresseEntreprise) => void;
  onRemove: () => void;
  onSetFacturation: () => void;
  disabled: boolean;
}

function AdresseCard({ adresse, index, onUpdate, onRemove, onSetFacturation, disabled }: AdresseCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {adresse.libelle || `Adresse ${index + 1}`}
            {adresse.facturation && (
              <Badge variant="default" className="text-xs">Facturation</Badge>
            )}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Libellé *</label>
          <Input
            value={adresse.libelle}
            onChange={(e) => onUpdate({ ...adresse, libelle: e.target.value })}
            placeholder="Ex: Siège social, Facturation, Livraison..."
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

        <Separator />

        <Button
          type="button"
          variant={adresse.facturation ? "default" : "outline"}
          size="sm"
          onClick={onSetFacturation}
          disabled={disabled}
        >
          <Star className="w-3 h-3 mr-1" />
          Adresse de facturation
        </Button>
      </CardContent>
    </Card>
  );
} 