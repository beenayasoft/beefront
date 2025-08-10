import { AddressFormDialog } from "./AddressFormDialog";

interface AddressCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tierId: string;
  tierName: string;
  tierType?: string;
}

/**
 * Composant pour la création de nouvelles adresses.
 * Utilise le nouveau AddressFormDialog unifié en mode 'create'.
 */
export function AddressCreateDialog(props: AddressCreateDialogProps) {
  return (
    <AddressFormDialog
      {...props}
      mode="create"
    />
  );
}