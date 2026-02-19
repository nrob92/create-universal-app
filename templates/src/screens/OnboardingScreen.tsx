import { useState } from 'react';
import { YStack, XStack, Text, View, H2, Paragraph, AnimatePresence, isWeb } from 'tamagui';
import { Button } from '~/interface/buttons/Button';
import { AuthPageContainer } from '~/interface/layout/PageContainer';
import { useAuth } from '~/features/auth/client/useAuth';
import { haptics } from '~/helpers/haptics';
import { Heart, Flame, Sparkles, ChevronRight } from '@tamagui/lucide-icons';

const STEPS = [
  {
    title: 'Your Palate',
    description: 'What kind of sushi defines your soul? Choose your foundation.',
    icon: Heart,
    options: ['Nigiri Lover', 'Roll Enthusiast', 'Sashimi Purist'],
    color: '$brandPrimary',
  },
  {
    title: 'Heat Level',
    description: 'How much wasabi can you handle? Let us calibrate your experience.',
    icon: Flame,
    options: ['Cool & Calm', 'A Little Kick', 'Wasabi Warrior'],
    color: '$brandAccent',
  },
  {
    title: 'The Club',
    description: 'You are ready. Join the finest sushi community in the digital world.',
    icon: Sparkles,
    options: ['Notifications On', 'Silent Member'],
    color: '$brandSecondary',
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);
  const completeOnboarding = useAuth((s) => s.completeOnboarding);

  const handleNext = () => {
    haptics.medium();
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      haptics.success();
      completeOnboarding();
    }
  };

  const handleSelect = (option: string) => {
    haptics.light();
    const newSelections = [...selections];
    newSelections[currentStep] = option;
    setSelections(newSelections);
  };

  const step = STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AuthPageContainer>
      <YStack
        width="100%"
        maxWidth={440}
        gap="$8"
        animation="quick"
      >
        {/* Progress Dots */}
        <XStack gap="$2" justifyContent="center">
          {STEPS.map((_, i) => (
            <View
              key={i}
              width={i === currentStep ? 24 : 8}
              height={8}
              borderRadius={4}
              backgroundColor={i <= currentStep ? step.color : '$borderColor'}
              animation="quick"
            />
          ))}
        </XStack>

        <YStack
          backgroundColor="$backgroundStrong"
          borderRadius="$10"
          borderWidth={1}
          borderColor="$borderColor"
          p={isWeb ? "$8" : "$6"}
          gap="$6"
          shadowColor="$black1"
          shadowRadius={40}
          shadowOpacity={0.2}
          position="relative"
          overflow="hidden"
        >
          <AnimatePresence exitBeforeEnter>
            <YStack
              key={currentStep}
              gap="$6"
              animation="quick"
              enterStyle={{ opacity: 0, x: 20 }}
              exitStyle={{ opacity: 0, x: -20 }}
            >
              <YStack gap="$2" alignItems="center">
                <View 
                  backgroundColor={step.color as any} 
                  p="$4" 
                  borderRadius="$9"
                  shadowColor={step.color as any}
                  shadowRadius={20}
                  shadowOpacity={0.3}
                >
                  <Icon size={32} color="white" />
                </View>
                <YStack alignItems="center" gap="$1" marginTop="$2">
                  <H2 fontWeight="900" fontSize={28} letterSpacing={-1}>
                    {step.title}
                  </H2>
                  <Paragraph color="$gray10" fontWeight="600" fontSize={14} textAlign="center">
                    {step.description}
                  </Paragraph>
                </YStack>
              </YStack>

              <YStack gap="$3">
                {step.options.map((option) => {
                  const isSelected = selections[currentStep] === option;
                  return (
                    <XStack
                      key={option}
                      backgroundColor={isSelected ? 'rgba(255,112,81,0.1)' : '$background'}
                      padding="$4"
                      borderRadius="$8"
                      borderWidth={2}
                      borderColor={isSelected ? '$brandPrimary' : '$borderColor'}
                      onPress={() => handleSelect(option)}
                      alignItems="center"
                      justifyContent="space-between"
                      pressStyle={{ scale: 0.98 }}
                      animation="quick"
                      cursor="pointer"
                    >
                      <Text fontWeight="700" fontSize={16} color={isSelected ? '$brandPrimary' : '$color'}>
                        {option}
                      </Text>
                      {isSelected && <ChevronRight size={18} color="$brandPrimary" />}
                    </XStack>
                  );
                })}
              </YStack>

              <Button
                variant="primary"
                sized="large"
                onPress={handleNext}
                disabled={!selections[currentStep]}
                backgroundColor={step.color as any}
                shadowColor={step.color as any}
                marginTop="$2"
              >
                {currentStep === STEPS.length - 1 ? 'Join the Sushi Club' : 'Next Step'}
              </Button>
            </YStack>
          </AnimatePresence>
        </YStack>

        <Text color="$gray9" fontSize={12} textAlign="center" fontWeight="600">
          Step {currentStep + 1} of 3
        </Text>
      </YStack>
    </AuthPageContainer>
  );
}
