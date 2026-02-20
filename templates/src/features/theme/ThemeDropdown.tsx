import React, { useMemo } from 'react';
import { Adapt, Select, Sheet, YStack, Text, XStack, View, Separator } from 'tamagui';
import { Check, ChevronDown, Monitor, Moon, Sun, Waves, TreePine, MoonStar, Sunrise } from '@tamagui/lucide-icons';
import { ThemeName, useTheme } from '~/tamagui/TamaguiRootProvider';

const THEMES: { id: ThemeName | 'system'; name: string; icon: any; color: string }[] = [
  { id: 'system', name: 'System Default', icon: Monitor, color: '$color' },
  { id: 'light', name: 'Sushi Light', icon: Sun, color: '#FF7051' },
  { id: 'dark', name: 'Sushi Dark', icon: Moon, color: '#FF7051' },
  { id: 'ocean', name: 'Deep Ocean', icon: Waves, color: '#0ea5e9' },
  { id: 'forest', name: 'Lush Forest', icon: TreePine, color: '#10b981' },
  { id: 'midnight', name: 'Midnight Magic', icon: MoonStar, color: '#8b5cf6' },
  { id: 'sunrise', name: 'Golden Sunrise', icon: Sunrise, color: '#ea580c' },
];

export function ThemeDropdown({ isLast = false }: { isLast?: boolean }) {
  const { theme, setTheme, isSystemTheme, useSystemTheme } = useTheme();

  const val = isSystemTheme ? 'system' : theme;
  const activeThemeObj = THEMES.find(t => t.id === val) || THEMES[0];
  const ActiveIcon = activeThemeObj.icon;

  return (
    <YStack>
      <Select
        value={val}
        onValueChange={(newVal) => {
          if (newVal === 'system') {
            useSystemTheme();
          } else {
            setTheme(newVal as ThemeName);
          }
        }}
        disablePreventBodyScroll
      >
        <Select.Trigger 
          paddingVertical="$4"
          paddingHorizontal={0}
          backgroundColor="transparent"
          borderWidth={0}
          borderRadius={0}
          hoverStyle={{ backgroundColor: 'transparent' }}
          pressStyle={{ opacity: 0.7, x: 4 }}
          animation="quick"
          iconAfter={<ChevronDown size={18} color="$gray8" />}
        >
          <XStack flex={1} alignItems="center" justifyContent="space-between">
            {/* Left side: Icon and Label matching SettingItem */}
            <XStack gap="$4" alignItems="center">
              <View backgroundColor="$background" p="$2" borderRadius="$5" borderWidth={1} borderColor="$borderColor">
                <Moon size={18} color="$brandPrimary" />
              </View>
              <Text fontWeight="700" fontSize={16} color="$color">App Theme</Text>
            </XStack>

            {/* Right side: Selected Value matching SettingItem value text */}
            <Select.Value>
              <XStack gap="$2" alignItems="center" mr="$2">
                <Text color="$gray10" fontSize={14} fontWeight="600">
                  {activeThemeObj.name}
                </Text>
              </XStack>
            </Select.Value>
          </XStack>
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
        <Sheet 
          native={!!window} 
          modal 
          dismissOnSnapToBottom 
          snapPoints={[85]} // Increased so it doesn't need to scroll internally
          animationConfig={{
            type: 'spring',
            damping: 25,
            mass: 1.2,
            stiffness: 250,
          }}
        >
          <Sheet.Frame 
            backgroundColor="$background" 
            borderTopLeftRadius="$10" 
            borderTopRightRadius="$10"
            paddingBottom="$8"
          >
            <Sheet.Handle backgroundColor="$gray5" width={50} height={5} marginTop="$3" opacity={0.6} />
            <YStack padding="$4" gap="$2" borderBottomWidth={1} borderBottomColor="$borderColor" opacity={0.5} paddingBottom="$4">
              <Text fontWeight="800" fontSize={20} color="$color" textAlign="center">
                App Theme
              </Text>
              <Text fontSize={14} color="$gray10" textAlign="center" fontWeight="500">
                Choose how you want the app to look
              </Text>
            </YStack>
            {/* Removed Sheet.ScrollView here since Select.Viewport handles it, or we make snapPoints large enough to show everything */}
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay 
            animation="lazy" 
            enterStyle={{ opacity: 0 }} 
            exitStyle={{ opacity: 0 }} 
            backgroundColor="rgba(0,0,0,0.7)"
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport 
          minWidth={240} 
          backgroundColor="$backgroundStrong"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$9"
          shadowColor="#000"
          shadowRadius={30}
          shadowOpacity={0.15}
          shadowOffset={{ width: 0, height: 10 }}
          padding="$3"
          animation="quick"
        >
          <Select.Group gap="$2">
            {useMemo(
              () =>
                THEMES.map((item, i) => {
                  const ItemIcon = item.icon;
                  const isSelected = val === item.id;
                  
                  return (
                    <Select.Item
                      index={i}
                      key={item.id}
                      value={item.id}
                      backgroundColor={isSelected ? '$background' : 'transparent'}
                      borderRadius="$6"
                      paddingVertical="$3"
                      paddingHorizontal="$3"
                      hoverStyle={{ backgroundColor: '$backgroundHover' }}
                      pressStyle={{ scale: 0.98, opacity: 0.9 }}
                      animation="quick"
                    >
                      <XStack gap="$4" alignItems="center" flex={1}>
                        <View 
                          backgroundColor={item.color} 
                          opacity={isSelected ? 1 : 0.85}
                          width={36} 
                          height={36} 
                          borderRadius="$5" 
                          alignItems="center" 
                          justifyContent="center"
                          shadowColor={item.color}
                          shadowRadius={isSelected ? 8 : 4}
                          shadowOpacity={isSelected ? 0.4 : 0.2}
                          shadowOffset={{ width: 0, height: 2 }}
                        >
                          <ItemIcon size={18} color="white" />
                        </View>
                        <YStack flex={1}>
                          <Select.ItemText 
                            color="$color" 
                            fontSize={16}
                            fontWeight={isSelected ? "800" : "600"}
                          >
                            {item.name}
                          </Select.ItemText>
                          {isSelected && (
                            <Text color="$brandPrimary" fontSize={12} fontWeight="600" marginTop={-2}>
                              Active
                            </Text>
                          )}
                        </YStack>
                      </XStack>
                      {isSelected && (
                        <Select.ItemIndicator marginLeft="auto">
                          <Check size={20} color="$brandPrimary" strokeWidth={3} />
                        </Select.ItemIndicator>
                      )}
                    </Select.Item>
                  );
                }),
              [val]
            )}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
    
    {!isLast && <Separator borderColor="$borderColor" opacity={0.5} />}
    </YStack>
  );
}
