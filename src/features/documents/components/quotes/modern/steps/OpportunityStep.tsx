/**
 * Étape de sélection/création d'opportunité
 * Workflow intelligent basé sur le client sélectionné
 */
import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, Calendar, DollarSign, ExternalLink, AlertCircle } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';
import { useOpportunityFlow } from '../../../../hooks/useOpportunityFlow';
import { OpportunityOption } from '@/features/crm/types/crm.types';
import { formatCurrency } from '@/lib/utils';
import { OpportunityQuickCreateForm } from '../forms/OpportunityQuickCreateForm';
import { crmApi } from '@/features/crm/api/crm';

interface OpportunityStepProps {
  wizard: UseQuoteWizard;
}

const STAGE_LABELS = {
  'new': 'Nouvelle',
  'needs_analysis': 'Analyse des besoins',
  'negotiation': 'Négociation',
  'proposal': 'Proposition',
  'closed_won': 'Gagnée',
  'closed_lost': 'Perdue'
} as const;

const STAGE_COLORS = {
  'new': 'bg-blue-100 text-blue-800',
  'needs_analysis': 'bg-yellow-100 text-yellow-800',
  'negotiation': 'bg-orange-100 text-orange-800',
  'proposal': 'bg-purple-100 text-purple-800',
  'closed_won': 'bg-green-100 text-green-800',
  'closed_lost': 'bg-red-100 text-red-800'
} as const;

