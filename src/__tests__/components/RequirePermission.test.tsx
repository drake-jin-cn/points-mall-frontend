import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionProvider } from '@drake-jin-cn/frontend-base';
import { RequirePermission } from '@/components/RequirePermission';

describe('RequirePermission', () => {
  // AC-01
  it('renders children when the required key is visible', () => {
    render(
      <PermissionProvider permissions={['admin:menu:manage']}>
        <RequirePermission requiredKey="admin:menu:manage" fallback={<div>Denied</div>}>
          <div>Allowed</div>
        </RequirePermission>
      </PermissionProvider>,
    );
    expect(screen.getByText('Allowed')).toBeInTheDocument();
    expect(screen.queryByText('Denied')).not.toBeInTheDocument();
  });

  // AC-02
  it('renders fallback in place (no navigation) when the required key is not visible', () => {
    render(
      <PermissionProvider permissions={['dashboard:view']}>
        <RequirePermission requiredKey="admin:menu:manage" fallback={<div>Denied</div>}>
          <div>Allowed</div>
        </RequirePermission>
      </PermissionProvider>,
    );
    expect(screen.getByText('Denied')).toBeInTheDocument();
    expect(screen.queryByText('Allowed')).not.toBeInTheDocument();
  });
});
