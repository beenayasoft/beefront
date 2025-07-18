import React, { useState } from "react";
import { ModalTypeSelector } from "./ModalTypeSelector";
import { TierCreationDialog } from "./TierCreationDialog";
import { EntityType } from "./types";

interface TierCreateFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (createdTierId?: string) => void;
}

export function TierCreateFlow({ open, onOpenChange, onSuccess }: TierCreateFlowProps) {
  const [selectedType, setSelectedType] = useState<EntityType | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const [showCreationDialog, setShowCreationDialog] = useState(false);

  // Réinitialiser l'état quand le dialogue principal se ferme
  React.useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setShowTypeSelector(true);
      setShowCreationDialog(false);
    }
  }, [open]);

  const handleTypeSelect = (type: EntityType) => {
    console.log("Type selected:", type);
    setSelectedType(type);
    setShowTypeSelector(false);
    setShowCreationDialog(true);
  };

  const handleCreationDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      console.log("Creation dialog closed, returning to type selector");
      setShowCreationDialog(false);
      setShowTypeSelector(true);
      setSelectedType(null);
    }
  };

  const handleSuccess = (createdTierId?: string) => {
    console.log("Creation successful", { createdTierId });
    // Fermer tout le workflow
    onOpenChange(false);
    // Notifier le succès avec l'ID du tier créé
    onSuccess?.(createdTierId);
  };

  const handleMainDialogClose = (isOpen: boolean) => {
    if (!isOpen && !showCreationDialog) {
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* Sélecteur de type - Étape 1 */}
      <ModalTypeSelector
        open={open && showTypeSelector}
        onOpenChange={handleMainDialogClose}
        onSelect={handleTypeSelect}
      />

      {/* Dialogue de création unifié - Étape 2 */}
      {selectedType && (
        <TierCreationDialog
          open={showCreationDialog}
          onOpenChange={handleCreationDialogClose}
          onSuccess={handleSuccess}
          entityType={selectedType}
        />
      )}
    </>
  );
} 