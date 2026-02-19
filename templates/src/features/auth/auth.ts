import { supabase } from './client/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const redirectTo = Linking.createURL('/auth/callback');
  const isWeb = Platform.OS === 'web';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: !isWeb, // Supabase automatically handles the redirect on web
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;

  // On Native, we use WebBrowser to handle the OAuth flow in an in-app browser
  if (!isWeb && data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    
    if (result.type === 'success' && result.url) {
      // Robust token extraction from either hash or query string
      const getParam = (name: string, url: string) => {
        const match = url.match(new RegExp('[#?&]' + name + '=([^&]*)'));
        return match ? match[1] : null;
      };

      const access_token = getParam('access_token', result.url);
      const refresh_token = getParam('refresh_token', result.url);

      if (access_token && refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (sessionError) throw sessionError;
      }
    }
    
    return { ...data, browserResult: result };
  }

  // On web, the browser will have redirected before reaching here
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
