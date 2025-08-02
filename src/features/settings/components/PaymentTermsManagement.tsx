import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentTerm } from "@/lib/types/tenant";

interface PaymentTermsManagementProps {
  paymentTerms: PaymentTerm[];
  onChange: (paymentTerms: PaymentTerm[]) => void;
}

export function PaymentTermsManagement({ paymentTerms, onChange }: PaymentTermsManagementProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState<Partial<PaymentTerm>>({ label: "", description: "", days: 30 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    // Check if it's a default term
    const termToDelete = paymentTerms.find(term => term.id === id);
    if (termToDelete?.is_default) {
      alert("Vous ne pouvez pas supprimer une condition de règlement par défaut.");
      return;
    }

    // Confirm before deleting
    if (confirm("Êtes-vous sûr de vouloir supprimer cette condition de règlement ?")) {
      const updatedTerms = paymentTerms.filter(term => term.id !== id);
      onChange(updatedTerms);
    }
  };

  const validateTerm = (term: Partial<PaymentTerm>): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (!term.label) {
      newErrors.label = "Le libellé est requis";
    }
    
    if (term.days === undefined || term.days < 0) {
      newErrors.days = "Le délai doit être un nombre positif";
    }
    
    return newErrors;
  };

  const handleSaveEdit = (id: string) => {
    const termToUpdate = paymentTerms.find(term => term.id === id);
    if (!termToUpdate) return;
    
    const validationErrors = validateTerm(termToUpdate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setEditingId(null);
    setErrors({});
    onChange([...paymentTerms]);
  };

  const handleTermChange = (id: string, field: keyof PaymentTerm, value: string | number) => {
    const updatedTerms = paymentTerms.map(term => {
      if (term.id === id) {
        return { ...term, [field]: value };
      }
      return term;
    });
    onChange(updatedTerms);
  };

  const handleNewTermChange = (field: keyof PaymentTerm, value: string | number) => {
    setNewTerm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddTerm = () => {
    const validationErrors = validateTerm(newTerm);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const newPaymentTerm: PaymentTerm = {
      id: `term-${Date.now()}`,
      label: newTerm.label || "",
      description: newTerm.description || "",
      days: newTerm.days || 0,
      is_default: false,
      is_active: true
    };
    
    onChange([...paymentTerms, newPaymentTerm]);
    setNewTerm({ label: "", description: "", days: 30 });
    setShowAddForm(false);
    setErrors({});
  };

  return (
    <div className="space-y-4">
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Délai (jours)</TableHead>
              <TableHead>Par défaut</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentTerms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-neutral-500">
                  Aucune condition de règlement configurée
                </TableCell>
              </TableRow>
            ) : (
              paymentTerms.map((term) => (
                <TableRow key={term.id}>
                  <TableCell>
                    {editingId === term.id ? (
                      <div className="space-y-1">
                        <Input
                          value={term.label}
                          onChange={(e) => handleTermChange(term.id, "label", e.target.value)}
                          className={`Beenaya-input ${errors.label ? "border-red-500" : ""}`}
                        />
                        {errors.label && (
                          <p className="text-xs text-red-500 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.label}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {term.label}
                        {term.is_default && (
                          <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                            Par défaut
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === term.id ? (
                      <Input
                        value={term.description}
                        onChange={(e) => handleTermChange(term.id, "description", e.target.value)}
                        className="Beenaya-input"
                      />
                    ) : (
                      term.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === term.id ? (
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          value={term.days}
                          onChange={(e) => handleTermChange(term.id, "days", parseInt(e.target.value))}
                          className={`Beenaya-input ${errors.days ? "border-red-500" : ""}`}
                        />
                        {errors.days && (
                          <p className="text-xs text-red-500 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.days}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="font-medium">{term.days} jours</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {term.is_default ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Par défaut
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {editingId === term.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveEdit(term.id)}
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(term.id)}
                            className="h-8 w-8"
                            disabled={term.isDefault}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(term.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={term.isDefault}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add New Term Form */}
      {showAddForm ? (
        <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 space-y-4">
          <h4 className="font-medium">Ajouter une condition de règlement</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newLabel" className={errors.label ? "text-red-500" : ""}>
                Libellé <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newLabel"
                value={newTerm.label}
                onChange={(e) => handleNewTermChange("label", e.target.value)}
                placeholder="Ex: Paiement à 30 jours"
                className={`Beenaya-input ${errors.label ? "border-red-500" : ""}`}
              />
              {errors.label && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.label}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newDescription">
                Description
              </Label>
              <Input
                id="newDescription"
                value={newTerm.description}
                onChange={(e) => handleNewTermChange("description", e.target.value)}
                placeholder="Ex: Paiement à 30 jours nets"
                className="Beenaya-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newDays" className={errors.days ? "text-red-500" : ""}>
                Délai (jours) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newDays"
                type="number"
                min="0"
                value={newTerm.days}
                onChange={(e) => handleNewTermChange("days", parseInt(e.target.value))}
                placeholder="30"
                className={`Beenaya-input ${errors.days ? "border-red-500" : ""}`}
              />
              {errors.days && (
                <p className="text-xs text-red-500 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.days}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setNewTerm({ label: "", description: "", days: 30 });
                setErrors({});
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleAddTerm}>
              Ajouter
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une condition de règlement
        </Button>
      )}
    </div>
  );
}