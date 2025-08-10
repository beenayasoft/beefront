import { AddressFormDialog } from "./AddressFormDialog";

interface Address {
  id: string;
  libelle: string;
  rue: string;
  ville: string;
  code_postal: string;
  pays: string;
  is_facturation: boolean;
  tier: string;
}

interface AddressEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  address: Address;
  tierId: string;
  tierName: string;
  tierType?: string;
}

/**
 * Composant de rétrocompatibilité pour l'édition d'adresses.
 * Utilise le nouveau AddressFormDialog unifié en mode 'edit'.
 */
export function AddressEditDialog(props: AddressEditDialogProps) {
  return (
    <AddressFormDialog
      {...props}
      mode="edit"
    />
  );
}