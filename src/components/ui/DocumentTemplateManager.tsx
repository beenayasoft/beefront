import React, { useState, useEffect } from 'react';
import { FileTemplate, Plus, Edit, Trash2, Copy, Download, Upload, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useModalState } from '@/hooks/useModalState';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'quote' | 'invoice';
  category: 'standard' | 'custom' | 'premium';
  isDefault: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  author: {
    name: string;
    avatar?: string;
  };
  preview?: string;
  content: {
    header?: {
      logo?: string;
      companyInfo?: string;
      customFields?: Record<string, any>;
    };
    body?: {
      layout: 'standard' | 'detailed' | 'minimal';
      showDescriptions: boolean;
      showImages: boolean;
      groupByCategory: boolean;
    };
    footer?: {
      terms?: string;
      signature?: string;
      customText?: string;
    };
    styling?: {
      primaryColor: string;
      fontFamily: string;
      fontSize: number;
    };
  };
}

interface DocumentTemplateManagerProps {
  documentType?: 'quote' | 'invoice';
  onSelectTemplate?: (template: DocumentTemplate) => void;
  selectedTemplateId?: string;
  allowEdit?: boolean;
  compact?: boolean;
}

export function DocumentTemplateManager({
  documentType,
  onSelectTemplate,
  selectedTemplateId,
  allowEdit = true,
  compact = false
}: DocumentTemplateManagerProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const editModal = useModalState<DocumentTemplate>();
  const createModal = useModalState();
  const previewModal = useModalState<DocumentTemplate>();

  useEffect(() => {
    loadTemplates();
  }, [documentType]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, filterCategory, documentType]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      // Simulation de données - à remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTemplates: DocumentTemplate[] = [
        {
          id: '1',
          name: 'Modèle Standard',
          description: 'Modèle par défaut pour les devis standards',
          type: 'quote',
          category: 'standard',
          isDefault: true,
          isFavorite: false,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          usageCount: 156,
          author: { name: 'Système' },
          content: {
            header: { companyInfo: 'standard' },
            body: { layout: 'standard', showDescriptions: true, showImages: false, groupByCategory: false },
            footer: { terms: 'Conditions générales standard' },
            styling: { primaryColor: '#3b82f6', fontFamily: 'Arial', fontSize: 12 }
          }
        },
        {
          id: '2',
          name: 'Devis Détaillé Premium',
          description: 'Modèle complet avec images et descriptions détaillées',
          type: 'quote',
          category: 'premium',
          isDefault: false,
          isFavorite: true,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-10'),
          usageCount: 89,
          author: { name: 'Jean Dupont' },
          content: {
            header: { logo: 'enabled', companyInfo: 'detailed' },
            body: { layout: 'detailed', showDescriptions: true, showImages: true, groupByCategory: true },
            footer: { terms: 'CGV détaillées', signature: 'enabled' },
            styling: { primaryColor: '#10b981', fontFamily: 'Helvetica', fontSize: 11 }
          }
        },
        {
          id: '3',
          name: 'Facture Minimaliste',
          description: 'Modèle simple et épuré pour les factures',
          type: 'invoice',
          category: 'custom',
          isDefault: false,
          isFavorite: false,
          createdAt: new Date('2024-01-25'),
          updatedAt: new Date('2024-02-05'),
          usageCount: 67,
          author: { name: 'Marie Martin' },
          content: {
            header: { companyInfo: 'minimal' },
            body: { layout: 'minimal', showDescriptions: false, showImages: false, groupByCategory: false },
            footer: { customText: 'Merci pour votre confiance' },
            styling: { primaryColor: '#6366f1', fontFamily: 'Roboto', fontSize: 10 }
          }
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filtrer par type de document
    if (documentType) {
      filtered = filtered.filter(t => t.type === documentType);
    }

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const handleToggleFavorite = async (templateId: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
    ));
  };

  const handleSetDefault = async (templateId: string) => {
    setTemplates(prev => prev.map(t => ({
      ...t,
      isDefault: t.id === templateId
    })));
  };

  const handleDuplicateTemplate = async (template: DocumentTemplate) => {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `${template.id}_copy_${Date.now()}`,
      name: `${template.name} (Copie)`,
      isDefault: false,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      author: { name: 'Utilisateur actuel' }
    };

    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'standard': return '📋';
      case 'premium': return '⭐';
      case 'custom': return '🎨';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'custom': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <Label>Modèle de document</Label>
        <Select
          value={selectedTemplateId}
          onValueChange={(value) => {
            const template = templates.find(t => t.id === value);
            if (template && onSelectTemplate) {
              onSelectTemplate(template);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent>
            {filteredTemplates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                <div className="flex items-center gap-2">
                  <span>{getCategoryIcon(template.category)}</span>
                  <span>{template.name}</span>
                  {template.isDefault && <Badge variant="secondary" className="text-xs">Défaut</Badge>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Modèles de Documents</h3>
          <p className="text-sm text-gray-600">
            Gérez vos modèles de {documentType === 'quote' ? 'devis' : 'factures'}
          </p>
        </div>
        {allowEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
            <Dialog open={createModal.isOpen} onOpenChange={(open) => open ? createModal.actions.open() : createModal.actions.close()}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau modèle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer un nouveau modèle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du modèle</Label>
                      <Input placeholder="Nom du modèle" />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Personnalisé</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Description du modèle" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={createModal.actions.close}>
                      Annuler
                    </Button>
                    <Button>Créer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="custom">Personnalisé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des modèles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplateId === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">Défaut</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getCategoryColor(template.category)}>
                        {getCategoryIcon(template.category)} {template.category}
                      </Badge>
                      {template.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                  
                  {allowEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <FileTemplate className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          previewModal.actions.open(template);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          editModal.actions.open(template);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(template);
                        }}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(template.id);
                        }}>
                          <Star className="h-4 w-4 mr-2" />
                          {template.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        </DropdownMenuItem>
                        {!template.isDefault && (
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(template.id);
                          }}>
                            <Badge className="h-4 w-4 mr-2" />
                            Définir par défaut
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          // Export template
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Exporter
                        </DropdownMenuItem>
                        {template.category === 'custom' && (
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Utilisé {template.usageCount} fois</span>
                  <span>Par {template.author.name}</span>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Modifié le {template.updatedAt.toLocaleDateString('fr-FR')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileTemplate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun modèle trouvé</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-1">
                Essayez un autre terme de recherche
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}