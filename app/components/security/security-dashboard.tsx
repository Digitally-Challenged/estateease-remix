import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  FileText,
  Users,
  Activity,
  Clock,
} from "lucide-react";

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: "safe" | "warning" | "critical";
  lastUpdated: Date;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: "login_attempt" | "file_upload" | "data_access" | "session_anomaly";
  userId?: string;
  ipAddress: string;
  success: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  details: string;
}

interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "error";
  timestamp: Date;
  resolved: boolean;
}

export function SecurityDashboard() {
  const [metrics] = useState<SecurityMetric[]>([
    {
      id: "failed_logins",
      name: "Failed Login Attempts (24h)",
      value: 3,
      threshold: 10,
      status: "safe",
      lastUpdated: new Date(),
    },
    {
      id: "active_sessions",
      name: "Active Sessions",
      value: 12,
      threshold: 50,
      status: "safe",
      lastUpdated: new Date(),
    },
    {
      id: "file_uploads",
      name: "File Uploads (24h)",
      value: 8,
      threshold: 100,
      status: "safe",
      lastUpdated: new Date(),
    },
    {
      id: "suspicious_activity",
      name: "Suspicious Activity Score",
      value: 15,
      threshold: 70,
      status: "safe",
      lastUpdated: new Date(),
    },
  ]);

  const [alerts] = useState<SecurityAlert[]>([
    {
      id: "1",
      title: "Hardcoded Credentials Detected",
      description: "Default password hash found in database migration file",
      severity: "error",
      timestamp: new Date(),
      resolved: false,
    },
    {
      id: "2",
      title: "Weak Session Configuration",
      description: "Default session secret being used - update SESSION_SECRET environment variable",
      severity: "error",
      timestamp: new Date(),
      resolved: false,
    },
    {
      id: "3",
      title: "Missing Rate Limiting",
      description: "Authentication endpoints lack rate limiting protection",
      severity: "warning",
      timestamp: new Date(),
      resolved: false,
    },
  ]);

  const [recentEvents] = useState<SecurityEvent[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: "login_attempt",
      userId: "user-nick-001",
      ipAddress: "192.168.1.100",
      success: true,
      riskLevel: "low",
      details: "Successful login from known IP",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: "file_upload",
      userId: "user-nick-001",
      ipAddress: "192.168.1.100",
      success: true,
      riskLevel: "low",
      details: "Estate planning document uploaded (PDF, 2.3MB)",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: "data_access",
      userId: "user-nick-001",
      ipAddress: "192.168.1.100",
      success: true,
      riskLevel: "low",
      details: "Asset portfolio accessed",
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      info: "bg-blue-100 text-blue-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
    };
    return colors[severity as keyof typeof colors] || colors.info;
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[riskLevel as keyof typeof colors] || colors.low;
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  const unresolvedAlerts = alerts.filter((alert) => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter((alert) => alert.severity === "error");

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">MONITORING</div>
            <p className="text-muted-foreground text-xs">Agent coordination active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-muted-foreground text-xs">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">Currently authenticated users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">ELEVATED</div>
            <p className="text-muted-foreground text-xs">Due to unresolved vulnerabilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Security Alerts */}
      {unresolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Security Alerts
            </CardTitle>
            <CardDescription>
              {unresolvedAlerts.length} unresolved security issues requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unresolvedAlerts.map((alert) => (
                <Alert
                  key={alert.id}
                  variant={alert.severity === "error" ? "destructive" : "default"}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <AlertDescription className="font-medium">{alert.title}</AlertDescription>
                        <Badge className={getSeverityBadge(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <AlertDescription className="text-muted-foreground text-sm">
                        {alert.description}
                      </AlertDescription>
                      <AlertDescription className="text-muted-foreground mt-1 text-xs">
                        {formatTimestamp(alert.timestamp)}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Metrics
          </CardTitle>
          <CardDescription>Real-time security monitoring and threat detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {metrics.map((metric) => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(metric.value / metric.threshold) * 100} className="flex-1" />
                  <span className="text-muted-foreground text-sm">
                    {metric.value}/{metric.threshold}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Last updated: {formatTimestamp(metric.lastUpdated)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Latest authentication, access, and security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex-shrink-0">
                  {event.type === "login_attempt" && <Lock className="h-4 w-4" />}
                  {event.type === "file_upload" && <FileText className="h-4 w-4" />}
                  {event.type === "data_access" && <Eye className="h-4 w-4" />}
                  {event.type === "session_anomaly" && <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {event.type.replace("_", " ")}
                    </span>
                    <Badge className={getRiskLevelBadge(event.riskLevel)}>
                      {event.riskLevel.toUpperCase()}
                    </Badge>
                    {event.success ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{event.details}</p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-xs">
                    <span>IP: {event.ipAddress}</span>
                    {event.userId && <span>User: {event.userId}</span>}
                    <span>{formatTimestamp(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Coordination Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Agent Coordination Security
          </CardTitle>
          <CardDescription>
            Inter-agent communication and coordination security status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Memory encryption enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Agent authentication active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Audit logging enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
