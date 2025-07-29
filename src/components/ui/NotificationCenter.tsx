import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertSystem, Alert, AlertType, NotificationSettings } from '@/lib/services/AlertSystem';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showButton?: boolean;
  maxVisible?: number;
}

export function NotificationCenter({ 
  position = 'top-right',
  showButton = true,
  maxVisible = 5 
}: NotificationCenterProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>(AlertSystem.getSettings());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // S'abonner aux changements d'alertes
    const unsubscribe = AlertSystem.subscribe(setAlerts);
    
    // Charger les alertes initiales
    setAlerts(AlertSystem['alerts'] || []);
    
    return unsubscribe;
  }, []);

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const visibleAlerts = alerts.slice(0, maxVisible);

  const getAlertIcon = (type: AlertType) => {
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: XCircle,
      critical: AlertCircle
    };
    return icons[type];
  };

  const getAlertColor = (type: AlertType) => {
    const colors = {
      info: 'text-blue-600 bg-blue-50 border-blue-200',
      success: 'text-green-600 bg-green-50 border-green-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      error: 'text-red-600 bg-red-50 border-red-200',
      critical: 'text-red-600 bg-red-100 border-red-300'
    };
    return colors[type];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsRead = (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    AlertSystem.markAsRead(alertId);
  };

  const handleDismiss = (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    AlertSystem.dismissAlert(alertId);
  };

  const handleMarkAllAsRead = () => {
    AlertSystem.markAllAsRead();
  };

  const handleDismissAll = () => {
    AlertSystem.dismissAll();
  };

  const handleSettingsChange = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    AlertSystem.updateSettings(newSettings);
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    };
    return positions[position];
  };

  return (
    <>
      {/* Bouton de notification */}
      {showButton && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  variant="destructive"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Notifications</h3>
                <div className="flex gap-2">
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <NotificationSettings 
                      settings={settings}
                      onSettingsChange={handleSettingsChange}
                    />
                  </Dialog>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {alerts.length > 0 && (
                <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                  <span>{unreadCount} non lue(s)</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDismissAll}
                    className="text-xs"
                  >
                    Tout supprimer
                  </Button>
                </div>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {visibleAlerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {visibleAlerts.map(alert => {
                    const Icon = getAlertIcon(alert.type);
                    return (
                      <Card 
                        key={alert.id}
                        className={cn(
                          'cursor-pointer transition-all duration-200 hover:shadow-md',
                          !alert.isRead && 'border-l-4 border-l-blue-500',
                          alert.isDismissed && 'opacity-50'
                        )}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'p-1 rounded-full',
                              getAlertColor(alert.type)
                            )}>
                              <Icon className="h-4 w-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className={cn(
                                    'font-medium text-sm',
                                    !alert.isRead && 'font-semibold'
                                  )}>
                                    {alert.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {alert.message}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-1 ml-2">
                                  <Badge 
                                    variant="outline" 
                                    className={cn('text-xs', getPriorityColor(alert.priority))}
                                  >
                                    {alert.priority}
                                  </Badge>
                                  
                                  {!alert.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleMarkAsRead(alert.id, e)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  
                                  {!alert.persistent && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleDismiss(alert.id, e)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(alert.timestamp)}
                                </span>
                                
                                {alert.actions && alert.actions.length > 0 && (
                                  <div className="flex gap-1">
                                    {alert.actions.slice(0, 2).map((action, index) => (
                                      <Button
                                        key={index}
                                        variant={action.style === 'primary' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          action.action();
                                        }}
                                        className="text-xs h-6"
                                      >
                                        {action.label}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            
            {alerts.length > maxVisible && (
              <div className="border-t p-2 text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  Voir toutes les notifications ({alerts.length})
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}

      {/* Notifications flottantes */}
      <div className={cn('fixed z-50 space-y-2', getPositionClasses())}>
        {visibleAlerts
          .filter(alert => !alert.isDismissed && alert.priority === 'urgent')
          .slice(0, 3)
          .map(alert => {
            const Icon = getAlertIcon(alert.type);
            return (
              <Card 
                key={`floating-${alert.id}`}
                className={cn(
                  'w-80 shadow-lg border-l-4 animate-in slide-in-from-right-5',
                  getAlertColor(alert.type)
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                      {alert.actions && (
                        <div className="flex gap-2 mt-3">
                          {alert.actions.slice(0, 2).map((action, index) => (
                            <Button
                              key={index}
                              variant={action.style === 'primary' ? 'default' : 'outline'}
                              size="sm"
                              onClick={action.action}
                              className="text-xs"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => AlertSystem.dismissAlert(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </>
  );
}

// Composant pour les paramètres de notification
function NotificationSettings({ 
  settings, 
  onSettingsChange 
}: { 
  settings: NotificationSettings;
  onSettingsChange: (settings: Partial<NotificationSettings>) => void;
}) {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Paramètres des notifications</DialogTitle>
      </DialogHeader>
      
      <Tabs defaultValue="general" className="mt-4">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Activer les notifications</Label>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => onSettingsChange({ enabled })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sound">Son des notifications</Label>
            <Switch
              id="sound"
              checked={settings.sound}
              onCheckedChange={(sound) => onSettingsChange({ sound })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="desktop">Notifications desktop</Label>
            <Switch
              id="desktop"
              checked={settings.desktop}
              onCheckedChange={(desktop) => onSettingsChange({ desktop })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="urgentOnly">Seulement les urgentes</Label>
            <Switch
              id="urgentOnly"
              checked={settings.showOnlyUrgent}
              onCheckedChange={(showOnlyUrgent) => onSettingsChange({ showOnlyUrgent })}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="types" className="space-y-4">
          {Object.entries(settings.types).map(([type, enabled]) => (
            <div key={type} className="flex items-center justify-between">
              <Label className="capitalize">{type}</Label>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ 
                    types: { ...settings.types, [type]: checked }
                  })
                }
              />
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          {Object.entries(settings.categories).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <Label className="capitalize">{category.replace('_', ' ')}</Label>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ 
                    categories: { ...settings.categories, [category]: checked }
                  })
                }
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
}