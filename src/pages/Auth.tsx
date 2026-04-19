import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, signIn } = useAuth();
  const { toast } = useToast();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: "Connexion réussie", description: "Bienvenue !" });
    } catch (error: any) {
      if (error.message.includes('Email not confirmed')) {
        localStorage.setItem('pendingEmail', email);
        toast({
          title: "Email non confirmé",
          description: "Veuillez confirmer votre email avant de vous connecter.",
          variant: "destructive",
        });
        window.location.href = '/email-confirmation';
        return;
      }
      toast({
        title: "Identifiants incorrects",
        description: "Email ou mot de passe invalide.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: 'Entrez votre email', description: 'Saisissez votre email pour recevoir le lien.', variant: 'destructive' });
      return;
    }
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte de réception.' });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img
            src="/lovable-uploads/2f182060-60bf-4ab5-a6b2-e6092170b088.png"
            alt="SMS Immobilier"
            className="h-12 w-12 object-contain"
          />
          <span className="text-white text-xl font-bold">SMS Immobilier</span>
        </div>
        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Gérez votre activité immobilière en toute simplicité
          </h1>
          <p className="text-white/70 text-lg">
            Clients, biens, visites et performances — tout en un seul endroit.
          </p>
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Building2 className="h-4 w-4" />
          <span>SMS Immobilier CRM</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img
              src="/lovable-uploads/2f182060-60bf-4ab5-a6b2-e6092170b088.png"
              alt="SMS Immobilier"
              className="h-10 w-10 object-contain"
            />
            <span className="text-primary text-xl font-bold">SMS Immobilier</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
          <p className="text-gray-500 mb-8">Entrez vos identifiants pour accéder à votre espace.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <span className="text-primary font-medium">Contactez votre administrateur.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
