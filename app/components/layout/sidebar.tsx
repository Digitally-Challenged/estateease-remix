import { NavLink } from "@remix-run/react";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import FolderOpen from "lucide-react/dist/esm/icons/folder-open";
import Calculator from "lucide-react/dist/esm/icons/calculator";
import Settings from "lucide-react/dist/esm/icons/settings";
import Home from "lucide-react/dist/esm/icons/home";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Shield from "lucide-react/dist/esm/icons/shield";
import Scale from "lucide-react/dist/esm/icons/scale";
import Heart from "lucide-react/dist/esm/icons/heart";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Brain from "lucide-react/dist/esm/icons/brain";
import Zap from "lucide-react/dist/esm/icons/zap";
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
    name: "AI Dashboard",
    href: "/dashboard/intelligent",
    icon: Brain,
  },
  {
    name: "Financial Overview",
    href: "/financial-overview",
    icon: TrendingUp,
  },
  {
    name: "Financial Intelligence",
    href: "/financial-intelligence",
    icon: Zap,
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
      { name: "Wills", href: "/wills", icon: FileText },
      { name: "Powers of Attorney", href: "/powers-attorney", icon: FileText },
    ],
  },
  {
    name: "Family & Contacts",
    href: "/family",
    icon: Users,
    children: [
      { name: "Family Coordination", href: "/family-coordination", icon: UserCheck },
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
    name: "Security",
    href: "/security",
    icon: Shield,
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
    firstName: user?.firstName || "Nicholas",
    lastName: user?.lastName || "Coleman",
    role: user?.role || "Estate Owner",
  };

  return (
    <div
      className={cn("flex h-full w-64 flex-col bg-secondary-950", className)}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center px-4 lg:h-16 lg:px-6">
        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 lg:mr-3 lg:h-10 lg:w-10">
          <Scale className="h-4 w-4 text-white lg:h-5 lg:w-5" />
        </div>
        <span className="text-lg font-semibold text-secondary-50 lg:text-xl">
          EstateEase
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2 lg:px-4 lg:py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} />
          ))}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-secondary-700 p-3 lg:p-4">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 lg:h-10 lg:w-10">
            <span className="text-xs font-medium text-white lg:text-sm">
              {defaultUser.firstName[0]}
              {defaultUser.lastName[0]}
            </span>
          </div>
          <div className="ml-2 min-w-0 flex-1 lg:ml-3">
            <p className="truncate text-xs font-medium text-secondary-50 lg:text-sm">
              {defaultUser.firstName} {defaultUser.lastName}
            </p>
            <p className="truncate text-xs text-secondary-300">
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
          <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-secondary-300 hover:bg-secondary-800 hover:text-secondary-50 lg:px-3">
            <Icon className="h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5" />
            <span className="truncate text-sm font-medium">{item.name}</span>
          </summary>
          <ul className="ml-4 mt-1 space-y-1 lg:ml-6">
            {item.children.map((child) => (
              <li key={child.name}>
                <NavLink
                  to={child.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-sm lg:px-3",
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-secondary-300 hover:bg-secondary-800 hover:text-secondary-50",
                    )
                  }
                >
                  <child.icon className="h-3 w-3 flex-shrink-0 lg:h-4 lg:w-4" />
                  <span className="truncate">{child.name}</span>
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
            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium lg:px-3",
            isActive
              ? "bg-primary-600 text-white"
              : "text-secondary-300 hover:bg-secondary-800 hover:text-secondary-50",
          )
        }
      >
        <Icon className="h-4 w-4 flex-shrink-0 lg:h-5 lg:w-5" />
        <span className="truncate">{item.name}</span>
      </NavLink>
    </li>
  );
}
