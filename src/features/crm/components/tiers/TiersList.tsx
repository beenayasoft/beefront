import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTierUtils } from "./hooks";
import { Tier } from "../../types"; // ✅ CORRECTION : Utiliser les vrais types CRM
import { PaginationInfo } from "../../api";
import { toast } from "@/hooks/use-toast";

interface TiersListProps {
  tiers: Tier[];
  onView?: (tier: Tier) => void; // Gardé pour le clic sur les lignes
  // Props gardées pour compatibilité mais ignorées
  itemsPerPage?: number;
  disableInternalPagination?: boolean;
  // Props supprimées mais gardées pour éviter les erreurs de compilation
  onEdit?: (tier: Tier) => void;
  onDelete?: (tier: Tier) => void;
  onCall?: (tier: Tier) => void;
  onEmail?: (tier: Tier) => void;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
}

export function TiersList({ 
  tiers,
  onView,
  // Props gardées pour compatibilité
  onEdit, onDelete, onCall, onEmail, itemsPerPage, disableInternalPagination, pagination, onPageChange
}: TiersListProps) {
  const { getTypeBadge, getStatusBadge } = useTierUtils();
  const [currentPage, setCurrentPage] = useState(1);

  // Simplification - utiliser uniquement les tiers fournis
  // Toute la pagination est désormais gérée par le backend
  const currentTiers = tiers;

  // Note: Le paramètre disableInternalPagination n'est plus nécessaire
  // mais conservé pour maintenir la compatibilité de l'API

  // Tout le code lié à la pagination interne a été supprimé


  // Gestionnaire pour le clic sur une ligne
  const handleRowClick = (tier: Tier) => {
    if (onView) {
      onView(tier);
    }
  };

  // La fonction de génération des liens de pagination interne a été supprimée
  // car toute la pagination est maintenant gérée par le backend


  return (
    <div className="space-y-4">
      <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <Table className="Beenaya-table">
          <TableHeader>
            <TableRow>
              <TableHead>NOM</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>CONTACT</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>TÉLÉPHONE</TableHead>
              <TableHead>STATUT</TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {currentTiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                {tiers.length === 0 ? "Aucun résultat trouvé." : "Aucun élément sur cette page."}
              </TableCell>
            </TableRow>
          ) : (
            currentTiers.map((tier) => (
              <TableRow 
                key={tier.id} 
                className={onView ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : ""}
                onClick={onView ? () => handleRowClick(tier) : undefined}
              >
                <TableCell className="font-medium">{tier.nom}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {tier.relation 
                      ? <div>{getTypeBadge(tier.relation)}</div>
                      : <div>{getTypeBadge('inconnu')}</div>
                    }
                  </div>
                </TableCell>
                <TableCell>
                  {tier.contact_principal || '—'}
                </TableCell>
                <TableCell>
                  {tier.contact_principal_email || '—'}
                </TableCell>
                <TableCell>
                  {tier.contact_principal_telephone || '—'}
                </TableCell>
                <TableCell>{getStatusBadge(!tier.is_deleted ? 'active' : 'inactive')}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    {/* Pagination supprimée du composant TiersList - gérée maintenant dans la page principale */}
  </div>
  );
} 