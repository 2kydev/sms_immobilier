
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Create a profile from user metadata and auth data
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            nom: session.user.user_metadata?.nom || 'Nom',
            prenom: session.user.user_metadata?.prenom || 'Prénom',
            is_active: true,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          };
          console.log('Profile created from auth data:', userProfile);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Create a profile from user metadata and auth data
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          nom: session.user.user_metadata?.nom || 'Nom',
          prenom: session.user.user_metadata?.prenom || 'Prénom',
          is_active: true,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at
        };
        setProfile(userProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { nom: string; prenom: string }) => {
    console.log('Signing up user with data:', { email, userData });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) {
      console.error('Signup error:', error);
    } else {
      console.log('Signup successful:', data);
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Signin error:', error);
    } else {
      console.log('Signin successful:', data);
    }
    
    return { data, error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Signout error:', error);
    } else {
      console.log('Signout successful');
    }
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut
  };
};
