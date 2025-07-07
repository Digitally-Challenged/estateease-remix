import * as React from "react";
import { 
  Users, 
  DollarSign, 
  Shield, 
  Search, 
  Plus, 
  Home,
  FileText,
  Star,
  TrendingUp,
  FolderOpen,
  Activity
} from "lucide-react";
import { Link } from "@remix-run/react";
import { cn } from "~/lib/utils";

export type EmptyStateType =
  | 'assets'
  | 'trusts'
  | 'family'
  | 'professionals'
  | 'documents'
  | 'search'
  | 'favorites'
  | 'recent'
  | 'analytics'
  | 'general';

export interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  illustration?: React.ReactNode;
  actions?: EmptyStateAction[];
  variant?: 'default' | 'minimal' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Empty state component for displaying when lists or sections have no content
 * Provides contextual messaging and actions to guide users
 */
export function EmptyState({
  type = 'general',
  title,
  description,
  icon,
  illustration,
  actions = [],
  variant = 'default',
  size = 'md',
  className,
  children
}: EmptyStateProps) {
  const config = getEmptyStateConfig(type);
  const Icon = icon || config.icon;
  
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const defaultActions = actions.length > 0 ? actions : config.actions;

  const containerClasses = cn(
    "flex flex-col items-center justify-center text-center",
    {
      // Size variants
      "py-12 px-6": size === 'lg',
      "py-8 px-4": size === 'md',
      "py-6 px-3": size === 'sm',
      
      // Style variants
      "bg-gray-50 rounded-lg border border-gray-200": variant === 'default',
      "": variant === 'minimal',
      "bg-gray-25 rounded border border-gray-100": variant === 'compact'
    },
    className
  );

  const iconSize = {
    sm: "h-8 w-8",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  }[size];

  const titleSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl"
  }[size];

  const descriptionSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];

  return (
    <div className={containerClasses}>
      {/* Illustration or Icon */}
      <div className="mb-4">
        {illustration ? (
          illustration
        ) : (
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Icon className={cn(iconSize, "text-gray-400")} />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-medium text-gray-900 mb-2",
        titleSize
      )}>
        {displayTitle}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-gray-600 max-w-md mb-6",
        descriptionSize
      )}>
        {displayDescription}
      </p>

      {/* Actions */}
      {defaultActions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {defaultActions.map((action, index) => (
            <EmptyStateActionButton
              key={index}
              action={action}
              size={size}
            />
          ))}
        </div>
      )}

      {/* Custom children */}
      {children}
    </div>
  );
}

/**
 * Action button component for empty states
 */
