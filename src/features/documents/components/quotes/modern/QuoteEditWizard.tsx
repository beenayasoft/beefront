/**
 * Wizard moderne d'édition de devis
 * Interface utilisateur cohérente avec le design system
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
import { useQuoteWizard } from '../../../hooks/useQuoteWizard';

// Import des étapes (réutilisables pour l'édition)
import { EditClientStep } from './steps/EditClientStep';
import { OpportunityStep } from './steps/OpportunityStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { ItemsStep } from './steps/ItemsStep';
import { ReviewStep } from './steps/ReviewStep';

interface QuoteEditWizardProps {
  quote: Quote;
  onQuoteSaved?: (quoteId: string) => void;
  onCancel?: () => void;
}

const STEP_CONFIG = {
  client: {
    label: 'Client',
    description: 'Informations client',
    icon: '👤',
    component: EditClientStep
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


const QuoteEditWizard: React.FC<QuoteEditWizardProps> = ({
  quote,
  onQuoteSaved,
  onCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const wizard = useQuoteWizard();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [showA4Preview, setShowA4Preview] = React.useState(false);

  // Initialiser le wizard avec les données du devis existant
  React.useEffect(() => {
    if (quote && !isInitialized) {
      // Attendre que le wizard soit complètement initialisé
      setTimeout(() => {
        try {
          // Créer un client minimal pour la validation sans appels API
          // L'ID spécial 'edit-mode' est reconnu et ne déclenche pas d'appels API
          const editModeClient = {
            id: 'edit-mode',
            name: quote.clientName || 'Client du devis',
            company: quote.clientName || '',
            address: quote.clientAddress || '',
            phone: '',
            email: '',
            type: 'entreprise' as const,
            isActive: true,
            createdAt: quote.createdAt,
            updatedAt: quote.updatedAt
          };

          wizard.setClient?.(editModeClient);

          // Récupérer les vraies données de l'opportunité si elle existe
          if (quote.opportunityId) {
            (async () => {
              try {
                console.log('📞 Récupération opportunité:', quote.opportunityId);
                // Importer l'API CRM de façon dynamique pour éviter les dépendances circulaires
                const { opportunitiesApi } = await import('@/features/crm/api/opportunities');
                const fullOpportunity = await opportunitiesApi.getOpportunity(quote.opportunityId);
                
                // Convertir vers OpportunityOption pour le wizard
                const opportunityOption = {
                  id: fullOpportunity.id,
                  name: fullOpportunity.name,
                  stage: fullOpportunity.stage,
                  estimatedAmount: fullOpportunity.estimatedAmount,
                  probability: fullOpportunity.probability,
                  tierId: fullOpportunity.tierId,
                  tierName: fullOpportunity.tierName
                };
                
                console.log('✅ Opportunité récupérée:', opportunityOption);
                wizard.setOpportunity?.(opportunityOption);
              } catch (error) {
                console.warn('⚠️ Impossible de récupérer l\'opportunité:', error);
                // Fallback vers un objet minimal si l'API échoue
                const editModeOpportunity = {
                  id: quote.opportunityId,
                  name: quote.projectName || 'Opportunité associée',
                  stage: 'new' as const,
                  estimatedAmount: quote.totalTtc,
                  probability: 0,
                  tierId: editModeClient.id,
                  tierName: editModeClient.name
                };
                wizard.setOpportunity?.(editModeOpportunity);
              }
            })();
          }

          wizard.updateProjectDetails?.({
            name: quote.projectName || '',
            address: quote.projectAddress || '',
            reference: quote.projectReference || '',
            notes: quote.notes || ''
          });
          // Convertir les QuoteItem existants vers CreateQuoteItemData
          const existingItems = (quote.items || []).map((item, index) => ({
            type: item.type,
            parent: item.parent,
            position: index,
            reference: item.reference,
            designation: item.designation,
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            vatRate: item.vatRate,
            margin: item.margin,
            workId: item.workId
          }));
          console.log('🔄 Initialisation items existants:', existingItems);
          wizard.updateItems?.(existingItems);

          // Forcer la validation de l'étape client pour l'édition
          // En mode édition, nous considérons que l'étape client est valide
          // car les informations sont déjà dans le devis
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Error initializing wizard:', error);
          setIsInitialized(true); // Continuer même en cas d'erreur
        }
      }, 100);
    }
  }, [quote, isInitialized, wizard]);

  // Calcul du progrès
  const currentStepIndex = wizard.steps.indexOf(wizard.currentStep);
  const progress = ((currentStepIndex + 1) / wizard.steps.length) * 100;

  // Gestion de la sauvegarde
  const handleSave = async () => {
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
      const quoteData = await wizard.generateQuoteData();
      console.log('📤 Données générées:', quoteData);
      
      // Pour l'édition, on envoie seulement les champs modifiables
      const editData = {
        client_name: quoteData.client_name,
        client_address: quoteData.client_address,
        project_name: quoteData.project_name,
        project_address: quoteData.project_address,
        project_reference: quoteData.project_reference,
        notes: quoteData.notes,
        terms_and_conditions: quoteData.terms_and_conditions,
        items: quoteData.items
      };
      
      console.log('📤 Données d\'édition à envoyer:', editData);
      console.log('📤 Nombre d\'items à sauvegarder:', editData.items?.length || 0);
      console.log('📤 Détail des items à sauvegarder:', editData.items);
      const updatedQuote = await quotesApi.updateQuote(quote.id, editData);
      
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
    if (wizard.isDirty) {
      if (window.confirm('Êtes-vous sûr de vouloir abandonner ? Toutes les modifications seront perdues.')) {
        wizard.reset();
        onCancel?.() || navigate(`/devis/${quote.id}`);
      }
    } else {
      onCancel?.() || navigate(`/devis/${quote.id}`);
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
            <h1 className="text-2xl font-bold">Modifier le devis {quote.number}</h1>
            <p className="text-Beenaya-100 mt-1">
              Éditez les détails et éléments de votre devis
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowA4Preview(true)}
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

      {/* Container pour le contenu du wizard */}
      <div className="container mx-auto max-w-4xl">
        {/* Progression */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Étape {currentStepIndex + 1}/{wizard.steps.length}
            </Badge>
            {wizard.isDirty && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
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
                      {config.description}
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
          {isInitialized ? (
            wizard.currentStep === 'client' ? (
              <EditClientStep wizard={wizard} quote={quote} />
            ) : (
              <CurrentStepComponent wizard={wizard} />
            )
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Chargement des données...</span>
            </div>
          )}
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
                  onClick={handleSave}
                  disabled={!wizard.validateAll() || isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
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

      {/* TODO: Réimplémenter l'aperçu PDF */}
    </div>
  );
};

export default QuoteEditWizard;