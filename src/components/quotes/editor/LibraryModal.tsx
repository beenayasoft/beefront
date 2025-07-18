import React, { useState, useEffect } from 'react';
import { Search, Plus, Package, Wrench, HardHat, Building } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EditorQuoteItem } from '@/lib/api/quotes';
import { Work, Material, Labor } from '@/lib/types/workLibrary';
import { libraryApi } from '@/lib/api/library';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface LibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: EditorQuoteItem) => void;
}

export function LibraryModal({ open, onOpenChange, onSelect }: LibraryModalProps) {
  const [activeTab, setActiveTab] = useState<'works' | 'materials' | 'labor'>('works');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Données de la bibliothèque
  const [works, setWorks] = useState<Work[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [laborItems, setLaborItems] = useState<Labor[]>([]);

  // Charger les données selon l'onglet actif
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'works':
            if (works.length === 0) {
              const worksData = await libraryApi.getWorks();
              setWorks(worksData);
            }
            break;
          case 'materials':
            if (materials.length === 0) {
              const materialsData = await libraryApi.getMaterials();
              setMaterials(materialsData);
            }
            break;
          case 'labor':
            if (laborItems.length === 0) {
              const laborData = await libraryApi.getLabor();
              setLaborItems(laborData);
            }
            break;
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, activeTab, works.length, materials.length, laborItems.length]);

  // Filtrer les éléments selon la recherche
  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase().trim();
    
    switch (activeTab) {
      case 'works':
        return works.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.reference?.toLowerCase().includes(query)
        );
      case 'materials':
        return materials.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.reference?.toLowerCase().includes(query)
        );
      case 'labor':
        return laborItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
        );
      default:
        return [];
    }
  };

  // Convertir un élément de bibliothèque en EditorQuoteItem
  const convertToQuoteItem = (item: Work | Material | Labor): EditorQuoteItem => {
    const baseItem = {
      id: crypto.randomUUID(),
      position: 0, // Sera mis à jour par le contexte
      designation: item.name,
      description: item.description || '',
      unit: item.unit,
      quantity: 1,
      totalHt: 0, // Sera calculé par le contexte
      totalTtc: 0, // Sera calculé par le contexte
      discount: 0,
    };

    if ('components' in item) {
      // C'est un ouvrage
      return {
        ...baseItem,
        type: 'work',
        reference: item.reference,
        unitPrice: item.recommendedPrice,
        vat_rate: "20", // Valeur par défaut
        margin: item.margin,
        work_id: item.id,
      };
    } else if ('vatRate' in item) {
      // C'est un matériau
      return {
        ...baseItem,
        type: 'product',
        reference: item.reference,
        unitPrice: item.unitPrice,
        vat_rate: item.vatRate.toString(),
      };
    } else {
      // C'est de la main d'œuvre
      return {
        ...baseItem,
        type: 'service',
        unitPrice: item.unitPrice,
        vat_rate: "20", // Valeur par défaut
      };
    }
  };

  // Sélectionner un élément
  const handleSelectItem = (item: Work | Material | Labor) => {
    const quoteItem = convertToQuoteItem(item);
    onSelect(quoteItem);
    onOpenChange(false);
    setSearchQuery('');
  };

  // Rendu du tableau d'ouvrages
  const renderWorksTable = () => {
    const filteredWorks = getFilteredItems() as Work[];
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead>Prix recommandé</TableHead>
            <TableHead>Marge</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-benaya-600"></div>
                  <span className="ml-2">Chargement...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredWorks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                {searchQuery ? 'Aucun ouvrage trouvé' : 'Aucun ouvrage disponible'}
              </TableCell>
            </TableRow>
          ) : (
            filteredWorks.map((work) => (
              <TableRow key={work.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <TableCell className="font-mono text-xs">
                  {work.reference || '—'}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{work.name}</div>
                    {work.description && (
                      <div className="text-xs text-neutral-600">{work.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{work.unit}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(work.recommendedPrice)} MAD
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={work.margin < 15 ? "destructive" : work.margin < 25 ? "secondary" : "default"}
                    className="text-xs"
                  >
                    {work.margin.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleSelectItem(work)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  // Rendu du tableau de matériaux
  const renderMaterialsTable = () => {
    const filteredMaterials = getFilteredItems() as Material[];
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Référence</TableHead>
            <TableHead>Désignation</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead>TVA</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-benaya-600"></div>
                  <span className="ml-2">Chargement...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredMaterials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                {searchQuery ? 'Aucun matériau trouvé' : 'Aucun matériau disponible'}
              </TableCell>
            </TableRow>
          ) : (
            filteredMaterials.map((material) => (
              <TableRow key={material.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <TableCell className="font-mono text-xs">
                  {material.reference || '—'}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{material.name}</div>
                    {material.description && (
                      <div className="text-xs text-neutral-600">{material.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(material.unitPrice)} MAD
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {material.vatRate}%
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleSelectItem(material)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  // Rendu du tableau de main d'œuvre
  const renderLaborTable = () => {
    const filteredLabor = getFilteredItems() as Labor[];
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Désignation</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead>Prix unitaire</TableHead>
            <TableHead className="w-[100px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-benaya-600"></div>
                  <span className="ml-2">Chargement...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : filteredLabor.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                {searchQuery ? 'Aucune main d\'œuvre trouvée' : 'Aucune main d\'œuvre disponible'}
              </TableCell>
            </TableRow>
          ) : (
            filteredLabor.map((labor) => (
              <TableRow key={labor.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                <TableCell>
                  <div>
                    <div className="font-medium">{labor.name}</div>
                    {labor.description && (
                      <div className="text-xs text-neutral-600">{labor.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{labor.unit}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(labor.unitPrice)} MAD
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleSelectItem(labor)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Ajouter depuis la bibliothèque
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un élément depuis votre bibliothèque d'ouvrages, matériaux ou main d'œuvre.
          </DialogDescription>
        </DialogHeader>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom, référence ou description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Onglets et contenu */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="works" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Ouvrages
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Matériaux
            </TabsTrigger>
            <TabsTrigger value="labor" className="flex items-center gap-2">
              <HardHat className="w-4 h-4" />
              Main d'œuvre
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <TabsContent value="works" className="h-full overflow-auto mt-0 p-0">
              {renderWorksTable()}
            </TabsContent>

            <TabsContent value="materials" className="h-full overflow-auto mt-0 p-0">
              {renderMaterialsTable()}
            </TabsContent>

            <TabsContent value="labor" className="h-full overflow-auto mt-0 p-0">
              {renderLaborTable()}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 