import { useParams } from "react-router-dom";
import { useMaterialDetail } from "@/features/library/hooks/useMaterialDetail";
import { MaterialDetailHeader } from "@/features/library/components/MaterialDetailHeader";
import { MaterialGeneralInfo } from "@/features/library/components/MaterialGeneralInfo";
import { MaterialSupplier } from "@/features/library/components/MaterialSupplier";
import { MaterialSummary } from "@/features/library/components/MaterialSummary";
import { LoadingState, ErrorState, ErrorAlert } from "@/features/library/components/WorkDetailStates";

export default function MaterialDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    material,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    navigate
  } = useMaterialDetail(id);

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
          <MaterialSupplier material={material} />
          <MaterialSummary material={material} />
        </div>
      </div>

      {error && <ErrorAlert error={error} />}
    </div>
  );
} 