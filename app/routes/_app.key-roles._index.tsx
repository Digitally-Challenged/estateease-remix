import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import Shield from "lucide-react/dist/esm/icons/shield";
import Plus from "lucide-react/dist/esm/icons/plus";
import UserCog from "lucide-react/dist/esm/icons/user-cog";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import Heart from "lucide-react/dist/esm/icons/heart";
import Users from "lucide-react/dist/esm/icons/users";
import FileText from "lucide-react/dist/esm/icons/file-text";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { getLegalRoles, getFamilyMembers } from "~/lib/dal";
import { requireUser } from "~/lib/auth.server";
import type { LegalRole, FamilyMember } from "~/types/people";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    const [legalRoles, familyMembers] = await Promise.all([
      getLegalRoles(userId),
      getFamilyMembers(userId),
    ]);

    // Group roles by type
    const rolesByType = legalRoles.reduce(
      (acc, role) => {
        if (!role) return acc;
        const type = role.roleType;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(role);
        return acc;
      },
      {} as Record<string, typeof legalRoles>,
    );

    // Define critical roles
    const criticalRoles = {
      executor: "Executor of Will",
      trustee: "Trustee",
      successor_trustee: "Successor Trustee",
      power_of_attorney: "Power of Attorney",
      healthcare_proxy: "Healthcare Proxy",
      guardian: "Guardian for Minors",
    };

    return json({
      legalRoles,
      familyMembers,
      rolesByType,
      criticalRoles,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load legal roles:", error);
    return json(
      {
        legalRoles: [],
        familyMembers: [],
        rolesByType: {},
        criticalRoles: {},
        error: error instanceof Error ? error.message : "Failed to load legal roles",
      },
      { status: 500 },
    );
  }
}

function KeyRolesContent() {
  const loaderData = useLoaderData<typeof loader>();
  const legalRoles = (loaderData.legalRoles || []) as unknown as LegalRole[];
  const familyMembers = (loaderData.familyMembers || []) as unknown as FamilyMember[];
  const rolesByType = (loaderData.rolesByType || {}) as unknown as Record<string, LegalRole[]>;
  const criticalRoles = (loaderData.criticalRoles || {}) as Record<string, string>;
  const error = loaderData.error;

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Key Appointments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage executors, trustees, and other key roles
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

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case "executor":
        return Briefcase;
      case "trustee":
        return Shield;
      case "successor_trustee":
        return UserCog;
      case "power_of_attorney":
        return FileText;
      case "healthcare_proxy":
        return Heart;
      case "guardian":
        return Users;
      default:
        return Shield;
    }
  };

  const getRoleBadgeVariant = (isPrimary: boolean) => {
    return isPrimary ? "default" : "secondary";
  };

  // Check for missing critical roles
  const missingRoles = Object.entries(criticalRoles)
    .filter(([roleType]: [string, string]) => {
      return !rolesByType[roleType] || rolesByType[roleType].length === 0;
    })
    .map(([roleType, roleName]: [string, string]) => ({ roleType, roleName }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Key Appointments</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage executors, trustees, and other key roles for your estate
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Role Assignment (Coming Soon)
        </Button>
      </div>

      {/* Missing Roles Alert */}
      {missingRoles.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertCircle className="mr-2 h-5 w-5" />
              Missing Key Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-orange-700 dark:text-orange-300">
              The following critical roles have not been assigned:
            </p>
            <ul className="list-inside list-disc space-y-1 text-orange-700 dark:text-orange-300">
              {missingRoles.map(({ roleType, roleName }) => (
                <li key={roleType}>{roleName}</li>
              ))}
            </ul>
            <Button variant="outline" className="mt-4" disabled>
              Assign Missing Roles (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(criticalRoles).map(([roleType, roleName]: [string, string]) => {
          const Icon = getRoleIcon(roleType);
          const assignments = rolesByType[roleType] || [];
          const hasAssignment = assignments.length > 0;

          return (
            <Card
              key={roleType}
              className={
                hasAssignment
                  ? ""
                  : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{roleName}</CardTitle>
                <Icon
                  className={`h-4 w-4 ${hasAssignment ? "text-gray-600 dark:text-gray-400 dark:text-gray-500" : "text-gray-400 dark:text-gray-500"}`}
                />
              </CardHeader>
              <CardContent>
                {hasAssignment ? (
                  <div className="space-y-2">
                    {assignments.map((role: LegalRole) =>
                      role ? (
                        <div key={role.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{role.personName}</span>
                          <Badge variant={getRoleBadgeVariant(role.isPrimary)}>
                            {role.isPrimary ? "Primary" : "Alternate"}
                          </Badge>
                        </div>
                      ) : null,
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    Not assigned
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Role Assignments */}
      {legalRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Role Assignments</CardTitle>
            <CardDescription>
              Complete list of legal role assignments and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(rolesByType).map(([roleType, roles]: [string, LegalRole[]]) => {
                const Icon = getRoleIcon(roleType);
                const roleName = criticalRoles[roleType as keyof typeof criticalRoles] || roleType;

                return (
                  <div key={roleType} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-3 flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                      <h3 className="font-medium">{roleName}</h3>
                    </div>

                    <div className="ml-7 space-y-3">
                      {roles.map((role: LegalRole) =>
                        role ? (
                          <div key={role.id} className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <p className="font-medium">{role.personName}</p>
                                <Badge
                                  variant={getRoleBadgeVariant(role.isPrimary)}
                                  className="mt-1"
                                >
                                  {role.isPrimary ? "Primary" : "Alternate"}
                                  {role.orderOfPrecedence && ` - Order: ${role.orderOfPrecedence}`}
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost" asChild>
                                  <Link to={`/key-roles/${role.id}/edit`}>Edit</Link>
                                </Button>
                              </div>
                            </div>

                            {role.specificPowers && role.specificPowers.length > 0 && (
                              <div className="mt-3">
                                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Specific Powers:
                                </p>
                                <ul className="list-inside list-disc text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                  {role.specificPowers.map((power: string, idx: number) => (
                                    <li key={idx}>{power}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {role.compensation && role.compensation.type !== "none" && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                  <span className="font-medium">Compensation:</span>{" "}
                                  {role.compensation.type}
                                  {role.compensation.amount && ` - $${role.compensation.amount}`}
                                </p>
                              </div>
                            )}

                            {role.notes && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                  {role.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : null,
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Family Members */}
      {familyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Family Members</CardTitle>
            <CardDescription>Family members who can be assigned to legal roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {familyMembers.map((member: FamilyMember) =>
                member ? (
                  <div key={member.id} className="rounded-lg border p-3">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {member.relationship}
                    </p>
                    {member.legalRoles && member.legalRoles.length > 0 && (
                      <div className="mt-2">
                        {member.legalRoles.map((role: LegalRole) => (
                          <Badge key={role.id} variant="outline" className="mb-1 mr-1">
                            {role.roleType}
                          </Badge>
                        ))}
                      </div>
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

export default function KeyRoles() {
  return (
    <ErrorBoundary level="page">
      <KeyRolesContent />
    </ErrorBoundary>
  );
}
