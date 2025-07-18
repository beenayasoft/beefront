import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Minus,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
type ItemCategory = "materials" | "tools" | "equipment" | "consumables";

type StockItem = {
  id: string;
  name: string;
  category: ItemCategory;
  sku: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  status: StockStatus;
  supplier: string;
  lastUpdated: string;
  location: string;
};

const mockStockItems: StockItem[] = [
  {
    id: "1",
    name: "Ciment Portland",
    category: "materials",
    sku: "CIM-001",
    quantity: 85,
    minQuantity: 20,
    unit: "sacs",
    unitPrice: 65,
    totalValue: 5525,
    status: "in_stock",
    supplier: "Lafarge Maroc",
    lastUpdated: "20/01/2025",
    location: "Entrepôt A",
  },
  {
    id: "2",
    name: "Perceuse électrique",
    category: "tools",
    sku: "OUT-002",
    quantity: 8,
    minQuantity: 5,
    unit: "unités",
    unitPrice: 850,
    totalValue: 6800,
    status: "in_stock",
    supplier: "Bosch Maroc",
    lastUpdated: "18/01/2025",
    location: "Atelier",
  },
  {
    id: "3",
    name: "Fer à béton 12mm",
    category: "materials",
    sku: "FER-012",
    quantity: 3,
    minQuantity: 10,
    unit: "tonnes",
    unitPrice: 8500,
    totalValue: 25500,
    status: "low_stock",
    supplier: "Sonasid",
    lastUpdated: "15/01/2025",
    location: "Entrepôt B",
  },
  {
    id: "4",
    name: "Casques de sécurité",
    category: "equipment",
    sku: "SEC-001",
    quantity: 0,
    minQuantity: 15,
    unit: "unités",
    unitPrice: 45,
    totalValue: 0,
    status: "out_of_stock",
    supplier: "3M Maroc",
    lastUpdated: "22/01/2025",
    location: "Bureau",
  },
  {
    id: "5",
    name: "Peinture blanche",
    category: "consumables",
    sku: "PEI-001",
    quantity: 24,
    minQuantity: 10,
    unit: "litres",
    unitPrice: 125,
    totalValue: 3000,
    status: "in_stock",
    supplier: "Peintures du Maroc",
    lastUpdated: "19/01/2025",
    location: "Entrepôt A",
  },
];

const categories = [
  { id: "tous", label: "Tous", count: mockStockItems.length },
  { id: "materials", label: "Matériaux", count: 2 },
  { id: "tools", label: "Outils", count: 1 },
  { id: "equipment", label: "Équipements", count: 1 },
  { id: "consumables", label: "Consommables", count: 1 },
];

export default function Stock() {
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge className="benaya-badge-success gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            En stock
          </Badge>
        );
      case "low_stock":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <AlertTriangle className="w-3 h-3" />
            Stock faible
          </Badge>
        );
      case "out_of_stock":
        return (
          <Badge className="benaya-badge-error gap-1">
            <Minus className="w-3 h-3" />
            Rupture
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  const getCategoryBadge = (category: ItemCategory) => {
    switch (category) {
      case "materials":
        return <Badge className="benaya-badge-primary">Matériaux</Badge>;
      case "tools":
        return <Badge className="benaya-badge-warning">Outils</Badge>;
      case "equipment":
        return <Badge className="benaya-badge-primary">Équipements</Badge>;
      case "consumables":
        return <Badge className="benaya-badge-neutral">Consommables</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">Autre</Badge>;
    }
  };

  const getTotalValue = () => {
    return mockStockItems.reduce((total, item) => total + item.totalValue, 0);
  };

  const getLowStockCount = () => {
    return mockStockItems.filter((item) => item.status === "low_stock").length;
  };

  const getOutOfStockCount = () => {
    return mockStockItems.filter((item) => item.status === "out_of_stock")
      .length;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Stock</h1>
            <p className="text-benaya-100 mt-1">
              Gérez votre inventaire et vos approvisionnements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <BarChart3 className="w-4 h-4" />
              Rapport
            </Button>
            <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
              <Plus className="w-4 h-4" />
              Ajouter article
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {mockStockItems.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Articles total
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {getTotalValue().toLocaleString("fr-FR")} MAD
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Valeur totale
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {getLowStockCount()}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Stock faible
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-red-600">
            {getOutOfStockCount()}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Rupture de stock
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(getLowStockCount() > 0 || getOutOfStockCount() > 0) && (
        <div className="space-y-3">
          {getOutOfStockCount() > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800 dark:text-red-200">
                  Ruptures de stock détectées
                </h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {getOutOfStockCount()} article(s) en rupture de stock
                nécessitent une commande urgente.
              </p>
            </div>
          )}
          {getLowStockCount() > 0 && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  Stock faible
                </h3>
              </div>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                {getLowStockCount()} article(s) ont un stock faible et doivent
                être réapprovisionnés.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="benaya-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="benaya-card">
        {/* Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="gap-2"
                >
                  {category.label}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Table */}
        <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
          <Table className="benaya-table">
            <TableHeader>
              <TableRow>
                <TableHead>STATUT</TableHead>
                <TableHead>ARTICLE</TableHead>
                <TableHead>CATÉGORIE</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>QUANTITÉ</TableHead>
                <TableHead>STOCK MIN</TableHead>
                <TableHead>PRIX UNITAIRE</TableHead>
                <TableHead>VALEUR TOTALE</TableHead>
                <TableHead>FOURNISSEUR</TableHead>
                <TableHead>EMPLACEMENT</TableHead>
                <TableHead className="w-[100px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStockItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        Mis à jour: {item.lastUpdated}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(item.category)}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.sku}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.quantity}</span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        {item.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{item.minQuantity}</span>
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">
                        {item.unit}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.unitPrice.toLocaleString("fr-FR")} MAD
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.totalValue.toLocaleString("fr-FR")} MAD
                  </TableCell>
                  <TableCell>
                    <Badge className="benaya-badge-primary text-xs">
                      {item.supplier}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="benaya-glass">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Entrée stock
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <TrendingDown className="mr-2 h-4 w-4" />
                          Sortie stock
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="mr-2 h-4 w-4" />
                          Commander
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
