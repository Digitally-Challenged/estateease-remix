import { useState } from "react";
import { Outlet } from "@remix-run/react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { NavigationProvider } from "~/components/providers/navigation-provider";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NavigationProvider>
      <div className="flex h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-secondary-100">
        {/* Sidebar - Always visible on desktop, toggleable on mobile */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
          <Sidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <button 
            className="fixed inset-0 z-40 bg-secondary-600 dark:bg-secondary-800 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSidebarOpen(false);
              }
            }}
            aria-label="Close sidebar"
          />
        )}

        {/* Main content - Adjusted to account for sidebar width on desktop */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-y-auto bg-secondary-50 dark:bg-secondary-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}