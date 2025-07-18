import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  Wrench,
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

type InterventionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
type InterventionType = "maintenance" | "repair" | "inspection" | "emergency";

type Intervention = {
  id: string;
  title: string;
  type: InterventionType;
  client: string;
  location: string;
  technician: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  status: InterventionStatus;
  priority: "low" | "medium" | "high";
  description: string;
  cost?: string;
};

const mockInterventions: Intervention[] = [
  {
    id: "1",
    title: "Réparation plomberie",
    type: "repair",
    client: "M. Dupont",
    location: "123 Rue de la Paix, Casablanca",
    technician: "Ahmed Ben Ali",
    scheduledDate: "20/01/2025",
    scheduledTime: "09:00",
    duration: "2h",
    status: "scheduled",
    priority: "high",
    description: "Fuite d'eau dans la salle de bain",
    cost: "850 MAD",
  },
  {
    id: "2",
    title: "Maintenance électrique",
    type: "maintenance",
    client: "Mme Lambert",
    location: "45 Avenue Hassan II, Rabat",
    technician: "Youssef Alami",
    scheduledDate: "18/01/2025",
    scheduledTime: "14:00",
    duration: "3h",
    status: "in_progress",
    priority: "medium",
    description: "Vérification tableau électrique",
    cost: "650 MAD",
  },
  {
    id: "3",
    title: "Inspection sécurité",
    type: "inspection",
    client: "STE ABC",
    location: "Zone industrielle, Tanger",
    technician: "Omar Benjelloun",
    scheduledDate: "15/01/2025",
    scheduledTime: "10:30",
    duration: "4h",
    status: "completed",
    priority: "medium",
    description: "Contrôle annuel des installations",
    cost: "1,200 MAD",
  },
  {
    id: "4",
    title: "Urgence chauffage",
    type: "emergency",
    client: "M. Martin",
    location: "78 Boulevard Zerktouni, Marrakech",
    technician: "Hassan El Fassi",
    scheduledDate: "22/01/2025",
    scheduledTime: "16:00",
    duration: "1h30",
    status: "scheduled",
    priority: "high",
    description: "Panne de chauffage en urgence",
    cost: "950 MAD",
  },
];

const tabs = [
  { id: "tous", label: "Toutes", count: mockInterventions.length },
  { id: "programmees", label: "Programmées", count: 2 },
  { id: "en_cours", label: "En cours", count: 1 },
  { id: "terminees", label: "Terminées", count: 1 },
];

export default function Interventions() {
  const [activeTab, setActiveTab] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge className="benaya-badge-primary gap-1">
            <Clock className="w-3 h-3" />
            Programmée
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <Wrench className="w-3 h-3" />
            En cours
          </Badge>
        );
      case "completed":
        return (
          <Badge className="benaya-badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Terminée
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Annulée
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  const getTypeBadge = (type: InterventionType) => {
    switch (type) {
      case "maintenance":
        return <Badge className="benaya-badge-primary">Maintenance</Badge>;
      case "repair":
        return <Badge className="benaya-badge-warning">Réparation</Badge>;
      case "inspection":
        return <Badge className="benaya-badge-primary">Inspection</Badge>;
      case "emergency":
        return <Badge className="benaya-badge-error">Urgence</Badge>;
      default:
        return <Badge className="benaya-badge-neutral">Autre</Badge>;
    }
  };

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400";
      case "medium":
        return "text-orange-600 dark:text-orange-400";
      case "low":
        return "text-green-600 dark:text-green-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interventions</h1>
            <p className="text-benaya-100 mt-1">
              Planifiez et suivez vos interventions techniques
            </p>
          </div>
          <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Nouvelle intervention
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {mockInterventions.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total interventions
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {mockInterventions.filter((i) => i.status === "scheduled").length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Programmées
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {mockInterventions.filter((i) => i.status === "in_progress").length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            En cours
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {mockInterventions.filter((i) => i.status === "completed").length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Terminées
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="benaya-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Rechercher une intervention..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 benaya-input"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Période
            </Button>
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
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {tab.count}
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
                <TableHead>INTERVENTION</TableHead>
                <TableHead>TYPE</TableHead>
                <TableHead>CLIENT</TableHead>
                <TableHead>TECHNICIEN</TableHead>
                <TableHead>DATE/HEURE</TableHead>
                <TableHead>DURÉE</TableHead>
                <TableHead>PRIORITÉ</TableHead>
                <TableHead>COÛT</TableHead>
                <TableHead className="w-[100px]">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInterventions.map((intervention) => (
                <TableRow key={intervention.id}>
                  <TableCell>{getStatusBadge(intervention.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{intervention.title}</div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {intervention.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(intervention.type)}</TableCell>
                  <TableCell>
                    <Badge className="benaya-badge-primary text-xs">
                      {intervention.client}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      {intervention.technician}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {intervention.scheduledDate}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {intervention.scheduledTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{intervention.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <AlertTriangle
                        className={cn(
                          "w-4 h-4",
                          getPriorityColor(intervention.priority),
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium capitalize",
                          getPriorityColor(intervention.priority),
                        )}
                      >
                        {intervention.priority === "high" && "Élevée"}
                        {intervention.priority === "medium" && "Moyenne"}
                        {intervention.priority === "low" && "Faible"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {intervention.cost}
                  </TableCell>
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
                        {intervention.status === "scheduled" && (
                          <DropdownMenuItem>
                            <Wrench className="mr-2 h-4 w-4" />
                            Démarrer
                          </DropdownMenuItem>
                        )}
                        {intervention.status === "in_progress" && (
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Terminer
                          </DropdownMenuItem>
                        )}
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
