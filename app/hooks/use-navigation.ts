import { useContext } from 'react';
import { NavigationContext } from '~/contexts/navigation-context';

export function useNavigation() {
  const context = useContext(NavigationContext);
  
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  
  return context;
}

// Utility hook for sidebar-specific functionality
export function useSidebar() {
  const { navigationState, toggleSection, setSidebarCollapsed } = useNavigation();
  
  return {
    expandedSections: navigationState.expandedSections,
    sidebarCollapsed: navigationState.sidebarCollapsed,
    isExpanded: (sectionId: string) => navigationState.expandedSections.includes(sectionId),
    toggleSection,
    setSidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(!navigationState.sidebarCollapsed)
  };
}

// Utility hook for breadcrumb functionality
export function useBreadcrumbs() {
  const { navigationState, setBreadcrumbs } = useNavigation();
  
  return {
    breadcrumbs: navigationState.breadcrumbs,
    setBreadcrumbs
  };
}