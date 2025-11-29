/**
 * Data Integration Monitoring Dashboard Component
 * Real-time monitoring of data flows, agent coordination, and system health
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Progress } from "./loading/progress";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Activity,
  Database,
  Wifi,
  AlertCircle,
  Clock,
  Server,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";

// Mock data interfaces (in real implementation, these would come from the engines)
interface DataIntegrationStatus {
  sources: {
    total: number;
    active: number;
    failed: number;
  };
  pipelines: {
    total: number;
    running: number;
    failed: number;
  };
  agents: {
    total: number;
    synchronized: number;
    pending: number;
  };
  quality: {
    score: number;
    alerts: number;
    metrics: number;
  };
  cache: {
    size: number;
    hitRate: number;
    lastUpdate: number;
  };
}

interface SyncMetrics {
  totalEvents: number;
  averageLatency: number;
  throughput: number;
  errorRate: number;
  agentHealth: {
    healthy: number;
    degraded: number;
    failed: number;
  };
  channelActivity: Array<{
    id: string;
    name: string;
    eventCount: number;
    isActive: boolean;
  }>;
}

interface APIIntegrationStatus {
  providers: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    lastUpdate: number;
    requestsToday: number;
    rateLimitRemaining: number;
  }>;
  cache: {
    size: number;
    hitRate: number;
  };
  totalRequests: number;
  activeProviders: number;
}

interface AgentSyncState {
  agentId: string;
  lastSync: number;
  pendingEvents: number;
  syncHealth: "healthy" | "degraded" | "failed";
  latency: number;
  throughput: number;
}

export function DataIntegrationMonitor() {
  const [integrationStatus, setIntegrationStatus] = useState<DataIntegrationStatus | null>(null);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics | null>(null);
  const [apiStatus, setApiStatus] = useState<APIIntegrationStatus | null>(null);
  const [agentStates, setAgentStates] = useState<AgentSyncState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const fetchMockData = () => {
      setIntegrationStatus({
        sources: { total: 8, active: 6, failed: 2 },
        pipelines: { total: 5, running: 4, failed: 1 },
        agents: { total: 12, synchronized: 10, pending: 2 },
        quality: { score: 87, alerts: 3, metrics: 45 },
        cache: { size: 1024, hitRate: 82, lastUpdate: Date.now() - 5000 },
      });

      setSyncMetrics({
        totalEvents: 2847,
        averageLatency: 124,
        throughput: 15.3,
        errorRate: 2.1,
        agentHealth: { healthy: 9, degraded: 2, failed: 1 },
        channelActivity: [
          { id: "financial-data", name: "Financial Data Updates", eventCount: 156, isActive: true },
          { id: "market-data", name: "Market Data Stream", eventCount: 892, isActive: true },
          { id: "coordination", name: "Agent Coordination", eventCount: 45, isActive: true },
          { id: "quality-alerts", name: "Quality Alerts", eventCount: 12, isActive: true },
        ],
      });

      setApiStatus({
        providers: [
          {
            id: "alpha-vantage",
            name: "Alpha Vantage",
            type: "market",
            status: "active",
            lastUpdate: Date.now() - 120000,
            requestsToday: 247,
            rateLimitRemaining: 253,
          },
          {
            id: "irs-api",
            name: "IRS Tax Data",
            type: "tax",
            status: "active",
            lastUpdate: Date.now() - 3600000,
            requestsToday: 12,
            rateLimitRemaining: 988,
          },
          {
            id: "zillow",
            name: "Zillow Real Estate",
            type: "valuation",
            status: "rate_limited",
            lastUpdate: Date.now() - 7200000,
            requestsToday: 100,
            rateLimitRemaining: 0,
          },
          {
            id: "sec-edgar",
            name: "SEC EDGAR",
            type: "legal",
            status: "active",
            lastUpdate: Date.now() - 900000,
            requestsToday: 34,
            rateLimitRemaining: 9966,
          },
        ],
        cache: { size: 512, hitRate: 73 },
        totalRequests: 393,
        activeProviders: 3,
      });

      setAgentStates([
        {
          agentId: "financial-analyst",
          lastSync: Date.now() - 30000,
          pendingEvents: 3,
          syncHealth: "healthy",
          latency: 89,
          throughput: 12.4,
        },
        {
          agentId: "portfolio-optimizer",
          lastSync: Date.now() - 45000,
          pendingEvents: 1,
          syncHealth: "healthy",
          latency: 156,
          throughput: 8.7,
        },
        {
          agentId: "market-analyst",
          lastSync: Date.now() - 15000,
          pendingEvents: 0,
          syncHealth: "healthy",
          latency: 67,
          throughput: 23.1,
        },
        {
          agentId: "tax-specialist",
          lastSync: Date.now() - 120000,
          pendingEvents: 5,
          syncHealth: "degraded",
          latency: 234,
          throughput: 3.2,
        },
        {
          agentId: "risk-analyst",
          lastSync: Date.now() - 60000,
          pendingEvents: 2,
          syncHealth: "healthy",
          latency: 112,
          throughput: 9.8,
        },
        {
          agentId: "coordination-manager",
          lastSync: Date.now() - 600000,
          pendingEvents: 0,
          syncHealth: "failed",
          latency: 0,
          throughput: 0,
        },
      ]);

      setIsLoading(false);
      setLastRefresh(Date.now());
    };

    fetchMockData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMockData, 10000); // Refresh every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Trigger data refresh
    setTimeout(() => {
      setLastRefresh(Date.now());
      setIsLoading(false);
    }, 1000);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      error: "bg-red-100 text-red-800",
      rate_limited: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.inactive}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading integration status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Integration Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of data flows and agent coordination
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground text-sm">
            Last updated: {formatTimeAgo(lastRefresh)}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="mr-2 h-4 w-4" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrationStatus?.sources.active}/{integrationStatus?.sources.total}
            </div>
            <p className="text-muted-foreground text-xs">
              {integrationStatus?.sources.failed} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Health</CardTitle>
            <Server className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncMetrics?.agentHealth.healthy}/
              {syncMetrics
                ? syncMetrics.agentHealth.healthy +
                  syncMetrics.agentHealth.degraded +
                  syncMetrics.agentHealth.failed
                : 0}
            </div>
            <p className="text-muted-foreground text-xs">
              {syncMetrics?.agentHealth.degraded} degraded, {syncMetrics?.agentHealth.failed} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <BarChart3 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStatus?.quality.score}%</div>
            <Progress value={integrationStatus?.quality.score} className="mt-2" />
            <p className="text-muted-foreground mt-1 text-xs">
              {integrationStatus?.quality.alerts} active alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Performance</CardTitle>
            <Zap className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStatus?.cache.hitRate}%</div>
            <Progress value={integrationStatus?.cache.hitRate} className="mt-2" />
            <p className="text-muted-foreground mt-1 text-xs">
              {integrationStatus?.cache.size} items cached
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {integrationStatus && integrationStatus.quality.alerts > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {integrationStatus.quality.alerts} data quality alerts require attention. Check the
            quality monitoring section for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Monitoring Tabs */}
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sync">Real-time Sync</TabsTrigger>
          <TabsTrigger value="agents">Agent Status</TabsTrigger>
          <TabsTrigger value="apis">API Integrations</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        {/* Real-time Sync Tab */}
        <TabsContent value="sync" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Sync Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Events</span>
                    <span className="text-sm">{syncMetrics?.totalEvents.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average Latency</span>
                    <span className="text-sm">{syncMetrics?.averageLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Throughput</span>
                    <span className="text-sm">{syncMetrics?.throughput} events/sec</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Error Rate</span>
                    <span className="text-sm">{syncMetrics?.errorRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="mr-2 h-5 w-5" />
                  Channel Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncMetrics?.channelActivity.map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${channel.isActive ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <span className="text-sm font-medium">{channel.name}</span>
                      </div>
                      <Badge variant="secondary">{channel.eventCount}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Status Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Synchronization Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentStates.map((agent) => (
                  <div
                    key={agent.agentId}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${getHealthColor(agent.syncHealth)}`} />
                      <div>
                        <h4 className="font-medium">{agent.agentId}</h4>
                        <p className="text-muted-foreground text-sm">
                          Last sync: {formatTimeAgo(agent.lastSync)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="font-medium">{agent.pendingEvents}</span> pending
                      </div>
                      <div className="text-muted-foreground text-xs">{agent.latency}ms latency</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Integrations Tab */}
        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External API Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiStatus?.providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-muted-foreground text-sm capitalize">
                          {provider.type} • {formatTimeAgo(provider.lastUpdate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right text-sm">
                        <div>{provider.requestsToday} requests today</div>
                        <div className="text-muted-foreground">
                          {provider.rateLimitRemaining} remaining
                        </div>
                      </div>
                      {getStatusBadge(provider.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Completeness</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Timeliness</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Consistency</span>
                      <span>84%</span>
                    </div>
                    <Progress value={84} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 rounded-lg bg-yellow-50 p-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <div className="text-sm">
                      <div className="font-medium">High latency detected</div>
                      <div className="text-muted-foreground">
                        Market data feed experiencing delays
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <div className="text-sm">
                      <div className="font-medium">Data validation failed</div>
                      <div className="text-muted-foreground">
                        Invalid tax rate data from IRS API
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg bg-yellow-50 p-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <div className="text-sm">
                      <div className="font-medium">Rate limit approaching</div>
                      <div className="text-muted-foreground">Zillow API at 95% of daily limit</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
