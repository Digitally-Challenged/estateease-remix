import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Shield,
  Plus,
  Heart,
  UserX,
  Home,
  AlertCircle,
  Calendar,
  TrendingUp,
  FileText
} from "lucide-react";
import { getAssets } from "~/lib/dal";
import type { Column } from "~/components/ui/data-table";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    const allAssets = await getAssets(userId);
    
    // Filter for insurance assets
    const insuranceAssets = allAssets.filter(asset => 
      asset?.category === 'INSURANCE' || 
      asset?.category === 'insurance' ||
      asset?.name?.toLowerCase().includes('insurance') ||
      asset?.name?.toLowerCase().includes('policy')
    );

    // Group by insurance type
    const policyTypes = {
      life: insuranceAssets.filter(a => 
        a?.name?.toLowerCase().includes('life') || 
        a?.assetDetails?.type === 'life'
      ),
      disability: insuranceAssets.filter(a => 
        a?.name?.toLowerCase().includes('disability') || 
        a?.assetDetails?.type === 'disability'
      ),
      longTermCare: insuranceAssets.filter(a => 
        a?.name?.toLowerCase().includes('long term') || 
        a?.name?.toLowerCase().includes('ltc') ||
        a?.assetDetails?.type === 'long_term_care'
      ),
      property: insuranceAssets.filter(a => 
        a?.name?.toLowerCase().includes('home') || 
        a?.name?.toLowerCase().includes('property') ||
        a?.name?.toLowerCase().includes('auto') ||
        a?.name?.toLowerCase().includes('car') ||
        a?.assetDetails?.type === 'property'
      ),
      other: insuranceAssets.filter(a => {
        const name = a?.name?.toLowerCase() || '';
        const type = a?.assetDetails?.type || '';
        return !name.includes('life') && 
               !name.includes('disability') && 
               !name.includes('long term') && 
               !name.includes('ltc') &&
               !name.includes('home') && 
               !name.includes('property') &&
               !name.includes('auto') &&
               !name.includes('car') &&
               type !== 'life' &&
               type !== 'disability' &&
               type !== 'long_term_care' &&
               type !== 'property';
      })
    };

    // Calculate totals
    const totalCoverage = insuranceAssets.reduce((sum, asset) => 
      sum + (asset?.value || asset?.assetDetails?.coverageAmount || 0), 0
    );
    
    const totalPremiums = insuranceAssets.reduce((sum, asset) => 
      sum + (asset?.assetDetails?.annualPremium || 0), 0
    );

    // Find policies expiring soon (mock data - would need expiration dates)
    const expiringPolicies = insuranceAssets.filter(asset => {
      const expirationDate = asset?.assetDetails?.expirationDate;
      if (!expirationDate) return false;
      const daysUntilExpiry = Math.floor((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    });

    return json({ 
      insuranceAssets,
      policyTypes,
      totalCoverage,
      totalPremiums,
      expiringPolicies,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load insurance assets:', error);
    return json({ 
      insuranceAssets: [],
      policyTypes: { life: [], disability: [], longTermCare: [], property: [], other: [] },
      totalCoverage: 0,
      totalPremiums: 0,
      expiringPolicies: [],
      error: error instanceof Error ? error.message : 'Failed to load insurance assets' 
    }, { status: 500 });
  }
}

function InsuranceAssetsContent() {
  const { 
    insuranceAssets, 
    policyTypes,
    totalCoverage,
    totalPremiums,
    expiringPolicies,
    error 
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Insurance Policies</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage your insurance coverage and policies</p>
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

  if (!insuranceAssets || insuranceAssets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Insurance Policies</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage your insurance coverage and policies</p>
          </div>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <Shield className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No insurance policies found</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
              Add your insurance policies to track coverage and ensure adequate protection
            </p>
            <Button asChild>
              <Link to="/assets/new?category=insurance">
                Add Insurance Policy
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const columns: Column<typeof insuranceAssets[0]>[] = [
    {
      key: 'name',
      header: 'Policy',
      render: (asset) => (
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium">{asset?.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              {asset?.assetDetails?.policyNumber && `Policy #${asset.assetDetails.policyNumber}`}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (asset) => {
        const type = asset?.assetDetails?.type || 'other';
        const typeLabels: Record<string, string> = {
          life: 'Life',
          disability: 'Disability',
          long_term_care: 'Long-Term Care',
          property: 'Property & Casualty',
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
      key: 'coverage',
      header: 'Coverage',
      render: (asset) => (
        <span className="font-medium">
          {formatCurrency(asset?.value || asset?.assetDetails?.coverageAmount || 0)}
        </span>
      )
    },
    {
      key: 'premium',
      header: 'Annual Premium',
      render: (asset) => (
        <span>
          {asset?.assetDetails?.annualPremium 
            ? formatCurrency(asset.assetDetails.annualPremium)
            : '-'
          }
        </span>
      )
    },
    {
      key: 'beneficiary',
      header: 'Beneficiary',
      render: (asset) => (
        <span className="text-sm">
          {asset?.assetDetails?.beneficiary || 'Not specified'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (asset) => {
        const expirationDate = asset?.assetDetails?.expirationDate;
        if (!expirationDate) {
          return <Badge variant="default">Active</Badge>;
        }
        const daysUntilExpiry = Math.floor((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          return <Badge variant="destructive">Expired</Badge>;
        } else if (daysUntilExpiry <= 30) {
          return <Badge variant="destructive">Expires Soon</Badge>;
        } else if (daysUntilExpiry <= 90) {
          return <Badge variant="secondary">Renewal Due</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Insurance Policies</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage your insurance coverage and policies</p>
        </div>
        <Button asChild>
          <Link to="/assets/new?category=insurance">
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCoverage)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Across all policies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Premiums</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPremiums)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Total yearly cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insuranceAssets.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
              {expiringPolicies.length > 0 && `${expiringPolicies.length} expiring soon`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Types</CardTitle>
            <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(policyTypes).filter(policies => policies.length > 0).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Categories covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Policies Alert */}
      {expiringPolicies.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Policies Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringPolicies.map((policy) => policy ? (
                <div key={policy.id} className="flex items-center justify-between">
                  <span className="text-orange-700 dark:text-orange-300">{policy.name}</span>
                  <Badge variant="destructive">
                    Expires {new Date(policy.assetDetails?.expirationDate).toLocaleDateString()}
                  </Badge>
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy Type Sections */}
      {policyTypes.life.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Life Insurance
            </CardTitle>
            <CardDescription>Policies that provide death benefits to beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={policyTypes.life}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {policyTypes.disability.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserX className="h-5 w-5 mr-2" />
              Disability Insurance
            </CardTitle>
            <CardDescription>Income protection in case of disability</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={policyTypes.disability}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {policyTypes.longTermCare.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Long-Term Care Insurance
            </CardTitle>
            <CardDescription>Coverage for extended care needs</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={policyTypes.longTermCare}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {policyTypes.property.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Property & Casualty Insurance
            </CardTitle>
            <CardDescription>Home, auto, and other property coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={policyTypes.property}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {policyTypes.other.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Insurance</CardTitle>
            <CardDescription>Additional coverage and specialty policies</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={policyTypes.other}
              columns={columns}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {/* All Policies Table (if no categorization) */}
      {insuranceAssets.length > 0 && Object.values(policyTypes).every(p => p.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>All Insurance Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={insuranceAssets}
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

export default function InsuranceAssets() {
  return (
    <ErrorBoundary level="page">
      <InsuranceAssetsContent />
    </ErrorBoundary>
  );
} 