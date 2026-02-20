import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import Shield from "lucide-react/dist/esm/icons/shield";
import Plus from "lucide-react/dist/esm/icons/plus";
import Heart from "lucide-react/dist/esm/icons/heart";
import UserX from "lucide-react/dist/esm/icons/user-x";
import Home from "lucide-react/dist/esm/icons/home";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import FileText from "lucide-react/dist/esm/icons/file-text";
import { getAssets } from "~/lib/dal";
import { AssetCategory } from "~/types/enums";
import type { InsurancePolicy, AnyEnhancedAsset } from "~/types/assets";
import type { Column } from "~/components/ui/data-table";
import { formatCurrency } from "~/utils/format";
import { requireUser } from "~/lib/auth.server";

/** Safely cast an asset to InsurancePolicy for property access */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asInsurance(asset: any): InsurancePolicy {
  return asset as InsurancePolicy;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const allAssets = await getAssets(userId);

    // Filter for insurance assets
    const insuranceAssets = allAssets.filter(
      (asset) =>
        asset?.category === AssetCategory.INSURANCE_POLICY ||
        asset?.name?.toLowerCase().includes("insurance") ||
        asset?.name?.toLowerCase().includes("policy"),
    );

    // Group by insurance type using InsurancePolicy.policyType
    const getPolicyType = (a: AnyEnhancedAsset): string =>
      asInsurance(a).policyType || "";

    const policyTypes = {
      life: insuranceAssets.filter(
        (a) => a?.name?.toLowerCase().includes("life") || getPolicyType(a) === "LIFE",
      ),
      disability: insuranceAssets.filter(
        (a) =>
          a?.name?.toLowerCase().includes("disability") || getPolicyType(a) === "DISABILITY",
      ),
      longTermCare: insuranceAssets.filter(
        (a) =>
          a?.name?.toLowerCase().includes("long term") ||
          a?.name?.toLowerCase().includes("ltc") ||
          getPolicyType(a) === "LONG_TERM_CARE",
      ),
      property: insuranceAssets.filter(
        (a) =>
          a?.name?.toLowerCase().includes("home") ||
          a?.name?.toLowerCase().includes("property") ||
          a?.name?.toLowerCase().includes("auto") ||
          a?.name?.toLowerCase().includes("car") ||
          getPolicyType(a) === "HOMEOWNERS" ||
          getPolicyType(a) === "AUTO",
      ),
      other: insuranceAssets.filter((a) => {
        const name = a?.name?.toLowerCase() || "";
        const type = getPolicyType(a);
        return (
          !name.includes("life") &&
          !name.includes("disability") &&
          !name.includes("long term") &&
          !name.includes("ltc") &&
          !name.includes("home") &&
          !name.includes("property") &&
          !name.includes("auto") &&
          !name.includes("car") &&
          type !== "LIFE" &&
          type !== "DISABILITY" &&
          type !== "LONG_TERM_CARE" &&
          type !== "HOMEOWNERS" &&
          type !== "AUTO"
        );
      }),
    };

    // Calculate totals
    const totalCoverage = insuranceAssets.reduce(
      (sum, asset) => sum + (asset?.value || asInsurance(asset).coverageAmount || 0),
      0,
    );

    const totalPremiums = insuranceAssets.reduce(
      (sum, asset) => sum + (asInsurance(asset).premium?.amount || 0),
      0,
    );

    // Find policies expiring soon
    const expiringPolicies = insuranceAssets.filter((asset) => {
      const expirationDate = asInsurance(asset).expirationDate;
      if (!expirationDate) return false;
      const daysUntilExpiry = Math.floor(
        (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    });

    return json({
      insuranceAssets,
      policyTypes,
      totalCoverage,
      totalPremiums,
      expiringPolicies,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load insurance assets:", error);
    return json(
      {
        insuranceAssets: [],
        policyTypes: { life: [], disability: [], longTermCare: [], property: [], other: [] },
        totalCoverage: 0,
        totalPremiums: 0,
        expiringPolicies: [],
        error: error instanceof Error ? error.message : "Failed to load insurance assets",
      },
      { status: 500 },
    );
  }
}

function InsuranceAssetsContent() {
  const { insuranceAssets, policyTypes, totalCoverage, totalPremiums, expiringPolicies, error } =
    useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Insurance Policies
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage your insurance coverage and policies
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

  if (!insuranceAssets || insuranceAssets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Insurance Policies
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Manage your insurance coverage and policies
            </p>
          </div>
        </div>
        <Card className="py-8 text-center">
          <CardContent>
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No insurance policies found
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Add your insurance policies to track coverage and ensure adequate protection
            </p>
            <Button asChild>
              <Link to="/assets/new?category=insurance">Add Insurance Policy</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: Column<Record<string, any>>[] = [
    {
      key: "name",
      header: "Policy",
      render: (_value: unknown, asset: Record<string, any>) => {
        const ins = asInsurance(asset);
        return (
          <div className="flex items-start space-x-3">
            <Shield className="mt-0.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="font-medium">{asset?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                {ins.policyNumber && `Policy #${ins.policyNumber}`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (_value: unknown, asset: Record<string, any>) => {
        const type = asInsurance(asset).policyType || "OTHER";
        const typeLabels: Record<string, string> = {
          LIFE: "Life",
          DISABILITY: "Disability",
          LONG_TERM_CARE: "Long-Term Care",
          HOMEOWNERS: "Homeowners",
          AUTO: "Auto",
          HEALTH: "Health",
          UMBRELLA: "Umbrella",
          MALPRACTICE: "Malpractice",
          BUSINESS: "Business",
          OTHER: "Other",
        };
        return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
      },
    },
    {
      key: "coverage",
      header: "Coverage",
      render: (_value: unknown, asset: Record<string, any>) => (
        <span className="font-medium">
          {formatCurrency(asset?.value || asInsurance(asset).coverageAmount || 0)}
        </span>
      ),
    },
    {
      key: "premium",
      header: "Annual Premium",
      render: (_value: unknown, asset: Record<string, any>) => {
        const premium = asInsurance(asset).premium;
        return (
          <span>
            {premium?.amount
              ? formatCurrency(premium.amount)
              : "-"}
          </span>
        );
      },
    },
    {
      key: "beneficiary",
      header: "Beneficiary",
      render: (_value: unknown, asset: Record<string, any>) => {
        const beneficiaries = asInsurance(asset).beneficiaries;
        const primaryName = beneficiaries?.primary?.[0]?.name;
        return (
          <span className="text-sm">{primaryName || "Not specified"}</span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (_value: unknown, asset: Record<string, any>) => {
        const expirationDate = asInsurance(asset).expirationDate;
        if (!expirationDate) {
          return <Badge variant="default">Active</Badge>;
        }
        const daysUntilExpiry = Math.floor(
          (new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysUntilExpiry < 0) {
          return <Badge variant="destructive">Expired</Badge>;
        } else if (daysUntilExpiry <= 30) {
          return <Badge variant="destructive">Expires Soon</Badge>;
        } else if (daysUntilExpiry <= 90) {
          return <Badge variant="secondary">Renewal Due</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Insurance Policies
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage your insurance coverage and policies
          </p>
        </div>
        <Button asChild>
          <Link to="/assets/new?category=insurance">
            <Plus className="mr-2 h-4 w-4" />
            Add Policy
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCoverage)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Across all policies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Premiums</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPremiums)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Total yearly cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insuranceAssets.length}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
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
              {Object.values(policyTypes).filter((policies) => policies.length > 0).length}
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Categories covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Policies Alert */}
      {expiringPolicies.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertCircle className="mr-2 h-5 w-5" />
              Policies Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringPolicies.map((policy) =>
                policy ? (
                  <div key={policy.id} className="flex items-center justify-between">
                    <span className="text-orange-700 dark:text-orange-300">{policy.name}</span>
                    <Badge variant="destructive">
                      Expires{" "}
                      {new Date(
                        policy.category === "INSURANCE_POLICY" && "expirationDate" in policy
                          ? policy.expirationDate || ""
                          : "",
                      ).toLocaleDateString()}
                    </Badge>
                  </div>
                ) : null,
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Policy Type Sections */}
      {policyTypes.life.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Life Insurance
            </CardTitle>
            <CardDescription>Policies that provide death benefits to beneficiaries</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={policyTypes.life.filter(Boolean) as Record<string, any>[]}
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
              <UserX className="mr-2 h-5 w-5" />
              Disability Insurance
            </CardTitle>
            <CardDescription>Income protection in case of disability</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={policyTypes.disability.filter(Boolean) as Record<string, any>[]} columns={columns} sortable={true} />
          </CardContent>
        </Card>
      )}

      {policyTypes.longTermCare.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Long-Term Care Insurance
            </CardTitle>
            <CardDescription>Coverage for extended care needs</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={policyTypes.longTermCare.filter(Boolean) as Record<string, any>[]} columns={columns} sortable={true} />
          </CardContent>
        </Card>
      )}

      {policyTypes.property.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Property & Casualty Insurance
            </CardTitle>
            <CardDescription>Home, auto, and other property coverage</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={policyTypes.property.filter(Boolean) as Record<string, any>[]} columns={columns} sortable={true} />
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
            <DataTable data={policyTypes.other.filter(Boolean) as Record<string, any>[]} columns={columns} sortable={true} />
          </CardContent>
        </Card>
      )}

      {/* All Policies Table (if no categorization) */}
      {insuranceAssets.length > 0 && Object.values(policyTypes).every((p) => p.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>All Insurance Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable data={insuranceAssets.filter(Boolean) as Record<string, any>[]} columns={columns} sortable={true} />
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
