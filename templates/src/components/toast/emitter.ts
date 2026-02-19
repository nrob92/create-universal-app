/**
 * Toast notification emitter for decoupled toast triggering.
 * Allows showing toasts from anywhere in the app without prop drilling.
 * 
 * @example
 * import { showToast } from '~/components/toast/emitter';
 * 
 * showToast('Success!', { type: 'success' });
 * showToast('Something went wrong', { type: 'error' });
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

type ToastListener = (toast: ToastOptions) => void;

let listeners: ToastListener[] = [];

/**
 * Show a toast notification.
 */
export function showToast(message: string, options?: Omit<ToastOptions, 'message'>) {
  const toast: ToastOptions = {
    message,
    type: options?.type ?? 'info',
    duration: options?.duration ?? 3000,
    ...options,
  };
  
  listeners.forEach(listener => listener(toast));
}

/**
 * Internal function to add a toast listener.
 * Used by the ToastProvider component.
 */
export function addToastListener(listener: ToastListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}
