'use client';

import { usePermission } from '@drake-jin-cn/frontend-base';

export interface RequirePermissionProps {
  requiredKey: string;
  fallback: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Level 2 (page-level) permission gate. Renders `fallback` in place — no navigation — when the
 * current user's PermissionProvider context lacks `requiredKey`. This is the defense-in-depth
 * layer: even if a button that would normally trigger this view was hidden (Level 3,
 * usePermission), a user who reaches this route/component directly still sees the fallback, not
 * the real content.
 */
export function RequirePermission({ requiredKey, fallback, children }: RequirePermissionProps) {
  const { visible } = usePermission(requiredKey);
  return visible ? <>{children}</> : <>{fallback}</>;
}
