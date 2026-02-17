import { useState, useEffect } from 'react';
import { YStack, H2, Paragraph, Input, Separator, Card, XStack } from 'tamagui';
import { useAuth } from '~/features/auth/client/useAuth';
import { signOut } from '~/features/auth/auth';
import { usePayments } from '~/features/payments/usePayments';
import { supabase } from '~/features/auth/client/supabaseClient';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { PageContainer } from '~/interface/layout/PageContainer';
import { Spinner } from '~/interface/feedback/Spinner';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  onboarded: boolean;
}

export function SettingsScreen() {
  const { user } = useAuth();
  const { isPro } = usePayments();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, onboarded')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name ?? '');
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', user.id);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Profile updated!');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return <Spinner label="Loading settings..." />;
  }

  return (
    <PageContainer>
      <YStack gap="$4" width="100%" maxWidth={400}>
        <H2>Settings</H2>

        {/* Profile Section */}
        <Card elevate bordered padding="$4" borderRadius="$4">
          <YStack gap="$3">
            <Paragraph fontWeight="bold" fontSize="$5">Profile</Paragraph>

            <YStack gap="$2">
              <Paragraph color="$gray10" fontSize="$2">Display Name</Paragraph>
              <Input
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                borderRadius="$3"
              />
            </YStack>

            <YStack gap="$2">
              <Paragraph color="$gray10" fontSize="$2">Email</Paragraph>
              <Paragraph>{user?.email ?? '—'}</Paragraph>
            </YStack>

            {message !== '' && (
              <Paragraph
                color={message.includes('updated') ? '$green10' : '$red10'}
                fontSize="$2"
              >
                {message}
              </Paragraph>
            )}

            <PrimaryButton onPress={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </PrimaryButton>
          </YStack>
        </Card>

        {/* Subscription Section */}
        <Card elevate bordered padding="$4" borderRadius="$4">
          <YStack gap="$3">
            <Paragraph fontWeight="bold" fontSize="$5">Subscription</Paragraph>
            <XStack justifyContent="space-between" alignItems="center">
              <Paragraph color="$gray10">Current plan</Paragraph>
              <Paragraph fontWeight="bold">
                {isPro ? 'Pro' : 'Free'}
              </Paragraph>
            </XStack>
            {!isPro && (
              <PrimaryButton onPress={() => router.push('/home/paywall')}>
                Upgrade to Pro
              </PrimaryButton>
            )}
          </YStack>
        </Card>

        <Separator />

        {/* Danger Zone */}
        <PrimaryButton theme="red" onPress={handleSignOut}>
          Sign Out
        </PrimaryButton>
      </YStack>
    </PageContainer>
  );
}
