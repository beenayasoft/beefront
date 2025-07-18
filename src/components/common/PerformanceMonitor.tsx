import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Clock, Database, Zap } from 'lucide-react';

interface PerformanceMetrics {
  totalTime: number;
  sqlQueries: number;
  sqlTime: number;
  appTime: number;
  timestamp: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function PerformanceMonitor({ 
  enabled = true, 
  position = 'top-right' 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Intercepter les réponses fetch pour capturer les headers de performance
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Capturer les métriques de performance depuis les headers
      const perfTime = response.headers.get('X-Performance-Time');
      const perfQueries = response.headers.get('X-Performance-Queries');
      const perfSqlTime = response.headers.get('X-Performance-SQL-Time');
      
      if (perfTime && perfQueries && perfSqlTime) {
        const totalTime = parseFloat(perfTime);
        const sqlQueries = parseInt(perfQueries);
        const sqlTime = parseFloat(perfSqlTime);
        const appTime = totalTime - sqlTime;
        
        setMetrics(prev => {
          const newMetrics = [
            {
              totalTime,
              sqlQueries,
              sqlTime,
              appTime,
              timestamp: Date.now()
            },
            ...prev.slice(0, 9) // Garder seulement les 10 dernières mesures
          ];
          return newMetrics;
        });
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [enabled]);

  // Calculer les moyennes
  const avgMetrics = metrics.length > 0 ? {
    totalTime: metrics.reduce((acc, m) => acc + m.totalTime, 0) / metrics.length,
    sqlQueries: metrics.reduce((acc, m) => acc + m.sqlQueries, 0) / metrics.length,
    sqlTime: metrics.reduce((acc, m) => acc + m.sqlTime, 0) / metrics.length,
    appTime: metrics.reduce((acc, m) => acc + m.appTime, 0) / metrics.length
  } : null;

  const latestMetrics = metrics[0];

  if (!enabled || !latestMetrics) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  const getPerformanceLevel = (queries: number, time: number) => {
    if (queries <= 3 && time <= 100) return { level: 'optimal', color: 'bg-green-500', icon: '✅' };
    if (queries <= 10 && time <= 500) return { level: 'good', color: 'bg-yellow-500', icon: '⚠️' };
    return { level: 'poor', color: 'bg-red-500', icon: '🚨' };
  };

  const perf = getPerformanceLevel(latestMetrics.sqlQueries, latestMetrics.totalTime);

  return (
    <div className={`fixed ${getPositionClasses()} z-50 transition-all duration-300`}>
      {/* Indicateur minimaliste */}
      <div 
        className={`w-4 h-4 rounded-full ${perf.color} cursor-pointer shadow-lg`}
        onClick={() => setIsVisible(!isVisible)}
        title={`Performance: ${perf.level} (Cliquez pour détails)`}
      />
      
      {/* Panel détaillé */}
      {isVisible && (
        <Card className="mt-2 w-80 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Performance Monitor {perf.icon}
              </h3>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Métriques actuelles */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="w-3 h-3" />
                  Temps total:
                </span>
                <Badge variant={latestMetrics.totalTime < 100 ? 'default' : 'destructive'}>
                  {latestMetrics.totalTime.toFixed(1)}ms
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-sm">
                  <Database className="w-3 h-3" />
                  Requêtes SQL:
                </span>
                <Badge variant={latestMetrics.sqlQueries <= 3 ? 'default' : 'destructive'}>
                  {latestMetrics.sqlQueries} ({latestMetrics.sqlTime.toFixed(1)}ms)
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-sm">
                  <Zap className="w-3 h-3" />
                  Temps app:
                </span>
                <Badge variant="outline">
                  {latestMetrics.appTime.toFixed(1)}ms
                </Badge>
              </div>
            </div>
            
            {/* Moyennes */}
            {avgMetrics && metrics.length > 1 && (
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium text-gray-600 mb-2">
                  Moyennes ({metrics.length} requêtes)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Temps: {avgMetrics.totalTime.toFixed(1)}ms</div>
                  <div>SQL: {avgMetrics.sqlQueries.toFixed(1)}</div>
                </div>
              </div>
            )}
            
            {/* Historique mini */}
            <div className="border-t pt-3">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Historique</h4>
              <div className="flex gap-1 h-8">
                {metrics.slice(0, 10).reverse().map((metric, index) => {
                  const height = Math.min((metric.totalTime / 1000) * 100, 100);
                  const color = metric.sqlQueries <= 3 ? 'bg-green-400' : 
                               metric.sqlQueries <= 10 ? 'bg-yellow-400' : 'bg-red-400';
                  
                  return (
                    <div 
                      key={index}
                      className={`${color} w-2 rounded-sm`}
                      style={{ height: `${Math.max(height, 10)}%` }}
                      title={`${metric.totalTime.toFixed(1)}ms, ${metric.sqlQueries} SQL`}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Actions */}
            <div className="border-t pt-3 flex gap-2">
              <button 
                onClick={() => setMetrics([])}
                className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                Clear
              </button>
              <button 
                onClick={() => console.table(metrics)}
                className="text-xs px-2 py-1 bg-blue-100 rounded hover:bg-blue-200"
              >
                Log Data
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 