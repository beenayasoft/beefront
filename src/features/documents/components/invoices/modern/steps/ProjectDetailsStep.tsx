/**
 * Étape des détails du projet pour les factures
 * Formulaire adapté depuis les devis
 */
import React from 'react';
import { Building, Calendar, FileText, CreditCard, Info } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseInvoiceWizard } from '../../../hooks/useInvoiceWizard';

interface ProjectDetailsStepProps {
  wizard: UseInvoiceWizard;
}

export const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ wizard }) => {
  
  const handleProjectChange = (field: string, value: string | number) => {
    wizard.setProject({ [field]: value });
  };
  
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Renseignez les détails du projet et les conditions de paiement pour votre facture.
        </AlertDescription>
      </Alert>
      
      {/* Informations du projet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informations du projet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom du projet */}
            <div className="md:col-span-2">
              <Label htmlFor="project-name">
                Nom du projet <span className="text-red-500">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="Ex: Rénovation appartement, Site web e-commerce..."
                value={wizard.project.name}
                onChange={(e) => handleProjectChange('name', e.target.value)}
                className={!wizard.project.name ? 'border-red-300' : ''}
              />
              {!wizard.project.name && (
                <p className="text-sm text-red-600 mt-1">Le nom du projet est requis</p>
              )}
            </div>
            
            {/* Adresse du projet */}
            <div className="md:col-span-2">
              <Label htmlFor="project-address">Adresse du projet</Label>
              <Input
                id="project-address"
                placeholder="Adresse où les travaux/services sont réalisés"
                value={wizard.project.address}
                onChange={(e) => handleProjectChange('address', e.target.value)}
              />
            </div>
            
            {/* Référence du projet */}
            <div>
              <Label htmlFor="project-reference">Référence du projet</Label>
              <Input
                id="project-reference"
                placeholder="Référence interne"
                value={wizard.project.reference}
                onChange={(e) => handleProjectChange('reference', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Conditions de facturation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Conditions de facturation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date d'émission */}
            <div>
              <Label htmlFor="issue-date">
                Date d'émission <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issue-date"
                type="date"
                value={wizard.project.issueDate}
                onChange={(e) => handleProjectChange('issueDate', e.target.value)}
                className={!wizard.project.issueDate ? 'border-red-300' : ''}
              />
            </div>
            
            {/* Conditions de paiement */}
            <div>
              <Label htmlFor="payment-terms">Conditions de paiement</Label>
              <Select 
                value={wizard.project.paymentTerms.toString()}
                onValueChange={(value) => handleProjectChange('paymentTerms', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Paiement immédiat</SelectItem>
                  <SelectItem value="8">8 jours</SelectItem>
                  <SelectItem value="15">15 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="45">45 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date d'échéance (calculée automatiquement) */}
            <div>
              <Label htmlFor="due-date">Date d'échéance</Label>
              <Input
                id="due-date"
                type="date"
                value={wizard.project.dueDate}
                readOnly
                className="bg-gray-50"
                title="Calculée automatiquement selon les conditions de paiement"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Notes et conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notes et conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              placeholder="Notes visibles sur la facture (contexte, précisions...)"
              value={wizard.project.notes}
              onChange={(e) => handleProjectChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Conditions générales */}
          <div>
            <Label htmlFor="terms">Conditions générales</Label>
            <Textarea
              id="terms"
              placeholder="Conditions générales de vente et modalités..."
              value={wizard.project.termsAndConditions}
              onChange={(e) => handleProjectChange('termsAndConditions', e.target.value)}
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Ces conditions apparaîtront en bas de votre facture
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Récapitulatif des dates */}
      {wizard.project.issueDate && wizard.project.dueDate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 text-sm">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <span className="font-medium">Émission :</span> {
                  new Date(wizard.project.issueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                }
              </div>
              <div>
                <span className="font-medium">Échéance :</span> {
                  new Date(wizard.project.dueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                }
              </div>
              <div>
                <span className="font-medium">Délai :</span> {wizard.project.paymentTerms} jour{wizard.project.paymentTerms > 1 ? 's' : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};