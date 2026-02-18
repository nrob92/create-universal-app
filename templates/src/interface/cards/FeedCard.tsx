import { Card, Paragraph, XStack, YStack, Text } from 'tamagui';
import { Heart, MessageCircle } from '@tamagui/lucide-icons';

interface FeedCardProps {
  title: string;
  description: string;
  category?: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
}

export function FeedCard({
  title,
  description,
  category,
  timestamp,
  likes,
  comments,
}: FeedCardProps) {
  return (
    <Card
      bordered
      borderRadius="$5"
      overflow="hidden"
      backgroundColor="$backgroundStrong"
      pressStyle={{ opacity: 0.9, scale: 0.99 }}
      animation="quick"
    >
      {/* Left accent bar */}
      <XStack>
        <YStack width={3} backgroundColor="$blue8" />

        <YStack flex={1} padding="$4" gap="$2">
          {/* Top row: category + timestamp */}
          {(category || timestamp) && (
            <XStack justifyContent="space-between" alignItems="center">
              {category && (
                <XStack
                  backgroundColor="$blue3"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$3"
                >
                  <Text color="$blue10" fontSize="$1" fontWeight="600">
                    {category}
                  </Text>
                </XStack>
              )}
              {timestamp && (
                <Text color="$gray9" fontSize="$2">
                  {timestamp}
                </Text>
              )}
            </XStack>
          )}

          {/* Title */}
          <Paragraph fontWeight="700" fontSize="$4" lineHeight="$5">
            {title}
          </Paragraph>

          {/* Description */}
          <Paragraph color="$gray10" fontSize="$3" lineHeight="$4" numberOfLines={2}>
            {description}
          </Paragraph>

          {/* Footer: likes + comments */}
          {(likes !== undefined || comments !== undefined) && (
            <XStack gap="$4" marginTop="$1">
              {likes !== undefined && (
                <XStack gap="$1" alignItems="center">
                  <Heart size={13} color="$gray9" />
                  <Text color="$gray9" fontSize="$2">{likes}</Text>
                </XStack>
              )}
              {comments !== undefined && (
                <XStack gap="$1" alignItems="center">
                  <MessageCircle size={13} color="$gray9" />
                  <Text color="$gray9" fontSize="$2">{comments}</Text>
                </XStack>
              )}
            </XStack>
          )}
        </YStack>
      </XStack>
    </Card>
  );
}
