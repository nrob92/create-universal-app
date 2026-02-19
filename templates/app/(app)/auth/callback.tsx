import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '~/features/auth/client/supabaseClient';
import { Spinner } from '~/interface/feedback/Spinner';
import { Platform } from 'react-native';

export default function AuthCallbackRoute() {
  const router = useRouter();
  
  // On web, `useLinkingURL` might not reliably catch the initial load URL with hashes.
  // We explicitly check window.location.href as a fallback if on web.
  const linkingUrl = Linking.useLinkingURL();
  const url = linkingUrl ?? (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : null);

  useEffect(() => {
    async function handleCallback() {
      if (url) {
        console.log('Processing callback URL:', url);
        try {
          // Robust token extraction from either hash or query string
          const getParam = (name: string, url: string) => {
            const match = url.match(new RegExp('[#?&]' + name + '=([^&]*)'));
            return match ? match[1] : null;
          };

          const access_token = getParam('access_token', url);
          const refresh_token = getParam('refresh_token', url);

          if (access_token && refresh_token) {
            console.log('Tokens found, setting session...');
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            if (error) throw error;
            
            if (data.session) {
              router.replace('/home/feed');
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing callback URL:', e);
        }
      }

      // Fallback
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error.message);
        router.replace('/');
        return;
      }

      if (session) {
        router.replace('/home/feed');
      } else {
        setTimeout(() => {
          router.replace('/');
        }, 500);
      }
    }

    handleCallback();
  }, [url]);

  return <Spinner label="Signing you in..." />;
}
