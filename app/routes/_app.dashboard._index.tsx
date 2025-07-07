import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DollarSign, TrendingUp, Building, Users, PieChart, Activity } from "lucide-react";
import { getDashboardStats, getRecentAssets, getTrusts, getAssets } from "~/lib/dal";
import { calculateAssetAllocation } from "~/lib/financial-calculations";
import { AssetAllocationChart, NetWorthTrendChart } from "~/components/ui/charts";
import { formatCurrency } from "~/utils/format";

export async function loader() {
  // For now, we'll use the default user ID from the seed data
  const userId = 'user-nick-001';
  
  const [dashboardStats, recentAssets, trusts, assets] = await Promise.all([
    getDashboardStats(userId),
    getRecentAssets(userId, 4),
    getTrusts(userId),
    getAssets(userId)
  ]);

  // Calculate asset allocation for the pie chart
  const assetAllocation = calculateAssetAllocation(assets);
  
  // Convert allocation to chart data format
  const allocationChartData = Object.entries(assetAllocation).map(([name, data]) => ({
    name,
    value: data.value,
    percentage: data.percentage,
    count: data.count
  }));

  // Generate mock net worth trend data (in production, this would come from historical data)
  const currentMonth = new Date().getMonth();
  const netWorthTrendData = Array.from({ length: 6 }, (_, i) => {
    const monthOffset = 5 - i;
    const month = new Date();
    month.setMonth(currentMonth - monthOffset);
    const baseValue = dashboardStats.totalNetWorth * (0.95 + (i * 0.01)); // Simulating growth
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      netWorth: Math.round(baseValue),
      assets: Math.round(baseValue * 1.1),
      liabilities: Math.round(baseValue * 0.1)
    };
  });

  return json({
    dashboardStats,
    recentAssets,
    trusts: trusts.filter(t => t.isActive),
    allocationChartData,
    netWorthTrendData
  });
}

export default function Dashboard() {
  const { dashboardStats, recentAssets, trusts, allocationChartData, netWorthTrendData } = useLoaderData<typeof loader>();
  
  // Calculate percentage changes (mock for now)
  const calculateChange = (current: number, previous?: number) => {
    if (!previous) return { value: "+2.3%", type: "positive" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      type: change >= 0 ? "positive" as const : "negative" as const
    };
  };

  const netWorthChange = calculateChange(dashboardStats.totalNetWorth);
  const realEstateChange = calculateChange(dashboardStats.realEstateValue);
  const investmentChange = calculateChange(dashboardStats.investmentValue);

  const stats = [
    {
      title: "Total Net Worth",
      value: formatCurrency(dashboardStats.totalNetWorth),
      change: netWorthChange.value,
      changeType: netWorthChange.type,
      icon: DollarSign,
    },
    {
      title: "Real Estate Value",
      value: formatCurrency(dashboardStats.realEstateValue),
      change: realEstateChange.value,
      changeType: realEstateChange.type,
      icon: Building,
    },
    {
      title: "Investment Accounts",
      value: formatCurrency(dashboardStats.investmentValue),
      change: investmentChange.value,
      changeType: investmentChange.type,
      icon: TrendingUp,
    },
    {
      title: "Active Trusts",
      value: trusts.length.toString(),
      change: "No change",
      changeType: "neutral" as const,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Nicholas</h1>
        <p className="text-gray-600">Here&apos;s an overview of your estate planning portfolio.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing your estate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <h3 className="font-medium text-gray-900">Add New Asset</h3>
              <p className="text-sm text-gray-600 mt-1">Record a new property, account, or investment</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <h3 className="font-medium text-gray-900">Update Beneficiaries</h3>
              <p className="text-sm text-gray-600 mt-1">Modify trust and account beneficiaries</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <h3 className="font-medium text-gray-900">Schedule Review</h3>
              <p className="text-sm text-gray-600 mt-1">Book a meeting with your estate planning team</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assets</CardTitle>
          <CardDescription>Your most recently updated assets and accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-600">{asset.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(asset.value)}</p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Worth Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              Net Worth Trend
            </CardTitle>
            <CardDescription>Your net worth over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <NetWorthTrendChart data={netWorthTrendData} height={250} />
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 text-green-600 mr-2" />
              Asset Allocation
            </CardTitle>
            <CardDescription>Distribution of your assets by category</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetAllocationChart data={allocationChartData} height={250} showLegend={true} />
          </CardContent>
        </Card>
      </div>

      {/* Trust Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trust Status</CardTitle>
            <CardDescription>Overview of your active trusts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trusts.map((trust) => (
                <div key={trust.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{trust.name}</span>
                  <span className={`text-sm ${
                    trust.type === 'revocable' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {trust.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Estate planning items that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Annual trust review due in 3 months</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Insurance policy renewal - March 2024</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Estate plan updated successfully</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}