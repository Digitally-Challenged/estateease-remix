import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Plus from "lucide-react/dist/esm/icons/plus";
import Home from "lucide-react/dist/esm/icons/home";
import Building from "lucide-react/dist/esm/icons/building";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import { getAssets } from "~/lib/dal";
import type { AnyEnhancedAsset } from "~/types/assets";
import { formatCurrency } from "~/utils/format";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;
  const allAssets = await getAssets(userId);

  // Filter for real estate assets only
  const realEstateAssets = allAssets.filter((asset) => asset.category === "REAL_ESTATE");

  return json({ realEstateAssets });
}

export default function RealEstateOverview() {
  const { realEstateAssets } = useLoaderData<typeof loader>();

  // Calculate portfolio metrics
  const totalValue = realEstateAssets.reduce((sum, asset) => sum + asset.value, 0);
  const averageValue = realEstateAssets.length > 0 ? totalValue / realEstateAssets.length : 0;

  // Group by property type if available
  const propertyTypes = realEstateAssets.reduce(
    (acc, asset) => {
      // Check if asset has propertyType field (for RealEstateAsset)
      const type = "propertyType" in asset && asset.propertyType ? asset.propertyType : "Other";
      if (!acc[type]) {
        acc[type] = { count: 0, value: 0 };
      }
      acc[type].count++;
      acc[type].value += asset.value;
      return acc;
    },
    {} as Record<string, { count: number; value: number }>,
  );

  const getPropertyIcon = (asset: AnyEnhancedAsset) => {
    // Check if asset has propertyType field (for RealEstateAsset)
    const propertyType = "propertyType" in asset ? asset.propertyType : undefined;
    if (propertyType === "SINGLE_FAMILY" || propertyType === "CONDO") return Home;
    if (propertyType === "COMMERCIAL") return Building;
    return Building2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Real Estate Portfolio
          </h1>
          <p className="text-gray-600">
            Manage and track your property investments
          </p>
        </div>
        <Button asChild>
          <Link to="/real-estate/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-gray-600">
              Across {realEstateAssets.length} properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Property Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(averageValue)}
            </div>
            <p className="text-xs text-gray-600">
              Per property
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Property Types
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {Object.keys(propertyTypes).length}
            </div>
            <p className="text-xs text-gray-600">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Type Breakdown */}
      {Object.keys(propertyTypes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio by Property Type</CardTitle>
            <CardDescription>Distribution of your real estate investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(propertyTypes).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{type}</p>
                    <p className="text-sm text-gray-600">
                      {data.count} {data.count === 1 ? "property" : "properties"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(data.value)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {((data.value / totalValue) * 100).toFixed(1)}% of portfolio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties List */}
      <Card>
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>All real estate assets in your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          {realEstateAssets.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-4 text-gray-600">
                No properties added yet
              </p>
              <Button asChild>
                <Link to="/real-estate/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Property
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {realEstateAssets.map((asset) => {
                const Icon = getPropertyIcon(asset);
                // Check if asset has address field (for RealEstateAsset)
                const address = "address" in asset ? asset.address : undefined;

                return (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-4">
                      <Icon className="mt-1 h-10 w-10 text-gray-600" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {asset.name}
                        </h3>
                        {address && (
                          <div className="mt-1 flex items-center text-sm text-gray-600">
                            <MapPin className="mr-1 h-3 w-3" />
                            <span>{address}</span>
                          </div>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>Ownership: {asset.ownership.type}</span>
                          {"propertyType" in asset && asset.propertyType && (
                            <span>Type: {asset.propertyType}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(asset.value)}
                      </p>
                      <div className="mt-2 flex space-x-2">
                        <Button variant="link" size="sm" asChild>
                          <Link to={`/real-estate/${asset.id}`}>View</Link>
                        </Button>
                        <Button variant="link" size="sm" asChild>
                          <Link to={`/assets/${asset.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Link */}
      <Card>
        <CardHeader>
          <CardTitle>Market Analytics</CardTitle>
          <CardDescription>Track property values and market trends</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild fullWidth>
            <Link to="/real-estate/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Market Analytics
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
