import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "info" | "danger";
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmModal({ 
  open, 
  onOpenChange, 
  title, 
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "info",
  onConfirm,
  loading = false
}: ConfirmModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return {
          iconBg: "bg-yellow-100",
          iconColor: "text-yellow-600",
          Icon: AlertTriangle,
          buttonClass: "bg-yellow-600 hover:bg-yellow-700"
        };
      case "danger":
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600", 
          Icon: AlertTriangle,
          buttonClass: "bg-red-600 hover:bg-red-700"
        };
      default:
        return {
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          Icon: Info,
          buttonClass: "bg-blue-600 hover:bg-blue-700"
        };
    }
  };

  const { iconBg, iconColor, Icon, buttonClass } = getVariantStyles();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={`${buttonClass} text-white`}
          >
            {loading ? "En cours..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}