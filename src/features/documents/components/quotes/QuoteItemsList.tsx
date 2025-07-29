import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Grip, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useModalState } from '@/hooks/useModalState';
import { quotesApi } from '../../api/quotes';
import { QuoteItem } from '../../types/quotes.types';
import { formatCurrency } from '@/lib/utils';

interface QuoteItemsListProps {
  quoteId: string;
  items: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
  readonly?: boolean;
}

export function QuoteItemsList({ quoteId, items, onItemsChange, readonly = false }: QuoteItemsListProps) {
  const [localItems, setLocalItems] = useState<QuoteItem[]>(items);
  const [isReordering, setIsReordering] = useState(false);

  const editModal = useModalState<QuoteItem>();
  const deleteModal = useModalState<QuoteItem>();

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || readonly) {
      return;
    }

    const newItems = Array.from(localItems);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setLocalItems(newItems);
    setIsReordering(true);

    try {
      const itemIds = newItems.map(item => item.id);
      await quotesApi.reorderQuoteItems(quoteId, itemIds);
      onItemsChange(newItems);
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error);
      setLocalItems(items); // Rollback en cas d'erreur
    } finally {
      setIsReordering(false);
    }
  };

  const handleEditItem = (item: QuoteItem) => {
    editModal.actions.open(item);
  };

  const handleDeleteItem = (item: QuoteItem) => {
    deleteModal.actions.open(item);
  };

  const confirmDeleteItem = async () => {
    if (!deleteModal.data) return;

    try {
      await quotesApi.deleteQuoteItemByDocument(quoteId, deleteModal.data.id);
      const updatedItems = localItems.filter(item => item.id !== deleteModal.data!.id);
      setLocalItems(updatedItems);
      onItemsChange(updatedItems);
      deleteModal.actions.close();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getItemHierarchy = (item: QuoteItem) => {
    if (item.item_type === 'chapter') {
      return { level: 0, icon: '📁', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    }
    if (item.item_type === 'section') {
      return { level: 1, icon: '📋', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    }
    return { level: 2, icon: '🔧', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  };

  const calculateItemTotal = (item: QuoteItem): number => {
    const subtotal = (item.quantity || 0) * (item.unit_price || 0);
    const discountAmount = subtotal * ((item.discount_percentage || 0) / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const vatAmount = discountedSubtotal * ((item.vat_rate || 0) / 100);
    return discountedSubtotal + vatAmount;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Éléments du devis</h3>
        {!readonly && (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un élément
          </Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="quote-items">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-2 min-h-[100px] p-2 rounded-lg transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-transparent'
              }`}
            >
              {localItems.map((item, index) => {
                const hierarchy = getItemHierarchy(item);
                const total = calculateItemTotal(item);

                return (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}
                    isDragDisabled={readonly || isReordering}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${hierarchy.bgColor} ${hierarchy.borderColor} ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        } transition-shadow`}
                        style={{
                          marginLeft: `${hierarchy.level * 20}px`,
                          ...provided.draggableProps.style,
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            {!readonly && (
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:cursor-grabbing"
                              >
                                <Grip className="h-4 w-4 text-gray-400" />
                              </div>
                            )}

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                              <div className="md:col-span-2 flex items-center gap-2">
                                <span className="text-lg">{hierarchy.icon}</span>
                                <div>
                                  <div className="font-medium">{item.description}</div>
                                  {item.reference && (
                                    <div className="text-sm text-gray-500">Réf: {item.reference}</div>
                                  )}
                                </div>
                              </div>

                              <div className="text-center">
                                <Badge variant="outline" className="text-xs">
                                  {item.item_type}
                                </Badge>
                              </div>

                              <div className="text-center">
                                {item.quantity && item.unit ? (
                                  <span className="text-sm">
                                    {item.quantity} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>

                              <div className="text-center">
                                {item.unit_price ? (
                                  <span className="text-sm">{formatCurrency(item.unit_price)}</span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="font-medium">{formatCurrency(total)}</span>
                                
                                {!readonly && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteItem(item)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Supprimer
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              {localItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">📋</div>
                  <p>Aucun élément dans ce devis</p>
                  {!readonly && (
                    <p className="text-sm">Cliquez sur "Ajouter un élément" pour commencer</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Modal de confirmation de suppression */}
      {deleteModal.isOpen && deleteModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'élément "{deleteModal.data.description}" ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={deleteModal.actions.close}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteItem}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}