import { useState, useEffect, useMemo, useCallback } from 'react';
import { Work, Material, Labor } from '../types/workLibrary';

export type ComponentType = "material" | "labor" | "work";

export type ComponentWithType = {
  id: string;
  quantity: number;
  componentType: ComponentType;
};

export type NewComponentState = {
  componentType: ComponentType;
  id: string;
  quantity: number;
};

interface UseWorkCompositionProps {
  work?: Work;
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
}

export function useWorkComposition({
  work,
  availableMaterials,
  availableLabor,
  availableWorks,
}: UseWorkCompositionProps) {
  // États du formulaire
  const [formData, setFormData] = useState<Partial<Work>>(
    work || {
      id: "",
      name: "",
      description: "",
      unit: "forfait",
      components: [],
      margin: 20,
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [components, setComponents] = useState<ComponentWithType[]>([]);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [newComponent, setNewComponent] = useState<NewComponentState>({
    componentType: "material",
    id: "",
    quantity: 1,
  });

  // Initialiser les composants au montage
  useEffect(() => {
    if (work?.components) {
      const componentsWithType = work.components.map((comp) => {
        let componentType: ComponentType = "material";
        if (availableMaterials.find((m) => m.id === comp.id)) {
          componentType = "material";
        } else if (availableLabor.find((l) => l.id === comp.id)) {
          componentType = "labor";
        } else if (availableWorks.find((w) => w.id === comp.id)) {
          componentType = "work";
        }
        return { ...comp, componentType };
      });
      setComponents(componentsWithType);
    } else {
      setComponents([]);
    }
  }, [work, availableMaterials, availableLabor, availableWorks]);

  // Gestionnaires de formulaire
  const handleFormChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    if (name === "margin") {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleUnitChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, unit: value }));
  }, []);

  // Gestionnaires de composants
  const handleComponentTypeChange = useCallback((value: ComponentType) => {
    setNewComponent(prev => ({
      ...prev,
      componentType: value,
      id: "",
    }));
  }, []);

  const handleComponentIdChange = useCallback((value: string) => {
    setNewComponent(prev => ({ ...prev, id: value }));
  }, []);

  const handleComponentQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(e.target.value) || 0;
    setNewComponent(prev => ({
      ...prev,
      quantity: quantity > 0 ? quantity : 0,
    }));
  }, []);

  const addComponent = useCallback(() => {
    if (!newComponent.id || newComponent.quantity <= 0) return;

    const existingIndex = components.findIndex(comp => comp.id === newComponent.id);

    if (existingIndex >= 0) {
      const updatedComponents = [...components];
      updatedComponents[existingIndex].quantity += newComponent.quantity;
      setComponents(updatedComponents);
    } else {
      setComponents(prev => [...prev, { ...newComponent }]);
    }

    setNewComponent({
      componentType: "material",
      id: "",
      quantity: 1,
    });
    setShowAddComponent(false);
  }, [newComponent, components]);

  const removeComponent = useCallback((index: number) => {
    setComponents(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Calculs des coûts (optimisé)
  const calculations = useMemo(() => {
    let materialCost = 0;
    let laborCost = 0;
    let subWorksCost = 0;

    components.forEach((comp) => {
      if (comp.componentType === "material") {
        const material = availableMaterials.find(m => m.id === comp.id);
        if (material) materialCost += material.unitPrice * comp.quantity;
      } else if (comp.componentType === "labor") {
        const labor = availableLabor.find(l => l.id === comp.id);
        if (labor) laborCost += labor.unitPrice * comp.quantity;
      } else if (comp.componentType === "work") {
        const subWork = availableWorks.find(w => w.id === comp.id);
        if (subWork) subWorksCost += subWork.recommendedPrice * comp.quantity;
      }
    });

    const totalCost = materialCost + laborCost + subWorksCost;
    const margin = formData.margin || 20;
    const marginAmount = (totalCost * margin) / 100;
    const recommendedPrice = totalCost + marginAmount;

    return {
      materialCost,
      laborCost,
      subWorksCost,
      totalCost,
      margin,
      marginAmount,
      recommendedPrice,
    };
  }, [components, formData.margin, availableMaterials, availableLabor, availableWorks]);

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Le nom est obligatoire";
    if (!formData.unit) newErrors.unit = "L'unité est obligatoire";
    if (components.length === 0) newErrors.components = "L'ouvrage doit contenir au moins un composant";
    if (formData.margin === undefined || formData.margin < 0) {
      newErrors.margin = "La marge doit être un pourcentage positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, components]);

  // Soumission
  const handleSubmit = useCallback((onSave: (work: Work) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validate()) {
        const workData: Work = {
          ...formData,
          id: formData.id || "",
          components: components.map(({ componentType, ...rest }) => rest),
          recommendedPrice: calculations.recommendedPrice,
        } as Work;
        
        onSave(workData);
      }
    };
  }, [formData, components, calculations, validate]);

  return {
    // État
    formData,
    errors,
    components,
    showAddComponent,
    newComponent,
    calculations,
    
    // Actions
    setShowAddComponent,
    handleFormChange,
    handleUnitChange,
    handleComponentTypeChange,
    handleComponentIdChange,
    handleComponentQuantityChange,
    addComponent,
    removeComponent,
    handleSubmit,
  };
}