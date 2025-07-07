import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { searchAll, type SearchOptions } from "~/lib/dal";

/**
 * Search API endpoint for real-time search functionality
 * Supports query parameter searching with type filtering
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  const types = url.searchParams.get('types');
  const limit = url.searchParams.get('limit');
  const userId = url.searchParams.get('userId') || 'user-nick-001';

  // Return empty results if no query provided
  if (!query || query.trim().length === 0) {
    return json({
      results: [],
      query: '',
      totalCount: 0,
      typeBreakdown: {},
      performance: {
        searchTime: 0,
        queryLength: 0
      }
    });
  }

  const startTime = Date.now();

  // Parse search options
  const searchOptions: SearchOptions = {
    query: query.trim(),
    userId,
    limit: limit ? parseInt(limit, 10) : 20
  };

  // Parse type filters if provided
  if (types) {
    const typeArray = types.split(',').filter(type => 
      ['asset', 'trust', 'family', 'professional'].includes(type)
    ) as Array<'asset' | 'trust' | 'family' | 'professional'>;
    
    if (typeArray.length > 0) {
      searchOptions.types = typeArray;
    }
  }

  try {
    // Perform the search using existing DAL function
    const results = searchAll(searchOptions);
    
    // Calculate type breakdown for UI grouping
    const typeBreakdown = results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const searchTime = Date.now() - startTime;

    return json({
      results,
      query: query.trim(),
      totalCount: results.length,
      typeBreakdown,
      performance: {
        searchTime,
        queryLength: query.trim().length
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    return json({
      results: [],
      query: query.trim(),
      totalCount: 0,
      typeBreakdown: {},
      error: 'Search failed. Please try again.',
      performance: {
        searchTime: Date.now() - startTime,
        queryLength: query.trim().length
      }
    }, { status: 500 });
  }
}

/**
 * Export type for search response to ensure type safety
 */
export type SearchApiResponse = {
  results: Array<{
    id: string;
    type: 'asset' | 'trust' | 'family' | 'professional';
    title: string;
    subtitle?: string;
    category?: string;
    value?: number;
    matchedField: string;
    matchScore: number;
  }>;
  query: string;
  totalCount: number;
  typeBreakdown: Record<string, number>;
  error?: string;
  performance: {
    searchTime: number;
    queryLength: number;
  };
};