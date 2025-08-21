/**
 * Wizard moderne de création de factures
 * Interface utilisateur identique au wizard de création de devis
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

import { useInvoiceWizard, WizardStep } from '../../../hooks/useInvoiceWizard';
import { createInvoice } from '../../../api/invoices';

// Étapes du wizard (réutilisées et adaptées des devis)
import { ClientSelectionStep } from './steps/ClientSelectionStep';
import { QuoteSelectionStep } from './steps/QuoteSelectionStep';
import { ItemsStep } from './steps/ItemsStep';
import { ReviewStep } from './steps/ReviewStep';

interface InvoiceCreateWizardProps {
  onInvoiceCreated?: (invoiceId: string) => void;
  onCancel?: () => void;
}

const STEP_CONFIG = {
  client: {
    label: 'Client',
    description: 'Sélection du client',
    icon: '👤',
    component: ClientSelectionStep
  },
  quote: {
    label: 'Devis',
    description: 'Sélection du devis',
    icon: '📄',
    component: QuoteSelectionStep
  },
  items: {
    label: 'Articles',
    description: 'Prestations et matériaux',
    icon: '📋',
    component: ItemsStep
  },
  review: {
    label: 'Validation',
    description: 'Vérification finale',
    icon: '✅',
    component: ReviewStep
  }
} as const;

const InvoiceCreateWizard: React.FC<InvoiceCreateWizardProps> = ({
  onInvoiceCreated,
  onCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const wizard = useInvoiceWizard();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  
  // Calcul du progrès
  const currentStepIndex = wizard.steps.indexOf(wizard.currentStep);
  const progress = ((currentStepIndex + 1) / wizard.steps.length) * 100;
  const completedSteps = wizard.steps.filter(step => wizard.isValid[step]).length;
  
  // Gestion de la soumission
  const handleSubmit = async () => {
    if (!wizard.validateAll()) {
      toast({
        title: 'Validation échouée',
        description: 'Veuillez vérifier toutes les étapes du formulaire',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const invoiceData = wizard.generateInvoiceData();
      const newInvoice = await createInvoice(invoiceData);
      
      // ✅ Incrémenter le compteur pour la prochaine facture
      try {
        await wizard.incrementInvoiceCounter();
        console.log('📈 Compteur de factures incrémenté avec succès');
      } catch (counterError) {
        console.error('⚠️ Erreur lors de l\'incrémentation du compteur:', counterError);
        // Ne pas faire échouer la création pour un problème de compteur
      }
      
      toast({
        title: 'Facture créée avec succès',
        description: `Facture #${newInvoice.number || newInvoice.id} créée`
      });
      
      // ✅ Réinitialiser le wizard pour la prochaine création
      wizard.reset();
      
      // ✅ Déclencher un événement pour invalider les caches de numérotation
      window.dispatchEvent(new CustomEvent('invoiceCreated', { 
        detail: { invoiceNumber: newInvoice.number, invoiceId: newInvoice.id } 
      }));
      
      if (onInvoiceCreated) {
        onInvoiceCreated(newInvoice.id);
      } else {
        navigate(`/factures/${newInvoice.id}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la facture:', error);
      setSubmitError(error.response?.data?.detail || error.message || 'Erreur lors de la création');
      
      toast({
        title: 'Erreur de création',
        description: 'Impossible de créer la facture. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/factures');
    }
  };
  
  // Rendu du step actuel
  const CurrentStepComponent = STEP_CONFIG[wizard.currentStep as keyof typeof STEP_CONFIG]?.component;
  
  if (!CurrentStepComponent) {
    return (
      <Alert>
        <AlertDescription>
          Étape inconnue : {wizard.currentStep}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nouvelle facture</h1>
            <p className="text-gray-600 mt-1">
              Créez une nouvelle facture en suivant les étapes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              Étape {currentStepIndex + 1} sur {wizard.steps.length}
            </Badge>
            <Badge variant="outline">
              {completedSteps} / {wizard.steps.length} complétées
            </Badge>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Progression: {Math.round(progress)}%</span>
            <span>{wizard.steps.length - completedSteps} étape(s) restante(s)</span>
          </div>
        </div>
      </div>
      
      {/* Navigation des étapes */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {wizard.steps.map((step, index) => {
              const config = STEP_CONFIG[step as keyof typeof STEP_CONFIG];
              const isCurrent = step === wizard.currentStep;
              const isCompleted = wizard.isValid[step];
              const isPast = index < currentStepIndex;
              
              return (
                <React.Fragment key={step}>
                  <div 
                    className={`flex flex-col items-center space-y-2 cursor-pointer transition-colors ${
                      isCurrent ? 'text-blue-600' : isPast ? 'text-green-600' : 'text-gray-400'
                    }`}
                    onClick={() => wizard.goToStep(step)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCurrent ? 'border-blue-600 bg-blue-50' :
                      isCompleted ? 'border-green-600 bg-green-50' :
                      'border-gray-300 bg-gray-50'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{config?.label}</div>
                      <div className="text-xs text-gray-500">{config?.description}</div>
                    </div>
                  </div>
                  
                  {index < wizard.steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Contenu de l'étape actuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {STEP_CONFIG[wizard.currentStep as keyof typeof STEP_CONFIG]?.icon}
            </span>
            {STEP_CONFIG[wizard.currentStep as keyof typeof STEP_CONFIG]?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert className="mb-6">
              <AlertDescription className="text-red-600">
                {submitError}
              </AlertDescription>
            </Alert>
          )}
          
          <CurrentStepComponent wizard={wizard} />
        </CardContent>
      </Card>
      
      {/* Boutons de navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              
              {wizard.canGoPrevious && (
                <Button 
                  variant="outline"
                  onClick={wizard.goToPrevious}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              {wizard.canGoNext ? (
                <Button 
                  onClick={wizard.goToNext}
                  disabled={!wizard.isValid[wizard.currentStep] || isSubmitting}
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!wizard.validateAll() || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Créer la facture
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceCreateWizard;