import { Invoice, InvoiceStatus, Payment, InvoiceStats } from '../types/invoice';
import { getQuoteById } from './quotes';

// Fonction pour générer une date au format YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Fonction pour ajouter des jours à une date
const addDays = (date: string, days: number): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return formatDate(newDate);
};

// Fonction pour vérifier si une date est dépassée
const isOverdue = (dueDate: string): boolean => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};

// Données mockées pour les factures
export const mockInvoices: Invoice[] = [
  {
    id: '1',
    number: 'FAC-2025-001',
    status: 'paid',
    clientId: '1',
    clientName: 'Dupont Construction',
    clientAddress: '15 rue des Bâtisseurs, 75001 Paris',
    projectId: '1',
    projectName: 'Villa Moderne',
    projectAddress: '123 Rue de la Paix, Casablanca',
    issueDate: '2025-01-15',
    dueDate: '2025-02-15',
    paymentTerms: 30,
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
        totalHT: 3000,
        totalTTC: 3600,
      },
    ],
    notes: 'Facture réglée par virement bancaire.',
    termsAndConditions: 'Paiement à réception de facture.',
    totalHT: 3500,
    totalVAT: 700,
    totalTTC: 4200,
    paidAmount: 4200,
    remainingAmount: 0,
    payments: [
      {
        id: 'p1',
        date: '2025-02-10',
        amount: 4200,
        method: 'bank_transfer',
        reference: 'VIR-20250210',
        notes: 'Paiement reçu',
      },
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-02-10T14:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '2',
    number: 'FAC-2025-002',
    status: 'sent',
    clientId: '2',
    clientName: 'Architectes Associés',
    clientAddress: '8 avenue des Arts, 75008 Paris',
    projectId: '2',
    projectName: 'Rénovation appartement',
    projectAddress: '45 Avenue Hassan II, Rabat',
    issueDate: '2025-01-20',
    dueDate: '2025-02-20',
    paymentTerms: 30,
    items: [
      {
        id: '1',
        type: 'chapter',
        position: 1,
        designation: 'Prestations d\'architecture',
        quantity: 1,
        unitPrice: 0,
        vatRate: 20,
        totalHT: 0,
        totalTTC: 0,
      },
      {
        id: '2',
        type: 'service',
        parentId: '1',
        position: 1,
        designation: 'Étude préliminaire',
        description: 'Analyse du site et des besoins',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 2500,
        vatRate: 20,
        totalHT: 2500,
        totalTTC: 3000,
      },
      {
        id: '3',
        type: 'service',
        parentId: '1',
        position: 2,
        designation: 'Plans d\'exécution',
        description: 'Réalisation des plans détaillés',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 3500,
        vatRate: 20,
        totalHT: 3500,
        totalTTC: 4200,
      },
    ],
    notes: 'Facture à régler par virement bancaire.',
    termsAndConditions: 'Paiement à 30 jours.',
    totalHT: 6000,
    totalVAT: 1200,
    totalTTC: 7200,
    paidAmount: 0,
    remainingAmount: 7200,
    payments: [],
    createdAt: '2025-01-20T11:30:00Z',
    updatedAt: '2025-01-20T11:30:00Z',
    createdBy: 'admin',
  },
  {
    id: '3',
    number: 'FAC-2025-003',
    status: 'overdue',
    clientId: '3',
    clientName: 'Matériaux Express',
    clientAddress: '42 rue de l\'Industrie, 93100 Montreuil',
    projectId: '3',
    projectName: 'Extension maison',
    projectAddress: '78 Boulevard Zerktouni, Marrakech',
    issueDate: '2024-12-15',
    dueDate: '2025-01-15',
    paymentTerms: 30,
    items: [
      {
        id: '1',
        type: 'product',
        position: 1,
        designation: 'Matériaux de construction',
        description: 'Fourniture de matériaux divers',
        unit: 'lot',
        quantity: 1,
        unitPrice: 8500,
        vatRate: 20,
        totalHT: 8500,
        totalTTC: 10200,
      },
    ],
    notes: 'Facture en retard de paiement.',
    termsAndConditions: 'Paiement à 30 jours. Pénalités de retard: 10%.',
    totalHT: 8500,
    totalVAT: 1700,
    totalTTC: 10200,
    paidAmount: 0,
    remainingAmount: 10200,
    payments: [],
    createdAt: '2024-12-15T09:45:00Z',
    updatedAt: '2024-12-15T09:45:00Z',
    createdBy: 'admin',
  },
  {
    id: '4',
    number: 'FAC-2025-004',
    status: 'partially_paid',
    clientId: '4',
    clientName: 'Résidences Modernes',
    clientAddress: '27 boulevard Haussmann, 75009 Paris',
    projectId: '4',
    projectName: 'Rénovation cuisine',
    projectAddress: '25 Boulevard Central, 33000 Bordeaux',
    issueDate: '2025-01-10',
    dueDate: '2025-02-10',
    paymentTerms: 30,
    items: [
      {
        id: '1',
        type: 'chapter',
        position: 1,
        designation: 'Travaux de rénovation',
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
        designation: 'Démolition cuisine existante',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 1200,
        vatRate: 20,
        totalHT: 1200,
        totalTTC: 1440,
      },
      {
        id: '3',
        type: 'work',
        parentId: '1',
        position: 2,
        designation: 'Installation nouvelle cuisine',
        unit: 'forfait',
        quantity: 1,
        unitPrice: 8500,
        vatRate: 20,
        totalHT: 8500,
        totalTTC: 10200,
      },
    ],
    notes: 'Acompte de 50% reçu.',
    termsAndConditions: 'Paiement en deux fois: 50% à la commande, 50% à la livraison.',
    totalHT: 9700,
    totalVAT: 1940,
    totalTTC: 11640,
    paidAmount: 5820,
    remainingAmount: 5820,
    payments: [
      {
        id: 'p1',
        date: '2025-01-12',
        amount: 5820,
        method: 'check',
        reference: 'CHQ-123456',
        notes: 'Acompte de 50%',
      },
    ],
    createdAt: '2025-01-10T14:20:00Z',
    updatedAt: '2025-01-12T10:15:00Z',
    createdBy: 'admin',
  },
  {
    id: '5',
    number: 'Brouillon',
    status: 'draft',
    clientId: '5',
    clientName: 'Plomberie Générale',
    clientAddress: '3 rue des Artisans, 94200 Ivry-sur-Seine',
    issueDate: formatDate(new Date()),
    dueDate: addDays(formatDate(new Date()), 30),
    paymentTerms: 30,
    items: [],
    notes: '',
    totalHT: 0,
    totalVAT: 0,
    totalTTC: 0,
    paidAmount: 0,
    remainingAmount: 0,
    payments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
  },
];

