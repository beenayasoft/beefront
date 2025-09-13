import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Users,
  Building,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import { TierCreationDialog } from "@/features/crm/components/tiers/TierCreationDialog";
import { OpportunityForm } from "@/features/crm/components/opportunities/OpportunityForm";
import { toast } from "@/hooks/use-toast";
import { crmApi } from "@/features/crm/api";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrency } from "@/contexts/CurrencyContext";
import { quotesApi } from "@/features/documents/api/quotes";

// Simple metric card component
const MetricCard = ({
  title,
  value,
  currency,
  change,
  icon: Icon,
  changeType,
}: any) => {
  const { formatCurrency } = useCurrency();
  
  return (
  <div className="Beenaya-card">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
            {currency ? formatCurrency(parseFloat(value) || 0) : value}
          </span>
        </div>
        {change && (
          <p
            className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-green-600 dark:text-green-400",
              changeType === "negative" && "text-red-600 dark:text-red-400",
              changeType === "neutral" &&
                "text-neutral-600 dark:text-neutral-400",
            )}
          >
            {change}
          </p>
        )}
      </div>
      <div className="p-3 bg-Beenaya-100 dark:bg-Beenaya-900/30 rounded-xl">
        <Icon className="w-6 h-6 text-Beenaya-900 dark:text-Beenaya-200" />
      </div>
    </div>
  </div>
  );
};

// Simple activity item
const ActivityItem = ({
  title,
  description,
  time,
  icon: Icon,
  status,
}: any) => (
  <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
    <div className="p-2 bg-Beenaya-100 dark:bg-Beenaya-900/30 rounded-lg">
      <Icon className="w-4 h-4 text-Beenaya-900 dark:text-Beenaya-200" />
    </div>
    <div className="flex-1 space-y-1">
      <h4 className="font-medium text-neutral-900 dark:text-white">{title}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {description}
      </p>
      <p className="text-xs text-neutral-500">{time}</p>
    </div>
    <span
      className={cn(
        "Beenaya-badge text-xs",
        status === "success" && "Beenaya-badge-success",
        status === "warning" && "Beenaya-badge-warning",
        status === "primary" && "Beenaya-badge-primary",
      )}
    >
      {status === "success" && "Terminé"}
      {status === "warning" && "En cours"}
      {status === "primary" && "Nouveau"}
    </span>
  </div>
);

