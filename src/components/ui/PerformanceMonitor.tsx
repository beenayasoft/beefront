import React, { useState, useEffect } from 'react';
import { Activity, Database, Zap, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCacheStats } from '@/hooks/useCache';
import { formatCurrency } from '@/lib/utils';

interface PerformanceMetrics {
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  bandwidth: number;
  activeConnections: number;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export function PerformanceMonitor({ showDetails = true, compact = false }: PerformanceMonitorProps) {
  const { stats, refresh, clear } = useCacheStats();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    requestsPerMinute: 0,
    averageResponseTime: 0,
    errorRate: 0,
    bandwidth: 0,
    activeConnections: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Simulation des métriques de performance (à remplacer par de vraies métriques)
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setPerformanceMetrics({
        requestsPerMinute: Math.floor(Math.random() * 100) + 20,
        averageResponseTime: Math.floor(Math.random() * 500) + 100,
        errorRate: Math.random() * 5,
        bandwidth: Math.random() * 1024 * 1024, // bytes
        activeConnections: Math.floor(Math.random() * 50) + 10,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceStatus = () => {
    if (stats.hitRate >= 80) return { color: 'text-green-600', icon: TrendingUp, label: 'Excellent' };
    if (stats.hitRate >= 60) return { color: 'text-yellow-600', icon: Activity, label: 'Correct' };
    return { color: 'text-red-600', icon: TrendingDown, label: 'Faible' };
  };

  const status = getPerformanceStatus();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Database className="h-3 w-3" />
          {stats.hitRate.toFixed(1)}%
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Activity className="h-3 w-3" />
          {stats.totalEntries}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance du Cache
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? 'Arrêter' : 'Surveiller'}
            </Button>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <status.icon className={`h-4 w-4 ${status.color}`} />
                <span className="text-sm font-medium">Taux de cache</span>
              </div>
              <div className="text-2xl font-bold">{stats.hitRate.toFixed(1)}%</div>
              <Progress value={stats.hitRate} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Entrées</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
              <p className="text-xs text-gray-500">
                {stats.totalHits} hits / {stats.totalMisses} miss
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Taille</span>
              </div>
              <div className="text-2xl font-bold">{formatBytes(stats.cacheSize)}</div>
              <Progress 
                value={(stats.cacheSize / (5 * 1024 * 1024)) * 100} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Efficacité</span>
              </div>
              <div className="text-2xl font-bold">{status.label}</div>
              <p className="text-xs text-gray-500">
                Performance globale
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails de performance */}
      {showDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistiques du Cache</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total des requêtes:</span>
                <span className="font-medium">{stats.totalHits + stats.totalMisses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Succès cache:</span>
                <span className="font-medium text-green-600">{stats.totalHits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Échecs cache:</span>
                <span className="font-medium text-red-600">{stats.totalMisses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Entrée la plus ancienne:</span>
                <span className="font-medium">
                  {stats.oldestEntry ? new Date(stats.oldestEntry).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dernière entrée:</span>
                <span className="font-medium">
                  {stats.newestEntry ? new Date(stats.newestEntry).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {isMonitoring && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Métriques en Temps Réel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Requêtes/min:</span>
                  <span className="font-medium">{performanceMetrics.requestsPerMinute}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Temps de réponse moyen:</span>
                  <span className="font-medium">{performanceMetrics.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taux d'erreur:</span>
                  <span className={`font-medium ${performanceMetrics.errorRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
                    {performanceMetrics.errorRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bande passante:</span>
                  <span className="font-medium">{formatBytes(performanceMetrics.bandwidth)}/s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Connexions actives:</span>
                  <span className="font-medium">{performanceMetrics.activeConnections}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommandations */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {stats.hitRate < 60 && (
                <div className="flex items-start gap-2 text-yellow-700 bg-yellow-50 p-2 rounded">
                  <TrendingDown className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Taux de cache faible</p>
                    <p>Considérez augmenter la durée de vie du cache (TTL) ou réviser les stratégies de cache.</p>
                  </div>
                </div>
              )}
              
              {stats.cacheSize > 4 * 1024 * 1024 && (
                <div className="flex items-start gap-2 text-orange-700 bg-orange-50 p-2 rounded">
                  <Database className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Cache volumineux</p>
                    <p>Le cache approche de sa limite. Considérez nettoyer les entrées expirées.</p>
                  </div>
                </div>
              )}
              
              {stats.totalEntries === 0 && (
                <div className="flex items-start gap-2 text-blue-700 bg-blue-50 p-2 rounded">
                  <Zap className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Cache vide</p>
                    <p>Aucune donnée en cache. Les prochaines requêtes rempliront automatiquement le cache.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}