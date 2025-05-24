
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Profile, RoleType, isValidRole } from '../pipeline/types';

interface UserFormData {
  email: string;
  nom: string;
  prenom: string;
  role: RoleType;
  is_active: boolean;
  password: string;
}

export const useUserForm = (user: Profile | null, onSave: () => void, onClose: () => void) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    nom: '',
    prenom: '',
    role: 'agent' as RoleType,
    is_active: true,
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { signUp, logActivity } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      // Validate and cast the role from database
      const role = isValidRole(user.role) ? user.role : 'agent';
      
      setFormData({
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: role,
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

  return {
    formData,
    setFormData,
    loading,
    handleSubmit
  };
};
