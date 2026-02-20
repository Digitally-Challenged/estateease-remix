import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import Plus from "lucide-react/dist/esm/icons/plus";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import User from "lucide-react/dist/esm/icons/user";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { getWills } from "~/lib/dal";
// TODO: Import requireUser when auth is implemented
// import { requireUser } from "~/lib/auth.server";
import { formatDate } from "~/lib/utils";
import type { Will } from "~/types/documents";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Implement proper auth when auth.server.ts is available
  // const user = await requireUser(request);
  const userId = "1"; // Mock user ID
  const wills = await getWills(userId);

  return json({ wills });
}

export default function WillsIndex() {
  const { wills } = useLoaderData<typeof loader>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return "text-green-600 bg-green-50";
      case "SIGNED":
        return "text-blue-600 bg-blue-50";
      case "DRAFT":
        return "text-yellow-600 bg-yellow-50";
      case "REVOKED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wills</h1>
          <p className="mt-1 text-gray-600">
            Manage your last will and testament documents
          </p>
        </div>
        <Link to="/wills/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Will
          </Button>
        </Link>
      </div>

      {wills.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-100 p-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Wills Created
              </h3>
              <p className="mt-1 text-gray-600">
                Create your first will to ensure your wishes are documented
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {wills.map((will) => (
            <Card key={will.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {will.documentName}
                      </h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {will.testatorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created: {formatDate(will.dateCreated)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(will.status)}`}
                    >
                      {will.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-gray-500">Primary Executor:</span>
                      <span className="ml-2 text-gray-900">
                        {will.executorPrimary || "Not specified"}
                      </span>
                    </div>
                    {will.executorSecondary && (
                      <div>
                        <span className="text-gray-500">
                          Secondary Executor:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {will.executorSecondary}
                        </span>
                      </div>
                    )}
                    {will.dateSigned && (
                      <div>
                        <span className="text-gray-500">Date Signed:</span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(will.dateSigned)}
                        </span>
                      </div>
                    )}
                    {will.attorneyName && (
                      <div>
                        <span className="text-gray-500">Attorney:</span>
                        <span className="ml-2 text-gray-900">
                          {will.attorneyName}
                          {will.lawFirm && ` - ${will.lawFirm}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {will.notes && (
                    <div className="mt-3 rounded-md bg-gray-50 p-3">
                      <p className="text-sm text-gray-700">{will.notes}</p>
                    </div>
                  )}

                  {will.status === "DRAFT" && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>This will is still in draft status and has not been signed</span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link to={`/wills/${will.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  {will.status === "DRAFT" && (
                    <Link to={`/wills/${will.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