function EmptyStateActionButton({ 
  action, 
  size 
}: { 
  action: EmptyStateAction; 
  size: 'sm' | 'md' | 'lg' 
}) {
  const isPrimary = action.variant !== 'secondary';
  
  const buttonClasses = cn(
    "inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
    {
      // Primary style
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500": isPrimary,
      // Secondary style
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500": !isPrimary,
      
      // Sizes
      "px-3 py-1.5 text-sm": size === 'sm',
      "px-4 py-2 text-sm": size === 'md',
      "px-6 py-3 text-base": size === 'lg'
    }
  );

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }[size];

  const content = (
    <>
      {action.icon && <action.icon className={cn(iconSize, "mr-2")} />}
      {action.label}
    </>
  );

  if (action.to) {
    return (
      <Link to={action.to} className={buttonClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={action.onClick} className={buttonClasses}>
      {content}
    </button>
  );
}

/**
 * Get default configuration for different empty state types
 */
function getEmptyStateConfig(type: EmptyStateType) {
  const configs = {
    assets: {
      icon: DollarSign,
      title: "No assets yet",
      description: "Start building your estate portfolio by adding your first asset. Track real estate, investments, and other valuable properties.",
      actions: [
        {
          label: "Add Asset",
          to: "/assets/new",
          variant: 'primary' as const,
          icon: Plus
        }
      ]
    },
    trusts: {
      icon: Shield,
      title: "No trusts created",
      description: "Create and manage trusts to protect and distribute your assets according to your wishes.",
      actions: [
        {
          label: "Create Trust",
          to: "/trusts/new",
          variant: 'primary' as const,
          icon: Plus
        }
      ]
    },
    family: {
      icon: Users,
      title: "No family members added",
      description: "Add family members and beneficiaries to keep track of important relationships and contact information.",
      actions: [
        {
          label: "Add Family Member",
          to: "/family/new",
          variant: 'primary' as const,
          icon: Plus
        }
      ]
    },
    professionals: {
      icon: Star,
      title: "No professionals listed",
      description: "Keep track of attorneys, accountants, financial advisors, and other professionals who help manage your estate.",
      actions: [
        {
          label: "Add Professional",
          to: "/professionals/new",
          variant: 'primary' as const,
          icon: Plus
        }
      ]
    },
    documents: {
      icon: FileText,
      title: "No documents uploaded",
      description: "Upload and organize important estate planning documents, wills, and legal papers.",
      actions: [
        {
          label: "Upload Document",
          to: "/documents/upload",
          variant: 'primary' as const,
          icon: Plus
        }
      ]
    },
    search: {
      icon: Search,
      title: "No results found",
      description: "We couldn't find anything matching your search. Try adjusting your search terms or browse by category.",
      actions: [
        {
          label: "Clear Search",
          onClick: () => window.history.replaceState({}, '', window.location.pathname),
          variant: 'secondary' as const
        },
        {
          label: "Browse Assets",
          to: "/assets",
          variant: 'primary' as const
        }
      ]
    },
    favorites: {
      icon: Star,
      title: "No favorites yet",
      description: "Mark important assets, documents, or contacts as favorites for quick access.",
      actions: []
    },
    recent: {
      icon: Activity,
      title: "No recent activity",
      description: "Your recent actions and updates will appear here.",
      actions: [
        {
          label: "Go to Dashboard",
          to: "/dashboard",
          variant: 'primary' as const,
          icon: Home
        }
      ]
    },
    analytics: {
      icon: TrendingUp,
      title: "Not enough data",
      description: "Add more assets and data to see detailed analytics and insights about your estate portfolio.",
      actions: [
        {
          label: "Add Assets",
          to: "/assets/new",
          variant: 'primary' as const,
          icon: Plus
        }
      ]
    },
    general: {
      icon: FolderOpen,
      title: "No items found",
      description: "There are no items to display at the moment.",
      actions: []
    }
  };

  return configs[type];
}

/**
 * Preset empty state components for common use cases
 */
export const EmptyStates = {
  Assets: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="assets" />
  ),
  
  Trusts: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="trusts" />
  ),
  
  Family: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="family" />
  ),
  
  Professionals: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="professionals" />
  ),
  
  Documents: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="documents" />
  ),
  
  Search: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="search" />
  ),
  
  Recent: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="recent" />
  ),
  
  Analytics: (props: Partial<EmptyStateProps>) => (
    <EmptyState {...props} type="analytics" />
  )
};

/**
 * List empty state - optimized for empty lists
 */
export function ListEmptyState({
  type,
  itemName = "items",
  addNewLabel = "Add New",
  addNewTo,
  onAddNew,
  className,
  ...props
}: Partial<EmptyStateProps> & {
  itemName?: string;
  addNewLabel?: string;
  addNewTo?: string;
  onAddNew?: () => void;
}) {
  const actions: EmptyStateAction[] = [];
  
  if (addNewTo || onAddNew) {
    actions.push({
      label: addNewLabel,
      to: addNewTo,
      onClick: onAddNew,
      variant: 'primary',
      icon: Plus
    });
  }

  return (
    <EmptyState
      {...props}
      type={type}
      title={props.title || `No ${itemName} yet`}
      description={props.description || `Get started by adding your first ${itemName.slice(0, -1)}.`}
      actions={actions}
      variant="minimal"
      size="md"
      className={cn("py-8", className)}
    />
  );
}