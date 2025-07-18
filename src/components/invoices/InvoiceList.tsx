import { useState } from "react";
import { Eye, Edit, Trash2, Send, CheckCircle, XCircle, Download, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Invoice, InvoiceStatus } from "@/lib/types/invoice";
import { formatCurrency } from "@/lib/utils";

interface InvoiceListProps {
  invoices: Invoice[];
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onCreateCreditNote?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices,
  onView,
  onEdit,
  onDelete,
  onSend,
  onRecordPayment,
  onCreateCreditNote,
  onDownload,
}: InvoiceListProps) {
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <div className="w-2 h-2 bg-neutral-400 rounded-full"></div>
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="benaya-badge-primary gap-1">
            <Send className="w-3 h-3" />
            Émise
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="benaya-badge-error gap-1">
            <AlertCircle className="w-3 h-3" />
            En retard
          </Badge>
        );
      case "partially_paid":
        return (
          <Badge className="benaya-badge-warning gap-1">
            <Clock className="w-3 h-3" />
            Partiellement payée
          </Badge>
        );
      case "paid":
        return (
          <Badge className="benaya-badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Payée
          </Badge>
        );
      case "cancelled":
      case "cancelled_by_credit_note":
        return (
          <Badge className="benaya-badge-neutral gap-1">
            <XCircle className="w-3 h-3" />
            Annulée
          </Badge>
        );
      default:
        return <Badge className="benaya-badge-neutral">—</Badge>;
    }
  };

  return (
    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <Table className="benaya-table">
        <TableHeader>
          <TableRow>
            <TableHead>STATUT</TableHead>
            <TableHead>NUMÉRO</TableHead>
            <TableHead>CLIENT</TableHead>
            <TableHead>PROJET</TableHead>
            <TableHead>DATE ÉMISSION</TableHead>
            <TableHead>DATE ÉCHÉANCE</TableHead>
            <TableHead>TOTAL TTC</TableHead>
            <TableHead>RESTANT DÛ</TableHead>
            <TableHead className="w-[100px]">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-neutral-500">
                Aucune facture trouvée
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell className="font-medium">{invoice.number}</TableCell>
                <TableCell>
                  <Badge className="benaya-badge-primary text-xs">
                    {invoice.clientName}
                  </Badge>
                </TableCell>
                <TableCell>{invoice.projectName || "—"}</TableCell>
                <TableCell>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    {invoice.status === "overdue" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(invoice.totalTTC)} MAD
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(invoice.remainingAmount)} MAD
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Actions</span>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                        >
                          <path
                            d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                            fill="currentColor"
                            fillRule="evenodd"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="benaya-glass">
                      <DropdownMenuItem onClick={() => onView && onView(invoice)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      
                      {invoice.status === "draft" && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit && onEdit(invoice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend && onSend(invoice)}>
                            <Send className="mr-2 h-4 w-4" />
                            Valider et envoyer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete && onDelete(invoice)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {(invoice.status === "sent" || invoice.status === "overdue" || invoice.status === "partially_paid") && (
                        <>
                          <DropdownMenuItem onClick={() => onRecordPayment && onRecordPayment(invoice)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Enregistrer un paiement
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCreateCreditNote && onCreateCreditNote(invoice)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Créer un avoir
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {invoice.status !== "draft" && (
                        <DropdownMenuItem onClick={() => onDownload && onDownload(invoice)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}