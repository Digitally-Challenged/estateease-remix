import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import Upload from "lucide-react/dist/esm/icons/upload";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import User from "lucide-react/dist/esm/icons/user";
import Shield from "lucide-react/dist/esm/icons/shield";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Info from "lucide-react/dist/esm/icons/info";
import { getLegalRoles } from "~/lib/dal";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;
  const legalRoles = await getLegalRoles(userId);

  // Filter for POA roles
  const poaRoles = legalRoles.filter((role) => role.roleType === "power_of_attorney");

  // Mock document data
  const documents = [
    {
      id: 1,
      name: "Durable Financial Power of Attorney",
      type: "FINANCIAL_POA",
      status: "active",
      agent: "Kelsey Brown Coleman",
      effectiveDate: "2025-02-04",
      lastUpdated: "2025-02-04",
      description: "Grants financial decision-making authority",
    },
    {
      id: 2,
      name: "Healthcare Power of Attorney",
      type: "HEALTHCARE_POA",
      status: "active",
      agent: "Kelsey Brown Coleman",
      effectiveDate: "2025-02-04",
      lastUpdated: "2025-02-04",
      description: "Grants healthcare decision-making authority",
    },
    {
      id: 3,
      name: "Limited Power of Attorney - Real Estate",
      type: "LIMITED_POA",
      status: "draft",
      agent: "To be determined",
      effectiveDate: null,
      lastUpdated: "2025-01-15",
      description: "For specific real estate transactions",
    },
  ];

  return json({ poaRoles, documents });
}

export default function PowersOfAttorney() {
  const { poaRoles, documents } = useLoaderData<typeof loader>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "draft":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case "FINANCIAL_POA":
        return "Financial POA";
      case "HEALTHCARE_POA":
        return "Healthcare POA";
      case "LIMITED_POA":
        return "Limited POA";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Powers of Attorney</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Manage your power of attorney documents and designated agents
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20">
        <CardContent className="flex items-start space-x-3 p-4">
          <Info className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">What is a Power of Attorney?</p>
            <p className="mt-1">
              A legal document that grants someone else the authority to act on your behalf in
              specified matters. This can include financial decisions, healthcare choices, or
              specific limited actions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current POA Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            Current Power of Attorney Agents
          </CardTitle>
          <CardDescription>People authorized to act on your behalf</CardDescription>
        </CardHeader>
        <CardContent>
          {poaRoles.length > 0 ? (
            <div className="space-y-4">
              {poaRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {role.personName}
                      </h3>
                      <Badge variant={role.isPrimary ? "default" : "secondary"}>
                        {role.isPrimary ? "Primary" : "Successor"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Power of Attorney
                    </p>
                    {role.specificPowers && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                        Powers: {role.specificPowers}
                      </p>
                    )}
                  </div>
                  <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
              No power of attorney agents currently assigned
            </p>
          )}
        </CardContent>
      </Card>

      {/* POA Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
            Power of Attorney Documents
          </CardTitle>
          <CardDescription>Your executed and draft POA documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</h3>
                      <Badge variant={getStatusColor(doc.status)}>{doc.status}</Badge>
                      <Badge variant="outline">{getDocumentTypeLabel(doc.type)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {doc.description}
                    </p>
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      <span className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        Agent: {doc.agent}
                      </span>
                      {doc.effectiveDate && (
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Effective: {new Date(doc.effectiveDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Download className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            Important Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Durable vs. Non-Durable
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Durable POAs remain effective if you become incapacitated, while non-durable POAs
                  terminate upon incapacity
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Springing Powers</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Some POAs only become effective upon certain conditions, such as medical
                  incapacity
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Regular Review</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Review and update your POA documents every 3-5 years or after major life changes
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload POA Document
        </Button>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Create New POA
        </Button>
      </div>
    </div>
  );
}
