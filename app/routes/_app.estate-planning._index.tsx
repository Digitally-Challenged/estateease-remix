import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/loading";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Users from "lucide-react/dist/esm/icons/users";
import Shield from "lucide-react/dist/esm/icons/shield";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import {
  getTrusts,
  getBeneficiaries,
  getLegalRoles,
  getHealthcareDirectives,
  getDashboardStats,
} from "~/lib/dal";
import { formatCurrency } from "~/utils/format";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    // Fetch all relevant estate planning data
    const [trusts, beneficiaries, legalRoles, healthcareDirectives, stats] = await Promise.all([
      getTrusts(userId),
      getBeneficiaries(userId),
      getLegalRoles(userId),
      getHealthcareDirectives(userId),
      getDashboardStats(userId),
    ]);

    // Calculate planning progress
    const planningItems = [
      { name: "Trusts Created", completed: trusts.length > 0, count: trusts.length },
      {
        name: "Beneficiaries Assigned",
        completed: beneficiaries.length > 0,
        count: beneficiaries.length,
      },
      { name: "Legal Roles Assigned", completed: legalRoles.length > 0, count: legalRoles.length },
      {
        name: "Healthcare Directives",
        completed: healthcareDirectives.length > 0,
        count: healthcareDirectives.length,
      },
    ];

    const completedItems = planningItems.filter((item) => item.completed).length;
    const progressPercentage = (completedItems / planningItems.length) * 100;

    return json({
      trusts,
      beneficiaries,
      legalRoles,
      healthcareDirectives,
      stats,
      planningItems,
      progressPercentage,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load estate planning data:", error);
    return json(
      {
        trusts: [],
        beneficiaries: [],
        legalRoles: [],
        healthcareDirectives: [],
        stats: null,
        planningItems: [],
        progressPercentage: 0,
        error: error instanceof Error ? error.message : "Failed to load estate planning data",
      },
      { status: 500 },
    );
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
    error,
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Estate Planning Center
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Complete estate planning overview and progress tracking
          </p>
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

  const totalBeneficiaryPercentage = beneficiaries
    .filter((b) => b && b.isPrimary)
    .reduce((sum, b) => sum + (b?.percentage || 0), 0);

  const hasValidBeneficiaries = totalBeneficiaryPercentage === 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Estate Planning Center
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Complete estate planning overview and progress tracking
          </p>
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
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Overall Progress
              </span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {planningItems.map((item) =>
              item ? (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-3">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    )}
                    <span
                      className={
                        item.completed
                          ? "font-medium"
                          : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
                      }
                    >
                      {item.name}
                    </span>
                  </div>
                  {item.count > 0 && <Badge variant="secondary">{item.count}</Badge>}
                </div>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalAssets || 0)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Across all assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trusts</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trusts.length}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Trust structures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaries.length}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              {hasValidBeneficiaries ? (
                <span className="text-green-600 dark:text-green-400">✓ 100% allocated</span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400">
                  {totalBeneficiaryPercentage}% allocated
                </span>
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
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Assigned roles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Planning Actions */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  {trusts.slice(0, 3).map((trust) =>
                    trust ? (
                      <div key={trust.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{trust.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            {trust.type}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {trust.beneficiaries?.length || 0} beneficiaries
                        </Badge>
                      </div>
                    ) : null,
                  )}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/trusts">
                    View All Trusts
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  No trusts created yet
                </p>
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
                  {beneficiaries
                    .filter((b) => b.is_primary)
                    .slice(0, 3)
                    .map((beneficiary) => (
                      <div key={beneficiary.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{beneficiary.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            {beneficiary.relationship}
                          </p>
                        </div>
                        <Badge variant={beneficiary.is_primary ? "default" : "secondary"}>
                          {beneficiary.percentage || 0}%
                        </Badge>
                      </div>
                    ))}
                </div>
                {!hasValidBeneficiaries && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-900/20">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Warning: Total allocation is {totalBeneficiaryPercentage}% (should be 100%)
                    </p>
                  </div>
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/beneficiaries">
                    Manage Beneficiaries
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  No beneficiaries assigned yet
                </p>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/healthcare-directives"
              className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Healthcare Directives</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    {healthcareDirectives.length > 0 ? (
                      <span className="text-green-600 dark:text-green-400">✓ Configured</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        Not configured
                      </span>
                    )}
                  </p>
                </div>
                <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>

            <Link
              to="/key-roles"
              className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Key Appointments</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    {legalRoles.length} roles assigned
                  </p>
                </div>
                <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>

            <Link
              to="/succession-planning"
              className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Succession Plan</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
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
