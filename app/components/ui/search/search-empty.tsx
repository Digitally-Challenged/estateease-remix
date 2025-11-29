import Search from "lucide-react/dist/esm/icons/search";
import FileX from "lucide-react/dist/esm/icons/file-x";
import Filter from "lucide-react/dist/esm/icons/filter";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import { Link } from "@remix-run/react";

interface SearchEmptyProps {
  type: "no-query" | "no-results" | "error";
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
  hasActiveFilters = false,
}: SearchEmptyProps) {
  const getContent = () => {
    switch (type) {
      case "no-query":
        return {
          icon: <Search className="h-12 w-12 text-secondary-400" />,
          title: "Search EstateEase",
          message: "Find assets, trusts, family members, and professionals quickly and easily.",
          suggestions: [
            'Try searching for asset names like "Primary Residence"',
            "Look up family members by name or relationship",
            "Find professionals by firm name or specialty",
            "Search trust names or grantors",
          ],
        };

      case "no-results":
        return {
          icon: <FileX className="h-12 w-12 text-secondary-400" />,
          title: "No results found",
          message: query
            ? `We couldn't find anything matching "${query}"`
            : "No items match your search criteria.",
          suggestions: [
            "Check your spelling",
            "Try using fewer keywords",
            "Use different keywords",
            ...(hasActiveFilters ? ["Remove some filters to see more results"] : []),
            "Search for partial names or descriptions",
          ],
        };

      case "error":
        return {
          icon: <RefreshCw className="text-error-400 h-12 w-12" />,
          title: "Search Error",
          message: "Something went wrong while searching. Please try again.",
          suggestions: [
            "Check your internet connection",
            "Try refreshing the page",
            "Contact support if the problem persists",
          ],
        };

      default:
        return {
          icon: <Search className="h-12 w-12 text-secondary-400" />,
          title: "Search",
          message: "Start your search above.",
          suggestions: [],
        };
    }
  };

  const content = getContent();

  return (
    <div className="px-6 py-12 text-center">
      {/* Icon */}
      <div className="mx-auto mb-4">{content.icon}</div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-medium text-secondary-900">{content.title}</h3>

      {/* Message */}
      <p className="mx-auto mb-6 max-w-md text-secondary-600">{content.message}</p>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {type === "error" && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        )}

        {type === "no-results" && hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center rounded-md bg-secondary-100 px-4 py-2 text-secondary-700 transition-colors hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-500"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </button>
        )}

        {type === "no-query" && (
          <Link
            to="/assets/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Add Your First Asset
          </Link>
        )}
      </div>

      {/* Suggestions */}
      {content.suggestions.length > 0 && (
        <div className="mx-auto max-w-md">
          <div className="mb-3 flex items-center justify-center">
            <Lightbulb className="mr-2 h-4 w-4 text-warning-500" />
            <span className="text-sm font-medium text-secondary-700">
              {type === "no-results" ? "Try:" : "Search Tips:"}
            </span>
          </div>
          <ul className="space-y-2 text-sm text-secondary-600">
            {content.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-secondary-400">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Searches */}
      {type === "no-query" && suggestions.length > 0 && (
        <div className="mx-auto mt-8 max-w-md">
          <h4 className="mb-3 text-sm font-medium text-secondary-700">Popular Searches</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, index) => (
              <Link
                key={index}
                to={`/search?q=${encodeURIComponent(suggestion)}`}
                className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-sm text-secondary-700 transition-colors hover:bg-secondary-200"
              >
                {suggestion}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Links */}
      {type === "no-query" && (
        <div className="mt-8 border-t border-secondary-200 pt-8">
          <h4 className="mb-4 text-sm font-medium text-secondary-700">Quick Access</h4>
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            <Link
              to="/assets"
              className="group flex flex-col items-center rounded-lg bg-primary-50 p-4 transition-colors hover:bg-primary-100"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 group-hover:bg-primary-700">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Assets</span>
              <span className="text-xs text-secondary-500">View all assets</span>
            </Link>

            <Link
              to="/trusts"
              className="hover:bg-success-100 group flex flex-col items-center rounded-lg bg-success-50 p-4 transition-colors"
            >
              <div className="group-hover:bg-success-600 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-success-500">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Trusts</span>
              <span className="text-xs text-secondary-500">Manage trusts</span>
            </Link>

            <Link
              to="/family"
              className="group flex flex-col items-center rounded-lg bg-secondary-100 p-4 transition-colors hover:bg-secondary-200"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-secondary-600 group-hover:bg-secondary-700">
                <FileX className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium text-secondary-900">Family</span>
              <span className="text-xs text-secondary-500">Family & contacts</span>
            </Link>

            <Link
              to="/dashboard"
              className="hover:bg-warning-100 group flex flex-col items-center rounded-lg bg-warning-50 p-4 transition-colors"
            >
              <div className="group-hover:bg-warning-600 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-warning-500">
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
    type: "no-query" as const,
    suggestions: suggestions || [
      "Primary Residence",
      "Coleman Family Trust",
      "John Smith",
      "Investment Account",
    ],
  }),

  noResults: (query: string, hasActiveFilters = false, onClearFilters?: () => void) => ({
    type: "no-results" as const,
    query,
    hasActiveFilters,
    onClearFilters,
  }),

  error: (onRetry?: () => void) => ({
    type: "error" as const,
    onRetry,
  }),
};
