import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface DraggableInvoiceItemProps {
  item: InvoiceItem;
  onRemove: (id: string) => void;
  onEdit?: (item: InvoiceItem) => void;
  indentLevel?: number;
  showTaxIncluded?: boolean;
}

export function DraggableInvoiceItem({ 
  item, 
  onRemove, 
  onEdit,
  indentLevel = 0,
  showTaxIncluded = true
}: DraggableInvoiceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const isChapter = item.type === 'chapter' || item.type === 'section';
  const isDiscount = item.type === 'discount';
  const paddingLeft = indentLevel * 20 + 16; // 16px base padding + 20px per level

  return (
    <tr 
      ref={setNodeRef} 
      style={style} 
      className={`${isChapter ? "bg-neutral-50 dark:bg-neutral-800/50" : ""} ${isDiscount ? "bg-red-50 dark:bg-red-900/10" : ""} ${isDragging ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
    >
      <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          >
            <GripVertical className="w-4 h-4 text-neutral-400" />
          </div>
          <div style={{ paddingLeft: `${indentLevel * 20}px` }}>
            <div className={isChapter ? "font-semibold" : isDiscount ? "text-red-600 dark:text-red-400 font-medium" : "font-medium"}>
              {item.designation}
            </div>
            {!isChapter && item.description && (
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {item.description}
              </div>
            )}
          </div>
        </div>
      </td>
      {!isChapter && (
        <>
          <td className="py-3 px-4 text-right border-b border-neutral-200 dark:border-neutral-700">
            {item.quantity} {item.unit}
          </td>
          <td className="py-3 px-4 text-right border-b border-neutral-200 dark:border-neutral-700">
            {formatCurrency(Math.abs(item.unitPrice))} MAD
          </td>
          <td className="py-3 px-4 text-right border-b border-neutral-200 dark:border-neutral-700">
            {item.vatRate}%
          </td>
          <td className="py-3 px-4 text-right border-b border-neutral-200 dark:border-neutral-700">
            {item.discount ? `${item.discount}%` : "-"}
          </td>
          <td className="py-3 px-4 text-right border-b border-neutral-200 dark:border-neutral-700">
            <span className={isDiscount ? "text-red-600 dark:text-red-400 font-medium" : "font-medium"}>
              {formatCurrency(Math.abs(item.totalHT))} {isDiscount && "-"} MAD
            </span>
          </td>
          {showTaxIncluded && (
            <td className="py-3 px-4 text-right font-semibold border-b border-neutral-200 dark:border-neutral-700">
              <span className={isDiscount ? "text-red-600 dark:text-red-400" : ""}>
                {formatCurrency(Math.abs(item.totalTTC))} {isDiscount && "-"} MAD
              </span>
            </td>
          )}
        </>
      )}
      {isChapter && (
        <td colSpan={showTaxIncluded ? 6 : 5} className="border-b border-neutral-200 dark:border-neutral-700"></td>
      )}
      <td className="py-3 px-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-end gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(item)}
              className="h-8 w-8"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}