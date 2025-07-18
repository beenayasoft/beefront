import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/lib/types/invoice";
import { getInvoiceById, exportInvoicePdf } from "@/lib/api/invoices";
import { InvoicePreview as InvoicePreviewComponent } from "@/components/invoices/InvoicePreview";
import { toast } from "@/components/ui/use-toast";

export default function InvoicePreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Load invoice data
  useEffect(() => {
    // Essayer d'abord de récupérer depuis sessionStorage
    const storedInvoice = sessionStorage.getItem('previewInvoice');
    
    if (storedInvoice) {
      try {
        setInvoice(JSON.parse(storedInvoice));
        setLoading(false);
        return;
      } catch (err) {
        console.error("Erreur lors du parsing de l'aperçu:", err);
        // Continue to try loading from API if parsing fails
      }
    }
    
    // Si pas de données dans sessionStorage ou erreur de parsing, essayer de charger depuis l'API
    if (id && id !== 'preview') {
      const fetchInvoice = async () => {
      try {
          const invoiceData = await getInvoiceById(id);
        if (invoiceData) {
          setInvoice(invoiceData);
        } else {
          setError("Facture non trouvée");
        }
      } catch (err) {
        setError("Erreur lors du chargement de la facture");
        console.error(err);
        } finally {
          setLoading(false);
      }
      };
      
      fetchInvoice();
    } else if (!storedInvoice) {
      setError("Aucune donnée d'aperçu disponible");
      setLoading(false);
    }
  }, [id]);

  // Print the invoice
  const handlePrint = () => {
    window.print();
  };

  // Download as PDF
  const handleDownload = async () => {
    if (!invoice || !invoice.id) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture: ID manquant",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloading(true);
      const pdfBlob = await exportInvoicePdf(invoice.id);
      
      // Créer un URL pour le blob
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      
      // Créer un lien temporaire pour le téléchargement
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Facture_${invoice.number || 'brouillon'}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast({
        title: "Téléchargement réussi",
        description: "La facture a été téléchargée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement du PDF:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la facture PDF",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  // Send by email (placeholder)
  const handleSendEmail = () => {
    alert("Fonctionnalité d'envoi par email à implémenter");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-benaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="benaya-card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-4">{error || "Facture non trouvée"}</h2>
          <Button onClick={() => navigate("/factures")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold">
                Aperçu de la facture
              </h1>
              <p className="text-benaya-100 mt-1">
                {invoice.number || "Brouillon"} - {invoice.clientName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              onClick={handleDownload}
              disabled={downloading || !invoice.id || invoice.status === 'draft'}
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Téléchargement...
                </>
              ) : (
                <>
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
                </>
              )}
            </Button>
            
            <Button 
              className="bg-white text-benaya-900 hover:bg-white/90"
              onClick={handleSendEmail}
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer par email
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto print:shadow-none print:rounded-none print:m-0 print:p-0" style={{ maxWidth: "210mm" }}>
        {/* Utiliser le composant InvoicePreview avec la pagination */}
        <InvoicePreviewComponent 
          invoice={invoice}
          appearanceSettings={{
            documentTemplate: "modern",
            primaryColor: "#1B333F",
            showLogo: true,
            showClientAddress: true,
            showProjectInfo: true,
            showNotes: true,
            showPaymentTerms: true,
            showBankDetails: true,
          }}
        />
      </div>
    </div>
  );
}