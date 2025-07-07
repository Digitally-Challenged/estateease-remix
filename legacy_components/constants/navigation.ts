import {
  Home,
  FileText,
  PieChart,
  Settings,
  Users,
  ScrollText,
  UserCog,
  Building2,
  Shield,
  FileStack,
  Brain,
  User,
  GitBranch,
} from 'lucide-react';

import type { NavItem, NavCategory } from '../types';

export const NAVIGATION_CATEGORIES: NavCategory[] = [
  {
    id: 'portfolio',
    name: 'Portfolio & Assets',
    icon: PieChart,
    description: 'Track and manage your assets and portfolio performance',
    color: 'blue',
    items: [
      {
        name: 'Overview',
        path: '/',
        icon: Home,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Estate Overview',
        description: 'Your estate planning dashboard',
      },
      {
        name: 'My Assets',
        path: '/assets',
        icon: PieChart,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Asset Portfolio',
        description: 'Manage your financial assets and property',
      },
    ],
  },
  {
    id: 'estate-planning',
    name: 'Estate Planning',
    icon: Building2,
    description: 'Comprehensive estate planning and trust management',
    color: 'green',
    items: [
      {
        name: 'Planning Dashboard',
        path: '/estate-planning',
        icon: ScrollText,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Estate Planning Center',
        description: 'Complete estate planning overview and progress',
      },
      {
        name: 'Trust Management',
        path: '/trusts',
        icon: Building2,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Trust Management',
        description: 'Manage trusts, trustees, and trust assets',
      },
      {
        name: 'Succession Planning',
        path: '/succession-planning',
        icon: GitBranch,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Succession Planning',
        description: 'Estate succession flow and timeline',
      },
      {
        name: 'Beneficiaries',
        path: '/beneficiaries',
        icon: Users,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Beneficiary Management',
        description: 'Primary and contingent beneficiaries',
      },
      {
        name: 'Key Roles',
        path: '/key-roles',
        icon: UserCog,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Key Appointments',
        description: 'Executors, trustees, and guardians',
      },
      {
        name: 'Healthcare Directives',
        path: '/healthcare-directives',
        icon: Shield,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Healthcare Directives',
        description: 'Medical decisions and healthcare proxies',
      },
    ],
  },
  {
    id: 'documents',
    name: 'Documents & Records',
    icon: FileText,
    description: 'Secure document storage and management',
    color: 'orange',
    items: [
      {
        name: 'Document Vault',
        path: '/documents',
        icon: FileStack,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Document Vault',
        description: 'Store and organize important documents',
      },
    ],
  },
  {
    id: 'ai-advisor',
    name: 'AI Advisor',
    icon: Brain,
    description: 'Get personalized estate planning advice',
    color: 'indigo',
    items: [
      {
        name: 'AI Advisor',
        path: '/chatbot',
        icon: Brain,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Estate Planning Assistant',
        description: 'Get personalized estate planning advice',
        isNew: true,
      },
    ],
  },
  {
    id: 'account',
    name: 'Account & Settings',
    icon: Settings,
    description: 'Account preferences and security settings',
    color: 'gray',
    items: [
      {
        name: 'Profile',
        path: '/profile',
        icon: User,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'User Profile',
        description: 'Your personal information and preferences',
      },
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        allowedRoles: ['admin', 'trustee', 'beneficiary', 'advisor'],
        pageTitle: 'Account Settings',
        description: 'App preferences and security',
      },
    ],
  },
];

// Flatten categories for backward compatibility
export const NAVIGATION_ITEMS: NavItem[] = NAVIGATION_CATEGORIES.flatMap(
  category => category.items,
);
