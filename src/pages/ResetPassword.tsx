import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isProcessingTokens, setIsProcessingTokens] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = 'Réinitialiser le mot de passe | SMS Immobilier';

    const checkRecoveryTokens = async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');
        const code = searchParams.get('code');
        const queryType = searchParams.get('type');

        console.log('Recovery URL params:', {
          hashAccessToken: !!hashAccessToken,
          hashRefreshToken: !!hashRefreshToken,
          hashType,
          code: !!code,
          queryType
        });

        // Case 1: Tokens in hash fragment
        if (hashAccessToken && hashRefreshToken && (hashType === 'recovery' || hashType === 'recovery_token')) {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: hashAccessToken,
            refresh_token: hashRefreshToken
          });
          if (error) {
            console.error('Error setting recovery session from hash:', error);
            setHasRecovery(false);
          } else {
            console.log('Recovery session set from hash:', !!session);
            setHasRecovery(true);
            // Clean hash from URL
            history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
          }
          return;
        }

        // Case 2: Code flow (Supabase v2)
        if (code && (queryType === 'recovery' || !queryType)) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            setHasRecovery(false);
          } else {
            console.log('Recovery session set from code:', !!data.session);
            setHasRecovery(true);
            // Clean query params
            searchParams.delete('code');
            searchParams.delete('type');
            history.replaceState(null, '', currentUrl.pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
          }
          return;
        }

        // Fallback: is there an existing signed session?
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Existing session on /reset-password:', !!session);
        setHasRecovery(!!session);
      } catch (error) {
        console.error('Error processing recovery tokens:', error);
        setHasRecovery(false);
      } finally {
        setSessionChecked(true);
        setIsProcessingTokens(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change on /reset-password:', event, !!session);
      if (event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setHasRecovery(true);
      }
    });

    checkRecoveryTokens();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: 'Mot de passe trop court',
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Les mots de passe ne correspondent pas',
        description: 'Veuillez vérifier vos entrées.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      });
      // Déconnecte toute session précédente par sécurité
      await supabase.auth.signOut();
      navigate('/auth', { replace: true });
    } catch (err: any) {
      toast({
        title: "Échec de la réinitialisation",
        description: err.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        {sessionChecked && !hasRecovery ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Lien invalide ou expiré</CardTitle>
              <CardDescription className="text-center">
                Votre lien de réinitialisation est invalide ou a expiré. Veuillez relancer la procédure depuis la page de connexion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/auth', { replace: true })}>
                Retour à la connexion
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Réinitialiser le mot de passe</CardTitle>
              <CardDescription className="text-center">
                Saisissez votre nouveau mot de passe ci-dessous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;
