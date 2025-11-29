import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Button } from "./button";
import { Download, Share2, Users, TrendingDown, AlertTriangle } from "lucide-react";

interface DistributionNode {
  id: string;
  name: string;
  type: "person" | "trust" | "charity" | "estate";
  percentage: number;
  amount: number;
  children?: DistributionNode[];
  level: number;
}

interface AssetDistributionChartProps {
  data: DistributionNode[];
  totalEstate: number;
  onExport?: () => void;
  onShare?: () => void;
}

export function AssetDistributionChart({
  data,
  totalEstate,
  onExport,
  onShare,
}: AssetDistributionChartProps) {
  const getNodeIcon = (type: string) => {
    switch (type) {
      case "person":
        return <Users className="h-4 w-4" />;
      case "trust":
        return <TrendingDown className="h-4 w-4" />;
      case "charity":
        return <Share2 className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "trust":
        return "bg-green-100 text-green-800 border-green-200";
      case "charity":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderNode = (node: DistributionNode) => {
    const nodeColor = getNodeColor(node.type);
    const icon = getNodeIcon(node.type);

    return (
      <div
        key={node.id}
        className={`relative rounded-lg border-2 p-4 ${nodeColor} shadow-sm transition-shadow hover:shadow-md`}
        style={{
          marginLeft: `${node.level * 40}px`,
          marginBottom: "12px",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon}
            <div>
              <h4 className="text-sm font-semibold">{node.name}</h4>
              <p className="text-xs capitalize opacity-75">{node.type}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">{node.percentage.toFixed(1)}%</div>
            <div className="text-xs">{formatCurrency(node.amount)}</div>
          </div>
        </div>

        {/* Connection line to parent */}
        {node.level > 0 && (
          <div className="absolute left-0 top-1/2 h-px w-6 -translate-x-6 bg-gray-300" />
        )}

        {/* Vertical line for children */}
        {node.children && node.children.length > 0 && (
          <div className="absolute left-full top-1/2 h-px w-6 bg-gray-300" />
        )}
      </div>
    );
  };

  const renderTree = (nodes: DistributionNode[]) => {
    const flattenNodes = (nodeList: DistributionNode[]): DistributionNode[] => {
      const result: DistributionNode[] = [];

      nodeList.forEach((node) => {
        result.push(node);
        if (node.children) {
          result.push(...flattenNodes(node.children));
        }
      });

      return result;
    };

    return flattenNodes(nodes).map((node, index) => renderNode(node, index));
  };

  // Calculate totals
  const totalPercentage = data.reduce((sum, node) => sum + node.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingDown className="mr-2 h-5 w-5" />
            Asset Distribution Flow Chart
          </CardTitle>
          <div className="flex space-x-2">
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Estate Value: {formatCurrency(totalEstate)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Estate Summary */}
        <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 md:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Allocated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {remainingPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Beneficiaries</div>
          </div>
        </div>

        {/* Warnings */}
        {remainingPercentage !== 0 && (
          <div
            className={`rounded-md p-3 ${
              remainingPercentage > 0
                ? "border border-yellow-200 bg-yellow-50 text-yellow-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4" />
              <span className="font-medium">
                {remainingPercentage > 0
                  ? `${remainingPercentage.toFixed(1)}% of estate is unallocated`
                  : `Estate is over-allocated by ${Math.abs(remainingPercentage).toFixed(1)}%`}
              </span>
            </div>
          </div>
        )}

        {/* Distribution Tree */}
        <div className="space-y-2">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Distribution Structure
          </h3>
          {data.length === 0 ? (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <TrendingDown className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No distribution plan configured</p>
              <p className="mt-1 text-sm">Add beneficiaries to see the distribution flow</p>
            </div>
          ) : (
            <div className="space-y-2">{renderTree(data)}</div>
          )}
        </div>

        {/* Legend */}
        <div className="border-t pt-4">
          <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Legend</h4>
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-4 w-4 items-center justify-center rounded border border-blue-200 bg-blue-100">
                <Users className="h-2 w-2 text-blue-800" />
              </div>
              <span>Individual</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex h-4 w-4 items-center justify-center rounded border border-green-200 bg-green-100">
                <TrendingDown className="h-2 w-2 text-green-800" />
              </div>
              <span>Trust</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex h-4 w-4 items-center justify-center rounded border border-purple-200 bg-purple-100">
                <Share2 className="h-2 w-2 text-purple-800" />
              </div>
              <span>Charity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-200 bg-gray-100">
                <AlertTriangle className="h-2 w-2 text-gray-800" />
              </div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
