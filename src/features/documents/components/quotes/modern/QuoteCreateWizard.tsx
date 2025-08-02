/**
 * Wizard moderne de création de devis
 * Interface utilisateur cohérente avec le design system
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

import { useQuoteWizard, WizardStep } from '../../../hooks/useQuoteWizard';
import { quotesApi } from '../../../api/quotes';

// Étapes du wizard
import { ClientSelectionStep } from './steps/ClientSelectionStep';
import { OpportunityStep } from './steps/OpportunityStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { ItemsStep } from './steps/ItemsStep';
import { ReviewStep } from './steps/ReviewStep';

interface QuoteCreateWizardProps {
  onQuoteCreated?: (quoteId: string) => void;
  onCancel?: () => void;
}

const STEP_CONFIG = {
  client: {
    label: 'Client',
    description: 'Sélection du client',
    icon: '👤',
    component: ClientSelectionStep
  },
  opportunity: {
    label: 'Opportunité',
    description: 'Contexte commercial',
    icon: '🎯',
    component: OpportunityStep
  },
  project: {
    label: 'Projet',
    description: 'Détails du projet',
    icon: '🏗️',
    component: ProjectDetailsStep
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

// Supprimé : STEPS_ORDER est maintenant dynamique via wizard.steps

const QuoteCreateWizard: React.FC<QuoteCreateWizardProps> = ({
  onQuoteCreated,
  onCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const wizard = useQuoteWizard();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  
  // Calcul du progrès (utilise le workflow dynamique)
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
      const quoteData = wizard.generateQuoteData();
      const newQuote = await quotesApi.createQuote(quoteData);
      
      toast({
        title: 'Devis créé avec succès',
        description: `Le devis ${newQuote.number} a été créé`,
        variant: 'default'
      });
      
      // Appeler le callback ou naviguer
      if (onQuoteCreated) {
        onQuoteCreated(newQuote.id);
      } else {
        navigate(`/devis/${newQuote.id}`);
      }
      
      // Reset du wizard
      wizard.reset();
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Erreur lors de la création du devis';
      
      setSubmitError(errorMessage);
      toast({
        title: 'Erreur de création',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Gestion de l'annulation
  const handleCancel = () => {
    if (wizard.isDirty) {
      if (window.confirm('Êtes-vous sûr de vouloir abandonner ? Toutes les modifications seront perdues.')) {
        wizard.reset();
        onCancel?.() || navigate('/devis');
      }
    } else {
      onCancel?.() || navigate('/devis');
    }
  };
  
  // Composant de l'étape actuelle
  const CurrentStepComponent = STEP_CONFIG[wizard.currentStep].component;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Nouveau devis</h1>
            <p className="text-Beenaya-100 mt-1">
              Créez un devis professionnel en quelques étapes
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-white text-Beenaya-900 rounded-md hover:bg-white/90 font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* Container pour le contenu du wizard */}
      <div className="container mx-auto max-w-4xl">
        {/* Progression */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedSteps}/{wizard.steps.length} étapes
            </Badge>
            {wizard.isProspectWorkflow && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                🎯 Mode Prospect
              </Badge>
            )}
            {wizard.isDirty && (
              <Badge variant="outline">
                Modifications non sauvées
              </Badge>
            )}
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Progression: {Math.round(progress)}%</span>
            <span>Étape {currentStepIndex + 1} sur {wizard.steps.length}</span>
          </div>
        </div>
      </div>
      
      {/* Navigation par étapes */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {wizard.steps.map((step, index) => {
              const config = STEP_CONFIG[step];
              const isActive = step === wizard.currentStep;
              const isCompleted = wizard.isValid[step];
              const isAccessible = index <= currentStepIndex || isCompleted;
              
              return (
                <React.Fragment key={step}>
                  <button
                    onClick={() => isAccessible && wizard.goToStep(step)}
                    disabled={!isAccessible}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : isCompleted
                        ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
                        : isAccessible
                        ? 'hover:bg-gray-50 border-2 border-transparent'
                        : 'opacity-50 cursor-not-allowed border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {isCompleted ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      )}
                      <span className="ml-2 text-xl">{config.icon}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      {wizard.isProspectWorkflow && step === 'opportunity' 
                        ? 'Opportunité (génère le projet)' 
                        : config.description}
                    </span>
                  </button>
                  
                  {index < wizard.steps.length - 1 && (
                    <div className="flex-1 mx-2">
                      <Separator className={`${
                        wizard.isValid[step] ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Contenu de l'étape actuelle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">{STEP_CONFIG[wizard.currentStep].icon}</span>
            <div>
              <h2 className="text-lg font-semibold">
                {STEP_CONFIG[wizard.currentStep].label}
              </h2>
              <p className="text-sm text-gray-600 font-normal">
                {STEP_CONFIG[wizard.currentStep].description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Affichage des erreurs de soumission */}
          {submitError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          
          {/* Composant de l'étape */}
          <CurrentStepComponent wizard={wizard} />
        </CardContent>
      </Card>
      
      {/* Navigation en bas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              
              {wizard.canGoPrevious() && (
                <Button
                  variant="outline"
                  onClick={wizard.previousStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {wizard.currentStep === 'review' ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!wizard.validateAll() || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Créer le devis
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={wizard.nextStep}
                  disabled={!wizard.canGoNext() || isSubmitting}
                  className="min-w-[120px]"
                >
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteCreateWizard;