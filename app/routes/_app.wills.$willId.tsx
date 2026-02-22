import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import User from "lucide-react/dist/esm/icons/user";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { getWillById } from "~/lib/dal";
import { formatDate } from "~/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const { willId } = params;
  if (!willId) throw new Response("Not Found", { status: 404 });

  const will = getWillById(willId);
  if (!will) throw new Response("Not Found", { status: 404 });

  return json({ will });
}

export default function WillDetail() {
  const { will } = useLoaderData<typeof loader>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EXECUTED": return "text-green-600 bg-green-50";
      case "SIGNED": return "text-blue-600 bg-blue-50";
      case "DRAFT": return "text-yellow-600 bg-yellow-50";
      case "REVOKED": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/wills" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{will.documentName}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(will.status)}`}>
              {will.status}
            </span>
          </div>
          <p className="mt-1 text-gray-600">Last updated: {formatDate(will.updatedAt)}</p>
        </div>
        {will.status === "DRAFT" && (
          <Link to={`/wills/${will.id}/edit`}>
            <Button>Edit Will</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Testator</span>
              <span className="font-medium">{will.testatorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date Created</span>
              <span>{formatDate(will.dateCreated)}</span>
            </div>
            {will.dateSigned && (
              <div className="flex justify-between">
                <span className="text-gray-500">Date Signed</span>
                <span>{formatDate(will.dateSigned)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Revokes Prior Wills</span>
              <span>{will.revokesPrior ? "Yes" : "No"}</span>
            </div>
            {will.codicilCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Codicils</span>
                <span>{will.codicilCount}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Executors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Primary Executor</span>
              <span className="font-medium">{will.executorPrimary || "Not specified"}</span>
            </div>
            {will.executorSecondary && (
              <div className="flex justify-between">
                <span className="text-gray-500">Secondary Executor</span>
                <span>{will.executorSecondary}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {(will.witness1Name || will.witness2Name || will.notaryName) && (
          <Card>
            <CardHeader>
              <CardTitle>Witnesses & Notary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {will.witness1Name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Witness 1</span>
                  <span>{will.witness1Name}</span>
                </div>
              )}
              {will.witness2Name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Witness 2</span>
                  <span>{will.witness2Name}</span>
                </div>
              )}
              {will.notaryName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Notary</span>
                  <span>{will.notaryName}{will.notaryState ? ` (${will.notaryState})` : ""}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(will.attorneyName || will.lawFirm) && (
          <Card>
            <CardHeader>
              <CardTitle>Legal Representation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {will.attorneyName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Attorney</span>
                  <span>{will.attorneyName}</span>
                </div>
              )}
              {will.lawFirm && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Law Firm</span>
                  <span>{will.lawFirm}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {(will.specificBequests || will.residuaryClause || will.guardianNominations || will.funeralWishes || will.otherProvisions) && (
        <Card>
          <CardHeader>
            <CardTitle>Provisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {will.specificBequests && (
              <div>
                <h4 className="mb-1 font-medium text-gray-700">Specific Bequests</h4>
                <p className="text-sm text-gray-600">{will.specificBequests}</p>
              </div>
            )}
            {will.residuaryClause && (
              <div>
                <h4 className="mb-1 font-medium text-gray-700">Residuary Clause</h4>
                <p className="text-sm text-gray-600">{will.residuaryClause}</p>
              </div>
            )}
            {will.guardianNominations && (
              <div>
                <h4 className="mb-1 font-medium text-gray-700">Guardian Nominations</h4>
                <p className="text-sm text-gray-600">{will.guardianNominations}</p>
              </div>
            )}
            {will.funeralWishes && (
              <div>
                <h4 className="mb-1 font-medium text-gray-700">Funeral Wishes</h4>
                <p className="text-sm text-gray-600">{will.funeralWishes}</p>
              </div>
            )}
            {will.otherProvisions && (
              <div>
                <h4 className="mb-1 font-medium text-gray-700">Other Provisions</h4>
                <p className="text-sm text-gray-600">{will.otherProvisions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {will.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{will.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
