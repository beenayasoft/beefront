import { Tier } from '@/components/tiers/types';

// Données de test pour les tiers
export const initialTiers: Tier[] = [
  {
    id: '1',
    name: 'Entreprise Dupont BTP',
    type: ['client'],
    contact: 'Jean Dupont',
    email: 'contact@dupontbtp.com',
    phone: '06 12 34 56 78',
    address: '123 Rue de la Construction, 75001 Paris',
    siret: '12345678901234',
    status: 'active'
  },
  {
    id: '2',
    name: 'Martin Électricité',
    type: ['fournisseur'],
    contact: 'Sophie Martin',
    email: 'info@martin-elec.fr',
    phone: '07 23 45 67 89',
    address: '45 Avenue des Artisans, 69002 Lyon',
    siret: '98765432109876',
    status: 'active'
  },
  {
    id: '3',
    name: 'Plomberie Dubois',
    type: ['sous_traitant'],
    contact: 'Pierre Dubois',
    email: 'contact@plomberie-dubois.fr',
    phone: '06 34 56 78 90',
    address: '78 Boulevard des Métiers, 33000 Bordeaux',
    siret: '45678901234567',
    status: 'active'
  },
  {
    id: '4',
    name: 'Durand & Fils',
    type: ['client', 'fournisseur'],
    contact: 'Michel Durand',
    email: 'contact@durand-fils.com',
    phone: '07 89 01 23 45',
    address: '25 Rue du Commerce, 44000 Nantes',
    siret: '78901234567890',
    status: 'active'
  },
  {
    id: '5',
    name: 'Leroy Matériaux',
    type: ['fournisseur'],
    contact: 'Emma Leroy',
    email: 'service@leroy-mat.fr',
    phone: '06 45 67 89 01',
    address: '56 Avenue de l\'Industrie, 59000 Lille',
    siret: '23456789012345',
    status: 'active'
  },
  {
    id: '6',
    name: 'Petit Rénovation',
    type: ['client'],
    contact: 'Thomas Petit',
    email: 'info@petit-renovation.fr',
    phone: '07 56 78 90 12',
    address: '89 Rue des Travaux, 31000 Toulouse',
    siret: '56789012345678',
    status: 'inactive'
  }
]; 