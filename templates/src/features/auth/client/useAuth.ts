import { create } from 'zustand';
import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  isOnboarded: boolean;
  initialize: () => Promise<void>;
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

// Mock demo user for testing without backend
const createDemoUser = (): User => ({
  id: 'demo-user-id',
  app_metadata: {},
  user_metadata: {
    name: 'Demo User',
    email: 'demo@example.com',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'demo@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  updated_at: new Date().toISOString(),
  identities: [],
  factors: [],
});

const createDemoSession = (): Session => ({
  access_token: 'demo-access-token',
  refresh_token: 'demo-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: createDemoUser(),
});

const DEMO_MODE_KEY = 'demoMode';
const ONBOARDED_KEY = 'onboarded';

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isDemoMode: false,
  isOnboarded: false,

  initialize: async () => {
    try {
      const storedDemoMode = await AsyncStorage.getItem(DEMO_MODE_KEY);
      const storedOnboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
      
      if (storedDemoMode === 'true') {
        set({
          session: createDemoSession(),
          user: createDemoUser(),
          loading: false,
          isDemoMode: true,
          isOnboarded: storedOnboarded === 'true',
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      let onboarded = storedOnboarded === 'true';
      if (session?.user && !onboarded) {
        // Real check against database
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', session.user.id)
          .single();
        onboarded = !!profile?.onboarded;
      }

      set({ session, user: session?.user ?? null, loading: false, isOnboarded: onboarded });

      supabase.auth.onAuthStateChange((_event, session) => {
        if (get().isDemoMode) return;
        set({ session, user: session?.user ?? null, isDemoMode: false });
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false });
    }
  },

  signInAsDemo: async () => {
    try {
      const demoSession = createDemoSession();
      await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
      const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY) === 'true';
      
      set({
        session: demoSession,
        user: demoSession.user,
        loading: false,
        isDemoMode: true,
        isOnboarded: onboarded,
      });
    } catch (error) {
      console.error('Error signing in as demo:', error);
    }
  },

  signOut: async () => {
    try {
      if (get().isDemoMode) {
        await AsyncStorage.removeItem(DEMO_MODE_KEY);
        set({ session: null, user: null, isDemoMode: false, isOnboarded: false });
        return;
      }
      
      await supabase.auth.signOut();
      set({ session: null, user: null, isDemoMode: false, isOnboarded: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  completeOnboarding: async () => {
    try {
      const { user, isDemoMode } = get();
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
      
      if (!isDemoMode && user) {
        await supabase
          .from('profiles')
          .update({ onboarded: true })
          .eq('id', user.id);
      }
      
      set({ isOnboarded: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  },
}));
