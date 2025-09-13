import { useState, useEffect } from "react";
import { Check, AlertCircle, Building2, User, MapPin, Calendar, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createInvoice, CreateInvoiceRequest } from "../../api/invoices";
import { Invoice } from "../../types/invoices.types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";
import { InvoiceClientSelector } from "./InvoiceClientSelector";
import { cn } from "@/lib/utils";

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (invoice: Invoice) => void;
}

interface ClientSearchResult {
  id: string;
  name: string;
  address?: string;
  type: string[];
}

export function CreateInvoiceModal({ open, onOpenChange, onSuccess }: CreateInvoiceModalProps) {
  const { formatCurrency } = useCurrency();
  
  // États du formulaire
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // États des champs
  const [formData, setFormData] = useState({
    projectName: "",
    projectAddress: "",
    projectReference: "",
    issueDate: new Date().toISOString().split('T')[0],
    paymentTerms: 30,
    dueDate: "",
    notes: "",
    termsAndConditions: "",
  });

  // États de l'interface
  const [loading, setLoading] = useState(false);

  // Calcul automatique de la date d'échéance
  useEffect(() => {
    if (formData.issueDate && formData.paymentTerms) {
      const issueDate = new Date(formData.issueDate);
      const dueDate = new Date(issueDate);
      dueDate.setDate(issueDate.getDate() + formData.paymentTerms);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0] 
      }));
    }
  }, [formData.issueDate, formData.paymentTerms]);
  

  // Réinitialisation du formulaire
  const resetForm = () => {
    setSelectedClient(null);
    setFormData({
      projectName: "",
      projectAddress: "",
      projectReference: "",
      issueDate: new Date().toISOString().split('T')[0],
      paymentTerms: 30,
      dueDate: "",
      notes: "",
      termsAndConditions: "",
    });
    setError(null);
  };

  // Gestion de la fermeture
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  };


  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!selectedClient) {
      setError("Veuillez sélectionner un client");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceData: CreateInvoiceRequest = {
        tier: selectedClient.id,
        client_name: selectedClient.name,
        client_address: selectedClient.address,
        project_name: formData.projectName || undefined,
        project_address: formData.projectAddress || undefined,
        project_reference: formData.projectReference || undefined,
        issue_date: formData.issueDate,
        due_date: formData.dueDate,
        payment_terms: formData.paymentTerms,
        notes: formData.notes || undefined,
        terms_and_conditions: formData.termsAndConditions || undefined,
        items: [] // Vide, sera rempli dans l'éditeur
      };

      const newInvoice = await createInvoice(invoiceData);
      
      // Vérifier l'ID de la facture créée
      console.log("Facture créée avec succès. ID:", newInvoice.id);
      
      toast.success("Facture créée avec succès", {
        description: `La facture brouillon a été créée et est prête à être éditée.`
      });

      // Fermer d'abord la modale pour éviter les problèmes de focus
      handleClose();
      
      // Puis appeler le callback de succès après une courte attente
      setTimeout(() => {
        if (onSuccess) {
          console.log("Appel du callback onSuccess avec l'ID:", newInvoice.id);
          onSuccess(newInvoice);
        }
      }, 100);
    } catch (err: any) {
      console.error('Erreur lors de la création de la facture:', err);
      setError(err?.response?.data?.message || "Erreur lors de la création de la facture");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-w-[95vw] max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-Beenaya-500 to-Beenaya-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">📊</span>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Nouvelle facture
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-600 mt-1">
                Créez une nouvelle facture directe sans devis préalable
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Informations client */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-blue-600">👥</span>
                Informations client
              </CardTitle>
              <CardDescription>
                Sélectionnez le client pour lequel créer la facture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Sélecteur de client moderne */}
              <InvoiceClientSelector
                value={selectedClient?.id || ""}
                onValueChange={(clientId) => {
                  // Cette fonction sera appelée quand un client est sélectionné
                  console.log('Client ID sélectionné:', clientId);
                }}
                selectedClientData={selectedClient ? {
                  id: selectedClient.id,
                  name: selectedClient.name,
                  type: selectedClient.type,
                  relation: selectedClient.relation || 'client',
                  address: selectedClient.address,
                  email: selectedClient.email,
                  phone: selectedClient.phone
                } : null}
                onSelectedClientChange={(client) => {
                  if (client) {
                    setSelectedClient({
                      id: client.id,
                      name: client.name,
                      type: client.type,
                      relation: client.relation,
                      address: client.address,
                      email: client.email,
                      phone: client.phone
                    });
                  } else {
                    setSelectedClient(null);
                  }
                }}
                placeholder="Rechercher un client ou prospect..."
                required
                error={!selectedClient && error}
              />

            </CardContent>
          </Card>

          {/* Détails du projet */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-purple-600">🏢</span>
                Détails du projet
              </CardTitle>
              <CardDescription>
                Informations sur le projet ou service à facturer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="project-name">Nom du projet</Label>
                  <Input
                    id="project-name"
                    placeholder="Villa Moderne..."
                    value={formData.projectName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="bg-white/60 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="project-reference">Référence projet</Label>
                  <Input
                    id="project-reference"
                    placeholder="PROJ-2025-001"
                    value={formData.projectReference || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectReference: e.target.value }))}
                    className="bg-white/60 backdrop-blur-sm"
              />
            </div>
          </div>
              <div className="space-y-2">
                <Label htmlFor="project-address">Adresse du projet</Label>
                <Textarea
                  id="project-address"
                  placeholder="123 Rue de la Paix, Casablanca"
                  value={formData.projectAddress || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectAddress: e.target.value }))}
                  className="bg-white/60 backdrop-blur-sm"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates et paiement */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-emerald-600">📅</span>
                Dates et paiement
              </CardTitle>
              <CardDescription>
                Définissez les dates d'émission et d'échéance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="issue-date">Date d'émission</Label>
              <Input
                    id="issue-date"
                type="date"
                value={formData.issueDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="bg-white/60 backdrop-blur-sm"
                  />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="payment-terms">Délai (jours)</Label>
              <Select 
                value={formData.paymentTerms.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, paymentTerms: parseInt(value) }))}
              >
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm">
                      <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="45">45 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                  <Label htmlFor="due-date">Date d'échéance</Label>
              <Input
                    id="due-date"
                type="date"
                value={formData.dueDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-white/60 backdrop-blur-sm"
                  />
                  <p className="text-xs text-slate-500">Calculée automatiquement</p>
            </div>
          </div>
            </CardContent>
          </Card>

          {/* Notes et conditions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-amber-600">📝</span>
                Notes et conditions
              </CardTitle>
              <CardDescription>
                Ajoutez des notes et conditions générales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                  placeholder="Informations spécifiques à ce projet..."
                value={formData.notes || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="bg-white/60 backdrop-blur-sm"
                  rows={2}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="terms">Conditions générales</Label>
              <Textarea
                  id="terms"
                  placeholder="Paiement à 30 jours..."
                value={formData.termsAndConditions || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                  className="bg-white/60 backdrop-blur-sm"
                rows={3}
              />
            </div>
            </CardContent>
          </Card>

          {/* Erreur */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Conseil */}
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border">
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <strong>Conseil :</strong> Une fois créée, vous pourrez ajouter les éléments de facturation dans l'éditeur.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-full md:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedClient || loading}
            className="w-full md:w-auto gap-2 bg-Beenaya-600 hover:bg-Beenaya-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Création...
              </>
            ) : (
              <>
            <Check className="w-4 h-4" />
                Créer en brouillon
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}