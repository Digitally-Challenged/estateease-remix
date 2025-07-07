import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Building2, DollarSign, MapPin, TrendingUp, AlertCircle } from "lucide-react";
import { AssetCategory } from "~/types/enums";
import { getAssets } from "~/lib/dal";

export const loader = async () => {
  const userId = 'user-nick-001'; // Default user for MVP
  
  try {
    const assets = await getAssets(userId);
    
    // Filter for real estate assets
    const realEstateAssets = assets.filter(asset => asset.category === AssetCategory.REAL_ESTATE);
    
    return json({ realEstateAssets });
  } catch (error) {
    console.error('Error loading real estate data:', error);
    throw new Response("Failed to load real estate data", { status: 500 });
  }
};

export default function RealEstateAssets() {
  const { realEstateAssets } = useLoaderData<typeof loader>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOwnershipDescription = (asset: typeof realEstateAssets[0]) => {
    const ownershipType = asset.ownership.type;
    const ownershipDetails = asset.ownership || {};
    
    switch (ownershipType) {
      case 'TRUST':
        return {
          type: 'Trust Owned',
          details: `Trust ownership ${ownershipDetails.percentage ? `(${ownershipDetails.percentage}%)` : ''}`,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'JOINT':
        return {
          type: 'Joint Ownership',
          details: 'Joint ownership structure',
          color: 'bg-purple-100 text-purple-800'
        };
      case 'BUSINESS':
        return {
          type: 'Business Owned',
          details: 'Owned through business entity',
          color: 'bg-green-100 text-green-800'
        };
      default:
        return {
          type: 'Individual',
          details: 'Individual ownership',
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getTotalValue = () => realEstateAssets.reduce((sum, asset) => sum + asset.value, 0);
  const getTotalMortgageDebt = () => {
    return realEstateAssets.reduce((sum, asset) => {
      return sum + (asset.mortgageBalance || 0);
    }, 0);
  };
  const getNetEquity = () => getTotalValue() - getTotalMortgageDebt();
  const getMonthlyIncome = () => {
    return realEstateAssets.reduce((sum, asset) => {
      return sum + (asset.monthlyRent || 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Real Estate Portfolio</h1>
        <p className="text-gray-600">Comprehensive overview of all real estate holdings and their ownership structures</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Property Value</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalValue())}</div>
            <p className="text-xs text-gray-600">{realEstateAssets.length} properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Equity</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(getNetEquity())}</div>
            <p className="text-xs text-gray-600">After mortgage debt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Rental Income</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(getMonthlyIncome())}</div>
            <p className="text-xs text-gray-600">From income properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Mortgage Debt</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalMortgageDebt())}</div>
            <p className="text-xs text-gray-600">Outstanding balances</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Properties */}
      <div className="space-y-6">
        {realEstateAssets.map((asset) => {
          const ownership = getOwnershipDescription(asset);
          const hasRentalIncome = asset.monthlyRent && asset.monthlyRent > 0;
          const hasMortgage = asset.mortgageBalance && asset.mortgageBalance > 0;
          
          return (
            <Card key={asset.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{asset.name}</CardTitle>
                    {asset.address && (
                      <div className="flex items-center mt-2 text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{asset.address}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(asset.value)}</div>
                      {asset.propertyType && (
                        <div className="text-sm text-gray-600 capitalize">{asset.propertyType.replace('_', ' ')}</div>
                      )}
                    </div>
                    <Badge className={ownership.color}>
                      {ownership.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Ownership Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ownership Structure</h4>
                  <p className="text-sm text-gray-600">{ownership.details}</p>
                  {asset.notes && (
                    <p className="text-xs text-gray-500 mt-2">{asset.notes}</p>
                  )}
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Property Value</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Value:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(asset.value)}</span>
                      </div>
                      {asset.lastAppraisalValue && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Last Appraisal:</span>
                          <span className="text-gray-900">{formatCurrency(asset.lastAppraisalValue)}</span>
                        </div>
                      )}
                      {asset.lastAppraisalDate && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Appraisal Date:</span>
                          <span>{formatDate(asset.lastAppraisalDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Debt Information */}
                  {hasMortgage && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Mortgage Information</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Outstanding Balance:</span>
                          <span className="font-medium text-red-600">
                            {formatCurrency(asset.mortgageBalance || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Net Equity:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(asset.value - (asset.mortgageBalance || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Loan-to-Value:</span>
                          <span>
                            {((asset.mortgageBalance || 0) / asset.value * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Income Information */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Income & Expenses</h4>
                    <div className="space-y-1">
                      {hasRentalIncome ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Monthly Rent:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(asset.monthlyRent || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Annual Income:</span>
                            <span className="text-gray-900">
                              {formatCurrency((asset.monthlyRent || 0) * 12)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-600">Personal residence - No rental income</div>
                      )}
                      
                      {asset.annualPropertyTax && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Property Tax:</span>
                          <span className="text-red-600">
                            {formatCurrency(asset.annualPropertyTax)} annually
                          </span>
                        </div>
                      )}
                      {asset.annualInsurance && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Insurance:</span>
                          <span className="text-red-600">
                            {formatCurrency(asset.annualInsurance)} annually
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                {asset.notes && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{asset.notes}</p>
                  </div>
                )}

                {/* Action Items */}
                {asset.ownership.type === 'JOINT' && (
                  <div className="border-t pt-4 bg-yellow-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Action Required</h4>
                        <p className="text-xs text-yellow-700 mt-1">
                          Joint ownership property requires succession planning review and potential LLC formation for liability protection.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            Portfolio Analysis & Recommendations
          </CardTitle>
          <CardDescription>Strategic insights for real estate portfolio management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Estate Planning Considerations</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Trust Protection</p>
                    <p className="text-xs text-gray-600">Primary residence is properly protected in revocable trusts for probate avoidance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Joint Ownership Risk</p>
                    <p className="text-xs text-gray-600">Joint properties with brother may need LLC structure for liability protection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Income Diversification</p>
                    <p className="text-xs text-gray-600">Farmland provides excellent passive income stream with $5,000/month rental</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Financial Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Portfolio LTV Ratio</span>
                  <span className="font-medium text-gray-900">
                    {((getTotalMortgageDebt() / getTotalValue()) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Annual Rental Yield</span>
                  <span className="font-medium text-gray-900">
                    {((getMonthlyIncome() * 12 / getTotalValue()) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Equity Percentage</span>
                  <span className="font-medium text-green-600">
                    {((getNetEquity() / getTotalValue()) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}