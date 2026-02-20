import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { AssetDistributionChart } from "~/components/ui/asset-distribution-chart";
import Clock from "lucide-react/dist/esm/icons/clock";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import { getTrusts, getBeneficiaries, getLegalRoles, getAssets } from "~/lib/dal";
import { formatCurrency } from "~/utils/format";
import type { AnyEnhancedAsset } from "~/types/assets";
import type { Beneficiary, LegalRole } from "~/types/people";
import { requireUser } from "~/lib/auth.server";

interface PhaseItem {
  type: string;
  count: number;
  label: string;
}

interface Phase {
  name: string;
  status: string;
  description: string;
  items: PhaseItem[];
}

interface DistributionDataItem {
  id: string;
  name: string;
  type: "person";
  percentage: number;
  amount: number;
  level: number;
  children: undefined;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const [trusts, beneficiaries, legalRoles, assets] = await Promise.all([
      getTrusts(userId),
      getBeneficiaries(userId),
      getLegalRoles(userId),
      getAssets(userId),
    ]);

    // Helper: check if DAL beneficiary is primary or contingent by type name
    const isPrimaryBeneficiary = (b: (typeof beneficiaries)[number]) =>
      b?.type?.toLowerCase().includes("primary");
    const isContingentBeneficiary = (b: (typeof beneficiaries)[number]) =>
      b?.type?.toLowerCase().includes("contingent");

    // Calculate succession timeline phases
    const phases = [
      {
        name: "Current Estate",
        status: "active",
        description: "Present asset ownership and management",
        items: [
          { type: "assets", count: assets.length, label: "Total Assets" },
          { type: "trusts", count: trusts.length, label: "Active Trusts" },
        ],
      },
      {
        name: "First Transfer",
        status: beneficiaries.filter(isPrimaryBeneficiary).length > 0 ? "ready" : "incomplete",
        description: "Primary beneficiary distributions",
        items: [
          {
            type: "beneficiaries",
            count: beneficiaries.filter(isPrimaryBeneficiary).length,
            label: "Primary Beneficiaries",
          },
          {
            type: "percentage",
            count: beneficiaries
              .filter(isPrimaryBeneficiary)
              .reduce((sum, b) => sum + (b?.percentage || 0), 0),
            label: "% Allocated",
          },
        ],
      },
      {
        name: "Contingent Transfer",
        status: beneficiaries.filter(isContingentBeneficiary).length > 0 ? "ready" : "incomplete",
        description: "Backup beneficiary distributions",
        items: [
          {
            type: "beneficiaries",
            count: beneficiaries.filter(isContingentBeneficiary).length,
            label: "Contingent Beneficiaries",
          },
        ],
      },
      {
        name: "Administration",
        status:
          legalRoles.filter((r) => r?.roleType === "executor").length > 0 ? "ready" : "incomplete",
        description: "Estate settlement process",
        items: [
          {
            type: "executor",
            count: legalRoles.filter((r) => r?.roleType === "executor").length,
            label: "Executors",
          },
          {
            type: "trustee",
            count: legalRoles.filter((r) => r?.roleType === "trustee").length,
            label: "Trustees",
          },
        ],
      },
    ];

    // Calculate readiness score
    const readyPhases = phases.filter((p) => p.status === "ready" || p.status === "active").length;
    const readinessScore = Math.round((readyPhases / phases.length) * 100);

    // Group assets by ownership for succession flow
    const assetsByOwnership = assets.reduce(
      (acc, asset) => {
        if (!asset) return acc;
        const ownershipType = asset.ownership?.type || "unknown";
        if (!acc[ownershipType]) {
          acc[ownershipType] = [];
        }
        acc[ownershipType].push(asset);
        return acc;
      },
      {} as Record<string, AnyEnhancedAsset[]>,
    );

    // Prepare distribution chart data
    const totalEstateValue = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
    const distributionData = beneficiaries
      .map((beneficiary, index) => ({
        id: `beneficiary-${beneficiary?.id || index}`,
        name: beneficiary?.fullName || `Beneficiary ${index + 1}`,
        type: "person" as const,
        percentage: beneficiary?.percentage || 0,
        amount: totalEstateValue * ((beneficiary?.percentage || 0) / 100),
        level: isPrimaryBeneficiary(beneficiary) ? 0 : 1,
        children: undefined,
      }))
      .filter((b) => b.percentage > 0);

