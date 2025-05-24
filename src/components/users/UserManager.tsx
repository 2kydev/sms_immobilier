
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, roles } from '../pipeline/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import UserDialog from './UserDialog';
import ProtectedRoute from '../auth/ProtectedRoute';

const UserManager = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAdmin, logActivity } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (user: Profile) => {
    try {
      const newStatus = !user.is_active;
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      await logActivity(
        newStatus ? 'user_activated' : 'user_deactivated',
        'profiles',
        user.id,
        { is_active: user.is_active },
        { is_active: newStatus }
      );

      fetchUsers();
      toast({
        title: "Succès",
        description: `Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (user: Profile) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.prenom} ${user.nom} ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      await logActivity('user_deleted', 'profiles', user.id, user, null);

      fetchUsers();
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès"
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const openUserDialog = (user?: Profile) => {
    setSelectedUser(user || null);
    setIsDialogOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'directeur': return 'bg-blue-100 text-blue-800';
      case 'agent': return 'bg-green-100 text-green-800';
      case 'commercial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Chargement des utilisateurs...</div>;
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
          {isAdmin() && (
            <Button onClick={() => openUserDialog()} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  {isAdmin() && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.prenom} {user.nom}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {roles.find(r => r.key === user.role)?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    {isAdmin() && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUserDialog(user)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user)}
                            className={user.is_active ? "text-orange-600" : "text-green-600"}
                          >
                            {user.is_active ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteUser(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <UserDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          user={selectedUser}
          onSave={fetchUsers}
        />
      </div>
    </ProtectedRoute>
  );
};

export default UserManager;
