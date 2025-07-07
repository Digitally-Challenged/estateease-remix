import { Bell, Menu, Sun, Moon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useLocation } from "@remix-run/react";
import { SearchBar } from "~/components/ui/search/search-bar";
import { useTheme } from "~/utils/theme";
import { formatCurrency } from "~/utils/format";

interface HeaderProps {
  onMenuClick?: () => void;
  onRegisterSearchTrigger?: (triggerFn: () => void) => void;
  dashboardStats?: {
    total_net_worth: number;
    real_estate_value: number;
    investment_value: number;
    business_value: number;
    insurance_value: number;
    total_assets: number;
    active_trusts: number;
  };
  user?: {
    firstName: string;
    lastName: string;
    lastUpdated?: string;
  };
}

export function Header({ onMenuClick, onRegisterSearchTrigger, dashboardStats, user }: HeaderProps) {
  const searchBarRef = useRef<{ focus: () => void }>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Register search trigger function with parent
  useEffect(() => {
    if (onRegisterSearchTrigger) {
      onRegisterSearchTrigger(() => {
        searchBarRef.current?.focus();
      });
    }
  }, [onRegisterSearchTrigger]);

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/financial-overview') return 'Financial Overview';
    if (path.startsWith('/assets')) {
      if (path === '/assets') return 'All Assets';
      if (path.includes('real-estate')) return 'Real Estate';
      if (path.includes('financial')) return 'Financial Accounts';
      if (path.includes('insurance')) return 'Insurance Policies';
      if (path.includes('business')) return 'Business Interests';
      return 'Assets';
    }
    if (path === '/estate-planning') return 'Estate Planning';
    if (path === '/trusts') return 'Trusts';
    if (path === '/beneficiaries') return 'Beneficiaries';
    if (path === '/key-roles') return 'Key Roles';
    if (path === '/succession-planning') return 'Succession Planning';
    if (path === '/healthcare-directives') return 'Healthcare Directives';
    if (path === '/family') return 'Family Members';
    if (path === '/emergency-contacts') return 'Emergency Contacts';
    if (path === '/professionals') return 'Professionals';
    if (path === '/documents') return 'Documents';
    if (path === '/tax-planning') return 'Tax Planning';
    if (path === '/reports') return 'Reports';
    if (path === '/chatbot') return 'AI Advisor';
    if (path.startsWith('/settings')) return 'Settings';
    return 'EstateEase';
  };

  // Calculate percentage change (simplified for now)
  const getPercentageChange = () => {
    return { value: "+2.3%", isPositive: true };
  };

  const percentageChange = getPercentageChange();
  
  // Default values
  const defaultUser = {
    firstName: user?.firstName || 'Nicholas',
    lastName: user?.lastName || 'Coleman',
    lastUpdated: user?.lastUpdated || 'Today'
  };

  const netWorth = dashboardStats?.total_net_worth || 4200000;
  
  return (
    <header className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button, page title, and search */}
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Page Title - Visible on desktop */}
          <h1 className="hidden lg:block text-xl font-semibold text-secondary-900 dark:text-secondary-100">
            {getPageTitle()}
          </h1>
          
          {/* Search Bar */}
          <SearchBar 
            ref={searchBarRef}
            className="flex-1 max-w-lg"
            placeholder="Search assets, trusts, beneficiaries..."
            showQuickStats={false}
          />
        </div>

        {/* Right side - Quick stats, theme toggle, notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Quick stats - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-6 text-sm text-secondary-600 dark:text-secondary-400">
            <div className="text-center">
              <div className="font-semibold text-secondary-900 dark:text-secondary-100">
                {formatCurrency(netWorth)}
              </div>
              <div className="text-xs">Net Worth</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${
                percentageChange.isPositive 
                  ? 'text-success-600 dark:text-success-400' 
                  : 'text-error-600 dark:text-error-400'
              }`}>
                {percentageChange.value}
              </div>
              <div className="text-xs">This Month</div>
            </div>
          </div>

          <div className="h-6 w-px bg-secondary-200 dark:bg-secondary-700 hidden md:block" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-secondary-500 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-error-500 rounded-full"></span>
          </button>

          {/* User avatar */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {defaultUser.firstName} {defaultUser.lastName}
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                Last updated: {defaultUser.lastUpdated}
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white dark:text-secondary-900">
                {defaultUser.firstName[0]}{defaultUser.lastName[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}