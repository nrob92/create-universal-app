import { create } from 'zustand';
import { supabase } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  initialize: () => Promise<void>;
  signInAsDemo: () => Promise<void>;
  signOut: () => Promise<void>;
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

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  isDemoMode: false,

  initialize: async () => {
    try {
      // Check if we have a stored demo session using AsyncStorage (works on both web and native)
      const storedDemoMode = await AsyncStorage.getItem(DEMO_MODE_KEY);
      
      if (storedDemoMode === 'true') {
        set({
          session: createDemoSession(),
          user: createDemoUser(),
          loading: false,
          isDemoMode: true,
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      supabase.auth.onAuthStateChange((_event, session) => {
        // If we are in demo mode, ignore Supabase auth changes
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
      set({
        session: demoSession,
        user: demoSession.user,
        loading: false,
        isDemoMode: true,
      });
    } catch (error) {
      console.error('Error signing in as demo:', error);
    }
  },

  signOut: async () => {
    try {
      // Clear demo mode
      if (get().isDemoMode) {
        await AsyncStorage.removeItem(DEMO_MODE_KEY);
        set({ session: null, user: null, isDemoMode: false });
        return;
      }
      
      // Regular Supabase sign out
      await supabase.auth.signOut();
      set({ session: null, user: null, isDemoMode: false });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));
