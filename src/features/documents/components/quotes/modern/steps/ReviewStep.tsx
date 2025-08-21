/**
 * Étape de validation finale du devis
 * Récapitulatif complet avant création
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, Target, Building, Package, Calculator, FileText, Hash } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { UseQuoteWizard } from '../../../hooks/useQuoteWizard';
import { formatCurrency } from '@/lib/utils';
import { quotesApi } from '@/features/documents/api/quotes';
import { settingsApi } from '@/features/settings/api/settings';
import { formatNumberWithSettings, getDocumentFormat, getNextSequentialNumber } from '@/features/documents/utils/numberFormatting';

interface ReviewStepProps {
  wizard: UseQuoteWizard;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ wizard }) => {
  const [nextQuoteNumber, setNextQuoteNumber] = useState<string>('');
  const [isLoadingNumber, setIsLoadingNumber] = useState(true);

  // Charger le prochain numéro formaté depuis les settings
  useEffect(() => {
    const loadNextNumber = async () => {
      try {
        setIsLoadingNumber(true);
        
        // Récupérer les informations du tenant pour obtenir la configuration de numérotation
        const tenantInfo = await settingsApi.getCurrentTenantInfo();
        const numberingSettings = tenantInfo.document_numbering || [];
        
        // Obtenir le format configuré pour les devis
        const format = getDocumentFormat(numberingSettings, 'quote');
        
        // Obtenir le prochain numéro séquentiel
        const nextNumber = getNextSequentialNumber(numberingSettings, 'quote');
        
        // Formater le numéro final
        const formattedNumber = formatNumberWithSettings(format, nextNumber);
        
        setNextQuoteNumber(formattedNumber);
      } catch (error) {
        console.error('Erreur lors du chargement du prochain numéro:', error);
        // Fallback : utiliser l'ancienne méthode
        try {
          const fallbackNumber = await quotesApi.getNextQuoteNumber();
          setNextQuoteNumber(fallbackNumber);
        } catch (fallbackError) {
          setNextQuoteNumber('DEV-XXXX');
        }
      } finally {
        setIsLoadingNumber(false);
      }
    };

    loadNextNumber();

    // Écouter les changements de configuration de numérotation
    const handleNumberingChange = () => {
      loadNextNumber();
    };
    
    window.addEventListener('numberingSettingsChanged', handleNumberingChange);
    
    return () => {
      window.removeEventListener('numberingSettingsChanged', handleNumberingChange);
    };
  }, []);

  // Calculs des totaux
  const calculateTotals = () => {
    return wizard.items.reduce((acc, item) => {
      // S'assurer que les valeurs sont numériques
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const discount = Number(item.discount) || 0;
      const vatRate = Number(item.vatRate) || 0;
      
      const baseTotal = quantity * unitPrice;
      const discountAmount = baseTotal * discount / 100;
      const totalHT = baseTotal - discountAmount;
      const vatAmount = totalHT * vatRate / 100;
      const totalTtc = totalHT + vatAmount;
      
      return {
        totalHT: acc.totalHT + totalHT,
        totalVAT: acc.totalVAT + vatAmount,
        totalTtc: acc.totalTtc + totalTtc
      };
    }, { totalHT: 0, totalVAT: 0, totalTtc: 0 });
  };
  
  const totals = calculateTotals();
  
  return (
    <div className="space-y-6">
      {/* Instructions et numéro de devis */}
      <div className="space-y-4">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Vérifiez toutes les informations avant de créer votre devis.
          </AlertDescription>
        </Alert>

        {/* Aperçu du numéro de devis */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Numéro du devis à créer :
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {isLoadingNumber ? (
                    <span className="animate-pulse">Chargement...</span>
                  ) : (
                    nextQuoteNumber
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wizard.client ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{wizard.client.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {wizard.client.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
                  </Badge>
                </div>
                {wizard.client.adressePrincipale && (
                  <div className="text-sm text-gray-600">
                    {wizard.client.adressePrincipale.rue}, {wizard.client.adressePrincipale.codePostal} {wizard.client.adressePrincipale.ville}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-red-500">Aucun client sélectionné</p>
            )}
          </CardContent>
        </Card>
        
        {/* Opportunité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Opportunité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wizard.opportunity ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{wizard.opportunity.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {wizard.opportunity.stage}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(wizard.opportunity.estimated_amount)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Probabilité: {wizard.opportunity.probability}%
                </div>
              </div>
            ) : (
              <p className="text-red-500">Aucune opportunité sélectionnée</p>
            )}
          </CardContent>
        </Card>
        
        {/* Projet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{wizard.projectDetails.name || 'Sans nom'}</h4>
                {wizard.projectDetails.reference && (
                  <p className="text-sm text-gray-600">
                    Réf: {wizard.projectDetails.reference}
                  </p>
                )}
              </div>
              
              {wizard.projectDetails.address && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Adresse du chantier:</p>
                  <p className="text-sm text-gray-600">{wizard.projectDetails.address}</p>
                </div>
              )}
              
              {wizard.projectDetails.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Notes:</p>
                  <p className="text-sm text-gray-600">{wizard.projectDetails.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Articles ({wizard.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {wizard.items.length > 0 ? (
              <div className="space-y-3">
                {wizard.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.designation}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} {item.unit} × {formatCurrency(item.unitPrice || 0)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                    </p>
                  </div>
                ))}
                
                {wizard.items.length > 3 && (
                  <p className="text-sm text-gray-500">
                    ... et {wizard.items.length - 3} autre(s) article(s)
                  </p>
                )}
              </div>
            ) : (
              <p className="text-red-500">Aucun article ajouté</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Récapitulatif financier */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Récapitulatif financier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total HT</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.totalHT)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Total TVA</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.totalVAT)}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Total TTC</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totals.totalTtc)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Validité du devis:</p>
              <p className="text-sm text-gray-600">{wizard.validityPeriod} jours</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700">Date d'émission:</p>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          {wizard.termsAndConditions && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700">Conditions générales:</p>
              <p className="text-sm text-gray-600 mt-1">{wizard.termsAndConditions}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Validation finale */}
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2">
          {wizard.validateAll() ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Toutes les informations sont complètes
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 bg-red-500 rounded-full" />
              <span className="text-sm text-red-700">
                Certaines informations sont manquantes
              </span>
            </>
          )}
        </div>
        
        {wizard.validateAll() && (
          <Badge className="bg-green-100 text-green-800">
            ✓ Prêt à créer le devis
          </Badge>
        )}
      </div>
      
      {/* Erreurs de validation */}
      {!wizard.validateAll() && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Veuillez compléter les éléments suivants :</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {!wizard.isValid.client && <li>Sélectionner un client</li>}
                {!wizard.isValid.opportunity && <li>Sélectionner une opportunité</li>}
                {!wizard.isValid.project && <li>Renseigner le nom du projet</li>}
                {!wizard.isValid.items && <li>Ajouter au moins un article</li>}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReviewStep;