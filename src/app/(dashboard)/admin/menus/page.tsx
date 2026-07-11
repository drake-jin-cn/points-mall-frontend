'use client';

import { useCallback, useEffect, useState } from 'react';
import { menusApi } from '@/lib/api/menus';
import { MenuManagementPage } from '@/components/MenuManagementPage';
import type { MenuFormValues, MenuNode } from '@/types/menu';

export default function AdminMenusPage() {
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);

  const refresh = useCallback(() => {
    menusApi.getAdminMenus().then(setMenuTree);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreate = (values: MenuFormValues) => {
    menusApi.createMenu(values).then(refresh);
  };

  const handleUpdate = (id: number, values: MenuFormValues) => {
    menusApi.updateMenu(id, values).then(refresh);
  };

  const handleDelete = (id: number) => {
    menusApi.deleteMenu(id).then(refresh);
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
