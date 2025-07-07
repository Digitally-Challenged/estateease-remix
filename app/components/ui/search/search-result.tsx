import { Link } from "@remix-run/react";
import { FileText, Building, Users, Briefcase, ArrowRight } from "lucide-react";
import type { SearchResult } from "~/lib/dal";
import { formatCurrency } from "../../../utils/format";

interface SearchResultProps {
  result: SearchResult;
  onClose?: () => void;
}

export function SearchResultItem({ result, onClose }: SearchResultProps) {
  const getIcon = () => {
    switch (result.type) {
      case 'asset':
        return <FileText className="h-5 w-5 text-secondary-400" />;
      case 'trust':
        return <Building className="h-5 w-5 text-secondary-400" />;
      case 'family':
        return <Users className="h-5 w-5 text-secondary-400" />;
      case 'professional':
        return <Briefcase className="h-5 w-5 text-secondary-400" />;
    }
  };

  const getLink = () => {
    switch (result.type) {
      case 'asset':
        return `/assets/${result.id}/edit`;
      case 'trust':
        return `/trusts/${result.id}`;
      case 'family':
        return `/family/${result.id}`;
      case 'professional':
        return `/family#professionals`;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'asset':
        return 'Asset';
      case 'trust':
        return 'Trust';
      case 'family':
        return 'Family Member';
      case 'professional':
        return 'Professional';
    }
  };

  return (
    <Link
      to={getLink()}
      onClick={onClose}
      className="block px-4 py-3 hover:bg-secondary-100 transition-colors"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-secondary-900 truncate">
            {result.title}
          </p>
          {result.subtitle && (
            <p className="text-sm text-secondary-500 truncate">
              {result.subtitle}
            </p>
          )}
          <div className="flex items-center mt-1 space-x-2 text-xs text-secondary-400">
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
  type: 'asset' | 'trust' | 'family' | 'professional';
  results: SearchResult[];
  onClose?: () => void;
}

export function SearchResultsGroup({ type, results, onClose }: SearchResultsGroupProps) {
  const getGroupTitle = () => {
    switch (type) {
      case 'asset':
        return 'Assets';
      case 'trust':
        return 'Trusts';
      case 'family':
        return 'Family Members';
      case 'professional':
        return 'Professionals';
    }
  };

  if (results.length === 0) return null;

  return (
    <div>
      <div className="px-4 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider bg-secondary-100">
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