import { useParams } from "react-router-dom";
import { useWorkDetail } from "@/features/library/hooks/useWorkDetail";
import { WorkDetailHeader } from "@/features/library/components/WorkDetailHeader";
import { WorkGeneralInfo } from "@/features/library/components/WorkGeneralInfo";
import { WorkFinancialAnalysis } from "@/features/library/components/WorkFinancialAnalysis";
import { WorkSummary } from "@/features/library/components/WorkSummary";
import { WorkProfitability } from "@/features/library/components/WorkProfitability";
import { LoadingState, ErrorState, ErrorAlert } from "@/features/library/components/WorkDetailStates";

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    work,
    loading,
    error,
    showEditDialog,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    navigate
  } = useWorkDetail(id);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !work) {
    return (
      <ErrorState 
        error={error || "Ouvrage introuvable"} 
        onBack={() => navigate("/bibliotheque")} 
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <WorkDetailHeader
        work={work}
        showEditDialog={showEditDialog}
        setShowEditDialog={setShowEditDialog}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() => navigate("/bibliotheque")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorkGeneralInfo work={work} />
        </div>

        <div className="space-y-6">
          <WorkFinancialAnalysis work={work} />
          <WorkSummary work={work} />
          <WorkProfitability work={work} />
        </div>
      </div>

      {error && <ErrorAlert error={error} />}
    </div>
  );
} 