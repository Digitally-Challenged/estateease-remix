import { NavLink } from "@remix-run/react";
import {
  BarChart3,
  Building2,
  Users,
  FileText,
  FolderOpen,
  Calculator,
  Settings,
  Home,
  DollarSign,
  Shield,
  Scale,
  Heart,
  GitBranch,
  ClipboardList,
  Briefcase,
  UserCheck,
  AlertCircle,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { cn } from "~/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Financial Overview",
    href: "/financial-overview",
    icon: TrendingUp,
  },
  {
    name: "Assets",
    href: "/assets",
    icon: DollarSign,
    children: [
      { name: "All Assets", href: "/assets", icon: DollarSign },
      { name: "Real Estate", href: "/assets/real-estate", icon: Building2 },
      { name: "Financial Accounts", href: "/assets/financial", icon: BarChart3 },
      { name: "Insurance Policies", href: "/assets/insurance", icon: Shield },
      { name: "Business Interests", href: "/assets/business", icon: Briefcase },
    ],
  },
  {
    name: "Estate Planning",
    href: "/estate-planning",
    icon: Scale,
    children: [
      { name: "Estate Overview", href: "/estate-planning", icon: ClipboardList },
      { name: "Trusts", href: "/trusts", icon: Scale },
      { name: "Beneficiaries", href: "/beneficiaries", icon: Users },
      { name: "Key Roles", href: "/key-roles", icon: UserCheck },
      { name: "Succession Planning", href: "/succession-planning", icon: GitBranch },
      { name: "Distribution Plans", href: "/distribution-plans", icon: FileText },
    ],
  },
  {
    name: "Healthcare & Legal",
    href: "/healthcare-directives",
    icon: Heart,
    children: [
      { name: "Healthcare Directives", href: "/healthcare-directives", icon: Heart },
      { name: "Wills & Trusts Docs", href: "/legal/wills", icon: FileText },
      { name: "Powers of Attorney", href: "/legal/powers-attorney", icon: FileText },
    ],
  },
  {
    name: "Family & Contacts",
    href: "/family",
    icon: Users,
    children: [
      { name: "Family Members", href: "/family", icon: Users },
      { name: "Emergency Contacts", href: "/emergency-contacts", icon: AlertCircle },
      { name: "Professionals", href: "/professionals", icon: Briefcase },
    ],
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    name: "Tax Planning",
    href: "/tax-planning",
    icon: Calculator,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "AI Advisor",
    href: "/chatbot",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
  user?: {
    firstName: string;
    lastName: string;
    role?: string;
  };
}

export function Sidebar({ className, user }: SidebarProps) {
  // Default user data
  const defaultUser = {
    firstName: user?.firstName || 'Nicholas',
    lastName: user?.lastName || 'Coleman',
    role: user?.role || 'Estate Owner'
  };

  return (
    <div className={cn("flex h-full w-64 flex-col bg-secondary-950 dark:bg-secondary-900", className)}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-6">
        <img
          className="h-8 w-auto"
          src="/logo-dark.png"
          alt="EstateEase"
        />
        <span className="ml-2 text-xl font-semibold text-secondary-50 dark:text-secondary-100">EstateEase</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-secondary-700 dark:border-secondary-600 p-4">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
            <span className="text-sm font-medium text-white dark:text-secondary-900">
              {defaultUser.firstName[0]}{defaultUser.lastName[0]}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-secondary-50 dark:text-secondary-100">
              {defaultUser.firstName} {defaultUser.lastName}
            </p>
            <p className="text-xs text-secondary-300 dark:text-secondary-400">
              {defaultUser.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavigationItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  if (item.children) {
    return (
      <li>
        <details className="group" open>
          <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-secondary-300 dark:text-secondary-400 hover:bg-secondary-800 dark:hover:bg-secondary-700 hover:text-secondary-50 dark:hover:text-secondary-100">
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.name}</span>
          </summary>
          <ul className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <li key={child.name}>
                <NavLink
                  to={child.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                      isActive
                        ? "bg-primary-600 dark:bg-primary-500 text-white dark:text-secondary-900"
                        : "text-secondary-300 dark:text-secondary-400 hover:bg-secondary-800 dark:hover:bg-secondary-700 hover:text-secondary-50 dark:hover:text-secondary-100"
                    )
                  }
                >
                  <child.icon className="h-4 w-4" />
                  {child.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </details>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
            isActive
              ? "bg-primary-600 dark:bg-primary-500 text-white dark:text-secondary-900"
              : "text-secondary-300 dark:text-secondary-400 hover:bg-secondary-800 dark:hover:bg-secondary-700 hover:text-secondary-50 dark:hover:text-secondary-100"
          )
        }
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </NavLink>
    </li>
  );
}