import { Opportunity, OpportunityStatus, OpportunitySource, LossReason, OpportunityStats } from '../types/opportunity';
import { initialTiers } from '@/lib/mock/tiers';

// Données mockées pour les opportunités
export const mockOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'Rénovation Villa Dupont',
    tierId: '1',
    tierName: 'Dupont Construction',
    tierType: ['client'],
    stage: 'negotiation',
    estimatedAmount: 450000,
    probability: 60,
    expectedCloseDate: '2025-03-15',
    source: 'referral',
    description: 'Rénovation complète d\'une villa de 250m² incluant cuisine, salle de bains et extérieurs',
    assignedTo: 'Jean Martin',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    quoteIds: ['2'],
  },
  {
    id: '2',
    name: 'Extension bureaux Architectes Associés',
    tierId: '2',
    tierName: 'Architectes Associés',
    tierType: ['partenaire'],
    stage: 'needs_analysis',
    estimatedAmount: 180000,
    probability: 40,
    expectedCloseDate: '2025-04-20',
    source: 'partner',
    description: 'Extension de 80m² des bureaux existants',
    assignedTo: 'Sophie Dubois',
    createdAt: '2025-01-12T09:15:00Z',
    updatedAt: '2025-01-12T09:15:00Z',
  },
  {
    id: '3',
    name: 'Construction entrepôt Matériaux Express',
    tierId: '3',
    tierName: 'Matériaux Express',
    tierType: ['fournisseur'],
    stage: 'won',
    estimatedAmount: 750000,
    probability: 100,
    expectedCloseDate: '2025-01-05',
    source: 'exhibition',
    description: 'Construction d\'un entrepôt de 1200m² avec bureaux administratifs',
    assignedTo: 'Jean Martin',
    createdAt: '2024-11-20T11:30:00Z',
    updatedAt: '2025-01-05T16:45:00Z',
    closedAt: '2025-01-05T16:45:00Z',
    quoteIds: ['3'],
    projectId: '3',
  },
  {
    id: '4',
    name: 'Rénovation appartements Résidences Modernes',
    tierId: '4',
    tierName: 'Résidences Modernes',
    tierType: ['client', 'prospect'],
    stage: 'lost',
    estimatedAmount: 320000,
    probability: 0,
    expectedCloseDate: '2025-01-30',
    source: 'website',
    description: 'Rénovation de 5 appartements dans un immeuble résidentiel',
    assignedTo: 'Sophie Dubois',
    createdAt: '2024-12-15T14:20:00Z',
    updatedAt: '2025-01-18T10:10:00Z',
    closedAt: '2025-01-18T10:10:00Z',
    lossReason: 'competitor',
    lossDescription: 'Client a choisi un concurrent proposant un délai plus court',
  },
  {
    id: '5',
    name: 'Installation plomberie Plomberie Générale',
    tierId: '5',
    tierName: 'Plomberie Générale',
    tierType: ['sous-traitant'],
    stage: 'new',
    estimatedAmount: 85000,
    probability: 20,
    expectedCloseDate: '2025-05-10',
    source: 'cold_call',
    description: 'Installation complète de la plomberie pour un nouvel immeuble de 20 appartements',
    assignedTo: 'Jean Martin',
    createdAt: '2025-01-20T09:00:00Z',
    updatedAt: '2025-01-20T09:00:00Z',
  },
  {
    id: '6',
    name: 'Aménagement jardin Villa Mercier',
    tierId: '1',
    tierName: 'Dupont Construction',
    tierType: ['client'],
    stage: 'negotiation',
    estimatedAmount: 120000,
    probability: 80,
    expectedCloseDate: '2025-02-28',
    source: 'referral',
    description: 'Aménagement complet du jardin avec piscine, terrasse et espace paysager',
    assignedTo: 'Sophie Dubois',
    createdAt: '2025-01-05T15:45:00Z',
    updatedAt: '2025-01-22T11:20:00Z',
    quoteIds: ['4'],
  },
];

