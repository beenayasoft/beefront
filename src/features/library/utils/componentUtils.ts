import { Work, Material, Labor } from '../types/workLibrary';
import { ComponentWithType } from '../hooks/useWorkComposition';

export const getComponentName = (
  component: ComponentWithType,
  availableMaterials: Material[],
  availableLabor: Labor[],
  availableWorks: Work[]
): string => {
  if (component.componentType === "material") {
    return availableMaterials.find(m => m.id === component.id)?.name || "Inconnu";
  } else if (component.componentType === "labor") {
    return availableLabor.find(l => l.id === component.id)?.name || "Inconnu";
  } else {
    return availableWorks.find(w => w.id === component.id)?.name || "Inconnu";
  }
};

export const getComponentUnit = (
  component: ComponentWithType,
  availableMaterials: Material[],
  availableLabor: Labor[],
  availableWorks: Work[]
): string => {
  if (component.componentType === "material") {
    return availableMaterials.find(m => m.id === component.id)?.unit || "";
  } else if (component.componentType === "labor") {
    return availableLabor.find(l => l.id === component.id)?.unit || "";
  } else {
    return availableWorks.find(w => w.id === component.id)?.unit || "";
  }
};

export const getComponentPrice = (
  component: ComponentWithType,
  availableMaterials: Material[],
  availableLabor: Labor[],
  availableWorks: Work[]
): number => {
  if (component.componentType === "material") {
    return availableMaterials.find(m => m.id === component.id)?.unitPrice || 0;
  } else if (component.componentType === "labor") {
    return availableLabor.find(l => l.id === component.id)?.unitPrice || 0;
  } else {
    return availableWorks.find(w => w.id === component.id)?.recommendedPrice || 0;
  }
};

export const UNIT_OPTIONS = [
  { value: "forfait", label: "forfait" },
  { value: "unité", label: "unité" },
  { value: "m²", label: "m²" },
  { value: "ml", label: "ml" },
  { value: "m³", label: "m³" },
];