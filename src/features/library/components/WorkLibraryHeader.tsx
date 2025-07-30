import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, BarChart3, Package, Clock, Hammer, Loader2 } from "lucide-react";

interface WorkLibraryHeaderProps {
  showTypeSelector: boolean;
  setShowTypeSelector: (show: boolean) => void;
  loading: boolean;
  onAddItem: (type: "material" | "labor" | "work") => void;
}

export function WorkLibraryHeader({
  showTypeSelector,
  setShowTypeSelector,
  loading,
  onAddItem,
}: WorkLibraryHeaderProps) {
  return (
    <div className="benaya-card benaya-gradient text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Bibliothèque d'ouvrages</h1>
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          </div>
          <p className="text-benaya-100 mt-1">
            Gérez vos ouvrages, matériaux et main d'œuvre
            {loading && " - Chargement en cours..."}
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
          <Dialog open={showTypeSelector} onOpenChange={setShowTypeSelector}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2 bg-white text-benaya-900 hover:bg-white/90"
                disabled={loading}
                onClick={() => setShowTypeSelector(true)}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Ajouter un élément
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un élément</DialogTitle>
                <DialogDescription>
                  Sélectionnez le type d'élément à ajouter
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => onAddItem("material")}
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span>Matériau</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => onAddItem("labor")}
                >
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span>Main d'œuvre</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => onAddItem("work")}
                >
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <Hammer className="w-5 h-5" />
                  </div>
                  <span>Ouvrage</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}