import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from '@remix-run/react';
import { NavigationContext, NavigationState } from '~/contexts/navigation-context';

interface NavigationProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'estateease-navigation-state';

export function NavigationProvider({ children }: NavigationProviderProps) {
  const location = useLocation();
  
  // Initialize state from localStorage or defaults
  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall back to defaults if parsing fails
        }
      }
    }
    
    return {
      currentPath: '/',
      expandedSections: ['assets', 'trusts', 'family'], // Default expanded sections
      sidebarCollapsed: false,
      breadcrumbs: []
    };
  });

  // Update current path when location changes
  useEffect(() => {
    setNavigationState(prev => ({
      ...prev,
      currentPath: location.pathname
    }));
  }, [location.pathname]);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(navigationState));
    }
  }, [navigationState]);

  const setCurrentPath = (path: string) => {
    setNavigationState(prev => ({
      ...prev,
      currentPath: path
    }));
  };

  const toggleSection = (sectionId: string) => {
    setNavigationState(prev => ({
      ...prev,
      expandedSections: prev.expandedSections.includes(sectionId)
        ? prev.expandedSections.filter(id => id !== sectionId)
        : [...prev.expandedSections, sectionId]
    }));
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setNavigationState(prev => ({
      ...prev,
      sidebarCollapsed: collapsed
    }));
  };

  const setBreadcrumbs = (breadcrumbs: Array<{ label: string; href: string }>) => {
    setNavigationState(prev => ({
      ...prev,
      breadcrumbs
    }));
  };

  return (
    <NavigationContext.Provider
      value={{
        navigationState,
        setCurrentPath,
        toggleSection,
        setSidebarCollapsed,
        setBreadcrumbs
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}