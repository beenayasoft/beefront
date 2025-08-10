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
import { Tier } from "@/features/crm/types/crm.types";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  tier: Tier | null;
  loading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tier,
  loading = false,
}: DeleteConfirmDialogProps) {
  const [tierName, setTierName] = useState<string>("");

  // Stocker le nom du tier dans un état local pour éviter des problèmes
  // lorsque la référence du tier est mise à null après la fermeture
  useEffect(() => {
    if (tier && open) {
      setTierName(tier.nom); // ✅ Utiliser tier.nom au lieu de tier.name
    }
  }, [tier, open]);

  // Réinitialiser l'état quand la modale se ferme
  useEffect(() => {
    if (!open) {
      setTierName("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (loading) return;
    
    try {
      await onConfirm();
      // La fermeture sera gérée par useModalState
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

  // Si pas de tier mais ouvert, afficher un message d'erreur
  if (!tier) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="Beenaya-glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Erreur</AlertDialogTitle>
            <AlertDialogDescription>
              Impossible de charger les informations du tiers.
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="Beenaya-glass">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>{tierName}</strong> ? Cette action est irréversible.
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