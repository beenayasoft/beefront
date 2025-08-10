import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  Building,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { OpportunityForm } from "@/features/crm/components/opportunities/OpportunityForm";
import { OpportunityLossForm } from "@/features/crm/components/opportunities/OpportunityLossForm";
import { Opportunity, OpportunityStatus, LossReason } from "@/features/crm/types/opportunities.types";
import { opportunitiesApi } from "@/features/crm/api/opportunities";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { syncService, useSyncListener } from "@/lib/services/syncService";

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [lossFormOpen, setLossFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 🏷️ Titre dynamique basé sur le nom de l'opportunité
  const pageTitle = opportunity ? `${opportunity.name}` : 'Détail opportunité';
  usePageTitle(pageTitle);

  // ✅ NOUVELLE FONCTION : Rechargement de l'opportunité
  const reloadOpportunity = async () => {
    if (!id) return;

    try {
      console.log(`🔄 Rechargement de l'opportunité ${id}...`);
      const opportunityData = await opportunitiesApi.getOpportunity(id);
      
      if (opportunityData) {
        setOpportunity(opportunityData);
        console.log(`✅ Opportunité ${id} rechargée avec succès:`, opportunityData);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du rechargement:`, error);
    }
  };

  // ✅ SYNCHRONISATION AUTOMATIQUE : Écouter tous les changements liés à cette opportunité
  useSyncListener('opportunity_updated', id || '', (event) => {
    console.log(`🔄 Synchronisation automatique opportunité ${id}:`, event);
    reloadOpportunity(); // Recharger silencieusement
    
    if (event.action === 'quote_sent') {
      toast({
        title: "Statut mis à jour",
        description: "L'opportunité est maintenant en négociation",
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  // ✅ ÉCOUTER LES CHANGEMENTS DE DEVIS ASSOCIÉS
  useSyncListener('quote_created', '*', (event) => {
    if (event.relatedEntityId === id) {
      console.log(`📄 Nouveau devis créé pour l'opportunité ${id}:`, event);
      reloadOpportunity(); // Recharger pour afficher le nouveau devis
      toast({
        title: "Nouveau devis",
        description: "Un devis a été créé pour cette opportunité",
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  useSyncListener('quote_status_changed', '*', (event) => {
    if (event.relatedEntityId === id) {
      console.log(`📄 Statut devis modifié pour l'opportunité ${id}:`, event);
      reloadOpportunity(); // Recharger pour afficher le nouveau statut
      
      const statusLabels = {
        'sent': 'envoyé',
        'accepted': 'accepté',
        'rejected': 'refusé',
        'cancelled': 'annulé'
      };
      
      const statusLabel = statusLabels[event.action as keyof typeof statusLabels] || event.action;
      toast({
        title: "Devis mis à jour",
        description: `Un devis associé a été ${statusLabel}`,
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  useSyncListener('quote_deleted', '*', (event) => {
    if (event.relatedEntityId === id) {
      console.log(`📄 Devis supprimé pour l'opportunité ${id}:`, event);
      reloadOpportunity(); // Recharger pour retirer le devis supprimé
      toast({
        title: "Devis supprimé",
        description: "Un devis associé a été supprimé",
        duration: 3000
      });
    }
  }, [id, reloadOpportunity]);

  // Charger les données de l'opportunité
  useEffect(() => {
    const loadOpportunity = async () => {
      if (!id) {
        setError("ID d'opportunité manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Chargement de l'opportunité ${id}...`);
        const opportunityData = await opportunitiesApi.getOpportunity(id);
        
        if (opportunityData) {
          setOpportunity(opportunityData);
          console.log(`✅ Opportunité ${id} chargée avec succès:`, opportunityData);
        } else {
          throw new Error("Opportunité non trouvée");
        }
      } catch (error: any) {
        console.error(`❌ Erreur lors du chargement de l'opportunité ${id}:`, error);
        
        if (error?.response?.status === 404) {
          setError("Opportunité non trouvée");
        } else if (error?.response?.status === 401) {
          setError("Non autorisé à accéder à cette opportunité");
        } else if (error?.response?.status === 403) {
          setError("Accès refusé à cette opportunité");
        } else {
          setError(error instanceof Error ? error.message : "Erreur lors du chargement");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOpportunity();
  }, [id]);

  // Gérer l'édition de l'opportunité
  const handleEdit = () => {
    setFormDialogOpen(true);
  };

  // Gérer la suppression de l'opportunité
  const handleDelete = () => {
    if (!opportunity) return;
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression de l'opportunité
  const confirmDelete = async () => {
    if (!opportunity || deleteLoading) return;
    
    try {
      setDeleteLoading(true);
      console.log(`🗑️ Suppression de l'opportunité ${opportunity.id}...`);
      await opportunitiesApi.deleteOpportunity(opportunity.id);
      
      toast({
        title: "Opportunité supprimée",
        description: "L'opportunité a été supprimée avec succès",
      });
      console.log(`✅ Opportunité ${opportunity.id} supprimée`);
      setDeleteDialogOpen(false);
      navigate("/opportunities");
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'opportunité ${opportunity.id}:`, error);
      toast({
        title: "Erreur de suppression",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'opportunité",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Gérer la création d'un devis
  const handleCreateQuote = async () => {
    if (!opportunity) return;
    
    try {
      console.log(`📄 Redirection vers création de devis pour l'opportunité ${opportunity.id}...`);
      // TODO: Implémenter createQuote dans opportunitiesApi quand le endpoint sera disponible
      navigate(`/quotes/new?opportunityId=${opportunity.id}&tierId=${opportunity.tierId}`);
      
      toast({
        title: "Redirection",
        description: "Redirection vers la création de devis",
      });
    } catch (error) {
      console.error(`❌ Erreur lors de la redirection:`, error);
      toast({
        title: "Erreur",
        description: "Impossible d'accéder à la création de devis",
        variant: "destructive",
      });
    }
  };

  // Marquer comme gagnée
  const handleMarkAsWon = async () => {
    if (!opportunity) return;
    
    try {
      console.log(`🎉 Marquage de l'opportunité ${opportunity.id} comme gagnée...`);
      const updatedOpportunity = await opportunitiesApi.markAsWon(opportunity.id);
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        toast({
          title: "Opportunité gagnée",
          description: "L'opportunité a été marquée comme gagnée",
        });
        console.log(`✅ Opportunité ${opportunity.id} marquée comme gagnée`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du marquage comme gagnée:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de marquer l'opportunité comme gagnée",
        variant: "destructive",
      });
    }
  };

  // Marquer comme perdue
  const handleMarkAsLost = () => {
    setLossFormOpen(true);
  };

  // Confirmer la perte
  const handleConfirmLoss = async (data: { lossReason: LossReason; lossDescription?: string }) => {
    if (!opportunity) return;
    
    try {
      console.log(`❌ Marquage de l'opportunité ${opportunity.id} comme perdue...`);
      const updatedOpportunity = await opportunitiesApi.markAsLost(opportunity.id, {
        loss_reason: data.lossReason,
        loss_description: data.lossDescription,
      });
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        setLossFormOpen(false);
        toast({
          title: "Opportunité perdue",
          description: "L'opportunité a été marquée comme perdue",
        });
        console.log(`✅ Opportunité ${opportunity.id} marquée comme perdue`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors du marquage comme perdue:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de marquer l'opportunité comme perdue",
        variant: "destructive",
      });
    }
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = async (formData: Partial<Opportunity>) => {
    if (!opportunity) return;
    
    try {
      console.log(`📝 Mise à jour de l'opportunité ${opportunity.id}...`);
      const updatedOpportunity = await opportunitiesApi.updateOpportunity(opportunity.id, formData);
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        setFormDialogOpen(false);
        toast({
          title: "Opportunité mise à jour",
          description: "Les modifications ont été enregistrées",
        });
        console.log(`✅ Opportunité ${opportunity.id} mise à jour`);
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour:`, error);
      toast({
        title: "Erreur de mise à jour",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour l'opportunité",
        variant: "destructive",
      });
    }
  };

  // Obtenir le badge de statut selon le style Beenaya
  const getStageBadge = (stage: OpportunityStatus) => {
    switch (stage) {
      case 'new':
        return <Badge variant="secondary" className="bg-blue-100 border border-blue-300 text-blue-800 font-semibold">Nouvelle</Badge>;
      case 'needs_analysis':
        return <Badge variant="secondary" className="bg-purple-100 border border-purple-300 text-purple-800 font-semibold">Analyse</Badge>;
      case 'negotiation':
        return <Badge variant="secondary" className="bg-amber-100 border border-amber-300 text-amber-800 font-semibold">Négociation</Badge>;
      case 'won':
        return <Badge variant="secondary" className="bg-green-100 border border-green-300 text-green-800 font-semibold">Gagnée</Badge>;
      case 'lost':
        return <Badge variant="secondary" className="bg-red-100 border border-red-300 text-red-800 font-semibold">Perdue</Badge>;
      default:
        return <Badge variant="secondary" className="bg-neutral-100 border border-neutral-300 text-neutral-800 font-semibold">—</Badge>;
    }
  };

  // Formater la date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-Beenaya-600 mx-auto"></div>
          <p className="mt-4">Chargement de l'opportunité...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-4" />
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="p-6">
        <div className="Beenaya-card p-8 text-center">
          <p>Aucune opportunité trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header style Beenaya */}
        <div className="Beenaya-card Beenaya-gradient text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white/20 border border-white/30 hover:bg-white/30"
                onClick={() => navigate("/opportunities")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 border border-white/30 rounded-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{opportunity.name}</h1>
                    <Badge variant="secondary" className="bg-white/20 border border-white/30 text-white">
                      Opportunité
                    </Badge>
                    {getStageBadge(opportunity.stage)}
                  </div>
                  <p className="text-white/80 mt-1">
                    {opportunity.tierName || 'Client non défini'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="bg-white/20 border border-white/30 hover:bg-white/30 text-white"
                onClick={handleEdit}
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 text-white"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Layout principal selon TierDetail */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenu principal - 3 colonnes */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-Beenaya-600" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 mb-2">Identification</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Nom</div>
                          <div className="font-bold">{opportunity.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Client</div>
                          <div className="font-bold">{opportunity.tierName || 'Non défini'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Statut</div>
                          <div>{getStageBadge(opportunity.stage)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 mb-2">Source et assignation</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Source</div>
                          <div className="font-bold">{opportunity.source || 'Non définie'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-neutral-600 mb-1">Assigné à</div>
                          <div className="font-bold">{opportunity.assignedToName || 'Non assigné'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {opportunity.description && (
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Description</h4>
                    <p className="text-neutral-700 bg-neutral-50 p-3 rounded-lg">
                      {opportunity.description}
                    </p>
                  </div>
                )}

                {/* Informations spécifiques aux opportunités perdues */}
                {opportunity.stage === 'lost' && opportunity.lossReason && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-red-600 mb-2">Informations de perte</h4>
                    <div className="bg-red-50 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-red-600">Raison</span>
                        <span className="font-medium text-red-800">{opportunity.lossReason}</span>
                      </div>
                      {opportunity.lossDescription && (
                        <div>
                          <span className="text-red-600 block mb-1">Description</span>
                          <p className="text-red-800">{opportunity.lossDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations financières séparées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-Beenaya-600" />
                  Informations financières
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Montant estimé</h4>
                    <div className="text-2xl font-bold text-Beenaya-600">
                      {formatCurrency(opportunity.estimatedAmount || 0)} MAD
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Probabilité</h4>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{opportunity.probability || 0}%</div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (opportunity.probability || 0) >= 75 ? "bg-green-500" :
                            (opportunity.probability || 0) >= 50 ? "bg-blue-500" :
                            (opportunity.probability || 0) >= 25 ? "bg-amber-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${opportunity.probability || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Montant pondéré</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency((opportunity.estimatedAmount || 0) * (opportunity.probability || 0) / 100)} MAD
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      Valeur attendue
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-neutral-500 mb-2">Dates importantes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-neutral-600 text-sm">Date de clôture prévue</span>
                      <div className="font-medium">{formatDate(opportunity.expectedCloseDate)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-600 text-sm">Créé le</span>
                      <div className="font-medium">{formatDate(opportunity.createdAt)}</div>
                    </div>
                    {opportunity.closedAt && (
                      <div>
                        <span className="text-neutral-600 text-sm">Fermé le</span>
                        <div className="font-medium">{formatDate(opportunity.closedAt)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panneau latéral - 1 colonne */}
          <div className="space-y-6">
            {/* Résumé */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Statut:</span>
                    {getStageBadge(opportunity.stage)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Client:</span>
                    <span className="font-medium">{opportunity.tierName || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Source:</span>
                    <span className="font-medium">{opportunity.source || 'Non définie'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Assigné à:</span>
                    <span className="font-medium">{opportunity.assignedToName || 'Non assigné'}</span>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-2">
                      <div>
                        <span className="text-neutral-500 text-xs">Créé le:</span>
                        <div className="font-medium text-sm">
                          {formatDate(opportunity.createdAt)}
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-500 text-xs">Clôture prévue:</span>
                        <div className="font-medium text-sm">
                          {formatDate(opportunity.expectedCloseDate)}
                        </div>
                      </div>
                      {opportunity.closedAt && (
                        <div>
                          <span className="text-neutral-500 text-xs">Fermé le:</span>
                          <div className="font-medium text-sm">
                            {formatDate(opportunity.closedAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-Beenaya-600" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunity.stage !== 'won' && opportunity.stage !== 'lost' ? (
                  <>
                    <Button 
                      className="w-full justify-start Beenaya-button-primary"
                      onClick={handleCreateQuote}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Créer un devis
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                      onClick={handleMarkAsWon}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer comme gagnée
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                      onClick={handleMarkAsLost}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Marquer comme perdue
                    </Button>
                  </>
                ) : (
                  <div className={`p-4 rounded-lg text-center ${
                    opportunity.stage === 'won' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {opportunity.stage === 'won' ? (
                      <>
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                        <p className="font-medium">Opportunité gagnée</p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                        <p className="font-medium">Opportunité perdue</p>
                      </>
                    )}
                  </div>
                )}

                {/* Lien vers le client */}
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate(`/tiers/${opportunity.tierId}`)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Voir la fiche client
                </Button>
              </CardContent>
            </Card>

            {/* Chronologie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-Beenaya-600" />
                  Chronologie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Événement de création */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Opportunité créée</div>
                      <div className="text-xs text-neutral-500">
                        {formatDate(opportunity.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Changements de statut (placeholder) */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        Statut actuel: {opportunity.stage === 'new' ? 'Nouvelle' : 
                                        opportunity.stage === 'needs_analysis' ? 'Analyse' :
                                        opportunity.stage === 'negotiation' ? 'Négociation' :
                                        opportunity.stage === 'won' ? 'Gagnée' :
                                        opportunity.stage === 'lost' ? 'Perdue' : opportunity.stage}
                      </div>
                      <div className="text-xs text-neutral-500">En cours</div>
                    </div>
                  </div>

                  {/* Événement de clôture si applicable */}
                  {opportunity.closedAt && (
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        opportunity.stage === 'won' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          Opportunité {opportunity.stage === 'won' ? 'gagnée' : 'fermée'}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {formatDate(opportunity.closedAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Placeholder pour futures intégrations */}
                  <div className="text-center py-4 text-neutral-400">
                    <div className="text-xs">Historique détaillé disponible prochainement</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Formulaires modaux */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full mx-auto overflow-y-auto">
          <OpportunityForm
            opportunity={opportunity}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormDialogOpen(false)}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={lossFormOpen} onOpenChange={setLossFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme perdue</DialogTitle>
            <DialogDescription>
              Indiquez la raison pour laquelle cette opportunité est perdue.
            </DialogDescription>
          </DialogHeader>
          <OpportunityLossForm
            onSubmit={handleConfirmLoss}
            onCancel={() => setLossFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modale de confirmation de suppression - Style cohérent */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="Beenaya-glass">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>"{opportunity?.name}"</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={deleteLoading}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};