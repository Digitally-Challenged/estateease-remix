import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EstateReportLoadingState } from "~/components/ui/loading-states";
import { ErrorBoundary, ErrorDisplay } from "~/components/ui";
import {
  showReportGeneratedNotification,
  showPrintReadyNotification,
  showDataErrorNotification,
} from "~/components/ui/estate-notifications";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import PieChart from "lucide-react/dist/esm/icons/pie-chart";
import Users from "lucide-react/dist/esm/icons/users";
import Shield from "lucide-react/dist/esm/icons/shield";
import Home from "lucide-react/dist/esm/icons/home";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import UserCheck from "lucide-react/dist/esm/icons/user-check";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import Heart from "lucide-react/dist/esm/icons/heart";
import Building from "lucide-react/dist/esm/icons/building";
import CreditCard from "lucide-react/dist/esm/icons/credit-card";
import {
  getAssets,
  getFamilyMembers,
  getProfessionals,
  getEmergencyContacts,
  getLegalRoles,
  getHealthcareDirectives,
  getBeneficiaries,
  getTrusts,
} from "~/lib/dal";
import { formatCurrency, formatDate } from "~/lib/utils";
import { AssetCategory } from "~/types/enums";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    // Load all estate data in parallel
    const [
      assets,
      familyMembers,
      professionals,
      emergencyContacts,
      legalRoles,
      healthcareDirectives,
      beneficiaries,
      trusts,
    ] = await Promise.all([
      getAssets(userId),
      getFamilyMembers(userId),
      getProfessionals(userId),
      getEmergencyContacts(userId),
      getLegalRoles(userId),
      getHealthcareDirectives(userId),
      getBeneficiaries(userId),
      getTrusts(userId),
    ]);

    // Calculate estate summary data
    const totalAssetValue = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
    const assetsByCategory = assets.reduce(
      (acc, asset) => {
        if (!asset) return acc;
        acc[asset.category] = (acc[asset.category] || 0) + asset.value;
        return acc;
      },
      {} as Record<string, number>,
    );

    const estateData = {
      assets: assets.filter(Boolean),
      familyMembers,
      professionals,
      emergencyContacts,
      legalRoles,
      healthcareDirectives,
      beneficiaries,
      trusts,
      summary: {
        totalAssetValue,
        assetsByCategory,
        totalAssets: assets.length,
        totalBeneficiaries: beneficiaries.length,
        totalTrusts: trusts.length,
      },
    };

    return json({ estateData, error: null });
  } catch (error) {
    console.error("Failed to load estate summary:", error);
    return json(
      {
        estateData: null,
        error: error instanceof Error ? error.message : "Failed to load estate summary",
      },
      { status: 500 },
    );
  }
}

