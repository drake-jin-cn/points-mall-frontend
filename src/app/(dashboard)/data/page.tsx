'use client';

import { RequirePermission } from '@/components/RequirePermission';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';

export default function DataReportsPage() {
  return (
    <RequirePermission requiredKey="data:view" fallback={<ForbiddenNotice />}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">数据报表</h2>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </RequirePermission>
  );
}
