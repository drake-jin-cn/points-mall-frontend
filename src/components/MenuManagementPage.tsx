'use client';

import { useState } from 'react';
import { usePermission } from '@drake-jin-cn/frontend-base';
import { RequirePermission } from '@/components/RequirePermission';
import { ForbiddenNotice } from '@/components/ForbiddenNotice';
import { Button } from '@/components/ui/button';
import type { MenuFormValues, MenuNode } from '@/types/menu';

export type EditingTarget = 'new' | MenuNode | null;

export interface MenuMutationPanelProps {
  target: EditingTarget;
  onSave: (values: MenuFormValues) => void;
  onCancel: () => void;
}

/**
 * The actual write UI (create/edit form). Always wrapped in
 * `RequirePermission requiredKey="admin:menu:manage"` by its caller — this is the defense-in-depth
 * layer: even if `target` were somehow set without going through the (permission-hidden) Add/Edit
 * buttons, this panel itself refuses to render real form content without the permission.
 */
export function MenuMutationPanel({ target, onSave, onCancel }: MenuMutationPanelProps) {
  if (target === null) return null;

  const initial = target === 'new' ? { label: '', path: '', permission_key: '' } : target;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSave({
      label: String(formData.get('label') ?? ''),
      path: String(formData.get('path') ?? ''),
      permission_key: String(formData.get('permission_key') ?? ''),
    });
  };

  return (
    <form onSubmit={handleSubmit} aria-label="menu-mutation-form" className="space-y-3">
      <input name="label" defaultValue={initial.label} aria-label="label" />
      <input name="path" defaultValue={initial.path ?? ''} aria-label="path" />
      <input
        name="permission_key"
        defaultValue={initial.permission_key ?? ''}
        aria-label="permission_key"
      />
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export interface MenuManagementPageProps {
  menuTree: MenuNode[];
  onCreate: (values: MenuFormValues) => void;
  onUpdate: (id: number, values: MenuFormValues) => void;
  onDelete: (id: number) => void;
}

function flatten(nodes: MenuNode[]): MenuNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

/**
 * Menu management: list (gated by admin:menu:view) + create/edit/delete actions (gated by
 * admin:menu:manage at both the button level, via usePermission, and the mutation-panel level,
 * via RequirePermission — see AC-05 in TASK-PERM-0006).
 */
export function MenuManagementPage({
  menuTree,
  onCreate,
  onUpdate,
  onDelete,
}: MenuManagementPageProps) {
  const [editingTarget, setEditingTarget] = useState<EditingTarget>(null);
  const { visible: canManage } = usePermission('admin:menu:manage');
  const items = flatten(menuTree);

  const handleSave = (values: MenuFormValues) => {
    if (editingTarget === 'new') {
      onCreate(values);
    } else if (editingTarget) {
      onUpdate(editingTarget.id, values);
    }
    setEditingTarget(null);
  };

  return (
    <RequirePermission requiredKey="admin:menu:view" fallback={<ForbiddenNotice />}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Menu Management</h2>
          {canManage && <Button onClick={() => setEditingTarget('new')}>Add menu item</Button>}
        </div>

        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between py-2">
              <span>{item.label}</span>
              {canManage && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingTarget(item)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {editingTarget !== null && (
          <RequirePermission requiredKey="admin:menu:manage" fallback={<ForbiddenNotice />}>
            <MenuMutationPanel
              target={editingTarget}
              onSave={handleSave}
              onCancel={() => setEditingTarget(null)}
            />
          </RequirePermission>
        )}
      </div>
    </RequirePermission>
  );
}
