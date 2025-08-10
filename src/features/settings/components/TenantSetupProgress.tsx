/**
 * Composant de progression pour la création des schémas tenant
 * Affiche le progrès en temps réel et gère les états d'erreur
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Clock,
  Database,
  FileText,
  BookOpen,
  Zap
} from "lucide-react";

interface SetupProgress {
  tenant_id: string;
  tenant_name: string;
  schema_status: 'pending' | 'creating' | 'ready' | 'error';
  schema_progress: {
    current_step: number;
    total_steps: number;
    message: string;
    current_service?: string;
    updated_at: string;
  };
  schema_created_at?: string;
  schema_error?: string;
  progress_percentage: number;
  is_ready: boolean;
  is_creating: boolean;
  message: string;
  action: 'wait' | 'redirect' | 'retry';
  redirect_url?: string;
  can_retry?: boolean;
}

interface TenantSetupProgressProps {
  tenantId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
  showCloseButton?: boolean;
}

const serviceIcons = {
  crm: <Database className="h-4 w-4" />,
  documents: <FileText className="h-4 w-4" />,
  library: <BookOpen className="h-4 w-4" />,
  default: <Zap className="h-4 w-4" />
};

const serviceNames = {
  crm: 'CRM',
  documents: 'Documents',
  library: 'Bibliothèque',
  default: 'Service'
};

export function TenantSetupProgress({ 
  tenantId, 
  onComplete, 
  onError, 
  showCloseButton = false 
}: TenantSetupProgressProps) {
  const [progress, setProgress] = useState<SetupProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer pour le temps écoulé
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/setup-progress/`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data: SetupProgress = await response.json();
        setProgress(data);
        setLoading(false);

        // Actions selon le statut
        if (data.action === 'redirect' && data.is_ready) {
          setTimeout(() => {
            onComplete?.();
            if (data.redirect_url) {
              window.location.href = data.redirect_url;
            }
          }, 2000);
        } else if (data.action === 'retry' && data.schema_error) {
          onError?.(data.schema_error);
        }
      } else {
        throw new Error('Erreur lors de la récupération du progrès');
      }
    } catch (error) {
      console.error('Erreur fetchProgress:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur inconnue');
      setLoading(false);
    }
  }, [tenantId, onComplete, onError]);

  const handleRetry = async () => {
    if (!progress || retrying) return;

    setRetrying(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/retry-setup/`, {
        method: 'POST',
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Réinitialiser le timer et relancer la surveillance
        setElapsedTime(0);
        setProgress(prev => prev ? { ...prev, schema_status: 'pending' } : null);
        setTimeout(fetchProgress, 1000);
      } else {
        throw new Error('Erreur lors de la relance');
      }
    } catch (error) {
      console.error('Erreur retry:', error);
      onError?.(error instanceof Error ? error.message : 'Erreur lors de la relance');
    } finally {
      setRetrying(false);
    }
  };

  // Polling pour le progrès
  useEffect(() => {
    if (!tenantId) return;

    fetchProgress();

    const interval = setInterval(() => {
      if (progress?.is_ready || progress?.schema_status === 'error') {
        clearInterval(interval);
        return;
      }
      fetchProgress();
    }, 2000);

    return () => clearInterval(interval);
  }, [tenantId, fetchProgress, progress?.is_ready, progress?.schema_status]);

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentServiceIcon = () => {
    if (!progress?.schema_progress?.current_service) return serviceIcons.default;
    return serviceIcons[progress.schema_progress.current_service as keyof typeof serviceIcons] || serviceIcons.default;
  };

  const getCurrentServiceName = () => {
    if (!progress?.schema_progress?.current_service) return 'Configuration';
    return serviceNames[progress.schema_progress.current_service as keyof typeof serviceNames] || 'Service';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Impossible de charger les informations de progression.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {progress.is_ready ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : progress.schema_status === 'error' ? (
            <AlertCircle className="h-6 w-6 text-red-600" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          )}
          Configuration de {progress.tenant_name}
        </CardTitle>
        <CardDescription>
          {progress.message}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barre de progression */}
        {progress.schema_status === 'creating' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                {getCurrentServiceIcon()}
                {getCurrentServiceName()}
              </span>
              <span>{progress.progress_percentage}%</span>
            </div>
            <Progress value={progress.progress_percentage} className="h-2" />
          </div>
        )}

        {/* Status selon l'état */}
        {progress.schema_status === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              La configuration de vos services va démarrer sous peu...
            </AlertDescription>
          </Alert>
        )}

        {progress.schema_status === 'creating' && (
          <div className="space-y-3">
            <Alert className="border-blue-200 bg-blue-50">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Configuration en cours...</div>
                  <div className="text-sm text-blue-700">
                    {progress.schema_progress?.message || 'Préparation des services...'}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Temps écoulé : {formatElapsedTime(elapsedTime)}
              </div>
              <p className="mt-1">Vous pouvez fermer cette page et revenir plus tard</p>
            </div>
          </div>
        )}

        {progress.schema_status === 'ready' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium text-green-800">Configuration terminée !</div>
                <div className="text-sm text-green-700">
                  Tous vos services sont prêts. Redirection automatique...
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {progress.schema_status === 'error' && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Erreur de configuration</div>
                  <div className="text-sm">
                    {progress.schema_error || 'Une erreur inattendue est survenue'}
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {progress.can_retry && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleRetry} 
                  disabled={retrying}
                  variant="outline"
                  className="gap-2"
                >
                  {retrying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Réessayer
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Bouton fermer (optionnel) */}
        {showCloseButton && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Fermer
            </Button>
          </div>
        )}

        {/* Informations de débogage en développement */}
        {import.meta.env.DEV && (
          <details className="text-xs text-gray-500">
            <summary>Informations de débogage</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(progress, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export default TenantSetupProgress;