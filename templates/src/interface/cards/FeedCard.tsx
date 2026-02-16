import { Card, Paragraph, XStack } from 'tamagui';

interface FeedCardProps {
  title: string;
  description: string;
}

export function FeedCard({ title, description }: FeedCardProps) {
  return (
    <Card elevate bordered padding="$3" borderRadius="$4">
      <Card.Header>
        <XStack justifyContent="space-between">
          <Paragraph fontWeight="bold">{title}</Paragraph>
        </XStack>
      </Card.Header>
      <Paragraph color="$gray10">{description}</Paragraph>
    </Card>
  );
}
