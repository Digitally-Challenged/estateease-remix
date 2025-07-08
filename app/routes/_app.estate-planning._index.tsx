import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/loading";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Building2, 
  FileText, 
  Users, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight
} from "lucide-react";
import { 
  getTrusts, 
  getBeneficiaries, 
  getLegalRoles,
  getHealthcareDirectives,
  getDashboardStats 
} from "~/lib/dal";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    
    // Fetch all relevant estate planning data
    const [trusts, beneficiaries, legalRoles, healthcareDirectives, stats] = await Promise.all([
      getTrusts(userId),
      getBeneficiaries(userId),
      getLegalRoles(userId),
      getHealthcareDirectives(userId),
      getDashboardStats(userId)
    ]);

    // Calculate planning progress
    const planningItems = [
      { name: 'Trusts Created', completed: trusts.length > 0, count: trusts.length },
      { name: 'Beneficiaries Assigned', completed: beneficiaries.length > 0, count: beneficiaries.length },
      { name: 'Legal Roles Assigned', completed: legalRoles.length > 0, count: legalRoles.length },
      { name: 'Healthcare Directives', completed: healthcareDirectives.length > 0, count: healthcareDirectives.length },
    ];

    const completedItems = planningItems.filter(item => item.completed).length;
    const progressPercentage = (completedItems / planningItems.length) * 100;

    return json({ 
      trusts, 
      beneficiaries, 
      legalRoles,
      healthcareDirectives,
      stats,
      planningItems,
      progressPercentage,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load estate planning data:', error);
    return json({ 
      trusts: [],
      beneficiaries: [],
      legalRoles: [],
      healthcareDirectives: [],
      stats: null,
      planningItems: [],
      progressPercentage: 0,
      error: error instanceof Error ? error.message : 'Failed to load estate planning data' 
    }, { status: 500 });
  }
}

function EstatePlanningContent() {
  const { 
    trusts, 
    beneficiaries, 
    legalRoles, 
    healthcareDirectives,
    stats,
    planningItems,
    progressPercentage,
    error 
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Estate Planning Center</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Complete estate planning overview and progress tracking</p>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalBeneficiaryPercentage = beneficiaries
    .filter(b => b && b.isPrimary)
    .reduce((sum, b) => sum + (b?.percentage || 0), 0);

  const hasValidBeneficiaries = totalBeneficiaryPercentage === 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Estate Planning Center</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Complete estate planning overview and progress tracking</p>
        </div>
      </div>

      {/* Planning Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Planning Progress</CardTitle>
          <CardDescription>Track your estate planning completion status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Overall Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {planningItems.map((item) => item ? (
              <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <span className={item.completed ? "font-medium" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"}>
                    {item.name}
                  </span>
                </div>
                {item.count > 0 && (
                  <Badge variant="secondary">{item.count}</Badge>
                )}
              </div>
            ) : null)}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalAssets || 0)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Across all assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trusts</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trusts.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Trust structures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaries.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
              {hasValidBeneficiaries ? (
                <span className="text-green-600 dark:text-green-400">✓ 100% allocated</span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400">{totalBeneficiaryPercentage}% allocated</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Roles</CardTitle>
            <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{legalRoles.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Assigned roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Planning Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Management */}
        <Card>
          <CardHeader>
            <CardTitle>Trust Management</CardTitle>
            <CardDescription>Manage your trust structures and distributions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {trusts.length > 0 ? (
              <>
                <div className="space-y-3">
                  {trusts.slice(0, 3).map((trust) => trust ? (
                    <div key={trust.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{trust.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{trust.type}</p>
                      </div>
                      <Badge variant="secondary">
                        {trust.beneficiaries?.length || 0} beneficiaries
                      </Badge>
                    </div>
                  ) : null)}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/trusts">
                    View All Trusts
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">No trusts created yet</p>
                <Button asChild>
                  <Link to="/trusts/new">Create Your First Trust</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Beneficiary Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary Overview</CardTitle>
            <CardDescription>Review and manage your beneficiaries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {beneficiaries.length > 0 ? (
              <>
                <div className="space-y-3">
                  {beneficiaries.filter(b => b.is_primary).slice(0, 3).map((beneficiary) => (
                    <div key={beneficiary.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{beneficiary.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{beneficiary.relationship}</p>
                      </div>
                      <Badge variant={beneficiary.is_primary ? "default" : "secondary"}>
                        {beneficiary.percentage || 0}%
                      </Badge>
                    </div>
                  ))}
                </div>
                {!hasValidBeneficiaries && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Warning: Total allocation is {totalBeneficiaryPercentage}% (should be 100%)
                    </p>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/beneficiaries">
                    Manage Beneficiaries
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">No beneficiaries assigned yet</p>
                <Button asChild>
                  <Link to="/beneficiaries">Add Beneficiaries</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Legal Documents Status */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Documents & Directives</CardTitle>
          <CardDescription>Essential legal documents for your estate plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/healthcare-directives"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Healthcare Directives</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                    {healthcareDirectives.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400">✓ Configured</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Not configured</span>
                    )}
                  </p>
                </div>
                <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>

            <Link 
              to="/key-roles"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Key Appointments</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                    {legalRoles.length} roles assigned
                  </p>
                </div>
                <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>

            <Link 
              to="/succession-planning"
              className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Succession Plan</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">
                    View timeline
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EstatePlanning() {
  return (
    <ErrorBoundary level="page">
      <EstatePlanningContent />
    </ErrorBoundary>
  );
} 