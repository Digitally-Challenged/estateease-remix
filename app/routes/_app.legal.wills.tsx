import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import Upload from "lucide-react/dist/esm/icons/upload";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import Edit from "lucide-react/dist/esm/icons/edit";
import { formatDate } from "~/utils/format";

// Mock data for legal documents
const mockDocuments = [
  {
    id: "doc-001",
    name: "Last Will and Testament",
    type: "will",
    status: "current",
    dateCreated: "2024-01-15",
    lastUpdated: "2024-06-20",
    version: "2.0",
    signedBy: ["Nicholas Coleman", "Witness 1", "Witness 2"],
    notarized: true,
    fileSize: "2.4 MB",
    description: "Primary will document with all current beneficiary designations",
  },
  {
    id: "doc-002",
    name: "Coleman Family Revocable Trust",
    type: "trust",
    status: "current",
    dateCreated: "2023-08-10",
    lastUpdated: "2024-03-15",
    version: "1.2",
    signedBy: ["Nicholas Coleman", "Kelsey Brown Coleman"],
    notarized: true,
    fileSize: "3.1 MB",
    description: "Main family trust holding real estate and investment assets",
  },
  {
    id: "doc-003",
    name: "Pour-Over Will",
    type: "will",
    status: "draft",
    dateCreated: "2024-11-01",
    lastUpdated: "2024-11-15",
    version: "1.0",
    signedBy: [],
    notarized: false,
    fileSize: "1.8 MB",
    description: "Draft pour-over will to accompany revocable trust",
  },
];

export async function loader() {
  try {
    // In a real app, this would fetch from database
    const documents = mockDocuments;

    const stats = {
      total: documents.length,
      current: documents.filter((d) => d.status === "current").length,
      draft: documents.filter((d) => d.status === "draft").length,
      needsUpdate: documents.filter((d) => {
        const lastUpdate = new Date(d.lastUpdated);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return lastUpdate < sixMonthsAgo;
      }).length,
    };

    return json({ documents, stats, error: null });
  } catch (error) {
    console.error("Failed to load documents:", error);
    return json({
      documents: [],
      stats: { total: 0, current: 0, draft: 0, needsUpdate: 0 },
      error: error instanceof Error ? error.message : "Failed to load documents",
    });
  }
}

export default function LegalWills() {
  const { documents, stats, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Wills & Trust Documents
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your estate planning documents
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "current":
        return <Badge className="bg-green-100 text-green-800">Current</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "will":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "trust":
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Wills & Trust Documents
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your estate planning documents
          </p>
        </div>
        <Button asChild>
          <Link to="/legal/wills/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="mt-1 text-xs text-gray-600">
              All legal documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.current}</div>
            <p className="mt-1 text-xs text-gray-600">
              Up-to-date documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="mt-1 text-xs text-gray-600">
              Pending completion
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            stats.needsUpdate > 0
              ? "border-orange-200 bg-orange-50"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Review</CardTitle>
            <AlertCircle
              className={`h-4 w-4 ${stats.needsUpdate > 0 ? "text-orange-600" : "text-gray-600"}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${stats.needsUpdate > 0 ? "text-orange-700" : ""}`}
            >
              {stats.needsUpdate}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              Over 6 months old
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Review Alert */}
      {stats.needsUpdate > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertCircle className="mr-2 h-5 w-5" />
              Document Review Recommended
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              {stats.needsUpdate} document{stats.needsUpdate > 1 ? "s" : ""} haven&apos;t been
              reviewed in over 6 months. Regular reviews ensure your documents reflect your current
              wishes and circumstances.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>All wills, trusts, and related legal documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) =>
              doc ? (
                <div
                  key={doc.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getDocumentIcon(doc.type)}
                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-2">
                          <h3 className="font-medium">{doc.name}</h3>
                          {getStatusBadge(doc.status)}
                          {doc.notarized && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Notarized
                            </Badge>
                          )}
                        </div>
                        <p className="mb-2 text-sm text-gray-600">
                          {doc.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            Created: {formatDate(doc.dateCreated)}
                          </span>
                          <span className="flex items-center">
                            <Edit className="mr-1 h-3 w-3" />
                            Updated: {formatDate(doc.lastUpdated)}
                          </span>
                          <span>Version {doc.version}</span>
                          <span>{doc.fileSize}</span>
                        </div>
                        {doc.signedBy.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            Signed by: {doc.signedBy.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null,
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Tips */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Document Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-800">
            <li>• Store original documents in a fireproof safe or safety deposit box</li>
            <li>• Provide copies to your executor and key family members</li>
            <li>• Review and update documents after major life events</li>
            <li>• Ensure all documents are properly witnessed and notarized</li>
            <li>• Keep a list of document locations with your important papers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
