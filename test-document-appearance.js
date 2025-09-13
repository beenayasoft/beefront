/**
 * Script de test pour vérifier que l'API documentAppearance utilise bien tenant-service
 * Usage: node test-document-appearance.js
 */

const API_BASE = 'http://localhost:8000';
const TENANT_ID = 'your-tenant-id'; // Remplacez par votre tenant ID

async function testDocumentAppearanceAPI() {
  console.log('🔍 Test de l\'API document appearance corrigée...\n');
  
  // Configuration de test
  const testConfig = {
    showLogo: false, // Cette valeur doit persister !
    primaryColor: '#FF5733',
    documentTemplate: 'modern'
  };
  
  try {
    // 1. Test de sauvegarde
    console.log('💾 Test de sauvegarde...');
    const saveResponse = await fetch(`${API_BASE}/tenants/current_tenant_info/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
      },
      body: JSON.stringify({
        document_appearance: {
          show_logo: false, // snake_case pour l'API
          primary_color: '#FF5733',
          document_template: 'modern'
        }
      })
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Erreur sauvegarde: ${saveResponse.status}`);
    }
    
    const saveData = await saveResponse.json();
    console.log('✅ Sauvegarde réussie');
    console.log('📝 Réponse:', saveData.document_appearance);
    
    // 2. Test de récupération (vérifier persistence)
    console.log('\n🔄 Test de récupération...');
    const getResponse = await fetch(`${API_BASE}/tenants/current_tenant_info/`, {
      method: 'GET',
      headers: {
        'X-Tenant-ID': TENANT_ID,
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Erreur récupération: ${getResponse.status}`);
    }
    
    const getData = await getResponse.json();
    console.log('✅ Récupération réussie');
    console.log('📝 Config récupérée:', getData.document_appearance);
    
    // 3. Vérification de la persistance
    const showLogoValue = getData.document_appearance?.show_logo;
    if (showLogoValue === false) {
      console.log('🎉 SUCCESS: showLogo: false a bien persisté !');
    } else {
      console.log('❌ FAILED: showLogo devrait être false, mais c\'est:', showLogoValue);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testDocumentAppearanceAPI();