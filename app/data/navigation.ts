import Home from "lucide-react/dist/esm/icons/home";
import FileText from "lucide-react/dist/esm/icons/file-text";
import PieChart from "lucide-react/dist/esm/icons/pie-chart";
import Settings from "lucide-react/dist/esm/icons/settings";
import Users from "lucide-react/dist/esm/icons/users";
import ScrollText from "lucide-react/dist/esm/icons/scroll-text";
import UserCog from "lucide-react/dist/esm/icons/user-cog";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import Shield from "lucide-react/dist/esm/icons/shield";
import FileStack from "lucide-react/dist/esm/icons/file-stack";
import Brain from "lucide-react/dist/esm/icons/brain";
import User from "lucide-react/dist/esm/icons/user";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";

import type { NavItem, NavCategory } from "../types";

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: "portfolio",
    name: "Portfolio & Assets",
    icon: PieChart,
    description: "Track and manage your assets and portfolio performance",
    color: "blue",
    items: [
      {
        name: "Overview",
        href: "/",
        icon: Home,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Estate Overview",
        description: "Your estate planning dashboard",
      },
      {
        name: "My Assets",
        href: "/assets",
        icon: PieChart,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Asset Portfolio",
        description: "Manage your financial assets and property",
      },
    ],
  },
  {
    id: "estate-planning",
    name: "Estate Planning",
    icon: Building2,
    description: "Comprehensive estate planning and trust management",
    color: "green",
    items: [
      {
        name: "Planning Dashboard",
        href: "/estate-planning",
        icon: ScrollText,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Estate Planning Center",
        description: "Complete estate planning overview and progress",
      },
      {
        name: "Trust Management",
        href: "/trusts",
        icon: Building2,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Trust Management",
        description: "Manage trusts, trustees, and trust assets",
      },
      {
        name: "Succession Planning",
        href: "/succession-planning",
        icon: GitBranch,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Succession Planning",
        description: "Estate succession flow and timeline",
      },
      {
        name: "Beneficiaries",
        href: "/beneficiaries",
        icon: Users,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Beneficiary Management",
        description: "Primary and contingent beneficiaries",
      },
      {
        name: "Key Roles",
        href: "/key-roles",
        icon: UserCog,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Key Appointments",
        description: "Executors, trustees, and guardians",
      },
      {
        name: "Healthcare Directives",
        href: "/healthcare-directives",
        icon: Shield,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Healthcare Directives",
        description: "Medical decisions and healthcare proxies",
      },
    ],
  },
  {
    id: "documents",
    name: "Documents & Records",
    icon: FileText,
    description: "Secure document storage and management",
    color: "orange",
    items: [
      {
        name: "Document Vault",
        href: "/documents",
        icon: FileStack,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Document Vault",
        description: "Store and organize important documents",
      },
    ],
  },
  {
    id: "ai-advisor",
    name: "AI Insights",
    icon: Brain,
    description: "AI-powered estate planning insights and recommendations",
    color: "indigo",
    items: [
      {
        name: "AI Insights",
        href: "/ai-insights",
        icon: Brain,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "AI Estate Planning Insights",
        description: "Intelligent analysis and recommendations for your estate",
        isNew: true,
      },
      {
        name: "AI Advisor",
        href: "/chatbot",
        icon: Brain,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Estate Planning Assistant",
        description: "Chat with AI advisor for personalized guidance",
        isNew: true,
      },
    ],
  },
  {
    id: "account",
    name: "Account & Settings",
    icon: Settings,
    description: "Account preferences and security settings",
    color: "gray",
    items: [
      {
        name: "Profile",
        href: "/profile",
        icon: User,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "User Profile",
        description: "Your personal information and preferences",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        allowedRoles: ["admin", "trustee", "beneficiary", "advisor"],
        pageTitle: "Account Settings",
        description: "App preferences and security",
      },
    ],
  },
];

// Flatten categories for backward compatibility
export const NAVIGATION_ITEMS: NavItem[] = NAVIGATION_CATEGORIES.flatMap(
  (category) => category.items,
);
