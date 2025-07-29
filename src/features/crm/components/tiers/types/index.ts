// Export des types de base existants
export * from './common';
export * from './errors';

// Export des nouveaux types spécialisés
export * from './entreprise';
export * from './particulier';

// Types legacy pour compatibilité (à supprimer progressivement)
export interface Tier {
  id: string;
  name: string;
  type: string[];
  contact: string;
  email: string;
  phone: string;
  address: string;
  siret: string;
  status: 'active' | 'inactive';
}

// Types pour les entités (pour le sélecteur de type)
export type EntityType = 'entreprise' | 'particulier';

export interface EntityTypeInfo {
  id: EntityType;
  label: string;
  description: string;
  icon: string;
  example: string;
}

export const entityTypes: EntityTypeInfo[] = [
  {
    id: 'entreprise',
    label: 'Entreprise',
    description: 'Société, organisation ou entité commerciale',
    icon: 'Building2',
    example: 'SARL Martin Construction, SAS Dupont Électricité...'
  },
  {
    id: 'particulier',
    label: 'Particulier',
    description: 'Personne physique, client individuel',
    icon: 'User',
    example: 'M. Durand, Mme Martin...'
  }
];

// Utilitaires pour les entités
export const getEntityTypeInfo = (type: EntityType): EntityTypeInfo | undefined => {
  return entityTypes.find(et => et.id === type);
};

export const isEntreprise = (type: EntityType): boolean => {
  return type === 'entreprise';
};

export const isParticulier = (type: EntityType): boolean => {
  return type === 'particulier';
}; 