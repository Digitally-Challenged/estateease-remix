import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { Link, useFetcher } from "@remix-run/react";
import { Search, X, Clock, TrendingUp, Loader2 } from "lucide-react";
import { SearchResultsGroup } from "./search-result";
import type { SearchApiResponse } from "~/routes/api.search";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showQuickStats?: boolean;
  onResultSelect?: () => void;
}

export interface SearchBarRef {
  focus: () => void;
}

export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(({ 
  placeholder = "Search assets, trusts, family, professionals...", 
  className = "",
  showQuickStats = false,
  onResultSelect 
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<SearchApiResponse>();

  // Expose focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
      setIsOpen(true);
    }
  }));

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length === 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      fetcher.load(`/api/search?q=${encodeURIComponent(query.trim())}&limit=8`);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetcher]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('estateease-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((searchTerm: string) => {
    if (searchTerm.trim().length === 0) return;
    
    const newHistory = [
      searchTerm.trim(),
      ...searchHistory.filter(item => item !== searchTerm.trim())
    ].slice(0, 5); // Keep only 5 most recent

    setSearchHistory(newHistory);
    localStorage.setItem('estateease-search-history', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Handle search input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 || searchHistory.length > 0);
  };

  // Handle result selection
  const handleResultSelect = () => {
    if (query.trim()) {
      saveToHistory(query.trim());
    }
    setIsOpen(false);
    setQuery("");
    onResultSelect?.();
  };

  // Handle history item click
  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    fetcher.load(`/api/search?q=${encodeURIComponent(historyQuery)}&limit=8`);
  };

  // Handle search submit (redirect to search page)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query.trim());
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && !isOpen) {
      handleSubmit(e);
    }
  };

  const isLoading = fetcher.state === "loading";
  const searchData = fetcher.data;
  const hasResults = searchData && searchData.results.length > 0;
  const showDropdown = isOpen && (query.length > 0 || searchHistory.length > 0);

  // Group results by type
  const groupedResults = searchData?.results.reduce((groups, result) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, typeof searchData.results>) || {};

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(query.length > 0 || searchHistory.length > 0)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-secondary-300 bg-secondary-50 text-secondary-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-secondary-400 transition-colors"
            autoComplete="off"
          />
          
          {/* Loading indicator or clear button */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-secondary-400 animate-spin" />
            ) : query.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="h-4 w-4 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </form>

      {/* Search dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-secondary-50 border border-secondary-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search results */}
          {query.length > 0 && (
            <>
              {hasResults ? (
                <div>
                  {/* Results header */}
                  <div className="px-4 py-2 border-b border-secondary-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-secondary-600">
                        {searchData.totalCount} result{searchData.totalCount !== 1 ? 's' : ''} 
                        {searchData.performance?.searchTime && (
                          <span className="text-secondary-400 ml-1">
                            ({searchData.performance.searchTime}ms)
                          </span>
                        )}
                      </span>
                      <Link
                        to={`/search?q=${encodeURIComponent(query)}`}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                        onClick={handleResultSelect}
                      >
                        View all results
                      </Link>
                    </div>
                  </div>

                  {/* Grouped results */}
                  <div className="max-h-80 overflow-y-auto">
                    {Object.entries(groupedResults).map(([type, results]) => (
                      <SearchResultsGroup 
                        key={type} 
                        type={type as 'asset' | 'trust' | 'family' | 'professional'} 
                        results={results} 
                        onClose={handleResultSelect}
                      />
                    ))}
                  </div>
                </div>
              ) : searchData?.error ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-error-500 text-sm">{searchData.error}</div>
                </div>
              ) : query.length > 1 && !isLoading ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-secondary-500 text-sm">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                  <Link
                    to={`/search?q=${encodeURIComponent(query)}`}
                    className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block transition-colors"
                    onClick={handleResultSelect}
                  >
                    Try advanced search
                  </Link>
                </div>
              ) : null}
            </>
          )}

          {/* Search history */}
          {query.length === 0 && searchHistory.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider bg-secondary-100 border-b border-secondary-100">
                Recent Searches
              </div>
              <div className="divide-y divide-secondary-100">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyItem)}
                    className="w-full px-4 py-3 text-left hover:bg-secondary-100 flex items-center space-x-3 transition-colors"
                  >
                    <Clock className="h-4 w-4 text-secondary-400 flex-shrink-0" />
                    <span className="text-sm text-secondary-700 flex-1 truncate">
                      {historyItem}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick stats (if enabled) */}
          {showQuickStats && query.length === 0 && (
            <div className="border-t border-secondary-100 px-4 py-3">
              <div className="flex items-center space-x-2 text-xs text-secondary-500">
                <TrendingUp className="h-3 w-3" />
                <span>Press Enter to search all</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

// Keyboard shortcut hook for global search
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        onOpen();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}