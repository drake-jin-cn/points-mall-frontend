'use client';

import { useCallback, useEffect, useState } from 'react';
import { http } from '@/lib/http';
import { MenuManagementPage } from '@/components/MenuManagementPage';
import type { MenuFormValues, MenuNode } from '@/types/menu';

export default function AdminMenusPage() {
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);

  const refresh = useCallback(() => {
    http.get<MenuNode[]>('/admin/menus').then((data) => setMenuTree(data as unknown as MenuNode[]));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = (values: MenuFormValues) => {
    http.post('/admin/menus', values).then(refresh);
  };

  const handleUpdate = (id: number, values: MenuFormValues) => {
    http.put(`/admin/menus/${id}`, values).then(refresh);
  };

  const handleDelete = (id: number) => {
    http.delete(`/admin/menus/${id}`).then(refresh);
  };

  return (
    <MenuManagementPage
      menuTree={menuTree}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
