import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Package,
  Clock,
  Calculator,
  PieChart,
  Eye,
  Pencil,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Work, Material, Labor, WorkComponent } from "@/lib/types/workLibrary";
import { formatCurrency } from "@/lib/utils";

interface LibraryItemDetailProps {
  item: Work | Material | Labor;
  availableMaterials: Material[];
  availableLabor: Labor[];
  availableWorks: Work[];
  onEdit: () => void;
  onDelete: () => void;
}

export function LibraryItemDetail({
  item,
  availableMaterials,
  availableLabor,
  availableWorks,
  onEdit,
  onDelete,
}: LibraryItemDetailProps) {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());

  const isWork = "components" in item;
  const isMaterial = "supplier" in item;
  const isLabor = !isWork && !isMaterial;

  const toggleComponentExpansion = (id: string) => {
    setExpandedComponents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Fonction récursive pour obtenir tous les composants d'un ouvrage (et sous-ouvrages)
  const getAllComponents = (work: Work, depth = 0): { component: WorkComponent; depth: number; type: string; name: string; price: number; unit: string }[] => {
    if (!work.components) return [];

    return work.components.flatMap((component) => {
      const subWork = availableWorks.find((w) => w.id === component.id);
      const material = availableMaterials.find((m) => m.id === component.id);
      const labor = availableLabor.find((l) => l.id === component.id);

      let type = "unknown";
      let name = "Inconnu";
      let price = 0;
      let unit = "";

      if (subWork) {
        type = "work";
        name = subWork.name;
        price = subWork.recommendedPrice;
        unit = subWork.unit;
      } else if (material) {
        type = "material";
        name = material.name;
        price = material.unitPrice;
        unit = material.unit;
      } else if (labor) {
        type = "labor";
        name = labor.name;
        price = labor.unitPrice;
        unit = labor.unit;
      }

      const result = [{ component, depth, type, name, price, unit }];

      // Si c'est un sous-ouvrage et qu'il est développé, ajouter ses composants
      if (subWork && expandedComponents.has(component.id)) {
        return [...result, ...getAllComponents(subWork, depth + 1)];
      }

      return result;
    });
  };

  // Calcul des coûts pour les ouvrages
  const calculateCosts = (work: Work) => {
    let materialCost = 0;
    let laborCost = 0;
    let subWorksCost = 0;

    work.components.forEach((comp) => {
      const material = availableMaterials.find((m) => m.id === comp.id);
      const labor = availableLabor.find((l) => l.id === comp.id);
      const subWork = availableWorks.find((w) => w.id === comp.id);

      if (material) {
        materialCost += material.unitPrice * comp.quantity;
      } else if (labor) {
        laborCost += labor.unitPrice * comp.quantity;
      } else if (subWork) {
        subWorksCost += subWork.recommendedPrice * comp.quantity;
      }
    });

    const totalCost = materialCost + laborCost + subWorksCost;
    const margin = work.margin || 20;
    const marginAmount = (totalCost * margin) / 100;
    const recommendedPrice = totalCost + marginAmount;

    return {
      materialCost,
      laborCost,
      subWorksCost,
      totalCost,
      margin,
      marginAmount,
      recommendedPrice,
      materialPercentage: totalCost > 0 ? (materialCost / totalCost) * 100 : 0,
      laborPercentage: totalCost > 0 ? (laborCost / totalCost) * 100 : 0,
      subWorksPercentage: totalCost > 0 ? (subWorksCost / totalCost) * 100 : 0,
    };
  };

  const renderMaterialDetails = (material: Material) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Informations générales</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Référence</span>
                <span className="font-mono">{material.reference || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Unité</span>
                <span>{material.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Prix unitaire</span>
                <span className="font-semibold">{formatCurrency(material.unitPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">TVA</span>
                <span>{material.vatRate}%</span>
              </div>
            </div>
          </div>

          {material.description && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Description</h3>
              <p className="mt-1 text-neutral-700">{material.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Informations fournisseur</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Fournisseur</span>
                <span>{material.supplier || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Catégorie</span>
                <span>{material.category || "—"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-neutral-500">Stock</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">ID Stock</span>
                <span className="font-mono">{material.stockId || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Quantité en stock</span>
                <span>
                  {material.stockQuantity !== undefined
                    ? `${material.stockQuantity} ${material.unit}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLaborDetails = (labor: Labor) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">Informations générales</h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-600">Unité</span>
                <span>{labor.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Prix unitaire</span>
                <span className="font-semibold">{formatCurrency(labor.unitPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Catégorie</span>
                <span>{labor.category || "—"}</span>
              </div>
            </div>
          </div>

          {labor.description && (
            <div>
              <h3 className="text-sm font-medium text-neutral-500">Description</h3>
              <p className="mt-1 text-neutral-700">{labor.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderWorkDetails = (work: Work) => {
    const costs = calculateCosts(work);
    const allComponents = getAllComponents(work);

    return (
      <div className="space-y-6">
        <Tabs defaultValue="composition" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="composition" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Composition
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Analyse des coûts
            </TabsTrigger>
          </TabsList>
          <TabsContent value="composition" className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Informations générales</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Référence</span>
                      <span className="font-mono">{work.reference || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Unité</span>
                      <span>{work.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Prix recommandé</span>
                      <span className="font-semibold">{formatCurrency(work.recommendedPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Marge</span>
                      <span>{work.margin}%</span>
                    </div>
                  </div>
                </div>

                {work.description && (
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500">Description</h3>
                    <p className="mt-1 text-neutral-700">{work.description}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Composition détaillée</h3>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Élément</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>P.U.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allComponents.map((item, index) => {
                        const { component, depth, type, name, price, unit } = item;
                        const subWork = type === "work" ? availableWorks.find(w => w.id === component.id) : null;
                        const hasChildren = subWork && subWork.components && subWork.components.length > 0;
                        const isExpanded = expandedComponents.has(component.id);
                        const total = price * component.quantity;

                        return (
                          <TableRow key={`${component.id}-${index}`} className={depth > 0 ? "bg-neutral-50" : ""}>
                            <TableCell>
                              <div 
                                className="flex items-center" 
                                style={{ paddingLeft: `${depth * 20}px` }}
                              >
                                {hasChildren && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-6 w-6 mr-2"
                                    onClick={() => toggleComponentExpansion(component.id)}
                                  >
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform ${
                                        isExpanded ? "transform rotate-180" : ""
                                      }`}
                                    />
                                  </Button>
                                )}
                                {!hasChildren && depth > 0 && <span className="w-6 mr-2"></span>}
                                <span className="font-medium">{name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  type === "material"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : type === "labor"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-green-50 text-green-700 border-green-200"
                                }
                              >
                                {type === "material"
                                  ? "Matériau"
                                  : type === "labor"
                                  ? "Main d'œuvre"
                                  : "Ouvrage"}
                              </Badge>
                            </TableCell>
                            <TableCell>{component.quantity}</TableCell>
                            <TableCell>{unit}</TableCell>
                            <TableCell>{formatCurrency(price)}</TableCell>
                            <TableCell className="font-semibold">{formatCurrency(total)}</TableCell>
                            <TableCell>
                              {type === "work" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="p-1 h-7"
                                  onClick={() => toggleComponentExpansion(component.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="costs" className="pt-4">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-benaya-600" />
                      Analyse des coûts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Coût des matériaux:</span>
                        <span className="font-medium">{formatCurrency(costs.materialCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Coût de la main d'œuvre:</span>
                        <span className="font-medium">{formatCurrency(costs.laborCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Coût des sous-ouvrages:</span>
                        <span className="font-medium">{formatCurrency(costs.subWorksCost)}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t border-neutral-200">
                        <span>Coût total:</span>
                        <span>{formatCurrency(costs.totalCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2">
                        <span>Marge ({costs.margin}%):</span>
                        <span className="font-medium">{formatCurrency(costs.marginAmount)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-benaya-700 pt-2 border-t border-neutral-200">
                        <span>Prix de vente recommandé:</span>
                        <span>{formatCurrency(costs.recommendedPrice)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-benaya-600" />
                      Répartition des coûts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Matériaux</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{costs.materialPercentage.toFixed(1)}%</span>
                            <span className="text-sm text-neutral-500">{formatCurrency(costs.materialCost)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${costs.materialPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span>Main d'œuvre</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{costs.laborPercentage.toFixed(1)}%</span>
                            <span className="text-sm text-neutral-500">{formatCurrency(costs.laborCost)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${costs.laborPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Sous-ouvrages</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{costs.subWorksPercentage.toFixed(1)}%</span>
                            <span className="text-sm text-neutral-500">{formatCurrency(costs.subWorksCost)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${costs.subWorksPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isWork ? (
              <Package className="w-5 h-5 text-green-600" />
            ) : isMaterial ? (
              <Package className="w-5 h-5 text-blue-600" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600" />
            )}
            <div>
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <CardDescription>
                {isWork
                  ? "Ouvrage composé"
                  : isMaterial
                  ? "Matériau"
                  : "Main d'œuvre"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isWork && renderWorkDetails(item as Work)}
        {isMaterial && renderMaterialDetails(item as Material)}
        {isLabor && renderLaborDetails(item as Labor)}
      </CardContent>
    </Card>
  );
}