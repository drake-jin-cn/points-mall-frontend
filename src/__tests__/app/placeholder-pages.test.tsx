import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionProvider } from '@drake-jin-cn/frontend-base';
import DataReportsPage from '@/app/(dashboard)/data/page';
import EmployeeManagementPage from '@/app/(dashboard)/admin/employees/page';

describe('Placeholder pages guarded by RequirePermission', () => {
  // AC-03: renders without error for a user who has access
  it('/data renders its content for a user with data:view', () => {
    render(
      <PermissionProvider permissions={['data:view']}>
        <DataReportsPage />
      </PermissionProvider>,
    );
    expect(screen.getByText('数据报表')).toBeInTheDocument();
  });

  // AC-04: /data for an employee (no data:view) shows the fallback, not the placeholder content
  it('/data shows the RequirePermission fallback for a user without data:view', () => {
    render(
      <PermissionProvider permissions={['dashboard:view']}>
        <DataReportsPage />
      </PermissionProvider>,
    );
    expect(screen.queryByText('数据报表')).not.toBeInTheDocument();
    expect(screen.getByText(/permission to view/i)).toBeInTheDocument();
  });

  // AC-03
  it('/admin/employees renders its content for a user with admin:employee:view', () => {
    render(
      <PermissionProvider permissions={['admin:employee:view']}>
        <EmployeeManagementPage />
      </PermissionProvider>,
    );
    expect(screen.getByText('员工管理')).toBeInTheDocument();
  });

  // AC-06 (employee-management analogue): fallback shown without the permission
  it('/admin/employees shows the RequirePermission fallback without admin:employee:view', () => {
    render(
      <PermissionProvider permissions={[]}>
        <EmployeeManagementPage />
      </PermissionProvider>,
    );
    expect(screen.queryByText('员工管理')).not.toBeInTheDocument();
    expect(screen.getByText(/permission to view/i)).toBeInTheDocument();
  });
});
