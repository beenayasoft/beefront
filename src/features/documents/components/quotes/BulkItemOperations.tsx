import React, { useState } from 'react';
import { Check, Trash2, Edit, Move, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuoteItem, CreateQuoteItemData } from '../../types/quotes.types';
import { quotesApi } from '../../api/quotes';
import { formatCurrency } from '@/lib/utils';

interface BulkItemOperationsProps {
  quoteId: string;
  items: QuoteItem[];
  selectedItems: string[];
  onItemsChange: (items: QuoteItem[]) => void;
  onSelectionChange: (selectedIds: string[]) => void;
  onClose: () => void;
}

export function BulkItemOperations({
  quoteId,
  items,
  selectedItems,
  onItemsChange,
  onSelectionChange,
  onClose
}: BulkItemOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [operation, setOperation] = useState<'delete' | 'update' | 'move'>('delete');
  const [bulkUpdateData, setBulkUpdateData] = useState<Partial<CreateQuoteItemData>>({});
  const [targetPosition, setTargetPosition] = useState<number>(0);
  const [results, setResults] = useState<{
    success: number;
    errors: Array<{ id: string; error: string }>;
  } | null>(null);

  const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
  const totalValue = selectedItemsData.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unit_price || 0);
    const discountAmount = itemTotal * ((item.discount_percentage || 0) / 100);
    const discountedSubtotal = itemTotal - discountAmount;
    const vatAmount = discountedSubtotal * ((item.vat_rate || 0) / 100);
    return sum + discountedSubtotal + vatAmount;
  }, 0);

  const handleBulkOperation = async () => {
    if (selectedItems.length === 0) return;

    setIsProcessing(true);
    setResults(null);

    try {
      const operationData = {
        action: operation,
        items: selectedItems.map(id => ({
          id,
          data: operation === 'update' ? bulkUpdateData : undefined,
          target_position: operation === 'move' ? targetPosition : undefined,
        }))
      };

      const result = await quotesApi.bulkOperationsQuoteItems(quoteId, operationData);
      setResults(result);

      if (result.success > 0) {
        // Mettre à jour la liste des items selon l'opération
        if (operation === 'delete') {
          const updatedItems = items.filter(item => !selectedItems.includes(item.id));
          onItemsChange(updatedItems);
          onSelectionChange([]);
        } else {
          // Pour update et move, rafraîchir la liste depuis l'API
          const updatedItems = await quotesApi.getQuoteItemsByDocument(quoteId);
          onItemsChange(updatedItems);
          onSelectionChange([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'opération en lot:', error);
      setResults({
        success: 0,
        errors: [{ id: 'global', error: 'Erreur lors de l\'exécution de l\'opération' }]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getOperationIcon = () => {
    switch (operation) {
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      case 'move': return <Move className="h-4 w-4" />;
    }
  };

  const getOperationColor = () => {
    switch (operation) {
      case 'delete': return 'text-red-600';
      case 'update': return 'text-blue-600';
      case 'move': return 'text-green-600';
    }
  };

  const canExecute = () => {
    if (selectedItems.length === 0) return false;
    if (operation === 'move' && (targetPosition < 0 || targetPosition >= items.length)) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getOperationIcon()}
              Opérations en lot sur {selectedItems.length} élément(s)
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Résumé de la sélection */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{selectedItems.length}</div>
                  <div className="text-sm text-gray-600">Éléments sélectionnés</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
                  <div className="text-sm text-gray-600">Valeur totale</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedItemsData.filter(item => item.item_type === 'item').length}
                  </div>
                  <div className="text-sm text-gray-600">Éléments facturables</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des éléments sélectionnés */}
          <div className="space-y-2">
            <h4 className="font-medium">Éléments sélectionnés:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedItemsData.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Checkbox
                    checked={true}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        onSelectionChange(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-gray-600">
                      <Badge variant="outline" className="mr-2">
                        {item.item_type}
                      </Badge>
                      {item.quantity && item.unit && (
                        <span>{item.quantity} {item.unit}</span>
                      )}
                    </div>
                  </div>
                  {item.unit_price && (
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.unit_price)}</div>
                      <div className="text-sm text-gray-600">unitaire</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configuration de l'opération */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type d'opération</Label>
              <Select value={operation} onValueChange={(value: any) => setOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-600" />
                      <span>Supprimer les éléments</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="update">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-blue-600" />
                      <span>Modifier les éléments</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="move">
                    <div className="flex items-center gap-2">
                      <Move className="h-4 w-4 text-green-600" />
                      <span>Déplacer les éléments</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Configuration spécifique selon l'opération */}
            {operation === 'update' && (
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-700">Modifications à appliquer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Remise (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="Nouveau taux de remise"
                        value={bulkUpdateData.discount_percentage || ''}
                        onChange={(e) => setBulkUpdateData({
                          ...bulkUpdateData,
                          discount_percentage: e.target.value ? Number(e.target.value) : undefined
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>TVA (%)</Label>
                      <Select
                        value={bulkUpdateData.vat_rate ? String(bulkUpdateData.vat_rate) : ''}
                        onValueChange={(value) => setBulkUpdateData({
                          ...bulkUpdateData,
                          vat_rate: value ? Number(value) : undefined
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Nouveau taux de TVA" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0% (Exonéré)</SelectItem>
                          <SelectItem value="5.5">5,5% (Réduit)</SelectItem>
                          <SelectItem value="10">10% (Intermédiaire)</SelectItem>
                          <SelectItem value="20">20% (Normal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Seuls les champs renseignés seront modifiés sur tous les éléments sélectionnés.
                  </p>
                </CardContent>
              </Card>
            )}

            {operation === 'move' && (
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-700">Position de destination</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Nouvelle position</Label>
                    <Input
                      type="number"
                      min="0"
                      max={items.length - 1}
                      value={targetPosition}
                      onChange={(e) => setTargetPosition(Number(e.target.value))}
                    />
                    <p className="text-sm text-gray-600">
                      Position 0 = début de la liste, position {items.length - 1} = fin de la liste
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {operation === 'delete' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-red-800">Attention</div>
                      <p className="text-sm text-red-700">
                        Cette action supprimera définitivement {selectedItems.length} élément(s) 
                        du devis. Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Résultats */}
          {results && (
            <Card className={results.errors.length > 0 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-green-800">
                      Opération terminée: {results.success} succès
                    </div>
                    {results.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-yellow-800">
                          {results.errors.length} erreur(s):
                        </div>
                        <ul className="text-sm text-yellow-700 mt-1">
                          {results.errors.map((error, index) => (
                            <li key={index}>• {error.error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {results ? 'Fermer' : 'Annuler'}
            </Button>
            {!results && (
              <Button
                onClick={handleBulkOperation}
                disabled={!canExecute() || isProcessing}
                className={getOperationColor()}
              >
                {getOperationIcon()}
                <span className="ml-2">
                  {isProcessing ? 'Traitement...' : `Exécuter l'opération`}
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}