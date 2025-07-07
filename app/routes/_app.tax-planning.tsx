import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  Calculator,
  TrendingUp,
  Shield,
  AlertTriangle,
  DollarSign,
  FileText,
  ChevronRight
} from "lucide-react";
import { getAssets, getTrusts } from "~/lib/dal";
import { FEDERAL_ESTATE_TAX_EXEMPTION, FEDERAL_ESTATE_TAX_RATE, GIFT_TAX_ANNUAL_EXCLUSION } from "~/data/financial-constants";
import { formatCurrency } from "~/utils/format";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    
    const [assets, trusts] = await Promise.all([
      getAssets(userId),
      getTrusts(userId)
    ]);

    // Calculate total estate value
    const totalEstateValue = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
    
    // Calculate estate tax (simplified)
    const exemptionAmount = FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL;
    const taxableEstate = Math.max(0, totalEstateValue - exemptionAmount);
    const estateTax = taxableEstate * FEDERAL_ESTATE_TAX_RATE;
    
    // Calculate potential strategies savings
    const giftingPotential = Math.min(
      GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT * 5 * 10, // 5 recipients, 10 years
      totalEstateValue * 0.2
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
      error: null 
    });
  } catch (error) {
    console.error('Failed to load tax planning data:', error);
    return json({ 
      assets: [],
      trusts: [],
      totalEstateValue: 0,
      exemptionAmount: FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL,
      taxableEstate: 0,
      estateTax: 0,
      giftingPotential: 0,
      charitableDeductionPotential: 0,
      error: error instanceof Error ? error.message : 'Failed to load data' 
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
    error 
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tax Planning</h1>
          <p className="text-gray-600 mt-2">Estate tax analysis and planning strategies</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
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
      icon: <DollarSign className="h-5 w-5 text-green-600" />
    },
    {
      name: "Charitable Giving",
      description: "Reduce estate size through charitable donations and get income tax deductions",
      potentialSavings: charitableDeductionPotential * FEDERAL_ESTATE_TAX_RATE,
      impact: "Medium",
      icon: <Shield className="h-5 w-5 text-blue-600" />
    },
    {
      name: "Irrevocable Life Insurance Trust",
      description: "Remove life insurance proceeds from taxable estate",
      potentialSavings: 0, // Would need insurance data
      impact: "High",
      icon: <FileText className="h-5 w-5 text-purple-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tax Planning</h1>
        <p className="text-gray-600 mt-2">Minimize estate taxes and maximize wealth transfer</p>
      </div>

      {/* Estate Tax Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstateValue)}</div>
            <p className="text-xs text-gray-600 mt-1">Current market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Federal Exemption</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(exemptionAmount)}</div>
            <p className="text-xs text-gray-600 mt-1">2024 exemption amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxable Estate</CardTitle>
            <Calculator className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxableEstate)}</div>
            <p className="text-xs text-gray-600 mt-1">Subject to estate tax</p>
          </CardContent>
        </Card>

        <Card className={estateTax > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Tax</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${estateTax > 0 ? "text-orange-600" : "text-gray-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estateTax > 0 ? "text-orange-700" : ""}`}>
              {formatCurrency(estateTax)}
            </div>
            <p className="text-xs text-gray-600 mt-1">At {(FEDERAL_ESTATE_TAX_RATE * 100).toFixed(0)}% rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Alert */}
      {estateTax > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Estate Tax Liability Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Your estate exceeds the federal exemption amount by {formatCurrency(taxableEstate)}, 
              resulting in an estimated tax liability of {formatCurrency(estateTax)}.
            </p>
            <p className="text-sm text-orange-600">
              Consider implementing tax reduction strategies to minimize this liability.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tax Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Reduction Strategies</CardTitle>
          <CardDescription>
            Recommended strategies to minimize estate taxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{strategy.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium flex items-center">
                        {strategy.name}
                        <Badge 
                          variant={strategy.impact === "High" ? "default" : "secondary"} 
                          className="ml-2"
                        >
                          {strategy.impact} Impact
                        </Badge>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                      {strategy.potentialSavings > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          Potential tax savings: {formatCurrency(strategy.potentialSavings)}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
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
            <CardDescription>
              Trusts can provide significant tax benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trusts.map((trust) => trust && (
                <div key={trust.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{trust.name}</p>
                    <p className="text-sm text-gray-600">{trust.type}</p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* State Tax Notice */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">State Estate Taxes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            Some states impose their own estate or inheritance taxes with lower exemption thresholds. 
            Consult with a tax professional about your specific state{`'`}s requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 