import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import { 
  Clock,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { getTrusts, getBeneficiaries, getLegalRoles, getAssets } from "~/lib/dal";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    
    const [trusts, beneficiaries, legalRoles, assets] = await Promise.all([
      getTrusts(userId),
      getBeneficiaries(userId),
      getLegalRoles(userId),
      getAssets(userId)
    ]);

    // Calculate succession timeline phases
    const phases = [
      {
        name: 'Current Estate',
        status: 'active',
        description: 'Present asset ownership and management',
        items: [
          { type: 'assets', count: assets.length, label: 'Total Assets' },
          { type: 'trusts', count: trusts.length, label: 'Active Trusts' }
        ]
      },
      {
        name: 'First Transfer',
        status: beneficiaries.filter(b => b?.isPrimary).length > 0 ? 'ready' : 'incomplete',
        description: 'Primary beneficiary distributions',
        items: [
          { 
            type: 'beneficiaries', 
            count: beneficiaries.filter(b => b?.isPrimary).length, 
            label: 'Primary Beneficiaries' 
          },
          {
            type: 'percentage',
            count: beneficiaries.filter(b => b?.isPrimary).reduce((sum, b) => sum + (b?.percentage || 0), 0),
            label: '% Allocated'
          }
        ]
      },
      {
        name: 'Contingent Transfer',
        status: beneficiaries.filter(b => b?.isContingent).length > 0 ? 'ready' : 'incomplete',
        description: 'Backup beneficiary distributions',
        items: [
          { 
            type: 'beneficiaries', 
            count: beneficiaries.filter(b => b?.isContingent).length, 
            label: 'Contingent Beneficiaries' 
          }
        ]
      },
      {
        name: 'Administration',
        status: legalRoles.filter(r => r?.roleType === 'executor').length > 0 ? 'ready' : 'incomplete',
        description: 'Estate settlement process',
        items: [
          { 
            type: 'executor', 
            count: legalRoles.filter(r => r?.roleType === 'executor').length, 
            label: 'Executors' 
          },
          {
            type: 'trustee',
            count: legalRoles.filter(r => r?.roleType === 'trustee').length,
            label: 'Trustees'
          }
        ]
      }
    ];

    // Calculate readiness score
    const readyPhases = phases.filter(p => p.status === 'ready' || p.status === 'active').length;
    const readinessScore = Math.round((readyPhases / phases.length) * 100);

    // Group assets by ownership for succession flow
    const assetsByOwnership = assets.reduce((acc, asset) => {
      if (!asset) return acc;
      const ownershipType = asset.ownership?.type || 'unknown';
      if (!acc[ownershipType]) {
        acc[ownershipType] = [];
      }
      acc[ownershipType].push(asset);
      return acc;
    }, {} as Record<string, typeof assets>);

    return json({ 
      trusts,
      beneficiaries,
      legalRoles,
      assets,
      phases,
      readinessScore,
      assetsByOwnership,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load succession planning data:', error);
    return json({ 
      trusts: [],
      beneficiaries: [],
      legalRoles: [],
      assets: [],
      phases: [],
      readinessScore: 0,
      assetsByOwnership: {},
      error: error instanceof Error ? error.message : 'Failed to load succession planning data' 
    }, { status: 500 });
  }
}

function SuccessionPlanningContent() {
  const { 
    trusts,
    beneficiaries,
    legalRoles,
    assets,
    phases,
    readinessScore,
    assetsByOwnership,
    error 
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Succession Planning</h1>
          <p className="text-gray-600 mt-2">Visualize your estate succession timeline and transfer process</p>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalEstateValue = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
  const primaryBeneficiaries = beneficiaries.filter(b => b?.isPrimary);
  const contingentBeneficiaries = beneficiaries.filter(b => b?.isContingent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Succession Planning</h1>
        <p className="text-gray-600 mt-2">Visualize your estate succession timeline and transfer process</p>
      </div>

      {/* Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succession Readiness</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readinessScore}%</div>
            <p className="text-xs text-gray-600 mt-1">
              {readinessScore >= 75 ? 'Well prepared' : readinessScore >= 50 ? 'Partially ready' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estate Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstateValue)}</div>
            <p className="text-xs text-gray-600 mt-1">Across {assets.length} assets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficiaries.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {primaryBeneficiaries.length} primary, {contingentBeneficiaries.length} contingent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Succession Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Succession Timeline</CardTitle>
          <CardDescription>
            Visual representation of your estate transfer process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {phases.map((phase, index) => (
              <div key={phase.name} className="relative">
                {index < phases.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300" />
                )}
                
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    phase.status === 'active' ? 'bg-blue-100 text-blue-600' :
                    phase.status === 'ready' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {phase.status === 'active' ? <Clock className="h-5 w-5" /> :
                     phase.status === 'ready' ? <CheckCircle className="h-5 w-5" /> :
                     <AlertCircle className="h-5 w-5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-lg">{phase.name}</h3>
                      <Badge variant={
                        phase.status === 'active' ? 'default' :
                        phase.status === 'ready' ? 'default' :
                        'secondary'
                      }>
                        {phase.status === 'active' ? 'Current' :
                         phase.status === 'ready' ? 'Ready' :
                         'Incomplete'}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{phase.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {phase.items.map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-2xl font-bold text-gray-900">
                            {item.type === 'percentage' ? `${item.count}%` : item.count}
                          </p>
                          <p className="text-sm text-gray-600">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asset Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Distribution Flow</CardTitle>
          <CardDescription>
            How your assets will be distributed to beneficiaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Trust Assets */}
            {assetsByOwnership['TRUST'] && assetsByOwnership['TRUST'].length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Trust-Owned Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900">Assets in Trust</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {assetsByOwnership['TRUST'].length}
                    </p>
                    <p className="text-sm text-blue-700">
                      {formatCurrency(assetsByOwnership['TRUST'].reduce((sum, a) => sum + (a?.value || 0), 0))}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900">Trust Beneficiaries</p>
                    {trusts.map((trust) => trust ? (
                      <p key={trust.id} className="text-sm text-green-700">
                        {trust.name}: {trust.beneficiaries?.length || 0} beneficiaries
                      </p>
                    ) : null)}
                  </div>
                </div>
              </div>
            )}

            {/* Individual Assets */}
            {assetsByOwnership['INDIVIDUAL'] && assetsByOwnership['INDIVIDUAL'].length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Individually-Owned Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-orange-900">Individual Assets</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {assetsByOwnership['INDIVIDUAL'].length}
                    </p>
                    <p className="text-sm text-orange-700">
                      {formatCurrency(assetsByOwnership['INDIVIDUAL'].reduce((sum, a) => sum + (a?.value || 0), 0))}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-purple-900">Will Beneficiaries</p>
                    <p className="text-sm text-purple-700">
                      Distributed according to will provisions
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Joint Assets */}
            {assetsByOwnership['JOINT'] && assetsByOwnership['JOINT'].length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Jointly-Owned Assets
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-indigo-900">Joint Assets</p>
                    <p className="text-2xl font-bold text-indigo-900">
                      {assetsByOwnership['JOINT'].length}
                    </p>
                    <p className="text-sm text-indigo-700">
                      {formatCurrency(assetsByOwnership['JOINT'].reduce((sum, a) => sum + (a?.value || 0), 0))}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">Surviving Owner</p>
                    <p className="text-sm text-gray-700">
                      Passes automatically by survivorship
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Roles in Succession */}
      <Card>
        <CardHeader>
          <CardTitle>Key Roles in Estate Administration</CardTitle>
          <CardDescription>
            People responsible for managing the succession process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalRoles.filter(r => r && ['executor', 'trustee', 'successor_trustee'].includes(r.roleType)).map((role) => role ? (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{role.personName}</p>
                    <p className="text-sm text-gray-600 capitalize">{role.roleType.replace('_', ' ')}</p>
                  </div>
                  <Badge variant={role.isPrimary ? "default" : "secondary"}>
                    {role.isPrimary ? 'Primary' : 'Alternate'}
                  </Badge>
                </div>
                {role.specificPowers && role.specificPowers.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {role.specificPowers.length} specific powers granted
                  </p>
                )}
              </div>
            ) : null)}
          </div>
          
          {legalRoles.filter(r => r && ['executor', 'trustee'].includes(r.roleType)).length === 0 && (
            <div className="text-center py-8 bg-orange-50 rounded-lg">
              <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-3" />
              <p className="text-orange-800 font-medium">No Executor or Trustee Assigned</p>
              <p className="text-sm text-orange-600 mt-1">
                Assign key roles to ensure smooth estate administration
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessionPlanning() {
  return (
    <ErrorBoundary level="page">
      <SuccessionPlanningContent />
    </ErrorBoundary>
  );
} 