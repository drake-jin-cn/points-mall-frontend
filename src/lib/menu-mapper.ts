import type { MenuItem } from '@drake-jin-cn/frontend-base';
import type { MenuNode } from '@/types/menu';

/**
 * Maps BFF's filtered menu tree (MenuNode: id/label/path/icon/permission_key/children) into the
 * shape frontend-base's Sidebar/Breadcrumb/AppShell expect (MenuItem: key/label/icon/path/
 * children). No filtering happens here — BFF already filtered by permission (TASK-PERM-0003).
 */
export function toMenuItems(nodes: MenuNode[]): MenuItem[] {
  return nodes
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((node) => ({
      key: String(node.id),
      label: node.label,
      path: node.path ?? undefined,
      icon: node.icon ?? undefined,
      children: node.children?.length ? toMenuItems(node.children) : undefined,
    }));
}