// Fonction pour récupérer les factures avec filtres optionnels
export const getInvoices = (filters?: {
  status?: InvoiceStatus | InvoiceStatus[];
  clientId?: string;
  projectId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  let result = [...mockInvoices];
  
  // Mettre à jour les statuts des factures en fonction des dates d'échéance
  result = result.map(invoice => {
    if (invoice.status === 'sent' && isOverdue(invoice.dueDate)) {
      return { ...invoice, status: 'overdue' as InvoiceStatus };
    }
    return invoice;
  });
  
  if (filters) {
    if (filters.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      result = result.filter(invoice => statusArray.includes(invoice.status));
    }
    
    if (filters.clientId) {
      result = result.filter(invoice => invoice.clientId === filters.clientId);
    }
    
    if (filters.projectId) {
      result = result.filter(invoice => invoice.projectId === filters.projectId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(invoice => 
        invoice.number.toLowerCase().includes(searchLower) ||
        invoice.clientName.toLowerCase().includes(searchLower) ||
        (invoice.projectName && invoice.projectName.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.dateFrom) {
      result = result.filter(invoice => invoice.issueDate >= filters.dateFrom!);
    }
    
    if (filters.dateTo) {
      result = result.filter(invoice => invoice.issueDate <= filters.dateTo!);
    }
  }
  
  return result;
};

// Fonction pour récupérer une facture par ID
export const getInvoiceById = (id: string) => {
  return mockInvoices.find(invoice => invoice.id === id);
};

// Fonction pour calculer les statistiques des factures
export const getInvoiceStats = (): InvoiceStats => {
  // Mettre à jour les statuts des factures en fonction des dates d'échéance
  const updatedInvoices = mockInvoices.map(invoice => {
    if (invoice.status === 'sent' && isOverdue(invoice.dueDate)) {
      return { ...invoice, status: 'overdue' as InvoiceStatus };
    }
    return invoice;
  });
  
  const total = updatedInvoices.length;
  const draft = updatedInvoices.filter(i => i.status === 'draft').length;
  const sent = updatedInvoices.filter(i => i.status === 'sent').length;
  const overdue = updatedInvoices.filter(i => i.status === 'overdue').length;
  const partially_paid = updatedInvoices.filter(i => i.status === 'partially_paid').length;
  const paid = updatedInvoices.filter(i => i.status === 'paid').length;
  const cancelled = updatedInvoices.filter(i => i.status === 'cancelled').length;
  const cancelled_by_credit_note = updatedInvoices.filter(i => i.status === 'cancelled_by_credit_note').length;
  
  const totalAmount = updatedInvoices.reduce((sum, invoice) => sum + invoice.totalTTC, 0);
  const overdueAmount = updatedInvoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  const paidAmount = updatedInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  const remainingAmount = updatedInvoices.reduce((sum, invoice) => sum + invoice.remainingAmount, 0);
  
  return {
    total,
    draft,
    sent,
    overdue,
    partially_paid,
    paid,
    cancelled,
    cancelled_by_credit_note,
    totalAmount,
    overdueAmount,
    paidAmount,
    remainingAmount,
  };
};

// Fonction pour créer une facture à partir d'un devis
export const createInvoiceFromQuote = (quoteId: string, type: 'advance' | 'total', advancePercentage?: number) => {
  const quote = getQuoteById(quoteId);
  if (!quote) return null;
  
  // Générer un numéro de facture temporaire (brouillon)
  const invoiceNumber = 'Brouillon';
  
  // Date d'émission et d'échéance
  const issueDate = formatDate(new Date());
  const dueDate = addDays(issueDate, 30); // 30 jours par défaut
  
  let items = [];
  let totalHT = 0;
  let totalVAT = 0;
  let totalTTC = 0;
  
  if (type === 'advance' && advancePercentage) {
    // Facture d'acompte
    const advanceAmount = (quote.totalHT * advancePercentage) / 100;
    const advanceVAT = (advanceAmount * 20) / 100; // Supposons TVA à 20%
    const advanceTTC = advanceAmount + advanceVAT;
    
    items = [
      {
        id: '1',
        type: 'advance_payment' as const,
        position: 1,
        designation: `Acompte de ${advancePercentage}% sur devis N°${quote.number}`,
        quantity: 1,
        unitPrice: advanceAmount,
        vatRate: 20,
        totalHT: advanceAmount,
        totalTTC: advanceTTC,
      },
    ];
    
    totalHT = advanceAmount;
    totalVAT = advanceVAT;
    totalTTC = advanceTTC;
  } else {
    // Facture totale ou de solde
    items = [...quote.items];
    totalHT = quote.totalHT;
    totalVAT = quote.totalVAT;
    totalTTC = quote.totalTTC;
    
    // Si des acomptes ont été facturés, ajouter une ligne de déduction
    // (Cette logique serait plus complexe dans une vraie application)
  }
  
  const newInvoice: Invoice = {
    id: (mockInvoices.length + 1).toString(),
    number: invoiceNumber,
    status: 'draft',
    clientId: quote.clientId,
    clientName: quote.clientName,
    clientAddress: quote.clientAddress,
    projectId: quote.projectId,
    projectName: quote.projectName,
    projectAddress: quote.projectAddress,
    issueDate,
    dueDate,
    paymentTerms: 30,
    items,
    notes: '',
    termsAndConditions: 'Paiement à 30 jours.',
    totalHT,
    totalVAT,
    totalTTC,
    paidAmount: 0,
    remainingAmount: totalTTC,
    payments: [],
    quoteId: quote.id,
    quoteNumber: quote.number,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
  };
  
  // Dans une vraie application, on sauvegarderait la facture dans la base de données
  mockInvoices.push(newInvoice);
  
  return newInvoice;
};

// Fonction pour créer une facture directe (sans devis)
export const createDirectInvoice = (clientId: string, clientName: string, items: any[]) => {
  // Logique similaire à createInvoiceFromQuote mais sans référence à un devis
  // À implémenter selon les besoins
};

// Fonction pour créer un avoir à partir d'une facture
export const createCreditNote = (invoiceId: string, isFullCreditNote: boolean, selectedItems?: string[]) => {
  const originalInvoice = getInvoiceById(invoiceId);
  if (!originalInvoice) return null;
  
  // Générer un numéro d'avoir temporaire (brouillon)
  const creditNoteNumber = 'Brouillon';
  
  // Date d'émission et d'échéance
  const issueDate = formatDate(new Date());
  const dueDate = addDays(issueDate, 30);
  
  let items = [];
  let totalHT = 0;
  let totalVAT = 0;
  let totalTTC = 0;
  
  if (isFullCreditNote) {
    // Avoir total: toutes les lignes avec montants négatifs
    items = originalInvoice.items.map(item => ({
      ...item,
      unitPrice: -item.unitPrice,
      totalHT: -item.totalHT,
      totalTTC: -item.totalTTC,
    }));
    
    totalHT = -originalInvoice.totalHT;
    totalVAT = -originalInvoice.totalVAT;
    totalTTC = -originalInvoice.totalTTC;
  } else if (selectedItems && selectedItems.length > 0) {
    // Avoir partiel: seulement les lignes sélectionnées
    items = originalInvoice.items
      .filter(item => selectedItems.includes(item.id))
      .map(item => ({
        ...item,
        unitPrice: -item.unitPrice,
        totalHT: -item.totalHT,
        totalTTC: -item.totalTTC,
      }));
    
    totalHT = items.reduce((sum, item) => sum + item.totalHT, 0);
    totalVAT = -totalHT * 0.2; // Supposons TVA à 20%
    totalTTC = totalHT + totalVAT;
  }
  
  const creditNote: Invoice = {
    id: (mockInvoices.length + 1).toString(),
    number: creditNoteNumber,
    status: 'draft',
    clientId: originalInvoice.clientId,
    clientName: originalInvoice.clientName,
    clientAddress: originalInvoice.clientAddress,
    projectId: originalInvoice.projectId,
    projectName: originalInvoice.projectName,
    projectAddress: originalInvoice.projectAddress,
    issueDate,
    dueDate,
    paymentTerms: 30,
    items,
    notes: `Avoir pour la facture N°${originalInvoice.number}`,
    termsAndConditions: originalInvoice.termsAndConditions,
    totalHT,
    totalVAT,
    totalTTC,
    paidAmount: 0,
    remainingAmount: totalTTC,
    payments: [],
    originalInvoiceId: originalInvoice.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
  };
  
  // Mettre à jour le statut de la facture originale
  const updatedOriginalInvoice = {
    ...originalInvoice,
    status: 'cancelled_by_credit_note' as InvoiceStatus,
    creditNoteId: creditNote.id,
    updatedAt: new Date().toISOString(),
  };
  
  // Dans une vraie application, on sauvegarderait l'avoir et mettrait à jour la facture originale
  mockInvoices.push(creditNote);
  
  // Mettre à jour la facture originale dans le tableau mockInvoices
  const index = mockInvoices.findIndex(inv => inv.id === originalInvoice.id);
  if (index !== -1) {
    mockInvoices[index] = updatedOriginalInvoice;
  }
  
  return creditNote;
};

// Fonction pour enregistrer un paiement
export const recordPayment = (invoiceId: string, payment: Omit<Payment, 'id'>) => {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) return null;
  
  const newPayment: Payment = {
    id: `p${invoice.payments.length + 1}`,
    ...payment,
  };
  
  const paidAmount = invoice.paidAmount + payment.amount;
  const remainingAmount = invoice.totalTTC - paidAmount;
  
  // Déterminer le nouveau statut
  let newStatus: InvoiceStatus = invoice.status;
  if (remainingAmount <= 0) {
    newStatus = 'paid';
  } else if (paidAmount > 0 && remainingAmount > 0) {
    newStatus = 'partially_paid';
  }
  
  const updatedInvoice: Invoice = {
    ...invoice,
    status: newStatus,
    paidAmount,
    remainingAmount,
    payments: [...invoice.payments, newPayment],
    updatedAt: new Date().toISOString(),
  };
  
  // Mettre à jour la facture dans le tableau mockInvoices
  const index = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (index !== -1) {
    mockInvoices[index] = updatedInvoice;
  }
  
  return updatedInvoice;
};

// Fonction pour valider une facture (passer de brouillon à émise)
export const validateInvoice = (invoiceId: string) => {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice || invoice.status !== 'draft') return null;
  
  // Générer un numéro de facture définitif
  const lastInvoiceNumber = mockInvoices
    .filter(inv => inv.number.startsWith('FAC-'))
    .sort((a, b) => b.number.localeCompare(a.number))[0]?.number || 'FAC-2025-000';
  
  const lastNumber = parseInt(lastInvoiceNumber.split('-')[2]);
  const newNumber = `FAC-2025-${(lastNumber + 1).toString().padStart(3, '0')}`;
  
  const updatedInvoice: Invoice = {
    ...invoice,
    number: newNumber,
    status: 'sent',
    updatedAt: new Date().toISOString(),
  };
  
  // Mettre à jour la facture dans le tableau mockInvoices
  const index = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (index !== -1) {
    mockInvoices[index] = updatedInvoice;
  }
  
  return updatedInvoice;
};