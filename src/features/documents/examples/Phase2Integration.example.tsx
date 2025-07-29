/**
 * Exemple d'intégration complète Phase 2
 * Démontre l'utilisation des APIs dynamiques avec les nouveaux composants
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VatRateSelector } from '../components/VatRateSelector';
import { PaymentTermSelector } from '../components/PaymentTermSelector';
import { useVatRates } from '../hooks/useVatRates';
import { usePaymentTerms } from '../hooks/usePaymentTerms';

/**
 * Composant d'exemple d'intégration Phase 2
 */
export const Phase2IntegrationExample: React.FC = () => {
  const [selectedVatRate, setSelectedVatRate] = useState<string>('');
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<string>('');

  // Hooks pour accéder aux données
  const {
    vatRates,
    defaultVatRate,
    loading: vatLoading,
    formatVatRate
  } = useVatRates();

  const {
    paymentTerms,
    defaultPaymentTerm,
    loading: paymentLoading
  } = usePaymentTerms();

  const handleSubmit = () => {
    const selectedVat = vatRates.find(rate => rate.code === selectedVatRate);
    const selectedPayment = paymentTerms.find(term => term.id === selectedPaymentTerm);

    console.log('Données sélectionnées:', {
      vatRate: selectedVat,
      paymentTerm: selectedPayment
    });

    alert(`Configuration sélectionnée:
• TVA: ${selectedVat?.name} (${formatVatRate(selectedVatRate)})
• Paiement: ${selectedPayment?.label}
    `);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Phase 2 : APIs Dynamiques Intégrées</CardTitle>
            <p className="text-slate-600">
              Démonstration des taux de TVA et conditions de paiement tenant-specific
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sélecteur de taux de TVA */}
            <VatRateSelector
              value={selectedVatRate}
              onValueChange={setSelectedVatRate}
              label="Taux de TVA"
              placeholder="Choisir un taux de TVA"
              required
            />

            {/* Sélecteur de conditions de paiement */}
            <PaymentTermSelector
              value={selectedPaymentTerm}
              onValueChange={setSelectedPaymentTerm}
              label="Conditions de paiement"
              placeholder="Choisir les conditions"
              required
            />

            {/* Informations en temps réel */}
            <div className="bg-slate-100 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Informations en temps réel :</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Taux TVA disponibles:</span>
                  <span className={`ml-2 ${vatLoading ? 'text-orange-600' : 'text-green-600'}`}>
                    {vatLoading ? 'Chargement...' : `${vatRates.length} taux`}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Conditions disponibles:</span>
                  <span className={`ml-2 ${paymentLoading ? 'text-orange-600' : 'text-green-600'}`}>
                    {paymentLoading ? 'Chargement...' : `${paymentTerms.length} conditions`}
                  </span>
                </div>
                <div>
                  <span className="font-medium">TVA par défaut:</span>
                  <span className="ml-2 text-blue-600">
                    {defaultVatRate?.name || 'Chargement...'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Paiement par défaut:</span>
                  <span className="ml-2 text-blue-600">
                    {defaultPaymentTerm?.label || 'Chargement...'}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSubmit}
              disabled={!selectedVatRate || !selectedPaymentTerm}
              className="w-full"
            >
              Tester l'intégration
            </Button>
          </CardContent>
        </Card>

        {/* Informations sur la Phase 2 */}
        <Card>
          <CardHeader>
            <CardTitle>✅ Phase 2 Terminée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>APIs dynamiques pour taux TVA tenant-specific</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>APIs dynamiques pour conditions de paiement</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Hooks React personnalisés avec cache et fallback</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Composants intelligents avec états de chargement</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Intégration complète avec les types corrigés Phase 1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Phase2IntegrationExample;