import React from 'react';
import { Check, Clock, AlertCircle, X, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  status: string;
  label: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  isCompleted: boolean;
  isCurrent: boolean;
  isError?: boolean;
  metadata?: Record<string, any>;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
  showTimestamps?: boolean;
  showUsers?: boolean;
  showDescriptions?: boolean;
  compact?: boolean;
  className?: string;
}

export function StatusTimeline({
  events,
  orientation = 'vertical',
  showTimestamps = true,
  showUsers = true,
  showDescriptions = true,
  compact = false,
  className
}: StatusTimelineProps) {
  const getStatusIcon = (event: TimelineEvent) => {
    if (event.isError) {
      return <X className="h-4 w-4 text-red-600" />;
    }
    if (event.isCompleted) {
      return <Check className="h-4 w-4 text-green-600" />;
    }
    if (event.isCurrent) {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (event: TimelineEvent) => {
    if (event.isError) return 'border-red-500 bg-red-100';
    if (event.isCompleted) return 'border-green-500 bg-green-100';
    if (event.isCurrent) return 'border-blue-500 bg-blue-100';
    return 'border-gray-300 bg-gray-100';
  };

  const getConnectorColor = (event: TimelineEvent, nextEvent?: TimelineEvent) => {
    if (event.isCompleted && nextEvent?.isCompleted) return 'bg-green-500';
    if (event.isCompleted) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center space-x-4 overflow-x-auto pb-4', className)}>
        {events.map((event, index) => (
          <React.Fragment key={event.id}>
            <div className="flex flex-col items-center min-w-max space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                      getStatusColor(event)
                    )}>
                      {getStatusIcon(event)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{event.label}</p>
                      {event.description && <p className="text-xs">{event.description}</p>}
                      {showTimestamps && (
                        <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="text-center">
                <Badge
                  variant={event.isCompleted ? 'default' : event.isCurrent ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {event.label}
                </Badge>
                {showTimestamps && !compact && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(event.timestamp)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Connecteur horizontal */}
            {index < events.length - 1 && (
              <div className={cn(
                'h-0.5 w-8 flex-shrink-0',
                getConnectorColor(event, events[index + 1])
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Timeline verticale
  return (
    <div className={cn('space-y-4', className)}>
      {events.map((event, index) => (
        <div key={event.id} className="relative">
          <div className="flex items-start space-x-4">
            {/* Icône et connecteur */}
            <div className="relative flex flex-col items-center">
              <div className={cn(
                'w-10 h-10 rounded-full border-2 flex items-center justify-center z-10',
                getStatusColor(event)
              )}>
                {getStatusIcon(event)}
              </div>
              
              {/* Ligne de connexion */}
              {index < events.length - 1 && (
                <div className={cn(
                  'w-0.5 h-12 mt-2',
                  getConnectorColor(event, events[index + 1])
                )} />
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <Card className={cn(
                'transition-all duration-200',
                event.isCurrent ? 'ring-2 ring-blue-200 shadow-md' : 'shadow-sm'
              )}>
                <CardContent className={cn('p-4', compact && 'p-3')}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={event.isCompleted ? 'default' : event.isCurrent ? 'secondary' : 'outline'}
                        >
                          {event.label}
                        </Badge>
                        {event.isError && (
                          <Badge variant="destructive" className="text-xs">
                            Erreur
                          </Badge>
                        )}
                      </div>
                      
                      {showDescriptions && event.description && (
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        {showTimestamps && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatTimestamp(event.timestamp)}</span>
                          </div>
                        )}
                        
                        {showUsers && event.user && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{event.user.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Métadonnées additionnelles */}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs text-gray-500">
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant pour créer facilement une timeline de statuts de document
interface DocumentStatusTimelineProps {
  documentType: 'quote' | 'invoice';
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
    user?: { name: string };
    notes?: string;
  }>;
  className?: string;
}

export function DocumentStatusTimeline({
  documentType,
  currentStatus,
  statusHistory = [],
  className
}: DocumentStatusTimelineProps) {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; description: string }> = {
      draft: {
        label: 'Brouillon',
        description: 'Document en cours de rédaction'
      },
      pending_validation: {
        label: 'En validation',
        description: 'Document soumis pour validation'
      },
      validated: {
        label: 'Validé',
        description: 'Document validé et prêt à envoyer'
      },
      sent: {
        label: 'Envoyé',
        description: 'Document envoyé au client'
      },
      accepted: {
        label: 'Accepté',
        description: 'Document accepté par le client'
      },
      rejected: {
        label: 'Rejeté',
        description: 'Document rejeté par le client'
      },
      cancelled: {
        label: 'Annulé',
        description: 'Document annulé'
      }
    };

    return configs[status] || { label: status, description: '' };
  };

  // Ordre logique des statuts
  const statusOrder = ['draft', 'pending_validation', 'validated', 'sent', 'accepted'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const events: TimelineEvent[] = statusOrder.map((status, index) => {
    const config = getStatusConfig(status);
    const historyItem = statusHistory.find(h => h.status === status);
    
    return {
      id: status,
      status,
      label: config.label,
      description: historyItem?.notes || config.description,
      timestamp: historyItem?.timestamp || new Date(),
      user: historyItem?.user,
      isCompleted: index < currentIndex || status === currentStatus,
      isCurrent: status === currentStatus,
      isError: status === 'rejected' || status === 'cancelled'
    };
  }).filter(event => 
    // Afficher seulement les statuts atteints ou le suivant logique
    event.isCompleted || event.isCurrent || statusOrder.indexOf(event.status) === currentIndex + 1
  );

  return (
    <StatusTimeline
      events={events}
      className={className}
      compact={events.length > 4}
    />
  );
}