import { ArrowLeft, Package, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Material } from "@/features/library/types";
import { LibraryItemForm } from "@/features/documents/components/quotes/library/LibraryItemForm";
import { formatCurrency } from "@/lib/utils";

interface MaterialDetailHeaderProps {
  material: Material;
  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;
  onEdit: (material: Material) => void;
  onDelete: () => void;
  onBack: () => void;
}

export function MaterialDetailHeader({
  material,
  showEditDialog,
  setShowEditDialog,
  onEdit,
  onDelete,
  onBack
}: MaterialDetailHeaderProps) {
  return (
    <div className="benaya-card benaya-gradient text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/10 hover:bg-white/20"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{material.name}</h1>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Matériau
                </Badge>
              </div>
              <p className="text-benaya-100 mt-1">
                {material.reference && `Réf: ${material.reference} • `}
                {formatCurrency(material.unitPrice)} par {material.unit}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <LibraryItemForm
                item={material}
                type="material"
                onSave={onEdit}
                onCancel={() => setShowEditDialog(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            className="bg-red-500/10 hover:bg-red-500/20 border-red-300/20 text-red-100 hover:text-white" 
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