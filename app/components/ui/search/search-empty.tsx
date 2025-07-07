import { Search, FileX, Filter, Lightbulb, RefreshCw } from "lucide-react";
import { Link } from "@remix-run/react";

interface SearchEmptyProps {
  type: 'no-query' | 'no-results' | 'error';
  query?: string;
  suggestions?: string[];
  onRetry?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function SearchEmpty({ 
  type, 
  query, 
  suggestions = [], 
  onRetry, 
  onClearFilters,
  hasActiveFilters = false 
}: SearchEmptyProps) {
  const getContent = () => {
    switch (type) {
      case 'no-query':
        return {
          icon: <Search className="h-12 w-12 text-secondary-400" />,
          title: "Search EstateEase",
          message: "Find assets, trusts, family members, and professionals quickly and easily.",
          suggestions: [
            "Try searching for asset names like \"Primary Residence\"",
            "Look up family members by name or relationship",
            "Find professionals by firm name or specialty",
            "Search trust names or grantors"
          ]
        };

      case 'no-results':
        return {
          icon: <FileX className="h-12 w-12 text-secondary-400" />,
          title: "No results found",
          message: query ? `We couldn't find anything matching "${query}"` : "No items match your search criteria.",
          suggestions: [
            "Check your spelling",
            "Try using fewer keywords",
            "Use different keywords",
            ...(hasActiveFilters ? ["Remove some filters to see more results"] : []),
            "Search for partial names or descriptions"
          ]
        };

      case 'error':
        return {
          icon: <RefreshCw className="h-12 w-12 text-error-400" />,
          title: "Search Error",
          message: "Something went wrong while searching. Please try again.",
          suggestions: [
            "Check your internet connection",
            "Try refreshing the page",
            "Contact support if the problem persists"
          ]
        };

      default:
        return {
          icon: <Search className="h-12 w-12 text-secondary-400" />,
          title: "Search",
          message: "Start your search above.",
          suggestions: []
        };
    }
  };

  const content = getContent();

  return (
    <div className="text-center py-12 px-6">
      {/* Icon */}
      <div className="mx-auto mb-4">
        {content.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {content.title}
      </h3>

      {/* Message */}
      <p className="text-secondary-600 mb-6 max-w-md mx-auto">
        {content.message}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
        {type === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        )}

        {type === 'no-results' && hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-4 py-2 bg-secondary-100 text-secondary-700 rounded-md hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </button>
        )}

        {type === 'no-query' && (
          <Link
            to="/assets/new"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            Add Your First Asset
          </Link>
        )}
      </div>

      {/* Suggestions */}
      {content.suggestions.length > 0 && (
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-3">
            <Lightbulb className="h-4 w-4 text-warning-500 mr-2" />
            <span className="text-sm font-medium text-secondary-700">
              {type === 'no-results' ? 'Try:' : 'Search Tips:'}
            </span>
          </div>
          <ul className="text-sm text-secondary-600 space-y-2">
            {content.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-secondary-400 mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Searches */}
      {type === 'no-query' && suggestions.length > 0 && (
        <div className="mt-8 max-w-md mx-auto">
          <h4 className="text-sm font-medium text-secondary-700 mb-3">Popular Searches</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <Link
                key={index}
                to={`/search?q=${encodeURIComponent(suggestion)}`}
                className="inline-flex items-center px-3 py-1 bg-secondary-100 text-secondary-700 text-sm rounded-full hover:bg-secondary-200 transition-colors"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Links */}
      {type === 'no-query' && (
        <div className="mt-8 pt-8 border-t border-secondary-200">
          <h4 className="text-sm font-medium text-secondary-700 mb-4">Quick Access</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Link
              to="/assets"
              className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors group"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary-700">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Assets</span>
              <span className="text-xs text-secondary-500">View all assets</span>
            </Link>

            <Link
              to="/trusts"
              className="flex flex-col items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors group"
            >
              <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-success-600">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Trusts</span>
              <span className="text-xs text-secondary-500">Manage trusts</span>
            </Link>

            <Link
              to="/family"
              className="flex flex-col items-center p-4 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors group"
            >
              <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-secondary-700">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Family</span>
              <span className="text-xs text-secondary-500">Family & contacts</span>
            </Link>

            <Link
              to="/dashboard"
              className="flex flex-col items-center p-4 bg-warning-50 rounded-lg hover:bg-warning-100 transition-colors group"
            >
              <div className="w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center mb-2 group-hover:bg-warning-600">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Overview</span>
              <span className="text-xs text-secondary-500">Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Preset configurations for common scenarios
export const searchEmptyPresets = {
  noQuery: (suggestions?: string[]) => ({
    type: 'no-query' as const,
    suggestions: suggestions || [
      'Primary Residence',
      'Coleman Family Trust',
      'John Smith',
      'Investment Account'
    ]
  }),

  noResults: (query: string, hasActiveFilters = false, onClearFilters?: () => void) => ({
    type: 'no-results' as const,
    query,
    hasActiveFilters,
    onClearFilters
  }),

  error: (onRetry?: () => void) => ({
    type: 'error' as const,
    onRetry
  })
};