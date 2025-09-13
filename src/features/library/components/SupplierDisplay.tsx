/**
 * Composant SupplierDisplay - Affichage enrichi d'un fournisseur avec intégration CRM
 * Gère l'affichage des fournisseurs legacy et CRM de manière transparente
 */

import React from 'react';
import { 
  Building, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle,
  Info,
  Loader2 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { useSupplierDetails } from '../hooks/useSupplierIntegration';
import {
  SupplierDisplayProps,
  hasCRMSupplier,
  formatSupplierDisplay
} from '../types/supplier-contracts';

export function SupplierDisplay({
  material,
  showDetails = true,
  showContactInfo = true,
  showActions = true,
  onViewInCRM,
  className
}: SupplierDisplayProps & { className?: string }) {
  // Hook pour récupérer les détails CRM si nécessaire
  const {
    data: supplierDetails,
    isLoading,
    error
  } = useSupplierDetails(material.supplier_id);

  // Déterminer les données à afficher
  const displayData = React.useMemo(() => {
    // Si on a des détails CRM complets (direct ou via hook)
    if (material.supplier_details || supplierDetails) {
      const details = material.supplier_details || supplierDetails!;
      return {
        type: 'crm' as const,
        name: details.nom,
        siret: details.siret,
        numero_tva: details.numero_tva || details.tva,
        email: details.email,
        telephone: details.telephone,
        adresse: details.adresse,
        code_postal: details.adresse?.code_postal || details.code_postal,
        ville: details.adresse?.ville || details.ville,
        pays: details.adresse?.pays || details.pays,
        site_web: details.site_web,
        id: details.id
      };
    }
    
    // Fallback : si on a un supplier_id mais pas encore de détails
    if (material.supplier_id) {
      return {
        type: 'crm' as const,
        name: `Fournisseur CRM`,
        id: material.supplier_id
      };
    }

    return null;
  }, [material, supplierDetails]);

  // Gestion du loading
  if (material.supplier_id && isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Fournisseur
            <Loader2 className="w-4 h-4 animate-spin ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  // Aucun fournisseur
  if (!displayData) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-muted-foreground" />
            Fournisseur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="w-4 h-4" />
            <span className="text-sm">Aucun fournisseur assigné</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Erreur de chargement CRM
  if (error && material.supplier_id) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Fournisseur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Impossible de charger les détails du fournisseur.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Fournisseur
          
          {displayData.type === 'crm' && (
            <Badge variant="secondary" className="ml-auto">
              CRM
            </Badge>
          )}
        </CardTitle>
        
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Nom du fournisseur */}
        <div>
          <h3 className="font-semibold text-lg">{displayData.name}</h3>
          
          {/* Informations d'identification */}
          {displayData.type === 'crm' && (
            <div className="flex flex-wrap gap-2 mt-1">
              {displayData.siret && (
                <Badge variant="outline" className="text-xs">
                  SIRET: {displayData.siret}
                </Badge>
              )}
              {displayData.numero_tva && (
                <Badge variant="outline" className="text-xs">
                  TVA: {displayData.numero_tva}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Détails étendus pour fournisseurs CRM */}
        {displayData.type === 'crm' && showDetails && (
          <div className="space-y-3">
            {/* Informations de contact */}
            {showContactInfo && (displayData.email || displayData.telephone) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Contact</h4>
                <div className="flex flex-col gap-1">
                  {displayData.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${displayData.email}`}
                        className="hover:underline"
                      >
                        {displayData.email}
                      </a>
                    </div>
                  )}
                  {displayData.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={`tel:${displayData.telephone}`}
                        className="hover:underline"
                      >
                        {displayData.telephone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Adresse */}
            {(displayData.adresse || displayData.ville) && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Adresse</h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex flex-col">
                    {displayData.adresse && typeof displayData.adresse === 'object' ? (
                      <span>{displayData.adresse.rue}</span>
                    ) : displayData.adresse && typeof displayData.adresse === 'string' ? (
                      <span>{displayData.adresse}</span>
                    ) : null}
                    <div className="flex gap-1">
                      {displayData.code_postal && <span>{displayData.code_postal}</span>}
                      {displayData.ville && <span>{displayData.ville}</span>}
                    </div>
                    {displayData.pays && displayData.pays !== 'FR' && (
                      <span className="text-muted-foreground">{displayData.pays}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Site web */}
            {displayData.site_web && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Site web</h4>
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href={displayData.site_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {displayData.site_web}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {displayData.type === 'crm' && onViewInCRM && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewInCRM(displayData.id)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Voir dans CRM
              </Button>
            )}
            
            {displayData.type === 'crm' && displayData.email && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={`mailto:${displayData.email}?subject=Demande de devis`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter
                </a>
              </Button>
            )}
            
          </div>
        )}
      </CardContent>
    </Card>
  );
}