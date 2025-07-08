import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Clock
} from "lucide-react";
import { getTrusts, getBeneficiaries, getAssets } from "~/lib/dal";
import { formatCurrency } from "~/utils/format";

export async function loader() {
  const userId = 'user-nick-001'; // Default user for now
  
  const [trusts, beneficiaries, assets] = await Promise.all([
    getTrusts(userId),
    getBeneficiaries(userId),
    getAssets(userId)
  ]);
  
  // Calculate total estate value
  const totalEstateValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  
  // Group beneficiaries by trust
  const beneficiariesByTrust = trusts.map(trust => ({
    trust,
    beneficiaries: trust.beneficiaries || []
  }));
  
  return json({
    trusts,
    beneficiaries,
    assets,
    totalEstateValue,
    beneficiariesByTrust
  });
}

export default function DistributionPlans() {
  const { trusts, beneficiaries, totalEstateValue, beneficiariesByTrust } = useLoaderData<typeof loader>();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Distribution Plans</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage how your assets will be distributed to beneficiaries</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstateValue)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Current market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trusts</CardTitle>
            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trusts.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Distribution vehicles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaries.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Recipients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribution Timeline</CardTitle>
            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Staggered</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">Age-based distributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution by Trust */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution by Trust</CardTitle>
          <CardDescription>How assets are allocated across your trusts and beneficiaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {beneficiariesByTrust.map(({ trust, beneficiaries }) => (
              <div key={trust.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{trust.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{trust.purpose}</p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Created {new Date(trust.dateCreated).toLocaleDateString()}</span>
                </div>
                
                {beneficiaries.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Beneficiaries:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {beneficiaries.map((beneficiary, index) => (
                        <div key={`beneficiary-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{beneficiary.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{beneficiary.relationship}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{beneficiary.percentage}%</p>
                            {beneficiary.conditions && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">{beneficiary.conditions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 italic">No beneficiaries assigned yet</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            Important Distribution Rules
          </CardTitle>
          <CardDescription>Key provisions that affect asset distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Age-Based Distributions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Children receive $300,000 at age 25, with full control at age 35</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Guardian Provisions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Yvonne Westfall named as primary guardian for minor children</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">No Heirs Provision</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">If no surviving heirs, assets distributed to Hanzlik family members</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Trustee Succession</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Surviving spouse serves as trustee, followed by Arvest Bank</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Distribution Report
        </Button>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Review
        </Button>
      </div>
    </div>
  );
} 