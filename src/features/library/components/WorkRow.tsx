import { memo, useCallback } from "react";
import { Eye, Edit, Trash2, Plus, Copy } from "lucide-react";
import { TableCell, TableRow } from "../../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Work } from "../types/workLibrary";
import { formatCurrency } from "../../../lib/utils";

interface WorkRowProps {
  work: Work;
  onView?: (work: Work) => void;
  onEdit?: (work: Work) => void;
  onDelete?: (work: Work) => void;
  onDuplicate?: (work: Work) => void;
  onAddToQuote?: (work: Work) => void;
}

const WorkRow = memo(function WorkRow({
  work,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onAddToQuote,
}: WorkRowProps) {
  const handleView = useCallback(() => {
    onView && onView(work);
  }, [onView, work]);

  const handleEdit = useCallback(() => {
    onEdit && onEdit(work);
  }, [onEdit, work]);

  const handleDelete = useCallback(() => {
    onDelete && onDelete(work);
  }, [onDelete, work]);

  const handleDuplicate = useCallback(() => {
    onDuplicate && onDuplicate(work);
  }, [onDuplicate, work]);

  const handleAddToQuote = useCallback(() => {
    onAddToQuote && onAddToQuote(work);
  }, [onAddToQuote, work]);

  const marginBadgeClass = work.margin < 15 
    ? "benaya-badge-error" 
    : work.margin < 25 
      ? "benaya-badge-warning" 
      : "benaya-badge-success";

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {work.reference || "—"}
      </TableCell>
      <TableCell className="font-medium max-w-[200px] truncate">
        {work.name}
      </TableCell>
      <TableCell>{work.unit}</TableCell>
      <TableCell>{formatCurrency(work.materialCost)} MAD</TableCell>
      <TableCell>{formatCurrency(work.laborCost)} MAD</TableCell>
      <TableCell className="font-medium">
        {formatCurrency(work.totalCost)} MAD
      </TableCell>
      <TableCell className="font-semibold">
        {formatCurrency(work.recommendedPrice)} MAD
      </TableCell>
      <TableCell>
        <Badge className={marginBadgeClass}>
          {work.margin.toFixed(1)}%
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Actions</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="benaya-glass">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="mr-2 h-4 w-4" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToQuote}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter au devis
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

export { WorkRow };