import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Calendar,
  DollarSign,
  User,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Opportunity, OpportunityStatus } from "@/lib/types/opportunity";
import { formatCurrency } from "@/lib/utils";

type SortField = 'name' | 'tierName' | 'estimatedAmount' | 'probability' | 'expectedCloseDate' | 'stage' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface OpportunityListProps {
  opportunities: Opportunity[];
  onEdit: (opportunity: Opportunity) => void;
  onDelete: (opportunity: Opportunity) => void;
  onView: (opportunity: Opportunity) => void;
  onCreateQuote: (opportunity: Opportunity) => void;
  onMarkAsWon: (opportunity: Opportunity) => void;
  onMarkAsLost: (opportunity: Opportunity) => void;
}

export function OpportunityList({
  opportunities,
  onEdit,
  onDelete,
  onView,
  onCreateQuote,
  onMarkAsWon,
  onMarkAsLost,
}: OpportunityListProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Remettre à la première page quand la liste des opportunités change
  useEffect(() => {
    setCurrentPage(1);
  }, [opportunities.length]);

  // Fonction de tri
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    // Revenir à la première page lors du tri
    setCurrentPage(1);
  };

  // Trier les opportunités
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Gestion des cas spéciaux
    if (sortField === 'tierName') {
      aValue = a.tierName || '';
      bValue = b.tierName || '';
    } else if (sortField === 'estimatedAmount') {
      aValue = a.estimatedAmount || 0;
      bValue = b.estimatedAmount || 0;
    } else if (sortField === 'expectedCloseDate') {
      aValue = new Date(a.expectedCloseDate || '').getTime();
      bValue = new Date(b.expectedCloseDate || '').getTime();
    } else if (sortField === 'createdAt') {
      aValue = new Date(a.createdAt).getTime();
      bValue = new Date(b.createdAt).getTime();
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(sortedOpportunities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOpportunities = sortedOpportunities.slice(startIndex, endIndex);

  // Fonctions de navigation de pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevious = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: OpportunityStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            Nouvelle
          </Badge>
        );
      case "needs_analysis":
        return (
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Analyse
          </Badge>
        );
      case "negotiation":
        return (
          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
            Négociation
          </Badge>
        );
      case "won":
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
            Gagnée
          </Badge>
        );
      case "lost":
        return (
          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
            Perdue
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  // Obtenir l'icône de tri
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Formater une date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Calculer le montant pondéré
  const getWeightedAmount = (opportunity: Opportunity) => {
    const amount = opportunity.estimatedAmount || 0;
    const probability = opportunity.probability || 0;
    return (amount * probability) / 100;
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
            <TableHead className="w-[300px]">
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('name')}
              >
                Opportunité
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('tierName')}
              >
                Client
                {getSortIcon('tierName')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('stage')}
              >
                Statut
                {getSortIcon('stage')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('estimatedAmount')}
              >
                Montant
                {getSortIcon('estimatedAmount')}
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('probability')}
              >
                Probabilité
                {getSortIcon('probability')}
              </Button>
            </TableHead>
            <TableHead className="text-right">
              Montant pondéré
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('expectedCloseDate')}
              >
                Date de clôture
                {getSortIcon('expectedCloseDate')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="h-8 p-0 font-semibold hover:bg-transparent"
                onClick={() => handleSort('createdAt')}
              >
                Créée le
                {getSortIcon('createdAt')}
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedOpportunities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-neutral-500">
                {opportunities.length === 0 ? "Aucune opportunité trouvée" : `Aucun résultat sur la page ${currentPage}`}
              </TableCell>
            </TableRow>
          ) : (
            paginatedOpportunities.map((opportunity) => (
              <TableRow 
                key={opportunity.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer"
                onClick={() => onView(opportunity)}
              >
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {opportunity.name}
                    </div>
                    {opportunity.description && (
                      <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-[250px]">
                        {opportunity.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span>{opportunity.tierName || '—'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(opportunity.stage)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {opportunity.estimatedAmount ? formatCurrency(opportunity.estimatedAmount) : '—'}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="text-xs">
                      {opportunity.probability || 0}%
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-benaya-600">
                  {formatCurrency(getWeightedAmount(opportunity))}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    <span>{formatDate(opportunity.expectedCloseDate)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-neutral-500 text-sm">
                  {formatDate(opportunity.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onView(opportunity);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(opportunity);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onCreateQuote(opportunity);
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        Créer un devis
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {opportunity.stage !== 'won' && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsWon(opportunity);
                          }}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marquer comme gagnée
                        </DropdownMenuItem>
                      )}
                      {opportunity.stage !== 'lost' && (
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsLost(opportunity);
                          }}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Marquer comme perdue
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(opportunity);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Contrôles de pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center text-sm text-neutral-500">
            Affichage de {startIndex + 1} à {Math.min(endIndex, sortedOpportunities.length)} sur {sortedOpportunities.length} opportunités
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Afficher la première page, la dernière page et les pages autour de la page courante
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Ajouter des ellipses si nécessaire
                  const shouldShowEllipsis = index > 0 && page > array[index - 1] + 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {shouldShowEllipsis && (
                        <span className="px-2 py-1 text-sm text-neutral-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 