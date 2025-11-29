import { Link } from "@remix-run/react";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Building from "lucide-react/dist/esm/icons/building";
import Users from "lucide-react/dist/esm/icons/users";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import type { SearchResult } from "~/lib/dal";
import { formatCurrency } from "../../../utils/format";

interface SearchResultProps {
  result: SearchResult;
  onClose?: () => void;
}

export function SearchResultItem({ result, onClose }: SearchResultProps) {
  const getIcon = () => {
    switch (result.type) {
      case "asset":
        return <FileText className="h-5 w-5 text-secondary-400" />;
      case "trust":
        return <Building className="h-5 w-5 text-secondary-400" />;
      case "family":
        return <Users className="h-5 w-5 text-secondary-400" />;
      case "professional":
        return <Briefcase className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getLink = () => {
    switch (result.type) {
      case "asset":
        return `/assets/${result.id}/edit`;
      case "trust":
        return `/trusts/${result.id}`;
      case "family":
        return `/family/${result.id}`;
      case "professional":
        return `/family#professionals`;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case "asset":
        return "Asset";
      case "trust":
        return "Trust";
      case "family":
        return "Family Member";
      case "professional":
        return "Professional";
    }
  };

  return (
    <Link
      to={getLink()}
      onClick={onClose}
      className="block px-4 py-3 transition-colors hover:bg-secondary-100"
    >
      <div className="flex items-start space-x-3">
        <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-secondary-900">{result.title}</p>
          {result.subtitle && (
            <p className="truncate text-sm text-secondary-500">{result.subtitle}</p>
          )}
          <div className="mt-1 flex items-center space-x-2 text-xs text-secondary-400">
            <span className="capitalize">{getTypeLabel()}</span>
            <span>•</span>
            <span>Matched in {result.matchedField}</span>
            {result.value && (
              <>
                <span>•</span>
                <span>{formatCurrency(result.value)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <ArrowRight className="h-4 w-4 text-secondary-400" />
        </div>
      </div>
    </Link>
  );
}

interface SearchResultsGroupProps {
  type: "asset" | "trust" | "family" | "professional";
  results: SearchResult[];
  onClose?: () => void;
}

export function SearchResultsGroup({ type, results, onClose }: SearchResultsGroupProps) {
  const getGroupTitle = () => {
    switch (type) {
      case "asset":
        return "Assets";
      case "trust":
        return "Trusts";
      case "family":
        return "Family Members";
      case "professional":
        return "Professionals";
    }
  };

  if (results.length === 0) return null;

  return (
    <div>
      <div className="bg-secondary-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-secondary-500">
        {getGroupTitle()} ({results.length})
      </div>
      <div className="divide-y divide-secondary-200">
        {results.map((result) => (
          <SearchResultItem key={result.id} result={result} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}
