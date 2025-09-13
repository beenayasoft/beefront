/**
 * Étape de gestion des articles du devis
 * Intégration avec library-service et VatRateSelector intelligent
 */
import React, { useState } from 'react';
import { Plus, Package, Wrench, Trash2, Edit, Calculator } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';
import { VatRateSelector } from '../../../VatRateSelector';
import { CreateQuoteItemData } from '../../../types/quotes.types';
import { useCurrency } from '@/contexts/CurrencyContext';
import { LibraryModal } from '@/features/library/components/LibraryModal';
import { EditorQuoteItem } from '../../../types/quotes.types';

interface ItemsStepProps {
  wizard: UseQuoteWizard;
}

interface ItemFormData {
  type: 'material' | 'labor' | 'work';
  designation: string;
  description?: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
}

const ITEM_TYPES = {
  material: { label: 'Matériau', icon: Package, color: 'bg-blue-100 text-blue-800' },
  labor: { label: 'Main-d\'œuvre', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
  work: { label: 'Ouvrage', icon: Wrench, color: 'bg-green-100 text-green-800' }
};

const UNITS = [
  { value: 'u', label: 'Unité' },
  { value: 'm', label: 'Mètre' },
  { value: 'm2', label: 'Mètre carré' },
  { value: 'm3', label: 'Mètre cube' },
  { value: 'h', label: 'Heure' },
  { value: 'j', label: 'Jour' },
  { value: 'kg', label: 'Kilogramme' },
  { value: 'l', label: 'Litre' }
];

export const ItemsStep: React.FC<ItemsStepProps> = ({ wizard }) => {
  const { formatCurrency } = useCurrency();
  
  console.log('🔧 ItemsStep - Nombre d\'items affichés:', wizard.items?.length || 0);
  console.log('🔧 ItemsStep - Items détail:', wizard.items);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    type: 'material',
    designation: '',
    description: '',
    unit: 'u',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    vatRate: 20
  });
  
  // Calculs
  const calculateItemTotal = (item: CreateQuoteItemData) => {
    // S'assurer que les valeurs sont numériques
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    const discount = Number(item.discount) || 0;
    const vatRate = Number(item.vatRate) || 0;
    
    const baseTotal = quantity * unitPrice;
    const discountAmount = baseTotal * discount / 100;
    const totalHt = baseTotal - discountAmount;
    const vatAmount = totalHt * vatRate / 100;
    const totalTtc = totalHt + vatAmount;
    
    return { totalHt, vatAmount, totalTtc };
  };
  
  const calculateGlobalTotals = () => {
    return wizard.items.reduce((acc, item) => {
      const { totalHt, vatAmount, totalTtc } = calculateItemTotal(item);
      return {
        totalHt: acc.totalHt + totalHt,
        totalVAT: acc.totalVAT + vatAmount,
        totalTtc: acc.totalTtc + totalTtc
      };
    }, { totalHt: 0, totalVAT: 0, totalTtc: 0 });
  };
  
  // Gestion du formulaire
  const resetForm = () => {
    setFormData({
      type: 'material',
      designation: '',
      description: '',
      unit: 'u',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      vatRate: 20
    });
    setEditingIndex(null);
  };
  
  const handleAddItem = () => {
    const newItem: CreateQuoteItemData = {
      type: formData.type,
      position: wizard.items.length,
      designation: formData.designation,
      description: formData.description,
      unit: formData.unit,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      discount: formData.discount,
      vatRate: formData.vatRate
    };
    
    if (editingIndex !== null) {
      wizard.updateItem(editingIndex, newItem);
    } else {
      wizard.addItem(newItem);
    }
    
    resetForm();
    setShowAddDialog(false);
  };
  
  const handleEditItem = (index: number) => {
    const item = wizard.items[index];
    setFormData({
      type: item.type || 'material',
      designation: item.designation || '',
      description: item.description || '',
      unit: item.unit || 'u',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
      vatRate: item.vatRate || 20
    });
    setEditingIndex(index);
    setShowAddDialog(true);
  };
  
  const handleRemoveItem = (index: number) => {
    wizard.removeItem(index);
  };
  
  // Gestion de la sélection depuis la bibliothèque
  const handleLibraryItemSelect = (editorItem: EditorQuoteItem) => {
    const newItem: CreateQuoteItemData = {
      type: editorItem.type, // Les types sont maintenant alignés
      position: wizard.items.length,
      designation: editorItem.designation,
      description: editorItem.description,
      unit: editorItem.unit,
      quantity: 1, // Quantité par défaut à 1
      unitPrice: editorItem.unitPrice,
      discount: 0,
      vatRate: editorItem.vatRate || 20
    };
    
    wizard.addItem(newItem);
    setShowLibraryModal(false);
  };
  
  const totals = calculateGlobalTotals();
  
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          Ajoutez les articles (fournitures, prestations, main-d'œuvre) de votre devis.
        </AlertDescription>
      </Alert>
      
      {/* Boutons d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Articles du devis</h3>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowLibraryModal(true)}
          >
            <Package className="h-4 w-4 mr-2" />
            Bibliothèque
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Saisie manuelle
              </Button>
            </DialogTrigger>
          
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingIndex !== null ? 'Modifier l\'article' : 'Ajouter un article'}
                </DialogTitle>
                <DialogDescription>
                  {editingIndex !== null 
                    ? 'Modifiez les informations de cet article'
                    : 'Saisissez manuellement les informations de votre article'
                  }
                </DialogDescription>
              </DialogHeader>
            
              <div className="space-y-4">
              {/* Type d'article */}
              <div>
                <Label className="text-sm font-medium">Type d'article</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ITEM_TYPES).map(([key, type]) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="designation" className="text-sm font-medium">
                    Désignation *
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Ex: Carrelage 30x30 cm"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity" className="text-sm font-medium">Quantité</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit" className="text-sm font-medium">Unité</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="unitPrice" className="text-sm font-medium">Prix unitaire HT</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="discount" className="text-sm font-medium">Remise (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Taux de TVA</Label>
                  <div className="mt-1">
                    <VatRateSelector
                      value={formData.vatRate}
                      onChange={(vatRate) => setFormData({ ...formData, vatRate })}
                      allowQuickCreate={true}
                      showEmptyStateModal={true}
                    />
                  </div>
                </div>
              </div>
              
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!formData.designation.trim()}
                  >
                    {editingIndex !== null ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Modale bibliothèque */}
      <LibraryModal
        open={showLibraryModal}
        onOpenChange={setShowLibraryModal}
        onSelect={handleLibraryItemSelect}
      />
      
      {/* Liste des articles */}
      {wizard.items.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Package className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h4 className="font-medium text-gray-900">Aucun article ajouté</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Choisissez dans la bibliothèque ou saisissez manuellement
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLibraryModal(true)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Bibliothèque
                </Button>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Saisie manuelle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>P.U. HT</TableHead>
                  <TableHead>Remise</TableHead>
                  <TableHead>TVA</TableHead>
                  <TableHead>Total HT</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizard.items.map((item, index) => {
                  const { totalHt } = calculateItemTotal(item);
                  const ItemIcon = ITEM_TYPES[item.type || 'material']?.icon || Package;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <ItemIcon className="h-4 w-4 mt-1 text-gray-500" />
                          <div>
                            <div className="font-medium">{item.designation}</div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                            <Badge className={ITEM_TYPES[item.type || 'material']?.color}>
                              {ITEM_TYPES[item.type || 'material']?.label}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>{formatCurrency(item.unitPrice || 0)}</TableCell>
                      <TableCell>
                        {item.discount ? `${item.discount}%` : '-'}
                      </TableCell>
                      <TableCell>{item.vatRate}%</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(totalHt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditItem(index)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Totaux */}
      {wizard.items.length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Récapitulatif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total HT :</span>
                <span className="font-medium">{formatCurrency(totals.totalHt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total TVA :</span>
                <span className="font-medium">{formatCurrency(totals.totalVAT)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC :</span>
                  <span>{formatCurrency(totals.totalTtc)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Validation */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {wizard.isValid.items ? (
            <>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">
                {wizard.items.length} article(s) ajouté(s)
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-600">
                Ajoutez au moins un article
              </span>
            </>
          )}
        </div>
        
        {wizard.isValid.items && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✓ Étape validée
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ItemsStep;