import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/hooks/useRole';

interface CreateUserFormProps {
  onUserCreated?: () => void;
}

const CreateUserForm = ({ onUserCreated }: CreateUserFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState<UserRole>('commercial');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer l'utilisateur via l'API Admin de Supabase
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          nom,
          prenom,
          role,
        },
        email_confirm: true, // Confirmer automatiquement l'email
      });

      if (error) throw error;

      // Mettre à jour le profil avec le bon rôle
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            nom, 
            prenom, 
            role 
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil:', profileError);
        }
      }

      toast({
        title: "Utilisateur créé avec succès",
        description: `L'utilisateur ${prenom} ${nom} a été créé avec le rôle ${role}`,
      });

      // Réinitialiser le formulaire
      setEmail('');
      setPassword('');
      setNom('');
      setPrenom('');
      setRole('commercial');

      if (onUserCreated) {
        onUserCreated();
      }
    } catch (error: any) {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    <Card>
      <CardHeader>
        <CardTitle>Créer un nouvel utilisateur</CardTitle>
        <CardDescription>
          Seuls les administrateurs peuvent créer de nouveaux comptes utilisateur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe temporaire</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">{getRoleLabel('commercial')}</SelectItem>
                <SelectItem value="agent">{getRoleLabel('agent')}</SelectItem>
                <SelectItem value="dg">{getRoleLabel('dg')}</SelectItem>
                <SelectItem value="admin">{getRoleLabel('admin')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer l\'utilisateur'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateUserForm;
