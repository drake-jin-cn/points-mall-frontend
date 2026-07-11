'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PermissionProvider } from '@drake-jin-cn/frontend-base';
import { AppShell } from '@drake-jin-cn/frontend-base';
import { menusApi, type EmployeeProfile } from '@/lib/api/menus';
import { toMenuItems } from '@/lib/menu-mapper';
import { useAuthStore } from '@/store/useAuthStore';
import type { MenuNode } from '@/types/menu';

interface DashboardData {
  menuTree: MenuNode[];
  permissions: string[];
  profile: EmployeeProfile;
}

/**
 * Dashboard shell: fetches the current user's filtered menu tree + permission keys + profile from
 * BFF, then renders AppShell (from frontend-base) with PermissionProvider wrapping everything
 * below it. AppShell/Sidebar/Breadcrumb/Header are reused unmodified — this file only supplies
 * data and composition.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([menusApi.getMenus(), menusApi.getPermissions(), menusApi.getEmployeeMe()])
      .then(([menuTree, permissionsResult, profile]) => {
        if (cancelled) return;
        setData({ menuTree, permissions: permissionsResult.permissions, profile });
      })
      .catch(() => {
        if (cancelled) return;
        setData({ menuTree: [], permissions: [], profile: null as unknown as EmployeeProfile });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    clearUser();
    router.push('/login');
  };

  if (data === null) return null;

  return (
    <PermissionProvider permissions={data.permissions}>
      <AppShell
        title="Points Mall"
        menuItems={toMenuItems(data.menuTree)}
        user={{ name: data.profile?.name ?? '', avatar: data.profile?.avatarUrl ?? undefined }}
        currentPath={pathname}
        onLogout={handleLogout}
      >
        {children}
      </AppShell>
    </PermissionProvider>
  );
}
