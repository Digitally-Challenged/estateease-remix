import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Shield from "lucide-react/dist/esm/icons/shield";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import Heart from "lucide-react/dist/esm/icons/heart";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import {
  getFamilyMembers,
  getProfessionals,
  getEmergencyContacts,
  getLegalRoles,
  getHealthcareDirectives,
} from "~/lib/dal";
import { requireUser } from "~/lib/auth.server";

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";

/**
 * Local view types matching what the DAL actually returns.
 * The DAL types differ from the canonical people.ts types and
 * json() + useLoaderData widens string literal unions to string,
 * so we define view-friendly types here.
 */
interface DalContactInfo {
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  preferredContact?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

interface DalFamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  name?: string;
  relationship: string;
  relationshipType: string;
  dateOfBirth?: string;
  isMinor: boolean;
  isDependent: boolean;
  contactInfo: DalContactInfo;
  address: Record<string, string | undefined>;
  notes?: string;
  isActive: boolean;
}

interface DalProfessional {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  name?: string;
  type: string;
  firm?: string;
  title?: string;
  specializations: string[];
  credentials: string[];
  yearsExperience?: number;
  isPreferredProvider: boolean;
  contactInfo: DalContactInfo;
  notes?: string;
}

interface DalLegalRole {
  id: string;
  personId?: string;
  assignee?: { id: string; fullName: string };
  roleType: string;
  isPrimary?: boolean;
  orderOfPrecedence?: number;
}

interface DalHealthcareDirective {
  id: string;
  personId?: string;
  principal?: { id: string; fullName: string };
  type?: string;
  directiveType?: string;
  isPrimary?: boolean;
}

interface DalEmergencyContact {
  id: string;
  name: string;
  relationship: string;
  contactType: string;
  priority: number;
  contactInfo: {
    primaryPhone?: string;
    email?: string;
    preferredContact?: string;
  };
  availability?: string;
  medicalAuthority: boolean;
  canMakeDecisions: boolean;
  languages: string[];
  notes?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;

  const familyMembers = getFamilyMembers(userId);
  const professionals = getProfessionals(userId);
  const emergencyContacts = getEmergencyContacts(userId);
  const legalRoles = getLegalRoles(userId);
  const healthcareDirectives = getHealthcareDirectives(userId);

  return json({
    familyMembers,
    professionals,
    emergencyContacts,
    legalRoles,
    healthcareDirectives,
  });
}

