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
  parentId: backendCategory.parent?.toString(),
  position: backendCategory.position || 0,
});

export const transformMaterial = (backendMaterial: BackendMaterial): Material => ({
  id: backendMaterial.id.toString(),
  reference: backendMaterial.reference,
  name: backendMaterial.nom,
  description: backendMaterial.description || '',
  unit: backendMaterial.unite,
  unitPrice: Number(backendMaterial.unitPrice || backendMaterial.prix_achat_ht),
  vatRate: Number(backendMaterial.vatRate || backendMaterial.vat_rate),
  supplier: backendMaterial.supplier,
  category: backendMaterial.categorie_nom || '',
  categoryId: backendMaterial.categorie?.toString(),
  code: backendMaterial.reference || '',
  wasteFactor: Number(backendMaterial.wasteFactor || backendMaterial.waste_factor || 0),
  isRecyclable: backendMaterial.is_recyclable || false,
});

export const transformLabor = (backendLabor: BackendLabor): Labor => ({
  id: backendLabor.id.toString(),
  name: backendLabor.nom,
  description: backendLabor.description || '',
  unit: backendLabor.unite,
  unitPrice: Number(backendLabor.unitPrice || backendLabor.cout_horaire),
  category: backendLabor.categorie_nom || '',
  categoryId: backendLabor.categorie?.toString(),
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
  categoryId: backendWork.categorie.toString(),
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
export const transformMaterialToBackend = (material: Partial<Material>) => ({
  nom: material.name,
  unite: material.unit,
  prix_achat_ht: material.unitPrice?.toString(),
  vat_rate: material.vatRate?.toString() || '20.0',
  description: material.description || '',
  reference: material.reference || '',
  supplier: material.supplier || '',
  categorie: material.categoryId ? Number(material.categoryId) : null,
  type: 'material',
  code: material.code || material.reference || '',
  waste_factor: (material.wasteFactor || 0).toString(),
  is_recyclable: material.isRecyclable || false,
});

export const transformLaborToBackend = (labor: Partial<Labor>) => ({
  nom: labor.name,
  cout_horaire: labor.unitPrice?.toString(),
  unite: labor.unit || 'h',
  description: labor.description || '',
  categorie: labor.categoryId ? Number(labor.categoryId) : null,
  type: 'labor',
  code: labor.code || labor.name || '',
  skill_level: labor.skillLevel || 'skilled',
  productivity_factor: (labor.productivityFactor || 1.0).toString(),
});

export const transformWorkToBackend = (work: Partial<Work>) => ({
  nom: work.name,
  unite: work.unit,
  description: work.description || '',
  categorie: work.categoryId ? Number(work.categoryId) : null,
  code: work.reference || '',
  prix_recommande: work.recommendedPrice?.toString() || '0.0',
  marge: work.margin?.toString() || '20.0',
  complexity: 'medium',
  efficiency: '1.0',
  duration_estimate: null,
  requires_certification: false,
  type: 'work',
  is_custom: work.isCustom || true,
});