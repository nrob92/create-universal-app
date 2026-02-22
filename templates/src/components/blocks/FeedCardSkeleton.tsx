import { Card, XStack, YStack } from 'tamagui';
import { Skeleton } from '~/components/ui/Skeleton';

export function FeedCardSkeleton() {
  return (
    <Card
      borderWidth={2}
      borderRadius="$8"
      overflow="hidden"
      backgroundColor="$backgroundStrong"
      borderColor="$borderColor"
      shadowColor="$shadowColor"
      shadowRadius={15}
      shadowOpacity={0.2}
      shadowOffset={{ height: 5, width: 0 }}
    >
      <YStack padding="$5" gap="$3">
        {/* Top row: category + timestamp */}
        <XStack justifyContent="space-between" alignItems="center">
          <Skeleton width={80} height={22} borderRadius="$10" />
          <Skeleton width={50} height={16} />
        </XStack>

        {/* Title & Description */}
        <YStack gap="$1.5" marginTop="$1">
          <Skeleton width="75%" height={24} marginBottom="$1" />
          
          <YStack gap="$1.5">
            <Skeleton width="100%" height={18} />
            <Skeleton width="100%" height={18} />
            <Skeleton width="65%" height={18} />
          </YStack>
        </YStack>

        {/* Footer actions */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
          <XStack gap="$4">
            <XStack gap="$1.5" alignItems="center">
              <Skeleton width={36} height={36} borderRadius="$10" />
              <Skeleton width={24} height={16} />
            </XStack>
            
            <XStack gap="$1.5" alignItems="center">
              <Skeleton width={36} height={36} borderRadius="$10" />
              <Skeleton width={24} height={16} />
            </XStack>
          </XStack>

          <Skeleton width={36} height={36} borderRadius="$10" />
        </XStack>
      </YStack>
    </Card>
  );
}


