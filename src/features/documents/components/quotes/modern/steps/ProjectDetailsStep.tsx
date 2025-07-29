/**
 * Étape de saisie des détails du projet
 */
import React from 'react';
import { Building, MapPin, FileText, Calendar } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';

interface ProjectDetailsStepProps {
  wizard: UseQuoteWizard;
}

export const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ wizard }) => {
  return (
    <div className="space-y-6">
      <Alert>
        <Building className="h-4 w-4" />
        <AlertDescription>
          Renseignez les informations du projet pour personnaliser votre devis.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName" className="text-sm font-medium">
              Nom du projet *
            </Label>
            <Input
              id="projectName"
              value={wizard.projectDetails.name}
              onChange={(e) => wizard.updateProjectDetails({ name: e.target.value })}
              placeholder="Ex: Rénovation cuisine"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="projectReference" className="text-sm font-medium">
              Référence projet
            </Label>
            <Input
              id="projectReference"
              value={wizard.projectDetails.reference}
              onChange={(e) => wizard.updateProjectDetails({ reference: e.target.value })}
              placeholder="Ex: PROJ-2024-001"
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="projectAddress" className="text-sm font-medium">
              Adresse du chantier
            </Label>
            <Textarea
              id="projectAddress"
              value={wizard.projectDetails.address}
              onChange={(e) => wizard.updateProjectDetails({ address: e.target.value })}
              placeholder="Adresse complète du chantier..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="projectNotes" className="text-sm font-medium">
          Notes et observations
        </Label>
        <Textarea
          id="projectNotes"
          value={wizard.projectDetails.notes}
          onChange={(e) => wizard.updateProjectDetails({ notes: e.target.value })}
          placeholder="Remarques particulières, contraintes, etc."
          className="mt-1"
          rows={4}
        />
      </div>
      
      {/* Validation */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {wizard.isValid.project ? (
            <>
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">
                Détails du projet renseignés
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-600">
                Nom du projet requis
              </span>
            </>
          )}
        </div>
        
        {wizard.isValid.project && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            ✓ Étape validée
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsStep;