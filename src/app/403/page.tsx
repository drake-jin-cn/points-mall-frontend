import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

// No auth check here on purpose — this page must render without requiring authentication so
// the middleware's redirect target itself never triggers another redirect loop.
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-4xl font-bold">403</h1>
      <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
      <Link href="/dashboard" className={buttonVariants({ variant: 'default' })}>
        Back to dashboard
      </Link>
    </div>
  );
}
