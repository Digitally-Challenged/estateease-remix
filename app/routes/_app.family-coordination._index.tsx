import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FamilyCoordinationWidget } from "~/components/ui/family-coordination-widget";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  getFamilyMembers,
  getProfessionals,
  getEmergencyContacts,
  getLegalRoles,
  getHealthcareDirectives,
  getFamilyCoordinationMetrics,
} from "~/lib/dal";
import Users from "lucide-react/dist/esm/icons/users";
import Shield from "lucide-react/dist/esm/icons/shield";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import Settings from "lucide-react/dist/esm/icons/settings";
import Plus from "lucide-react/dist/esm/icons/plus";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import FileText from "lucide-react/dist/esm/icons/file-text";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;

  try {
    const [
      familyMembers,
      professionals,
      emergencyContacts,
      legalRoles,
      healthcareDirectives,
      coordinationMetrics,
    ] = await Promise.all([
      getFamilyMembers(userId),
      getProfessionals(userId),
      getEmergencyContacts(userId),
      getLegalRoles(userId),
      getHealthcareDirectives(userId),
      getFamilyCoordinationMetrics(userId),
    ]);

    return json({
      familyMembers,
      professionals,
      emergencyContacts,
      legalRoles,
      healthcareDirectives,
      coordinationMetrics,
    });
  } catch (error) {
    console.error("Error loading family coordination data:", error);
    return json({
      familyMembers: [],
      professionals: [],
      emergencyContacts: [],
      legalRoles: [],
      healthcareDirectives: [],
      coordinationMetrics: {
        totalFamilyMembers: 0,
        relationshipBreakdown: [],
        contactCoverage: { email: 0, phone: 0 },
        roleCoverage: [],
        emergencyReadiness: {
          totalContacts: 0,
          medicalAuthority: 0,
          decisionAuthority: 0,
          avgPriority: 0,
        },
        coordinationScore: 0,
        recommendations: ["Unable to load coordination data"],
      },
    });
  }
}

export default function FamilyCoordinationDashboard() {
  const {
    familyMembers,
    professionals,
    emergencyContacts,
    legalRoles,
    healthcareDirectives,
    coordinationMetrics,
  } = useLoaderData<typeof loader>();

  // Calculate communication reach
  const totalContacts = familyMembers.length + professionals.length + emergencyContacts.length;
  const emailReach = [...familyMembers, ...professionals, ...emergencyContacts].filter(
    (contact) => contact.contactInfo?.email || contact.email,
  ).length;
  const phoneReach = [...familyMembers, ...professionals, ...emergencyContacts].filter(
    (contact) => contact.contactInfo?.primaryPhone || contact.contactInfo?.phone || contact.phone,
  ).length;

  // Role assignment analysis
  const criticalRoles = ["executor", "trustee", "power_of_attorney", "healthcare_proxy"];
  const assignedRoles = criticalRoles.filter(
    (role) =>
      legalRoles.some((lr) => lr.roleType === role) ||
      healthcareDirectives.some((hd) => hd.type.includes(role.replace("_", ""))),
  );

  // Communication efficiency metrics
  const relationshipPriority = {
    spouse: 1,
    child: 2,
    parent: 3,
    sibling: 4,
    other: 5,
  };

  const prioritizedFamily = familyMembers
    .sort(
      (a, b) =>
        (relationshipPriority[a.relationship] || 5) - (relationshipPriority[b.relationship] || 5),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Family Coordination Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Optimize family relationships, role assignments, and communication protocols
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Update
          </Button>
        </div>
      </div>

      {/* Family Coordination Metrics Widget */}
      <FamilyCoordinationWidget metrics={coordinationMetrics} />

      {/* Action Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Family Meeting</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Coordinate next estate planning discussion
            </p>
            <Button size="sm" className="mt-2 w-full">
              <Plus className="mr-1 h-3 w-3" />
              Schedule
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Update Contact Info</CardTitle>
            <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {100 - coordinationMetrics.contactCoverage.email}% missing email addresses
            </p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              Update Contacts
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Assignments</CardTitle>
            <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {criticalRoles.length - assignedRoles.length} critical roles unassigned
            </p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              Assign Roles
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communication Plan</CardTitle>
            <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Create notification preferences
            </p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Priority Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Priority Family Members
          </CardTitle>
          <CardDescription>Key family members for estate planning coordination</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prioritizedFamily.map((member) => {
              const memberRoles = legalRoles.filter((role) => role.personId === member.id);
              const hasContact = member.contactInfo?.email || member.contactInfo?.primaryPhone;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-3 w-3 rounded-full ${hasContact ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm capitalize text-gray-600 dark:text-gray-400">
                        {member.relationship.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {memberRoles.length > 0 && (
                      <Badge variant="outline">
                        {memberRoles.length} role{memberRoles.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {member.contactInfo?.email && (
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                    {member.contactInfo?.primaryPhone && (
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Communication Protocols */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Communication Protocols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Regular Updates</span>
                <Badge>Quarterly</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Emergency Notifications</span>
                <Badge variant="destructive">Immediate</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Document Changes</span>
                <Badge variant="outline">Within 48hrs</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Role Updates</span>
                <Badge variant="outline">Within 7 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Coordination Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm">Updated executor designation</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">Added emergency contact</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm">Family meeting scheduled</p>
                  <p className="text-xs text-gray-500">2 weeks ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {coordinationMetrics.recommendations.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Coordination Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {coordinationMetrics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
