import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, ArrowRight, X } from "lucide-react";
import { EntityType } from "./types";

interface ModalTypeSelectorProps {
  open: boolean;
  onSelect: (type: EntityType) => void;
  onOpenChange: (open: boolean) => void;
}

const entityTypeOptions = [
  {
    type: "entreprise" as EntityType,
    icon: Building2,
    title: "Entreprise",
    description: "Société, SARL, SAS, association, auto-entrepreneur avec SIRET...",
    examples: ["Dupont Construction SARL", "BTP Solutions SAS", "Association des Artisans"],
    color: "text-blue-600",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200 hover:border-blue-300",
  },
  {
    type: "particulier" as EntityType,
    icon: User,
    title: "Particulier",
    description: "Personne physique, client privé, particulier...",
    examples: ["M. Jean Dupont", "Mme Marie Martin", "Famille Durand"],
    color: "text-green-600",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200 hover:border-green-300",
  }
];

export function ModalTypeSelector({ open, onSelect, onOpenChange }: ModalTypeSelectorProps) {
  const handleSelect = (type: EntityType) => {
    onSelect(type);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">
                ✨ Nouveau tiers
              </DialogTitle>
              <DialogDescription className="mt-1">
                Choisissez le type de tiers que vous souhaitez créer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          {entityTypeOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <Card
                key={option.type}
                className={`cursor-pointer transition-all duration-200 ${option.bgColor} ${option.borderColor} hover:shadow-md group`}
                onClick={() => handleSelect(option.type)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Icône */}
                      <div className={`p-3 rounded-lg bg-white border ${option.borderColor}`}>
                        <IconComponent className={`h-6 w-6 ${option.color}`} />
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {option.title}
                          </h3>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                        
                        {/* Exemples */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Exemples :
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {option.examples.map((example, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-white rounded text-xs text-gray-700 border border-gray-200"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Flèche */}
                    <div className="ml-4 flex-shrink-0">
                      <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 transition-colors">
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Note d'aide */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <strong>Conseil :</strong> Le type choisi déterminera les champs obligatoires et les validations du formulaire.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-4"
          >
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 