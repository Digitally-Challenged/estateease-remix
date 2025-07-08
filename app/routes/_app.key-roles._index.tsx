import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Shield, 
  Plus,
  UserCog,
  Briefcase,
  Heart,
  Users,
  FileText,
  AlertCircle
} from "lucide-react";
import { getLegalRoles, getFamilyMembers } from "~/lib/dal";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    
    const [legalRoles, familyMembers] = await Promise.all([
      getLegalRoles(userId),
      getFamilyMembers(userId)
    ]);

    // Group roles by type
    const rolesByType = legalRoles.reduce((acc, role) => {
      if (!role) return acc;
      const type = role.roleType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(role);
      return acc;
    }, {} as Record<string, typeof legalRoles>);

    // Define critical roles
    const criticalRoles = {
      executor: 'Executor of Will',
      trustee: 'Trustee',
      successor_trustee: 'Successor Trustee',
      power_of_attorney: 'Power of Attorney',
      healthcare_proxy: 'Healthcare Proxy',
      guardian: 'Guardian for Minors'
    };

    return json({ 
      legalRoles,
      familyMembers,
      rolesByType,
      criticalRoles,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load legal roles:', error);
    return json({ 
      legalRoles: [],
      familyMembers: [],
      rolesByType: {},
      criticalRoles: {},
      error: error instanceof Error ? error.message : 'Failed to load legal roles' 
    }, { status: 500 });
  }
}

function KeyRolesContent() {
  const { legalRoles, familyMembers, rolesByType, criticalRoles, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Key Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage executors, trustees, and other key roles</p>
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
      case 'executor': return Briefcase;
      case 'trustee': return Shield;
      case 'successor_trustee': return UserCog;
      case 'power_of_attorney': return FileText;
      case 'healthcare_proxy': return Heart;
      case 'guardian': return Users;
      default: return Shield;
    }
  };

  const getRoleBadgeVariant = (isPrimary: boolean) => {
    return isPrimary ? "default" : "secondary";
  };

  // Check for missing critical roles
  const missingRoles = Object.entries(criticalRoles)
    .filter(([roleType]) => {
      const roles = rolesByType as Record<string, typeof legalRoles>;
      return !roles[roleType] || roles[roleType].length === 0;
    })
    .map(([roleType, roleName]) => ({ roleType, roleName }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Key Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Manage executors, trustees, and other key roles for your estate</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Role Assignment (Coming Soon)
        </Button>
      </div>

      {/* Missing Roles Alert */}
      {missingRoles.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Missing Key Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 dark:text-orange-300 mb-4">
              The following critical roles have not been assigned:
            </p>
            <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300">
              {missingRoles.map(({ roleType, roleName }) => (
                <li key={roleType}>{roleName}</li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="mt-4"
              disabled
            >
              Assign Missing Roles (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(criticalRoles).map(([roleType, roleName]) => {
          const Icon = getRoleIcon(roleType);
          const roles = rolesByType as Record<string, typeof legalRoles>;
          const assignments = roles[roleType] || [];
          const hasAssignment = assignments.length > 0;
          
          return (
            <Card key={roleType} className={hasAssignment ? "" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{roleName}</CardTitle>
                <Icon className={`h-4 w-4 ${hasAssignment ? "text-gray-600 dark:text-gray-400 dark:text-gray-500" : "text-gray-400 dark:text-gray-500"}`} />
              </CardHeader>
              <CardContent>
                {hasAssignment ? (
                  <div className="space-y-2">
                    {assignments.map((role: typeof legalRoles[0]) => role ? (
                      <div key={role.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{role.personName}</span>
                        <Badge variant={getRoleBadgeVariant(role.isPrimary)}>
                          {role.isPrimary ? 'Primary' : 'Alternate'}
                        </Badge>
                      </div>
                    ) : null)}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">Not assigned</p>
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
              {Object.entries(rolesByType).map(([roleType, roles]) => {
                const Icon = getRoleIcon(roleType);
                const roleName = criticalRoles[roleType as keyof typeof criticalRoles] || roleType;
                
                return (
                  <div key={roleType} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                      <h3 className="font-medium">{roleName}</h3>
                    </div>
                    
                    <div className="space-y-3 ml-7">
                      {roles.map((role) => role ? (
                        <div key={role.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{role.personName}</p>
                              <Badge 
                                variant={getRoleBadgeVariant(role.isPrimary)} 
                                className="mt-1"
                              >
                                {role.isPrimary ? 'Primary' : 'Alternate'}
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
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Powers:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                {role.specificPowers.map((power, idx) => (
                                  <li key={idx}>{power}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {role.compensation && role.compensation.type !== 'none' && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                <span className="font-medium">Compensation:</span> {role.compensation.type}
                                {role.compensation.amount && ` - $${role.compensation.amount}`}
                              </p>
                            </div>
                          )}
                          
                          {role.notes && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{role.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : null)}
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
            <CardDescription>
              Family members who can be assigned to legal roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => member ? (
                <div key={member.id} className="border rounded-lg p-3">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{member.relationship}</p>
                  {member.legalRoles && member.legalRoles.length > 0 && (
                    <div className="mt-2">
                      {member.legalRoles.map((role) => (
                        <Badge key={role.id} variant="outline" className="mr-1 mb-1">
                          {role.roleType}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : null)}
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