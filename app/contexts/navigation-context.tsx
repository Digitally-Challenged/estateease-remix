import { createContext, useContext } from 'react';

export interface NavigationState {
  currentPath: string;
  expandedSections: string[];
  sidebarCollapsed: boolean;
  breadcrumbs: Array<{ label: string; href: string }>;
}

export interface NavigationContextType {
  navigationState: NavigationState;
  setCurrentPath: (path: string) => void;
  toggleSection: (sectionId: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}