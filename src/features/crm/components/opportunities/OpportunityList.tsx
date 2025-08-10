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
  Building2,
  TrendingUp,
  Clock,
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
import { Opportunity, OpportunityStatus } from "../../types/opportunity";
import { formatCurrency, cn } from "@/lib/utils";

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

  // Obtenir le badge de statut modernisé avec les classes Beenaya
  const getStatusBadge = (status: OpportunityStatus) => {
    switch (status) {
      case "new":
        return <Badge className="Beenaya-badge-info">Nouvelle</Badge>;
      case "needs_analysis":
        return <Badge className="Beenaya-badge-warning">Analyse</Badge>;
      case "negotiation":
        return <Badge className="Beenaya-badge-primary">Négociation</Badge>;
      case "won":
        return <Badge className="Beenaya-badge-success">Gagnée</Badge>;
      case "lost":
        return <Badge className="Beenaya-badge-neutral">Perdue</Badge>;
      default:
        return <Badge className="Beenaya-badge-neutral">{status}</Badge>;
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
    <div className="space-y-4">
      <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
        <Table className="Beenaya-table">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-medium hover:bg-transparent text-left justify-start"
                  onClick={() => handleSort('name')}
                >
                  OPPORTUNITÉ
                  <span className="ml-1">{getSortIcon('name')}</span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-medium hover:bg-transparent text-left justify-start"
                  onClick={() => handleSort('tierName')}
                >
                  CLIENT
                  <span className="ml-1">{getSortIcon('tierName')}</span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-medium hover:bg-transparent text-left justify-start"
                  onClick={() => handleSort('stage')}
                >
                  STATUT
                  <span className="ml-1">{getSortIcon('stage')}</span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-medium hover:bg-transparent text-left justify-start"
                  onClick={() => handleSort('estimatedAmount')}
                >
                  MONTANT
                  <span className="ml-1">{getSortIcon('estimatedAmount')}</span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-medium hover:bg-transparent text-left justify-start"
                  onClick={() => handleSort('probability')}
                >
                  PROBABILITÉ
                  <span className="ml-1">{getSortIcon('probability')}</span>
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 font-medium hover:bg-transparent text-left justify-start"
                  onClick={() => handleSort('expectedCloseDate')}
                >
                  DATE CLÔTURE
                  <span className="ml-1">{getSortIcon('expectedCloseDate')}</span>
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOpportunities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {opportunities.length === 0 ? "Aucune opportunité trouvée." : "Aucun élément sur cette page."}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOpportunities.map((opportunity) => (
                <TableRow 
                  key={opportunity.id}
                  className={cn(
                    "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                    "transition-colors duration-150"
                  )}
                  onClick={() => onView(opportunity)}
                >
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {opportunity.name}
                      </div>
                      {opportunity.description && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-[280px]">
                          {opportunity.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <span className="font-medium">{opportunity.tierName || '—'}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(opportunity.stage)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                        {opportunity.estimatedAmount ? formatCurrency(opportunity.estimatedAmount) : '—'}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <div className="flex flex-col">
                        <span className="font-medium">{opportunity.probability || 0}%</span>
                        <div className="w-16 bg-neutral-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              (opportunity.probability || 0) >= 75 ? "bg-green-500" :
                              (opportunity.probability || 0) >= 50 ? "bg-blue-500" :
                              (opportunity.probability || 0) >= 25 ? "bg-amber-500" :
                              "bg-red-500"
                            )}
                            style={{ width: `${opportunity.probability || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-neutral-400" />
                      <span>{formatDate(opportunity.expectedCloseDate)}</span>
                    </div>
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
      </div>

      {/* Contrôles de pagination modernisés */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium">
              Affichage de {startIndex + 1}-{Math.min(endIndex, sortedOpportunities.length)} sur {sortedOpportunities.length} opportunités
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  const shouldShowEllipsis = index > 0 && page > array[index - 1] + 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {shouldShowEllipsis && (
                        <span className="px-2 py-1 text-sm text-neutral-400">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className={cn(
                          "h-9 w-9 p-0 font-medium",
                          currentPage === page 
                            ? "bg-Beenaya-600 text-white hover:bg-Beenaya-700"
                            : "border-neutral-300 hover:bg-neutral-50"
                        )}
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
              className="h-9 w-9 p-0 border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 