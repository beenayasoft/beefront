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
import { Tier } from "./types";
import { useEffect, useState } from "react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tier: Tier | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tier,
}: DeleteConfirmDialogProps) {
  const [tierName, setTierName] = useState<string>("");

  // Stocker le nom du tier dans un état local pour éviter des problèmes
  // lorsque la référence du tier est mise à null après la fermeture
  useEffect(() => {
    if (tier && open) {
      setTierName(tier.name);
    }
  }, [tier, open]);

  const handleConfirm = () => {
    onConfirm();
    // Assurer que la modale est fermée
    onOpenChange(false);
  };

  // Si pas ouvert, ne rien rendre pour éviter les problèmes d'accessibilité
  if (!open) {
    return null;
  }

  // Si pas de tier mais ouvert, afficher un message d'erreur
  if (!tier) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="benaya-glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur</AlertDialogTitle>
            <AlertDialogDescription>
              Impossible de charger les informations du tiers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              Fermer
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="benaya-glass">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>{tierName}</strong> ? Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 