import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  item: { name: string } | null;
  loading?: boolean;
  title?: string;
  description?: string;
  itemType?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  item,
  loading = false,
  title = "Confirmer la suppression",
  description,
  itemType = "cet élément",
}: DeleteConfirmDialogProps) {
  const [itemName, setItemName] = useState<string>("");

  // Stocker le nom de l'élément dans un état local pour éviter des problèmes
  // lorsque la référence de l'item est mise à null après la fermeture
  useEffect(() => {
    if (item && open) {
      setItemName(item.name);
    }
  }, [item, open]);

  // Réinitialiser l'état quand la modale se ferme
  useEffect(() => {
    if (!open) {
      setItemName("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (loading) return;
    
    try {
      await onConfirm();
      // La fermeture sera gérée par useModalState ou le parent
    } catch (error) {
      console.error('❌ Erreur lors de la confirmation de suppression:', error);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onOpenChange(false);
  };

  // Si pas ouvert, ne rien rendre pour éviter les problèmes d'accessibilité
  if (!open) {
    return null;
  }

  // Si pas d'item mais ouvert, afficher un message d'erreur
  if (!item) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="Beenaya-glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur</AlertDialogTitle>
            <AlertDialogDescription>
              Impossible de charger les informations de l'élément.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Fermer
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const defaultDescription = description || 
    `Êtes-vous sûr de vouloir supprimer ${itemType} "${itemName}" ? Cette action est irréversible.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="Beenaya-glass">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}