import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import Heart from "lucide-react/dist/esm/icons/heart";
import Plus from "lucide-react/dist/esm/icons/plus";
import FileHeart from "lucide-react/dist/esm/icons/file-heart";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Activity from "lucide-react/dist/esm/icons/activity";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import { getHealthcareDirectives, getFamilyMembers } from "~/lib/dal";

export async function loader() {
  try {
    const userId = "user-nick-001";

    const [healthcareDirectives, familyMembers] = await Promise.all([
      getHealthcareDirectives(userId),
      getFamilyMembers(userId),
    ]);

    // Group directives by type
    const directivesByType = healthcareDirectives.reduce<Record<string, typeof healthcareDirectives>>(
      (acc, directive) => {
        if (!directive) return acc;
        const type = directive.type;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(directive);
        return acc;
      },
      {} as Record<string, typeof healthcareDirectives>,
    );

    // Calculate completion status
    const hasLivingWill = directivesByType["living_will"]?.length > 0;
    const hasHealthcareProxy = directivesByType["healthcare_proxy"]?.length > 0;
    const hasDNR = directivesByType["dnr"]?.length > 0;
    const hasOrganDonation = directivesByType["organ_donation"]?.length > 0;

    const completionItems = [
      { name: "Living Will", completed: hasLivingWill },
      { name: "Healthcare Proxy", completed: hasHealthcareProxy },
      { name: "DNR Orders", completed: hasDNR },
      { name: "Organ Donation", completed: hasOrganDonation },
    ];

    const completedCount = completionItems.filter((item) => item.completed).length;

    return json({
      healthcareDirectives,
      familyMembers,
      directivesByType,
      completionItems,
      completedCount,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load healthcare directives:", error);
    return json(
      {
        healthcareDirectives: [],
        familyMembers: [],
        directivesByType: {},
        completionItems: [],
        completedCount: 0,
        error: error instanceof Error ? error.message : "Failed to load healthcare directives",
      },
      { status: 500 },
    );
  }
}

function HealthcareDirectivesContent() {
  const { familyMembers, directivesByType, completionItems, completedCount, error } =
    useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Healthcare Directives
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage your medical wishes and healthcare decisions
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

  const getDecisionBadge = (decision?: string) => {
    if (!decision) return null;

    switch (decision) {
      case "continue":
        return (
          <Badge variant="default" className="bg-green-600">
            Continue
          </Badge>
        );
      case "discontinue":
        return <Badge variant="destructive">Discontinue</Badge>;
      case "depends":
        return <Badge variant="secondary">Case by Case</Badge>;
      default:
        return <Badge variant="outline">{decision}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Healthcare Directives
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage your medical wishes and healthcare decisions
          </p>
        </div>
        <Button asChild>
          <Link to="/healthcare-directives/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Directive
          </Link>
        </Button>
      </div>

      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle>Healthcare Planning Progress</CardTitle>
          <CardDescription>
            {completedCount} of 4 essential healthcare documents completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {completionItems.map((item) =>
              item ? (
                <div
                  key={item.name}
                  className={`flex items-center space-x-3 rounded-lg border p-3 ${
                    item.completed
                      ? "border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <span
                    className={
                      item.completed
                        ? "font-medium"
                        : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
                    }
                  >
                    {item.name}
                  </span>
                </div>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>

      {/* Living Will Details */}
      {directivesByType["living_will"] && directivesByType["living_will"].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileHeart className="mr-2 h-5 w-5" />
              Living Will
            </CardTitle>
            <CardDescription>Your wishes for end-of-life medical care</CardDescription>
          </CardHeader>
          <CardContent>
            {directivesByType["living_will"].map((directive) =>
              directive ? (
                <div key={directive.id} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Life Sustaining Treatment
                      </p>
                      {getDecisionBadge(directive.decisions?.lifeSustaining)}
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Artificial Nutrition
                      </p>
                      {getDecisionBadge(directive.decisions?.artificialNutrition)}
                    </div>
                  </div>

                  {directive.decisions?.painManagement && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Pain Management Instructions
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {directive.decisions.painManagement}
                      </p>
                    </div>
                  )}

                  {directive.religiousPreferences && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Religious Preferences
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {directive.religiousPreferences}
                      </p>
                    </div>
                  )}

                  {directive.additionalInstructions && (
                    <div>
                      <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Additional Instructions
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {directive.additionalInstructions}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      Last updated: {new Date(directive.lastUpdated).toLocaleDateString()}
                    </p>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/healthcare-directives/${directive.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ) : null,
            )}
          </CardContent>
        </Card>
      )}

      {/* Healthcare Proxy */}
      {directivesByType["healthcare_proxy"] && directivesByType["healthcare_proxy"].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Healthcare Proxy
            </CardTitle>
            <CardDescription>Designated decision makers for medical care</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {directivesByType["healthcare_proxy"].map((directive) =>
                directive ? (
                  <div
                    key={directive.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{directive.personName || "Not specified"}</p>
                      <Badge
                        variant={directive.isPrimary ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {directive.isPrimary ? "Primary" : "Alternate"}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/healthcare-directives/${directive.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                ) : null,
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Directives */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* DNR Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Do Not Resuscitate (DNR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {directivesByType["dnr"] && directivesByType["dnr"].length > 0 ? (
              <div className="space-y-2">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
                <p className="text-center font-medium text-green-600 dark:text-green-400">
                  DNR Order Active
                </p>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Last updated:{" "}
                  {new Date(directivesByType["dnr"][0]?.lastUpdated || "").toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  No DNR order on file
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/healthcare-directives/new?type=dnr">Create DNR Order</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organ Donation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Organ Donation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {directivesByType["organ_donation"] && directivesByType["organ_donation"].length > 0 ? (
              <div className="space-y-2">
                {directivesByType["organ_donation"][0]?.decisions?.organDonation ? (
                  <>
                    <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
                    <p className="text-center font-medium text-green-600 dark:text-green-400">
                      Registered Organ Donor
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="text-center font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Not an Organ Donor
                    </p>
                  </>
                )}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Last updated:{" "}
                  {new Date(
                    directivesByType["organ_donation"][0]?.lastUpdated || "",
                  ).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  No organ donation preference recorded
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/healthcare-directives/new?type=organ_donation">Set Preference</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Available Healthcare Proxies */}
      {familyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Potential Healthcare Proxies</CardTitle>
            <CardDescription>
              Family members who could serve as healthcare decision makers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {familyMembers.map((member) =>
                member ? (
                  <div key={member.id} className="rounded-lg border p-3">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {member.relationship}
                    </p>
                    {member.healthcareRoles &&
                      member.healthcareRoles.some((role) => role.type === "healthcare_proxy") && (
                        <Badge variant="default" className="mt-2">
                          Current Proxy
                        </Badge>
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

export default function HealthcareDirectives() {
  return (
    <ErrorBoundary level="page">
      <HealthcareDirectivesContent />
    </ErrorBoundary>
  );
}
