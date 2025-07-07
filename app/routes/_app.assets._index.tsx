import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Building2, DollarSign, Shield, TrendingUp, Plus } from "lucide-react";
import { getAssets } from "~/lib/dal";
import { ErrorBoundary, EmptyStates, ErrorDisplay } from "~/components/ui";

export async function loader() {
  try {
    const userId = 'user-nick-001'; // Default user for now
    const assets = await getAssets(userId);
    
    return json({ assets, error: null });
  } catch (error) {
    console.error('Failed to load assets:', error);
    return json({ 
      assets: [], 
      error: error instanceof Error ? error.message : 'Failed to load assets' 
    }, { status: 500 });
  }
}

function AssetsContent() {
  const { assets, error } = useLoaderData<typeof loader>();

  // Show error if there was one
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assets Overview</h1>
            <p className="text-gray-600">Comprehensive view of all estate assets and their current values</p>
          </div>
        </div>
        <ErrorDisplay
          error={error}
          type="server"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Show empty state if no assets
  if (!assets || assets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assets Overview</h1>
            <p className="text-gray-600">Comprehensive view of all estate assets and their current values</p>
          </div>
        </div>
        <EmptyStates.Assets />
      </div>
    );
  }

  // Calculate totals by category
  const assetsByCategory = assets.filter(Boolean).reduce((acc, asset) => {
    if (!asset) return acc; // Additional null check
    const category = asset.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(asset);
    return acc;
  }, {} as Record<string, NonNullable<(typeof assets)[number]>[]>);

  const totalsByCategory = Object.entries(assetsByCategory).map(([category, categoryAssets]) => {
    const total = categoryAssets.filter(Boolean).reduce((sum, asset) => sum + (asset?.value || 0), 0);
    return { category, total, count: categoryAssets.length, assets: categoryAssets };
  });

  const categoryIcons = {
    'REAL_ESTATE': Building2,
    'FINANCIAL_ACCOUNT': DollarSign,
    'INSURANCE_POLICY': Shield,
    'BUSINESS_INTEREST': TrendingUp,
    'PERSONAL_PROPERTY': DollarSign,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalValue = assets.filter(Boolean).reduce((sum, asset) => sum + (asset?.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets Overview</h1>
          <p className="text-gray-600">Comprehensive view of all estate assets and their current values</p>
        </div>
        <Link
          to="/assets/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {totalsByCategory.map(({ category, total, count }) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || DollarSign;
          
          return (
            <Card key={category}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {category}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</div>
                <p className="text-xs text-gray-600">
                  {count} {count === 1 ? 'asset' : 'assets'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Portfolio Value */}
      <Card>
        <CardHeader>
          <CardTitle>Total Portfolio Value</CardTitle>
          <CardDescription>Combined value of all tracked assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
          <p className="text-sm text-gray-600 mt-2">
            Across {assets.length} total assets
          </p>
        </CardContent>
      </Card>

      {/* Assets by Category */}
      <div className="space-y-6">
        {totalsByCategory.map(({ category, assets: categoryAssets }) => {
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
                <CardDescription>
                  {categoryAssets.length} {categoryAssets.length === 1 ? 'asset' : 'assets'} • 
                  Total value: {formatCurrency(categoryAssets.filter(Boolean).reduce((sum, asset) => sum + (asset?.value || 0), 0))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryAssets.filter(Boolean).map((asset) => {
                    if (!asset) return null;
                    return (
                      <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{asset.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>{asset.ownership?.type || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(asset.value || 0)}</p>
                          <div className="flex space-x-2 mt-2">
                            <Link
                              to={`/assets/${asset.id}/edit`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function AssetsOverview() {
  return (
    <ErrorBoundary level="page">
      <AssetsContent />
    </ErrorBoundary>
  );
}