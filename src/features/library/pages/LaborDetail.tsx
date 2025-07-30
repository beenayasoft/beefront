import { useParams } from "react-router-dom";
import { useLaborDetail } from "@/features/library/hooks/useLaborDetail";
import { LaborDetailHeader } from "@/features/library/components/LaborDetailHeader";
import { LaborGeneralInfo } from "@/features/library/components/LaborGeneralInfo";
import { LaborCostEstimate } from "@/features/library/components/LaborCostEstimate";
import { LaborSummary } from "@/features/library/components/LaborSummary";
import { LoadingState, ErrorState, ErrorAlert } from "@/features/library/components/WorkDetailStates";

export default function LaborDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    labor,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    navigate
  } = useLaborDetail(id);

  if (loading) {
    return <LoadingState message="Chargement de la main d'œuvre..." />;
  }

  if (error || !labor) {
    return (
      <ErrorState 
        error={error || "Main d'œuvre introuvable"} 
        onBack={() => navigate("/bibliotheque")} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <LaborDetailHeader
        labor={labor}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() => navigate("/bibliotheque")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LaborGeneralInfo labor={labor} />
        </div>

        <div className="space-y-6">
          <LaborCostEstimate labor={labor} />
          <LaborSummary labor={labor} />
        </div>
      </div>

      {error && <ErrorAlert error={error} />}
    </div>
  );
} 