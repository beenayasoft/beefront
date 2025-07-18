import { LucideIcon, Construction, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon = Construction,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-benaya-900 flex items-center justify-center">
          <Icon className="w-10 h-10 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            {title}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Status */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">En développement</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button className="benaya-button-primary gap-2">
            Retour au dashboard
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline">Être notifié</Button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Progression</span>
            <span>25%</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
            <div
              className="h-full bg-benaya-900 rounded-full transition-all duration-500"
              style={{ width: "25%" }}
            ></div>
          </div>
        </div>

        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Cette fonctionnalité sera bientôt disponible.
        </p>
      </div>
    </div>
  );
}
