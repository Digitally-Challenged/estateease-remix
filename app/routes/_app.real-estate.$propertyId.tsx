import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Building2 from "lucide-react/dist/esm/icons/building-2";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import User from "lucide-react/dist/esm/icons/user";
import FileText from "lucide-react/dist/esm/icons/file-text";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Edit from "lucide-react/dist/esm/icons/edit";
import { getAssets } from "~/lib/dal";
import { formatCurrency } from "~/utils/format";

export async function loader({ params }: LoaderFunctionArgs) {
  const { propertyId } = params;
  if (!propertyId) {
    throw new Response("Property ID is required", { status: 400 });
  }

  const userId = "user-nick-001"; // Default user for now
  const allAssets = await getAssets(userId);

  // Find the specific property
  const property = allAssets.find(
    (asset) => asset.id === propertyId && asset.category === "REAL_ESTATE",
  );

  if (!property) {
    throw new Response("Property not found", { status: 404 });
  }

  return json({ property });
}

export default function PropertyDetail() {
  const { property } = useLoaderData<typeof loader>();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Type guards for real estate specific fields
  const hasAddress = "address" in property;
  const hasPropertyType = "propertyType" in property;
  const hasPurchaseInfo = "purchaseDate" in property && "purchasePrice" in property;
  const hasPropertyDetails = "squareFeet" in property || "yearBuilt" in property;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/real-estate">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
        <Button asChild>
          <Link to={`/assets/${property.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Property
          </Link>
        </Button>
      </div>

      {/* Property Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{property.name}</h1>
        {hasAddress && property.address && (
          <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400 dark:text-gray-500">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{property.address || "Address not available"}</span>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Current Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(property.value)}
            </div>
            {hasPurchaseInfo && "purchasePrice" in property && property.purchasePrice && (
              <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                {property.purchasePrice > 0 && (
                  <>
                    {(
                      ((property.value - property.purchasePrice) / property.purchasePrice) *
                      100
                    ).toFixed(1)}
                    %{property.value >= property.purchasePrice ? " gain" : " loss"}
                  </>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Ownership
            </CardTitle>
            <User className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {property.ownership.type}
            </div>
            {property.ownership.percentage && (
              <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                {property.ownership.percentage}% ownership
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Property Type
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {hasPropertyType && property.propertyType ? property.propertyType : "Real Estate"}
            </div>
            {hasPropertyDetails && (
              <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
                {"squareFeet" in property && property.squareFeet ? (
                  <>{property.squareFeet.toLocaleString()} sq ft</>
                ) : null}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Key details about this property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPropertyType && property.propertyType && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Type</span>
                <span className="font-medium">{property.propertyType}</span>
              </div>
            )}

            {hasPropertyDetails && (
              <>
                {"squareFeet" in property && property.squareFeet && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Square Feet
                    </span>
                    <span className="font-medium">{property.squareFeet.toLocaleString()}</span>
                  </div>
                )}

                {"yearBuilt" in property && property.yearBuilt ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Year Built
                    </span>
                    <span className="font-medium">{String(property.yearBuilt)}</span>
                  </div>
                ) : null}

                {"bedrooms" in property && property.bedrooms !== undefined ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Bedrooms
                    </span>
                    <span className="font-medium">{String(property.bedrooms)}</span>
                  </div>
                ) : null}

                {"bathrooms" in property && property.bathrooms !== undefined ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Bathrooms
                    </span>
                    <span className="font-medium">{String(property.bathrooms)}</span>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase & Financials</CardTitle>
            <CardDescription>Investment and financial details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasPurchaseInfo && (
              <>
                {"purchaseDate" in property && property.purchaseDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Purchase Date
                    </span>
                    <span className="font-medium">{formatDate(property.purchaseDate)}</span>
                  </div>
                )}

                {"purchasePrice" in property && property.purchasePrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Purchase Price
                    </span>
                    <span className="font-medium">{formatCurrency(property.purchasePrice)}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Current Value
              </span>
              <span className="font-medium">{formatCurrency(property.value)}</span>
            </div>

            {hasPurchaseInfo &&
              "purchasePrice" in property &&
              property.purchasePrice &&
              property.purchasePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Appreciation
                  </span>
                  <span
                    className={`font-medium ${property.value >= property.purchasePrice ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {formatCurrency(property.value - property.purchasePrice)}(
                    {(
                      ((property.value - property.purchasePrice) / property.purchasePrice) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Ownership Details */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership Structure</CardTitle>
          <CardDescription>Details about how this property is owned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Ownership Type
              </span>
              <Badge variant="secondary">{property.ownership.type}</Badge>
            </div>

            {property.ownership.percentage && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Ownership Percentage
                </span>
                <span className="font-medium">{property.ownership.percentage}%</span>
              </div>
            )}

            {property.ownership.trustId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Trust ID
                </span>
                <span className="font-medium">{property.ownership.trustId}</span>
              </div>
            )}

            {property.ownership.businessEntityId && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Business Entity
                </span>
                <span className="font-medium">{property.ownership.businessEntityId}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {property.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional information about this property</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{property.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Documents Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Related Documents</CardTitle>
          <CardDescription>Important documents for this property</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
              No documents uploaded yet
            </p>
            <Button variant="outline">Upload Document</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
