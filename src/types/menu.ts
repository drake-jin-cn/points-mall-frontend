export interface MenuNode {
  id: number;
  label: string;
  path: string | null;
  icon: string | null;
  parent_id: number | null;
  permission_key: string | null;
  sort_order: number;
  is_active: boolean;
  children: MenuNode[];
}

export interface MenuFormValues {
  label: string;
  path: string;
  permission_key: string;
}
