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

interface SendQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: {
    id: string;
    number: string;
    clientName: string;
    totalTtc: number | string;
  };
  onSend: (data: { recipient_email: string; message?: string }) => void;
  loading?: boolean;
}

export function SendQuoteModal({
  open,
  onOpenChange,
  quote,
  onSend,
  loading = false,
}: SendQuoteModalProps) {
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

  // Fonction utilitaire pour s'assurer que totalTtc est un nombre
  const formatTotalTtc = (value: number | string | undefined): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value.toString());
    return isNaN(parsed) ? 0 : parsed;
  };

  // Ne pas rendre la modale si les données du devis ne sont pas disponibles
  if (!quote || !quote.id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Envoyer le devis
          </DialogTitle>
          <DialogDescription>
            Envoyer le devis {quote.number} par email
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations du devis */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Client:</span>
                <span className="font-medium">{quote.clientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">Montant TTC:</span>
                <span className="font-semibold">{formatTotalTtc(quote.totalTtc).toFixed(2)} MAD</span>
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
              placeholder="Bonjour,&#10;&#10;Veuillez trouver ci-joint notre devis pour votre projet.&#10;&#10;N'hésitez pas à me contacter pour toute question.&#10;&#10;Cordialement,"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={5}
            />
          </div>

          {/* Information sur l'envoi */}
          <Alert>
            <AlertDescription>
              Le devis sera envoyé en PDF joint à l'email. Le statut du devis sera automatiquement mis à jour.
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
              {loading ? "Envoi..." : "Envoyer le devis"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}