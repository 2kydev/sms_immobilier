
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/hooks/useRole';

interface UserProfileData {
  nom: string;
  prenom: string;
  role: UserRole;
  email: string;
}

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('nom, prenom, role, email')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Set up real-time subscription for profile updates
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProfile(payload.new as UserProfileData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'dg': return 'Directeur Général';
      case 'commercial': return 'Commercial';
      case 'agent': return 'Agent Immobilier';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'dg': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'commercial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil utilisateur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Aucune donnée de profil trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil utilisateur</CardTitle>
        <CardDescription>Informations de votre compte</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-lg">{profile.prenom} {profile.nom}</p>
            <p className="text-sm text-gray-600">{profile.email}</p>
          </div>
          <Badge className={getRoleBadgeColor(profile.role)}>
            {getRoleLabel(profile.role)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
