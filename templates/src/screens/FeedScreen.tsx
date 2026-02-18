import { useState } from 'react';
import { ScrollView, YStack, XStack, H2, Paragraph, Text } from 'tamagui';
import { useAuth } from '~/features/auth/client/useAuth';
import { FeedCard } from '~/interface/cards/FeedCard';

const FILTERS = ['All', 'Trending', 'New', 'Following'];

const PLACEHOLDER_ITEMS = [
  {
    id: '1',
    title: 'Welcome to your feed',
    description: 'This is a placeholder item. Replace this with your own data source and API calls.',
    category: 'General',
    timestamp: 'Just now',
    likes: 0,
    comments: 0,
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: String(i + 2),
    title: `Feed item ${i + 2}`,
    description: 'Placeholder content. Connect your data source to populate this feed with real content.',
    category: i % 3 === 0 ? 'Trending' : i % 3 === 1 ? 'New' : 'General',
    timestamp: `${i + 1}h ago`,
    likes: Math.floor(Math.random() * 100),
    comments: Math.floor(Math.random() * 20),
  })),
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function FeedScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { user } = useAuth();

  const displayName = user?.email?.split('@')[0] ?? 'there';

  const filteredItems =
    activeFilter === 'All'
      ? PLACEHOLDER_ITEMS
      : PLACEHOLDER_ITEMS.filter((item) => item.category === activeFilter);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack padding="$4" gap="$4" paddingBottom="$8">
        {/* Greeting header */}
        <YStack gap="$1">
          <Paragraph color="$gray10" fontSize="$3">
            {getGreeting()},
          </Paragraph>
          <H2 textTransform="capitalize">{displayName}</H2>
        </YStack>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingRight="$4">
            {FILTERS.map((filter) => {
              const isActive = filter === activeFilter;
              return (
                <XStack
                  key={filter}
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                  backgroundColor={isActive ? '$blue10' : '$backgroundStrong'}
                  borderWidth={1}
                  borderColor={isActive ? '$blue10' : '$borderColor'}
                  onPress={() => setActiveFilter(filter)}
                  cursor="pointer"
                  pressStyle={{ opacity: 0.8 }}
                  animation="quick"
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={isActive ? 'white' : '$gray10'}
                  >
                    {filter}
                  </Text>
                </XStack>
              );
            })}
          </XStack>
        </ScrollView>

        {/* Feed items */}
        <YStack gap="$3">
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
  );
}
