import { Search, Calendar, Filter, Download, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface InvoiceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDateRangeChange?: (from: string, to: string) => void;
  onStatusFilterChange?: (status: string[]) => void;
  onExport?: () => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
}

export function InvoiceFilters({
  searchQuery,
  onSearchChange,
  onDateRangeChange,
  onStatusFilterChange,
  onExport,
  onSortChange,
}: InvoiceFiltersProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-2xl",
        "bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Rechercher une facture par numéro, client, projet..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm",
              "border-white/20 dark:border-slate-700/50",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50",
            )}
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center gap-2">
        {/* Date Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <Calendar className="w-4 h-4" />
              Période
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Période</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDateRangeChange && onDateRangeChange(
              new Date().toISOString().split('T')[0],
              new Date().toISOString().split('T')[0]
            )}>
              Aujourd'hui
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const weekStart = new Date(today);
              weekStart.setDate(today.getDate() - today.getDay());
              onDateRangeChange && onDateRangeChange(
                weekStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Cette semaine
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
              onDateRangeChange && onDateRangeChange(
                monthStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Ce mois
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
              onDateRangeChange && onDateRangeChange(
                quarterStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Ce trimestre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const today = new Date();
              const yearStart = new Date(today.getFullYear(), 0, 1);
              onDateRangeChange && onDateRangeChange(
                yearStart.toISOString().split('T')[0],
                today.toISOString().split('T')[0]
              );
            }}>
              Cette année
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Période personnalisée</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <Filter className="w-4 h-4" />
              Statut
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onStatusFilterChange && onStatusFilterChange(['draft'])}>
              <div className="w-2 h-2 bg-slate-400 rounded-full mr-2"></div>
              Brouillon
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange && onStatusFilterChange(['sent'])}>
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Émise
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange && onStatusFilterChange(['overdue'])}>
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              En retard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange && onStatusFilterChange(['partially_paid'])}>
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Partiellement payée
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange && onStatusFilterChange(['paid'])}>
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Payée
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusFilterChange && onStatusFilterChange(['cancelled', 'cancelled_by_credit_note'])}>
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
              Annulée
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
            >
              <SortAsc className="w-4 h-4" />
              Trier
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Trier par</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('issueDate', 'desc')}>
              Date d'émission
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('dueDate', 'desc')}>
              Date d'échéance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('totalTTC', 'desc')}>
              Montant
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('clientName', 'asc')}>
              Client
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange && onSortChange('status', 'asc')}>
              Statut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/50 dark:bg-slate-800/50 border-white/20 dark:border-slate-700/50"
          onClick={onExport}
        >
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>
    </div>
  );
}