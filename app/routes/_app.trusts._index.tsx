import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Users, Shield, DollarSign, AlertCircle, CheckCircle, Plus, Edit } from "lucide-react";
import { getTrusts, getAssetsByTrust } from "~/lib/dal";

export async function loader() {
  const userId = 'user-nick-001'; // Default user for now
  
  // Get all trusts for the user
  const trusts = await getTrusts(userId);
  
  // Get additional data for each trust
  const trustsWithDetails = await Promise.all(
    trusts.map(async (trust) => {
      const assets = await getAssetsByTrust(trust.id);
      
      return {
        ...trust,
        assets,
        totalValue: assets.reduce((sum, asset) => sum + asset.value, 0)
      };
    })
  );
  
  return json({ trusts: trustsWithDetails });
}

export default function TrustsOverview() {
  const { trusts } = useLoaderData<typeof loader>();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTrustStatusColor = (trustType: string) => {
    if (trustType === 'REVOCABLE') return 'bg-green-100 text-green-800';
    if (trustType === 'IRREVOCABLE') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTotalTrustValue = () => {
    return trusts.reduce((total, trust) => total + trust.totalValue, 0);
  };

  const getTotalTrustees = () => {
    return trusts.reduce((total, trust) => total + trust.trustees.length, 0);
  };

  const activeTrusts = trusts.filter(t => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trust Management</h1>
          <p className="text-gray-600">Comprehensive overview of all estate planning trusts and their management</p>
        </div>
        <div className="space-x-3">
          <Button asChild>
            <a href="/trusts/new" className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Trust
            </a>
          </Button>
        </div>
      </div>

      {/* Trust Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Trust Assets</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalTrustValue())}</div>
            <p className="text-xs text-gray-600">Across {trusts.length} trusts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Trusts</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {activeTrusts.length}
            </div>
            <p className="text-xs text-gray-600">Out of {trusts.length} total trusts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Trustees</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {getTotalTrustees()}
            </div>
            <p className="text-xs text-gray-600">Including successors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Corporate Trustees</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1</div>
            <p className="text-xs text-gray-600">Arvest Trust Company</p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Trust Cards */}
      <div className="space-y-6">
        {trusts.map((trust) => {
          return (
            <Card key={trust.id} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">{trust.name}</CardTitle>
                    <CardDescription className="mt-2 text-gray-600">
                      {trust.purpose || `${trust.type} trust for estate planning`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTrustStatusColor(trust.type.toUpperCase())}>
                      {trust.type}
                    </Badge>
                    {trust.isActive && (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/trusts/${trust.id}/edit`} className="inline-flex items-center">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Trust Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Trust Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Grantor: {trust.grantor}</div>
                      <div>Created: {formatDate(trust.dateCreated)}</div>
                      <div>Tax ID: {trust.taxId}</div>
                      <div className="font-medium text-gray-900">
                        Total Value: {formatCurrency(trust.totalValue)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Trustees</h4>
                    <div className="space-y-2">
                      {trust.trustees.map((trustee) => (
                        <div key={`${trust.id}-trustee-${trustee.name}`} className="flex items-center justify-between text-sm">
                          <span className="text-gray-900">{trustee.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {trustee.type}
                            {trustee.orderOfSuccession && ` (${trustee.orderOfSuccession})`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Beneficiaries</h4>
                    <div className="space-y-2">
                      {trust.beneficiaries.map((beneficiary) => (
                        <div key={`${trust.id}-beneficiary-${beneficiary.name}`} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{beneficiary.name}</span>
                            {beneficiary.percentage && (
                              <span className="text-gray-600">{beneficiary.percentage}%</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{beneficiary.type}</div>
                          {beneficiary.conditions && (
                            <div className="text-xs text-blue-600 mt-1">{beneficiary.conditions}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trust Assets */}
                {trust.assets.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Trust Assets ({trust.assets.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {trust.assets.map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-xs text-gray-600 capitalize">
                              {asset.category}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(asset.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trustee Powers */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Trustee Powers & Responsibilities</h4>
                  <div className="space-y-2">
                    {trust.trustees.map((trustee) => (
                      <div key={`${trust.id}-trustee-powers-${trustee.name}`} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {trustee.name} ({trustee.type})
                        </div>
                        <div className="text-xs text-gray-600">
                          {trustee.powers?.join(' • ') || 'Standard trustee powers'}
                        </div>
                        {trustee.startDate && (
                          <div className="text-xs text-gray-500 mt-1">
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
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            Trust Administration Action Items
          </CardTitle>
          <CardDescription>Important tasks and reminders for trust management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Annual Trust Review Due</div>
                <div className="text-xs text-gray-600">Schedule annual review meeting with estate attorney (Due: March 2024)</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Trust Tax Returns</div>
                <div className="text-xs text-gray-600">Kathleen Geeslin Trust - File annual tax return (Due: April 15, 2024)</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Successor Trustee Documentation</div>
                <div className="text-xs text-gray-600">Ensure all successor trustees have current contact information and understand their role</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}