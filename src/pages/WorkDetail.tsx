import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  BarChart3,
  FileText,
  Calculator,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Work } from "@/lib/types/workLibrary";
import { libraryApi } from "@/lib/api/library";
import { LibraryItemForm } from "@/components/quotes/library/LibraryItemForm";
import { formatCurrency } from "@/lib/utils";

export default function WorkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadWork(id);
    }
  }, [id]);

  const loadWork = async (workId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryApi.getWork(workId);
      setWork(data);
    } catch (err) {
      console.error("Erreur lors du chargement de l'ouvrage:", err);
      setError("Impossible de charger les détails de l'ouvrage");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedWork: Work) => {
    try {
      if (!work) return;
      
      const saved = await libraryApi.updateWork(work.id, updatedWork);
      setWork(saved);
      setShowEditDialog(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour de l'ouvrage");
    }
  };

  const handleDelete = async () => {
    if (!work || !confirm("Êtes-vous sûr de vouloir supprimer cet ouvrage ?")) return;
    
    try {
      await libraryApi.deleteWork(work.id);
      navigate("/bibliotheque", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de l'ouvrage");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-benaya-600" />
            <div className="text-lg font-medium">Chargement de l'ouvrage...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/bibliotheque")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la bibliothèque
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Ouvrage introuvable"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec navigation et actions intégrées */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/10 hover:bg-white/20"
              onClick={() => navigate("/bibliotheque")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{work.name}</h1>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Ouvrage
                  </Badge>
                  {work.isCustom && (
                    <Badge variant="secondary" className="bg-amber-500/20 text-amber-100">
                      Personnalisé
                    </Badge>
                  )}
                </div>
                <p className="text-benaya-100 mt-1">
                  {work.reference && `Réf: ${work.reference} • `}
                  {formatCurrency(work.recommendedPrice || 0)} par {work.unit}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <LibraryItemForm
                  item={work}
                  type="work"
                  onSave={handleEdit}
                  onCancel={() => setShowEditDialog(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="bg-red-500/10 hover:bg-red-500/20 border-red-300/20 text-red-100 hover:text-white" 
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails généraux */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-benaya-600" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Identification</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Nom</span>
                        <span className="font-medium">{work.name}</span>
                      </div>
                      {work.reference && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Référence</span>
                          <span className="font-mono text-sm">{work.reference}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Type</span>
                        <span>{work.isCustom ? "Personnalisé" : "Standard"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Unité et mesure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Unité</span>
                        <span className="font-medium">{work.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {work.description && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-2">Description</h4>
                  <p className="text-neutral-700 leading-relaxed">{work.description}</p>
                </div>
              )}

              {/* Composants */}
              {work.components && work.components.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-3">Composants</h4>
                  <div className="space-y-2">
                    {work.components.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded">
                            {component.type === 'material' ? (
                              <Package className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Users className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{component.name}</div>
                            <div className="text-sm text-neutral-500">
                              {component.quantity} {component.unit}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(component.unitPrice)}</div>
                          <div className="text-sm text-neutral-500">par {component.unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informations complémentaires */}
        <div className="space-y-6">
          {/* Analyse financière */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-benaya-600" />
                Analyse financière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Coût matériaux</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(work.materialCost || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Coût main d'œuvre</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(work.laborCost || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-neutral-600">Coût total</span>
                    <span className="font-semibold">
                      {formatCurrency(work.totalCost || 0)}
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Prix recommandé</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(work.recommendedPrice || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-neutral-600">Marge</span>
                    <span className="font-medium text-amber-600">
                      {work.margin || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-benaya-600" />
                Résumé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(work.recommendedPrice || 0)}
                  </div>
                  <div className="text-sm text-neutral-500">Prix recommandé</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{work.margin || 0}%</div>
                    <div className="text-xs text-neutral-500">Marge</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-amber-600">{work.unit}</div>
                    <div className="text-xs text-neutral-500">Unité</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rentabilité */}
          {work.recommendedPrice && work.totalCost && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-benaya-600" />
                  Rentabilité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const profit = work.recommendedPrice - work.totalCost;
                    const profitMargin = work.totalCost > 0 ? (profit / work.totalCost) * 100 : 0;
                    
                    return (
                      <>
                        <div className="text-center py-3 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(profit)}
                          </div>
                          <div className="text-sm text-green-500">Bénéfice par unité</div>
                        </div>
                        
                        <div className="text-center py-2">
                          <div className="text-lg font-semibold text-blue-600">
                            {profitMargin.toFixed(1)}%
                          </div>
                          <div className="text-xs text-neutral-500">Marge bénéficiaire</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 