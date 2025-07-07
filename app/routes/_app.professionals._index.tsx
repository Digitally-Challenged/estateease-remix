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
  Briefcase,
  Scale,
  Calculator,
  TrendingUp,
  Shield,
  AlertCircle,
  Star,
  Phone,
  Mail,
  Building2,
  Edit,
  Trash2
} from "lucide-react";
import { getProfessionals } from "~/lib/dal";
import type { Column } from "~/components/ui/data-table";

export async function loader() {
  try {
    const userId = 'user-nick-001';
    const professionals = await getProfessionals(userId);

    // Group by professional type
    const professionalsByType = {
      estate_attorney: professionals.filter(p => p?.type === 'estate_attorney'),
      tax_attorney: professionals.filter(p => p?.type === 'tax_attorney'),
      financial_advisor: professionals.filter(p => p?.type === 'financial_advisor'),
      accountant: professionals.filter(p => p?.type === 'accountant'),
      insurance_agent: professionals.filter(p => p?.type === 'insurance_agent'),
      other: professionals.filter(p => p?.type === 'other')
    };

    // Find preferred providers
    const preferredProviders = professionals.filter(p => p?.isPreferredProvider);

    // Check for missing key professionals
    const missingTypes = [];
    if (!professionalsByType.estate_attorney.length) missingTypes.push('Estate Attorney');
    if (!professionalsByType.financial_advisor.length) missingTypes.push('Financial Advisor');
    if (!professionalsByType.accountant.length) missingTypes.push('Accountant/CPA');

    return json({ 
      professionals,
      professionalsByType,
      preferredProviders,
      missingTypes,
      error: null 
    });
  } catch (error) {
    console.error('Failed to load professionals:', error);
    return json({ 
      professionals: [],
      professionalsByType: {
        estate_attorney: [],
        tax_attorney: [],
        financial_advisor: [],
        accountant: [],
        insurance_agent: [],
        other: []
      },
      preferredProviders: [],
      missingTypes: [],
      error: error instanceof Error ? error.message : 'Failed to load professionals' 
    }, { status: 500 });
  }
}

