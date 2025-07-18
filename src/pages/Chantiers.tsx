import { useState } from "react";
import {
  Plus,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type ProjectStatus = "planning" | "in_progress" | "on_hold" | "completed";

type Project = {
  id: string;
  title: string;
  client: string;
  location: string;
  budget: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: ProjectStatus;
  description: string;
  priority: "low" | "medium" | "high";
};

const initialProjects: Project[] = [
  {
    id: "1",
    title: "Villa Moderne",
    client: "M. Dupont",
    location: "Casablanca",
    budget: "450,000 MAD",
    startDate: "15/01/2025",
    endDate: "30/06/2025",
    progress: 25,
    status: "planning",
    description: "Construction d'une villa moderne de 200m²",
    priority: "high",
  },
  {
    id: "2",
    title: "Rénovation Appartement",
    client: "Mme Lambert",
    location: "Rabat",
    budget: "120,000 MAD",
    startDate: "01/02/2025",
    endDate: "30/04/2025",
    progress: 60,
    status: "in_progress",
    description: "Rénovation complète d'un appartement 3 pièces",
    priority: "medium",
  },
  {
    id: "3",
    title: "Extension Maison",
    client: "M. Martin",
    location: "Marrakech",
    budget: "200,000 MAD",
    startDate: "10/03/2025",
    endDate: "15/08/2025",
    progress: 40,
    status: "on_hold",
    description: "Extension de 50m² avec terrasse",
    priority: "low",
  },
  {
    id: "4",
    title: "Bureaux Entreprise",
    client: "STE ABC",
    location: "Tanger",
    budget: "800,000 MAD",
    startDate: "01/11/2024",
    endDate: "15/01/2025",
    progress: 100,
    status: "completed",
    description: "Aménagement de bureaux sur 3 étages",
    priority: "high",
  },
  {
    id: "5",
    title: "Maison Individuelle",
    client: "M. Alami",
    location: "Fès",
    budget: "320,000 MAD",
    startDate: "20/01/2025",
    endDate: "20/07/2025",
    progress: 15,
    status: "planning",
    description: "Construction maison 150m² avec jardin",
    priority: "medium",
  },
];

const columns = [
  {
    id: "planning",
    title: "Planification",
    color:
      "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700",
  },
  {
    id: "in_progress",
    title: "En cours",
    color:
      "bg-benaya-100 dark:bg-benaya-900/30 border-benaya-200 dark:border-benaya-700",
  },
  {
    id: "on_hold",
    title: "En pause",
    color:
      "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700",
  },
  {
    id: "completed",
    title: "Terminé",
    color:
      "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700",
  },
];

// Sortable Project Card Component
const SortableProjectCard = ({ project }: { project: Project }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "benaya-card p-4 group hover:shadow-lg transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-3 scale-105 shadow-2xl z-50",
      )}
    >
      <ProjectCardContent project={project} />
    </div>
  );
};

// Project Card Content Component
const ProjectCardContent = ({ project }: { project: Project }) => {
  const getPriorityColor = (priority: Project["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
      case "medium":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200";
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
    }
  };

  const getPriorityLabel = (priority: Project["priority"]) => {
    switch (priority) {
      case "high":
        return "Urgent";
      case "medium":
        return "Moyen";
      case "low":
        return "Faible";
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
            {project.title}
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            {project.description}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Voir détails</DropdownMenuItem>
            <DropdownMenuItem>Modifier</DropdownMenuItem>
            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Priority */}
      <div className="flex items-center gap-2">
        <Badge className={cn("text-xs", getPriorityColor(project.priority))}>
          {getPriorityLabel(project.priority)}
        </Badge>
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <User className="w-3 h-3" />
          <span>{project.client}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <MapPin className="w-3 h-3" />
          <span>{project.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <DollarSign className="w-3 h-3" />
          <span>{project.budget}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <Calendar className="w-3 h-3" />
          <span>
            {project.startDate} - {project.endDate}
          </span>
        </div>
      </div>

      {/* Progress */}
      {project.status !== "planning" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-600 dark:text-neutral-400">
              Progression
            </span>
            <span className="font-medium text-neutral-900 dark:text-white">
              {project.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
            <div
              className="h-full bg-benaya-900 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Chantiers() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const getProjectsByStatus = (status: ProjectStatus) => {
    return projects.filter((project) => project.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active project
    const activeProject = projects.find((project) => project.id === activeId);
    if (!activeProject) return;

    // Determine the new status based on where it was dropped
    let newStatus: ProjectStatus = activeProject.status;

    // Check if dropped over a column
    if (columns.some((col) => col.id === overId)) {
      newStatus = overId as ProjectStatus;
    } else {
      // Dropped over another project, find the column
      const overProject = projects.find((project) => project.id === overId);
      if (overProject) {
        newStatus = overProject.status;
      }
    }

    // Update the project status if it changed
    if (newStatus !== activeProject.status) {
      setProjects((projects) =>
        projects.map((project) =>
          project.id === activeId ? { ...project, status: newStatus } : project,
        ),
      );
    }

    setActiveId(null);
  };

  const activeProject = projects.find((project) => project.id === activeId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chantiers</h1>
            <p className="text-benaya-100 mt-1">
              Suivez l'avancement de vos projets
            </p>
          </div>
          <Button className="gap-2 bg-white text-benaya-900 hover:bg-white/90">
            <Plus className="w-4 h-4" />
            Nouveau chantier
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            {projects.length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Total projets
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {projects.filter((p) => p.status === "in_progress").length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            En cours
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-green-600">
            {projects.filter((p) => p.status === "completed").length}
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Terminés
          </div>
        </div>
        <div className="benaya-card text-center">
          <div className="text-2xl font-bold text-benaya-900 dark:text-benaya-200">
            1,890,000
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            MAD Total
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
                placeholder="Rechercher un chantier..."
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

      {/* Drag and Drop Info */}
      <div className="benaya-card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Clock className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Kanban interactif</h3>
            <p className="text-sm">
              Glissez-déposez les projets entre les colonnes pour changer leur
              statut
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board with Drag & Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map((column) => {
            const columnProjects = getProjectsByStatus(
              column.id as ProjectStatus,
            );

            return (
              <SortableContext
                key={column.id}
                items={columnProjects.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {/* Column Header */}
                  <div
                    className={cn(
                      "p-4 rounded-xl border droppable-area",
                      column.color,
                    )}
                    id={column.id}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-neutral-900 dark:text-white">
                        {column.title}
                      </h2>
                      <Badge className="bg-white/50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300">
                        {columnProjects.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="space-y-4 min-h-[500px] droppable-zone">
                    {columnProjects.map((project) => (
                      <SortableProjectCard key={project.id} project={project} />
                    ))}

                    {/* Add new card */}
                    <Button
                      variant="outline"
                      className="w-full h-12 border-dashed text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un projet
                    </Button>
                  </div>
                </div>
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="benaya-card p-4 rotate-3 scale-105 shadow-2xl border-2 border-benaya-500">
              <ProjectCardContent project={activeProject} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
