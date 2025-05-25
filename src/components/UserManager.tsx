
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/hooks/useRole';
import RoleGuard from './RoleGuard';
import CreateUserForm from './CreateUserForm';
import UserList from './user/UserList';
import UserStats from './user/UserStats';

interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

const UserManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the role field to UserRole type
      const typedUsers = (data || []).map(user => ({
        ...user,
        role: user.role as UserRole
      }));
      
      setUsers(typedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle utilisateur mis à jour"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Utilisateur ${!isActive ? 'activé' : 'désactivé'}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des utilisateurs...</div>;
  }

  return (
    <RoleGuard requiredRole="admin" fallback={
      <div className="p-6 text-center">
        <p className="text-gray-500">Vous n'avez pas les permissions pour accéder à cette page.</p>
      </div>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
          <UserStats userCount={users.length} />
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Liste des utilisateurs</TabsTrigger>
            <TabsTrigger value="create">Créer un utilisateur</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <CreateUserForm onUserCreated={fetchUsers} />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <UserList
              users={users}
              onRoleUpdate={updateUserRole}
              onStatusToggle={toggleUserStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
};

export default UserManager;