    return json({
      trusts,
      beneficiaries,
      legalRoles,
      assets,
      phases,
      readinessScore,
      assetsByOwnership,
      distributionData,
      totalEstateValue,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load succession planning data:", error);
    return json(
      {
        trusts: [],
        beneficiaries: [],
        legalRoles: [],
        assets: [],
        phases: [],
        readinessScore: 0,
        assetsByOwnership: {},
        distributionData: [],
        totalEstateValue: 0,
        error: error instanceof Error ? error.message : "Failed to load succession planning data",
      },
      { status: 500 },
    );
  }
}

function SuccessionPlanningContent() {
  const loaderData = useLoaderData<typeof loader>();

  const trusts = loaderData.trusts;
  const beneficiaries = loaderData.beneficiaries as unknown as Beneficiary[];
  const legalRoles = loaderData.legalRoles as unknown as LegalRole[];
  const assets = loaderData.assets;
  const phases = loaderData.phases as unknown as Phase[];
  const readinessScore = loaderData.readinessScore;
  const assetsByOwnership = loaderData.assetsByOwnership as unknown as Record<string, AnyEnhancedAsset[]>;
  const distributionData = loaderData.distributionData as unknown as DistributionDataItem[];
  const totalEstateValue = loaderData.totalEstateValue;
  const error = loaderData.error;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Succession Planning
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Visualize your estate succession timeline and transfer process
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

  const primaryBeneficiaries = beneficiaries.filter((b) => b?.isPrimary);
  const contingentBeneficiaries = beneficiaries.filter((b) => b?.isContingent);

  const handleExportDistribution = () => {
    // Generate distribution report data
    const distributionReport = {
      title: "Asset Distribution Report",
      generatedDate: new Date().toISOString(),
      totalEstate: totalEstateValue,
      beneficiaries: distributionData,
      summary: {
        totalBeneficiaries: distributionData.length,
        totalAllocated: distributionData.reduce((sum, b) => sum + b.percentage, 0),
        totalAmount: distributionData.reduce((sum, b) => sum + b.amount, 0),
      },
      phases: phases.map((phase) => ({
        name: phase.name,
        status: phase.status,
        description: phase.description,
        items: phase.items,
      })),
      assetsByOwnership: Object.entries(assetsByOwnership).map(([type, assets]) => ({
        ownershipType: type,
        count: assets.length,
        totalValue: assets.reduce((sum, asset) => sum + (asset?.value || 0), 0),
      })),
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(distributionReport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `distribution-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Succession Planning</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Visualize your estate succession timeline and transfer process
        </p>
      </div>

      {/* Readiness Score */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succession Readiness</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readinessScore}%</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              {readinessScore >= 75
                ? "Well prepared"
                : readinessScore >= 50
                  ? "Partially ready"
                  : "Needs attention"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstateValue)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Across {assets.length} assets
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
              {primaryBeneficiaries.length} primary, {contingentBeneficiaries.length} contingent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Succession Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Succession Timeline</CardTitle>
          <CardDescription>Visual representation of your estate transfer process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {phases.map((phase, index) => (
              <div key={phase.name} className="relative">
                {index < phases.length - 1 && (
                  <div className="absolute left-6 top-12 h-16 w-0.5 bg-gray-300" />
                )}

                <div className="flex items-start space-x-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                      phase.status === "active"
                        ? "bg-blue-100 text-blue-600 dark:text-blue-400"
                        : phase.status === "ready"
                          ? "bg-green-100 text-green-600 dark:text-green-400"
                          : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    {phase.status === "active" ? (
                      <Clock className="h-5 w-5" />
                    ) : phase.status === "ready" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <h3 className="text-lg font-medium">{phase.name}</h3>
                      <Badge
                        variant={
                          phase.status === "active"
                            ? "default"
                            : phase.status === "ready"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {phase.status === "active"
                          ? "Current"
                          : phase.status === "ready"
                            ? "Ready"
                            : "Incomplete"}
                      </Badge>
                    </div>
                    <p className="mb-3 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {phase.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      {phase.items.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                        >
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {item.type === "percentage" ? `${item.count}%` : item.count}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Distribution Chart */}
      <AssetDistributionChart
        data={distributionData}
        totalEstate={totalEstateValue}
        onExport={handleExportDistribution}
      />

      {/* Asset Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Distribution Flow</CardTitle>
          <CardDescription>How your assets will be distributed to beneficiaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Trust Assets */}
            {assetsByOwnership["TRUST"] && assetsByOwnership["TRUST"].length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 flex items-center font-medium">
                  <FileText className="mr-2 h-4 w-4" />
                  Trust-Owned Assets
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <p className="text-sm font-medium text-blue-900">Assets in Trust</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {assetsByOwnership["TRUST"]?.length || 0}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {formatCurrency(
                        (assetsByOwnership["TRUST"] || []).reduce(
                          (sum: number, asset) => sum + (asset?.value || 0),
                          0,
                        ),
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>

                  <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-sm font-medium text-green-900">Trust Beneficiaries</p>
                    {trusts.map((trust) =>
                      trust ? (
                        <p key={trust.id} className="text-sm text-green-700 dark:text-green-300">
                          {trust.name}: {trust.beneficiaries?.length || 0} beneficiaries
                        </p>
                      ) : null,
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Individual Assets */}
            {assetsByOwnership["INDIVIDUAL"] && assetsByOwnership["INDIVIDUAL"].length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 flex items-center font-medium">
                  <Users className="mr-2 h-4 w-4" />
                  Individually-Owned Assets
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
                    <p className="text-sm font-medium text-orange-900">Individual Assets</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {assetsByOwnership["INDIVIDUAL"]?.length || 0}
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {formatCurrency(
                        (assetsByOwnership["INDIVIDUAL"] || []).reduce(
                          (sum: number, asset) => sum + (asset?.value || 0),
                          0,
                        ),
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>

                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="text-sm font-medium text-purple-900">Will Beneficiaries</p>
                    <p className="text-sm text-purple-700">
                      Distributed according to will provisions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Joint Assets */}
            {assetsByOwnership["JOINT"] && assetsByOwnership["JOINT"].length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 flex items-center font-medium">
                  <Users className="mr-2 h-4 w-4" />
                  Jointly-Owned Assets
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-indigo-50 p-3">
                    <p className="text-sm font-medium text-indigo-900">Joint Assets</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {assetsByOwnership["JOINT"]?.length || 0}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {formatCurrency(
                        (assetsByOwnership["JOINT"] || []).reduce(
                          (sum: number, asset) => sum + (asset?.value || 0),
                          0,
                        ),
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>

                  <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Surviving Owner
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Passes automatically by survivorship
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Roles in Succession */}
      <Card>
        <CardHeader>
          <CardTitle>Key Roles in Estate Administration</CardTitle>
          <CardDescription>People responsible for managing the succession process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {legalRoles
              .filter((r) => r && ["executor", "trustee", "successor_trustee"].includes(r.roleType))
              .map((role) =>
                role ? (
                  <div key={role.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="font-medium">{role.personName}</p>
                        <p className="text-sm capitalize text-gray-600 dark:text-gray-400 dark:text-gray-500">
                          {role.roleType.replace("_", " ")}
                        </p>
                      </div>
                      <Badge variant={role.isPrimary ? "default" : "secondary"}>
                        {role.isPrimary ? "Primary" : "Alternate"}
                      </Badge>
                    </div>
                    {role.specificPowers && role.specificPowers.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {role.specificPowers.length} specific powers granted
                      </p>
                    )}
                  </div>
                ) : null,
              )}
          </div>

          {legalRoles.filter((r) => r && ["executor", "trustee"].includes(r.roleType)).length ===
            0 && (
            <div className="rounded-lg bg-orange-50 py-8 text-center dark:bg-orange-900/20">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-orange-600 dark:text-orange-400" />
              <p className="font-medium text-orange-800 dark:text-orange-200">
                No Executor or Trustee Assigned
              </p>
              <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                Assign key roles to ensure smooth estate administration
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessionPlanning() {
  return (
    <ErrorBoundary level="page">
      <SuccessionPlanningContent />
    </ErrorBoundary>
  );
}
