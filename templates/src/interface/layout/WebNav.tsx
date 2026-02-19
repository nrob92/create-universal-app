import { Link, usePathname, useRouter } from 'expo-router';
import { XStack, YStack, Text, View, isWeb, styled, Separator, useMedia, Sheet, useTheme } from 'tamagui';
import { Home, Compass, User, Settings, Star, Menu, LogOut } from '@tamagui/lucide-icons';
import { useAuth } from '~/features/auth/client/useAuth';
import { Button } from '~/interface/buttons/Button';
import { useState } from 'react';
import { PageContainer } from './PageContainer';

const NAV_ITEMS = [
  { label: 'Feed', icon: Home, href: '/home/feed' },
  { label: 'Explore', icon: Compass, href: '/home/explore' },
  { label: 'Profile', icon: User, href: '/home/profile' },
] as const;

const NavLink = styled(XStack, {
  gap: '$2',
  alignItems: 'center',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  borderRadius: '$10',
  cursor: 'pointer',
  animation: 'quick',
  
  hoverStyle: {
    backgroundColor: 'rgba(255,112,81,0.1)',
  },

  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(255,112,81,0.15)',
      },
    },
  } as const,
});

export function WebNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const media = useMedia();
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  if (!isWeb) return null;

  const isMobile = media.sm || media.xs;
  const brandPrimary = theme.brandPrimary?.get() || '#FF7051';

  return (
    <XStack
      width="100%"
      height={70}
      backgroundColor="$backgroundStrong"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      position="sticky"
      top={0}
      zIndex={1000}
      alignItems="center"
      justifyContent="center"
    >
      <PageContainer 
        flexDirection="row" 
        alignItems="center" 
        justifyContent="space-between"
        paddingHorizontal="$6"
        minWidth="100%"
        $md={{ minWidth: 760 }}
        $lg={{ minWidth: 860 }}
        $xl={{ minWidth: 1140 }}
      >
        <XStack gap="$8" alignItems="center">
          {/* Logo */}
          <Link href="/home/feed" asChild>
            <XStack gap="$2" alignItems="center" cursor="pointer">
              <View backgroundColor="$brandPrimary" p="$1.5" borderRadius="$4">
                <Text fontSize={20}>🍣</Text>
              </View>
              <Text fontWeight="900" fontSize={22} letterSpacing={-1} color="$color">
                UniStack
              </Text>
            </XStack>
          </Link>

          {/* Navigation Links - Hidden on Mobile Web */}
          {!isMobile && (
            <XStack gap="$1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link key={item.label} href={item.href} asChild>
                    <NavLink active={isActive}>
                      <item.icon size={18} color={isActive ? brandPrimary : '$gray10'} />
                      <Text 
                        color={isActive ? '$brandPrimary' : '$gray10'} 
                        fontWeight={isActive ? '800' : '600'}
                        fontSize={14}
                      >
                        {item.label}
                      </Text>
                    </NavLink>
                  </Link>
                );
              })}
            </XStack>
          )}
        </XStack>

        <XStack gap="$4" alignItems="center">
          {/* Desktop Profile Info */}
          {!isMobile && (
            <>
              <Button 
                  variant="ghost" 
                  onPress={() => router.push('/home/settings')}
                  padding="$2"
              >
                  <Settings size={20} color="$gray10" />
              </Button>
              
              <Separator vertical height={20} borderColor="$borderColor" />
              
              {user && (
                  <XStack gap="$3" alignItems="center">
                      <YStack alignItems="flex-end">
                          <Text fontWeight="800" fontSize={14}>{user.email?.split('@')[0]}</Text>
                          <XStack gap="$1" alignItems="center">
                              <Star size={10} color="$brandAccent" fill="$brandAccent" />
                              <Text color="$brandAccent" fontSize={10} fontWeight="800" textTransform="uppercase">Pro</Text>
                          </XStack>
                      </YStack>
                      <View 
                          width={36} 
                          height={36} 
                          borderRadius={18} 
                          backgroundColor="$brandPrimary" 
                          alignItems="center" 
                          justifyContent="center"
                      >
                          <Text fontWeight="900" color="white" fontSize={14}>
                              {user.email?.[0].toUpperCase()}
                          </Text>
                      </View>
                  </XStack>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button 
              variant="ghost" 
              padding="$2" 
              onPress={() => setOpen(true)}
            >
              <Menu size={24} color="$color" />
            </Button>
          )}
        </XStack>
      </PageContainer>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        dismissOnSnapToBottom
        animationConfig={{
            type: 'spring',
            damping: 20,
            stiffness: 250,
        }}
      >
        <Sheet.Overlay 
            animation="lazy" 
            enterStyle={{ opacity: 0 }} 
            exitStyle={{ opacity: 0 }} 
            backgroundColor="rgba(0,0,0,0.5)" 
        />
        <Sheet.Frame backgroundColor="$background" padding="$4" gap="$4">
          <Sheet.Handle backgroundColor="$borderColor" />
          
          <YStack gap="$2" marginTop="$4">
            <Text color="$gray10" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1} ml="$2">
                Navigation
            </Text>
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} asChild>
                <NavLink 
                    active={pathname.startsWith(item.href)}
                    onPress={() => setOpen(false)}
                    paddingVertical="$3"
                >
                  <item.icon size={20} color={pathname.startsWith(item.href) ? brandPrimary : '$gray10'} />
                  <Text fontSize={16} fontWeight="700">{item.label}</Text>
                </NavLink>
              </Link>
            ))}
          </YStack>

          <Separator borderColor="$borderColor" />

          <YStack gap="$2">
            <Text color="$gray10" fontWeight="800" fontSize={12} textTransform="uppercase" letterSpacing={1} ml="$2">
                Account
            </Text>
            <NavLink onPress={() => { setOpen(false); router.push('/home/settings'); }}>
              <Settings size={20} color="$gray10" />
              <Text fontSize={16} fontWeight="700">Settings</Text>
            </NavLink>
            <NavLink onPress={() => { setOpen(false); signOut(); }}>
              <LogOut size={20} color="$brandAccent" />
              <Text fontSize={16} fontWeight="700" color="$brandAccent">Sign Out</Text>
            </NavLink>
          </YStack>

          {user && (
            <XStack 
                backgroundColor="$backgroundStrong" 
                p="$4" 
                borderRadius="$8" 
                marginTop="auto" 
                alignItems="center" 
                gap="$3"
                borderWidth={1}
                borderColor="$borderColor"
            >
              <View width={40} height={40} borderRadius={20} backgroundColor="$brandPrimary" alignItems="center" justifyContent="center">
                <Text fontWeight="900" color="white">{user.email?.[0].toUpperCase()}</Text>
              </View>
              <YStack>
                <Text fontWeight="800" fontSize={14}>{user.email}</Text>
                <Text color="$brandAccent" fontSize={11} fontWeight="800">PRO MEMBER</Text>
              </YStack>
            </XStack>
          )}
        </Sheet.Frame>
      </Sheet>
    </XStack>
  );
}
