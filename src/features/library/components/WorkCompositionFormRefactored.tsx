import { memo } from "react";
import { Plus, X, AlertCircle, Loader2, Hammer } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Work, Material, Labor } from "../types/workLibrary";
import { useWorkComposition } from "../hooks/useWorkComposition";
import { WorkGeneralInfoForm } from "./work-composition/WorkGeneralInfoForm";
import { ComponentAddForm } from "./work-composition/ComponentAddForm";
import { ComponentsList } from "./work-composition/ComponentsList";
import { CostSummary } from "./work-composition/CostSummary";

interface WorkCompositionFormProps {
  work?: Work;
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
  onSave: (work: Work) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const WorkCompositionFormRefactored = memo(function WorkCompositionFormRefactored({
  work,
  availableMaterials,
  availableLabor,
  availableWorks,
  onSave,
  onCancel,
  isLoading = false,
}: WorkCompositionFormProps) {
  const isEditing = !!work;
  
  const {
    formData,
    errors,
    components,
    showAddComponent,
    newComponent,
    calculations,
    setShowAddComponent,
    handleFormChange,
    handleUnitChange,
    handleComponentTypeChange,
    handleComponentIdChange,
    handleComponentQuantityChange,
    addComponent,
    removeComponent,
    handleSubmit,
  } = useWorkComposition({
    work,
    availableMaterials,
    availableLabor,
    availableWorks,
  });

  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Hammer className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Modifier l'ouvrage" : "Créer un ouvrage"}
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 mt-1">
              {isEditing 
                ? "Modifiez les informations et la composition de cet ouvrage"
                : "Définissez un nouvel ouvrage composé et sa composition"
              }
            </DialogDescription>
          </div>
          <Badge className="benaya-badge-success gap-1">
            <Hammer className="w-3 h-3" />
            Ouvrage
          </Badge>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSave)} className="space-y-6">
        <div className="space-y-6">
          {/* Informations générales */}
          <WorkGeneralInfoForm
            formData={formData}
            errors={errors}
            onFormChange={handleFormChange}
            onUnitChange={handleUnitChange}
          />

          {/* Composition */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2 flex-1">
                Composition de l'ouvrage
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddComponent(!showAddComponent)}
                className="gap-2 ml-4"
              >
                {showAddComponent ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAddComponent ? "Annuler" : "Ajouter"}
              </Button>
            </div>

            {errors.components && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.components}
              </div>
            )}

            {showAddComponent && (
              <ComponentAddForm
                newComponent={newComponent}
                availableMaterials={availableMaterials}
                availableLabor={availableLabor}
                availableWorks={availableWorks}
                formDataId={formData.id}
                onComponentTypeChange={handleComponentTypeChange}
                onComponentIdChange={handleComponentIdChange}
                onComponentQuantityChange={handleComponentQuantityChange}
                onAddComponent={addComponent}
              />
            )}

            <ComponentsList
              components={components}
              availableMaterials={availableMaterials}
              availableLabor={availableLabor}
              availableWorks={availableWorks}
              onRemoveComponent={removeComponent}
            />
          </div>

          {/* Résumé des coûts */}
          {components.length > 0 && <CostSummary calculations={calculations} />}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading || components.length === 0}
            className="w-full sm:w-auto benaya-button"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Mettre à jour" : "Créer l'ouvrage"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
});

export default WorkCompositionFormRefactored;