// Fonction pour récupérer les opportunités avec filtres optionnels
export const getOpportunities = (filters?: {
  stage?: OpportunityStatus | OpportunityStatus[];
  tierId?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  minProbability?: number;
  maxProbability?: number;
  assignedTo?: string;
}) => {
  let result = [...mockOpportunities];
  
  if (filters) {
    if (filters.stage) {
      const stageArray = Array.isArray(filters.stage) ? filters.stage : [filters.stage];
      result = result.filter(opportunity => stageArray.includes(opportunity.stage));
    }
    
    if (filters.tierId) {
      result = result.filter(opportunity => opportunity.tierId === filters.tierId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(opportunity => 
        opportunity.name.toLowerCase().includes(searchLower) ||
        opportunity.tierName.toLowerCase().includes(searchLower) ||
        opportunity.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.minAmount) {
      result = result.filter(opportunity => opportunity.estimatedAmount >= filters.minAmount);
    }
    
    if (filters.maxAmount) {
      result = result.filter(opportunity => opportunity.estimatedAmount <= filters.maxAmount);
    }
    
    if (filters.minProbability) {
      result = result.filter(opportunity => opportunity.probability >= filters.minProbability);
    }
    
    if (filters.maxProbability) {
      result = result.filter(opportunity => opportunity.probability <= filters.maxProbability);
    }
    
    if (filters.assignedTo) {
      result = result.filter(opportunity => opportunity.assignedTo === filters.assignedTo);
    }
  }
  
  return result;
};

// Fonction pour récupérer une opportunité par ID
export const getOpportunityById = (id: string) => {
  return mockOpportunities.find(opportunity => opportunity.id === id);
};

// Fonction pour calculer les statistiques des opportunités
export const getOpportunityStats = (): OpportunityStats => {
  const total = mockOpportunities.length;
  
  // Compter par statut
  const byStage = mockOpportunities.reduce((acc, opportunity) => {
    acc[opportunity.stage] = (acc[opportunity.stage] || 0) + 1;
    return acc;
  }, {} as Record<OpportunityStatus, number>);
  
  // Calculer les montants
  const totalAmount = mockOpportunities.reduce((sum, opportunity) => sum + opportunity.estimatedAmount, 0);
  const weightedAmount = mockOpportunities.reduce((sum, opportunity) => sum + (opportunity.estimatedAmount * opportunity.probability / 100), 0);
  const wonAmount = mockOpportunities.filter(o => o.stage === 'won').reduce((sum, opportunity) => sum + opportunity.estimatedAmount, 0);
  const lostAmount = mockOpportunities.filter(o => o.stage === 'lost').reduce((sum, opportunity) => sum + opportunity.estimatedAmount, 0);
  
  // Calculer le taux de conversion
  const closedOpportunities = mockOpportunities.filter(o => o.stage === 'won' || o.stage === 'lost').length;
  const wonOpportunities = mockOpportunities.filter(o => o.stage === 'won').length;
  const conversionRate = closedOpportunities > 0 ? (wonOpportunities / closedOpportunities) * 100 : 0;
  
  return {
    total,
    byStage: byStage as Record<OpportunityStatus, number>,
    totalAmount,
    weightedAmount,
    wonAmount,
    lostAmount,
    conversionRate,
  };
};

// Fonction pour créer une nouvelle opportunité
export const createOpportunity = (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newOpportunity: Opportunity = {
    id: (mockOpportunities.length + 1).toString(),
    ...opportunity,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  mockOpportunities.push(newOpportunity);
  return newOpportunity;
};

// Fonction pour mettre à jour une opportunité
export const updateOpportunity = (id: string, updates: Partial<Opportunity>) => {
  const index = mockOpportunities.findIndex(opportunity => opportunity.id === id);
  if (index === -1) return null;
  
  const updatedOpportunity = {
    ...mockOpportunities[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // Si le statut passe à "won" ou "lost", ajouter la date de clôture
  if ((updates.stage === 'won' || updates.stage === 'lost') && !updatedOpportunity.closedAt) {
    updatedOpportunity.closedAt = new Date().toISOString();
  }
  
  mockOpportunities[index] = updatedOpportunity;
  return updatedOpportunity;
};

// Fonction pour supprimer une opportunité
export const deleteOpportunity = (id: string) => {
  const index = mockOpportunities.findIndex(opportunity => opportunity.id === id);
  if (index === -1) return false;
  
  mockOpportunities.splice(index, 1);
  return true;
};

// Fonction pour créer un devis à partir d'une opportunité
export const createQuoteFromOpportunity = (opportunityId: string) => {
  // Cette fonction serait implémentée pour créer un devis basé sur une opportunité
  // et établir le lien entre les deux
  console.log(`Creating quote from opportunity ${opportunityId}`);
  return { success: true, quoteId: 'new-quote-id' };
};

// Fonction pour envoyer un devis et mettre à jour le statut de l'opportunité
export const sendQuote = (quoteId: string) => {
  // Trouver l'opportunité liée à ce devis
  const opportunity = mockOpportunities.find(opp => 
    opp.quoteIds && opp.quoteIds.includes(quoteId)
  );
  
  if (!opportunity) return { success: false, message: "Opportunité non trouvée" };
  
  // Si l'opportunité est en "Analyse des besoins", la passer en "Négociation"
  if (opportunity.stage === 'needs_analysis') {
    updateOpportunity(opportunity.id, { 
      stage: 'negotiation',
      probability: 60
    });
  }
  
  return { success: true, opportunityId: opportunity.id };
};

// Fonction pour marquer un devis comme accepté et mettre à jour le statut de l'opportunité
export const acceptQuote = (quoteId: string) => {
  // Trouver l'opportunité liée à ce devis
  const opportunity = mockOpportunities.find(opp => 
    opp.quoteIds && opp.quoteIds.includes(quoteId)
  );
  
  if (!opportunity) return { success: false, message: "Opportunité non trouvée" };
  
  // Si l'opportunité est en "Négociation", la passer en "Gagnée"
  if (opportunity.stage === 'negotiation') {
    updateOpportunity(opportunity.id, { 
      stage: 'won',
      probability: 100
    });
  }
  
  return { success: true, opportunityId: opportunity.id };
};

// Fonction pour créer un projet à partir d'une opportunité gagnée
export const createProjectFromOpportunity = (opportunityId: string) => {
  // Cette fonction serait implémentée pour créer un projet basé sur une opportunité gagnée
  // et établir le lien entre les deux
  console.log(`Creating project from opportunity ${opportunityId}`);
  return { success: true, projectId: 'new-project-id' };
};