import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import Users from "lucide-react/dist/esm/icons/users";
import Plus from "lucide-react/dist/esm/icons/plus";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import UserPlus from "lucide-react/dist/esm/icons/user-plus";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Edit from "lucide-react/dist/esm/icons/edit";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import { getBeneficiaries, getTrusts } from "~/lib/dal";
import type { Column } from "~/components/ui/data-table";
import { requireUser } from "~/lib/auth.server";
import type { Beneficiary } from "~/lib/dal";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const beneficiaries = getBeneficiaries(userId);
    const trusts = getTrusts(userId);

    // Calculate total percentages
    const primaryTotal = beneficiaries
      .filter((b: Beneficiary) => b?.type?.toLowerCase() === "primary")
      .reduce<number>((sum: number, b: Beneficiary) => sum + (b?.percentage || 0), 0);

    const contingentTotal = beneficiaries
      .filter((b: Beneficiary) => b?.type?.toLowerCase() === "contingent")
      .reduce<number>((sum: number, b: Beneficiary) => sum + (b?.percentage || 0), 0);

    return json({
      beneficiaries,
      trusts,
      primaryTotal,
      contingentTotal,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load beneficiaries:", error);
    return json(
      {
        beneficiaries: [],
        trusts: [],
        primaryTotal: 0,
        contingentTotal: 0,
        error: error instanceof Error ? error.message : "Failed to load beneficiaries",
      },
      { status: 500 },
    );
  }
}

function BeneficiariesContent() {
  const data = useLoaderData<typeof loader>();
  const beneficiaries = (data.beneficiaries || []) as unknown as Beneficiary[];
  const trusts = (data.trusts || []) as unknown as import("~/lib/dal").Trust[];
  const primaryTotal = data.primaryTotal ?? 0;
  const contingentTotal = data.contingentTotal ?? 0;
  const error = data.error;
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Beneficiary Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage primary and contingent beneficiaries
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

  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Beneficiary Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage primary and contingent beneficiaries
            </p>
          </div>
        </div>
        <Card className="py-8 text-center">
          <CardContent>
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No beneficiaries assigned
            </h3>
            <p className="mb-4 text-gray-600">
              Add beneficiaries to ensure your estate is distributed according to your wishes
            </p>
            <Button onClick={() => navigate("/beneficiaries/new")}>Add First Beneficiary</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const columns: Column<Beneficiary>[] = [
    {
      key: "fullName",
      header: "Name",
      render: (_value: unknown, beneficiary: Beneficiary) => (
        <div>
          <p className="font-medium">{beneficiary?.fullName}</p>
          <p className="text-sm text-gray-600">
            {beneficiary?.relationship}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (_value: unknown, beneficiary: Beneficiary) => (
        <Badge variant={beneficiary?.type?.toLowerCase() === "primary" ? "default" : "secondary"}>
          {beneficiary?.type?.toLowerCase() === "primary" ? "Primary" : "Contingent"}
        </Badge>
      ),
    },
    {
      key: "percentage",
      header: "Percentage",
      render: (_value: unknown, beneficiary: Beneficiary) => <span className="font-medium">{beneficiary?.percentage || 0}%</span>,
    },
    {
      key: "contact",
      header: "Contact",
      render: (_value: unknown, beneficiary: Beneficiary) => (
        <div className="text-sm">
          {beneficiary?.contactInfo?.email && <p>{beneficiary.contactInfo.email}</p>}
          {beneficiary?.contactInfo?.primaryPhone && <p>{beneficiary.contactInfo.primaryPhone}</p>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, beneficiary: Beneficiary) => (
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
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const primaryBeneficiaries = beneficiaries.filter((b: Beneficiary) => b?.type?.toLowerCase() === "primary");
  const contingentBeneficiaries = beneficiaries.filter((b: Beneficiary) => b?.type?.toLowerCase() === "contingent");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Beneficiary Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage primary and contingent beneficiaries
          </p>
        </div>
        <Button asChild>
          <Link to="/beneficiaries/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Beneficiary
          </Link>
        </Button>
      </div>

      {/* Allocation Status */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Beneficiaries</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{primaryBeneficiaries.length}</div>
            <div className="mt-2">
              {primaryTotal === 100 ? (
                <p className="text-sm text-green-600">✓ 100% allocated</p>
              ) : (
                <p className="text-sm text-orange-600">
                  {primaryTotal}% allocated ({100 - primaryTotal}% remaining)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contingent Beneficiaries</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contingentBeneficiaries.length}</div>
            <div className="mt-2">
              {contingentTotal === 100 ? (
                <p className="text-sm text-green-600">✓ 100% allocated</p>
              ) : contingentBeneficiaries.length > 0 ? (
                <p className="text-sm text-orange-600">
                  {contingentTotal}% allocated
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  None assigned
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {primaryTotal !== 100 && primaryBeneficiaries.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Primary Beneficiary Allocation Warning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              Your primary beneficiary allocation totals {primaryTotal}%. For proper estate
              distribution, this should equal 100%.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/beneficiaries/new")}
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
              data={primaryBeneficiaries as unknown as Record<string, unknown>[]}
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
              data={contingentBeneficiaries as unknown as Record<string, unknown>[]}
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
            <CardDescription>View beneficiaries assigned to specific trusts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trusts.map((trust, index) =>
                trust ? (
                  <div key={trust.id || `trust-${index}`} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-medium">{trust.name}</h3>
                      <Badge variant="outline">{trust.type}</Badge>
                    </div>
                    {trust.beneficiaries && trust.beneficiaries.length > 0 ? (
                      <div className="space-y-2">
                        {trust.beneficiaries.map((beneficiary: Beneficiary, index: number) =>
                          beneficiary ? (
                            <div
                              key={`beneficiary-${index}`}
                              className="flex items-center justify-between text-sm"
                            >
                              <span>{beneficiary.fullName}</span>
                              <span className="text-gray-600">
                                {beneficiary.percentage || 0}%
                              </span>
                            </div>
                          ) : null,
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No beneficiaries assigned to this trust
                      </p>
                    )}
                  </div>
                ) : null,
              )}
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
