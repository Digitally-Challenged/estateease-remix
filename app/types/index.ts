export * from './enums';
export * from './assets';
export * from './people';
export * from './trusts';
export * from './user-profiles';

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
  allowedRoles?: string[];
  pageTitle?: string;
  description?: string;
  isNew?: boolean;
}

export interface NavCategory {
  id?: string;
  name: string;
  items: NavItem[];
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
}

// Re-export Asset for compatibility
export type Asset = import('./assets').AnyAsset;