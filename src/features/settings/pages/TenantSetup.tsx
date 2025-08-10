/**
 * Page complète pour la configuration du tenant
 * Affiche la progression et gère les redirections
 */

import React, { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TenantSetupProgress } from '../components/TenantSetupProgress';

export function TenantSetup() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  const handleComplete = useCallback(() => {
    // Rediriger vers le dashboard quand la configuration est terminée
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleError = useCallback((error: string) => {
    console.error('Erreur de configuration tenant:', error);
    // Optionnel : afficher une notification d'erreur globale
  }, []);

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Erreur de configuration
          </h1>
          <p className="text-gray-600 mb-4">
            Identifiant de tenant manquant
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retour à l'authentification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur Beenaya ! 🚀
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nous configurons votre environnement de travail personnalisé. 
            Cette opération ne prend généralement que quelques minutes.
          </p>
        </div>

        <TenantSetupProgress
          tenantId={tenantId}
          onComplete={handleComplete}
          onError={handleError}
          showCloseButton={true}
        />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Configuration sécurisée</p>
          <p>Cette page se rafraîchit automatiquement</p>
        </div>
      </div>
    </div>
  );
}

export default TenantSetup;