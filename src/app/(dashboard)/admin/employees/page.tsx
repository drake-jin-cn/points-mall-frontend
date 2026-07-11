'use client';

import { RequirePermission } from '@/components/RequirePermission';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';

export default function EmployeeManagementPage() {
  return (
    <RequirePermission requiredKey="admin:employee:view" fallback={<ForbiddenNotice />}>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">员工管理</h2>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </RequirePermission>
  );
}
