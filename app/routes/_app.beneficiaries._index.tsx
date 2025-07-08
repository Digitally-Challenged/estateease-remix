import { json } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Users, 
  Plus,
  UserCheck,
  UserPlus,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import { getBeneficiaries, getTrusts } from "~/lib/dal";
import type { Column } from "~/components/ui/data-table";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    
    const [beneficiaries, trusts] = await Promise.all([
      getBeneficiaries(userId),
      getTrusts(userId)
    ]);

    // Calculate total percentages
    const primaryTotal = beneficiaries
      .filter(b => b?.isPrimary)
      .reduce((sum, b) => sum + (b?.percentage || 0), 0);
    
    const contingentTotal = beneficiaries
      .filter(b => b?.isContingent)
      .reduce((sum, b) => sum + (b?.percentage || 0), 0);

    return json({ 
      beneficiaries, 
      trusts,
      primaryTotal,
      contingentTotal,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load beneficiaries:', error);
    return json({ 
      beneficiaries: [],
      trusts: [],
      primaryTotal: 0,
      contingentTotal: 0,
      error: error instanceof Error ? error.message : 'Failed to load beneficiaries' 
    }, { status: 500 });
  }
}

function BeneficiariesContent() {
  const { beneficiaries, trusts, primaryTotal, contingentTotal, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Beneficiary Management</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage primary and contingent beneficiaries</p>
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

  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Beneficiary Management</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage primary and contingent beneficiaries</p>
          </div>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No beneficiaries assigned</h3>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
              Add beneficiaries to ensure your estate is distributed according to your wishes
            </p>
            <Button onClick={() => navigate('/beneficiaries/new')}>
              Add First Beneficiary
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const columns: Column<typeof beneficiaries[0]>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (beneficiary) => (
        <div>
          <p className="font-medium">{beneficiary?.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{beneficiary?.relationship}</p>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (beneficiary) => (
        <Badge variant={beneficiary?.isPrimary ? "default" : "secondary"}>
          {beneficiary?.isPrimary ? 'Primary' : 'Contingent'}
        </Badge>
      )
    },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (beneficiary) => (
        <span className="font-medium">{beneficiary?.percentage || 0}%</span>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (beneficiary) => (
        <div className="text-sm">
          {beneficiary?.contactInfo?.email && <p>{beneficiary.contactInfo.email}</p>}
          {beneficiary?.contactInfo?.primaryPhone && <p>{beneficiary.contactInfo.primaryPhone}</p>}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (beneficiary) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/beneficiaries/${beneficiary?.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const primaryBeneficiaries = beneficiaries.filter(b => b?.isPrimary);
  const contingentBeneficiaries = beneficiaries.filter(b => b?.isContingent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Beneficiary Management</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage primary and contingent beneficiaries</p>
        </div>
        <Button asChild>
          <Link to="/beneficiaries/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Beneficiary
          </Link>
        </Button>
      </div>

      {/* Allocation Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Beneficiaries</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryBeneficiaries.length}</div>
            <div className="mt-2">
              {primaryTotal === 100 ? (
                <p className="text-sm text-green-600 dark:text-green-400">✓ 100% allocated</p>
              ) : (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {primaryTotal}% allocated ({100 - primaryTotal}% remaining)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contingent Beneficiaries</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contingentBeneficiaries.length}</div>
            <div className="mt-2">
              {contingentTotal === 100 ? (
                <p className="text-sm text-green-600 dark:text-green-400">✓ 100% allocated</p>
              ) : contingentBeneficiaries.length > 0 ? (
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {contingentTotal}% allocated
                </p>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">None assigned</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {primaryTotal !== 100 && primaryBeneficiaries.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Primary Beneficiary Allocation Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300">
              Your primary beneficiary allocation totals {primaryTotal}%. 
              For proper estate distribution, this should equal 100%.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/beneficiaries/new')}
            >
              Adjust Allocations
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Primary Beneficiaries Table */}
      {primaryBeneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Primary Beneficiaries</CardTitle>
            <CardDescription>
              These beneficiaries will inherit your estate according to their allocated percentages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={primaryBeneficiaries.filter(Boolean).map(b => ({ ...b })) as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Contingent Beneficiaries Table */}
      {contingentBeneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contingent Beneficiaries</CardTitle>
            <CardDescription>
              These beneficiaries will inherit if primary beneficiaries are unable to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={contingentBeneficiaries.filter(Boolean).map(b => ({ ...b })) as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Trust Assignments */}
      {trusts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trust Beneficiary Assignments</CardTitle>
            <CardDescription>
              View beneficiaries assigned to specific trusts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trusts.map((trust, index) => trust ? (
                <div key={trust.id || `trust-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{trust.name}</h3>
                    <Badge variant="outline">{trust.type}</Badge>
                  </div>
                  {trust.beneficiaries && trust.beneficiaries.length > 0 ? (
                    <div className="space-y-2">
                      {trust.beneficiaries.map((beneficiary, index) => beneficiary ? (
                        <div key={`beneficiary-${index}`} className="flex items-center justify-between text-sm">
                          <span>{beneficiary.name}</span>
                          <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{beneficiary.percentage || 0}%</span>
                        </div>
                      ) : null)}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">No beneficiaries assigned to this trust</p>
                  )}
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Beneficiaries() {
  return (
    <ErrorBoundary level="page">
      <BeneficiariesContent />
    </ErrorBoundary>
  );
} 