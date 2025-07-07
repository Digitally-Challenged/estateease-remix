import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Heart, 
  Plus,
  FileHeart,
  UserCheck,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { getHealthcareDirectives, getFamilyMembers } from "~/lib/dal";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    
    const [healthcareDirectives, familyMembers] = await Promise.all([
      getHealthcareDirectives(userId),
      getFamilyMembers(userId)
    ]);

    // Group directives by type
    const directivesByType = healthcareDirectives.reduce((acc, directive) => {
      if (!directive) return acc;
      const type = directive.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(directive);
      return acc;
    }, {} as Record<string, typeof healthcareDirectives>);

    // Calculate completion status
    const hasLivingWill = directivesByType['living_will']?.length > 0;
    const hasHealthcareProxy = directivesByType['healthcare_proxy']?.length > 0;
    const hasDNR = directivesByType['dnr']?.length > 0;
    const hasOrganDonation = directivesByType['organ_donation']?.length > 0;

    const completionItems = [
      { name: 'Living Will', completed: hasLivingWill },
      { name: 'Healthcare Proxy', completed: hasHealthcareProxy },
      { name: 'DNR Orders', completed: hasDNR },
      { name: 'Organ Donation', completed: hasOrganDonation }
    ];

    const completedCount = completionItems.filter(item => item.completed).length;

    return json({ 
      healthcareDirectives,
      familyMembers,
      directivesByType,
      completionItems,
      completedCount,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load healthcare directives:', error);
    return json({ 
      healthcareDirectives: [],
      familyMembers: [],
      directivesByType: {},
      completionItems: [],
      completedCount: 0,
      error: error instanceof Error ? error.message : 'Failed to load healthcare directives' 
    }, { status: 500 });
  }
}

function HealthcareDirectivesContent() {
  const { 
    familyMembers, 
    directivesByType, 
    completionItems,
    completedCount,
    error 
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Directives</h1>
          <p className="text-gray-600 mt-2">Manage your medical wishes and healthcare decisions</p>
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
      case 'continue':
        return <Badge variant="default" className="bg-green-600">Continue</Badge>;
      case 'discontinue':
        return <Badge variant="destructive">Discontinue</Badge>;
      case 'depends':
        return <Badge variant="secondary">Case by Case</Badge>;
      default:
        return <Badge variant="outline">{decision}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Healthcare Directives</h1>
          <p className="text-gray-600 mt-2">Manage your medical wishes and healthcare decisions</p>
        </div>
        <Button asChild>
          <Link to="/healthcare-directives/new">
            <Plus className="h-4 w-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completionItems.map((item) => item ? (
              <div 
                key={item.name} 
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  item.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className={item.completed ? 'font-medium' : 'text-gray-600'}>
                  {item.name}
                </span>
              </div>
            ) : null)}
          </div>
        </CardContent>
      </Card>

      {/* Living Will Details */}
      {directivesByType['living_will'] && directivesByType['living_will'].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileHeart className="h-5 w-5 mr-2" />
              Living Will
            </CardTitle>
            <CardDescription>
              Your wishes for end-of-life medical care
            </CardDescription>
          </CardHeader>
          <CardContent>
            {directivesByType['living_will'].map((directive) => directive ? (
              <div key={directive.id} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Life Sustaining Treatment</p>
                    {getDecisionBadge(directive.decisions?.lifeSustaining)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Artificial Nutrition</p>
                    {getDecisionBadge(directive.decisions?.artificialNutrition)}
                  </div>
                </div>
                
                {directive.decisions?.painManagement && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Pain Management Instructions</p>
                    <p className="text-sm text-gray-600">{directive.decisions.painManagement}</p>
                  </div>
                )}
                
                {directive.religiousPreferences && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Religious Preferences</p>
                    <p className="text-sm text-gray-600">{directive.religiousPreferences}</p>
                  </div>
                )}
                
                {directive.additionalInstructions && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Additional Instructions</p>
                    <p className="text-sm text-gray-600">{directive.additionalInstructions}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(directive.lastUpdated).toLocaleDateString()}
                  </p>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/healthcare-directives/${directive.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </div>
            ) : null)}
          </CardContent>
        </Card>
      )}

      {/* Healthcare Proxy */}
      {directivesByType['healthcare_proxy'] && directivesByType['healthcare_proxy'].length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              Healthcare Proxy
            </CardTitle>
            <CardDescription>
              Designated decision makers for medical care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {directivesByType['healthcare_proxy'].map((directive) => directive ? (
                <div key={directive.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{directive.personName || 'Not specified'}</p>
                    <Badge variant={directive.isPrimary ? "default" : "secondary"} className="mt-1">
                      {directive.isPrimary ? 'Primary' : 'Alternate'}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/healthcare-directives/${directive.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              ) : null)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Directives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DNR Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Do Not Resuscitate (DNR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {directivesByType['dnr'] && directivesByType['dnr'].length > 0 ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <p className="text-center text-green-600 font-medium">DNR Order Active</p>
                <p className="text-sm text-gray-600 text-center">
                  Last updated: {new Date(directivesByType['dnr'][0]?.lastUpdated || '').toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No DNR order on file</p>
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
              <Heart className="h-5 w-5 mr-2" />
              Organ Donation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {directivesByType['organ_donation'] && directivesByType['organ_donation'].length > 0 ? (
              <div className="space-y-2">
                {directivesByType['organ_donation'][0]?.decisions?.organDonation ? (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="text-center text-green-600 font-medium">Registered Organ Donor</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-center text-gray-600 font-medium">Not an Organ Donor</p>
                  </>
                )}
                <p className="text-sm text-gray-600 text-center">
                  Last updated: {new Date(directivesByType['organ_donation'][0]?.lastUpdated || '').toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No organ donation preference recorded</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {familyMembers.map((member) => member ? (
                <div key={member.id} className="border rounded-lg p-3">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.relationship}</p>
                  {member.healthcareRoles && member.healthcareRoles.some(role => role.type === 'healthcare_proxy') && (
                    <Badge variant="default" className="mt-2">Current Proxy</Badge>
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

export default function HealthcareDirectives() {
  return (
    <ErrorBoundary level="page">
      <HealthcareDirectivesContent />
    </ErrorBoundary>
  );
} 