import { useState, useEffect, useCallback } from 'react';
import { adminApi, User, Role, Invitation, CreateInvitationData } from '@/lib/api/admin';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { toast } = useToast();
  
  // États
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState({
    users: false,
    invitations: false,
    roles: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  // Chargement des utilisateurs
  const fetchUsers = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    setError(null);
    
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
      toast({
        title: "Erreur",
        description: err.message || 'Erreur lors du chargement des utilisateurs',
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [toast]);
  
  // Chargement des invitations
  const fetchInvitations = useCallback(async () => {
    setLoading(prev => ({ ...prev, invitations: true }));
    setError(null);
    
    try {
      const data = await adminApi.getAllInvitations();
      setInvitations(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des invitations');
      toast({
        title: "Erreur",
        description: err.message || 'Erreur lors du chargement des invitations',
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, invitations: false }));
    }
  }, [toast]);
  
  // Chargement des rôles
  const fetchRoles = useCallback(async () => {
    setLoading(prev => ({ ...prev, roles: true }));
    setError(null);
    
    try {
      const data = await adminApi.getAllRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des rôles');
      toast({
        title: "Erreur",
        description: err.message || 'Erreur lors du chargement des rôles',
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  }, [toast]);
  
  // Activer/désactiver un utilisateur
  const toggleUserStatus = useCallback(async (userId: number, isActive: boolean) => {
    try {
      const updatedUser = await adminApi.toggleUserStatus(userId, isActive);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: isActive ? 'active' : 'inactive' } : user
        )
      );
      
      toast({
        title: "Succès",
        description: `L'utilisateur a été ${isActive ? 'activé' : 'désactivé'} avec succès`,
      });
      
      return updatedUser;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || `Erreur lors de la modification du statut de l'utilisateur`,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);
  
  // Créer une invitation
  const createInvitation = useCallback(async (data: CreateInvitationData) => {
    try {
      const newInvitation = await adminApi.createInvitation(data);
      setInvitations(prev => [...prev, newInvitation]);
      
      toast({
        title: "Succès",
        description: `L'invitation a été envoyée à ${data.email}`,
      });
      
      return newInvitation;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || `Erreur lors de l'envoi de l'invitation`,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);
  
  // Renvoyer une invitation
  const resendInvitation = useCallback(async (invitationId: number) => {
    try {
      const updatedInvitation = await adminApi.resendInvitation(invitationId);
      setInvitations(prev => 
        prev.map(invitation => 
          invitation.id === invitationId ? updatedInvitation : invitation
        )
      );
      
      toast({
        title: "Succès",
        description: `L'invitation a été renvoyée`,
      });
      
      return updatedInvitation;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || `Erreur lors du renvoi de l'invitation`,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);
  
  // Supprimer une invitation
  const deleteInvitation = useCallback(async (invitationId: number) => {
    try {
      await adminApi.deleteInvitation(invitationId);
      setInvitations(prev => prev.filter(invitation => invitation.id !== invitationId));
      
      toast({
        title: "Succès",
        description: `L'invitation a été supprimée`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || `Erreur lors de la suppression de l'invitation`,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);
  
  // Récupérer un utilisateur spécifique
  const getUser = useCallback(async (userId: number) => {
    try {
      const userData = await adminApi.getUser(userId);
      return userData;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || `Erreur lors de la récupération des détails de l'utilisateur`,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);
  
  // Charger les données initiales
  useEffect(() => {
    fetchUsers();
    fetchInvitations();
    fetchRoles();
  }, [fetchUsers, fetchInvitations, fetchRoles]);
  
  return {
    users,
    invitations,
    roles,
    loading,
    error,
    fetchUsers,
    fetchInvitations,
    fetchRoles,
    toggleUserStatus,
    createInvitation,
    resendInvitation,
    deleteInvitation,
    getUser,
  };
};

export default useAdmin; 