export const OpportunityStep: React.FC<OpportunityStepProps> = ({ wizard }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Pré-sélection automatique de l'opportunité si fournie dans les données initiales
  useEffect(() => {
    const opportunityId = wizard.initialData?.opportunityId;
    
    if (opportunityId && !wizard.opportunity && wizard.client) {
      console.log('🎯 Auto-sélection de l\'opportunité depuis les données initiales:', opportunityId);
      
      // Récupérer les détails de l'opportunité
      crmApi.opportunities.getOpportunityDetails(opportunityId)
        .then(opportunityDetails => {
          // Convertir les données en format OpportunityOption
          const opportunityOption: OpportunityOption = {
            id: opportunityDetails.id,
            name: opportunityDetails.name,
            stage: opportunityDetails.stage,
            estimatedAmount: opportunityDetails.estimatedAmount || 0,
            probability: opportunityDetails.probability || 0,
            tierId: opportunityDetails.tierId || wizard.client?.id || '',
            tierName: wizard.client?.name || opportunityDetails.tierName || 'Client'
          };
          
          console.log('✅ Opportunité récupérée automatiquement:', opportunityOption.name);
          wizard.setOpportunity(opportunityOption);
        })
        .catch(error => {
          console.error('❌ Erreur lors de la récupération de l\'opportunité pré-sélectionnée:', error);
        });
    }
  }, [wizard.initialData?.opportunityId, wizard.opportunity, wizard.client, wizard.setOpportunity]);
  
  const opportunityFlow = useOpportunityFlow({
    client: wizard.client,
    initialOpportunity: wizard.opportunity,
    autoSelectSingle: true,
    onOpportunitySelect: (opportunity) => {
      wizard.setOpportunity(opportunity);
    },
    onOpportunityCreate: (opportunity) => {
      wizard.setOpportunity(opportunity);
      setShowCreateDialog(false);
    }
  });
  
  // Gestion de la création rapide
  const handleCreateOpportunity = async (opportunityData: any) => {
    setIsCreating(true);
    try {
      await opportunityFlow.createOpportunity(opportunityData);
    } catch (error) {
      console.error('Erreur lors de la création de l\'opportunité:', error);
      throw error; // Propager l'erreur pour que le formulaire puisse la gérer
    } finally {
      setIsCreating(false);
    }
  };
  
  // Formatage des dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  // Si pas de client sélectionné
  if (!wizard.client) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Veuillez d'abord sélectionner un client pour continuer.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          Sélectionnez l'opportunité commerciale associée à ce devis ou créez-en une nouvelle.
        </AlertDescription>
      </Alert>
      
      {/* Sélection d'opportunité */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Opportunités pour {wizard.client.name}
          </h3>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle opportunité
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle opportunité</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle opportunité commerciale pour ce client afin de mieux organiser vos devis et suivre vos ventes.
                </DialogDescription>
              </DialogHeader>
              
              {wizard.client && (
                <OpportunityQuickCreateForm
                  client={wizard.client}
                  onSubmit={handleCreateOpportunity}
                  onCancel={() => setShowCreateDialog(false)}
                  isSubmitting={isCreating}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        {opportunityFlow.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        
        {opportunityFlow.error && (
          <Alert variant="destructive">
            <AlertDescription>{opportunityFlow.error}</AlertDescription>
          </Alert>
        )}
        
        {/* Aucune opportunité */}
        {!opportunityFlow.isLoading && opportunityFlow.isEmpty && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Target className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Aucune opportunité active
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Ce client n'a pas d'opportunité commerciale en cours
                  </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer la première opportunité
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Liste des opportunités */}
        {!opportunityFlow.isLoading && opportunityFlow.opportunities.length > 0 && (
          <div className="space-y-4">
            {/* Suggestion automatique */}
            {opportunityFlow.suggestedOpportunity && !wizard.opportunity && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Opportunité suggérée
                        </h4>
                        <p className="text-sm text-blue-800 mt-1">
                          {opportunityFlow.suggestedOpportunity.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => opportunityFlow.selectOpportunity(opportunityFlow.suggestedOpportunity)}
                    >
                      Sélectionner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Sélecteur d'opportunité */}
            <div>
              <Select
                value={wizard.opportunity?.id || ''}
                onValueChange={(value) => {
                  if (value === 'new') {
                    setShowCreateDialog(true);
                  } else {
                    const opportunity = opportunityFlow.opportunities.find(o => o.id === value);
                    opportunityFlow.selectOpportunity(opportunity || null);
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionner une opportunité..." />
                </SelectTrigger>
                
                <SelectContent>
                  <SelectItem value="new" className="font-medium text-blue-600">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Créer une nouvelle opportunité
                    </div>
                  </SelectItem>
                  
                  {opportunityFlow.opportunities.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{opportunity.name}</span>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge className={STAGE_COLORS[opportunity.stage] || 'bg-gray-100 text-gray-800'}>
                            {STAGE_LABELS[opportunity.stage] || opportunity.stage}
                          </Badge>
                          <span className="text-sm font-medium">
                            {formatCurrency(opportunity.estimatedAmount)}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Opportunité sélectionnée */}
        {wizard.opportunity && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">{wizard.opportunity.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={STAGE_COLORS[wizard.opportunity.stage] || 'bg-gray-100 text-gray-800'}>
                        {STAGE_LABELS[wizard.opportunity.stage] || wizard.opportunity.stage}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Probabilité: {wizard.opportunity.probability}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/opportunities/${wizard.opportunity?.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => wizard.setOpportunity(null)}
                  >
                    Changer
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <DollarSign className="h-4 w-4" />
                    Montant estimé
                  </div>
                  <p className="text-lg font-semibold text-green-700 pl-6">
                    {formatCurrency(wizard.opportunity.estimatedAmount)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <TrendingUp className="h-4 w-4" />
                    Probabilité de succès
                  </div>
                  <p className="text-sm text-gray-600 pl-6">
                    {wizard.opportunity.probability}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Aide contextuelle */}
      {!wizard.opportunity && opportunityFlow.opportunities.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900">
                  Pourquoi associer une opportunité ?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Permet de suivre l'évolution commerciale</li>
                  <li>• Renseigne automatiquement les détails du projet</li>
                  <li>• Facilite le reporting et les prévisions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Validation */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {wizard.isValid.opportunity ? (
            <>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">
                Opportunité sélectionnée
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-600">
                Sélectionnez une opportunité pour continuer
              </span>
            </>
          )}
        </div>
        
        {wizard.isValid.opportunity && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✓ Étape validée
          </Badge>
        )}
      </div>
    </div>
  );
};

export default OpportunityStep;