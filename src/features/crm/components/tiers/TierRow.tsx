import { memo, useCallback } from "react";
import { Eye, Edit, Trash2, MoreVertical, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTierUtils } from "./hooks";
import { Tier } from "./types";

interface TierRowProps {
  tier: Tier;
  onView?: (tier: Tier) => void;
  onEdit?: (tier: Tier) => void;
  onDelete?: (tier: Tier) => void;
  onCall?: (tier: Tier) => void;
  onEmail?: (tier: Tier) => void;
}

const TierRow = memo(function TierRow({
  tier,
  onView,
  onEdit,
  onDelete,
  onCall,
  onEmail,
}: TierRowProps) {
  const { getTypeBadge, getStatusBadge } = useTierUtils();

  const handleAction = useCallback((
    e: React.MouseEvent, 
    action: (tier: Tier) => void, 
    tier: Tier
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTimeout(() => {
      action(tier);
    }, 10);
  }, []);

  const handleRowClick = useCallback(() => {
    if (onView) {
      onView(tier);
    }
  }, [onView, tier]);

  const handleCellClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <TableRow 
      className={onView ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : ""}
      onClick={onView ? handleRowClick : undefined}
    >
      <TableCell className="font-medium">{tier.name}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {Array.isArray(tier.type) 
            ? tier.type.map((t) => (
                <div key={t}>{getTypeBadge(t)}</div>
              ))
            : tier.type 
              ? <div>{getTypeBadge(typeof tier.type === 'string' ? tier.type : 'inconnu')}</div>
              : <div>{getTypeBadge('inconnu')}</div>
          }
        </div>
      </TableCell>
      <TableCell>{tier.contact}</TableCell>
      <TableCell>{tier.email}</TableCell>
      <TableCell>{tier.phone}</TableCell>
      <TableCell>{tier.siret}</TableCell>
      <TableCell>{getStatusBadge(tier.status)}</TableCell>
      <TableCell onClick={handleCellClick}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleCellClick}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="benaya-glass">
            {onView && (
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => handleAction(e, onView, tier)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => handleAction(e, onEdit, tier)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
            )}
            {onCall && (
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => handleAction(e, onCall, tier)}
              >
                <Phone className="mr-2 h-4 w-4" />
                Appeler
              </DropdownMenuItem>
            )}
            {onEmail && (
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()}
                onClick={(e) => handleAction(e, onEmail, tier)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer un email
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()}
                  onClick={(e) => handleAction(e, onDelete, tier)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

export { TierRow };