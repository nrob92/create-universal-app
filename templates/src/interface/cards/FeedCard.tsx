import { useState } from 'react';
import { Card, Paragraph, XStack, YStack, Text, View } from 'tamagui';
import { Heart, MessageCircle, Share2 } from '@tamagui/lucide-icons';
import { haptics } from '~/helpers/haptics';

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
  likes: initialLikes = 0,
  comments,
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = () => {
    haptics.medium();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <Card
      bordered
      borderRadius="$8"
      overflow="hidden"
      backgroundColor="$backgroundStrong"
      borderWidth={2}
      borderColor="$borderColor"
      pressStyle={{ scale: 0.98 }}
      hoverStyle={{ borderColor: '$brandPrimary' }}
      animation="quick"
      shadowColor="$shadowColor"
      shadowRadius={15}
      shadowOpacity={0.2}
      shadowOffset={{ height: 5, width: 0 }}
    >
      <YStack padding="$5" gap="$3">
        {/* Top row: category + timestamp */}
        <XStack justifyContent="space-between" alignItems="center">
          {category && (
            <XStack
              backgroundColor="rgba(255,112,81,0.15)"
              paddingHorizontal="$3"
              paddingVertical="$1"
              borderRadius="$10"
              borderWidth={1}
              borderColor="rgba(255,112,81,0.3)"
            >
              <Text color="$brandPrimary" fontSize={11} fontWeight="800" textTransform="uppercase" letterSpacing={1}>
                {category}
              </Text>
            </XStack>
          )}
          {timestamp && (
            <Text color="$gray9" fontSize={12} fontWeight="600">
              {timestamp}
            </Text>
          )}
        </XStack>

        {/* Title & Description */}
        <YStack gap="$1.5">
          <Text fontWeight="800" fontSize={20} color="$color" letterSpacing={-0.5} lineHeight={24}>
            {title}
          </Text>
          <Paragraph color="$gray10" fontSize={14} lineHeight={20} numberOfLines={3}>
            {description}
          </Paragraph>
        </YStack>

        {/* Footer actions */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
          <XStack gap="$4">
            <XStack 
                gap="$1.5" 
                alignItems="center" 
                onPress={handleLike}
                pressStyle={{ opacity: 0.7 }}
            >
              <View 
                backgroundColor={isLiked ? "rgba(255,112,81,0.15)" : "rgba(214, 40, 40, 0.1)"} 
                p="$2" 
                borderRadius="$10"
                animation="bouncy"
                scale={isLiked ? 1.2 : 1}
              >
                <Heart 
                    size={16} 
                    color={isLiked ? "$brandPrimary" : "$gray9"} 
                    fill={isLiked ? "$brandPrimary" : "transparent"} 
                />
              </View>
              <Text color="$color" fontSize={14} fontWeight="700">{likes}</Text>
            </XStack>
            
            <XStack gap="$1.5" alignItems="center" pressStyle={{ opacity: 0.6 }}>
              <View backgroundColor="rgba(149, 213, 178, 0.1)" p="$2" borderRadius="$10">
                <MessageCircle size={16} color="$brandSecondary" />
              </View>
              <Text color="$color" fontSize={14} fontWeight="700">{comments}</Text>
            </XStack>
          </XStack>

          <View 
            pressStyle={{ opacity: 0.6, scale: 0.9 }} 
            p="$2" 
            onPress={() => haptics.light()}
          >
            <Share2 size={18} color="$gray9" />
          </View>
        </XStack>
      </YStack>
    </Card>
  );
}
