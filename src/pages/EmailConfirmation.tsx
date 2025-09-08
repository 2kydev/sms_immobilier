import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const EmailConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const { emailConfirmationSent, resendConfirmation } = useAuth();
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    const email = localStorage.getItem('pendingEmail');
    if (!email) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'email. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await resendConfirmation(email);
      toast({
        title: "Email renvoyé",
        description: "Vérifiez votre boîte de réception.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            {emailConfirmationSent ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <Mail className="w-16 h-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Confirmez votre email</CardTitle>
          <CardDescription>
            Un email de confirmation a été envoyé à votre adresse. Cliquez sur le lien dans l'email pour activer votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Vous n'avez pas reçu l'email ?</p>
            <p>Vérifiez votre dossier spam ou cliquez sur le bouton ci-dessous pour renvoyer l'email.</p>
          </div>
          
          <Button 
            onClick={handleResendConfirmation} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Renvoyer l'email
              </>
            )}
          </Button>

          <div className="text-center">
            <Link to="/auth" className="text-sm text-primary hover:underline">
              ← Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;