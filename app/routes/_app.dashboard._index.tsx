import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Building from "lucide-react/dist/esm/icons/building";
import Users from "lucide-react/dist/esm/icons/users";
import PieChart from "lucide-react/dist/esm/icons/pie-chart";
import Activity from "lucide-react/dist/esm/icons/activity";
import { getDashboardStats, getRecentAssets, getTrusts, getAssets } from "~/lib/dal";
import { calculateAssetAllocation } from "~/lib/financial-calculations";
import { AssetAllocationChart, NetWorthTrendChart } from "~/components/ui/charts";
import { formatCurrency } from "~/utils/format";
import { requireUser } from "~/lib/auth.server";

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;

  const dashboardStats = getDashboardStats(userId);
  const recentAssets = getRecentAssets(userId, 4);
  const trusts = getTrusts(userId);
  const assets = getAssets(userId);

  // Calculate asset allocation for the pie chart
  const assetAllocation = calculateAssetAllocation(assets);

  // Convert allocation to chart data format
  const allocationChartData = Object.entries(assetAllocation).map(([name, data]) => ({
    name,
    value: data.value,
    percentage: data.percentage,
    count: data.count,
  }));

  // Generate mock net worth trend data (in production, this would come from historical data)
  const currentMonth = new Date().getMonth();
  const netWorthTrendData = Array.from({ length: 6 }, (_, i) => {
    const monthOffset = 5 - i;
    const month = new Date();
    month.setMonth(currentMonth - monthOffset);
    const baseValue = dashboardStats.totalNetWorth * (0.95 + i * 0.01); // Simulating growth

    return {
      month: month.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      netWorth: Math.round(baseValue),
      assets: Math.round(baseValue * 1.1),
      liabilities: Math.round(baseValue * 0.1),
    };
  });

  return json({
    dashboardStats,
    recentAssets,
    trusts: trusts.filter((t) => t.isActive),
    allocationChartData,
    netWorthTrendData,
  });
}

export default function Dashboard() {
  const { dashboardStats, recentAssets, trusts, allocationChartData, netWorthTrendData } =
    useLoaderData<typeof loader>();

  // Calculate percentage changes (mock for now)
  const calculateChange = (current: number, previous?: number) => {
    if (!previous) return { value: "+2.3%", type: "positive" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
      type: change >= 0 ? ("positive" as const) : ("negative" as const),
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, Nicholas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your estate planning portfolio.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </div>
                <p
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "text-green-600 dark:text-green-400"
                      : stat.changeType === "negative"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-400 dark:text-gray-500"
                  }`}
                >
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Add New Asset</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Record a new property, account, or investment
              </p>
            </button>
            <button className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Update Beneficiaries</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Modify trust and account beneficiaries
              </p>
            </button>
            <button className="rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Schedule Review</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Book a meeting with your estate planning team
              </p>
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
              <div
                key={asset.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{asset.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{asset.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(asset.value)}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">Active</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Visualizations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Net Worth Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
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
              <PieChart className="mr-2 h-5 w-5 text-green-600 dark:text-green-400" />
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trust Status</CardTitle>
            <CardDescription>Overview of your active trusts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trusts.map((trust) => (
                <div key={trust.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{trust.name}</span>
                  <span
                    className={`text-sm ${
                      trust.type === "revocable"
                        ? "text-green-600 dark:text-green-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
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
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm">Annual trust review due in 3 months</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Insurance policy renewal - March 2024</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Estate plan updated successfully</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
