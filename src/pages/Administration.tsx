import { Shield } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

import useAdmin from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  AdminMetrics, 
  UserManagement, 
  InvitationManagement 
} from "@/components/admin";

export default function Administration() {
  const { users, invitations } = useAdmin();
  const { isAuthenticated, hasRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est administrateur (temporairement désactivé)
  // const isAdmin = hasRole("Administrateur");
  const isAdmin = true; // Temporairement accessible à tous les utilisateurs connectés
  
  // Rediriger si l'utilisateur n'est pas authentifié ou n'est pas administrateur
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      toast({
        title: "Accès refusé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive",
      });
    } 
    // Temporairement désactivé pour permettre l'accès à tous
    /*else if (!isAdmin) {
      navigate("/dashboard");
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }*/
  }, [isAuthenticated, isAdmin, navigate, toast]);
  
  // Ne rien afficher si l'utilisateur n'est pas authentifié ou n'est pas administrateur
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="benaya-card benaya-gradient text-white">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-benaya-100 text-lg mt-2">
              Gérez les utilisateurs et les invitations de votre organisation
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Accès temporairement ouvert à tous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <AdminMetrics users={users} invitations={invitations} />
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
          <TabsTrigger value="users" className="data-[state=active]:bg-benaya-900 data-[state=active]:text-white">
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="invitations" className="data-[state=active]:bg-benaya-900 data-[state=active]:text-white">
            Invitations
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab Content */}
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        {/* Invitations Tab Content */}
        <TabsContent value="invitations" className="space-y-6">
          <InvitationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
} 