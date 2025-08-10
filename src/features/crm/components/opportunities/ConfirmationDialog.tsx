import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler'
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              type === 'danger' 
                ? 'bg-red-100 dark:bg-red-950/20' 
                : 'bg-amber-100 dark:bg-amber-950/20'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                type === 'danger' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-amber-600 dark:text-amber-400'
              }`} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="mt-4">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button 
            variant={type === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className="order-1 sm:order-2"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}