import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '~/features/auth/client/supabaseClient';
import { Spinner } from '~/interface/feedback/Spinner';

export default function AuthCallbackRoute() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      // Supabase automatically picks up the session from the URL hash
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error.message);
        router.replace('/auth/sign-in');
        return;
      }

      if (session) {
        router.replace('/home/feed');
      } else {
        router.replace('/');
      }
    }

    handleCallback();
  }, []);

  return <Spinner label="Signing you in..." />;
}
