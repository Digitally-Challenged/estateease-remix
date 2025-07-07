import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Users,
  Plus,
  Phone,
  Heart,
  AlertCircle,
  Shield,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react";
import { getEmergencyContacts } from "~/lib/dal";
import type { Column } from "~/components/ui/data-table";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    const contacts = await getEmergencyContacts(userId);

    // Sort contacts by priority
    const sortedContacts = [...contacts].sort((a, b) => {
      const priorityA = a?.priority || 999;
      const priorityB = b?.priority || 999;
      return priorityA - priorityB;
    });

    // Group by contact type
    const contactsByType = {
      primary: sortedContacts.filter(c => c?.contactType === 'primary'),
      secondary: sortedContacts.filter(c => c?.contactType === 'secondary'),
      medical: sortedContacts.filter(c => c?.medicalAuthority),
      other: sortedContacts.filter(c => 
        c?.contactType !== 'primary' && 
        c?.contactType !== 'secondary' && 
        !c?.medicalAuthority
      )
    };

    // Find contacts who can make decisions
    const decisionMakers = contacts.filter(c => c?.canMakeDecisions);

    return json({ 
      contacts: sortedContacts,
      contactsByType,
      decisionMakers,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load emergency contacts:', error);
    return json({ 
      contacts: [],
      contactsByType: { primary: [], secondary: [], medical: [], other: [] },
      decisionMakers: [],
      error: error instanceof Error ? error.message : 'Failed to load emergency contacts' 
    }, { status: 500 });
  }
}

function EmergencyContactsContent() {
  const { contacts, contactsByType, decisionMakers, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your emergency contact information</p>
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

  if (!contacts || contacts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
            <p className="text-gray-600 mt-2">Manage your emergency contact information</p>
          </div>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency contacts set up</h3>
            <p className="text-gray-600 mb-4">
              Add emergency contacts to ensure you can be reached in case of an emergency
            </p>
            <Button onClick={() => navigate('/emergency-contacts/new')}>
              Add Emergency Contact
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const columns: Column<typeof contacts[0]>[] = [
    {
      key: 'priority',
      header: '#',
      render: (contact) => (
        <span className="font-medium text-gray-600">
          {contact?.priority || '-'}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Contact',
      render: (contact) => (
        <div>
          <p className="font-medium">{contact?.name}</p>
          <p className="text-sm text-gray-600">{contact?.relationship}</p>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact Info',
      render: (contact) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1 mb-1">
            <Phone className="h-3 w-3 text-gray-400" />
            <span>{contact?.contactInfo?.primaryPhone || 'No phone'}</span>
          </div>
          {contact?.contactInfo?.secondaryPhone && (
            <div className="text-gray-600">Alt: {contact.contactInfo.secondaryPhone}</div>
          )}
          {contact?.contactInfo?.email && (
            <div className="text-gray-600">{contact.contactInfo.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (contact) => (
        <div className="space-y-1">
          <Badge variant={contact?.contactType === 'primary' ? 'default' : 'secondary'}>
            {contact?.contactType === 'primary' ? 'Primary' : 
             contact?.contactType === 'secondary' ? 'Secondary' : 'Other'}
          </Badge>
          {contact?.medicalAuthority && (
            <Badge variant="outline" className="bg-red-50">
              <Heart className="h-3 w-3 mr-1" />
              Medical
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'authority',
      header: 'Authority',
      render: (contact) => (
        <div className="text-sm">
          {contact?.canMakeDecisions ? (
            <span className="text-green-600 flex items-center">
              <UserCheck className="h-4 w-4 mr-1" />
              Can decide
            </span>
          ) : (
            <span className="text-gray-400">Info only</span>
          )}
        </div>
      )
    },
    {
      key: 'availability',
      header: 'Availability',
      render: (contact) => (
        <span className="text-sm text-gray-600">
          {contact?.availability || 'Always'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (contact) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/emergency-contacts/${contact?.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Emergency Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your emergency contact information</p>
        </div>
        <Button onClick={() => navigate('/emergency-contacts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
            <p className="text-xs text-gray-600 mt-1">Emergency contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Primary Contacts</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactsByType.primary.length}</div>
            <p className="text-xs text-gray-600 mt-1">First to contact</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Authority</CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactsByType.medical.length}</div>
            <p className="text-xs text-gray-600 mt-1">Can make medical decisions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decision Makers</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisionMakers.length}</div>
            <p className="text-xs text-gray-600 mt-1">Can make decisions</p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {contactsByType.primary.length === 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              No Primary Contact Designated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              You should designate at least one primary emergency contact who will be contacted first in case of emergency.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/emergency-contacts/new')}
            >
              Add Primary Contact
            </Button>
          </CardContent>
        </Card>
      )}

      {contactsByType.medical.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              No Medical Decision Maker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Consider designating someone with medical decision-making authority in case you&apos;re unable to make medical decisions.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Priority List */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact Priority</CardTitle>
          <CardDescription>
            Contacts will be reached in this order during an emergency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={contacts as Record<string, unknown>[]}
            columns={columns as Column<Record<string, unknown>>[]}
            sortable={false} // Already sorted by priority
          />
        </CardContent>
      </Card>

      {/* Decision Making Authority */}
      {decisionMakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Decision Making Authority
            </CardTitle>
            <CardDescription>
              These contacts have authority to make decisions on your behalf
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decisionMakers.map((contact) => contact ? (
                <div key={contact.id} className="flex items-start justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      {contact.medicalAuthority && (
                        <Badge variant="outline" className="text-xs">
                          Medical Decisions
                        </Badge>
                      )}
                      {contact.canMakeDecisions && (
                        <Badge variant="outline" className="text-xs">
                          Legal Decisions
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{contact.contactInfo?.primaryPhone || ''}</p>
                    {contact.contactInfo?.email && <p>{contact.contactInfo.email}</p>}
                  </div>
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Support */}
      {contacts.some(c => c?.languages && c.languages.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Language Preferences</CardTitle>
            <CardDescription>
              Languages spoken by your emergency contacts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {contacts.filter(c => c?.languages && c.languages.length > 0).map((contact) => contact ? (
                <div key={contact.id} className="flex items-center justify-between">
                  <span className="font-medium">{contact.name}</span>
                  <div className="flex gap-2">
                    {contact.languages?.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EmergencyContacts() {
  return (
    <ErrorBoundary level="page">
      <EmergencyContactsContent />
    </ErrorBoundary>
  );
} 