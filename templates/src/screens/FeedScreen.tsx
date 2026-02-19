import { useState } from 'react';
import { ScrollView, YStack, XStack, H2, Paragraph, Text, View } from 'tamagui';
import { useAuth } from '~/features/auth/client/useAuth';
import { FeedCard } from '~/components/blocks/FeedCard';
import { SafePage } from '~/components/layout/PageContainer';

const FILTERS = ['All', 'Trending', 'New', 'Following'];

const PLACEHOLDER_ITEMS = [
  {
    id: '1',
    title: 'UniStack Sushi Special',
    description: 'Freshly scaffolded apps with the finest ingredients: Expo, Tamagui, and Supabase.',
    category: 'Trending',
    timestamp: 'Just now',
    likes: 42,
    comments: 5,
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: String(i + 2),
    title: `Delicious Feature ${i + 2}`,
    description: 'Experience the smooth animations and responsive design of your new universal application.',
    category: i % 3 === 0 ? 'Trending' : i % 3 === 1 ? 'New' : 'General',
    timestamp: `${i + 1}h ago`,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
  })),
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Ohayou';
  if (hour < 17) return 'Konnichiwa';
  return 'Konbanwa';
}

export function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const user = useAuth((s) => s.user);

  const displayName = user?.email?.split('@')[0] ?? 'Friend';

  const filteredItems =
    activeFilter === 'All'
      ? PLACEHOLDER_ITEMS
      : PLACEHOLDER_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <SafePage>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$5" gap="$6" paddingBottom="$10">
          {/* Greeting header */}
          <XStack justifyContent="space-between" alignItems="center">
            <YStack>
              <Paragraph color="$gray10" fontSize={16} fontWeight="600">
                {getGreeting()},
              </Paragraph>
              <H2 fontSize={32} fontWeight="800" letterSpacing={-1}>
                {displayName} 🍣
              </H2>
            </YStack>
            <View 
              width={50} 
              height={50} 
              borderRadius={25} 
              backgroundColor="$backgroundStrong" 
              borderWidth={2} 
              borderColor="$brandPrimary"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={20}>{displayName[0]?.toUpperCase()}</Text>
            </View>
          </XStack>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$3">
              {FILTERS.map((filter) => {
                const isActive = filter === activeFilter;
                return (
                  <View
                    key={filter}
                    paddingHorizontal="$5"
                    paddingVertical="$2.5"
                    borderRadius="$10"
                    backgroundColor={isActive ? '$brandPrimary' : '$backgroundStrong'}
                    borderWidth={2}
                    borderColor={isActive ? '$brandPrimary' : '$borderColor'}
                    onPress={() => setActiveFilter(filter)}
                    cursor="pointer"
                    pressStyle={{ scale: 0.95, opacity: 0.8 }}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="700"
                      color={isActive ? 'white' : '$gray11'}
                    >
                      {filter}
                    </Text>
                  </View>
                );
              })}
            </XStack>
          </ScrollView>

          {/* Feed items */}
          <YStack gap="$5">
            {filteredItems.map((item) => (
              <FeedCard
                key={item.id}
                title={item.title}
                description={item.description}
                category={item.category}
                timestamp={item.timestamp}
                likes={item.likes}
                comments={item.comments}
              />
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </SafePage>
  );
}
