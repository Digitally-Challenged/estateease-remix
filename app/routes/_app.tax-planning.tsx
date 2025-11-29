import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import Calculator from "lucide-react/dist/esm/icons/calculator";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Shield from "lucide-react/dist/esm/icons/shield";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import { getAssets, getTrusts } from "~/lib/dal";
import {
  FEDERAL_ESTATE_TAX_EXEMPTION,
  FEDERAL_ESTATE_TAX_RATE,
  GIFT_TAX_ANNUAL_EXCLUSION,
} from "~/data/financial-constants";
import { formatCurrency } from "~/utils/format";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const [assets, trusts] = await Promise.all([getAssets(userId), getTrusts(userId)]);

    // Calculate total estate value
    const totalEstateValue = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);

    // Calculate estate tax (simplified)
    const exemptionAmount = FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL;
    const taxableEstate = Math.max(0, totalEstateValue - exemptionAmount);
    const estateTax = taxableEstate * FEDERAL_ESTATE_TAX_RATE;

    // Calculate potential strategies savings
    const giftingPotential = Math.min(
      GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT * 5 * 10, // 5 recipients, 10 years
      totalEstateValue * 0.2,
    );

    const charitableDeductionPotential = totalEstateValue * 0.1;

    return json({
      assets,
      trusts,
      totalEstateValue,
      exemptionAmount,
      taxableEstate,
      estateTax,
      giftingPotential,
      charitableDeductionPotential,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load tax planning data:", error);
    return json({
      assets: [],
      trusts: [],
      totalEstateValue: 0,
      exemptionAmount: FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL,
      taxableEstate: 0,
      estateTax: 0,
      giftingPotential: 0,
      charitableDeductionPotential: 0,
      error: error instanceof Error ? error.message : "Failed to load data",
    });
  }
}

export default function TaxPlanning() {
  const {
    totalEstateValue,
    exemptionAmount,
    taxableEstate,
    estateTax,
    giftingPotential,
    charitableDeductionPotential,
    trusts,
    error,
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tax Planning</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Estate tax analysis and planning strategies
          </p>
        </div>
        <Card className="border-red-200 bg-red-50 dark:border-red-700 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const strategies = [
    {
      name: "Annual Gift Exclusion",
      description: `Gift up to ${formatCurrency(GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT)} per person per year tax-free`,
      potentialSavings: giftingPotential * FEDERAL_ESTATE_TAX_RATE,
      impact: "High",
      icon: <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />,
    },
    {
      name: "Charitable Giving",
      description: "Reduce estate size through charitable donations and get income tax deductions",
      potentialSavings: charitableDeductionPotential * FEDERAL_ESTATE_TAX_RATE,
      impact: "Medium",
      icon: <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      name: "Irrevocable Life Insurance Trust",
      description: "Remove life insurance proceeds from taxable estate",
      potentialSavings: 0, // Would need insurance data
      impact: "High",
      icon: <FileText className="h-5 w-5 text-purple-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tax Planning</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Minimize estate taxes and maximize wealth transfer
        </p>
      </div>

      {/* Estate Tax Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
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
            <CardTitle className="text-sm font-medium">Federal Exemption</CardTitle>
            <Shield className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(exemptionAmount)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              2024 exemption amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Estate</CardTitle>
            <Calculator className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxableEstate)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Subject to estate tax
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            estateTax > 0
              ? "border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${estateTax > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-600 dark:text-gray-400 dark:text-gray-500"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${estateTax > 0 ? "text-orange-700 dark:text-orange-300" : ""}`}
            >
              {formatCurrency(estateTax)}
            </div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              At {(FEDERAL_ESTATE_TAX_RATE * 100).toFixed(0)}% rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Alert */}
      {estateTax > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Estate Tax Liability Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-orange-700 dark:text-orange-300">
              Your estate exceeds the federal exemption amount by {formatCurrency(taxableEstate)},
              resulting in an estimated tax liability of {formatCurrency(estateTax)}.
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              Consider implementing tax reduction strategies to minimize this liability.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tax Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Reduction Strategies</CardTitle>
          <CardDescription>Recommended strategies to minimize estate taxes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy, index) => (
              <div
                key={index}
                className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{strategy.icon}</div>
                    <div className="flex-1">
                      <h3 className="flex items-center font-medium">
                        {strategy.name}
                        <Badge
                          variant={strategy.impact === "High" ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {strategy.impact} Impact
                        </Badge>
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {strategy.description}
                      </p>
                      {strategy.potentialSavings > 0 && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                          Potential tax savings: {formatCurrency(strategy.potentialSavings)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trust Benefits */}
      {trusts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Trusts</CardTitle>
            <CardDescription>Trusts can provide significant tax benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trusts.map(
                (trust) =>
                  trust && (
                    <div
                      key={trust.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{trust.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                          {trust.type}
                        </p>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* State Tax Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-blue-900">State Estate Taxes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 dark:text-blue-200">
            Some states impose their own estate or inheritance taxes with lower exemption
            thresholds. Consult with a tax professional about your specific state{`'`}s
            requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
