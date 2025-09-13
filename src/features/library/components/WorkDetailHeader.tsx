import { ArrowLeft, Wrench, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Work } from "@/features/library/types";
import { LibraryItemForm } from "@/features/library/components/LibraryItemForm";
import { formatCurrency } from "@/lib/utils";

interface WorkDetailHeaderProps {
  work: Work;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  onEdit: (work: Work) => void;
  onDelete: () => void;
  onBack: () => void;
}

export function WorkDetailHeader({
  work,
  showEditDialog,
  setShowEditDialog,
  onEdit,
  onDelete,
  onBack
}: WorkDetailHeaderProps) {
  return (
    <div className="Beenaya-card Beenaya-gradient text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 border border-white/30 hover:bg-white/30"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 border border-white/30 rounded-lg">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{work.name}</h1>
                <Badge variant="secondary" className="bg-white/20 border border-white/30 text-white">
                  Ouvrage
                </Badge>
                {work.isCustom && (
                  <Badge variant="secondary" className="bg-amber-500/20 border border-amber-400/30 text-amber-100">
                    Personnalisé
                  </Badge>
                )}
              </div>
              <p className="text-Beenaya-100 mt-1">
                {work.reference && `Réf: ${work.reference} • `}
                {formatCurrency(work.recommendedPrice || 0)} par {work.unit}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full mx-auto overflow-y-auto">
              <LibraryItemForm
                item={work}
                type="work"
                onSave={onEdit}
                onCancel={() => setShowEditDialog(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            className="bg-red-500/20 hover:bg-red-500/30 border-red-300/40 text-red-100 hover:text-white" 
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}