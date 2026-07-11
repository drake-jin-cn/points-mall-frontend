import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PermissionProvider } from '@drake-jin-cn/frontend-base';
import { RequirePermission } from '@/components/RequirePermission';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { MenuManagementPage, MenuMutationPanel } from '@/components/MenuManagementPage';
import type { MenuNode } from '@/types/menu';

const menuTree: MenuNode[] = [
  {
    id: 1,
    label: 'Dashboard',
    path: '/dashboard',
    icon: null,
    parent_id: null,
    permission_key: 'dashboard:view',
    sort_order: 1,
    is_active: true,
    children: [],
  },
  {
    id: 6,
    label: '菜单管理',
    path: '/admin/menus',
    icon: null,
    parent_id: 5,
    permission_key: 'admin:menu:view',
    sort_order: 1,
    is_active: true,
    children: [],
  },
];

const noop = () => {};

describe('MenuManagementPage', () => {
  // AC-06
  it('with admin:menu:view + admin:menu:manage: renders the list and Add/Edit/Delete buttons', () => {
    render(
      <PermissionProvider permissions={['admin:menu:view', 'admin:menu:manage']}>
        <MenuManagementPage menuTree={menuTree} onCreate={noop} onUpdate={noop} onDelete={noop} />
      </PermissionProvider>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add menu item')).toBeInTheDocument();
    expect(screen.getAllByText('Edit')).toHaveLength(2);
    expect(screen.getAllByText('Delete')).toHaveLength(2);
  });

  // AC-04
  it('without admin:menu:manage: list renders but Add/Edit/Delete buttons are not rendered', () => {
    render(
      <PermissionProvider permissions={['admin:menu:view']}>
        <MenuManagementPage menuTree={menuTree} onCreate={noop} onUpdate={noop} onDelete={noop} />
      </PermissionProvider>,
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Add menu item')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  // AC-03: read-only list gated by admin:menu:view
  it('without admin:menu:view: the whole page renders the ForbiddenNotice fallback instead of the list', () => {
    render(
      <PermissionProvider permissions={[]}>
        <MenuManagementPage menuTree={menuTree} onCreate={noop} onUpdate={noop} onDelete={noop} />
      </PermissionProvider>,
    );
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText(/permission to view/i)).toBeInTheDocument();
  });

  // AC-06: clicking Add opens the mutation panel when permission is present
  it('with admin:menu:manage: clicking Add menu item opens the mutation form', () => {
    render(
      <PermissionProvider permissions={['admin:menu:view', 'admin:menu:manage']}>
        <MenuManagementPage menuTree={menuTree} onCreate={noop} onUpdate={noop} onDelete={noop} />
      </PermissionProvider>,
    );
    fireEvent.click(screen.getByText('Add menu item'));
    expect(screen.getByLabelText('menu-mutation-form')).toBeInTheDocument();
  });

  it('onCreate is called with the submitted form values', () => {
    const onCreate = vi.fn();
    render(
      <PermissionProvider permissions={['admin:menu:view', 'admin:menu:manage']}>
        <MenuManagementPage
          menuTree={menuTree}
          onCreate={onCreate}
          onUpdate={noop}
          onDelete={noop}
        />
      </PermissionProvider>,
    );
    fireEvent.click(screen.getByText('Add menu item'));
    fireEvent.change(screen.getByLabelText('label'), { target: { value: 'New Item' } });
    fireEvent.click(screen.getByText('Save'));
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ label: 'New Item' }));
  });

  // AC-05: defense-in-depth — the mutation panel itself refuses to show the real form when
  // admin:menu:manage is absent, independent of whether the triggering button was hidden.
  it('MenuMutationPanel wrapped in RequirePermission shows the fallback, not the form, when admin:menu:manage is absent', () => {
    render(
      <PermissionProvider permissions={['admin:menu:view']}>
        <RequirePermission requiredKey="admin:menu:manage" fallback={<ForbiddenNotice />}>
          <MenuMutationPanel target="new" onSave={noop} onCancel={noop} />
        </RequirePermission>
      </PermissionProvider>,
    );
    expect(screen.queryByLabelText('menu-mutation-form')).not.toBeInTheDocument();
    expect(screen.getByText(/permission to view/i)).toBeInTheDocument();
  });
});
