import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/menus',
  useRouter: () => ({ push: mockPush }),
}));

const mockGetMenus = vi.fn();
const mockGetPermissions = vi.fn();
const mockGetEmployeeMe = vi.fn();
vi.mock('@/lib/api/menus', () => ({
  menusApi: {
    getMenus: () => mockGetMenus(),
    getPermissions: () => mockGetPermissions(),
    getEmployeeMe: () => mockGetEmployeeMe(),
  },
}));

const fullTree = [
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
    id: 2,
    label: '考勤打卡',
    path: '/attendance',
    icon: null,
    parent_id: null,
    permission_key: 'attendance:view',
    sort_order: 2,
    is_active: true,
    children: [],
  },
  {
    id: 3,
    label: '积分商城',
    path: '/shop',
    icon: null,
    parent_id: null,
    permission_key: 'shop:view',
    sort_order: 3,
    is_active: true,
    children: [],
  },
  {
    id: 4,
    label: '数据报表',
    path: '/data',
    icon: null,
    parent_id: null,
    permission_key: 'data:view',
    sort_order: 4,
    is_active: true,
    children: [],
  },
  {
    id: 5,
    label: '系统设置',
    path: null,
    icon: null,
    parent_id: null,
    permission_key: null,
    sort_order: 5,
    is_active: true,
    children: [
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
      {
        id: 7,
        label: '员工管理',
        path: '/admin/employees',
        icon: null,
        parent_id: 5,
        permission_key: 'admin:employee:view',
        sort_order: 2,
        is_active: true,
        children: [],
      },
    ],
  },
];

const employeeTree = fullTree.slice(0, 3);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DashboardLayout', () => {
  // AC-01: admin sees the full sidebar tree, including 系统设置 group
  it('admin: renders AppShell with all 7 menu items in the sidebar', async () => {
    mockGetMenus.mockResolvedValue(fullTree);
    mockGetPermissions.mockResolvedValue({
      permissions: [
        'dashboard:view',
        'attendance:view',
        'shop:view',
        'data:view',
        'admin:menu:view',
        'admin:menu:manage',
        'admin:employee:view',
      ],
    });
    mockGetEmployeeMe.mockResolvedValue({
      id: 1,
      name: 'Admin User',
      email: 'admin@pointsmall.com',
      avatarUrl: null,
      isActive: true,
      roles: ['ADMIN'],
    });

    render(
      <DashboardLayout>
        <div data-testid="content">Content</div>
      </DashboardLayout>,
    );

    await waitFor(() => expect(screen.getByTestId('content')).toBeInTheDocument());
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('考勤打卡')).toBeInTheDocument();
    expect(screen.getByText('积分商城')).toBeInTheDocument();
    expect(screen.getByText('数据报表')).toBeInTheDocument();
    expect(screen.getAllByText('系统设置').length).toBeGreaterThan(0);
    expect(screen.getAllByText('菜单管理').length).toBeGreaterThan(0);
  });

  // AC-02: employee sees only the 3 shared items, no 系统设置 group, no 数据报表
  it('employee: renders AppShell with only Dashboard/考勤打卡/积分商城, no 系统设置, no 数据报表', async () => {
    mockGetMenus.mockResolvedValue(employeeTree);
    mockGetPermissions.mockResolvedValue({
      permissions: ['dashboard:view', 'attendance:view', 'shop:view'],
    });
    mockGetEmployeeMe.mockResolvedValue({
      id: 2,
      name: 'Employee User',
      email: 'employee@pointsmall.com',
      avatarUrl: null,
      isActive: true,
      roles: ['EMPLOYEE'],
    });

    render(
      <DashboardLayout>
        <div data-testid="content">Content</div>
      </DashboardLayout>,
    );

    await waitFor(() => expect(screen.getByTestId('content')).toBeInTheDocument());
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('考勤打卡')).toBeInTheDocument();
    expect(screen.getByText('积分商城')).toBeInTheDocument();
    expect(screen.queryByText('系统设置')).not.toBeInTheDocument();
    expect(screen.queryByText('数据报表')).not.toBeInTheDocument();
  });

  // AC-07: topbar shows the current user's name from /employees/me
  it("shows the current user's name in the header", async () => {
    mockGetMenus.mockResolvedValue(employeeTree);
    mockGetPermissions.mockResolvedValue({ permissions: [] });
    mockGetEmployeeMe.mockResolvedValue({
      id: 2,
      name: 'Employee User',
      email: 'employee@pointsmall.com',
      avatarUrl: null,
      isActive: true,
      roles: ['EMPLOYEE'],
    });

    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>,
    );

    await waitFor(() =>
      expect(screen.getByLabelText('user menu for Employee User')).toBeInTheDocument(),
    );
  });
});
