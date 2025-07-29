import { useState } from 'react';
import { Wifi, WifiOff, CheckCircle, XCircle, RefreshCw, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'testing';
  lastTest?: Date;
  version?: string;
  responseTime?: number;
}

interface ServiceConnectionTestProps {
  className?: string;
}

export function ServiceConnectionTest({ className }: ServiceConnectionTestProps) {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      url: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
      status: 'disconnected',
    },
    {
      name: 'Tenant Service',
      url: import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:8001/api',
      status: 'disconnected',
    },
    {
      name: 'Document Service',
      url: import.meta.env.VITE_DOCUMENT_SERVICE_URL || 'http://localhost:8004/api',
      status: 'disconnected',
    },
  ]);

  const [isTestingAll, setIsTestingAll] = useState(false);

  const testSingleService = async (index: number) => {
    const service = services[index];
    const tenantId = localStorage.getItem('tenantId');

    // Mettre à jour le statut à "testing"
    setServices(prev => prev.map((s, i) => 
      i === index ? { ...s, status: 'testing' } : s
    ));

    try {
      const startTime = Date.now();
      
      // Déterminer l'endpoint de test selon le service
      let testEndpoint = '';
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (service.name === 'API Gateway') {
        testEndpoint = `${service.url}/health/`;
      } else if (service.name === 'Tenant Service') {
        testEndpoint = `${service.url}/health/`;
      } else if (service.name === 'Document Service') {
        testEndpoint = `${service.url}/health/`;
        if (tenantId) {
          headers['X-Tenant-ID'] = tenantId;
        }
      }

      const response = await fetch(testEndpoint, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(5000), // 5 secondes de timeout
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        
        setServices(prev => prev.map((s, i) => 
          i === index ? {
            ...s,
            status: 'connected',
            lastTest: new Date(),
            version: data.version || 'Unknown',
            responseTime,
          } : s
        ));

        toast({
          title: "Service connecté",
          description: `${service.name} répond en ${responseTime}ms`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setServices(prev => prev.map((s, i) => 
        i === index ? {
          ...s,
          status: 'disconnected',
          lastTest: new Date(),
          responseTime: undefined,
          version: undefined,
        } : s
      ));

      toast({
        title: "Erreur de connexion",
        description: `Impossible de se connecter à ${service.name}`,
        variant: "destructive",
      });
    }
  };

  const testAllServices = async () => {
    setIsTestingAll(true);
    
    // Tester tous les services en parallèle
    const testPromises = services.map((_, index) => testSingleService(index));
    
    try {
      await Promise.all(testPromises);
      
      const connectedCount = services.filter(s => s.status === 'connected').length;
      toast({
        title: "Tests terminés",
        description: `${connectedCount}/${services.length} services connectés`,
      });
    } finally {
      setIsTestingAll(false);
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'testing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <WifiOff className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (service: ServiceStatus) => {
    switch (service.status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
            Connecté
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
            Déconnecté
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            Test en cours...
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            Non testé
          </Badge>
        );
    }
  };

  const connectedCount = services.filter(s => s.status === 'connected').length;
  const isAllConnected = connectedCount === services.length;
  const hasDisconnected = services.some(s => s.status === 'disconnected');

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5" />
            <CardTitle>État des services</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isAllConnected && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                <Zap className="w-3 h-3 mr-1" />
                Tous opérationnels
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={testAllServices}
              disabled={isTestingAll}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isTestingAll ? 'animate-spin' : ''}`} />
              Tester tout
            </Button>
          </div>
        </div>
        <CardDescription>
          {connectedCount}/{services.length} services connectés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-neutral-500">
                    {service.url}
                  </div>
                  {service.lastTest && (
                    <div className="text-xs text-neutral-400">
                      Testé le {service.lastTest.toLocaleTimeString('fr-FR')}
                      {service.responseTime && ` (${service.responseTime}ms)`}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {service.version && (
                  <Badge variant="outline" className="text-xs">
                    v{service.version}
                  </Badge>
                )}
                {getStatusBadge(service)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testSingleService(index)}
                  disabled={service.status === 'testing'}
                >
                  {service.status === 'testing' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Tester'
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {hasDisconnected && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <XCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Services indisponibles :</strong> Certaines fonctionnalités peuvent ne pas fonctionner correctement. 
                Vérifiez que tous les services backend sont démarrés.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}