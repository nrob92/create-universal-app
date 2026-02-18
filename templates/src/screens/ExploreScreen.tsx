import { useState } from 'react';
import { ScrollView, YStack, H2, H3, XStack, Input } from 'tamagui';
import { TrendingUp, Sparkles, Star, User2, Search } from '@tamagui/lucide-icons';
import { CategoryCard } from '~/interface/cards/CategoryCard';
import { FeedCard } from '~/interface/cards/FeedCard';

const CATEGORIES = [
  { icon: TrendingUp, label: 'Trending', backgroundColor: '$blue3', iconColor: '$blue10' },
  { icon: Sparkles, label: 'New', backgroundColor: '$purple3', iconColor: '$purple10' },
  { icon: Star, label: 'Popular', backgroundColor: '$orange3', iconColor: '$orange10' },
  { icon: User2, label: 'For You', backgroundColor: '$green3', iconColor: '$green10' },
];

const FEATURED_ITEMS = [
  {
    id: '1',
    title: 'Getting started with Expo Router',
    description: 'Learn how file-based routing works across iOS, Android, and Web.',
    category: 'Guide',
    timestamp: '2h ago',
    likes: 42,
    comments: 8,
  },
  {
    id: '2',
    title: 'Tamagui theming deep dive',
    description: 'Explore how to build a beautiful dark/light theme with Tamagui tokens.',
    category: 'Design',
    timestamp: '5h ago',
    likes: 91,
    comments: 14,
  },
  {
    id: '3',
    title: 'Supabase RLS in 5 minutes',
    description: 'Row-level security made simple — protect your data the right way.',
    category: 'Backend',
    timestamp: '1d ago',
    likes: 128,
    comments: 22,
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack padding="$4" gap="$5" paddingBottom="$8">
        {/* Header */}
        <YStack gap="$1">
          <H2>Explore</H2>
        </YStack>

        {/* Search */}
        <XStack
          alignItems="center"
          backgroundColor="$backgroundStrong"
          borderRadius="$5"
          borderWidth={1}
          borderColor="$borderColor"
          paddingHorizontal="$3"
          gap="$2"
        >
          <Search size={16} color="$gray9" />
          <Input
            flex={1}
            unstyled
            placeholder="Search..."
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            paddingVertical="$3"
          />
        </XStack>

        {/* Categories */}
        <YStack gap="$3">
          <H3 fontSize="$5">Categories</H3>
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

        {/* Featured */}
        <YStack gap="$3">
          <H3 fontSize="$5">{search ? 'Results' : 'Featured'}</H3>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <FeedCard
                key={item.id}
                title={item.title}
                description={item.description}
                category={item.category}
                timestamp={item.timestamp}
                likes={item.likes}
                comments={item.comments}
              />
            ))
          ) : (
            <YStack alignItems="center" padding="$6">
              <H3 color="$gray10" fontSize="$4">No results</H3>
            </YStack>
          )}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
