import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  BarChart3,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Labor } from "@/lib/types/workLibrary";
import { libraryApi } from "@/lib/api/library";
import { LibraryItemForm } from "@/components/quotes/library/LibraryItemForm";
import { formatCurrency } from "@/lib/utils";

export default function LaborDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [labor, setLabor] = useState<Labor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (id) {
      loadLabor(id);
    }
  }, [id]);

  const loadLabor = async (laborId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryApi.getLaborItem(laborId);
      setLabor(data);
    } catch (err) {
      console.error("Erreur lors du chargement de la main d'œuvre:", err);
      setError("Impossible de charger les détails de la main d'œuvre");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updatedLabor: Labor) => {
    try {
      if (!labor) return;
      
      const saved = await libraryApi.updateLabor(labor.id, updatedLabor);
      setLabor(saved);
      setShowEditDialog(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Erreur lors de la mise à jour de la main d'œuvre");
    }
  };

  const handleDelete = async () => {
    if (!labor || !confirm("Êtes-vous sûr de vouloir supprimer cette main d'œuvre ?")) return;
    
    try {
      await libraryApi.deleteLabor(labor.id);
      navigate("/bibliotheque", { replace: true });
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      setError("Erreur lors de la suppression de la main d'œuvre");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-benaya-600" />
            <div className="text-lg font-medium">Chargement de la main d'œuvre...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !labor) {
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
            {error || "Main d'œuvre introuvable"}
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
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{labor.name}</h1>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Main d'œuvre
                  </Badge>
                </div>
                <p className="text-benaya-100 mt-1">
                  {labor.category && `${labor.category} • `}
                  {formatCurrency(labor.unitPrice)} par {labor.unit}
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
                  item={labor}
                  type="labor"
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
                        <span className="font-medium">{labor.name}</span>
                      </div>
                      {labor.category && (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Catégorie</span>
                          <span>{labor.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Tarification</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Coût horaire</span>
                        <span className="font-semibold">{formatCurrency(labor.unitPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Unité</span>
                        <span>{labor.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {labor.description && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-500 mb-2">Description</h4>
                  <p className="text-neutral-700 leading-relaxed">{labor.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informations complémentaires */}
        <div className="space-y-6">
          {/* Coût estimé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-benaya-600" />
                Coût estimé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center py-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(labor.unitPrice)}
                    </div>
                    <div className="text-sm text-blue-500">1 heure</div>
                  </div>
                  <div className="text-center py-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(labor.unitPrice * 8)}
                    </div>
                    <div className="text-sm text-green-500">1 jour</div>
                  </div>
                </div>
                
                <div className="text-center py-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(labor.unitPrice * 8 * 5)}
                  </div>
                  <div className="text-sm text-amber-500">1 semaine (5 jours)</div>
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
                    {formatCurrency(labor.unitPrice)}
                  </div>
                  <div className="text-sm text-neutral-500">Coût horaire</div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="font-semibold text-blue-600">{labor.unit}</div>
                    <div className="text-xs text-neutral-500">Unité de mesure</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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