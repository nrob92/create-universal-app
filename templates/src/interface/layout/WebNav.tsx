import { Link, usePathname, useRouter } from 'expo-router';
import { XStack, YStack, Text, View, isWeb, styled, Separator, useMedia, Sheet, useTheme, Popover, Avatar } from 'tamagui';
import { Home, Compass, User, Settings, Star, Menu, LogOut, ChevronDown, CreditCard } from '@tamagui/lucide-icons';
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
    backgroundColor: '$color3',
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$color4',
      },
    },
  } as const,
});

const ProfileMenuItem = styled(XStack, {
  gap: '$3',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$2.5',
  borderRadius: '$3',
  cursor: 'pointer',
  animation: 'quick',
  
  hoverStyle: {
    backgroundColor: '$color3',
  },
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
      backgroundColor="rgba(0, 0, 0, 0.4)"
      borderBottomWidth={1}
      borderBottomColor="rgba(255,255,255,0.05)"
      position="sticky"
      top={0}
      zIndex={1000}
      alignItems="center"
      justifyContent="center"
      backdropFilter="blur(16px)"
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
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
            <XStack gap="$2.5" alignItems="center" cursor="pointer" animation="quick" hoverStyle={{ scale: 0.98 }}>
              <View backgroundColor="$brandPrimary" p="$1.5" borderRadius="$4" shadowColor="$brandPrimary" shadowRadius={10} shadowOpacity={0.3}>
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
                      <item.icon size={16} color={isActive ? brandPrimary : '$gray10'} strokeWidth={isActive ? 2.5 : 2} />
                      <Text 
                        color={isActive ? '$color' : '$gray10'} 
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
          {!isMobile && user && (
            <XStack gap="$4" alignItems="center">
              <Button 
                variant="ghost" 
                size="$3"
                icon={<Settings size={18} color="$gray10" />}
                onPress={() => router.push('/home/settings')}
                circular
              />
              
              <Separator vertical height={24} borderColor="rgba(255,255,255,0.1)" />
              
              <Popover size="$4" allowFlip placement="bottom-end">
                <Popover.Trigger asChild>
                  <XStack 
                    gap="$3" 
                    alignItems="center" 
                    cursor="pointer" 
                    padding="$1.5"
                    paddingRight="$3"
                    borderRadius="$10"
                    hoverStyle={{ backgroundColor: '$color3' }}
                    animation="quick"
                  >
                    <Avatar circular size="$3" backgroundColor="$brandPrimary">
                      <Avatar.Fallback alignItems="center" justifyContent="center">
                        <Text fontWeight="900" color="white" fontSize={14}>
                          {user.email?.[0].toUpperCase()}
                        </Text>
                      </Avatar.Fallback>
                    </Avatar>
                    
                    <YStack>
                      <Text fontWeight="700" fontSize={13} color="$color">{user.email?.split('@')[0]}</Text>
                      <XStack gap="$1" alignItems="center">
                        <Star size={10} color="$brandAccent" fill="$brandAccent" />
                        <Text color="$brandAccent" fontSize={10} fontWeight="800" textTransform="uppercase">Pro</Text>
                      </XStack>
                    </YStack>
                    
                    <ChevronDown size={14} color="$gray10" marginLeft="$1" />
                  </XStack>
                </Popover.Trigger>

                <Popover.Content 
                  borderWidth={1} 
                  borderColor="rgba(255,255,255,0.1)" 
                  enterStyle={{ y: -10, opacity: 0 }} 
                  exitStyle={{ y: -10, opacity: 0 }} 
                  elevate 
                  animation={[
                    'quick',
                    {
                      opacity: {
                        overshootClamping: true,
                      },
                    },
                  ]}
                  padding="$2"
                  backgroundColor="rgba(20,20,20,0.8)"
                  backdropFilter="blur(20px)"
                  borderRadius="$4"
                  width={220}
                  shadowColor="#000"
                  shadowRadius={20}
                  shadowOpacity={0.3}
                >
                  <YStack gap="$1">
                    <YStack paddingHorizontal="$3" paddingVertical="$2" gap="$1" marginBottom="$2">
                      <Text fontSize={12} color="$gray10" fontWeight="600">Signed in as</Text>
                      <Text fontSize={14} fontWeight="800" color="$color" numberOfLines={1}>{user.email}</Text>
                    </YStack>
                    
                    <Separator borderColor="rgba(255,255,255,0.05)" />
                    
                    <YStack marginTop="$2" gap="$1">
                      <ProfileMenuItem onPress={() => router.push('/home/profile')}>
                        <User size={16} color="$gray11" />
                        <Text fontSize={14} fontWeight="600" color="$gray11">Your Profile</Text>
                      </ProfileMenuItem>
                      <ProfileMenuItem onPress={() => router.push('/home/settings')}>
                        <CreditCard size={16} color="$gray11" />
                        <Text fontSize={14} fontWeight="600" color="$gray11">Billing</Text>
                      </ProfileMenuItem>
                      <ProfileMenuItem onPress={() => router.push('/home/settings')}>
                        <Settings size={16} color="$gray11" />
                        <Text fontSize={14} fontWeight="600" color="$gray11">Settings</Text>
                      </ProfileMenuItem>
                    </YStack>
                    
                    <Separator borderColor="rgba(255,255,255,0.05)" marginVertical="$2" />
                    
                    <ProfileMenuItem onPress={signOut} hoverStyle={{ backgroundColor: 'rgba(255, 60, 60, 0.1)' }}>
                      <LogOut size={16} color="$brandAccent" />
                      <Text fontSize={14} fontWeight="700" color="$brandAccent">Sign Out</Text>
                    </ProfileMenuItem>
                  </YStack>
                </Popover.Content>
              </Popover>
            </XStack>
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
            backgroundColor="rgba(0,0,0,0.6)" 
            backdropFilter="blur(4px)"
        />
        <Sheet.Frame backgroundColor="$background" padding="$4" gap="$4" borderTopLeftRadius="$8" borderTopRightRadius="$8">
          <Sheet.Handle backgroundColor="rgba(255,255,255,0.1)" width={40} height={4} />
          
          <YStack gap="$2" marginTop="$4">
            <Text color="$gray10" fontWeight="800" fontSize={11} textTransform="uppercase" letterSpacing={1.5} ml="$2">
                Navigation
            </Text>
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} asChild>
                <NavLink 
                    active={pathname.startsWith(item.href)}
                    onPress={() => setOpen(false)}
                    paddingVertical="$3"
                    borderRadius="$4"
                >
                  <item.icon size={20} color={pathname.startsWith(item.href) ? brandPrimary : '$gray10'} strokeWidth={pathname.startsWith(item.href) ? 2.5 : 2} />
                  <Text fontSize={16} fontWeight={pathname.startsWith(item.href) ? '800' : '600'} color={pathname.startsWith(item.href) ? '$color' : '$gray11'}>
                    {item.label}
                  </Text>
                </NavLink>
              </Link>
            ))}
          </YStack>

          <Separator borderColor="rgba(255,255,255,0.05)" />

          <YStack gap="$2">
            <Text color="$gray10" fontWeight="800" fontSize={11} textTransform="uppercase" letterSpacing={1.5} ml="$2">
                Account
            </Text>
            <NavLink onPress={() => { setOpen(false); router.push('/home/settings'); }} borderRadius="$4">
              <Settings size={20} color="$gray10" />
              <Text fontSize={16} fontWeight="600" color="$gray11">Settings</Text>
            </NavLink>
            <NavLink onPress={() => { setOpen(false); signOut(); }} borderRadius="$4" hoverStyle={{ backgroundColor: 'rgba(255, 60, 60, 0.1)' }}>
              <LogOut size={20} color="$brandAccent" />
              <Text fontSize={16} fontWeight="700" color="$brandAccent">Sign Out</Text>
            </NavLink>
          </YStack>

          {user && (
            <XStack 
                backgroundColor="$color2" 
                p="$4" 
                borderRadius="$6" 
                marginTop="auto" 
                alignItems="center" 
                gap="$3"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.05)"
            >
              <Avatar circular size="$4" backgroundColor="$brandPrimary">
                <Avatar.Fallback alignItems="center" justifyContent="center">
                  <Text fontWeight="900" color="white" fontSize={16}>{user.email?.[0].toUpperCase()}</Text>
                </Avatar.Fallback>
              </Avatar>
              <YStack>
                <Text fontWeight="800" fontSize={14} color="$color">{user.email}</Text>
                <Text color="$brandAccent" fontSize={11} fontWeight="800">PRO MEMBER</Text>
              </YStack>
            </XStack>
          )}
        </Sheet.Frame>
      </Sheet>
    </XStack>
  );
}
