import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/ui/data-table";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Plus from "lucide-react/dist/esm/icons/plus";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Wallet from "lucide-react/dist/esm/icons/wallet";
import PiggyBank from "lucide-react/dist/esm/icons/piggy-bank";
import Landmark from "lucide-react/dist/esm/icons/landmark";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import Building from "lucide-react/dist/esm/icons/building";
import { getAssets } from "~/lib/dal";
import { AssetCategory, FinancialAccountType } from "~/types/enums";
import { formatCurrency } from "~/utils/format";
import type { Column } from "~/components/ui/data-table";
import type { FinancialAccount, AnyEnhancedAsset } from "~/types/assets";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const allAssets = await getAssets(userId);

    // Filter for financial accounts only
    const financialAccounts = allAssets.filter(
      (asset) => asset && asset.category === AssetCategory.FINANCIAL_ACCOUNT,
    );

    // Group by account type
    const accountsByType = financialAccounts.reduce(
      (acc, account) => {
        if (!account) return acc;
        const accountType = (account as FinancialAccount).accountType || "OTHER";
        if (!acc[accountType]) {
          acc[accountType] = [];
        }
        acc[accountType].push(account);
        return acc;
      },
      {} as Record<string, typeof financialAccounts>,
    );

    // Calculate totals
    const totalValue = financialAccounts.reduce((sum, account) => sum + (account?.value || 0), 0);
    const checkingTotal =
      accountsByType[FinancialAccountType.CHECKING]?.reduce(
        (sum, acc) => sum + (acc?.value || 0),
        0,
      ) || 0;
    const savingsTotal =
      accountsByType[FinancialAccountType.SAVINGS]?.reduce(
        (sum, acc) => sum + (acc?.value || 0),
        0,
      ) || 0;
    const investmentTotal = Object.entries(accountsByType)
      .filter(([type]) => type.includes("INVESTMENT") || type.includes("BROKERAGE"))
      .reduce((sum, [, accounts]) => sum + accounts.reduce((s, a) => s + (a?.value || 0), 0), 0);
    const retirementTotal = Object.entries(accountsByType)
      .filter(([type]) => type.includes("RETIREMENT"))
      .reduce((sum, [, accounts]) => sum + accounts.reduce((s, a) => s + (a?.value || 0), 0), 0);

    return json({
      financialAccounts,
      accountsByType,
      totalValue,
      checkingTotal,
      savingsTotal,
      investmentTotal,
      retirementTotal,
      error: null,
    });
  } catch (error) {
    console.error("Failed to load financial accounts:", error);
    return json(
      {
        financialAccounts: [],
        accountsByType: {},
        totalValue: 0,
        checkingTotal: 0,
        savingsTotal: 0,
        investmentTotal: 0,
        retirementTotal: 0,
        error: error instanceof Error ? error.message : "Failed to load financial accounts",
      },
      { status: 500 },
    );
  }
}

