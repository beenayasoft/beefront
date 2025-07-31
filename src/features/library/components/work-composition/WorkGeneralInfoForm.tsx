import { memo } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Work } from "../../types/workLibrary";
import { UNIT_OPTIONS } from "../../utils/componentUtils";

interface WorkGeneralInfoFormProps {
  formData: Partial<Work>;
  errors: Record<string, string>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onUnitChange: (value: string) => void;
}

export const WorkGeneralInfoForm = memo(function WorkGeneralInfoForm({
  formData,
  errors,
  onFormChange,
  onUnitChange,
}: WorkGeneralInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        Informations générales
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label 
            htmlFor="name" 
            className={`text-sm font-medium ${errors.name ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}
          >
            Nom de l'ouvrage <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={onFormChange}
            placeholder="Nom de l'ouvrage"
            className={`benaya-input ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
          />
          {errors.name && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              {errors.name}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Référence
          </Label>
          <Input
            id="reference"
            name="reference"
            value={formData.reference || ""}
            onChange={onFormChange}
            placeholder="Référence de l'ouvrage"
            className="benaya-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={onFormChange}
          placeholder="Description détaillée de l'ouvrage"
          rows={3}
          className="benaya-input resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label 
            htmlFor="unit" 
            className={`text-sm font-medium ${errors.unit ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}
          >
            Unité <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.unit || ""} onValueChange={onUnitChange}>
            <SelectTrigger className={`benaya-input ${errors.unit ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Sélectionner une unité" />
            </SelectTrigger>
            <SelectContent>
              {UNIT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unit && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              {errors.unit}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label 
            htmlFor="margin" 
            className={`text-sm font-medium ${errors.margin ? "text-red-600" : "text-neutral-700 dark:text-neutral-300"}`}
          >
            Marge <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="margin"
              name="margin"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.margin || ""}
              onChange={onFormChange}
              placeholder="20"
              className={`benaya-input pr-8 ${errors.margin ? "border-red-500 focus:border-red-500" : ""}`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-neutral-500 text-sm">
              %
            </div>
          </div>
          {errors.margin && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3 h-3" />
              {errors.margin}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});