/**
 * Types pour la feature payment-methods
 */

// Re-export des types depuis l'API
export type {
  PaymentMethod,
  PaymentMethodType,
  BankTransferDetails,
  CheckDetails
} from '../api/paymentMethods';

// Types spécifiques à l'UI
export interface PaymentMethodFormData extends Omit<PaymentMethod, 'id' | 'method_type_display' | 'formatted_details'> {
  id?: number;
}

export interface PaymentMethodsListProps {
  showPreview?: boolean;
  onMethodCreated?: (method: PaymentMethod) => void;
  onMethodUpdated?: (method: PaymentMethod) => void;
  onMethodDeleted?: (methodId: number) => void;
}

export interface DragDropResult {
  draggedIndex: number;
  dropIndex: number;
  reorderedItems: PaymentMethod[];
}