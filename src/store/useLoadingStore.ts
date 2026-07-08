import { create } from 'zustand';

interface LoadingState {
  count: number;
  isLoading: boolean;
  increment: () => void;
  decrement: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  count: 0,
  isLoading: false,
  increment: () =>
    set((state) => {
      const count = state.count + 1;
      return { count, isLoading: count > 0 };
    }),
  decrement: () =>
    set((state) => {
      const count = Math.max(0, state.count - 1);
      return { count, isLoading: count > 0 };
    }),
}));
