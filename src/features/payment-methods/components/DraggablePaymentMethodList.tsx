/**
 * Liste des moyens de paiement avec drag & drop pour réorganiser l'ordre
 */
import React, { useState } from 'react';
import { GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PaymentMethodCard } from './PaymentMethodCard';
import type { PaymentMethod } from '../api/paymentMethods';

interface DraggablePaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  showPreview: boolean;
  onReorder: (reorderedMethods: PaymentMethod[]) => void;
  onToggleActive: (method: PaymentMethod, isActive: boolean) => void;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  getMethodTypeIcon: (methodType: string) => React.ComponentType<any>;
}

export const DraggablePaymentMethodList: React.FC<DraggablePaymentMethodListProps> = ({
  paymentMethods,
  showPreview,
  onReorder,
  onToggleActive,
  onEdit,
  onDelete,
  getMethodTypeIcon
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    
    // Style visuel pendant le drag
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restaurer l'opacité
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newMethods = [...paymentMethods];
    const draggedMethod = newMethods[draggedIndex];
    
    // Supprimer l'élément de sa position actuelle
    newMethods.splice(draggedIndex, 1);
    
    // L'insérer à la nouvelle position
    newMethods.splice(dropIndex, 0, draggedMethod);
    
    // Mettre à jour les display_order
    const reorderedMethods = newMethods.map((method, index) => ({
      ...method,
      display_order: index + 1
    }));
    
    onReorder(reorderedMethods);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (paymentMethods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {paymentMethods.map((method, index) => {
        const IconComponent = getMethodTypeIcon(method.method_type);
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        
        return (
          <Card 
            key={method.id} 
            className={cn(
              "p-4 transition-all duration-200 cursor-move",
              isDragging && "opacity-50 scale-105",
              isDragOver && "ring-2 ring-Beenaya-500 bg-Beenaya-50 dark:bg-Beenaya-900/20"
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Handle de drag */}
                <div className="cursor-grab active:cursor-grabbing p-1">
                  <GripVertical className="h-5 w-5 text-neutral-400" />
                </div>
                
                {/* Icône du moyen de paiement */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: method.background_color }}
                >
                  <IconComponent 
                    className="h-6 w-6"
                    style={{ color: method.text_color }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{method.label}</h3>
                    <Badge variant={method.is_active ? "default" : "secondary"}>
                      {method.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <div className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                      #{method.display_order}
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2 truncate">
                    {method.description}
                  </p>
                  
                  <div className="text-xs text-neutral-500">
                    Type: {method.method_type_display}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Switch
                  checked={method.is_active}
                  onCheckedChange={(checked) => onToggleActive(method, checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(method);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(method);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Aperçu du moyen de paiement */}
            {showPreview && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="text-xs text-neutral-600 mb-2">Aperçu sur les documents :</div>
                <PaymentMethodCard
                  paymentMethod={method}
                  style="modern"
                  className="w-full max-w-sm"
                />
              </div>
            )}
          </Card>
        );
      })}
      
      {/* Instructions */}
      <div className="text-xs text-neutral-500 text-center py-2 border-t border-dashed border-neutral-200">
        💡 Glissez-déposez les moyens de paiement pour réorganiser leur ordre d'affichage
      </div>
    </div>
  );
};