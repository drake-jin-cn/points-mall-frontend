'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GitHubCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    router.replace('/dashboard');
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div className="flex flex-col items-center gap-3">
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white"
        />
        <p className="text-sm font-medium text-white/80">Processing GitHub login…</p>
      </div>
    </div>
  );
}

export default function GitHubCallbackPage() {
  return (
    <Suspense>
      <GitHubCallbackContent />
    </Suspense>
  );
}
