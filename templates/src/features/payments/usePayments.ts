import { create } from 'zustand';

interface PaymentState {
  isPro: boolean;
  loading: boolean;
  setIsPro: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export const usePayments = create<PaymentState>((set) => ({
  isPro: false,
  loading: false,
  setIsPro: (value) => set({ isPro: value }),
  setLoading: (value) => set({ loading: value }),
}));
