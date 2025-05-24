
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, roles } from '../pipeline/types';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: Profile | null;
  onSave: () => void;
}

const UserDialog: React.FC<UserDialogProps> = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    role: 'agent' as const,
    is_active: true,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { signUp, logActivity } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        is_active: user.is_active,
        password: ''
      });
    } else {
      setFormData({
        email: '',
        nom: '',
        prenom: '',
        role: 'agent',
        is_active: true,
        password: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.nom || !formData.prenom) return;

    setLoading(true);
    try {
      if (user) {
        // Mise à jour d'un utilisateur existant
        const { error } = await supabase
          .from('profiles')
          .update({
            email: formData.email,
            nom: formData.nom,
            prenom: formData.prenom,
            role: formData.role,
            is_active: formData.is_active
          })
          .eq('id', user.id);

        if (error) throw error;

        await logActivity(
          'user_updated',
          'profiles',
          user.id,
          user,
          formData
        );

        toast({
          title: "Succès",
          description: "Utilisateur mis à jour avec succès"
        });
      } else {
        // Création d'un nouvel utilisateur
        if (!formData.password) {
          toast({
            title: "Erreur",
            description: "Le mot de passe est requis pour créer un utilisateur",
            variant: "destructive"
          });
          return;
        }

        await signUp(
          formData.email,
          formData.password,
          formData.nom,
          formData.prenom,
          formData.role
        );

        await logActivity('user_created', 'profiles', undefined, null, formData);

        toast({
          title: "Succès",
          description: "Utilisateur créé avec succès"
        });
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.key} value={role.key}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Compte actif</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
