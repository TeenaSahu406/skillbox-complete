// import {useEffect,useState} from 'react';import type {Session,User} from '@supabase/supabase-js';import {supabase} from '../lib/supabase';import type {Profile} from '../types/db';
// export function useAuth(){const[session,setSession]=useState<Session|null>(null),[profile,setProfile]=useState<Profile|null>(null),[loading,setLoading]=useState(true);useEffect(()=>{let on=true;const load=async()=>{const{s}=await supabase.auth.getSession();if(!on)return;setSession(s.session);if(s.session?.user){const{data}=await supabase.from('profiles').select('*').eq('id',s.session.user.id).maybeSingle();if(on)setProfile(data as Profile|null)}setLoading(false)};load();const{data}=supabase.auth.onAuthStateChange(async(_e,s)=>{setSession(s);if(s?.user){const{data:p}=await supabase.from('profiles').select('*').eq('id',s.user.id).maybeSingle();setProfile(p as Profile|null)}else setProfile(null);setLoading(false)});return()=>{on=false;data.subscription.unsubscribe()}},[]);return{session,user:session?.user??null,profile,loading}}
import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Profile = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: 'candidate' | 'recruiter' | null;

    phone: string | null;
    country_code: string | null;
    address: string | null;
    state: string | null;
    country: string | null;

    location: string | null;
    headline: string | null;
    bio: string | null;
};
export function useAuth() {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
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
                const { data: profileData, error: profileError } =
                    await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentSession.user.id)
                        .maybeSingle();

                if (profileError) {
                    console.error('Failed to load profile:', profileError);
                }

                if (mounted) {
                    setProfile(profileData as Profile | null);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
        };

        load();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;

            setSession(newSession);

            if (newSession?.user) {
                const { data: profileData, error: profileError } =
                    await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', newSession.user.id)
                        .maybeSingle();

                if (profileError) {
                    console.error('Failed to load profile:', profileError);
                }

                if (mounted) {
                    setProfile(profileData as Profile | null);
                }
            } else {
                setProfile(null);
            }

            setLoading(false);
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