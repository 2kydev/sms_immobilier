
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/hooks/useRole';

interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface UserCardProps {
  user: UserProfile;
  onRoleUpdate: (userId: string, newRole: UserRole) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
}

const UserCard = ({ user, onRoleUpdate, onStatusToggle }: UserCardProps) => {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
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
            onClick={() => onStatusToggle(user.id, user.is_active)}
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
                onClick={() => onRoleUpdate(user.id, roleOption)}
                disabled={user.role === roleOption}
              >
                {getRoleLabel(roleOption)}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
