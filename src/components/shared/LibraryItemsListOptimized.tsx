import { memo, useMemo, useCallback } from "react";
import { Eye, Edit, Package, Hammer, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Work, Material, Labor } from "@/features/library/types/workLibrary";

interface LibraryItemsListOptimizedProps {
  items: (Work | Material | Labor)[];
  onItemClick?: (item: Work | Material | Labor) => void;
  onItemEdit?: (item: Work | Material | Labor) => void;
  isLoading?: boolean;
}

// Composant optimisé pour 2 éléments - Version light
const LibraryItemsListOptimized = memo(function LibraryItemsListOptimized({
  items,
  onItemClick,
  onItemEdit,
  isLoading = false,
}: LibraryItemsListOptimizedProps) {
  
  // Callbacks optimisés
  const handleItemClick = useCallback((item: Work | Material | Labor) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemEdit = useCallback((item: Work | Material | Labor) => {
    onItemEdit?.(item);
  }, [onItemEdit]);

  // Badge type optimisé
  const getItemTypeBadge = useCallback((item: Work | Material | Labor) => {
    if ("components" in item) {
      return <Badge className="Beenaya-badge-success gap-1"><Hammer className="w-3 h-3" />Ouvrage</Badge>;
    }
    if ("vatRate" in item) {
      return <Badge className="Beenaya-badge-primary gap-1"><Package className="w-3 h-3" />Matériau</Badge>;
    }
    return <Badge className="Beenaya-badge-warning gap-1"><Clock className="w-3 h-3" />Main d'œuvre</Badge>;
  }, []);

  // Prix formaté optimisé
  const formatPrice = useCallback((item: Work | Material | Labor) => {
    const price = "recommendedPrice" in item ? item.recommendedPrice : item.unitPrice;
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
    }).format(price);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Beenaya-600 mx-auto"></div>
        <div className="mt-2 text-sm text-neutral-500">Chargement...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        Aucun élément trouvé
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="Beenaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>TYPE</TableHead>
            <TableHead>RÉFÉRENCE</TableHead>
            <TableHead>DÉSIGNATION</TableHead>
            <TableHead>UNITÉ</TableHead>
            <TableHead>PRIX UNITAIRE</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <TableCell>{getItemTypeBadge(item)}</TableCell>
              <TableCell className="font-mono text-xs">
                {"reference" in item ? item.reference || "—" : "—"}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      {item.description.substring(0, 60)}
                      {item.description.length > 60 ? "..." : ""}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell className="font-semibold">{formatPrice(item)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleItemClick(item)}
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleItemEdit(item)}
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

export { LibraryItemsListOptimized };
export default LibraryItemsListOptimized;