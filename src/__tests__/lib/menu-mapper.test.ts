import { describe, it, expect } from 'vitest';
import { toMenuItems } from '@/lib/menu-mapper';
import type { MenuNode } from '@/types/menu';

const node = (overrides: Partial<MenuNode>): MenuNode => ({
  id: 1,
  label: 'Item',
  path: '/item',
  icon: null,
  parent_id: null,
  permission_key: null,
  sort_order: 1,
  is_active: true,
  children: [],
  ...overrides,
});

describe('toMenuItems', () => {
  it('maps id/label/path/icon/children to MenuItem key/label/path/icon/children', () => {
    const tree: MenuNode[] = [
      node({ id: 1, label: 'Dashboard', path: '/dashboard', icon: 'home' }),
    ];
    const result = toMenuItems(tree);
    expect(result).toEqual([
      { key: '1', label: 'Dashboard', path: '/dashboard', icon: 'home', children: undefined },
    ]);
  });

  it('recursively maps nested children', () => {
    const tree: MenuNode[] = [
      node({
        id: 5,
        label: '系统设置',
        path: null,
        icon: null,
        children: [node({ id: 6, label: '菜单管理', path: '/admin/menus' })],
      }),
    ];
    const result = toMenuItems(tree);
    expect(result[0].children).toEqual([
      { key: '6', label: '菜单管理', path: '/admin/menus', icon: undefined, children: undefined },
    ]);
  });

  it('sorts siblings by sort_order', () => {
    const tree: MenuNode[] = [
      node({ id: 2, label: 'Second', sort_order: 2 }),
      node({ id: 1, label: 'First', sort_order: 1 }),
    ];
    const result = toMenuItems(tree);
    expect(result.map((i) => i.label)).toEqual(['First', 'Second']);
  });
});
