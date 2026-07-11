'use client';

import { useEffect, useState } from 'react';
import { PermissionProvider } from '@drake-jin-cn/frontend-base';
import { http } from '@/lib/http';

interface PermissionsResponse {
  permissions: string[];
}

/**
 * Minimal permission-fetching shell for the (dashboard) route group. Fetches the current user's
 * permission keys from BFF's GET /permissions and makes them available to usePermission()/
 * RequirePermission() below. The full dashboard chrome (AppShell, sidebar, header) is added by
 * TASK-PERM-0007 — this layout only wires the permission context so TASK-PERM-0006's page-level
 * and button-level guards can be exercised end-to-end.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    http
      .get<PermissionsResponse>('/permissions')
      .then((data) => {
        if (!cancelled) setPermissions((data as unknown as PermissionsResponse).permissions);
      })
      .catch(() => {
        if (!cancelled) setPermissions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (permissions === null) return null;

  return <PermissionProvider permissions={permissions}>{children}</PermissionProvider>;
}
