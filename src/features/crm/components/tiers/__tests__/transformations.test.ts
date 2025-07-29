/**
 * Tests pour les fonctions de transformation
 * Ce fichier sert aussi de documentation des cas d'usage
 */

import { 
  splitContactName, 
  joinContactName,
  splitAddress,
  joinAddress,
  transformTierToFormValues,
  transformFormValuesToTier,
  validateFormDataConsistency 
} from '../utils/transformations';
import { Tier, TierFormValues } from '../types';

// Test des fonctions de base
console.log('=== Tests des utilitaires de transformation ===');

// Test splitContactName
console.log('Test splitContactName:');
console.log('  "Jean Dupont" =>', splitContactName("Jean Dupont"));
console.log('  "Marie-Claire Martin" =>', splitContactName("Marie-Claire Martin"));
console.log('  "Dupont" =>', splitContactName("Dupont"));
console.log('  "" =>', splitContactName(""));

// Test joinContactName  
console.log('\nTest joinContactName:');
console.log('  ("Jean", "Dupont") =>', joinContactName("Jean", "Dupont"));
console.log('  ("", "Dupont") =>', joinContactName("", "Dupont"));
console.log('  ("Jean", "") =>', joinContactName("Jean", ""));

// Test splitAddress
console.log('\nTest splitAddress:');
console.log('  "15 rue des Bâtisseurs, 75001 Paris" =>', splitAddress("15 rue des Bâtisseurs, 75001 Paris"));
console.log('  "42 avenue de la République, 93100 Montreuil" =>', splitAddress("42 avenue de la République, 93100 Montreuil"));
console.log('  "123 Main St, New York" =>', splitAddress("123 Main St, New York"));

// Test joinAddress
console.log('\nTest joinAddress:');
console.log('  ("15 rue des Bâtisseurs", "75001", "Paris") =>', joinAddress("15 rue des Bâtisseurs", "75001", "Paris"));
console.log('  ("42 avenue", "", "Lyon") =>', joinAddress("42 avenue", "", "Lyon"));

// Test avec des données d'exemple
const tierExample: Tier = {
  id: "1",
  name: "Dupont Construction",
  type: ["client", "fournisseur"],
  contact: "Jean Dupont",
  email: "j.dupont@example.com",
  phone: "06 12 34 56 78",
  address: "15 rue des Bâtisseurs, 75001 Paris",
  siret: "123 456 789 00012",
  status: "active"
};

console.log('\n=== Test transformation complète ===');
console.log('Tier original:', tierExample);

const formValues = transformTierToFormValues(tierExample);
console.log('Transformé en form values:', formValues);

const tierReconstruit = transformFormValuesToTier(formValues, 'entreprise', tierExample.id);
console.log('Reconstruit en tier:', tierReconstruit);

// Test validation
console.log('\n=== Test validation ===');
const validationEntreprise = validateFormDataConsistency(formValues, 'entreprise');
console.log('Validation entreprise:', validationEntreprise);

const formValuesParticulier = { ...formValues, contactPrenom: "Jean", siret: "" };
const validationParticulier = validateFormDataConsistency(formValuesParticulier, 'particulier');
console.log('Validation particulier:', validationParticulier);

export {}; // Pour faire de ce fichier un module 