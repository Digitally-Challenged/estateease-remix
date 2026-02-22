import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import User from "lucide-react/dist/esm/icons/user";
import Shield from "lucide-react/dist/esm/icons/shield";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { getPowerOfAttorneyById } from "~/lib/dal";
import { formatDate, getStatusColor } from "~/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const { poaId } = params;
  if (!poaId) throw new Response("Not Found", { status: 404 });

  const poa = getPowerOfAttorneyById(poaId);
  if (!poa) throw new Response("Not Found", { status: 404 });

  return json({ poa });
}

export default function PowerOfAttorneyDetail() {
  const { poa } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/powers-attorney" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{poa.documentName}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(poa.status)}`}>
              {poa.status}
            </span>
          </div>
          <p className="mt-1 text-gray-600">Type: {poa.type.charAt(0) + poa.type.slice(1).toLowerCase()}</p>
        </div>
        {poa.status === "DRAFT" && (
          <Link to={`/powers-attorney/${poa.id}/edit`}>
            <Button>Edit POA</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">{poa.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Durable</span>
              <span>{poa.durable ? "Yes (survives incapacity)" : "No"}</span>
            </div>
            {poa.effectiveDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Effective Date</span>
                <span>{formatDate(poa.effectiveDate)}</span>
              </div>
            )}
            {poa.terminationDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Termination Date</span>
                <span>{formatDate(poa.terminationDate)}</span>
              </div>
            )}
            {poa.dateSigned && (
              <div className="flex justify-between">
                <span className="text-gray-500">Date Signed</span>
                <span>{formatDate(poa.dateSigned)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Parties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Principal</span>
              <span className="font-medium">{poa.principalName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Primary Agent</span>
              <span className="font-medium">{poa.agentPrimary}</span>
            </div>
            {poa.agentSecondary && (
              <div className="flex justify-between">
                <span className="text-gray-500">Secondary Agent</span>
                <span>{poa.agentSecondary}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {(poa.powersGranted || poa.healthcarePowers || poa.financialPowers || poa.realEstatePowers || poa.businessPowers || poa.taxPowers || poa.giftPowers || poa.trustPowers) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Powers Granted
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {poa.powersGranted && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">General Powers</h4>
                  <p className="text-sm text-gray-600">{poa.powersGranted}</p>
                </div>
              )}
              {poa.healthcarePowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Healthcare Powers</h4>
                  <p className="text-sm text-gray-600">{poa.healthcarePowers}</p>
                </div>
              )}
              {poa.financialPowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Financial Powers</h4>
                  <p className="text-sm text-gray-600">{poa.financialPowers}</p>
                </div>
              )}
              {poa.realEstatePowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Real Estate Powers</h4>
                  <p className="text-sm text-gray-600">{poa.realEstatePowers}</p>
                </div>
              )}
              {poa.businessPowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Business Powers</h4>
                  <p className="text-sm text-gray-600">{poa.businessPowers}</p>
                </div>
              )}
              {poa.taxPowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Tax Powers</h4>
                  <p className="text-sm text-gray-600">{poa.taxPowers}</p>
                </div>
              )}
              {poa.giftPowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Gift Powers</h4>
                  <p className="text-sm text-gray-600">{poa.giftPowers}</p>
                </div>
              )}
              {poa.trustPowers && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Trust Powers</h4>
                  <p className="text-sm text-gray-600">{poa.trustPowers}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(poa.limitations || poa.springCondition || poa.specialInstructions) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Limitations & Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {poa.limitations && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Limitations</h4>
                  <p className="text-sm text-gray-600">{poa.limitations}</p>
                </div>
              )}
              {poa.springCondition && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Springing Condition</h4>
                  <p className="text-sm text-gray-600">{poa.springCondition}</p>
                </div>
              )}
              {poa.specialInstructions && (
                <div>
                  <h4 className="mb-1 font-medium text-gray-700">Special Instructions</h4>
                  <p className="text-sm text-gray-600">{poa.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(poa.witness1Name || poa.witness2Name || poa.notaryName) && (
          <Card>
            <CardHeader>
              <CardTitle>Witnesses & Notary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {poa.witness1Name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Witness 1</span>
                  <span>{poa.witness1Name}</span>
                </div>
              )}
              {poa.witness2Name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Witness 2</span>
                  <span>{poa.witness2Name}</span>
                </div>
              )}
              {poa.notaryName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Notary</span>
                  <span>{poa.notaryName}{poa.notaryState ? ` (${poa.notaryState})` : ""}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(poa.attorneyName || poa.lawFirm) && (
          <Card>
            <CardHeader>
              <CardTitle>Legal Representation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {poa.attorneyName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Attorney</span>
                  <span>{poa.attorneyName}</span>
                </div>
              )}
              {poa.lawFirm && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Law Firm</span>
                  <span>{poa.lawFirm}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {poa.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{poa.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";
