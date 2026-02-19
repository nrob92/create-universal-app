import { type ReactNode } from 'react';
import { Spinner } from '~/components/ui/Spinner';
import { EmptyState } from './EmptyState';

interface LoadingStateProps {
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  loadingLabel?: string;
  children: ReactNode;
}

export function LoadingState({
  loading,
  error,
  empty,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  loadingLabel,
  children,
}: LoadingStateProps) {
  if (loading) {
    return <Spinner label={loadingLabel} />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error"
        description={error}
      />
    );
  }

  if (empty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
