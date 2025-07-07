import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Phone, Mail, MapPin, Shield, UserCheck, Heart, AlertTriangle } from "lucide-react";
import { 
  getFamilyMembers, 
  getProfessionals, 
  getEmergencyContacts,
  getLegalRoles,
  getHealthcareDirectives
} from "~/lib/dal";

export async function loader() {
  const userId = 'user-nick-001'; // Default user for now
  
  const [familyMembers, professionals, emergencyContacts, legalRoles, healthcareDirectives] = await Promise.all([
    getFamilyMembers(userId),
    getProfessionals(userId),
    getEmergencyContacts(userId),
    getLegalRoles(userId),
    getHealthcareDirectives(userId)
  ]);
  
  return json({
    familyMembers,
    professionals,
    emergencyContacts,
    legalRoles,
    healthcareDirectives
  });
}

export default function FamilyOverview() {
  const { familyMembers, professionals, emergencyContacts, legalRoles, healthcareDirectives } = useLoaderData<typeof loader>();
  const formatPhone = (phone?: string) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  const getRolesByPerson = (personId: string) => {
    return legalRoles.filter(role => role.personId === personId);
  };

  const getHealthcareRolesByPerson = (personId: string) => {
    return healthcareDirectives.filter(directive => directive.personId === personId);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'spouse': return 'bg-pink-100 text-pink-800';
      case 'sibling': return 'bg-blue-100 text-blue-800';
      case 'parent': return 'bg-green-100 text-green-800';
      case 'child': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfessionalTypeColor = (type: string) => {
    switch (type) {
      case 'estate_attorney': return 'bg-purple-100 text-purple-800';
      case 'financial_advisor': return 'bg-green-100 text-green-800';
      case 'accountant': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Family & Professional Team</h1>
        <p className="text-gray-600">Comprehensive directory of family members, professional team, and emergency contacts</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Family Members</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{familyMembers.length}</div>
            <p className="text-xs text-gray-600">Including spouse and siblings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Professional Team</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{professionals.length}</div>
            <p className="text-xs text-gray-600">Attorney, advisor, CPA, trustee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Emergency Contacts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{emergencyContacts.length}</div>
            <p className="text-xs text-gray-600">24/7 availability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Legal Roles</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{legalRoles.length}</div>
            <p className="text-xs text-gray-600">Across all estate functions</p>
          </CardContent>
        </Card>
      </div>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 text-red-600 mr-2" />
            Family Members
          </CardTitle>
          <CardDescription>Core family members and their roles in estate planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {familyMembers.map((member) => {
              const memberLegalRoles = getRolesByPerson(member.id);
              const memberHealthcareRoles = getHealthcareRolesByPerson(member.id);
              
              return (
                <div key={member.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      <Badge className={getRelationshipColor(member.relationship)}>
                        {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                      </Badge>
                    </div>
                    {(member.isMinor || member.isDependent) && (
                      <div className="flex space-x-1">
                        {member.isMinor && <Badge variant="outline">Minor</Badge>}
                        {member.isDependent && <Badge variant="outline">Dependent</Badge>}
                      </div>
                    )}
                  </div>

                  {/* Contact Information */}
                  {member.contactInfo && (
                    <div className="space-y-2 mb-4">
                      {member.contactInfo.primaryPhone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {formatPhone(member.contactInfo.primaryPhone)}
                        </div>
                      )}
                      {member.contactInfo.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {member.contactInfo.email}
                        </div>
                      )}
                      {member.contactInfo.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {member.contactInfo.address.city}, {member.contactInfo.address.state}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legal Roles */}
                  {(memberLegalRoles.length > 0 || memberHealthcareRoles.length > 0) && (
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Estate Planning Roles</h4>
                      <div className="space-y-1">
                        {memberLegalRoles.map((role) => (
                          <div key={role.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900 capitalize">{role.roleType.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs">
                              {role.isPrimary ? 'Primary' : `Order ${role.orderOfPrecedence || 'N/A'}`}
                            </Badge>
                          </div>
                        ))}
                        {memberHealthcareRoles.map((directive) => (
                          <div key={directive.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-900 capitalize">{directive.type.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs">
                              {directive.isPrimary ? 'Primary' : 'Secondary'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {member.notes && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600">{member.notes}</p>
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
            <UserCheck className="h-5 w-5 text-blue-600 mr-2" />
            Professional Team
          </CardTitle>
          <CardDescription>Estate planning professionals and their specializations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {professionals.map((professional) => (
              <div key={professional.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{professional.name}</h3>
                    <p className="text-sm text-gray-600">{professional.firm}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Badge className={getProfessionalTypeColor(professional.type)}>
                      {professional.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    {professional.isPreferredProvider && (
                      <Badge variant="outline" className="text-xs">Preferred</Badge>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                {professional.specializations && professional.specializations.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Specializations</h4>
                    <div className="flex flex-wrap gap-1">
                      {professional.specializations.map((spec, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="space-y-2 mb-3">
                  {professional.contactInfo.primaryPhone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {formatPhone(professional.contactInfo.primaryPhone)}
                    </div>
                  )}
                  {professional.contactInfo.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {professional.contactInfo.email}
                    </div>
                  )}
                  {professional.contactInfo.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {professional.contactInfo.address.city}, {professional.contactInfo.address.state}
                    </div>
                  )}
                </div>

                {/* Credentials & Experience */}
                <div className="border-t pt-3 flex items-center justify-between text-sm">
                  <div>
                    {professional.credentials && professional.credentials.length > 0 && (
                      <span className="text-gray-600">
                        {professional.credentials.join(', ')}
                      </span>
                    )}
                  </div>
                  {professional.yearsExperience && (
                    <span className="text-gray-500">
                      {professional.yearsExperience} years exp.
                    </span>
                  )}
                </div>

                {professional.notes && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-sm text-gray-600">{professional.notes}</p>
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
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Priority contacts for medical and legal emergencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emergencyContacts
              .sort((a, b) => a.priority - b.priority)
              .map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {contact.priority}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{contact.relationship} • {contact.contactType}</p>
                      {contact.availability && (
                        <p className="text-xs text-gray-500">Available: {contact.availability}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {formatPhone(contact.contactInfo.primaryPhone)}
                      </div>
                      {contact.contactInfo.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {contact.contactInfo.email}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-1 mt-2">
                      {contact.medicalAuthority && (
                        <Badge variant="outline" className="text-xs">Medical Authority</Badge>
                      )}
                      {contact.canMakeDecisions && (
                        <Badge variant="outline" className="text-xs">Decision Maker</Badge>
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