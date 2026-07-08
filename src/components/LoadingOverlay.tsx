'use client';

import { useLoadingStore } from '@/store/useLoadingStore';

export function LoadingOverlay() {
  const isLoading = useLoadingStore((s) => s.isLoading);

  if (!isLoading) return null;

  return (
    <div
      role="status"
      aria-label="加载中"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <span className="text-sm font-medium text-white/80">加载中…</span>
      </div>
    </div>
  );
}
