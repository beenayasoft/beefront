/**
 * Wizard simplifié d'édition de devis
 * Version allégée qui évite les complications du hook useQuoteWizard
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

import { Quote, CreateQuoteData } from '../../../types/quotes.types';
import { quotesApi } from '../../../api/quotes';
import QuoteForm from '../QuoteForm';

interface SimpleQuoteEditWizardProps {
  quote: Quote;
  onQuoteSaved?: (quoteId: string) => void;
  onCancel?: () => void;
}

const SimpleQuoteEditWizard: React.FC<SimpleQuoteEditWizardProps> = ({
  quote,
  onQuoteSaved,
  onCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Gestion de la sauvegarde
  const handleSubmit = async (data: CreateQuoteData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const updatedQuote = await quotesApi.updateQuote(quote.id, data);
      
      toast({
        title: 'Devis mis à jour',
        description: `Le devis ${updatedQuote.number} a été sauvegardé`,
        variant: 'default'
      });
      
      // Appeler le callback ou naviguer
      if (onQuoteSaved) {
        onQuoteSaved(updatedQuote.id);
      } else {
        navigate(`/devis/${updatedQuote.id}`);
      }
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Erreur lors de la sauvegarde du devis';
      
      setSubmitError(errorMessage);
      toast({
        title: 'Erreur de sauvegarde',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gestion de l'annulation
  const handleCancel = () => {
    onCancel?.() || navigate(`/devis/${quote.id}`);
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Modifier le devis {quote.number}</h1>
            <p className="text-Beenaya-100 mt-1">
              Éditez les détails et éléments de votre devis
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/devis/${quote.id}`)}
              className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 backdrop-blur-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Prévisualiser
            </button>
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white text-Beenaya-900 rounded-md hover:bg-white/90 font-medium"
            >
              Retour
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto max-w-4xl">
        {/* Affichage des erreurs de soumission */}
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        
        {/* Formulaire de devis avec les taux de TVA par défaut */}
        <QuoteForm
          quote={quote}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          error={submitError}
          clients={[]} // Pas de clients pour l'édition
          vatRates={[
            { code: '20', name: 'TVA normale', rate: 20, isDefault: true },
            { code: '10', name: 'TVA réduite', rate: 10 },
            { code: '5.5', name: 'TVA super réduite', rate: 5.5 },
            { code: '0', name: 'TVA 0%', rate: 0 }
          ]}
        />
      </div>
    </div>
  );
};

export default SimpleQuoteEditWizard;