export default function FamilyOverview() {
  const data = useLoaderData<typeof loader>();
  const familyMembers = data.familyMembers as unknown as DalFamilyMember[];
  const professionals = data.professionals as unknown as DalProfessional[];
  const emergencyContacts = data.emergencyContacts as unknown as DalEmergencyContact[];
  const legalRoles = data.legalRoles as unknown as DalLegalRole[];
  const healthcareDirectives = data.healthcareDirectives as unknown as DalHealthcareDirective[];
  const formatPhone = (phone?: string) => {
    if (!phone) return "Not provided";
    return phone;
  };

  const getRolesByPerson = (personId: string) => {
    return legalRoles.filter((role: DalLegalRole) => (role.personId ?? role.assignee?.id) === personId);
  };

  const getHealthcareRolesByPerson = (personId: string) => {
    return healthcareDirectives.filter((directive: DalHealthcareDirective) => (directive.personId ?? directive.principal?.id) === personId);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case "spouse":
        return "bg-pink-100 text-pink-800";
      case "sibling":
        return "bg-blue-100 text-blue-800 dark:text-blue-200";
      case "parent":
        return "bg-green-100 text-green-800 dark:text-green-200";
      case "child":
        return "bg-yellow-100 text-yellow-800 dark:text-yellow-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const getProfessionalTypeColor = (type: string) => {
    switch (type) {
      case "estate_attorney":
        return "bg-purple-100 text-purple-800";
      case "financial_advisor":
        return "bg-green-100 text-green-800 dark:text-green-200";
      case "accountant":
        return "bg-blue-100 text-blue-800 dark:text-blue-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Family & Professional Team
        </h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Comprehensive directory of family members, professional team, and emergency contacts
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Family Members
            </CardTitle>
            <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {familyMembers.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Including spouse and siblings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Professional Team
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {professionals.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Attorney, advisor, CPA, trustee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Emergency Contacts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {emergencyContacts.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              24/7 availability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Legal Roles
            </CardTitle>
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {legalRoles.length}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Across all estate functions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-600 dark:text-red-400" />
                Family Members
              </CardTitle>
              <CardDescription>
                Core family members and their roles in estate planning
              </CardDescription>
            </div>
            <Link to="/family/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Family Member
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {familyMembers.map((member) => {
              const memberLegalRoles = getRolesByPerson(member.id);
              const memberHealthcareRoles = getHealthcareRolesByPerson(member.id);

              return (
                <div
                  key={member.id}
                  className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {member.name ?? member.fullName}
                      </h3>
                      <Badge className={getRelationshipColor(member.relationship)}>
                        {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {(member.isMinor || member.isDependent) && (
                        <div className="flex space-x-1">
                          {member.isMinor && <Badge variant="outline">Minor</Badge>}
                          {member.isDependent && <Badge variant="outline">Dependent</Badge>}
                        </div>
                      )}
                      <Link to={`/family/${member.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Contact Information */}
                  {member.contactInfo && (
                    <div className="mb-4 space-y-2">
                      {member.contactInfo.primaryPhone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="mr-2 h-4 w-4" />
                          {formatPhone(member.contactInfo.primaryPhone)}
                        </div>
                      )}
                      {member.contactInfo.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="mr-2 h-4 w-4" />
                          {member.contactInfo.email}
                        </div>
                      )}
                      {member.contactInfo?.address && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="mr-2 h-4 w-4" />
                          {member.contactInfo.address.city}, {member.contactInfo.address.state}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legal Roles */}
                  {(memberLegalRoles.length > 0 || memberHealthcareRoles.length > 0) && (
                    <div className="border-t pt-3">
                      <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Estate Planning Roles
                      </h4>
                      <div className="space-y-1">
                        {memberLegalRoles.map((role: DalLegalRole) => (
                          <div key={role.id} className="flex items-center justify-between text-sm">
                            <span className="capitalize text-gray-900 dark:text-gray-100">
                              {role.roleType.replace("_", " ")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {role.isPrimary
                                ? "Primary"
                                : `Order ${role.orderOfPrecedence || "N/A"}`}
                            </Badge>
                          </div>
                        ))}
                        {memberHealthcareRoles.map((directive: DalHealthcareDirective) => (
                          <div
                            key={directive.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="capitalize text-gray-900 dark:text-gray-100">
                              {(directive.type ?? directive.directiveType ?? "").replace("_", " ")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {directive.isPrimary ? "Primary" : "Secondary"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.notes && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {member.notes}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Professional Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            Professional Team
          </CardTitle>
          <CardDescription>Estate planning professionals and their specializations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {professionals.map((professional) => (
              <div
                key={professional.id}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {professional.name ?? professional.fullName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {professional.firm}
                    </p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={getProfessionalTypeColor(professional.type)}>
                      {professional.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    {professional.isPreferredProvider && (
                      <Badge variant="outline" className="text-xs">
                        Preferred
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                {professional.specializations && professional.specializations.length > 0 && (
                  <div className="mb-3">
                    <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {professional.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="mb-3 space-y-2">
                  {professional.contactInfo.primaryPhone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      <Phone className="mr-2 h-4 w-4" />
                      {formatPhone(professional.contactInfo.primaryPhone)}
                    </div>
                  )}
                  {professional.contactInfo.email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      <Mail className="mr-2 h-4 w-4" />
                      {professional.contactInfo.email}
                    </div>
                  )}
                  {professional.contactInfo?.address && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      <MapPin className="mr-2 h-4 w-4" />
                      {professional.contactInfo.address.city},{" "}
                      {professional.contactInfo.address.state}
                    </div>
                  )}
                </div>

                {/* Credentials & Experience */}
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <div>
                    {professional.credentials && professional.credentials.length > 0 && (
                      <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {professional.credentials.join(", ")}
                      </span>
                    )}
                  </div>
                  {professional.yearsExperience && (
                    <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {professional.yearsExperience} years exp.
                    </span>
                  )}
                </div>

                {professional.notes && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {professional.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Priority contacts for medical and legal emergencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyContacts
              .sort((a, b) => a.priority - b.priority)
              .map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {contact.priority}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {contact.name}
                      </h3>
                      <p className="text-sm capitalize text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        {contact.relationship} • {contact.contactType}
                      </p>
                      {contact.availability && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          Available: {contact.availability}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        <Phone className="mr-2 h-4 w-4" />
                        {formatPhone(contact.contactInfo.primaryPhone)}
                      </div>
                      {contact.contactInfo.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                          <Mail className="mr-2 h-4 w-4" />
                          {contact.contactInfo.email}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex space-x-1">
                      {contact.medicalAuthority && (
                        <Badge variant="outline" className="text-xs">
                          Medical Authority
                        </Badge>
                      )}
                      {contact.canMakeDecisions && (
                        <Badge variant="outline" className="text-xs">
                          Decision Maker
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
