
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const UserMenu = () => {
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    } else {
      toast.success('Déconnexion réussie');
    }
  };

  if (!profile) return null;

  const roleLabels = {
    admin: 'Administrateur',
    directeur: 'Directeur',
    agent: 'Agent',
    commercial: 'Commercial'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
            {profile.prenom.charAt(0)}{profile.nom.charAt(0)}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium">{profile.prenom} {profile.nom}</div>
            <div className="text-xs text-gray-500">{roleLabels[profile.role]}</div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{profile.prenom} {profile.nom}</p>
          <p className="text-xs text-gray-500">{profile.email}</p>
          <p className="text-xs text-gray-500">{roleLabels[profile.role]}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
