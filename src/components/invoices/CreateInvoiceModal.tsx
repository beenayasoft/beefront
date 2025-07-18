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
import { createInvoice, CreateInvoiceRequest } from "@/lib/api/invoices";
import { tiersApi, TierData } from "@/lib/api/tiers";
import { Invoice } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
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
  // États du formulaire
  const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientResults, setClientResults] = useState<ClientSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
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
  const [error, setError] = useState<string | null>(null);
  const [showClientSearch, setShowClientSearch] = useState(false);

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
  
  // Recherche de clients avec debouncing
  useEffect(() => {
    const searchClients = async () => {
      if (clientSearch.length < 2) {
        setClientResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await tiersApi.getTiers({
          search: clientSearch,
          page_size: 20
        });
        
        const clients = response.results.map((tier: any): ClientSearchResult => ({
          id: tier.id,
          name: tier.name,
          address: tier.address,
          type: tier.type || []
        }));
        
        setClientResults(clients);
      } catch (err) {
        console.error('Erreur lors de la recherche de clients:', err);
        setClientResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchClients, 300);
    return () => clearTimeout(debounceTimer);
  }, [clientSearch]);

  // Réinitialisation du formulaire
  const resetForm = () => {
    setSelectedClient(null);
    setClientSearch("");
    setClientResults([]);
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
    setShowClientSearch(false);
  };

  // Gestion de la fermeture
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  };

  // Sélection d'un client
  const handleClientSelect = async (client: ClientSearchResult) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowClientSearch(false);
    
    // Récupérer les détails complets du client
    try {
      const response = await tiersApi.getTiers({ search: client.id });
      const tierDetails = response.results.find((t: any) => t.id === client.id);
      
      if (tierDetails) {
        // Auto-remplissage basé sur les informations client
        setSelectedClient(prev => ({
          ...prev,
          address: tierDetails.address || prev?.address || '',
          ...(tierDetails.email && { email: tierDetails.email }),
          ...(tierDetails.phone && { phone: tierDetails.phone })
        }));
        
        // Mettre à jour le formulaire avec les données du client
        setFormData(prev => ({
          ...prev,
          client_name: tierDetails.name || client.name,
          client_address: tierDetails.address || '',
          tier: client.id
        }));
        
        // Si le client a une adresse de facturation spécifique, l'utiliser
        if (tierDetails.address_facturation) {
          setFormData(prev => ({
            ...prev,
            client_address: tierDetails.address_facturation
          }));
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du client:", error);
      // En cas d'erreur, utiliser les données minimales disponibles
      setFormData(prev => ({
        ...prev,
        client_name: client.name,
        tier: client.id
      }));
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-benaya-600">
            <FileText className="w-5 h-5" />
            ✨ Nouvelle facture
          </DialogTitle>
          <DialogDescription>
            Créez une nouvelle facture directe sans devis préalable
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section Client */}
          <Card className="benaya-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Client (Obligatoire)
              </CardTitle>
              <CardDescription>
                Point de départ obligatoire pour toute facture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Recherche client */}
            <div className="space-y-2">
                <Label htmlFor="client-search">Rechercher un client</Label>
                <div className="relative">
                  <Input
                    id="client-search"
                    placeholder="Tapez le nom d'un client..."
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setShowClientSearch(true);
                    }}
                    onFocus={() => setShowClientSearch(true)}
                    className={cn(
                      "bg-white/60 backdrop-blur-sm",
                      selectedClient && "border-green-500/50"
                    )}
                  />
                  
                  {/* Résultats de recherche */}
                  {showClientSearch && clientSearch.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {searchLoading ? (
                        <div className="p-3 text-center text-slate-500">
                          Recherche en cours...
                        </div>
                      ) : clientResults.length > 0 ? (
                        clientResults.map((client) => (
                          <button
                            key={client.id}
                            className="w-full p-3 text-left hover:bg-slate-50 border-b last:border-b-0"
                            onClick={() => handleClientSelect(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            {client.address && (
                              <div className="text-xs text-slate-500">{client.address}</div>
                            )}
                            <div className="flex gap-1 mt-1">
                              {client.type.map((type) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-500">
                          Aucun client trouvé
                        </div>
              )}
            </div>
                  )}
            </div>
          </div>

              {/* Informations client sélectionné */}
              {selectedClient && (
                <Alert className="border-green-500/20 bg-green-50/50">
                  <Check className="w-4 h-4 text-green-600" />
                  <AlertDescription>
                    <div className="font-medium text-green-900">{selectedClient.name}</div>
                    {selectedClient.address && (
                      <div className="text-sm text-green-700 mt-1">{selectedClient.address}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Section Projet */}
          <Card className="benaya-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="w-4 h-4" />
                Projet/Chantier (Optionnel)
              </CardTitle>
              <CardDescription>
                Informations du projet pour organisation et classification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="project-name">Nom du projet</Label>
                  <Input
                    id="project-name"
                    placeholder="Villa Moderne..."
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="bg-white/60 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
                  <Label htmlFor="project-reference">Référence projet</Label>
                  <Input
                    id="project-reference"
                    placeholder="PROJ-2025-001"
                    value={formData.projectReference}
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
                  value={formData.projectAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectAddress: e.target.value }))}
                  className="bg-white/60 backdrop-blur-sm"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section Conditions */}
          <Card className="benaya-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4" />
                Conditions de paiement
              </CardTitle>
              <CardDescription>
                Dates et délais pour le paiement de cette facture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                  <Label htmlFor="issue-date">Date d'émission</Label>
              <Input
                    id="issue-date"
                type="date"
                value={formData.issueDate}
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
                value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-white/60 backdrop-blur-sm"
                  />
                  <p className="text-xs text-slate-500">Calculée automatiquement</p>
            </div>
          </div>
            </CardContent>
          </Card>

          {/* Section Notes */}
          <Card className="benaya-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Notes et conditions (Optionnel)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                  placeholder="Informations spécifiques à ce projet..."
                value={formData.notes}
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
                value={formData.termsAndConditions}
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

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedClient || loading}
            className="gap-2 bg-benaya-600 hover:bg-benaya-700"
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