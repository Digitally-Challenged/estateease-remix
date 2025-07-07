import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Building2,
  Plus,
  TrendingUp,
  DollarSign,
  FileText,
  PieChart,
  AlertCircle,
  Briefcase
} from "lucide-react";
import { getAssets } from "~/lib/dal";
import { AssetCategory } from "~/types/enums";
import type { AnyEnhancedAsset } from "~/types/assets";
import type { Column } from "~/components/ui/data-table";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    const allAssets = await getAssets(userId);
    
    // Filter for business assets
    const businessAssets = allAssets.filter(asset => {
      if (!asset) return false;
      
      // Check various ways a business asset might be categorized
      if (asset.category === AssetCategory.BUSINESS_INTEREST) return true;
      
      // Check ownership type
      if (asset.ownership?.type === 'BUSINESS') return true;
      
      // Check name for business keywords
      const name = asset.name?.toLowerCase() || '';
      return name.includes('business') ||
             name.includes('company') ||
             name.includes('llc') ||
             name.includes('inc') ||
             name.includes('corp');
    });

    // Helper to safely get business details
    const getBusinessDetails = (asset: AnyEnhancedAsset) => {
      // For now, return a mock object since assetDetails might not exist
      return {
        businessType: asset.ownership?.type === 'BUSINESS' ? 'corporation' : 'other',
        ownershipPercentage: 100,
        annualRevenue: 0,
        successionPlan: null,
        valuationDate: null,
        industry: null,
        ownershipType: 'Direct'
      };
    };

    // Group by business type
    const businessTypes = {
      sole: businessAssets.filter(a => {
        const details = getBusinessDetails(a);
        return details.businessType === 'sole_proprietorship' ||
               a?.name?.toLowerCase().includes('sole');
      }),
      partnership: businessAssets.filter(a => {
        const details = getBusinessDetails(a);
        return details.businessType === 'partnership' ||
               a?.name?.toLowerCase().includes('partnership');
      }),
      llc: businessAssets.filter(a => {
        const details = getBusinessDetails(a);
        return details.businessType === 'llc' ||
               a?.name?.toLowerCase().includes('llc');
      }),
      corporation: businessAssets.filter(a => {
        const details = getBusinessDetails(a);
        return details.businessType === 'corporation' ||
               details.businessType === 's_corp' ||
               details.businessType === 'c_corp' ||
               a?.name?.toLowerCase().includes('inc') ||
               a?.name?.toLowerCase().includes('corp');
      }),
      other: businessAssets.filter(a => {
        const details = getBusinessDetails(a);
        const name = a?.name?.toLowerCase() || '';
        return !['sole_proprietorship', 'partnership', 'llc', 'corporation', 's_corp', 'c_corp'].includes(details.businessType) &&
               !name.includes('sole') &&
               !name.includes('partnership') &&
               !name.includes('llc') &&
               !name.includes('inc') &&
               !name.includes('corp');
      })
    };

    // Calculate totals
    const totalValue = businessAssets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
    const totalRevenue = businessAssets.reduce((sum, asset) => {
      const details = getBusinessDetails(asset);
      return sum + (details.annualRevenue || 0);
    }, 0);
    const totalOwnership = businessAssets.reduce((sum, asset) => {
      const details = getBusinessDetails(asset);
      return sum + (details.ownershipPercentage || 0);
    }, 0) / (businessAssets.length || 1);

    // Identify businesses needing succession planning
    const needsSuccessionPlan = businessAssets.filter(asset => {
      const details = getBusinessDetails(asset);
      return !details.successionPlan || details.successionPlan === 'none';
    });

    return json({ 
      businessAssets,
      businessTypes,
      totalValue,
      totalRevenue,
      totalOwnership,
      needsSuccessionPlan,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load business assets:', error);
    return json({ 
      businessAssets: [],
      businessTypes: { sole: [], partnership: [], llc: [], corporation: [], other: [] },
      totalValue: 0,
      totalRevenue: 0,
      totalOwnership: 0,
      needsSuccessionPlan: [],
      error: error instanceof Error ? error.message : 'Failed to load business assets' 
    }, { status: 500 });
  }
}