function EstateReportContent() {
  const { estateData, error } = useLoaderData<typeof loader>();

  if (error) {
    // Show error notification
    showDataErrorNotification(error);
    return (
      <ErrorDisplay
        error={error}
        type="server"
        showRetry={true}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!estateData) {
    return <EstateReportLoadingState />;
  }

  type AssetItem = { id: string; name: string; category: string; value: number; notes?: string; ownership?: { type: string }; lastUpdated?: string };
  type FamilyItem = { id: string; fullName?: string; name?: string; relationship?: string; contactInfo?: { primaryPhone?: string; email?: string } };
  type ProfessionalItem = { id: string; fullName?: string; name?: string; firm?: string; type?: string; contactInfo: { primaryPhone?: string; email?: string } };

  const assets = estateData.assets as unknown as AssetItem[];
  const familyMembers = estateData.familyMembers as unknown as FamilyItem[];
  const professionals = estateData.professionals as unknown as ProfessionalItem[];
  const emergencyContacts = estateData.emergencyContacts;
  const { summary } = estateData;

  // Show report generated notification on load
  useEffect(() => {
    showReportGeneratedNotification("Estate Summary");
  }, []);

  // Print handler
  const handlePrint = () => {
    showPrintReadyNotification();
    // Small delay to show notification before print dialog
    setTimeout(() => {
      window.print();
    }, 500);
  };

  // Get category info
  const getCategoryInfo = (category: AssetCategory) => {
    switch (category) {
      case AssetCategory.REAL_ESTATE:
        return { icon: Home, label: "Real Estate", color: "bg-green-100 text-green-800" };
      case AssetCategory.FINANCIAL_ACCOUNT:
        return { icon: DollarSign, label: "Financial", color: "bg-blue-100 text-blue-800" };
      case AssetCategory.BUSINESS_INTEREST:
        return { icon: Building, label: "Business", color: "bg-purple-100 text-purple-800" };
      case AssetCategory.PERSONAL_PROPERTY:
        return { icon: Heart, label: "Personal", color: "bg-pink-100 text-pink-800" };
      case AssetCategory.INSURANCE_POLICY:
        return { icon: Shield, label: "Insurance", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { icon: CreditCard, label: "Other", color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Estate Summary Report</h1>
          <p className="mt-2 text-gray-600">Generated on {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Screen Header - Hidden when printing */}
      <div className="print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Estate Summary Report
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive overview of your estate planning status
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Print/Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Estate Overview */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estate Overview
          </CardTitle>
          <CardDescription>Key metrics and estate composition</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Estate Value
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(summary.totalAssetValue)}
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <div className="mb-2 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Total Assets
                </span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {summary.totalAssets}
              </div>
            </div>

            <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Beneficiaries
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {summary.totalBeneficiaries}
              </div>
            </div>

            <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Trusts
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {summary.totalTrusts}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Asset Allocation
          </CardTitle>
          <CardDescription>Distribution of assets by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.assetsByCategory).map(([category, value]) => {
              const categoryInfo = getCategoryInfo(category as AssetCategory);
              const Icon = categoryInfo.icon;
              const percentage = ((value / summary.totalAssetValue) * 100).toFixed(1);

              return (
                <div
                  key={category}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${categoryInfo.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{categoryInfo.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{percentage}%</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(value)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Asset Details */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Asset Details
          </CardTitle>
          <CardDescription>Complete list of estate assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left">Asset Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Ownership</th>
                  <th className="p-3 text-left print:hidden">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const categoryInfo = getCategoryInfo(asset.category as import("~/types/enums").AssetCategory);
                  return (
                    <tr key={asset.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-3">
                        <div className="font-medium">{asset.name}</div>
                        {asset.notes && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {asset.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                      </td>
                      <td className="p-3 font-semibold">{formatCurrency(asset.value)}</td>
                      <td className="p-3">
                        <div className="text-sm">{asset.ownership?.type || "Individual"}</div>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 print:hidden">
                        {asset.lastUpdated ? formatDate(asset.lastUpdated) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Family Members & Beneficiaries */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Family Members & Key Contacts
          </CardTitle>
          <CardDescription>Important people in your estate plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Family Members */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Users className="h-4 w-4" />
                Family Members ({familyMembers.length})
              </h3>
              <div className="space-y-3">
                {familyMembers.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <div>
                      <div className="font-medium">{member.fullName || member.name}</div>
                      <div className="text-sm capitalize text-gray-600 dark:text-gray-400">
                        {member.relationship}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {member.contactInfo?.primaryPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.contactInfo.primaryPhone}
                        </div>
                      )}
                      {member.contactInfo?.email && (
                        <div className="mt-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.contactInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Team */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <UserCheck className="h-4 w-4" />
                Professional Team ({professionals.length})
              </h3>
              <div className="space-y-3">
                {professionals.slice(0, 5).map((professional) => (
                  <div
                    key={professional.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <div>
                      <div className="font-medium">{professional.fullName || professional.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {professional.firm}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <Badge className="mb-1">
                        {(professional.type || "")
                          .replace("_", " ")
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                      {professional.contactInfo.primaryPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {professional.contactInfo.primaryPhone}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card className="print:break-inside-avoid">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>Priority contacts for emergencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {emergencyContacts
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 5)
              .map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-medium text-red-800">
                      {contact.priority}
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm capitalize text-gray-600 dark:text-gray-400">
                        {contact.relationship} • {contact.contactType}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {contact.contactInfo.primaryPhone}
                    </div>
                    {contact.contactInfo.email && (
                      <div className="mt-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {contact.contactInfo.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer - Only visible when printing */}
      <div className="mt-8 hidden border-t pt-4 text-center text-sm text-gray-600 print:block">
        <p>This report was generated from the EstateEase platform.</p>
        <p>For the most current information, please log in to your account.</p>
      </div>
    </div>
  );
}

export default function EstateSummaryReport() {
  return (
    <ErrorBoundary level="page">
      <EstateReportContent />
    </ErrorBoundary>
  );
}
