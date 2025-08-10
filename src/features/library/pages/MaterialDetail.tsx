import { useParams } from "react-router-dom";
import { useMaterialDetail } from "@/features/library/hooks/useMaterialDetail";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MaterialDetailHeader } from "@/features/library/components/MaterialDetailHeader";
import { MaterialGeneralInfo } from "@/features/library/components/MaterialGeneralInfo";
import { SupplierDisplay } from "@/features/library/components/SupplierDisplay";
import { MaterialSummary } from "@/features/library/components/MaterialSummary";
import { LoadingState, ErrorState, ErrorAlert } from "@/features/library/components/WorkDetailStates";
import { DeleteConfirmDialog } from "@/features/library/components/DeleteConfirmDialog";

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    material,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    isDeleting,
    handleEdit,
    handleDelete,
    confirmDelete,
    navigate
  } = useMaterialDetail(id);

  // 🏷️ Titre dynamique basé sur le nom du matériau
  const pageTitle = material ? `${material.name}` : 'Détail matériau';
  usePageTitle(pageTitle);

  if (loading) {
    return <LoadingState message="Chargement du matériau..." />;
  }

  if (error || !material) {
    return (
      <ErrorState 
        error={error || "Matériau introuvable"} 
        onBack={() => navigate("/bibliotheque")} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <MaterialDetailHeader
        material={material}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() => navigate("/bibliotheque")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MaterialGeneralInfo material={material} />
        </div>

        <div className="space-y-6">
          <SupplierDisplay 
            material={material as any} 
            showDetails={true}
            showContactInfo={true}
            showActions={true}
            onViewInCRM={(supplierId) => {
              // Navigation vers la fiche détails du tiers fournisseur dans le CRM
              navigate(`/tiers/${supplierId}`);
            }}
          />
          <MaterialSummary material={material} />
        </div>
      </div>

      {error && <ErrorAlert error={error} />}

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
        item={material ? { name: material.name } : null}
        loading={isDeleting}
        itemType="ce matériau"
      />
    </div>
  );
} 