function BusinessAssetsContent() {
  const { 
    businessAssets, 
    businessTypes,
    totalValue,
    totalRevenue,
    totalOwnership,
    needsSuccessionPlan,
    error 
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Interests</h1>
          <p className="text-gray-600 mt-2">Manage your business ownership and corporate assets</p>
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

  if (!businessAssets || businessAssets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Interests</h1>
            <p className="text-gray-600 mt-2">Manage your business ownership and corporate assets</p>
          </div>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No business interests found</h3>
            <p className="text-gray-600 mb-4">
              Add your business ownership interests to track value and plan succession
            </p>
            <Button asChild>
              <Link to="/assets/new?category=business">
                Add Business Interest
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to safely get business details
  const getBusinessDetails = (asset: AnyEnhancedAsset) => {
    return {
      businessType: asset.ownership?.type === 'BUSINESS' ? 'corporation' : 'other',
      ownershipPercentage: 100,
      annualRevenue: 0,
      successionPlan: null,
      valuationDate: null,
      industry: null,
      ownershipType: 'Direct',
      policyNumber: null,
      beneficiary: null
    };
  };

  const columns: Column<typeof businessAssets[0]>[] = [
    {
      key: 'name',
      header: 'Business',
      render: (asset) => {
        const details = getBusinessDetails(asset);
        return (
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium">{asset?.name}</p>
              <p className="text-sm text-gray-600">
                {details.industry && `${details.industry} Industry`}
              </p>
            </div>
          </div>
        );
      }
    },
    {
      key: 'type',
      header: 'Type',
      render: (asset) => {
        const details = getBusinessDetails(asset);
        const type = details.businessType || 'other';
        const typeLabels: Record<string, string> = {
          sole_proprietorship: 'Sole Proprietorship',
          partnership: 'Partnership',
          llc: 'LLC',
          corporation: 'Corporation',
          s_corp: 'S-Corp',
          c_corp: 'C-Corp',
          other: 'Other'
        };
        return (
          <Badge variant="outline">
            {typeLabels[type] || type}
          </Badge>
        );
      }
    },
    {
      key: 'ownership',
      header: 'Ownership',
      render: (asset) => {
        const details = getBusinessDetails(asset);
        return (
          <div>
            <p className="font-medium">
              {details.ownershipPercentage || 100}%
            </p>
            <p className="text-sm text-gray-600">
              {details.ownershipType || 'Direct'}
            </p>
          </div>
        );
      }
    },
    {
      key: 'value',
      header: 'Valuation',
      render: (asset) => {
        const details = getBusinessDetails(asset);
        return (
          <div>
            <p className="font-medium">{formatCurrency(asset?.value || 0)}</p>
            {details.valuationDate && (
              <p className="text-sm text-gray-600">
                as of {new Date(details.valuationDate).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      }
    },
    {
      key: 'revenue',
      header: 'Annual Revenue',
      render: (asset) => {
        const details = getBusinessDetails(asset);
        return (
          <span>
            {details.annualRevenue 
              ? formatCurrency(details.annualRevenue)
              : '-'
            }
          </span>
        );
      }
    },
    {
      key: 'succession',
      header: 'Succession Plan',
      render: (asset) => {
        const details = getBusinessDetails(asset);
        const hasPlan = details.successionPlan && 
                       details.successionPlan !== 'none';
        return (
          <Badge variant={hasPlan ? "default" : "destructive"}>
            {hasPlan ? 'In Place' : 'Needed'}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Interests</h1>
          <p className="text-gray-600 mt-2">Manage your business ownership and corporate assets</p>
        </div>
        <Button asChild>
          <Link to="/assets/new?category=business">
            <Plus className="h-4 w-4 mr-2" />
            Add Business
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-gray-600 mt-1">Across all businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-600 mt-1">Combined revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Businesses</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessAssets.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              Avg {Math.round(totalOwnership)}% ownership
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(businessTypes).filter(businesses => businesses.length > 0).length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Different structures</p>
          </CardContent>
        </Card>
      </div>

      {/* Succession Planning Alert */}
      {needsSuccessionPlan.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Business Succession Planning Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              {needsSuccessionPlan.length} {needsSuccessionPlan.length === 1 ? 'business needs' : 'businesses need'} succession planning
            </p>
            <div className="space-y-2">
              {needsSuccessionPlan.slice(0, 3).map((business) => business ? (
                <div key={business.id} className="flex items-center justify-between">
                  <span className="text-orange-700">{business.name}</span>
                  <span className="text-sm text-orange-600">
                    {formatCurrency(business.value || 0)} at risk
                  </span>
                </div>
              ) : null)}
            </div>
            {needsSuccessionPlan.length > 3 && (
              <p className="text-sm text-orange-600 mt-2">
                and {needsSuccessionPlan.length - 3} more...
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Entity Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Business Entity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(businessTypes).map(([type, businesses]) => {
              const typeLabels: Record<string, string> = {
                sole: 'Sole Prop',
                partnership: 'Partnership',
                llc: 'LLC',
                corporation: 'Corporation',
                other: 'Other'
              };
              const typeValue = businesses.reduce((sum, b) => sum + (b?.value || 0), 0);
              
              return (
                <div key={type} className="text-center">
                  <p className="text-2xl font-bold">{businesses.length}</p>
                  <p className="text-sm text-gray-600">{typeLabels[type]}</p>
                  {businesses.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(typeValue)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Business Type Sections */}
      {businessTypes.corporation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Corporations</CardTitle>
            <CardDescription>C-Corps, S-Corps, and other incorporated entities</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={businessTypes.corporation}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {businessTypes.llc.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Limited Liability Companies (LLCs)</CardTitle>
            <CardDescription>Flexible business structures with liability protection</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={businessTypes.llc}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {businessTypes.partnership.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Partnerships</CardTitle>
            <CardDescription>General and limited partnership interests</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={businessTypes.partnership}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {businessTypes.sole.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sole Proprietorships</CardTitle>
            <CardDescription>Individually owned businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={businessTypes.sole}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {businessTypes.other.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Business Interests</CardTitle>
            <CardDescription>Investments and other business structures</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={businessTypes.other}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {/* All Businesses Table (if no categorization) */}
      {businessAssets.length > 0 && Object.values(businessTypes).every(b => b.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>All Business Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={businessAssets}
              columns={columns}
              sortable={true}
              pagination={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BusinessAssets() {
  return (
    <ErrorBoundary level="page">
      <BusinessAssetsContent />
    </ErrorBoundary>
  );
} 