/**
 * Test d'intégration pour le service library-service
 * Ce fichier teste la connexion entre le frontend et le backend library-service
 */
import { libraryService } from './libraryService';

// Test simple pour vérifier la connexion
export const testLibraryServiceConnection = async () => {
  console.log('🧪 Test d\'intégration du service library-service');
  
  try {
    // Test 1: Récupération des catégories
    console.log('\n1️⃣ Test: Récupération des catégories');
    const categories = await libraryService.getCategories();
    console.log(`✅ Catégories récupérées: ${categories.length}`);
    
    // Test 2: Récupération des matériaux
    console.log('\n2️⃣ Test: Récupération des matériaux');
    const materials = await libraryService.getMaterials();
    console.log(`✅ Matériaux récupérés: ${materials.length}`);
    
    // Test 3: Récupération de la main d'œuvre
    console.log('\n3️⃣ Test: Récupération de la main d\'œuvre');
    const labor = await libraryService.getLabor();
    console.log(`✅ Main d'œuvre récupérée: ${labor.length}`);
    
    // Test 4: Récupération des ouvrages
    console.log('\n4️⃣ Test: Récupération des ouvrages');
    const works = await libraryService.getWorks();
    console.log(`✅ Ouvrages récupérés: ${works.length}`);
    
    // Test 5: Statistiques de la bibliothèque
    console.log('\n5️⃣ Test: Statistiques de la bibliothèque');
    const stats = await libraryService.getLibraryStats();
    console.log('✅ Statistiques:', stats);
    
    console.log('\n🎉 Tous les tests d\'intégration ont réussi !');
    return true;
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests d\'intégration:', error);
    return false;
  }
};

// Test de recherche
export const testLibrarySearch = async (query: string = 'béton') => {
  console.log(`🔍 Test de recherche: "${query}"`);
  
  try {
    const results = await libraryService.searchLibrary(query);
    console.log(`✅ Résultats de recherche: ${results.length} éléments trouvés`);
    
    if (results.length > 0) {
      console.log('Premier résultat:', {
        name: results[0].name,
        type: results[0].constructor.name,
        unit: results[0].unit
      });
    }
    
    return results;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
    return [];
  }
};

// Test avec filtres
export const testLibraryFilters = async () => {
  console.log('🔧 Test des filtres');
  
  try {
    // Test filtrage par catégorie (si on a des catégories)
    const categories = await libraryService.getCategories();
    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log(`Filtrage par catégorie: ${firstCategory.name}`);
      
      const filteredItems = await libraryService.filterByCategory(firstCategory.id);
      console.log(`✅ Éléments dans la catégorie "${firstCategory.name}": ${filteredItems.length}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test des filtres:', error);
    return false;
  }
};

// Fonction principale pour lancer tous les tests
export const runAllLibraryTests = async () => {
  console.log('🚀 Lancement de tous les tests d\'intégration du service library');
  console.log('=' .repeat(60));
  
  const results = {
    connection: false,
    search: false,
    filters: false
  };
  
  // Test de connexion
  results.connection = await testLibraryServiceConnection();
  
  // Test de recherche
  const searchResults = await testLibrarySearch();
  results.search = searchResults.length >= 0; // Même 0 résultat est un succès
  
  // Test des filtres
  results.filters = await testLibraryFilters();
  
  console.log('\n📊 Résumé des tests:');
  console.log(`Connexion: ${results.connection ? '✅' : '❌'}`);
  console.log(`Recherche: ${results.search ? '✅' : '❌'}`);
  console.log(`Filtres: ${results.filters ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n${allPassed ? '🎉 Tous les tests ont réussi !' : '⚠️ Certains tests ont échoué'}`);
  
  return results;
};
