
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

const AuthForm = ({ mode, onModeChange }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou mot de passe incorrect');
          } else {
            toast.error('Erreur de connexion: ' + error.message);
          }
        } else {
          toast.success('Connexion réussie !');
        }
      } else {
        const { error } = await signUp(email, password, { nom, prenom });
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Un utilisateur avec cet email existe déjà');
          } else {
            toast.error('Erreur d\'inscription: ' + error.message);
          }
        } else {
          toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
        }
      }
    } catch (error) {
      toast.error('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          {mode === 'signin' ? 'Connexion' : 'Inscription'}
        </CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? 'Connectez-vous à votre compte CRM' 
            : 'Créez votre compte CRM'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
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
            </>
          )}
          
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
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Chargement...' : (mode === 'signin' ? 'Se connecter' : 'S\'inscrire')}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' 
              ? 'Pas de compte ? Inscrivez-vous' 
              : 'Déjà un compte ? Connectez-vous'
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
