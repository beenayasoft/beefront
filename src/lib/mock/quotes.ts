// Import du type API pour référence uniquement
export type { Quote as ApiQuote } from '../api/quotes';

// Type pour les statuts de devis (union type pour les valeurs)
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

// Type mock pour les devis (format legacy camelCase)
export interface Quote {
  id: string;
  number: string;
  status: QuoteStatus;
  clientId?: string;
  clientName?: string;
  clientAddress?: string;
  tier?: string; // Pour compatibilité API
  issueDate?: string;
  expiryDate?: string;
  validityPeriod?: number;
  items?: any[];
  notes?: string;
  termsAndConditions?: string;
  totalHT: number;
  totalVAT: number;
  totalTTC: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

// Données mockées pour les devis
export const mockQuotes: Quote[] = [
  {
    id: '1',
    number: 'DRAFT-001',
    status: 'draft',
    clientId: '1',
    clientName: 'Brouillon',
    validityPeriod: 30,
    items: [],
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  },
  {
    id: '2',
    number: 'DEV-2025-001',
    status: 'sent',
    clientId: '2',
    clientName: 'Jean Dupont',
    clientAddress: '15 Rue des Fleurs, 75001 Paris',
    issueDate: '2025-06-15',
    expiryDate: '2025-07-15',
    validityPeriod: 30,
    items: [
      {
        id: '1',
        type: 'chapter',
        position: 1,
        designation: 'Travaux préparatoires',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '2',
        type: 'work',
        parentId: '1',
        position: 1,
        reference: 'PREP-001',
        designation: 'Préparation du chantier',
        description: 'Installation et sécurisation de la zone de travail',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 500,
        vatRate: 20,
        margin: 15,
        totalHT: 500,
        totalTTC: 600,
      },
      {
        id: '3',
        type: 'chapter',
        position: 2,
        designation: 'Peinture',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '4',
        type: 'work',
        parentId: '3',
        position: 1,
        reference: 'PEINT-001',
        designation: 'Peinture murs et plafonds',
        description: 'Peinture acrylique blanche mate',
        unit: 'm²',
        quantity: 120,
        unitPrice: 25,
        vatRate: 20,
        margin: 20,
        totalHT: 3000,
        totalTTC: 3600,
      },
      {
        id: '5',
        type: 'chapter',
        position: 3,
        designation: 'Revêtement de sol',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '6',
        type: 'work',
        parentId: '5',
        position: 1,
        reference: 'SOL-001',
        designation: 'Pose de parquet stratifié',
        description: 'Parquet stratifié chêne clair 8mm',
        unit: 'm²',
        quantity: 60,
        unitPrice: 45,
        vatRate: 20,
        margin: 18,
        totalHT: 2700,
        totalTTC: 3240,
      },
      {
        id: '7',
        type: 'product',
        parentId: '5',
        position: 2,
        reference: 'SOL-002',
        designation: 'Plinthes assorties',
        unit: 'ml',
        quantity: 80,
        unitPrice: 12,
        vatRate: 20,
        totalHT: 960,
        totalTTC: 1152,
      },
      {
        id: '8',
        type: 'chapter',
        position: 4,
        designation: 'Électricité',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '9',
        type: 'work',
        parentId: '8',
        position: 1,
        reference: 'ELEC-001',
        designation: 'Mise aux normes tableau électrique',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 1200,
        vatRate: 20,
        margin: 25,
        totalHT: 1200,
        totalTTC: 1440,
      },
      {
        id: '10',
        type: 'work',
        parentId: '8',
        position: 2,
        reference: 'ELEC-002',
        designation: 'Installation prises et interrupteurs',
        unit: 'unité',
        quantity: 15,
        unitPrice: 45,
        vatRate: 20,
        margin: 20,
        totalHT: 675,
        totalTTC: 810,
      },
    ],
    notes: 'Travaux à réaliser sous 3 semaines après acceptation du devis.',
    termsAndConditions: 'Acompte de 30% à la signature. Solde à la fin des travaux.',
    totalHT: 9035,
    totalVAT: 1807,
    totalTTC: 10842,
    createdAt: '2025-06-10T14:30:00Z',
    updatedAt: '2025-06-15T09:15:00Z',
    createdBy: 'admin',
  },
  {
    id: '3',
    number: 'DEV-2025-002',
    status: 'accepted',
    clientId: '3',
    clientName: 'Marie Lambert',
    clientAddress: '8 Avenue des Roses, 69002 Lyon',
    issueDate: '2025-06-10',
    expiryDate: '2025-07-10',
    validityPeriod: 30,
    items: [
      {
        id: '1',
        type: 'chapter',
        position: 1,
        designation: 'Aménagement extérieur',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '2',
        type: 'work',
        parentId: '1',
        position: 1,
        reference: 'EXT-001',
        designation: 'Terrasse en bois composite',
        description: 'Fourniture et pose de lames en bois composite',
        unit: 'm²',
        quantity: 40,
        unitPrice: 180,
        vatRate: 20,
        margin: 22,
        totalHT: 7200,
        totalTTC: 8640,
      },
      {
        id: '3',
        type: 'work',
        parentId: '1',
        position: 2,
        reference: 'EXT-002',
        designation: 'Éclairage extérieur',
        description: 'Installation de spots LED encastrables',
        unit: 'unité',
        quantity: 12,
        unitPrice: 85,
        vatRate: 20,
        margin: 20,
        totalHT: 1020,
        totalTTC: 1224,
      },
      {
        id: '4',
        type: 'chapter',
        position: 2,
        designation: 'Piscine',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '5',
        type: 'work',
        parentId: '4',
        position: 1,
        reference: 'PISC-001',
        designation: 'Installation système de filtration',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 3500,
        vatRate: 20,
        margin: 25,
        totalHT: 3500,
        totalTTC: 4200,
      },
      {
        id: '6',
        type: 'work',
        parentId: '4',
        position: 2,
        reference: 'PISC-002',
        designation: 'Revêtement liner',
        unit: 'm²',
        quantity: 45,
        unitPrice: 120,
        vatRate: 20,
        margin: 18,
        totalHT: 5400,
        totalTTC: 6480,
      },
      {
        id: '7',
        type: 'product',
        parentId: '4',
        position: 3,
        reference: 'PISC-003',
        designation: 'Kit d\'entretien piscine',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 350,
        vatRate: 20,
        totalHT: 350,
        totalTTC: 420,
      },
    ],
    notes: 'Travaux à réaliser avant la saison estivale.',
    termsAndConditions: 'Acompte de 40% à la signature. 30% à mi-travaux. Solde à la réception.',
    totalHT: 17470,
    totalVAT: 3494,
    totalTTC: 20964,
    createdAt: '2025-06-05T11:20:00Z',
    updatedAt: '2025-06-12T16:45:00Z',
    createdBy: 'admin',
  },
  {
    id: '4',
    number: 'DEV-2025-003',
    status: 'rejected',
    clientId: '4',
    clientName: 'Pierre Martin',
    clientAddress: '25 Boulevard Central, 33000 Bordeaux',
    issueDate: '2025-06-08',
    expiryDate: '2025-07-08',
    validityPeriod: 30,
    items: [
      {
        id: '1',
        type: 'chapter',
        position: 1,
        designation: 'Démolition',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '2',
        type: 'work',
        parentId: '1',
        position: 1,
        reference: 'DEM-001',
        designation: 'Démolition cuisine existante',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 1200,
        vatRate: 20,
        margin: 15,
        totalHT: 1200,
        totalTTC: 1440,
      },
      {
        id: '3',
        type: 'chapter',
        position: 2,
        designation: 'Plomberie',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '4',
        type: 'work',
        parentId: '3',
        position: 1,
        reference: 'PLOMB-001',
        designation: 'Modification arrivées d\'eau',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 850,
        vatRate: 20,
        margin: 20,
        totalHT: 850,
        totalTTC: 1020,
      },
      {
        id: '5',
        type: 'chapter',
        position: 3,
        designation: 'Mobilier et équipement',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '6',
        type: 'product',
        parentId: '5',
        position: 1,
        reference: 'CUIS-001',
        designation: 'Meubles de cuisine sur mesure',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 8500,
        vatRate: 20,
        totalHT: 8500,
        totalTTC: 10200,
      },
      {
        id: '7',
        type: 'product',
        parentId: '5',
        position: 2,
        reference: 'CUIS-002',
        designation: 'Électroménager haut de gamme',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 6500,
        vatRate: 20,
        totalHT: 6500,
        totalTTC: 7800,
      },
    ],
    notes: 'Client a trouvé moins cher ailleurs.',
    termsAndConditions: 'Acompte de 30% à la signature. Solde à la livraison.',
    totalHT: 17050,
    totalVAT: 3410,
    totalTTC: 20460,
    createdAt: '2025-06-01T09:45:00Z',
    updatedAt: '2025-06-15T14:20:00Z',
    createdBy: 'admin',
  },
  {
    id: '5',
    number: 'DEV-2025-004',
    status: 'draft',
    clientId: '5',
    clientName: 'Sophie Dubois',
    clientAddress: '42 Rue du Commerce, 44000 Nantes',
    validityPeriod: 30,
    items: [
      {
        id: '1',
        type: 'chapter',
        position: 1,
        designation: 'Fondations',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '2',
        type: 'work',
        parentId: '1',
        position: 1,
        reference: 'FOND-001',
        designation: 'Terrassement et fondations',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 4500,
        vatRate: 20,
        margin: 15,
        totalHT: 4500,
        totalTTC: 5400,
      },
    ],
    notes: 'Devis en cours d\'élaboration',
    totalHT: 4500,
    totalVAT: 900,
    totalTTC: 5400,
    createdAt: '2025-06-14T16:30:00Z',
    updatedAt: '2025-06-14T16:30:00Z',
    createdBy: 'admin',
  },
  // 🎯 DEVIS POUR JESSE MPIGA (ajoutés pour résoudre le problème affiché)
  {
    id: '100',
    number: 'DEV-2025-024',
    status: 'draft',
    clientId: 'jesse-mpiga-id', // ID qui correspond à Jesse MPIGA
    clientName: 'Jesse MPIGA',
    clientAddress: 'Adresse Jesse MPIGA',
    projectName: 'Devis pour Carrelage grès cérame 30×30',
    projectAddress: 'Chantier Jesse MPIGA',
    issueDate: '2025-06-25',
    expiryDate: '2025-07-25',
    validityPeriod: 30,
    items: [],
    notes: 'Devis pour carrelage',
    termsAndConditions: 'Conditions standard',
    totalHT: 85.00,
    totalVAT: 17.00,
    totalTTC: 102.00,
    createdAt: '2025-06-25T10:00:00Z',
    updatedAt: '2025-06-25T10:00:00Z',
    createdBy: 'admin',
  },
  {
    id: '101',
    number: 'DEV-2025-023',
    status: 'draft',
    clientId: 'jesse-mpiga-id', // même client
    clientName: 'Jesse MPIGA',
    clientAddress: 'Adresse Jesse MPIGA',
    projectName: 'Devis pour Test opportunité MPIGA',
    projectAddress: 'Chantier test MPIGA',
    issueDate: '2025-06-25',
    expiryDate: '2025-07-25',
    validityPeriod: 30,
    items: [],
    notes: 'Devis test',
    termsAndConditions: 'Conditions standard',
    totalHT: 25.00,
    totalVAT: 5.00,
    totalTTC: 30.00,
    createdAt: '2025-06-25T10:00:00Z',
    updatedAt: '2025-06-25T10:00:00Z',
    createdBy: 'admin',
  },
];

// Fonction pour récupérer les devis avec filtres optionnels
export const getQuotes = (filters?: {
  status?: QuoteStatus | QuoteStatus[];
  clientId?: string;
  projectId?: string;
  search?: string;
}) => {
  let result = [...mockQuotes];
  
  if (filters) {
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      result = result.filter(quote => statusArray.includes(quote.status));
    }
    
    if (filters.clientId) {
      result = result.filter(quote => quote.clientId === filters.clientId);
    }
    
    if (filters.projectId) {
      result = result.filter(quote => quote.projectId === filters.projectId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(quote => 
        quote.number.toLowerCase().includes(searchLower) ||
        quote.clientName.toLowerCase().includes(searchLower) ||
        (quote.projectName && quote.projectName.toLowerCase().includes(searchLower))
      );
    }
  }
  
  return result;
};

// Fonction pour récupérer un devis par ID
export const getQuoteById = (id: string) => {
  return mockQuotes.find(quote => quote.id === id);
};

// Fonction pour calculer les statistiques des devis
export const getQuotesStats = () => {
  const total = mockQuotes.length;
  const draft = mockQuotes.filter(q => q.status === 'draft').length;
  const sent = mockQuotes.filter(q => q.status === 'sent').length;
  const accepted = mockQuotes.filter(q => q.status === 'accepted').length;
  const rejected = mockQuotes.filter(q => q.status === 'rejected').length;
  const expired = mockQuotes.filter(q => q.status === 'expired').length;
  const cancelled = mockQuotes.filter(q => q.status === 'cancelled').length;
  
  const totalAmount = mockQuotes.reduce((sum, quote) => sum + quote.totalTTC, 0);
  const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;
  
  return {
    total,
    draft,
    sent,
    accepted,
    rejected,
    expired,
    cancelled,
    totalAmount,
    acceptanceRate,
  };
};
