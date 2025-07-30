import { Work, Material, Labor } from "../types/workLibrary";

interface WorkLibraryStatsProps {
  materials: Material[];
  labor: Labor[];
  works: Work[];
  filteredItemsCount: number;
}

export function WorkLibraryStats({
  materials,
  labor,
  works,
  filteredItemsCount,
}: WorkLibraryStatsProps) {
  
  const getTotalItems = () => {
    return materials.length + labor.length + works.length;
  };

  const getTotalValue = () => {
    const materialsValue = materials.reduce((sum, item) => sum + item.unitPrice, 0);
    const laborValue = labor.reduce((sum, item) => sum + item.unitPrice, 0);
    const worksValue = works.reduce((sum, item) => sum + item.recommendedPrice, 0);
    return materialsValue + laborValue + worksValue;
  };

  const getRecentlyUpdated = () => {
    // Calcul réel basé sur les dates de mise à jour des éléments
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let recentCount = 0;
    
    // Compter les matériaux récemment mis à jour
    materials.forEach(item => {
      if ('updatedAt' in item && item.updatedAt && new Date(item.updatedAt) > oneWeekAgo) {
        recentCount++;
      }
    });
    
    // Compter la main d'œuvre récemment mise à jour
    labor.forEach(item => {
      if ('updatedAt' in item && item.updatedAt && new Date(item.updatedAt) > oneWeekAgo) {
        recentCount++;
      }
    });
    
    // Compter les ouvrages récemment mis à jour
    works.forEach(item => {
      if ('updatedAt' in item && item.updatedAt && new Date(item.updatedAt) > oneWeekAgo) {
        recentCount++;
      }
    });
    
    return recentCount;
  };

  const totalItems = getTotalItems();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
          {filteredItemsCount}
          {filteredItemsCount !== totalItems && (
            <span className="text-sm text-neutral-500 ml-1">
              / {totalItems}
            </span>
          )}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {filteredItemsCount !== totalItems ? "Éléments filtrés" : "Éléments total"}
        </div>
      </div>
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-green-600">
          {getTotalValue().toLocaleString("fr-FR")} MAD
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Valeur catalogue
        </div>
      </div>
      <div className="benaya-card text-center">
        <div className="text-2xl font-bold text-amber-600">
          {getRecentlyUpdated()}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Mis à jour récemment
        </div>
      </div>
    </div>
  );
}