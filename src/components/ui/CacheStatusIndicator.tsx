import React from 'react';
import { Database, Clock, Zap, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface CacheStatusIndicatorProps {
  isFromCache: boolean;
  cacheKey?: string;
  hitRate?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function CacheStatusIndicator({
  isFromCache,
  cacheKey,
  hitRate,
  size = 'sm',
  showDetails = false,
  className
}: CacheStatusIndicatorProps) {
  const getStatusConfig = () => {
    if (isFromCache) {
      return {
        icon: Database,
        label: 'Cache',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Données servies depuis le cache'
      };
    } else {
      return {
        icon: Zap,
        label: 'Réseau',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Données récupérées depuis le serveur'
      };
    }
  };

  const getHitRateConfig = (rate?: number) => {
    if (rate === undefined) return null;
    
    if (rate >= 80) {
      return {
        icon: Database,
        label: `${rate.toFixed(1)}%`,
        color: 'bg-green-100 text-green-800',
        description: 'Excellent taux de cache'
      };
    } else if (rate >= 60) {
      return {
        icon: Clock,
        label: `${rate.toFixed(1)}%`,
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Taux de cache correct'
      };
    } else {
      return {
        icon: AlertCircle,
        label: `${rate.toFixed(1)}%`,
        color: 'bg-red-100 text-red-800',
        description: 'Taux de cache faible'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const hitRateConfig = getHitRateConfig(hitRate);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                statusConfig.color,
                sizeClasses[size],
                'inline-flex items-center gap-1',
                className
              )}
            >
              <statusConfig.icon className={iconSizes[size]} />
              {size !== 'sm' && statusConfig.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{statusConfig.description}</p>
              {cacheKey && (
                <p className="text-xs text-gray-500">Clé: {cacheKey.slice(-20)}...</p>
              )}
              {hitRate !== undefined && (
                <p className="text-xs">Taux de cache: {hitRate.toFixed(1)}%</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge
        variant="outline"
        className={cn(
          statusConfig.color,
          sizeClasses[size],
          'inline-flex items-center gap-1'
        )}
      >
        <statusConfig.icon className={iconSizes[size]} />
        {statusConfig.label}
      </Badge>
      
      {hitRateConfig && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  hitRateConfig.color,
                  sizeClasses[size],
                  'inline-flex items-center gap-1'
                )}
              >
                <hitRateConfig.icon className={iconSizes[size]} />
                {hitRateConfig.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hitRateConfig.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {cacheKey && size === 'lg' && (
        <span className="text-xs text-gray-500 font-mono">
          {cacheKey.slice(-12)}
        </span>
      )}
    </div>
  );
}