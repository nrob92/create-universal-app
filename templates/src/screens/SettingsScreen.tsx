import { useState, useEffect } from 'react';
import { ScrollView, YStack, H2, Paragraph, Input, Separator, Card, XStack, Text } from 'tamagui';
import {
  User,
  Mail,
  Crown,
  Palette,
  LogOut,
  ChevronRight,
} from '@tamagui/lucide-icons';
import { useAuth } from '~/features/auth/client/useAuth';
import { signOut } from '~/features/auth/auth';
import { usePayments } from '~/features/payments/usePayments';
import { supabase } from '~/features/auth/client/supabaseClient';
import { useRouter } from 'expo-router';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';
import { Spinner } from '~/interface/feedback/Spinner';
import { ThemeToggle } from '~/features/theme/ThemeToggle';
import { SettingRow } from '~/interface/layout/SettingRow';

interface Profile {
  display_name: string | null;
  avatar_url: string | null;
  onboarded: boolean;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      color="$gray10"
      fontSize="$2"
      fontWeight="600"
      textTransform="uppercase"
      letterSpacing={0.8}
      paddingHorizontal="$4"
      paddingTop="$4"
      paddingBottom="$1"
    >
      {label}
    </Text>
  );
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
  const [editingName, setEditingName] = useState(false);

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
      setEditingName(false);
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack paddingBottom="$10">
        <YStack padding="$4" paddingBottom="$2">
          <H2>Settings</H2>
        </YStack>

        {/* Account section */}
        <SectionHeader label="Account" />
        <Card bordered borderRadius="$5" marginHorizontal="$4" overflow="hidden">
          {/* Display name row */}
          <SettingRow
            icon={User}
            label="Display Name"
            value={profile?.display_name ?? 'Not set'}
            onPress={() => setEditingName((v) => !v)}
          />

          {editingName && (
            <YStack padding="$4" gap="$3" borderTopWidth={1} borderTopColor="$borderColor">
              <Input
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                borderRadius="$4"
                autoFocus
              />
              {message !== '' && (
                <Paragraph
                  color={message.includes('updated') ? '$green10' : '$red10'}
                  fontSize="$2"
                >
                  {message}
                </Paragraph>
              )}
              <XStack gap="$2">
                <PrimaryButton
                  flex={1}
                  onPress={handleSave}
                  disabled={saving}
                  size="$3"
                >
                  {saving ? 'Saving...' : 'Save'}
                </PrimaryButton>
                <PrimaryButton
                  flex={1}
                  theme="gray"
                  onPress={() => setEditingName(false)}
                  size="$3"
                >
                  Cancel
                </PrimaryButton>
              </XStack>
            </YStack>
          )}

          <Separator />

          <SettingRow
            icon={Mail}
            label="Email"
            value={user?.email ?? '—'}
            showChevron={false}
          />
        </Card>

        {/* Subscription section */}
        <SectionHeader label="Subscription" />
        <Card bordered borderRadius="$5" marginHorizontal="$4" overflow="hidden">
          <SettingRow
            icon={Crown}
            label="Plan"
            value={isPro ? 'Pro' : 'Free'}
            onPress={!isPro ? () => router.push('/home/paywall') : undefined}
            showChevron={!isPro}
          />
          {!isPro && (
            <YStack padding="$4" borderTopWidth={1} borderTopColor="$borderColor">
              <PrimaryButton onPress={() => router.push('/home/paywall')}>
                Upgrade to Pro
              </PrimaryButton>
            </YStack>
          )}
        </Card>

        {/* Appearance section */}
        <SectionHeader label="Appearance" />
        <Card bordered borderRadius="$5" marginHorizontal="$4" overflow="hidden">
          <SettingRow
            icon={Palette}
            label="Theme"
            showChevron={false}
            rightElement={<ThemeToggle />}
          />
        </Card>

        {/* Danger zone */}
        <SectionHeader label="Account Actions" />
        <Card bordered borderRadius="$5" marginHorizontal="$4" overflow="hidden">
          <SettingRow
            icon={LogOut}
            label="Sign Out"
            onPress={handleSignOut}
            destructive
          />
        </Card>
      </YStack>
    </ScrollView>
  );
}
