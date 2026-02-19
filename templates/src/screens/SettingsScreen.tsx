import { ScrollView, YStack, H2, XStack, Text, View, Separator, Switch, isWeb } from 'tamagui';
import { ChevronRight, Bell, Shield, CircleUser, CreditCard, HelpCircle, Moon, Star, ArrowLeft } from '@tamagui/lucide-icons';
import { SafePage } from '~/interface/layout/PageContainer';
import { useTheme } from '~/tamagui/TamaguiRootProvider';
import { useRouter } from 'expo-router';

interface SettingItemProps {
  icon: any;
  label: string;
  value?: string;
  hasSwitch?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
}

function SettingItem({ 
  icon: Icon, 
  label, 
  value, 
  hasSwitch, 
  isLast, 
  onPress,
  switchValue,
  onSwitchChange 
}: SettingItemProps) {
  return (
    <YStack>
      <XStack 
        paddingVertical="$4" 
        alignItems="center" 
        justifyContent="space-between"
        onPress={onPress}
        pressStyle={onPress ? { opacity: 0.7, x: 4 } : undefined}
        animation="quick"
      >
        <XStack gap="$4" alignItems="center">
          <View backgroundColor="$background" p="$2" borderRadius="$5" borderWidth={1} borderColor="$borderColor">
            <Icon size={18} color="$brandPrimary" />
          </View>
          <Text fontWeight="700" fontSize={16}>{label}</Text>
        </XStack>
        
        <XStack gap="$2" alignItems="center">
          {value && <Text color="$gray10" fontSize={14} fontWeight="600">{value}</Text>}
          {hasSwitch ? (
            <Switch 
              size="$3" 
              checked={switchValue} 
              onCheckedChange={onSwitchChange}
              backgroundColor={switchValue ? '$brandPrimary' : '$backgroundStrong'}
            >
              <Switch.Thumb animation="quick" />
            </Switch>
          ) : (
            onPress && <ChevronRight size={18} color="$gray8" />
          )}
        </XStack>
      </XStack>
      {!isLast && <Separator borderColor="$borderColor" opacity={0.5} />}
    </YStack>
  );
}

export function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <SafePage>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$5" gap="$6" paddingBottom="$10">
          <XStack alignItems="center" gap="$4">
             <View 
                p="$2" 
                borderRadius="$10" 
                backgroundColor="$backgroundStrong"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => router.back()}
             >
                <ArrowLeft size={20} color="$color" />
             </View>
             <H2 fontSize={32} fontWeight="900" letterSpacing={-1}>Settings</H2>
          </XStack>

          {/* Membership Card */}
          <YStack 
            backgroundColor="$brandPrimary" 
            p="$6" 
            borderRadius="$9" 
            gap="$4"
            shadowColor="$brandPrimary"
            shadowRadius={20}
            shadowOpacity={0.3}
            position="relative"
            overflow="hidden"
          >
             {/* Decorative Circles */}
             <View position="absolute" top={-20} right={-20} width={100} height={100} borderRadius={50} backgroundColor="white" opacity={0.1} />
             
             <XStack justifyContent="space-between" alignItems="flex-start">
                <YStack gap="$1">
                    <Text color="white" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1}>
                        Membership Status
                    </Text>
                    <Text color="white" fontWeight="900" fontSize={24}>Sushi Club Pro</Text>
                </YStack>
                <View backgroundColor="white" p="$2" borderRadius="$5">
                    <Star size={20} color="$brandPrimary" fill="$brandPrimary" />
                </View>
             </XStack>

             <YStack gap="$1" marginTop="$2">
                <Text color="rgba(255,255,255,0.8)" fontSize={12} fontWeight="700">Valid until December 2026</Text>
                <View height={6} width="100%" backgroundColor="rgba(255,255,255,0.2)" borderRadius={3} marginTop="$1">
                    <View height="100%" width="65%" backgroundColor="white" borderRadius={3} />
                </View>
             </YStack>
          </YStack>

          {/* Account Section */}
          <YStack gap="$3">
            <Text color="$gray10" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1} ml="$2">
              Personal
            </Text>
            <View backgroundColor="$backgroundStrong" px="$4" borderRadius="$9" borderWidth={1} borderColor="$borderColor">
              <SettingItem icon={CircleUser} label="Account Details" onPress={() => {}} />
              <SettingItem icon={CreditCard} label="Billing & Subscription" value="Manage" onPress={() => {}} />
              <SettingItem icon={Shield} label="Privacy & Security" isLast onPress={() => {}} />
            </View>
          </YStack>

          {/* App Settings */}
          <YStack gap="$3">
            <Text color="$gray10" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1} ml="$2">
              App Preferences
            </Text>
            <View backgroundColor="$backgroundStrong" px="$4" borderRadius="$9" borderWidth={1} borderColor="$borderColor">
              <SettingItem 
                icon={Moon} 
                label="Dark Mode" 
                hasSwitch 
                switchValue={theme === 'dark'}
                onSwitchChange={toggleTheme}
              />
              <SettingItem icon={Bell} label="Push Notifications" hasSwitch switchValue={true} />
              <SettingItem icon={HelpCircle} label="Help Center" isLast onPress={() => {}} />
            </View>
          </YStack>

          <YStack alignItems="center" marginTop="$4" gap="$1">
            <Text color="$gray9" fontSize={12} fontWeight="700">UniStack v1.2.0</Text>
            <Text color="$gray8" fontSize={11} fontWeight="600">Handcrafted with 🍣 in Tokyo</Text>
          </YStack>
        </YStack>
      </ScrollView>
    </SafePage>
  );
}
