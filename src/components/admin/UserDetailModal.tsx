import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { CalendarIcon, UserIcon, KeyIcon, ShieldIcon, ClockIcon, ActivityIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Role, getUserTokens, getUserActivities, getLoginStatisticsSummary, updateUserRoles, revokeToken, activateUser, deactivateUser } from '../../lib/api/admin';
import { getRoles } from '../../lib/api/admin';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Chart } from '../Chart';
import { Alert, AlertDescription } from '../ui/alert';
import RoleBadges from './RoleBadges';
import UserStatusBadge from './UserStatusBadge';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen, 
  onClose, 
  user,
  onUserUpdated
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [userTokens, setUserTokens] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loginStats, setLoginStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchRoles();
      fetchUserTokens();
      fetchUserActivities();
      fetchLoginStats();
      
      // Initialiser les rôles sélectionnés
      const userRoleIds = user.roles.map(ur => ur.role.id);
      setSelectedRoles(userRoleIds);
    }
  }, [isOpen, user]);

    const fetchRoles = async () => {
      try {
      const roles = await getRoles();
      setAvailableRoles(roles);
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
    }
  };

  const fetchUserTokens = async () => {
    if (!user) return;
    try {
      const tokens = await getUserTokens(user.id);
      setUserTokens(tokens);
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
    }
  };

  const fetchUserActivities = async () => {
    if (!user) return;
    try {
      const activities = await getUserActivities(user.id);
      setUserActivities(activities);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
    }
  };

  const fetchLoginStats = async () => {
    if (!user) return;
    try {
      const stats = await getLoginStatisticsSummary(user.id, 90);
      setLoginStats(stats);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSaveRoles = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateUserRoles(user.id, selectedRoles);
      onUserUpdated();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des rôles:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleToggleStatus = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      if (user.status === 'active') {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      onUserUpdated();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRevokeToken = async (tokenId: number) => {
    setIsLoading(true);
    try {
      await revokeToken(tokenId);
      fetchUserTokens();
    } catch (error) {
      console.error('Erreur lors de la révocation du token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy à HH:mm', { locale: fr });
    } catch (error) {
      return 'Date invalide';
    }
  };

  // Fonction pour extraire les informations de l'user agent
  const parseUserAgent = (userAgent: string) => {
    let device = 'Inconnu';
    let browser = 'Inconnu';
    
    if (userAgent.includes('Windows')) device = 'Windows';
    else if (userAgent.includes('Macintosh')) device = 'Mac';
    else if (userAgent.includes('iPhone')) device = 'iPhone';
    else if (userAgent.includes('iPad')) device = 'iPad';
    else if (userAgent.includes('Android')) device = 'Android';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    return { device, browser };
  };

  if (!user) return null;

  const chartData = loginStats?.daily_data ? {
    labels: loginStats.daily_data.map((d: any) => d.date),
    datasets: [
      {
        label: 'Connexions',
        data: loginStats.daily_data.map((d: any) => d.logins),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3
      }
    ]
  } : null;
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            <span>
              {user.first_name} {user.last_name}
              <span className="ml-2">
                <UserStatusBadge status={user.status} />
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mb-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="sessions">Sessions actives</TabsTrigger>
            <TabsTrigger value="activity">Historique d'activité</TabsTrigger>
            </TabsList>
            
          <ScrollArea className="flex-1">
            <TabsContent value="profile" className="space-y-4">
                <Card>
                  <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <div className="bg-primary text-white h-full w-full flex items-center justify-center text-xl font-semibold">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                    </Avatar>
                        <div>
                      <h3 className="text-lg font-semibold">{user.first_name} {user.last_name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.company}</p>
                        </div>
                      </div>
                      
                  <div className="grid grid-cols-2 gap-4">
                        <div>
                      <p className="text-sm font-medium">Nom d'utilisateur</p>
                      <p className="text-sm text-muted-foreground">{user.username}</p>
                      </div>
                        <div>
                      <p className="text-sm font-medium">Statut</p>
                      <UserStatusBadge status={user.status} />
                    </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                  <CardTitle>Rôles et permissions</CardTitle>
                  <CardDescription>Gérer les rôles de l'utilisateur</CardDescription>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Rôles actuels</h4>
                    <div className="flex flex-wrap gap-2">
                      <RoleBadges roles={user.roles.map(ur => ur.role)} />
                        </div>
                      </div>
                      
                  <Separator />
                  
                        <div>
                    <h4 className="text-sm font-medium mb-2">Modifier les rôles</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableRoles.map(role => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`role-${role.id}`} 
                            checked={selectedRoles.includes(role.id)} 
                            onCheckedChange={() => handleToggleRole(role.id)} 
                          />
                          <label htmlFor={`role-${role.id}`} className="text-sm font-medium">
                            {role.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                  <CardTitle>Statistiques de connexion</CardTitle>
                  </CardHeader>
                <CardContent>
                  {chartData ? (
                    <>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-muted p-3 rounded-lg text-center">
                          <h4 className="text-sm font-medium">Connexions</h4>
                          <p className="text-2xl font-bold">{loginStats.total_logins}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                          <h4 className="text-sm font-medium">Publications</h4>
                          <p className="text-2xl font-bold">{loginStats.total_posts}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                          <h4 className="text-sm font-medium">Stories</h4>
                          <p className="text-2xl font-bold">{loginStats.total_stories}</p>
                        </div>
                      </div>
                      <div className="h-64">
                        <Chart type="line" data={chartData} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">Aucune donnée disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sessions actives</CardTitle>
                  <CardDescription>Liste des appareils connectés à ce compte</CardDescription>
                </CardHeader>
                <CardContent>
                  {userTokens.length > 0 ? (
                    <div className="space-y-4">
                      {userTokens.map(token => {
                        const { device, browser } = parseUserAgent(token.user_agent);
                        return (
                          <div key={token.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <KeyIcon className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{device} - {browser}</span>
                                {token.is_active ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Actif
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Révoqué
                                  </Badge>
                                )}
                              </div>
                              {token.is_active && (
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => handleRevokeToken(token.id)}
                                  disabled={isLoading}
                                >
                                  Révoquer
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">IP:</span> {token.ip_address || 'Inconnue'}
                              </div>
                              <div>
                                <span className="font-medium">Dernière utilisation:</span> {formatDate(token.last_used_at)}
                              </div>
                              <div>
                                <span className="font-medium">Créé le:</span> {formatDate(token.created_at)}
                              </div>
                              <div>
                                <span className="font-medium">Expire le:</span> {formatDate(token.expires_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">Aucune session active</p>
                  </div>
                  )}
                </CardContent>
              </Card>
              
              {userTokens.some(token => token.is_active) && (
                <Alert variant="destructive">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    Si vous constatez des sessions suspectes, révoquez-les immédiatement et changez le mot de passe du compte.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historique d'activité</CardTitle>
                  <CardDescription>Dernières actions effectuées par l'utilisateur</CardDescription>
                </CardHeader>
                <CardContent>
                  {userActivities.length > 0 ? (
                    <div className="space-y-4">
                      {userActivities.map(activity => (
                        <div key={activity.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{activity.action}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatDate(activity.created_at)}
                            </div>
                            {activity.ip_address && (
                              <div>IP: {activity.ip_address}</div>
                            )}
                          </div>
                          {activity.details && (
                            <div className="mt-1 text-xs bg-muted p-2 rounded">
                              <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">Aucune activité enregistrée</p>
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
          </Tabs>
        
        <DialogFooter className="flex justify-between">
          <div>
            <Button 
              variant={user.status === 'active' ? 'destructive' : 'default'} 
              onClick={handleToggleStatus}
              disabled={isUpdating}
            >
              {user.status === 'active' ? 'Désactiver' : 'Activer'} l'utilisateur
          </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
            <Button onClick={handleSaveRoles} disabled={isUpdating}>Enregistrer les modifications</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
