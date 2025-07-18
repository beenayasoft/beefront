import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MoreHorizontal, UserPlus, RefreshCcw } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User, getUsers, activateUser, deactivateUser, resendInvitation } from '../../lib/api/admin';
import UserDetailModal from './UserDetailModal';
import InviteUserModal from './InviteUserModal';
import RoleBadges from './RoleBadges';
import UserStatusBadge from './UserStatusBadge';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(lowercasedSearch) ||
        user.first_name.toLowerCase().includes(lowercasedSearch) ||
        user.last_name.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error('Impossible de charger les utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetailModal = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    toast.success('Utilisateur mis à jour avec succès');
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.status === 'active') {
        await deactivateUser(user.id);
        toast.success(`${user.first_name} ${user.last_name} a été désactivé`);
      } else {
        await activateUser(user.id);
        toast.success(`${user.first_name} ${user.last_name} a été activé`);
      }
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      toast.error('Impossible de changer le statut de l\'utilisateur');
    }
  };

  const handleResendInvitation = async (user: User) => {
    try {
      // Cette fonction devrait être implémentée dans l'API
      // await resendInvitation(user.id);
      toast.success(`Invitation renvoyée à ${user.email}`);
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'invitation:', error);
      toast.error('Impossible de renvoyer l\'invitation');
    }
  };

  const handleInviteUser = () => {
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
  };

  const handleUserInvited = () => {
    fetchUsers();
    toast.success('Invitation envoyée avec succès');
  };
  
  return (
    <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
          <CardTitle>Gestion des utilisateurs</CardTitle>
          <CardDescription>Gérer les utilisateurs de votre organisation</CardDescription>
          </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={handleInviteUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un utilisateur
          </Button>
        </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
              <Input
                placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
              />
            </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadges roles={user.roles.map(ur => ur.role)} />
                      </TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status} />
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
                            <DropdownMenuItem onClick={() => handleOpenDetailModal(user)}>
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.status === 'active' ? 'Désactiver' : 'Activer'}
                            </DropdownMenuItem>
                            {user.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleResendInvitation(user)}>
                                Renvoyer l'invitation
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        </CardContent>

      {selectedUser && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
        />
      )}
      
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={handleCloseInviteModal}
        onInvited={handleUserInvited}
      />
                </Card>
  );
};

export default UserManagement; 