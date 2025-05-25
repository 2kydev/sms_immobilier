import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/hooks/useRole';
import RoleGuard from './RoleGuard';
import CreateUserForm from './CreateUserForm';

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
      
      setUsers(data || []);
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

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'dg': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'commercial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'dg': return 'Directeur Général';
      case 'commercial': return 'Commercial';
      case 'agent': return 'Agent Immobilier';
      default: return role;
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
          <Card>
            <CardContent className="px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-lg font-bold text-primary">{users.length}</span>
                <span className="text-sm text-gray-600">utilisateurs</span>
              </div>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {user.prenom} {user.nom}
                      </CardTitle>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <p><span className="font-medium">Membre depuis:</span> {new Date(user.created_at).toLocaleDateString('fr-FR')}</p>
                      <p><span className="font-medium">Statut:</span> {user.is_active ? 'Actif' : 'Inactif'}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={user.is_active ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className="w-full"
                      >
                        {user.is_active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Changer le rôle:</p>
                      <div className="flex flex-wrap gap-2">
                        {(['admin', 'dg', 'commercial', 'agent'] as UserRole[]).map((roleOption) => (
                          <Button
                            key={roleOption}
                            variant={user.role === roleOption ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateUserRole(user.id, roleOption)}
                            disabled={user.role === roleOption}
                          >
                            {getRoleLabel(roleOption)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
};

export default UserManager;
