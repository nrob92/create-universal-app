import { Component, type ReactNode, type ErrorInfo } from 'react';
import { YStack, H2, Paragraph } from 'tamagui';
import { PrimaryButton } from '~/interface/buttons/PrimaryButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          padding="$6"
          gap="$3"
        >
          <H2>Something went wrong</H2>
          <Paragraph color="$gray10" textAlign="center">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </Paragraph>
          <PrimaryButton
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </PrimaryButton>
        </YStack>
      );
    }

    return this.props.children;
  }
}
