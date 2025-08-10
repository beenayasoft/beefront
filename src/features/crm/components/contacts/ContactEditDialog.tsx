import { ContactFormDialog } from "./ContactFormDialog";

interface Contact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  fonction: string;
  is_contact_principal_devis?: boolean;
  contact_principal_devis?: boolean;
  is_contact_principal_facture?: boolean;
  contact_principal_facture?: boolean;
}

interface ContactEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  contact: Contact;
  tierId: string;
  tierName: string;
}

/**
 * Composant de rétrocompatibilité pour l'édition de contacts.
 * Utilise le nouveau ContactFormDialog unifié en mode 'edit'.
 */
export function ContactEditDialog(props: ContactEditDialogProps) {
  return (
    <ContactFormDialog
      {...props}
      mode="edit"
    />
  );
}