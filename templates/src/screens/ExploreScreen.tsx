import { useState } from 'react';
import { ScrollView, YStack, H2, H3, XStack, View, Text, Paragraph } from 'tamagui';
import { TrendingUp, Sparkles, Star, User2, Search } from '@tamagui/lucide-icons';
import { CategoryCard } from '~/components/blocks/CategoryCard';
import { FeedCard } from '~/components/blocks/FeedCard';
import { SafePage } from '~/components/layout/PageContainer';
import { Input } from '~/components/ui/Input';

const CATEGORIES = [
  { icon: TrendingUp, label: 'Trending', backgroundColor: 'rgba(255,112,81,0.1)', iconColor: '$brandPrimary' },
  { icon: Sparkles, label: 'New', backgroundColor: 'rgba(149, 213, 178, 0.1)', iconColor: '$brandSecondary' },
  { icon: Star, label: 'Popular', backgroundColor: 'rgba(244, 162, 97, 0.1)', iconColor: '$brandAccent' },
  { icon: User2, label: 'For You', backgroundColor: 'rgba(214, 40, 40, 0.1)', iconColor: '$brandPrimary' },
];

const FEATURED_ITEMS = [
  {
    id: '1',
    title: 'How to make the perfect Nigiri',
    description: 'A masterclass on rice temperature and fish selection for authentic nigiri.',
    category: 'Guide',
    timestamp: '2h ago',
    likes: 156,
    comments: 24,
  },
  {
    id: '2',
    title: 'Top 10 Sushi spots in Tokyo',
    description: 'From Tsukiji outer market to Ginza, these are the must-visit sushi bars.',
    category: 'Travel',
    timestamp: '5h ago',
    likes: 284,
    comments: 42,
  },
  {
    id: '3',
    title: 'Understanding Wasabi vs Horseradish',
    description: 'The surprising truth about the green paste you find in most restaurants.',
    category: 'Facts',
    timestamp: '1d ago',
    likes: 512,
    comments: 89,
  },
];

export function ExploreScreen() {
  const [search, setSearch] = useState('');

  const filteredItems = FEATURED_ITEMS.filter(
    (item) =>
      search.length === 0 ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafePage>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack padding="$5" gap="$6" paddingBottom="$10">
          {/* Header */}
          <YStack gap="$1">
            <Paragraph color="$gray10" fontSize={16} fontWeight="600">
              Discover
            </Paragraph>
            <H2 fontSize={32} fontWeight="800" letterSpacing={-1}>
              Explore 🍣
            </H2>
          </YStack>

          {/* Search */}
          <XStack position="relative" alignItems="center">
            <View position="absolute" left={20} zIndex={1}>
              <Search size={20} color="$gray9" />
            </View>
            <Input
              flex={1}
              placeholder="Search for rolls, fish, or spots..."
              value={search}
              onChangeText={setSearch}
              paddingLeft={55}
            />
          </XStack>

          {/* Categories */}
          <YStack gap="$4">
            <H3 fontSize={20} fontWeight="800" letterSpacing={-0.5}>Categories</H3>
            <YStack gap="$3">
              <XStack gap="$3">
                <CategoryCard
                  icon={CATEGORIES[0].icon}
                  label={CATEGORIES[0].label}
                  backgroundColor={CATEGORIES[0].backgroundColor}
                  iconColor={CATEGORIES[0].iconColor}
                />
                <CategoryCard
                  icon={CATEGORIES[1].icon}
                  label={CATEGORIES[1].label}
                  backgroundColor={CATEGORIES[1].backgroundColor}
                  iconColor={CATEGORIES[1].iconColor}
                />
              </XStack>
              <XStack gap="$3">
                <CategoryCard
                  icon={CATEGORIES[2].icon}
                  label={CATEGORIES[2].label}
                  backgroundColor={CATEGORIES[2].backgroundColor}
                  iconColor={CATEGORIES[2].iconColor}
                />
                <CategoryCard
                  icon={CATEGORIES[3].icon}
                  label={CATEGORIES[3].label}
                  backgroundColor={CATEGORIES[3].backgroundColor}
                  iconColor={CATEGORIES[3].iconColor}
                />
              </XStack>
            </YStack>
          </YStack>

          {/* Featured */}
          <YStack gap="$4">
            <H3 fontSize={20} fontWeight="800" letterSpacing={-0.5}>
              {search ? 'Search Results' : 'Featured Content'}
            </H3>
            {filteredItems.length > 0 ? (
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
            ) : (
              <YStack alignItems="center" padding="$10" backgroundColor="$backgroundStrong" borderRadius="$8" borderStyle="dashed" borderWidth={2} borderColor="$borderColor">
                <Text fontSize={40} mb="$2">🍱</Text>
                <Text color="$gray10" fontSize={16} fontWeight="700">No sushi found</Text>
                <Text color="$gray8" fontSize={14}>Try a different search term</Text>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </SafePage>
  );
}
