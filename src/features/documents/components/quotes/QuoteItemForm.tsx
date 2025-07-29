import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Save, X } from 'lucide-react';
import { QuoteItem, CreateQuoteItemData } from '@/features/documents/types';
import { formatCurrency } from '@/lib/utils';
import { VatRateSelector } from '@/features/documents/components/VatRateSelector';

interface QuoteItemFormProps {
  item?: QuoteItem;
  quoteId: string;
  onSave: (data: CreateQuoteItemData) => Promise<void>;
  onCancel: () => void;
  parentItem?: QuoteItem; // Pour la hiérarchie
}

interface FormData extends CreateQuoteItemData {
  calculated_total?: number;
}

export function QuoteItemForm({ item, quoteId, onSave, onCancel, parentItem }: QuoteItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedValues, setCalculatedValues] = useState({
    subtotal: 0,
    discountAmount: 0,
    discountedSubtotal: 0,
    vatAmount: 0,
    total: 0,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: item ? {
      description: item.description,
      reference: item.reference || '',
      item_type: item.item_type,
      quantity: item.quantity || 1,
      unit: item.unit || '',
      unit_price: item.unit_price || 0,
      discount_percentage: item.discount_percentage || 0,
      vat_rate: item.vat_rate || 0,
      notes: item.notes || '',
      parent_item: item.parent_item || parentItem?.id || null,
    } : {
      description: '',
      reference: '',
      item_type: 'item',
      quantity: 1,
      unit: 'unité',
      unit_price: 0,
      discount_percentage: 0,
      vat_rate: 0,
      notes: '',
      parent_item: parentItem?.id || null,
    }
  });

  // Surveillance des valeurs pour calcul automatique
  const quantity = watch('quantity');
  const unitPrice = watch('unit_price');
  const discountPercentage = watch('discount_percentage');
  const vatRate = watch('vat_rate');
  const itemType = watch('item_type');

  useEffect(() => {
    const q = Number(quantity) || 0;
    const up = Number(unitPrice) || 0;
    const dp = Number(discountPercentage) || 0;
    const vr = Number(vatRate) || 0;

    const subtotal = q * up;
    const discountAmount = subtotal * (dp / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const vatAmount = discountedSubtotal * (vr / 100);
    const total = discountedSubtotal + vatAmount;

    setCalculatedValues({
      subtotal,
      discountAmount,
      discountedSubtotal,
      vatAmount,
      total,
    });
  }, [quantity, unitPrice, discountPercentage, vatRate]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'chapter': return '📁';
      case 'section': return '📋';
      default: return '🔧';
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'chapter': return 'Chapitre';
      case 'section': return 'Section';
      default: return 'Élément';
    }
  };

  const isStructuralItem = itemType === 'chapter' || itemType === 'section';

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">{getItemTypeIcon(itemType)}</span>
          {item ? 'Modifier l\'élément' : 'Nouvel élément'}
        </CardTitle>
        {parentItem && (
          <Badge variant="outline" className="w-fit">
            Sous-élément de: {parentItem.description}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type d'élément */}
            <div className="space-y-2">
              <Label htmlFor="item_type">Type d'élément</Label>
              <Select
                value={itemType}
                onValueChange={(value) => setValue('item_type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chapter">
                    <div className="flex items-center gap-2">
                      <span>📁</span>
                      <span>Chapitre</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="section">
                    <div className="flex items-center gap-2">
                      <span>📋</span>
                      <span>Section</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="item">
                    <div className="flex items-center gap-2">
                      <span>🔧</span>
                      <span>Élément</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Référence */}
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                {...register('reference')}
                placeholder="REF-001"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              {...register('description', { required: 'La description est obligatoire' })}
              placeholder="Décrivez l'élément..."
              rows={3}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Détails quantitatifs - seulement pour les éléments */}
          {!isStructuralItem && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantité */}
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantité</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('quantity', { 
                      required: 'La quantité est obligatoire',
                      min: { value: 0, message: 'La quantité doit être positive' }
                    })}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm">{errors.quantity.message}</p>
                  )}
                </div>

                {/* Unité */}
                <div className="space-y-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Select
                    value={watch('unit')}
                    onValueChange={(value) => setValue('unit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unité">Unité</SelectItem>
                      <SelectItem value="m">Mètre</SelectItem>
                      <SelectItem value="m²">Mètre carré</SelectItem>
                      <SelectItem value="m³">Mètre cube</SelectItem>
                      <SelectItem value="kg">Kilogramme</SelectItem>
                      <SelectItem value="h">Heure</SelectItem>
                      <SelectItem value="jour">Jour</SelectItem>
                      <SelectItem value="forfait">Forfait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prix unitaire */}
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Prix unitaire (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('unit_price', { 
                      required: 'Le prix unitaire est obligatoire',
                      min: { value: 0, message: 'Le prix doit être positif' }
                    })}
                  />
                  {errors.unit_price && (
                    <p className="text-red-500 text-sm">{errors.unit_price.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Remise */}
                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Remise (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('discount_percentage', {
                      min: { value: 0, message: 'La remise doit être positive' },
                      max: { value: 100, message: 'La remise ne peut pas dépasser 100%' }
                    })}
                  />
                  {errors.discount_percentage && (
                    <p className="text-red-500 text-sm">{errors.discount_percentage.message}</p>
                  )}
                </div>

                {/* TVA */}
                <div className="space-y-2">
                  <Label htmlFor="vat_rate">TVA (%)</Label>
                  <VatRateSelector
                    value={String(watch('vat_rate'))}
                    onChange={(value) => setValue('vat_rate', Number(value))}
                    allowQuickCreate={true}
                    placeholder="Sélectionner un taux de TVA"
                  />
                </div>
              </div>

              {/* Calculs automatiques */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculs automatiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total HT:</span>
                    <span>{formatCurrency(calculatedValues.subtotal)}</span>
                  </div>
                  {calculatedValues.discountAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise ({discountPercentage}%):</span>
                      <span>-{formatCurrency(calculatedValues.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Sous-total après remise:</span>
                    <span>{formatCurrency(calculatedValues.discountedSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA ({vatRate}%):</span>
                    <span>{formatCurrency(calculatedValues.vatAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total TTC:</span>
                    <span>{formatCurrency(calculatedValues.total)}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              {...register('notes')}
              placeholder="Notes additionnelles..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Sauvegarde...' : item ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}