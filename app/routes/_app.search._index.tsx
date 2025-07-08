import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import { ArrowLeft, Filter, Search, SortAsc, SortDesc } from "lucide-react";
import { searchAll, type SearchOptions, type SearchResult } from "~/lib/dal";
import { SearchBar } from "~/components/ui/search/search-bar";
import { SearchResultsGroup } from "~/components/ui/search/search-result";

export const meta: MetaFunction = () => {
  return [
    { title: "Search Results - EstateEase" },
    { name: "description", content: "Search results for assets, trusts, family members, and professionals." },
  ];
};

interface LoaderData {
  results: SearchResult[];
  query: string;
  totalCount: number;
  typeBreakdown: Record<string, number>;
  appliedFilters: {
    types: string[];
    sortBy: string;
    sortOrder: string;
  };
  performance: {
    searchTime: number;
    queryLength: number;
  };
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const types = url.searchParams.get('types') || '';
  const sortBy = url.searchParams.get('sortBy') || 'relevance';
  const sortOrder = url.searchParams.get('sortOrder') || 'desc';
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  if (!query.trim()) {
    return json<LoaderData>({
      results: [],
      query: '',
      totalCount: 0,
      typeBreakdown: {},
      appliedFilters: {
        types: [],
        sortBy,
        sortOrder
      },
      performance: {
        searchTime: 0,
        queryLength: 0
      }
    });
  }

  const startTime = Date.now();

  try {
    // Parse search options
    const searchOptions: SearchOptions = {
      query: query.trim(),
      userId: 'user-nick-001',
      limit
    };

    // Parse type filters
    if (types) {
      const typeArray = types.split(',').filter(type => 
        ['asset', 'trust', 'family', 'professional'].includes(type)
      ) as Array<'asset' | 'trust' | 'family' | 'professional'>;
      
      if (typeArray.length > 0) {
        searchOptions.types = typeArray;
      }
    }

    // Perform search
    const searchResults = searchAll(searchOptions);

    // Apply sorting
    const results = sortBy !== 'relevance' 
      ? [...searchResults].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'type':
            comparison = a.type.localeCompare(b.type);
            break;
          case 'value':
            comparison = (a.value || 0) - (b.value || 0);
            break;
          default:
            comparison = b.matchScore - a.matchScore; // Default to relevance
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      })
      : searchResults;

    // Calculate type breakdown
    const typeBreakdown = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchTime = Date.now() - startTime;

    return json<LoaderData>({
      results,
      query: query.trim(),
      totalCount: results.length,
      typeBreakdown,
      appliedFilters: {
        types: searchOptions.types || [],
        sortBy,
        sortOrder
      },
      performance: {
        searchTime,
        queryLength: query.trim().length
      }
    });

  } catch (error) {
    console.error('Search page error:', error);
    
    return json<LoaderData>({
      results: [],
      query: query.trim(),
      totalCount: 0,
      typeBreakdown: {},
      appliedFilters: {
        types: [],
        sortBy,
        sortOrder
      },
      performance: {
        searchTime: Date.now() - startTime,
        queryLength: query.trim().length
      },
      error: 'Search failed. Please try again.'
    });
  }
}

export default function SearchResults() {
  const data = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, query, totalCount, typeBreakdown, appliedFilters, performance, error } = data;

  // Group results by type for display
  const groupedResults = results.reduce((groups: Record<string, SearchResult[]>, result: SearchResult) => {
    const type = result.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(result);
    return groups;
  }, {} as Record<string, SearchResult[]>);

  // Handle filter changes
  const handleTypeFilter = (type: string, checked: boolean) => {
    const currentTypes = appliedFilters.types;
    let newTypes: string[];
    
    if (checked) {
      newTypes = [...currentTypes, type];
    } else {
      newTypes = currentTypes.filter((t: string) => t !== type);
    }
    
    if (newTypes.length === 0) {
      searchParams.delete('types');
    } else {
      searchParams.set('types', newTypes.join(','));
    }
    setSearchParams(searchParams);
  };

  const handleSort = (newSortBy: string) => {
    const currentSortBy = appliedFilters.sortBy;
    const currentOrder = appliedFilters.sortOrder;
    
    if (newSortBy === currentSortBy) {
      // Toggle order
      searchParams.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New sort field
      searchParams.set('sortBy', newSortBy);
      searchParams.set('sortOrder', newSortBy === 'value' ? 'desc' : 'asc');
    }
    
    setSearchParams(searchParams);
  };

  const getSortIcon = (field: string) => {
    if (appliedFilters.sortBy !== field) return null;
    return appliedFilters.sortOrder === 'asc' ? 
      <SortAsc className="h-4 w-4" /> : 
      <SortDesc className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            
            <div className="flex-1 max-w-2xl">
              <SearchBar 
                className="w-full"
                placeholder="Search assets, trusts, family, professionals..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              </div>

              {/* Type filters */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</h4>
                {[
                  { value: 'asset', label: 'Assets', count: typeBreakdown.asset || 0 },
                  { value: 'trust', label: 'Trusts', count: typeBreakdown.trust || 0 },
                  { value: 'family', label: 'Family', count: typeBreakdown.family || 0 },
                  { value: 'professional', label: 'Professionals', count: typeBreakdown.professional || 0 }
                ].map(({ value, label, count }) => (
                  <label key={value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={appliedFilters.types.includes(value)}
                      onChange={(e) => handleTypeFilter(value, e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{label}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({count})</span>
                  </label>
                ))}
              </div>

              {/* Sort options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</h4>
                {[
                  { value: 'relevance', label: 'Relevance' },
                  { value: 'title', label: 'Name' },
                  { value: 'type', label: 'Type' },
                  { value: 'value', label: 'Value' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => handleSort(value)}
                    className={`flex items-center justify-between w-full text-left px-2 py-1 rounded text-sm ${
                      appliedFilters.sortBy === value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900'
                    }`}
                  >
                    <span>{label}</span>
                    {getSortIcon(value)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Search results header */}
            <div className="mb-6">
              {query && (
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Search Results
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                      {totalCount} result{totalCount !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                      {performance.searchTime && (
                        <span className="text-gray-400 dark:text-gray-500 ml-2">
                          ({performance.searchTime}ms)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
                <div className="text-red-600 dark:text-red-400 font-medium mb-2">Search Error</div>
                <div className="text-red-700 dark:text-red-300">{error}</div>
              </div>
            ) : !query ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Search EstateEase
                </h3>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Find assets, trusts, family members, and professionals quickly and easily.
                </p>
              </div>
            ) : totalCount === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
                  We couldn&apos;t find anything matching &ldquo;{query}&rdquo;
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                  <p>Try:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Checking your spelling</li>
                    <li>Using fewer keywords</li>
                    <li>Using different keywords</li>
                    <li>Removing filters</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {(Object.entries(groupedResults) as [string, SearchResult[]][]).map(([type, typeResults]) => (
                  <div key={type} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <SearchResultsGroup 
                      type={type as 'asset' | 'trust' | 'family' | 'professional'} 
                      results={typeResults}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}