function ProfessionalsContent() {
  const { 
    professionals, 
    professionalsByType, 
    preferredProviders,
    missingTypes,
    error 
  } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Professional Team</h1>
          <p className="text-gray-600 mt-2">Manage your estate planning professional advisors</p>
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

  if (!professionals || professionals.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professional Team</h1>
            <p className="text-gray-600 mt-2">Manage your estate planning professional advisors</p>
          </div>
        </div>
        <Card className="text-center py-8">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No professionals added</h3>
            <p className="text-gray-600 mb-4">
              Build your estate planning team by adding trusted professionals
            </p>
            <Button onClick={() => navigate('/professionals/new')}>
              Add Professional
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getProfessionalIcon = (type: string) => {
    switch (type) {
      case 'estate_attorney':
      case 'tax_attorney':
        return <Scale className="h-5 w-5 text-gray-400" />;
      case 'financial_advisor':
        return <TrendingUp className="h-5 w-5 text-gray-400" />;
      case 'accountant':
        return <Calculator className="h-5 w-5 text-gray-400" />;
      case 'insurance_agent':
        return <Shield className="h-5 w-5 text-gray-400" />;
      default:
        return <Briefcase className="h-5 w-5 text-gray-400" />;
    }
  };

  const columns: Column<typeof professionals[0]>[] = [
    {
      key: 'name',
      header: 'Professional',
      render: (professional) => (
        <div className="flex items-start space-x-3">
          {getProfessionalIcon(professional?.type || '')}
          <div>
            <p className="font-medium flex items-center">
              {professional?.name}
              {professional?.isPreferredProvider && (
                <Star className="h-4 w-4 text-yellow-500 ml-2" fill="currentColor" />
              )}
            </p>
            {professional?.firm && (
              <p className="text-sm text-gray-600">{professional.firm}</p>
            )}
            {professional?.title && (
              <p className="text-sm text-gray-500">{professional.title}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (professional) => {
        const typeLabels: Record<string, string> = {
          estate_attorney: 'Estate Attorney',
          tax_attorney: 'Tax Attorney',
          financial_advisor: 'Financial Advisor',
          accountant: 'CPA/Accountant',
          insurance_agent: 'Insurance Agent',
          other: 'Other'
        };
        return (
          <Badge variant="outline">
            {typeLabels[professional?.type || 'other'] || professional?.type}
          </Badge>
        );
      }
    },
    {
      key: 'specializations',
      header: 'Specializations',
      render: (professional) => (
        <div className="text-sm">
          {professional?.specializations && professional.specializations.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {professional.specializations.slice(0, 2).map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
              {professional.specializations.length > 2 && (
                <span className="text-gray-500 text-xs">
                  +{professional.specializations.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">None specified</span>
          )}
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (professional) => (
        <div className="text-sm space-y-1">
          {professional?.contactInfo?.primaryPhone && (
            <div className="flex items-center space-x-1">
              <Phone className="h-3 w-3 text-gray-400" />
              <span>{professional.contactInfo.primaryPhone}</span>
            </div>
          )}
          {professional?.contactInfo?.email && (
            <div className="flex items-center space-x-1">
              <Mail className="h-3 w-3 text-gray-400" />
              <span>{professional.contactInfo.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'experience',
      header: 'Experience',
      render: (professional) => (
        <span className="text-sm">
          {professional?.yearsExperience 
            ? `${professional.yearsExperience} years`
            : '-'
          }
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (professional) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/professionals/${professional?.id}/edit`)}
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
          <h1 className="text-3xl font-bold text-gray-900">Professional Team</h1>
          <p className="text-gray-600 mt-2">Manage your estate planning professional advisors</p>
        </div>
        <Button onClick={() => navigate('/professionals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Professional
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Professionals</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionals.length}</div>
            <p className="text-xs text-gray-600 mt-1">In your team</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attorneys</CardTitle>
            <Scale className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {professionalsByType.estate_attorney.length + professionalsByType.tax_attorney.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Legal advisors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Team</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {professionalsByType.financial_advisor.length + professionalsByType.accountant.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Financial experts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferred</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preferredProviders.length}</div>
            <p className="text-xs text-gray-600 mt-1">Preferred providers</p>
          </CardContent>
        </Card>
      </div>

      {/* Missing Professionals Warning */}
      {missingTypes.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Key Professionals Missing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              Consider adding these essential professionals to your estate planning team:
            </p>
            <ul className="list-disc list-inside text-orange-700 space-y-1">
              {missingTypes.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/professionals/new')}
            >
              Add Professional
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Professional Categories */}
      {professionalsByType.estate_attorney.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Estate Planning Attorneys
            </CardTitle>
            <CardDescription>Legal experts specializing in wills, trusts, and estate planning</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionalsByType.estate_attorney as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {professionalsByType.tax_attorney.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="h-5 w-5 mr-2" />
              Tax Attorneys
            </CardTitle>
            <CardDescription>Specialists in tax planning and estate tax strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionalsByType.tax_attorney as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {professionalsByType.financial_advisor.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Financial Advisors
            </CardTitle>
            <CardDescription>Wealth management and investment planning professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionalsByType.financial_advisor as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {professionalsByType.accountant.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              CPAs & Accountants
            </CardTitle>
            <CardDescription>Tax preparation and financial reporting experts</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionalsByType.accountant as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {professionalsByType.insurance_agent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Insurance Agents
            </CardTitle>
            <CardDescription>Life insurance and risk management specialists</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionalsByType.insurance_agent as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {professionalsByType.other.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Professionals</CardTitle>
            <CardDescription>Additional advisors and specialists</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionalsByType.other as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
            />
          </CardContent>
        </Card>
      )}

      {/* All Professionals (if not categorized) */}
      {professionals.length > 0 && 
       Object.values(professionalsByType).every(p => p.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle>All Professionals</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={professionals as Record<string, unknown>[]}
              columns={columns as Column<Record<string, unknown>>[]}
              sortable={true}
              pagination={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Preferred Providers */}
      {preferredProviders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" fill="currentColor" />
              Preferred Providers
            </CardTitle>
            <CardDescription>Your trusted professional partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preferredProviders.map((professional) => professional ? (
                <div key={professional.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{professional.name}</p>
                      {professional.firm && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Building2 className="h-3 w-3 mr-1" />
                          {professional.firm}
                        </p>
                      )}
                      <Badge variant="outline" className="mt-2">
                        {professional.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-600">
                    {professional.contactInfo?.primaryPhone && (
                      <p className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {professional.contactInfo.primaryPhone}
                      </p>
                    )}
                    {professional.contactInfo?.email && (
                      <p className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {professional.contactInfo.email}
                      </p>
                    )}
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

export default function Professionals() {
  return (
    <ErrorBoundary level="page">
      <ProfessionalsContent />
    </ErrorBoundary>
  );
} 