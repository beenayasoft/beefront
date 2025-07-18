import { useState } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tasks = [
  {
    id: 1,
    title: "Finaliser devis Villa Moderne",
    description: "Réviser les prix et envoyer au client",
    dueDate: "Aujourd'hui",
    priority: "high",
    completed: false,
    category: "Devis",
  },
  {
    id: 2,
    title: "Appeler fournisseur matériaux",
    description: "Vérifier délais de livraison",
    dueDate: "Demain",
    priority: "medium",
    completed: false,
    category: "Commandes",
  },
  {
    id: 3,
    title: "Visite chantier Appartement Dupont",
    description: "Contrôle avancement travaux",
    dueDate: "Vendredi",
    priority: "medium",
    completed: false,
    category: "Chantier",
  },
  {
    id: 4,
    title: "Facturer projet Lambert",
    description: "Établir facture finale",
    dueDate: "Lundi prochain",
    priority: "low",
    completed: true,
    category: "Facturation",
  },
];

export function TasksWidget() {
  const [taskList, setTaskList] = useState(tasks);

  const toggleTask = (taskId: number) => {
    setTaskList(
      taskList.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100/50 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
      case "medium":
        return "bg-orange-100/50 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700";
      case "low":
        return "bg-green-100/50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
      default:
        return "bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return AlertTriangle;
      case "medium":
        return Clock;
      default:
        return Calendar;
    }
  };

  const activeTasks = taskList.filter((task) => !task.completed);
  const completedTasks = taskList.filter((task) => task.completed);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl",
        "border border-white/20 dark:border-slate-700/50",
        "shadow-lg shadow-slate-500/5 dark:shadow-slate-900/20",
      )}
    >
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl",
                  "bg-gradient-to-br from-indigo-500 to-blue-600",
                  "shadow-lg shadow-indigo-500/25",
                )}
              >
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Tâches
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-indigo-100/50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700">
                    {activeTasks.length} actives
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {/* Active Tasks */}
          {activeTasks.map((task) => {
            const PriorityIcon = getPriorityIcon(task.priority);
            return (
              <div
                key={task.id}
                className={cn(
                  "group flex items-start gap-3 p-4 rounded-xl",
                  "bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm",
                  "border border-white/20 dark:border-slate-700/30",
                  "hover:bg-white/60 dark:hover:bg-slate-800/60",
                  "transition-all duration-200",
                )}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="mt-1"
                />

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4
                        className={cn(
                          "font-medium",
                          task.completed
                            ? "text-slate-500 dark:text-slate-400 line-through"
                            : "text-slate-900 dark:text-white",
                        )}
                      >
                        {task.title}
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        <PriorityIcon className="w-3 h-3 mr-1" />
                        {task.priority === "high"
                          ? "Urgent"
                          : task.priority === "medium"
                            ? "Moyen"
                            : "Faible"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      {task.category} • {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="pt-4 border-t border-white/10 dark:border-slate-700/30">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                Terminées ({completedTasks.length})
              </h4>
              {completedTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    "bg-white/20 dark:bg-slate-800/20",
                    "opacity-60",
                  )}
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 line-through">
                      {task.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {activeTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Aucune tâche active
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Toutes vos tâches sont terminées !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
