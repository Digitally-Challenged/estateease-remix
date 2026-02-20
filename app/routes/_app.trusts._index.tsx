import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Users from "lucide-react/dist/esm/icons/users";
import Shield from "lucide-react/dist/esm/icons/shield";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit from "lucide-react/dist/esm/icons/edit";
import { getTrusts, getAssetsByTrust } from "~/lib/dal";
import { formatCurrency, formatDate } from "~/utils/format";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;

  // Get all trusts for the user
  const trusts = getTrusts(userId);

  // Get additional data for each trust
  const trustsWithDetails = trusts.map((trust) => {
    const assets = getAssetsByTrust(trust.id);

    return {
      ...trust,
      assets,
      totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    };
  });

  return json({ trusts: trustsWithDetails });
}

export default function TrustsOverview() {
  const { trusts } = useLoaderData<typeof loader>();

  const getTrustStatusColor = (trustType: string) => {
    if (trustType === "REVOCABLE")
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (trustType === "IRREVOCABLE")
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getTotalTrustValue = () => {
    return trusts.reduce((total, trust) => total + trust.totalValue, 0);
  };

  const getTotalTrustees = () => {
    return trusts.reduce((total, trust) => total + trust.trustees.length, 0);
  };

  const activeTrusts = trusts.filter((t) => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Trust Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive overview of all estate planning trusts and their management
          </p>
        </div>
        <div className="space-x-3">
          <Button asChild>
            <a href="/trusts/new" className="inline-flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Trust
            </a>
          </Button>
        </div>
      </div>

      {/* Trust Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Trust Assets
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(getTotalTrustValue())}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Across {trusts.length} trusts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Trusts
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {activeTrusts.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Out of {trusts.length} total trusts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Trustees
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {getTotalTrustees()}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Including successors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Corporate Trustees
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">1</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Arvest Trust Company</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Trust Cards */}
      <div className="space-y-6">
        {trusts.map((trust) => {
          return (
            <Card key={trust.id} className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">
                      {trust.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                      {trust.purpose || `${trust.type} trust for estate planning`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTrustStatusColor(trust.type.toUpperCase())}>
                      {trust.type}
                    </Badge>
                    {trust.isActive && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </Badge>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/trusts/${trust.id}/edit`} className="inline-flex items-center">
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Trust Details */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trust Information
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div>Grantor: {trust.grantor}</div>
                      <div>Created: {formatDate(trust.dateCreated)}</div>
                      <div>Tax ID: {trust.taxId}</div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        Total Value: {formatCurrency(trust.totalValue)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trustees
                    </h4>
                    <div className="space-y-2">
                      {trust.trustees.map((trustee) => (
                        <div
                          key={`${trust.id}-trustee-${trustee.name}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-900 dark:text-gray-100">{trustee.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {trustee.type}
                            {trustee.orderOfSuccession && ` (${trustee.orderOfSuccession})`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Beneficiaries
                    </h4>
                    <div className="space-y-2">
                      {trust.beneficiaries.map((beneficiary) => (
                        <div
                          key={`${trust.id}-beneficiary-${beneficiary.name}`}
                          className="text-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 dark:text-gray-100">
                              {beneficiary.name}
                            </span>
                            {beneficiary.percentage && (
                              <span className="text-gray-600 dark:text-gray-400">
                                {beneficiary.percentage}%
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {beneficiary.type}
                          </div>
                          {beneficiary.conditions && (
                            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                              {beneficiary.conditions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trust Assets */}
                {trust.assets.length > 0 && (
                  <div className="border-t pt-4 dark:border-gray-700">
                    <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trust Assets ({trust.assets.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {trust.assets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {asset.name}
                            </div>
                            <div className="text-xs capitalize text-gray-600 dark:text-gray-400">
                              {asset.category}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(asset.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trustee Powers */}
                <div className="border-t pt-4 dark:border-gray-700">
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trustee Powers & Responsibilities
                  </h4>
                  <div className="space-y-2">
                    {trust.trustees.map((trustee) => (
                      <div
                        key={`${trust.id}-trustee-powers-${trustee.name}`}
                        className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                      >
                        <div className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                          {trustee.name} ({trustee.type})
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {trustee.powers?.join(" • ") || "Standard trustee powers"}
                        </div>
                        {trustee.startDate && (
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Start Date: {formatDate(trustee.startDate)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Trust Administration Action Items
          </CardTitle>
          <CardDescription>Important tasks and reminders for trust management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <div className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Annual Trust Review Due
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Schedule annual review meeting with estate attorney (Due: March 2024)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Trust Tax Returns
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Kathleen Geeslin Trust - File annual tax return (Due: April 15, 2024)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Successor Trustee Documentation
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Ensure all successor trustees have current contact information and understand
                  their role
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
