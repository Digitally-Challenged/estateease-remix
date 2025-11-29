import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Users from "lucide-react/dist/esm/icons/users";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import { getTrusts, getTrustBeneficiaries, getAssets } from "~/lib/dal";
import { formatCurrency } from "~/utils/format";

export async function loader() {
  const userId = "user-nick-001"; // Default user for now

  const [trusts, assets] = await Promise.all([getTrusts(userId), getAssets(userId)]);

  // Get all beneficiaries from all trusts
  const beneficiaries = trusts.flatMap((trust) => getTrustBeneficiaries(trust.id));

  // Calculate total estate value
  const totalEstateValue = assets.reduce((sum: number, asset: any) => sum + (asset.value || 0), 0);

  // Group beneficiaries by trust
  const beneficiariesByTrust = trusts.map((trust: any) => ({
    trust,
    beneficiaries: getTrustBeneficiaries(trust.id),
  }));

  return json({
    trusts,
    beneficiaries,
    assets,
    totalEstateValue,
    beneficiariesByTrust,
  });
}

export default function DistributionPlans() {
  const { trusts, beneficiaries, totalEstateValue, beneficiariesByTrust } =
    useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Distribution Plans</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Manage how your assets will be distributed to beneficiaries
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstateValue)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Current market value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trusts</CardTitle>
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trusts.length}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Distribution vehicles
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
              Recipients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribution Timeline</CardTitle>
            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Staggered</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Age-based distributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution by Trust */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution by Trust</CardTitle>
          <CardDescription>
            How assets are allocated across your trusts and beneficiaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {beneficiariesByTrust.map(
              ({ trust, beneficiaries }: { trust: any; beneficiaries: any[] }) => (
                <div
                  key={trust.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {trust.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {trust.purpose}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      Created {new Date(trust.dateCreated).toLocaleDateString()}
                    </span>
                  </div>

                  {beneficiaries.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Beneficiaries:
                      </h4>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {beneficiaries.map((beneficiary: any, index: number) => (
                          <div
                            key={`beneficiary-${index}`}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {beneficiary.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                {beneficiary.relationship}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {beneficiary.percentage}%
                              </p>
                              {beneficiary.conditions && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                  {beneficiary.conditions}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      No beneficiaries assigned yet
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Important Distribution Rules
          </CardTitle>
          <CardDescription>Key provisions that affect asset distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Age-Based Distributions
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Children receive $300,000 at age 25, with full control at age 35
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Guardian Provisions
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Yvonne Westfall named as primary guardian for minor children
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">No Heirs Provision</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  If no surviving heirs, assets distributed to Hanzlik family members
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Trustee Succession</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Surviving spouse serves as trustee, followed by Arvest Bank
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Distribution Report
        </Button>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Review
        </Button>
      </div>
    </div>
  );
}