function FinancialAccountsContent() {
  const {
    financialAccounts,
    accountsByType,
    totalValue,
    checkingTotal,
    savingsTotal,
    investmentTotal,
    retirementTotal,
    error,
  } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Accounts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage bank accounts, investments, and retirement accounts
          </p>
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

  const getAccountIcon = (account: AnyEnhancedAsset) => {
    const type = (account as FinancialAccount)?.accountType;
    if (!type) return DollarSign;
    if (type.includes("CHECKING")) return Wallet;
    if (type.includes("SAVINGS")) return PiggyBank;
    if (type.includes("INVESTMENT") || type.includes("BROKERAGE")) return TrendingUp;
    if (type.includes("RETIREMENT")) return Landmark;
    if (type === "CD") return Building;
    if (type.includes("CREDIT")) return CreditCard;
    return DollarSign;
  };

  const columns: Column<AnyEnhancedAsset>[] = [
    {
      key: "name",
      header: "Account Name",
      render: (account) => (
        <div className="flex items-center space-x-3">
          {(() => {
            const Icon = getAccountIcon(account);
            return <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />;
          })()}
          <div>
            <p className="font-medium">{account?.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              {(account as FinancialAccount)?.accountNumber || "No account number"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (account) => (
        <Badge variant="secondary">{(account as FinancialAccount)?.accountType || "Unknown"}</Badge>
      ),
    },
    {
      key: "institution",
      header: "Institution",
      render: (account) => <span>{(account as FinancialAccount)?.institution || "—"}</span>,
    },
    {
      key: "value",
      header: "Balance",
      render: (account) => (
        <span className="font-medium">{formatCurrency(account?.value || 0)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (account) => (
        <Button size="sm" variant="ghost" asChild>
          <Link to={`/assets/${account?.id}/edit`}>Edit</Link>
        </Button>
      ),
    },
  ];

  if (!financialAccounts || financialAccounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Financial Accounts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Manage bank accounts, investments, and retirement accounts
            </p>
          </div>
        </div>
        <Card className="py-8 text-center">
          <CardContent>
            <DollarSign className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              No financial accounts
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Add your bank accounts, investments, and retirement accounts to track your financial
              assets
            </p>
            <Button asChild>
              <Link to="/assets/new">Add Financial Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Accounts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Manage bank accounts, investments, and retirement accounts
          </p>
        </div>
        <Button asChild>
          <Link to="/assets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              All accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checking</CardTitle>
            <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(checkingTotal)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Liquid funds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings</CardTitle>
            <PiggyBank className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(savingsTotal)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Emergency fund
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(investmentTotal)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Brokerage accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retirement</CardTitle>
            <Landmark className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(retirementTotal)}</div>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 dark:text-gray-500">
              401k, IRA, etc.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Financial Accounts</CardTitle>
          <CardDescription>
            View and manage all your financial accounts in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={
              financialAccounts.filter(Boolean).map((acc) => ({ ...acc })) as Record<
                string,
                unknown
              >[]
            }
            columns={columns as unknown as Column<Record<string, unknown>>[]}
            sortable={true}
            pagination={{
              pageSize: 10,
              showPagination: true,
            }}
          />
        </CardContent>
      </Card>

      {/* Account Type Breakdown */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Liquid Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Liquid Accounts</CardTitle>
            <CardDescription>Checking and savings accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                ...((accountsByType as Record<string, typeof financialAccounts>)[
                  FinancialAccountType.CHECKING
                ] || []),
                ...((accountsByType as Record<string, typeof financialAccounts>)[
                  FinancialAccountType.SAVINGS
                ] || []),
                ...((accountsByType as Record<string, typeof financialAccounts>)[
                  FinancialAccountType.MONEY_MARKET
                ] || []),
              ]
                .filter(Boolean)
                .map((account) =>
                  account ? (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const Icon = getAccountIcon(account);
                          return (
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                          );
                        })()}
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            {(account as FinancialAccount).institution}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">{formatCurrency(account.value || 0)}</span>
                    </div>
                  ) : null,
                )}
            </div>
          </CardContent>
        </Card>

        {/* Investment & Retirement Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Investment & Retirement</CardTitle>
            <CardDescription>Long-term investment accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(accountsByType)
                .filter(
                  ([type]) =>
                    type.includes("INVESTMENT") ||
                    type.includes("RETIREMENT") ||
                    type.includes("BROKERAGE"),
                )
                .flatMap(([, accounts]) => accounts)
                .filter(Boolean)
                .map((account) =>
                  account ? (
                    <div
                      key={account.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const Icon = getAccountIcon(account);
                          return (
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                          );
                        })()}
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            {(account as FinancialAccount).institution}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">{formatCurrency(account.value || 0)}</span>
                    </div>
                  ) : null,
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FinancialAccounts() {
  return (
    <ErrorBoundary level="page">
      <FinancialAccountsContent />
    </ErrorBoundary>
  );
}
