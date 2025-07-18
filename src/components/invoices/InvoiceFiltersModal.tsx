import { useState, useEffect } from "react";
import { 
  Filter, 
  Calendar, 
  User, 
  DollarSign, 
  Building2, 
  FileText, 
  RefreshCw,
  X,
  Check,
  Trash2,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getInvoiceFilterValues } from "@/lib/api/invoices";
import { InvoiceStatus } from "@/lib/types/invoice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvoiceFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFilters: InvoiceFilters;
  onApplyFilters: (filters: InvoiceFilters) => void;
  onSaveFilter?: (name: string, filters: InvoiceFilters) => void;
  savedFilters?: SavedFilter[];
}

interface InvoiceFilters {
  search?: string;
  status?: InvoiceStatus[];
  clientIds?: string[];
  projectIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: string[];
  createdBy?: string[];
  isOverdue?: boolean;
  hasPayments?: boolean;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: InvoiceFilters;
  createdAt: string;
}

interface FilterOption {
  id: string;
  name: string;
}

export function InvoiceFiltersModal({ 
  open, 
  onOpenChange, 
  currentFilters,
  onApplyFilters,
  onSaveFilter,
  savedFilters = []
}: InvoiceFiltersModalProps) {
  // États pour les filtres
  const [filters, setFilters] = useState<InvoiceFilters>(currentFilters);
  const [filterOptions, setFilterOptions] = useState<{
    creators: FilterOption[];
    paymentMethods: FilterOption[];
    projects: FilterOption[];
  }>({
    creators: [],
    paymentMethods: [],
    projects: []
  });
  
  // États de l'interface
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [filterName, setFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Statuts disponibles
  const statusOptions = [
    { value: 'draft', label: 'Brouillon', color: 'bg-gray-100 text-gray-700' },
    { value: 'sent', label: 'Émise', color: 'bg-blue-100 text-blue-700' },
    { value: 'overdue', label: 'En retard', color: 'bg-red-100 text-red-700' },
    { value: 'partially_paid', label: 'Partiellement payée', color: 'bg-orange-100 text-orange-700' },
    { value: 'paid', label: 'Payée', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Annulée', color: 'bg-gray-100 text-gray-700' },
    { value: 'cancelled_by_credit_note', label: 'Annulée par avoir', color: 'bg-gray-100 text-gray-700' }
  ];

  // Charger les options de filtres au montage
  useEffect(() => {
    if (open) {
      setFilters(currentFilters);
      loadFilterOptions();
    }
  }, [open, currentFilters]);

  const loadFilterOptions = async () => {
    setOptionsLoading(true);
    try {
      const options = await getInvoiceFilterValues();
      setFilterOptions(options);
    } catch (err) {
      console.error('Erreur lors du chargement des options:', err);
      toast.error("Erreur", {
        description: "Impossible de charger les options de filtre"
      });
    } finally {
      setOptionsLoading(false);
    }
  };

  // Mettre à jour un filtre
  const updateFilter = <K extends keyof InvoiceFilters>(
    key: K, 
    value: InvoiceFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Toggle d'un statut
  const toggleStatus = (status: InvoiceStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateFilter('status', newStatuses.length > 0 ? newStatuses : undefined);
  };

  // Toggle d'un créateur
  const toggleCreator = (creatorId: string) => {
    const currentCreators = filters.createdBy || [];
    const newCreators = currentCreators.includes(creatorId)
      ? currentCreators.filter(c => c !== creatorId)
      : [...currentCreators, creatorId];
    updateFilter('createdBy', newCreators.length > 0 ? newCreators : undefined);
  };

  // Toggle d'une méthode de paiement
  const togglePaymentMethod = (method: string) => {
    const currentMethods = filters.paymentMethods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    updateFilter('paymentMethods', newMethods.length > 0 ? newMethods : undefined);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({});
  };

  // Compter les filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length) count++;
    if (filters.clientIds?.length) count++;
    if (filters.projectIds?.length) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) count++;
    if (filters.paymentMethods?.length) count++;
    if (filters.createdBy?.length) count++;
    if (filters.isOverdue) count++;
    if (filters.hasPayments !== undefined) count++;
    return count;
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    setLoading(true);
    try {
      onApplyFilters(filters);
      toast.success("Filtres appliqués", {
        description: `${getActiveFiltersCount()} filtre(s) actif(s)`
      });
      onOpenChange(false);
    } catch (err) {
      toast.error("Erreur", {
        description: "Impossible d'appliquer les filtres"
      });
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder le filtre
  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error("Nom requis", {
        description: "Veuillez saisir un nom pour ce filtre"
      });
      return;
    }

    if (onSaveFilter) {
      onSaveFilter(filterName, filters);
      toast.success("Filtre sauvegardé", {
        description: `Le filtre "${filterName}" a été sauvegardé`
      });
      setShowSaveDialog(false);
      setFilterName("");
    }
  };

  // Charger un filtre sauvegardé
  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    toast.success("Filtre chargé", {
      description: `Le filtre "${savedFilter.name}" a été appliqué`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-benaya-600" />
            ✨ Filtres avancés
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Affinez votre recherche de factures</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} filtre(s) actif(s)
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="gap-2">
              <Filter className="w-4 h-4" />
              Base
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Building2 className="w-4 h-4" />
              Avancé
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Save className="w-4 h-4" />
              Sauvegardés
            </TabsTrigger>
          </TabsList>

          {/* Filtres de base */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Recherche textuelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Recherche textuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="search">Rechercher dans les factures</Label>
                  <Input
                    id="search"
                    placeholder="Numéro, client, projet..."
                    value={filters.search || ""}
                    onChange={(e) => updateFilter('search', e.target.value || undefined)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statuts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Statuts des factures
                </CardTitle>
                <CardDescription>
                  Sélectionnez un ou plusieurs statuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={filters.status?.includes(status.value as InvoiceStatus) || false}
                        onCheckedChange={() => toggleStatus(status.value as InvoiceStatus)}
                      />
                      <Label 
                        htmlFor={`status-${status.value}`}
                        className={cn("text-sm cursor-pointer px-2 py-1 rounded", status.color)}
                      >
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Période */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Période
                </CardTitle>
                <CardDescription>
                  Filtrer par dates d'émission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">Du</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={filters.dateFrom || ""}
                      onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">Au</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={filters.dateTo || ""}
                      onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Montants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="w-4 h-4" />
                  Montants (MAD)
                </CardTitle>
                <CardDescription>
                  Filtrer par montant TTC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-amount">Montant minimum</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="0"
                      value={filters.minAmount || ""}
                      onChange={(e) => updateFilter('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-amount">Montant maximum</Label>
                    <Input
                      id="max-amount"
                      type="number"
                      placeholder="999999"
                      value={filters.maxAmount || ""}
                      onChange={(e) => updateFilter('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filtres avancés */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            {/* Créateurs */}
            {!optionsLoading && filterOptions.creators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    Créé par
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {filterOptions.creators.map((creator) => (
                      <div key={creator.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`creator-${creator.id}`}
                          checked={filters.createdBy?.includes(creator.id) || false}
                          onCheckedChange={() => toggleCreator(creator.id)}
                        />
                        <Label htmlFor={`creator-${creator.id}`} className="text-sm cursor-pointer">
                          {creator.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Projets */}
            {!optionsLoading && filterOptions.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="w-4 h-4" />
                    Projets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={filters.projectIds?.[0] || ""}
                    onValueChange={(value) => updateFilter('projectIds', value ? [value] : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un projet" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* Méthodes de paiement */}
            {!optionsLoading && filterOptions.paymentMethods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="w-4 h-4" />
                    Méthodes de paiement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {filterOptions.paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`method-${method.id}`}
                          checked={filters.paymentMethods?.includes(method.id) || false}
                          onCheckedChange={() => togglePaymentMethod(method.id)}
                        />
                        <Label htmlFor={`method-${method.id}`} className="text-sm cursor-pointer">
                          {method.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Options spéciales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Options spéciales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={filters.isOverdue || false}
                    onCheckedChange={(checked) => updateFilter('isOverdue', checked || undefined)}
                  />
                  <Label htmlFor="overdue" className="text-sm cursor-pointer">
                    Factures en retard uniquement
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-payments"
                    checked={filters.hasPayments || false}
                    onCheckedChange={(checked) => updateFilter('hasPayments', checked || undefined)}
                  />
                  <Label htmlFor="has-payments" className="text-sm cursor-pointer">
                    Factures avec paiements uniquement
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filtres sauvegardés */}
          <TabsContent value="saved" className="space-y-6 mt-6">
            {savedFilters.length > 0 ? (
              <div className="space-y-3">
                {savedFilters.map((savedFilter) => (
                  <Card key={savedFilter.id} className="cursor-pointer hover:bg-neutral-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{savedFilter.name}</div>
                          <div className="text-sm text-neutral-500">
                            Créé le {new Date(savedFilter.createdAt).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadSavedFilter(savedFilter)}
                        >
                          Charger
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500">
                Aucun filtre sauvegardé
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            {/* Actions secondaires */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Réinitialiser
              </Button>
              {onSaveFilter && getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(!showSaveDialog)}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </Button>
              )}
            </div>

            {/* Actions principales */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleApplyFilters}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Application...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Appliquer
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Dialogue de sauvegarde */}
          {showSaveDialog && (
            <div className="w-full mt-4 p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du filtre..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
                />
                <Button size="sm" onClick={handleSaveFilter}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 