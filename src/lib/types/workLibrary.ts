// Types pour la bibliothèque d'ouvrages

// Catégorie d'ouvrage
export interface WorkCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // Pour les sous-catégories
  position: number;
}

// Type de matériau
export interface Material {
  id: string;
  reference?: string;
  name: string;
  description?: string;
  unit: string;
  unitPrice: number;
  supplier?: string;
  vatRate: number; // Taux de TVA en pourcentage
  category?: string;
}

// Type de main d'œuvre
export interface Labor {
  id: string;
  name: string;
  description?: string;
  unit: string; // Généralement en heures
  unitPrice: number;
  category?: string;
}

// Composant d'un ouvrage (matériau ou main d'œuvre)
export interface WorkComponent {
  id: string;
  type: 'material' | 'labor';
  referenceId: string; // ID du matériau ou de la main d'œuvre
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// Ouvrage complet
export interface Work {
  id: string;
  reference?: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  // Composants
  components: WorkComponent[];
  // Prix calculés
  laborCost: number;
  materialCost: number;
  totalCost: number;
  recommendedPrice: number;
  margin: number; // Marge en pourcentage
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  isCustom: boolean; // Si l'ouvrage est personnalisé ou standard
}

// Interface pour les filtres de recherche d'ouvrages
export interface WorkFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'reference' | 'totalCost' | 'recommendedPrice';
  sortOrder?: 'asc' | 'desc';
}

// Union type pour tous les éléments de bibliothèque
export type LibraryItem = Work | Material | Labor;

// Fonction utilitaire pour détecter le type d'un élément de bibliothèque
export function getLibraryItemType(item: LibraryItem): 'work' | 'material' | 'labor' {
  // Détecter un ouvrage (a des composants)
  if ('components' in item) return 'work';
  
  // Détecter un matériau (a vatRate OU supplier)
  if (('vatRate' in item) || ('supplier' in item)) return 'material';
  
  // Par défaut, c'est de la main d'œuvre
  return 'labor';
}

// Fonction utilitaire pour obtenir le nom du type en français
export function getLibraryItemTypeLabel(item: LibraryItem): string {
  const type = getLibraryItemType(item);
  switch (type) {
    case 'work': return 'Ouvrage';
    case 'material': return 'Matériau';
    case 'labor': return 'Main d\'œuvre';
    default: return 'Inconnu';
  }
}

// Fonction utilitaire pour filtrer les éléments par type
export function filterLibraryItemsByType(
  items: LibraryItem[], 
  type: 'all' | 'work' | 'material' | 'labor'
): LibraryItem[] {
  if (type === 'all') return items;
  return items.filter(item => getLibraryItemType(item) === type);
} 