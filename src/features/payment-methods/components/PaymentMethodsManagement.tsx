/**
 * Composant de gestion des moyens de paiement
 * Permet de créer, modifier, supprimer et configurer les moyens de paiement
 */
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CreditCard, Building, Receipt, DollarSign, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { paymentMethodsAPI, type PaymentMethod, type PaymentMethodType } from '../api/paymentMethods';
import { PaymentMethodForm } from './PaymentMethodForm';
import { PaymentMethodCard } from './PaymentMethodCard';
import { DraggablePaymentMethodList } from './DraggablePaymentMethodList';

interface PaymentMethodsManagementProps {
  className?: string;
}

const getMethodTypeIcon = (methodType: string) => {
  switch (methodType) {
    case 'bank_transfer':
      return Building;
    case 'check':
      return Receipt;
    case 'cash':
      return DollarSign;
    case 'card':
    case 'paypal':
    default:
      return CreditCard;
  }
};

export const PaymentMethodsManagement: React.FC<PaymentMethodsManagementProps> = ({ className }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<PaymentMethodType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [methods, types] = await Promise.all([
        paymentMethodsAPI.getPaymentMethods(),
        paymentMethodsAPI.getPaymentMethodTypes()
      ]);
      setPaymentMethods(methods);
      setPaymentMethodTypes(types);
    } catch (error) {
      console.error('Erreur lors du chargement des moyens de paiement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les moyens de paiement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDefaults = async () => {
    try {
      const result = await paymentMethodsAPI.createDefaultPaymentMethods();
      setPaymentMethods(result.payment_methods);
      toast({
        title: "Moyens de paiement créés",
        description: "Les moyens de paiement par défaut ont été créés avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer les moyens de paiement par défaut",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleDelete = async (method: PaymentMethod) => {
    if (!method.id) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le moyen de paiement "${method.label}" ?`)) {
      return;
    }

    try {
      await paymentMethodsAPI.deletePaymentMethod(method.id);
      setPaymentMethods(prev => prev.filter(m => m.id !== method.id));
      toast({
        title: "Moyen de paiement supprimé",
        description: `Le moyen de paiement "${method.label}" a été supprimé`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le moyen de paiement",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (method: PaymentMethod, isActive: boolean) => {
    if (!method.id) return;

    try {
      const updatedMethod = await paymentMethodsAPI.updatePaymentMethod(method.id, {
        is_active: isActive
      });
      
      setPaymentMethods(prev => 
        prev.map(m => m.id === method.id ? updatedMethod : m)
      );
      
      toast({
        title: isActive ? "Moyen de paiement activé" : "Moyen de paiement désactivé",
        description: `Le moyen de paiement "${method.label}" a été ${isActive ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du moyen de paiement",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (methodData: Omit<PaymentMethod, 'id'> | PaymentMethod) => {
    try {
      let savedMethod: PaymentMethod;
      
      if (editingMethod && editingMethod.id) {
        // Modification d'un moyen existant
        savedMethod = await paymentMethodsAPI.updatePaymentMethod(editingMethod.id, methodData);
        setPaymentMethods(prev => 
          prev.map(m => m.id === editingMethod.id ? savedMethod : m)
        );
        toast({
          title: "Moyen de paiement modifié",
          description: `Le moyen de paiement "${savedMethod.label}" a été mis à jour`,
        });
      } else {
        // Création d'un nouveau moyen
        savedMethod = await paymentMethodsAPI.createPaymentMethod(methodData as Omit<PaymentMethod, 'id'>);
        setPaymentMethods(prev => [...prev, savedMethod]);
        toast({
          title: "Moyen de paiement créé",
          description: `Le moyen de paiement "${savedMethod.label}" a été créé`,
        });
      }
      
      setShowForm(false);
      setEditingMethod(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le moyen de paiement",
        variant: "destructive",
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMethod(null);
  };

  const handleReorder = async (reorderedMethods: PaymentMethod[]) => {
    try {
      // Mettre à jour l'ordre localement d'abord pour une UI réactive
      setPaymentMethods(reorderedMethods);
      
      // Puis sauvegarder les nouveaux ordres sur le serveur
      await Promise.all(
        reorderedMethods.map(method => 
          method.id ? paymentMethodsAPI.updatePaymentMethod(method.id, {
            display_order: method.display_order
          }) : Promise.resolve()
        )
      );
      
      toast({
        title: "Ordre mis à jour",
        description: "L'ordre des moyens de paiement a été sauvegardé",
      });
    } catch (error) {
      // En cas d'erreur, recharger les données
      loadData();
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le nouvel ordre",
        variant: "destructive",
      });
    }
  };

  const handleExportConfig = () => {
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      payment_methods: paymentMethods.map(method => ({
        ...method,
        id: undefined // Ne pas exporter l'ID pour éviter les conflits
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-methods-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration exportée",
      description: "La configuration des moyens de paiement a été téléchargée",
    });
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validation basique de la structure
        if (!jsonData.payment_methods || !Array.isArray(jsonData.payment_methods)) {
          throw new Error('Format de fichier invalide');
        }
        
        // Importer les moyens de paiement
        const importPromises = jsonData.payment_methods.map((methodData: Omit<PaymentMethod, 'id'>) =>
          paymentMethodsAPI.createPaymentMethod(methodData)
        );
        
        const importedMethods = await Promise.all(importPromises);
        
        // Recharger la liste
        await loadData();
        
        toast({
          title: "Configuration importée",
          description: `${importedMethods.length} moyen(s) de paiement importé(s) avec succès`,
        });
        
      } catch (error) {
        console.error('Erreur lors de l\'import:', error);
        toast({
          title: "Erreur d'import",
          description: "Impossible d'importer la configuration. Veuillez vérifier le format du fichier.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Beenaya-500 mx-auto mb-4"></div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Chargement des moyens de paiement...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {editingMethod ? 'Modifier le moyen de paiement' : 'Nouveau moyen de paiement'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {editingMethod ? 'Modifiez les détails du moyen de paiement' : 'Créez un nouveau moyen de paiement pour vos documents'}
            </p>
          </div>
        </div>
        
        <PaymentMethodForm
          paymentMethodTypes={paymentMethodTypes}
          initialData={editingMethod}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Moyens de paiement</h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Gérez les moyens de paiement affichés sur vos documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="show-preview" className="text-sm">Aperçu</Label>
            <Switch
              id="show-preview"
              checked={showPreview}
              onCheckedChange={setShowPreview}
            />
          </div>
          
          {/* Boutons d'export/import */}
          {paymentMethods.length > 0 && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportConfig}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Importer
                </Button>
              </div>
            </>
          )}
          
          <Button 
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau moyen de paiement
          </Button>
        </div>
      </div>

      {/* Message si aucun moyen de paiement */}
      {paymentMethods.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
              <Receipt className="h-8 w-8 text-neutral-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Aucun moyen de paiement</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Commencez par créer vos moyens de paiement ou utilisez les modèles par défaut
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" onClick={handleCreateDefaults}>
                  Créer les moyens par défaut
                </Button>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau moyen de paiement
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des moyens de paiement */}
      {paymentMethods.length > 0 && (
        <div className="space-y-4">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-Beenaya-600">
                {paymentMethods.length}
              </div>
              <div className="text-sm text-neutral-600">Total</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {paymentMethods.filter(m => m.is_active).length}
              </div>
              <div className="text-sm text-neutral-600">Actifs</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-neutral-400">
                {paymentMethods.filter(m => !m.is_active).length}
              </div>
              <div className="text-sm text-neutral-600">Inactifs</div>
            </Card>
          </div>

          {/* Liste des moyens de paiement avec drag & drop */}
          <DraggablePaymentMethodList
            paymentMethods={paymentMethods}
            showPreview={showPreview}
            onReorder={handleReorder}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={handleDelete}
            getMethodTypeIcon={getMethodTypeIcon}
          />

          {/* Bouton pour créer les moyens par défaut si moins de 2 */}
          {paymentMethods.length < 2 && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Moyens de paiement recommandés
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Nous recommandons d'avoir au moins un virement bancaire et un paiement par chèque
                  </p>
                </div>
                <Button variant="outline" onClick={handleCreateDefaults}>
                  Créer les moyens par défaut
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};