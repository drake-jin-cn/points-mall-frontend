import { http } from '@/lib/http';
import type { MenuFormValues, MenuNode } from '@/types/menu';

export interface EmployeeProfile {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  roles: string[];
}

export interface PermissionsResponse {
  permissions: string[];
}

/**
 * Typed BFF client calls used by the (dashboard) shell and admin/menus page. `http`'s response
 * interceptor unwraps the `{ code, data }` envelope, so the runtime value is already `T` even
 * though axios's static types say `AxiosResponse<T>` — same pattern as the existing login page.
 */
export const menusApi = {
  getMenus: () => http.get('/menus') as unknown as Promise<MenuNode[]>,
  getPermissions: () => http.get('/permissions') as unknown as Promise<PermissionsResponse>,
  getEmployeeMe: () => http.get('/employees/me') as unknown as Promise<EmployeeProfile>,
  getAdminMenus: () => http.get('/admin/menus') as unknown as Promise<MenuNode[]>,
  createMenu: (values: MenuFormValues) =>
    http.post('/admin/menus', values) as unknown as Promise<MenuNode>,
  updateMenu: (id: number, values: MenuFormValues) =>
    http.put(`/admin/menus/${id}`, values) as unknown as Promise<MenuNode>,
  deleteMenu: (id: number) => http.delete(`/admin/menus/${id}`) as unknown as Promise<void>,
};
