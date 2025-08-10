import { Work, Material, Labor, WorkCategory, WorkComponent } from '../types/workLibrary';
import { 
  BackendCategory, 
  BackendMaterial, 
  BackendLabor, 
  BackendIngredient, 
  BackendWork 
} from './types';

// Fonctions de transformation Backend → Frontend
export const transformCategory = (backendCategory: BackendCategory): WorkCategory => ({
  id: backendCategory.id.toString(),
  name: backendCategory.nom,
  description: backendCategory.chemin_complet,
  parentId: backendCategory.parent ? backendCategory.parent.toString() : null,
  position: backendCategory.position || 0,
});

export const transformMaterial = (backendMaterial: BackendMaterial): Material => {
  return {
    id: backendMaterial.id.toString(),
    reference: backendMaterial.reference,
    name: backendMaterial.nom,
    description: backendMaterial.description || '',
    unit: backendMaterial.unite,
    unitPrice: Number(backendMaterial.unitPrice || backendMaterial.prix_achat_ht),
    vatRate: Number(backendMaterial.vatRate || backendMaterial.vat_rate),
    category: backendMaterial.categorie_nom || '',
    categoryId: backendMaterial.categorie ? backendMaterial.categorie.toString() : null,
    code: backendMaterial.code || backendMaterial.reference || '',
    wasteFactor: Number(backendMaterial.wasteFactor || backendMaterial.waste_factor || 0),
    isRecyclable: backendMaterial.is_recyclable || false,
    
    // Intégration CRM pour fournisseurs - utilisation cohérente des types
    supplier_id: backendMaterial.supplier_id || null,
    supplier_details: backendMaterial.supplier_details || null,
    effective_supplier_name: backendMaterial.effective_supplier_name || null,
  };
};

export const transformLabor = (backendLabor: BackendLabor): Labor => ({
  id: backendLabor.id.toString(),
  name: backendLabor.nom,
  description: backendLabor.description || '',
  unit: backendLabor.unite,
  unitPrice: Number(backendLabor.unitPrice || backendLabor.cout_horaire),
  category: backendLabor.categorie_nom || '',
  categoryId: backendLabor.categorie ? backendLabor.categorie.toString() : null,
  code: backendLabor.nom || '',
  skillLevel: backendLabor.skill_level || 'skilled',
  productivityFactor: Number(backendLabor.productivity_factor || 1.0),
});

// Transformation d'un ingrédient backend en composant frontend
export const transformIngredient = (ingredient: BackendIngredient): WorkComponent => {
  const element = ingredient.element || {};
  const isLabor = element.cout_horaire !== undefined;
  
  return {
    id: ingredient.id.toString(),
    type: isLabor ? 'labor' : 'material',
    referenceId: ingredient.element_id.toString(),
    name: element.nom || 'Non renseigné',
    unit: element.unite || (isLabor ? 'h' : 'unité'),
    quantity: Number(ingredient.quantite),
    unitPrice: Number(element.prix_achat_ht || element.cout_horaire || 0),
    totalPrice: ingredient.cout_total || 0,
    wasteAllowance: Number(ingredient.waste_allowance || 0),
    notes: ingredient.notes || undefined,
  };
};

export const transformWork = (backendWork: BackendWork): Work => ({
  id: backendWork.id.toString(),
  reference: backendWork.code || backendWork.nom,
  name: backendWork.nom,
  description: backendWork.description || '',
  categoryId: backendWork.categorie ? backendWork.categorie.toString() : null,
  unit: backendWork.unite,
  code: backendWork.code || '',
  components: (backendWork.ingredients || []).map(transformIngredient),
  laborCost: backendWork.laborCost || 0,
  materialCost: backendWork.materialCost || 0,
  totalCost: backendWork.debourse_sec || 0,
  recommendedPrice: backendWork.recommendedPrice || Number(backendWork.prix_recommande),
  margin: Number(backendWork.marge),
  complexity: backendWork.complexity || 'medium',
  efficiency: Number(backendWork.efficiency || 1.0),
  durationEstimate: backendWork.duration_estimate ? Number(backendWork.duration_estimate) : undefined,
  requiresCertification: backendWork.requires_certification || false,
  createdAt: backendWork.created_at,
  updatedAt: backendWork.updated_at,
  isCustom: backendWork.is_custom || false,
});

// Fonctions de transformation Frontend → Backend
export const transformMaterialToBackend = (material: Partial<Material>) => {
  // Validation des champs requis pour éviter les erreurs 400
  if (!material.name || !material.unit || (!material.unitPrice && material.unitPrice !== 0)) {
    throw new Error('Les champs name, unit et unitPrice sont requis');
  }

  return {
    nom: material.name,
    unite: material.unit,
    prix_achat_ht: material.unitPrice?.toString() || '0',
    vat_rate: material.vatRate?.toString() || '20.0',
    description: material.description || null,
    reference: Array.isArray(material.reference) 
      ? material.reference[0] || null 
      : material.reference || null,
    supplier_id: material.supplier_id || null, // CRM integration field
    categorie: material.categoryId ? Number(material.categoryId) : null,
    type: 'material',
    code: Array.isArray(material.code) 
      ? material.code[0] || null 
      : material.code || null,  // Ne pas dériver automatiquement de reference
    waste_factor: (material.wasteFactor || 0).toString(),
    is_recyclable: material.isRecyclable || false,
  };
};

export const transformLaborToBackend = (labor: Partial<Labor>) => {
  // Validation des champs requis pour éviter les erreurs 400
  if (!labor.name || (!labor.unitPrice && labor.unitPrice !== 0)) {
    throw new Error('Les champs name et unitPrice sont requis');
  }

  return {
    nom: labor.name,
    cout_horaire: labor.unitPrice?.toString() || '0',
    unite: labor.unit || 'h',
    description: labor.description || null,
    categorie: labor.categoryId ? Number(labor.categoryId) : null,
    type: 'labor',
    code: labor.code || null,
    skill_level: labor.skillLevel || 'skilled',
    productivity_factor: (labor.productivityFactor || 1.0).toString(),
  };
};

export const transformWorkToBackend = (work: Partial<Work>) => {
  // Validation des champs requis pour éviter les erreurs 400
  if (!work.name || !work.unit) {
    throw new Error('Les champs name et unit sont requis');
  }

  return {
    nom: work.name,
    unite: work.unit,
    description: work.description || null,
    categorie: work.categoryId ? Number(work.categoryId) : null,
    code: work.reference || null,
    prix_recommande: work.recommendedPrice?.toString() || '0',
    marge: work.margin?.toString() || '20.0',
    complexity: work.complexity || 'medium',
    efficiency: work.efficiency?.toString() || '1.0',
    duration_estimate: work.durationEstimate?.toString() || null,
    requires_certification: work.requiresCertification || false,
    type: 'work',
    is_custom: work.isCustom || true,
  };
};