export default function Dashboard() {
  const { user, getUserDisplayName } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les modales
  const [tierCreationOpen, setTierCreationOpen] = useState(false);
  const [opportunityFormOpen, setOpportunityFormOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionModalContent, setActionModalContent] = useState<{
    title: string;
    message: string;
    icon: React.ReactNode;
  } | null>(null);
  
  // États pour les données réelles
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [quotesCount, setQuotesCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Charger les données réelles
  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true);
      
      // Charger le nombre de clients
      const tiersResponse = await crmApi.tiers.getTiers(1, 1); // Une seule page pour obtenir le total
      setClientsCount(tiersResponse.count);
      
      // Charger les statistiques de devis depuis le document-service
      try {
        const quotesStats = await quotesApi.getStats();
        setQuotesCount(quotesStats.total_count || 0);
      } catch (quotesError) {
        console.warn('Impossible de charger les stats de devis, utilisation d\'une valeur par défaut:', quotesError);
        setQuotesCount(0); // Valeur par défaut en cas d'erreur
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des stats:', error);
      // Garder les valeurs par défaut en cas d'erreur
    } finally {
      setStatsLoading(false);
    }
  };

  // Simuler le chargement des données + charger les stats
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 1.5s pour simuler le chargement

    // Charger les stats réelles
    loadDashboardStats();

    return () => clearTimeout(timer);
  }, []);
  
  // Gestionnaires d'actions
  const handleQuoteAction = () => {
    navigate('/devis/nouveau');
  };
  
  const handleClientAction = () => {
    setTierCreationOpen(true);
  };
  
  const handleOpportunityAction = () => {
    setOpportunityFormOpen(true);
  };
  
  const handleTierCreationSuccess = (createdTierId?: string) => {
    console.log('🎉 Tier créé avec succès:', createdTierId);
    toast({
      title: "Client ajouté",
      description: "Le nouveau client a été créé avec succès",
    });
    setTierCreationOpen(false);
  };
  
  const handleOpportunitySubmit = async (formData: any) => {
    try {
      console.log("Création d'opportunité via Dashboard:", formData);
      
      const createdOpportunity = await crmApi.opportunities.createOpportunity(formData);
      
      console.log("✅ Opportunité créée:", createdOpportunity);
      
      toast({
        title: "Opportunité créée",
        description: `L'opportunité "${createdOpportunity.name}" a été créée avec succès`,
      });
      
      setOpportunityFormOpen(false);
      
    } catch (error) {
      console.error("❌ Erreur création opportunité:", error);
      
      toast({
        title: "Erreur de création",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div className="Beenaya-card Beenaya-gradient text-white">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Bienvenue {getUserDisplayName()} 👋</h1>
            <p className="text-white/90 text-lg mt-2">
              Voici un aperçu de vos activités de construction
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
              <span className="text-sm">HT</span>
              <div className="w-10 h-5 bg-white/10 border border-white/20 rounded-full relative">
                <div className="absolute right-0 top-0 w-5 h-5 bg-white rounded-full shadow-sm"></div>
              </div>
              <span className="text-sm font-medium">TTC</span>
            </div>
            <div className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg">
              <span className="text-sm">01/04/2025 - 12/06/2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Chiffre d'affaires"
          value={0}
          currency={true}
          change="+0% ce mois"
          changeType="neutral"
          icon={DollarSign}
        />
        <MetricCard
          title="Projets actifs"
          value="0"
          change="Aucun projet"
          changeType="neutral"
          icon={Building}
        />
        <MetricCard
          title="Clients"
          value={statsLoading ? "..." : clientsCount.toString()}
          change={statsLoading ? "Chargement..." : clientsCount === 0 ? "Aucun client" : `${clientsCount} client${clientsCount > 1 ? 's' : ''} enregistré${clientsCount > 1 ? 's' : ''}`}
          changeType="neutral"
          icon={Users}
        />
        <MetricCard
          title="Devis en cours"
          value={statsLoading ? "..." : quotesCount.toString()}
          change={statsLoading ? "Chargement..." : quotesCount === 0 ? "Aucun devis" : `${quotesCount} devis actif${quotesCount > 1 ? 's' : ''}`}
          changeType={quotesCount > 0 ? "positive" : "neutral"}
          icon={FileText}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2">
          <div className="Beenaya-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Chiffre d'affaires
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Évolution mensuelle
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ce mois
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-3xl font-bold text-Beenaya-900 dark:text-Beenaya-200">
                0,00 MAD
              </div>

              {/* Simple chart placeholder */}
              <div className="h-48 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-2">
                  <TrendingUp className="w-8 h-8 text-neutral-400 mx-auto" />
                  <p className="text-sm text-neutral-500">Graphique à venir</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="Beenaya-card">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
              Actions rapides
            </h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start gap-3 Beenaya-button-primary"
                onClick={handleQuoteAction}
              >
                <Plus className="w-4 h-4" />
                Nouveau devis
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={handleClientAction}
              >
                <Users className="w-4 h-4" />
                Ajouter client
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={handleOpportunityAction}
              >
                <BarChart3 className="w-4 h-4" />
                Nouvelle opportunité
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Building className="w-4 h-4" />
                Nouveau chantier
              </Button>
            </div>
          </div>

          {/* Tasks Widget */}
          <div className="Beenaya-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Tâches
              </h3>
              <Button size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Aucune tâche</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="Beenaya-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Activité récente
          </h3>
          <Button variant="outline" size="sm">
            Voir tout
          </Button>
        </div>

        <div className="space-y-4">
          <ActivityItem
            title="Bon de commande créé"
            description="Commande de matériaux pour chantier Villa Moderne"
            time="Il y a 2 heures"
            icon={FileText}
            status="success"
          />
          <ActivityItem
            title="Intervention créée"
            description="BI00001 - Contrôle qualité"
            time="Il y a 4 heures"
            icon={Building}
            status="warning"
          />
          <ActivityItem
            title="Devis créé"
            description="D202500001 - Rénovation appartement"
            time="Hier"
            icon={FileText}
            status="primary"
          />
        </div>
      </div>
      
      {/* Modale de création de tier */}
      <TierCreationDialog
        open={tierCreationOpen}
        onOpenChange={setTierCreationOpen}
        onSuccess={handleTierCreationSuccess}
      />
      
      {/* Modale de création d'opportunité */}
      <Dialog open={opportunityFormOpen} onOpenChange={setOpportunityFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] w-[95vw] sm:w-full mx-auto overflow-y-auto">
          <OpportunityForm
            opportunity={{}}
            onSubmit={handleOpportunitySubmit}
            onCancel={() => setOpportunityFormOpen(false)}
            isEditing={false}
          />
        </DialogContent>
      </Dialog>
      
      {/* Modale informative pour les actions */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              {actionModalContent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-4">
            {actionModalContent?.icon}
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {actionModalContent?.message}
            </p>
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setActionModalOpen(false)}
              className="px-8"
            >
              Compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
