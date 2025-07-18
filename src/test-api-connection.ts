/**
 * Script de test des connexions API
 * Ce script permet de vérifier que les connexions API fonctionnent correctement
 * et que les problèmes d'erreur 401 Unauthorized sont résolus
 */
import { apiClient } from './lib/api/client';
import { quotesApi } from './lib/api/quotes';
import { runAuthenticationTest } from './lib/api/test-auth';
import { runComparisonTest } from './lib/api/compare-clients';

/**
 * Fonction principale de test
 */
export const runApiTests = async (): Promise<void> => {
  console.log('=== TESTS DE CONNEXION API ===');
  console.log('Date et heure du test:', new Date().toLocaleString());
  
  // 1. Vérifier les informations d'authentification
  console.log('\n--- Test d\'authentification ---');
  await runAuthenticationTest();
  
  // 2. Comparer l'ancien et le nouveau client API
  console.log('\n--- Comparaison des clients API ---');
  await runComparisonTest();
  
  // 3. Tester les endpoints spécifiques du service de devis
  console.log('\n--- Test des endpoints du service de devis ---');
  
  try {
    // Test de récupération des devis
    console.log('Test: Récupération de la liste des devis');
    const quotes = await quotesApi.getQuotes();
    console.log(`✅ Succès: ${quotes.results.length} devis récupérés`);
    
    // Test de récupération des statuts de devis
    console.log('Test: Récupération des statuts de devis');
    const statuses = await quotesApi.getQuoteStatuses();
    console.log(`✅ Succès: ${statuses.length} statuts récupérés`);
    
    // Test de récupération des taux de TVA
    console.log('Test: Récupération des taux de TVA');
    const vatRates = await quotesApi.getVATRates();
    console.log(`✅ Succès: ${vatRates.length} taux de TVA récupérés`);
    
    console.log('\n✅ Tous les tests ont réussi!');
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
};

// Exécuter les tests automatiquement si ce fichier est exécuté directement
if (typeof window !== 'undefined') {
  console.log('Exécution des tests API...');
  runApiTests().catch(console.error);
}

export default runApiTests;
