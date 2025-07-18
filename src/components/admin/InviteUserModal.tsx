import { useState, useEffect } from "react";
import { Shield, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Role } from "@/lib/api/admin";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Schéma de validation du formulaire
const invitationSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  firstName: z.string().min(1, { message: "Le prénom est requis" }),
  lastName: z.string().min(1, { message: "Le nom est requis" }),
  company: z.string().min(1, { message: "L'entreprise est requise" }),
  roles: z.array(z.number()).min(1, { message: "Au moins un rôle est requis" }),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvitationFormValues) => Promise<void>;
  roles: Role[];
  isLoading: boolean;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  onSubmit,
  roles,
  isLoading,
}: InviteUserModalProps) {
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      company: "",
      roles: [],
    },
  });
  
  // Réinitialiser le formulaire et les rôles sélectionnés quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      form.reset();
      setSelectedRoles([]);
    }
  }, [isOpen, form]);
  
  const handleSubmit = async (values: InvitationFormValues) => {
    try {
      // S'assurer que les rôles sont correctement formatés
      const formattedValues = {
        ...values,
        roles: selectedRoles.map(role => role.id)
      };
      
      await onSubmit(formattedValues);
      form.reset();
      setSelectedRoles([]);
      onClose();
    } catch (error) {
      // Erreur gérée par le hook useAdmin
      console.error("Erreur lors de l'envoi de l'invitation:", error);
    }
  };
  
  const handleRoleSelect = (roleId: string) => {
    const roleIdNumber = parseInt(roleId);
    const role = roles.find(r => r.id === roleIdNumber);
    
    if (role && !selectedRoles.some(r => r.id === roleIdNumber)) {
      const newSelectedRoles = [...selectedRoles, role];
      setSelectedRoles(newSelectedRoles);
      
      // Mettre à jour le champ roles dans le formulaire
      const roleIds = newSelectedRoles.map(r => r.id);
      form.setValue("roles", roleIds);
    }
  };
  
  const handleRemoveRole = (roleId: number) => {
    const newSelectedRoles = selectedRoles.filter(r => r.id !== roleId);
    setSelectedRoles(newSelectedRoles);
    
    // Mettre à jour le champ roles dans le formulaire
    const roleIds = newSelectedRoles.map(r => r.id);
    form.setValue("roles", roleIds);
  };
  
  // Vérifier si des rôles sont disponibles
  const hasAvailableRoles = roles && roles.length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Inviter un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email pour ajouter un nouvel utilisateur à votre organisation.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemple.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entreprise</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>Rôles</FormLabel>
                  {hasAvailableRoles ? (
                    <>
                      <Select onValueChange={handleRoleSelect}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRoles.map((role) => (
                          <Badge key={role.id} className="bg-benaya-700">
                            <Shield className="w-3 h-3 mr-1" />
                            {role.name}
                            <button
                              type="button"
                              onClick={() => handleRemoveRole(role.id)}
                              className="ml-1 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-red-500">
                      Aucun rôle disponible. Veuillez créer des rôles avant d'inviter des utilisateurs.
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-benaya-900" 
                disabled={isLoading || !hasAvailableRoles || selectedRoles.length === 0}
              >
                {isLoading ? "Envoi en cours..." : "Envoyer l'invitation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 