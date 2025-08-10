import { ContactFormDialog } from "./ContactFormDialog";

interface ContactCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  tierId: string;
  tierName: string;
}

/**
 * Composant pour la création de nouveaux contacts.
 * Utilise le nouveau ContactFormDialog unifié en mode 'create'.
 */
export function ContactCreateDialog(props: ContactCreateDialogProps) {
  return (
    <ContactFormDialog
      {...props}
      mode="create"
    />
  );
}