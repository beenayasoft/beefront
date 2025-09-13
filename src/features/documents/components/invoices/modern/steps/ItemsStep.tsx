/**
 * Étape des articles/prestations pour les factures
 */
import React, { useState } from 'react';
import { Plus, Trash2, Edit, Package, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { UseInvoiceWizard } from '../../../hooks/useInvoiceWizard';
import { InvoiceItemForm } from '../../InvoiceItemForm';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ItemsStepProps {
  wizard: UseInvoiceWizard;
}

export const ItemsStep: React.FC<ItemsStepProps> = ({ wizard }) => {
  const { formatCurrency } = useCurrency();
  
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Calculs des totaux
  const totals = wizard.items.reduce((acc, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const vatRate = parseFloat(item.vatRate) || 20;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    const totalHt = subtotal - discountAmount;
    const vatAmount = (totalHt * vatRate) / 100;
    const totalTtc = totalHt + vatAmount;
    
    acc.totalHt += totalHt;
    acc.totalVAT += vatAmount;
    acc.totalTtc += totalTtc;
    
    return acc;
  }, { totalHt: 0, totalVAT: 0, totalTtc: 0 });
  
  const handleAddItem = () => {
    setEditingIndex(null);
    setShowItemForm(true);
  };
  
  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setShowItemForm(true);
  };
  
  const handleSaveItem = (itemData: any) => {
    if (editingIndex !== null) {
      wizard.updateItem(editingIndex, itemData);
    } else {
      wizard.addItem(itemData);
    }
    setShowItemForm(false);
    setEditingIndex(null);
  };
  
  const handleDeleteItem = (index: number) => {
    wizard.removeItem(index);
  };
  
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          {wizard.selectedQuote && wizard.items.length > 0 ? (
            <>
              ✅ Articles automatiquement remplis depuis le devis <strong>{wizard.selectedQuote.number}</strong>. 
              Vous pouvez modifier, ajouter ou supprimer des articles selon vos besoins.
            </>
          ) : (
            'Ajoutez les prestations, matériaux ou services à facturer. Au moins un article est requis.'
          )}
        </AlertDescription>
      </Alert>
      
      {/* Bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Articles et prestations</h3>
        <Button onClick={handleAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un article
        </Button>
      </div>
      
      {/* Liste des articles */}
      {wizard.items.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Désignation</TableHead>
                  <TableHead className="text-center w-20">Qté</TableHead>
                  <TableHead className="text-center w-24">Unité</TableHead>
                  <TableHead className="text-right w-32">Prix unitaire</TableHead>
                  <TableHead className="text-center w-20">Remise</TableHead>
                  <TableHead className="text-center w-20">TVA</TableHead>
                  <TableHead className="text-right w-32">Total HT</TableHead>
                  <TableHead className="text-center w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizard.items.map((item, index) => {
                  const quantity = parseFloat(item.quantity) || 0;
                  const unitPrice = parseFloat(item.unitPrice) || 0;
                  const discount = parseFloat(item.discount) || 0;
                  const subtotal = quantity * unitPrice;
                  const discountAmount = (subtotal * discount) / 100;
                  const totalHt = subtotal - discountAmount;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.designation}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{quantity}</TableCell>
                      <TableCell className="text-center">{item.unit || 'unité'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(unitPrice)}</TableCell>
                      <TableCell className="text-center">
                        {discount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            -{discount}%
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {item.vatRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(totalHt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(index)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article ajouté</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Commencez par ajouter des prestations, matériaux ou services à votre facture.
            </p>
            <Button onClick={handleAddItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ajouter le premier article
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Récapitulatif des totaux */}
      {wizard.items.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total HT :</span>
                <span className="font-medium">{formatCurrency(totals.totalHt)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA :</span>
                <span className="font-medium">{formatCurrency(totals.totalVAT)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
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
      {wizard.items.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Ajoutez au moins un article pour continuer.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Formulaire d'ajout/édition */}
      <InvoiceItemForm
        open={showItemForm}
        onOpenChange={setShowItemForm}
        onSubmit={handleSaveItem}
        item={editingIndex !== null ? wizard.items[editingIndex] : undefined}
        isEditing={editingIndex !== null}
      />
    </div>
  );
};