import { useMemo } from "react";
import { Work, Material, Labor } from "../types/workLibrary";

export function useLibraryStats(materials: Material[], labor: Labor[], works: Work[]) {
  return useMemo(() => {
    const totalItems = materials.length + labor.length + works.length;
    
    const totalValue = materials.reduce((sum, item) => sum + item.unitPrice, 0) +
                      labor.reduce((sum, item) => sum + item.unitPrice, 0) +
                      works.reduce((sum, item) => sum + item.recommendedPrice, 0);
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentlyUpdated = [...materials, ...labor, ...works].filter(item => 
      'updatedAt' in item && item.updatedAt && new Date(item.updatedAt) > oneWeekAgo
    ).length;
    
    return { totalItems, totalValue, recentlyUpdated };
  }, [materials.length, labor.length, works.length]);
}