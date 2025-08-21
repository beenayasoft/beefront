/**
 * Étape de révision finale pour les factures
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle, User, Building2, MapPin, Phone, Mail, Calendar, CreditCard, FileText, Package, Hash } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { UseInvoiceWizard } from '../../../hooks/useInvoiceWizard';
import { formatCurrency } from '@/lib/utils';
import { invoicesApi } from '@/features/documents/api/invoices';
import { settingsApi } from '@/features/settings/api/settings';
import { formatNumberWithSettings, getDocumentFormat, getNextSequentialNumber } from '@/features/documents/utils/numberFormatting';

interface ReviewStepProps {
  wizard: UseInvoiceWizard;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ wizard }) => {
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>('');
  const [isLoadingNumber, setIsLoadingNumber] = useState(true);

  // Charger le prochain numéro formaté depuis les settings
  useEffect(() => {
    const loadNextNumber = async () => {
      try {
        setIsLoadingNumber(true);
        
        // Récupérer les informations du tenant pour obtenir la configuration de numérotation
        const tenantInfo = await settingsApi.getCurrentTenantInfo();
        const numberingSettings = tenantInfo.document_numbering || [];
        
        // Obtenir le format configuré pour les factures
        const format = getDocumentFormat(numberingSettings, 'invoice');
        
        // Obtenir le prochain numéro séquentiel
        const nextNumber = getNextSequentialNumber(numberingSettings, 'invoice');
        
        // Formater le numéro final
        const formattedNumber = formatNumberWithSettings(format, nextNumber);
        
        setNextInvoiceNumber(formattedNumber);
        // ✅ Stocker le numéro dans le wizard pour qu'il soit inclus lors de la création
        wizard.setInvoiceDetails({ number: formattedNumber });
      } catch (error) {
        console.error('Erreur lors du chargement du prochain numéro:', error);
        // Fallback : utiliser l'ancienne méthode
        try {
          const fallbackResponse = await invoicesApi.getNextInvoiceNumber();
          setNextInvoiceNumber(fallbackResponse.number);
          // ✅ Stocker le numéro de fallback aussi
          wizard.setInvoiceDetails({ number: fallbackResponse.number });
        } catch (fallbackError) {
          setNextInvoiceNumber('FAC-XXXX');
          wizard.setInvoiceDetails({ number: 'FAC-XXXX' });
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
    
    // ✅ Écouter la création de factures pour recharger le numéro
    const handleInvoiceCreated = () => {
      console.log('🔄 Facture créée détectée, rechargement du numéro...');
      loadNextNumber();
    };
    
    window.addEventListener('numberingSettingsChanged', handleNumberingChange);
    window.addEventListener('invoiceCreated', handleInvoiceCreated);
    
    return () => {
      window.removeEventListener('numberingSettingsChanged', handleNumberingChange);
      window.removeEventListener('invoiceCreated', handleInvoiceCreated);
    };
  }, []);

  // ✅ Recharger le numéro quand le wizard se réinitialise (sans numéro)
  useEffect(() => {
    // Seulement si on n'a pas de numéro et qu'on n'est pas en train de charger
    if (!wizard.invoiceDetails.number && !isLoadingNumber) {
      console.log('🔄 Rechargement du numéro après réinitialisation du wizard');
      
      // Utiliser un délai pour éviter les conflits avec le premier useEffect
      const timer = setTimeout(async () => {
        try {
          setIsLoadingNumber(true);
          
          const tenantInfo = await settingsApi.getCurrentTenantInfo();
          const numberingSettings = tenantInfo.document_numbering || [];
          const format = getDocumentFormat(numberingSettings, 'invoice');
          const nextNumber = getNextSequentialNumber(numberingSettings, 'invoice');
          const formattedNumber = formatNumberWithSettings(format, nextNumber);
          
          setNextInvoiceNumber(formattedNumber);
          wizard.setInvoiceDetails({ number: formattedNumber });
        } catch (error) {
          console.error('Erreur lors du rechargement du numéro:', error);
          try {
            const fallbackResponse = await invoicesApi.getNextInvoiceNumber();
            setNextInvoiceNumber(fallbackResponse.number);
            wizard.setInvoiceDetails({ number: fallbackResponse.number });
          } catch (fallbackError) {
            setNextInvoiceNumber('FAC-XXXX');
            wizard.setInvoiceDetails({ number: 'FAC-XXXX' });
          }
        } finally {
          setIsLoadingNumber(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [wizard.invoiceDetails.number]);

  // Calculs des totaux
  const totals = wizard.items.reduce((acc, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const vatRate = parseFloat(item.vatRate) || 20;
    
    const subtotal = quantity * unitPrice;
    const discountAmount = (subtotal * discount) / 100;
    const totalHT = subtotal - discountAmount;
    const vatAmount = (totalHT * vatRate) / 100;
    const totalTTC = totalHT + vatAmount;
    
    acc.totalHT += totalHT;
    acc.totalVAT += vatAmount;
    acc.totalTTC += totalTTC;
    
    return acc;
  }, { totalHT: 0, totalVAT: 0, totalTTC: 0 });
  
  // Calcul des jours jusqu'à échéance
  const daysToDue = wizard.invoiceDetails.dueDate ? 
    Math.ceil((new Date(wizard.invoiceDetails.dueDate).getTime() - new Date(wizard.invoiceDetails.issueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  return (
    <div className="space-y-6">
      {/* Instructions avec numéro de facture */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex flex-col gap-2">
            <div>
              Vérifiez toutes les informations avant de créer votre facture. Une fois créée, elle pourra être modifiée depuis l'éditeur.
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Hash className="h-4 w-4" />
              <span>Numéro de facture qui sera attribué :</span>
              {isLoadingNumber ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span className="text-green-600">Génération...</span>
                </div>
              ) : (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 font-mono">
                  {nextInvoiceNumber}
                </Badge>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      {/* Informations de la facture */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Informations de la facture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Numéro</div>
                {isLoadingNumber ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-600 text-sm">Génération...</span>
                  </div>
                ) : (
                  <div className="font-mono text-lg font-bold text-blue-700">
                    {nextInvoiceNumber}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Date d'émission</div>
                <div className="text-gray-600">
                  {new Date(wizard.invoiceDetails.issueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Date d'échéance</div>
                <div className="text-gray-600">
                  {wizard.invoiceDetails.dueDate ? new Date(wizard.invoiceDetails.dueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Non définie'}
                  {daysToDue > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {daysToDue} jour{daysToDue > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {wizard.selectedQuote && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>Basée sur le devis :</span>
                <Badge variant="outline" className="font-mono">
                  {wizard.selectedQuote.number}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {wizard.client?.type === 'entreprise' ? (
              <Building2 className="h-5 w-5 text-blue-600" />
            ) : (
              <User className="h-5 w-5 text-blue-600" />
            )}
            Informations client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-lg">{wizard.client?.name}</div>
              <Badge variant="secondary" className="mt-1">
                {wizard.client?.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {wizard.client?.adressePrincipale && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {wizard.client.adressePrincipale.rue}, {wizard.client.adressePrincipale.codePostal} {wizard.client.adressePrincipale.ville}
                  </span>
                </div>
              )}
              
              {wizard.client?.telephone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{wizard.client.telephone}</span>
                </div>
              )}
              
              {wizard.client?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{wizard.client.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Détails du projet et notes */}
      {(wizard.selectedQuote?.projectName || wizard.invoiceDetails.notes || wizard.invoiceDetails.termsAndConditions) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Détails du projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Informations du projet */}
            {(wizard.selectedQuote?.projectName || wizard.selectedQuote?.projectAddress || wizard.selectedQuote?.projectReference) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {wizard.selectedQuote?.projectName && (
                  <div>
                    <div className="font-medium text-gray-900">Nom du projet</div>
                    <div className="text-gray-600">{wizard.selectedQuote.projectName}</div>
                  </div>
                )}
                
                {wizard.selectedQuote?.projectAddress && (
                  <div>
                    <div className="font-medium text-gray-900">Adresse</div>
                    <div className="text-gray-600">{wizard.selectedQuote.projectAddress}</div>
                  </div>
                )}
                
                {wizard.selectedQuote?.projectReference && (
                  <div>
                    <div className="font-medium text-gray-900">Référence</div>
                    <div className="text-gray-600">{wizard.selectedQuote.projectReference}</div>
                  </div>
                )}
              </div>
            )}
            
            {/* Notes et conditions */}
            {(wizard.invoiceDetails.notes || wizard.invoiceDetails.termsAndConditions) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wizard.invoiceDetails.notes && (
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Notes</div>
                    <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">
                      {wizard.invoiceDetails.notes}
                    </div>
                  </div>
                )}
                
                {wizard.invoiceDetails.termsAndConditions && (
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Conditions générales</div>
                    <div className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">
                      {wizard.invoiceDetails.termsAndConditions}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Articles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Articles et prestations ({wizard.items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Désignation</TableHead>
                  <TableHead className="text-center w-20">Qté</TableHead>
                  <TableHead className="text-right w-32">Prix unitaire</TableHead>
                  <TableHead className="text-center w-20">TVA</TableHead>
                  <TableHead className="text-right w-32">Total HT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizard.items.map((item, index) => {
                  const quantity = parseFloat(item.quantity) || 0;
                  const unitPrice = parseFloat(item.unitPrice) || 0;
                  const discount = parseFloat(item.discount) || 0;
                  const subtotal = quantity * unitPrice;
                  const discountAmount = (subtotal * discount) / 100;
                  const totalHT = subtotal - discountAmount;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.designation}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-1">{item.description}</div>
                          )}
                          {discount > 0 && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Remise -{discount}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {quantity} {item.unit || 'unité'}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(unitPrice)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {item.vatRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(totalHT)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Récapitulatif des totaux */}
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span>Total HT :</span>
                  <span className="font-medium">{formatCurrency(totals.totalHT)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TVA :</span>
                  <span className="font-medium">{formatCurrency(totals.totalVAT)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC :</span>
                  <span>{formatCurrency(totals.totalTTC)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Validation finale */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-green-900">Prêt à créer</div>
              <div className="text-green-700 text-sm mt-1">
                Toutes les informations sont complètes. Cliquez sur "Créer la facture" pour finaliser.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};