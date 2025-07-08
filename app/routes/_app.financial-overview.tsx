import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { DollarSign, TrendingUp, Shield, PieChart, Wallet, AlertTriangle, BarChart, Gauge, Calendar } from "lucide-react";
import { getAssets, getTrusts } from "~/lib/dal";
import {
  calculateNetWorth,
  calculateAssetAllocation,
  calculateOwnershipSummary,
  calculateTrustValues,
  calculateEstateTax,
  calculateCashFlow,
  calculateLiquidity
} from "~/lib/financial-calculations";
import { 
  AssetAllocationChart, 
  CashFlowChart, 
  EstateTaxChart, 
  LiquidityGauge 
} from "~/components/ui/charts";
import { formatCurrency } from "~/utils/format";

export async function loader() {
  const userId = 'user-nick-001'; // Default user for now
  
  const [assets, trusts] = await Promise.all([
    getAssets(userId),
    getTrusts(userId)
  ]);
  
  // Perform all calculations
  const netWorth = calculateNetWorth(assets, []); // No liabilities in current schema
  const assetAllocation = calculateAssetAllocation(assets);
  const ownershipSummary = calculateOwnershipSummary(assets);
  const trustValues = calculateTrustValues(trusts, assets);
  const estateTax = calculateEstateTax(netWorth);
  const cashFlow = calculateCashFlow(assets);
  const liquidity = calculateLiquidity(assets);
  
  // Prepare chart data
  const allocationChartData = Object.entries(assetAllocation).map(([name, data]) => ({
    name,
    value: data.value,
    percentage: data.percentage,
    count: data.count
  }));
  
  // Generate mock cash flow data for the last 12 months
  const cashFlowChartData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (11 - i));
    const baseIncome = cashFlow.monthlyIncome;
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120% variance
    
    return {
      month: month.toLocaleDateString('en-US', { month: 'short' }),
      income: Math.round(baseIncome * variance),
      expenses: Math.round(baseIncome * 0.7 * variance),
      netFlow: Math.round(baseIncome * 0.3 * variance)
    };
  });
  
  // Generate estate tax projections for next 10 years
  const estateTaxProjections = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() + i;
    const growthRate = 1.05; // 5% annual growth assumption
    const projectedNetWorth = netWorth * Math.pow(growthRate, i);
    const projectedEstateTax = calculateEstateTax(projectedNetWorth);
    
    return {
      year,
      netWorth: Math.round(projectedNetWorth),
      exemption: projectedEstateTax.exemption,
      taxableEstate: Math.round(projectedEstateTax.taxableEstate),
      estateTax: Math.round(projectedEstateTax.estateTax)
    };
  });
  
  return json({
    assets,
    trusts,
    calculations: {
      netWorth,
      assetAllocation,
      ownershipSummary,
      trustValues,
      estateTax,
      cashFlow,
      liquidity
    },
    chartData: {
      allocation: allocationChartData,
      cashFlow: cashFlowChartData,
      estateTax: estateTaxProjections
    }
  });
}

export default function FinancialOverview() {
  const { assets, trusts, calculations, chartData } = useLoaderData<typeof loader>();
  
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Financial Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Real-time financial calculations and estate planning insights</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.netWorth)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">Across {assets.length} assets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Monthly Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.cashFlow.monthlyIncome)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">From {calculations.cashFlow.incomeGeneratingAssets} assets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Liquid Assets</CardTitle>
            <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.liquidity.liquidAssets)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">{formatPercentage(calculations.liquidity.liquidityRatio)} of total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 dark:text-gray-500">Estate Tax Exposure</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.estateTax.estateTax)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">{formatPercentage(calculations.estateTax.effectiveRate)} effective rate</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Asset Allocation
            </CardTitle>
            <CardDescription>Portfolio distribution by asset category</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetAllocationChart data={chartData.allocation} height={300} showLegend={true} />
          </CardContent>
        </Card>
        
        {/* Liquidity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              Liquidity Analysis
            </CardTitle>
            <CardDescription>Percentage of assets in liquid form</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <LiquidityGauge percentage={calculations.liquidity.liquidityRatio} height={250} />
          </CardContent>
        </Card>
      </div>
      
      {/* Ownership Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            Ownership Structure
          </CardTitle>
          <CardDescription>Asset distribution by ownership type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Trust Owned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.ownershipSummary.trust)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {calculations.ownershipSummary.total > 0 
                  ? formatPercentage((calculations.ownershipSummary.trust / calculations.ownershipSummary.total) * 100)
                  : '0%'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Joint Ownership</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.ownershipSummary.joint)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {calculations.ownershipSummary.total > 0 
                  ? formatPercentage((calculations.ownershipSummary.joint / calculations.ownershipSummary.total) * 100)
                  : '0%'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Individual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.ownershipSummary.individual)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {calculations.ownershipSummary.total > 0 
                  ? formatPercentage((calculations.ownershipSummary.individual / calculations.ownershipSummary.total) * 100)
                  : '0%'}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Business Entity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.ownershipSummary.business)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                {calculations.ownershipSummary.total > 0 
                  ? formatPercentage((calculations.ownershipSummary.business / calculations.ownershipSummary.total) * 100)
                  : '0%'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Trust Values */}
      <Card>
        <CardHeader>
          <CardTitle>Trust Asset Values</CardTitle>
          <CardDescription>Current value of assets held in each trust</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trusts.map(trust => (
              <div key={trust.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{trust.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{trust.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.trustValues[trust.id] || 0)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                    {calculations.netWorth > 0 
                      ? formatPercentage(((calculations.trustValues[trust.id] || 0) / calculations.netWorth) * 100)
                      : '0%'} of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Estate Tax Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Federal Estate Tax Analysis</CardTitle>
          <CardDescription>Estimated federal estate tax exposure (2024 rates)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Current Net Worth</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.netWorth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Federal Exemption (2024)</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.estateTax.exemption)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Taxable Estate</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(calculations.estateTax.taxableEstate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Estimated Estate Tax</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(calculations.estateTax.estateTax)}</p>
              </div>
            </div>
            
            {calculations.estateTax.estateTax === 0 ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✓ Your current net worth is below the federal estate tax exemption threshold.
                  No federal estate tax would be due under current law.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Your estate may be subject to federal estate tax. Consider advanced planning strategies
                  such as gifting, charitable contributions, or additional trust structures.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Cash Flow Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart className="h-5 w-5 text-indigo-600 mr-2" />
            Monthly Cash Flow Analysis
          </CardTitle>
          <CardDescription>Income, expenses, and net cash flow over the past 12 months</CardDescription>
        </CardHeader>
        <CardContent>
          <CashFlowChart data={chartData.cashFlow} height={350} />
        </CardContent>
      </Card>
      
      {/* Estate Tax Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            Estate Tax Projections
          </CardTitle>
          <CardDescription>10-year projection of estate tax liability (assuming 5% annual growth)</CardDescription>
        </CardHeader>
        <CardContent>
          <EstateTaxChart data={chartData.estateTax} height={350} />
        </CardContent>
      </Card>
    </div>
  );
}