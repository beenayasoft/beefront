/**
 * Fiche détaillée d'un devis - Design basé sur Fiche devis.png
 * Utilise les nouveaux types corrigés de la Phase 1
 */
import React from 'react';
import { ArrowLeft, Download, Copy, Edit, Send, Calendar, User, Building, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Quote, QuoteStatus } from '../../types/quotes.types';
import { cn } from '@/lib/utils';
import { QuoteItemsTable } from './QuoteItemsTable';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { QuoteActions } from './QuoteActions';

interface QuoteDetailCardProps {
  quote: Quote;
  onBack?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onDuplicate?: () => void;
  onDownloadPdf?: () => void;
  className?: string;
}

/**
 * Formate un montant en MAD
 */
const formatAmount = (amount: number): string => {
  return `${amount.toFixed(2)} MAD`;
};

/**
 * Formate une date pour l'affichage
 */
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR');
};

/**
 * Retourne la couleur du statut
 */
const getStatusColor = (status: QuoteStatus): string => {
  switch (status) {
    case 'draft': return 'bg-slate-500';
    case 'sent': return 'bg-blue-500';
    case 'accepted': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    case 'expired': return 'bg-orange-500';
    case 'cancelled': return 'bg-gray-500';
    default: return 'bg-slate-500';
  }
};

/**
 * Composant principal de la fiche devis
 */
export const QuoteDetailCard: React.FC<QuoteDetailCardProps> = ({
  quote,
  onBack,
  onEdit,
  onSend,
  onDuplicate,
  onDownloadPdf,
  className
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec numéro, statut et total */}
      <Card className="bg-slate-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="text-white hover:bg-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{quote.number}</h1>
                <Badge className={cn("text-white", getStatusColor(quote.status))}>
                  {quote.statusDisplay || quote.status}
                </Badge>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-slate-300">Total TTC</p>
              <p className="text-2xl font-bold">{formatAmount(quote.totalTtc)}</p>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-slate-300">
            <span>Client: {quote.clientName}</span>
            {quote.projectName && (
              <>
                <span className="mx-2">•</span>
                <span>Projet: {quote.projectName}</span>
              </>
            )}
            {quote.opportunityId && (
              <>
                <span className="mx-2">•</span>
                <span>Opportunité normale</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Contenu principal */}
        <div className="lg:col-span-3 space-y-6">
          {/* Informations Client et Projet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <User className="h-4 w-4" />
                  <span>Client</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{quote.clientName}</p>
                  {quote.clientAddress && (
                    <p className="text-sm text-slate-600">{quote.clientAddress}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Projet */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Building className="h-4 w-4" />
                  <span>Projet</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{quote.projectName || 'Non défini'}</p>
                  {quote.projectAddress && (
                    <p className="text-sm text-slate-600">{quote.projectAddress}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dates et Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Calendar className="h-4 w-4" />
                  <span>Dates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Date d'émission</p>
                    <p className="text-sm">{formatDate(quote.issueDate)}</p>
                  </div>
                  {quote.expiryDate && (
                    <div>
                      <p className="text-sm font-medium text-slate-600">Date d'expiration</p>
                      <p className="text-sm">{formatDate(quote.expiryDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <Info className="h-4 w-4" />
                  <span>Informations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Validité</p>
                    <p className="text-sm">{quote.validityPeriod || 30} jours</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Créé le</p>
                    <p className="text-sm">{formatDate(quote.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détail du devis */}
          <Card>
            <CardHeader>
              <CardTitle>Détail du devis</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteItemsTable items={quote.items || []} />
              
              {/* Totaux */}
              <div className="mt-6 space-y-2">
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-right">
                  <div></div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Total HT:</span>
                      <span>{formatAmount(quote.totalHt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total TVA:</span>
                      <span>{formatAmount(quote.totalVat)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total TTC:</span>
                      <span>{formatAmount(quote.totalTtc)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panneau d'actions à droite */}
        <div className="space-y-6">
          {/* Statut et actions */}
          <Card>
            <CardHeader>
              <CardTitle>Statut et actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Statut actuel</p>
                <QuoteStatusBadge status={quote.status} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total HT:</span>
                  <span>{formatAmount(quote.totalHt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA:</span>
                  <span>{formatAmount(quote.totalVat)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total TTC:</span>
                  <span className="text-lg">{formatAmount(quote.totalTtc)}</span>
                </div>
              </div>

              <QuoteActions
                quote={quote}
                onSend={onSend}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDownloadPdf={onDownloadPdf}
              />
            </CardContent>
          </Card>

          {/* Résumé */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Éléments:</span>
                <span>{quote.itemsCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Validité:</span>
                <span>{quote.validityPeriod || 30} jours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Créé par:</span>
                <span className="text-right">{quote.createdBy || 'elvisiex@live.fr'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailCard;