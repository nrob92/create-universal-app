import { YStack, H2, ScrollView } from 'tamagui';
import { FeedCard } from '~/interface/cards/FeedCard';

const PLACEHOLDER_ITEMS = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  title: `Item ${i + 1}`,
  description: 'Placeholder content. Replace with your data source.',
}));

export function FeedScreen() {
  return (
    <ScrollView>
      <YStack padding="$4" gap="$3">
        <H2>Feed</H2>
        {PLACEHOLDER_ITEMS.map((item) => (
          <FeedCard
            key={item.id}
            title={item.title}
            description={item.description}
          />
        ))}
      </YStack>
    </ScrollView>
  );
}
