import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreateInvoiceModal,
  CreateInvoiceFromQuoteModal,
  ValidateInvoiceModal,
  DeleteInvoiceModal,
  InvoiceViewModal,
  InvoiceFiltersModal,
  BulkInvoiceActionsModal,
  RecordPaymentModal,
  CreateCreditNoteModal
} from "./";
import { Invoice } from "../../types/invoices.types";

// Exemple d'utilisation complète de toutes les modales de facturation
export function InvoiceModalsDemo() {
  // États pour chaque modale
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [createFromQuoteOpen, setCreateFromQuoteOpen] = useState(false);
  const [validateInvoiceOpen, setValidateInvoiceOpen] = useState(false);
  const [deleteInvoiceOpen, setDeleteInvoiceOpen] = useState(false);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [createCreditNoteOpen, setCreateCreditNoteOpen] = useState(false);

  // Exemple de facture pour les tests
  const mockInvoice: Invoice = {
    id: "inv_001",
    number: "FACT-2024-001",
    status: "sent",
    clientId: "client_001",
    clientName: "Entreprise ABC",
    clientAddress: "123 Rue de la Paix, 10000 Rabat",
    projectId: "project_001",
    projectName: "Rénovation bureau",
    projectAddress: "456 Avenue Mohamed V, 10000 Rabat",
    issueDate: "2024-01-15",
    dueDate: "2024-02-15",
    paymentTerms: 30,
    items: [
      {
        id: "item_001",
        type: "work",
        position: 1,
        designation: "Installation électrique",
        description: "Installation complète du système électrique",
        unit: "forfait",
        quantity: 1,
        unitPrice: 15000,
        vatRate: 20,
        totalHT: 15000,
        totalTTC: 18000
      }
    ],
    notes: "Travaux de qualité supérieure",
    totalHT: 15000,
    totalVAT: 3000,
    totalTTC: 18000,
    paidAmount: 5000,
    remainingAmount: 13000,
    payments: [],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  };

  const mockInvoices = [mockInvoice];
  const mockFilters = {};

  // Configuration des modales avec leurs descriptions
  const modals = [
    {
      title: "1. Créer une facture",
      description: "Création d'une nouvelle facture directe",
      badge: "US 5.2",
      color: "bg-green-50 border-green-200",
      open: createInvoiceOpen,
      setOpen: setCreateInvoiceOpen,
      component: (
        <CreateInvoiceModal
          open={createInvoiceOpen}
          onOpenChange={setCreateInvoiceOpen}
          onSuccess={(invoice) => {
            console.log("Facture créée:", invoice);
          }}
        />
      )
    },
    {
      title: "2. Créer depuis un devis",
      description: "Transformation d'un devis en facture",
      badge: "US 5.1",
      color: "bg-blue-50 border-blue-200",
      open: createFromQuoteOpen,
      setOpen: setCreateFromQuoteOpen,
      component: (
        <CreateInvoiceFromQuoteModal
          open={createFromQuoteOpen}
          onOpenChange={setCreateFromQuoteOpen}
          quote={{ id: "quote_001", number: "DEV-2024-001", clientName: "Entreprise ABC", totalTTC: 18000 }}
          onSuccess={(invoice) => {
            console.log("Facture créée depuis devis:", invoice);
          }}
        />
      )
    },
    {
      title: "3. Valider une facture",
      description: "Validation et émission d'une facture",
      badge: "US 5.3",
      color: "bg-purple-50 border-purple-200",
      open: validateInvoiceOpen,
      setOpen: setValidateInvoiceOpen,
      component: (
        <ValidateInvoiceModal
          open={validateInvoiceOpen}
          onOpenChange={setValidateInvoiceOpen}
          invoice={mockInvoice}
          onSuccess={(invoice) => {
            console.log("Facture validée:", invoice);
          }}
        />
      )
    },
    {
      title: "4. Supprimer une facture",
      description: "Suppression sécurisée avec vérifications",
      badge: "Sécurité",
      color: "bg-red-50 border-red-200",
      open: deleteInvoiceOpen,
      setOpen: setDeleteInvoiceOpen,
      component: (
        <DeleteInvoiceModal
          open={deleteInvoiceOpen}
          onOpenChange={setDeleteInvoiceOpen}
          invoice={mockInvoice}
          onSuccess={() => {
            console.log("Facture supprimée");
          }}
        />
      )
    },
    {
      title: "5. Consulter une facture",
      description: "Vue détaillée avec onglets",
      badge: "Consultation",
      color: "bg-indigo-50 border-indigo-200",
      open: viewInvoiceOpen,
      setOpen: setViewInvoiceOpen,
      component: (
        <InvoiceViewModal
          open={viewInvoiceOpen}
          onOpenChange={setViewInvoiceOpen}
          invoice={mockInvoice}
          onEdit={() => console.log("Modifier")}
          onValidate={() => console.log("Valider")}
          onDelete={() => console.log("Supprimer")}
          onRecordPayment={() => console.log("Paiement")}
          onCreateCreditNote={() => console.log("Avoir")}
        />
      )
    },
    {
      title: "6. Filtres avancés",
      description: "Filtrage et recherche avancée",
      badge: "Recherche",
      color: "bg-yellow-50 border-yellow-200",
      open: filtersOpen,
      setOpen: setFiltersOpen,
      component: (
        <InvoiceFiltersModal
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          currentFilters={mockFilters}
          onApplyFilters={(filters) => {
            console.log("Filtres appliqués:", filters);
          }}
          onSaveFilter={(name, filters) => {
            console.log("Filtre sauvegardé:", name, filters);
          }}
        />
      )
    },
    {
      title: "7. Actions en lot",
      description: "Traitement multiple de factures",
      badge: "Batch",
      color: "bg-orange-50 border-orange-200",
      open: bulkActionsOpen,
      setOpen: setBulkActionsOpen,
      component: (
        <BulkInvoiceActionsModal
          open={bulkActionsOpen}
          onOpenChange={setBulkActionsOpen}
          selectedInvoices={mockInvoices}
          onSuccess={() => {
            console.log("Action en lot terminée");
          }}
        />
      )
    },
    {
      title: "8. Enregistrer un paiement",
      description: "Saisie de paiements avec impact",
      badge: "US 5.4",
      color: "bg-emerald-50 border-emerald-200",
      open: recordPaymentOpen,
      setOpen: setRecordPaymentOpen,
      component: (
        <RecordPaymentModal
          open={recordPaymentOpen}
          onOpenChange={setRecordPaymentOpen}
          invoice={mockInvoice}
          onSuccess={(invoice) => {
            console.log("Paiement enregistré:", invoice);
          }}
        />
      )
    },
    {
      title: "9. Créer un avoir",
      description: "Avoir total ou partiel",
      badge: "US 5.5",
      color: "bg-pink-50 border-pink-200",
      open: createCreditNoteOpen,
      setOpen: setCreateCreditNoteOpen,
      component: (
        <CreateCreditNoteModal
          open={createCreditNoteOpen}
          onOpenChange={setCreateCreditNoteOpen}
          invoice={mockInvoice}
          onSuccess={(creditNote, originalInvoice) => {
            console.log("Avoir créé:", creditNote, originalInvoice);
          }}
        />
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          🧪 Démonstration des Modales de Facturation
        </h1>
        <p className="text-neutral-600">
          Interface complète du module de facturation ERP BTP avec 9 modales fonctionnelles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modals.map((modal, index) => (
          <Card key={index} className={`border-2 ${modal.color} hover:shadow-md transition-all`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {modal.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {modal.badge}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {modal.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => modal.setOpen(true)}
                className="w-full"
                size="sm"
              >
                Ouvrir la modale
              </Button>
            </CardContent>
            {modal.component}
          </Card>
        ))}
      </div>

      {/* Informations techniques */}
      <Card className="bg-neutral-50 border-neutral-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium">📋 Informations techniques</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div><strong>Identité visuelle :</strong> Classes benaya-glass, benaya-600, cards avec headers iconifiés</div>
          <div><strong>Gestion d'état :</strong> Loading states, validation côté client, gestion d'erreur</div>
          <div><strong>API intégration :</strong> Toutes les fonctions API implémentées avec types TypeScript</div>
          <div><strong>UX avancée :</strong> Toast notifications, badges de statut, actions contextuelles</div>
          <div><strong>Accessibilité :</strong> Labels appropriés, navigation clavier, états visuels</div>
        </CardContent>
      </Card>
    </div>
  );
} 