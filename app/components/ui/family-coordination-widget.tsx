import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Progress } from "./loading/progress";
import {
  Users,
  Shield,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface FamilyCoordinationMetrics {
  totalFamilyMembers: number;
  relationshipBreakdown: Array<{
    relationship: string;
    count: number;
    email_coverage: number;
    phone_coverage: number;
  }>;
  contactCoverage: {
    email: number;
    phone: number;
  };
  roleCoverage: Array<{
    role: string;
    assigned: number;
    hasPrimary: boolean;
    hasSuccession: boolean;
  }>;
  emergencyReadiness: {
    totalContacts: number;
    medicalAuthority: number;
    decisionAuthority: number;
    avgPriority: number;
  };
  coordinationScore: number;
  recommendations: string[];
}

interface FamilyCoordinationWidgetProps {
  metrics: FamilyCoordinationMetrics;
  className?: string;
}

export function FamilyCoordinationWidget({ metrics, className }: FamilyCoordinationWidgetProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const criticalRoles = ["executor", "trustee", "power_of_attorney", "healthcare_proxy"];
  const roleCompleteness =
    (metrics.roleCoverage.filter((r) => r.hasPrimary).length / criticalRoles.length) * 100;

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Overall Coordination Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Family Coordination Score</CardTitle>
          <div
            className={`flex items-center space-x-1 ${getScoreColor(metrics.coordinationScore)}`}
          >
            {getScoreIcon(metrics.coordinationScore)}
            <span className="text-2xl font-bold">{metrics.coordinationScore}</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={metrics.coordinationScore} className="w-full" />
          <p className="mt-2 text-xs text-gray-600">
            Based on role assignments, contact coverage, and emergency readiness
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">
              Family Members
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalFamilyMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">
              Role Coverage
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(roleCompleteness)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">
              Email Coverage
            </CardTitle>
            <Mail className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contactCoverage.email}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-gray-600">
              Emergency Contacts
            </CardTitle>
            <Phone className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emergencyReadiness.totalContacts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Role Assignment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Critical Role Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalRoles.map((role) => {
              const roleInfo = metrics.roleCoverage.find((r) => r.role === role);
              const assigned = roleInfo?.assigned || 0;
              const hasPrimary = roleInfo?.hasPrimary || false;
              const hasSuccession = roleInfo?.hasSuccession || false;

              return (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium capitalize">{role.replace("_", " ")}</span>
                    {hasPrimary ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={hasPrimary ? "default" : "destructive"}>
                      {assigned} assigned
                    </Badge>
                    {hasSuccession && (
                      <Badge variant="outline" className="text-xs">
                        Succession
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contact Coverage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Contact Coverage by Relationship
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.relationshipBreakdown.map((rel) => (
              <div key={rel.relationship} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {rel.relationship.replace("_", " ")} ({rel.count})
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{Math.round(rel.email_coverage)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-xs">{Math.round(rel.phone_coverage)}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Progress value={rel.email_coverage} className="h-2" />
                  <Progress value={rel.phone_coverage} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Readiness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Emergency Readiness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Contacts</span>
                <Badge
                  variant={
                    metrics.emergencyReadiness.totalContacts >= 3 ? "default" : "destructive"
                  }
                >
                  {metrics.emergencyReadiness.totalContacts}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medical Authority</span>
                <Badge
                  variant={
                    metrics.emergencyReadiness.medicalAuthority > 0 ? "default" : "destructive"
                  }
                >
                  {metrics.emergencyReadiness.medicalAuthority}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Decision Authority</span>
                <Badge
                  variant={
                    metrics.emergencyReadiness.decisionAuthority > 0 ? "default" : "destructive"
                  }
                >
                  {metrics.emergencyReadiness.decisionAuthority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Priority</span>
                <Badge variant="outline">{metrics.emergencyReadiness.avgPriority}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {metrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Coordination Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
