import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'candidate' | 'recruiter' | 'admin' | null;

  phone: string | null;
  country_code: string | null;
  address: string | null;
  state: string | null;
  country: string | null;

  location: string | null;
  headline: string | null;
  bio: string | null;

  profile_photo_path?: string | null;
  resume_path?: string | null;
  intro_video_path?: string | null;
  intro_video_url?: string | null;

  created_at?: string;
  updated_at?: string;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(user: User | null) {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
      return;
    }

    setProfile(data as Profile | null);
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error('Failed to get session:', error);
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentSession = data.session;

      setSession(currentSession);

      if (currentSession?.user) {
        await loadProfile(currentSession.user);
      } else {
        setProfile(null);
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (!newSession) {
        setProfile(null);
        setLoading(false);
        return;
      }

      /*
       * Do not await Supabase database queries directly inside
       * onAuthStateChange. Load the profile after the auth event.
       */
      setTimeout(() => {
        if (!mounted) return;

        loadProfile(newSession.user).finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user as User | null,
    profile,
    loading,
  };
}