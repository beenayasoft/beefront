import { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Work } from "../types/workLibrary";
import { WorkRow } from "./WorkRow";

interface WorkLibraryListProps {
  works: Work[];
  onView?: (work: Work) => void;
  onEdit?: (work: Work) => void;
  onDelete?: (work: Work) => void;
  onDuplicate?: (work: Work) => void;
  onAddToQuote?: (work: Work) => void;
}

const WorkLibraryList = memo(function WorkLibraryList({
  works,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onAddToQuote,
}: WorkLibraryListProps) {
  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="Beenaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>RÉFÉRENCE</TableHead>
            <TableHead>DÉSIGNATION</TableHead>
            <TableHead>UNITÉ</TableHead>
            <TableHead>COÛT MATÉRIAUX</TableHead>
            <TableHead>COÛT M.O.</TableHead>
            <TableHead>COÛT TOTAL</TableHead>
            <TableHead>PRIX VENTE</TableHead>
            <TableHead>MARGE</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {works.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-neutral-500">
                Aucun ouvrage trouvé
              </TableCell>
            </TableRow>
          ) : (
            works.map((work) => (
              <WorkRow
                key={work.id}
                work={work}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onAddToQuote={onAddToQuote}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});

export { WorkLibraryList };
export default WorkLibraryList; 