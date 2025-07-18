import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MoreHorizontal, RefreshCcw } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Invitation, getInvitations, resendInvitation } from '../../lib/api/admin';
import { toast } from 'sonner';
import { format, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import RoleBadges from './RoleBadges';

const InvitationManagement: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setIsLoading(true);
    try {
      const data = await getInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      toast.error('Impossible de charger les invitations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      await resendInvitation(invitation.id);
      toast.success(`Invitation renvoyée à ${invitation.email}`);
      fetchInvitations();
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'invitation:', error);
      toast.error('Impossible de renvoyer l\'invitation');
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

  // Fonction pour vérifier si une invitation est expirée
  const isExpired = (expiresAt: string) => {
    try {
      return isAfter(new Date(), new Date(expiresAt));
    } catch (error) {
      return false;
    }
  };
  
  return (
    <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
          <CardTitle>Invitations en attente</CardTitle>
          <CardDescription>Gérer les invitations envoyées aux utilisateurs</CardDescription>
          </div>
        <Button variant="outline" size="icon" onClick={fetchInvitations}>
          <RefreshCcw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Date d'envoi</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.length > 0 ? (
                  invitations.map((invitation) => {
                    const expired = isExpired(invitation.expires_at);
                    return (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invitation.first_name} {invitation.last_name}</div>
                            <div className="text-sm text-muted-foreground">{invitation.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadges roles={invitation.roles} />
                        </TableCell>
                        <TableCell>{formatDate(invitation.created_at)}</TableCell>
                        <TableCell>{formatDate(invitation.expires_at)}</TableCell>
                        <TableCell>
                          {invitation.is_accepted ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Acceptée
                            </Badge>
                          ) : expired ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Expirée
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              En attente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              {!invitation.is_accepted && (
                                <DropdownMenuItem onClick={() => handleResendInvitation(invitation)}>
                                  Renvoyer l'invitation
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </TableCell>
                  </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Aucune invitation en attente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        </CardContent>
      </Card>
  );
};

export default InvitationManagement; 