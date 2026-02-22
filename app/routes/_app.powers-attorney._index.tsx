import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import Plus from "lucide-react/dist/esm/icons/plus";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import User from "lucide-react/dist/esm/icons/user";
import Shield from "lucide-react/dist/esm/icons/shield";
import Heart from "lucide-react/dist/esm/icons/heart";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Clock from "lucide-react/dist/esm/icons/clock";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { getPowersOfAttorney } from "~/lib/dal";
// TODO: Import requireUser when auth is implemented
// import { requireUser } from "~/lib/auth.server";
import { formatDate, getStatusColor } from "~/lib/utils";
import type { PowerOfAttorney } from "~/types/documents";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Implement proper auth when auth.server.ts is available
  // const user = await requireUser(request);
  const userId = "1"; // Mock user ID
  const powersOfAttorney = await getPowersOfAttorney(userId);

  return json({ powersOfAttorney });
}

export default function PowersOfAttorneyIndex() {
  const { powersOfAttorney } = useLoaderData<typeof loader>();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "FINANCIAL":
        return <DollarSign className="h-5 w-5" />;
      case "HEALTHCARE":
        return <Heart className="h-5 w-5" />;
      case "GENERAL":
        return <Shield className="h-5 w-5" />;
      case "LIMITED":
        return <Clock className="h-5 w-5" />;
      default:
        return <FileCheck className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Powers of Attorney
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your power of attorney documents
          </p>
        </div>
        <Link to="/powers-attorney/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New POA
          </Button>
        </Link>
      </div>

      {powersOfAttorney.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-100 p-4">
              <FileCheck className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Powers of Attorney Created
              </h3>
              <p className="mt-1 text-gray-600">
                Create a power of attorney to designate someone to act on your behalf
              </p>
            </div>
            <Link to="/powers-attorney/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First POA
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {powersOfAttorney.map((poa) => (
            <Card key={poa.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-gray-100 p-2">
                        {getTypeIcon(poa.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {poa.documentName}
                        </h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Principal: {poa.principalName}
                          </span>
                          <span>Type: {getTypeLabel(poa.type)}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(poa.status)}`}
                    >
                      {poa.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                      <span className="text-gray-500">Primary Agent:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {poa.agentPrimary}
                      </span>
                    </div>
                    {poa.agentSecondary && (
                      <div>
                        <span className="text-gray-500">Secondary Agent:</span>
                        <span className="ml-2 text-gray-900">
                          {poa.agentSecondary}
                        </span>
                      </div>
                    )}
                    {poa.effectiveDate && (
                      <div>
                        <span className="text-gray-500">Effective Date:</span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(poa.effectiveDate)}
                        </span>
                      </div>
                    )}
                    {poa.terminationDate && (
                      <div>
                        <span className="text-gray-500">Termination Date:</span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(poa.terminationDate)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Durable:</span>
                      <span className="ml-2 text-gray-900">
                        {poa.durable ? "Yes (survives incapacity)" : "No"}
                      </span>
                    </div>
                    {poa.springCondition && (
                      <div className="col-span-2">
                        <span className="text-gray-500">
                          Springing Condition:
                        </span>
                        <span className="ml-2 text-gray-900">
                          {poa.springCondition}
                        </span>
                      </div>
                    )}
                  </div>

                  {poa.notes && (
                    <div className="mt-3 rounded-md bg-gray-50 p-3">
                      <p className="text-sm text-gray-700">{poa.notes}</p>
                    </div>
                  )}

                  {poa.attorneyName && (
                    <div className="text-sm text-gray-600">
                      <span>Prepared by: </span>
                      <span className="text-gray-900">
                        {poa.attorneyName}
                        {poa.lawFirm && ` - ${poa.lawFirm}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <Link to={`/powers-attorney/${poa.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  {poa.status === "DRAFT" && (
                    <Link to={`/powers-attorney/${poa.id}/edit`}>
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
