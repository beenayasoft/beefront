import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

interface QuoteMetrics {
  totalQuotes: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  rejectedQuotes: number;
  expiredQuotes: number;
  averageResponseTime: number; // en jours
  topClients: Array<{
    id: string;
    name: string;
    quotesCount: number;
    totalValue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    quotes: number;
    value: number;
    conversion: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

interface QuoteAnalyticsProps {
  dateRange?: {
    from: Date;
    to: Date;
  };
  tenantId?: string;
}

export function QuoteAnalytics({ dateRange, tenantId }: QuoteAnalyticsProps) {
  const [metrics, setMetrics] = useState<QuoteMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadMetrics();
  }, [dateRange, tenantId, selectedPeriod]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulation de données - à remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalQuotes: 156,
        totalValue: 487650,
        averageValue: 3125,
        conversionRate: 68.5,
        pendingQuotes: 23,
        acceptedQuotes: 89,
        rejectedQuotes: 31,
        expiredQuotes: 13,
        averageResponseTime: 3.2,
        topClients: [
          { id: '1', name: 'Construction Durand', quotesCount: 12, totalValue: 85600 },
          { id: '2', name: 'Rénovation Martin', quotesCount: 8, totalValue: 67200 },
          { id: '3', name: 'Bâtiment Rousseau', quotesCount: 15, totalValue: 112300 },
        ],
        monthlyTrend: [
          { month: 'Jan', quotes: 45, value: 142500, conversion: 72 },
          { month: 'Fév', quotes: 38, value: 118900, conversion: 65 },
          { month: 'Mar', quotes: 52, value: 165800, conversion: 70 },
          { month: 'Avr', quotes: 21, value: 60450, conversion: 68.5 },
        ],
        statusDistribution: [
          { status: 'Accepté', count: 89, percentage: 57.1, color: 'bg-green-500' },
          { status: 'En attente', count: 23, percentage: 14.7, color: 'bg-yellow-500' },
          { status: 'Rejeté', count: 31, percentage: 19.9, color: 'bg-red-500' },
          { status: 'Expiré', count: 13, percentage: 8.3, color: 'bg-gray-500' },
        ]
      });
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  const getComparisonIcon = (value: number, isPositive: boolean = true) => {
    if (value > 0) {
      return isPositive ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return isPositive ? <TrendingDown className="h-4 w-4 text-red-600" /> : <TrendingUp className="h-4 w-4 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalQuotes}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getComparisonIcon(8.2)}
              <span className="ml-1">+8.2% vs mois précédent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getComparisonIcon(12.3)}
              <span className="ml-1">+12.3% vs mois précédent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getComparisonIcon(-2.1, false)}
              <span className="ml-1">-2.1% vs mois précédent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Réponse Moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}j</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getComparisonIcon(-0.5, false)}
              <span className="ml-1">-0.5j vs mois précédent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu détaillé avec onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Distribution des statuts */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Statuts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.statusDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.status}</span>
                      <span className="font-medium">{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Métriques rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valeur moyenne par devis</span>
                  <span className="font-medium">{formatCurrency(metrics.averageValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis en attente</span>
                  <Badge variant="outline">{metrics.pendingQuotes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis acceptés</span>
                  <Badge className="bg-green-100 text-green-800">{metrics.acceptedQuotes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis rejetés</span>
                  <Badge variant="destructive">{metrics.rejectedQuotes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Devis expirés</span>
                  <Badge variant="secondary">{metrics.expiredQuotes}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution Mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.monthlyTrend.map((month, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 items-center p-4 border rounded-lg">
                    <div className="font-medium">{month.month}</div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{month.quotes}</div>
                      <div className="text-xs text-gray-500">devis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{formatCurrency(month.value)}</div>
                      <div className="text-xs text-gray-500">valeur</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{month.conversion}%</div>
                      <div className="text-xs text-gray-500">conversion</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topClients.map((client, index) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.quotesCount} devis</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(client.totalValue)}</div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(client.totalValue / client.quotesCount)} moy.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs vs Réalisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nombre de devis (Objectif: 150)</span>
                    <span>156 (104%)</span>
                  </div>
                  <Progress value={104} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Chiffre d'affaires (Objectif: 500k€)</span>
                    <span>488k€ (98%)</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux de conversion (Objectif: 70%)</span>
                    <span>68.5% (98%)</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-800">Améliorer le suivi</div>
                    <div className="text-blue-600">Le temps de réponse moyen peut être réduit</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Users className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-green-800">Fidéliser les top clients</div>
                    <div className="text-green-600">Proposer des conditions privilégiées</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-orange-800">Relancer les devis expirés</div>
                    <div className="text-orange-600">13 devis à traiter en priorité</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}