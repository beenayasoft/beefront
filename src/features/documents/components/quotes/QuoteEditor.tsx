import React, { useState, useEffect } from 'react';
import { Plus, Settings, Download, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useModalState } from '@/hooks/useModalState';
import { QuoteItemsList } from './QuoteItemsList';
import { QuoteItemForm } from './QuoteItemForm';
import { BulkItemOperations } from './BulkItemOperations';
import { quotesApi } from '@/features/documents/api/quotes';
import { Quote, QuoteItem, CreateQuoteItemData } from '@/features/documents/types/quotes.types';
import { useCurrency } from '@/contexts/CurrencyContext';

interface QuoteEditorProps {
  quote: Quote;
  onQuoteChange: (quote: Quote) => void;
  readonly?: boolean;
}

export function QuoteEditor({ quote, onQuoteChange, readonly = false }: QuoteEditorProps) {
  const { formatCurrency } = useCurrency();
  
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalItems: 0,
    totalValue: 0,
    totalValueHT: 0,
    totalVAT: 0,
    itemsByType: {
      chapter: 0,
      section: 0,
      item: 0,
    }
  });

  const addItemModal = useModalState<QuoteItem | null>();
  const editItemModal = useModalState<QuoteItem>();
  const bulkOperationsModal = useModalState();

  useEffect(() => {
    loadQuoteItems();
  }, [quote.id]);

  useEffect(() => {
    calculateStatistics();
  }, [items]);

  const loadQuoteItems = async () => {
    setIsLoading(true);
    try {
      const quoteItems = await quotesApi.getQuoteItemsByDocument(quote.id);
      setItems(quoteItems);
    } catch (error) {
      console.error('Erreur lors du chargement des éléments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStatistics = () => {
    const stats = items.reduce((acc, item) => {
      // Compter par type
      acc.itemsByType[item.item_type as keyof typeof acc.itemsByType]++;
      acc.totalItems++;

      // Calculer les valeurs pour les éléments facturables
      if (item.item_type === 'item' && item.quantity && item.unit_price) {
        const subtotal = item.quantity * item.unit_price;
        const discountAmount = subtotal * ((item.discount_percentage || 0) / 100);
        const subtotalAfterDiscount = subtotal - discountAmount;
        const vatAmount = subtotalAfterDiscount * ((item.vat_rate || 0) / 100);
        
        acc.totalValueHT += subtotalAfterDiscount;
        acc.totalVAT += vatAmount;
        acc.totalValue += subtotalAfterDiscount + vatAmount;
      }

      return acc;
    }, {
      totalItems: 0,
      totalValue: 0,
      totalValueHT: 0,
      totalVAT: 0,
      itemsByType: { chapter: 0, section: 0, item: 0 }
    });

    setStatistics(stats);
  };

  const handleItemsChange = (newItems: QuoteItem[]) => {
    setItems(newItems);
    // Optionnel: mettre à jour le devis parent si nécessaire
    // onQuoteChange({ ...quote, total_amount: statistics.totalValue });
  };

  const handleAddItem = async (data: CreateQuoteItemData) => {
    try {
      const newItem = await quotesApi.createQuoteItemByDocument(quote.id, data);
      setItems([...items, newItem]);
      addItemModal.actions.close();
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      throw error;
    }
  };

  const handleEditItem = async (data: CreateQuoteItemData) => {
    if (!editItemModal.data) return;

    try {
      const updatedItem = await quotesApi.updateQuoteItemByDocument(
        quote.id,
        editItemModal.data.id,
        data
      );
      setItems(items.map(item => 
        item.id === editItemModal.data!.id ? updatedItem : item
      ));
      editItemModal.actions.close();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error;
    }
  };

  const openAddItemModal = (parentItem?: QuoteItem) => {
    addItemModal.actions.open(parentItem || null);
  };

  const openBulkOperations = () => {
    if (selectedItems.length > 0) {
      bulkOperationsModal.actions.open();
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Édition du devis {quote.number}</span>
            <Badge variant={quote.status === 'draft' ? 'secondary' : 'default'}>
              {quote.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalItems}</div>
              <div className="text-sm text-gray-600">Éléments totaux</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statistics.itemsByType.item}</div>
              <div className="text-sm text-gray-600">Éléments facturables</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(statistics.totalValueHT)}</div>
              <div className="text-sm text-gray-600">Total HT</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(statistics.totalValue)}</div>
              <div className="text-sm text-gray-600">Total TTC</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre d'actions */}
      {!readonly && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={() => openAddItemModal()} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un élément
            </Button>
            <Button
              variant="outline"
              onClick={openBulkOperations}
              disabled={selectedItems.length === 0}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Actions en lot ({selectedItems.length})
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Bibliothèque
            </Button>
          </div>
        </div>
      )}

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">
            Éléments ({statistics.totalItems})
          </TabsTrigger>
          <TabsTrigger value="structure">
            Structure hiérarchique
          </TabsTrigger>
          <TabsTrigger value="summary">
            Résumé financier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">Chargement des éléments...</div>
              </CardContent>
            </Card>
          ) : (
            <QuoteItemsList
              quoteId={quote.id}
              items={items}
              onItemsChange={handleItemsChange}
              readonly={readonly}
            />
          )}
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Structure hiérarchique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Vue hiérarchique des éléments */}
                {Object.entries(statistics.itemsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {type === 'chapter' ? '📁' : type === 'section' ? '📋' : '🔧'}
                      </span>
                      <span className="capitalize">{type}s</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé financier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sous-total HT:</span>
                      <span>{formatCurrency(statistics.totalValueHT)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA:</span>
                      <span>{formatCurrency(statistics.totalVAT)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total TTC:</span>
                      <span>{formatCurrency(statistics.totalValue)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• {statistics.itemsByType.chapter} chapitre(s)</p>
                    <p>• {statistics.itemsByType.section} section(s)</p>
                    <p>• {statistics.itemsByType.item} élément(s) facturable(s)</p>
                    <p>• Dernière modification: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {addItemModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <QuoteItemForm
            quoteId={quote.id}
            parentItem={addItemModal.data}
            onSave={handleAddItem}
            onCancel={addItemModal.actions.close}
          />
        </div>
      )}

      {editItemModal.isOpen && editItemModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <QuoteItemForm
            item={editItemModal.data}
            quoteId={quote.id}
            onSave={handleEditItem}
            onCancel={editItemModal.actions.close}
          />
        </div>
      )}

      {bulkOperationsModal.isOpen && (
        <BulkItemOperations
          quoteId={quote.id}
          items={items}
          selectedItems={selectedItems}
          onItemsChange={handleItemsChange}
          onSelectionChange={setSelectedItems}
          onClose={bulkOperationsModal.actions.close}
        />
      )}
    </div>
  );
}