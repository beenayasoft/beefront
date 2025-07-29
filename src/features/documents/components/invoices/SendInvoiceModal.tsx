import { useState } from "react";
import { Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface SendInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: {
    id: string;
    number: string;
    clientName: string;
    totalTTC: number;
  };
  onSend: (data: { recipient_email: string; message?: string }) => void;
  loading?: boolean;
}

export function SendInvoiceModal({
  open,
  onOpenChange,
  invoice,
  onSend,
  loading = false,
}: SendInvoiceModalProps) {
  const [formData, setFormData] = useState({
    recipient_email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({
      recipient_email: formData.recipient_email.trim(),
      message: formData.message.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Envoyer la facture
          </DialogTitle>
          <DialogDescription>
            Envoyer la facture {invoice.number} par email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de la facture */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                <span className="font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Montant TTC:</span>
                <span className="font-semibold">{invoice.totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          {/* Email du destinataire */}
          <div className="space-y-2">
            <Label htmlFor="recipient_email">
              <Mail className="h-4 w-4 inline mr-1" />
              Email du destinataire
            </Label>
            <Input
              id="recipient_email"
              type="email"
              placeholder="client@exemple.com"
              value={formData.recipient_email}
              onChange={(e) => setFormData(prev => ({ ...prev, recipient_email: e.target.value }))}
              required
            />
          </div>

          {/* Message personnalisé */}
          <div className="space-y-2">
            <Label htmlFor="message">Message personnalisé (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Bonjour,&#10;&#10;Veuillez trouver ci-joint votre facture.&#10;&#10;Merci de procéder au règlement dans les délais convenus.&#10;&#10;Cordialement,"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={5}
            />
          </div>

          {/* Information sur l'envoi */}
          <Alert>
            <AlertDescription>
              La facture sera envoyée en PDF joint à l'email. Le statut de la facture sera automatiquement mis à jour.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.recipient_email.trim()}
              className="benaya-button-primary"
            >
              {loading ? "Envoi..." : "Envoyer la facture"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}