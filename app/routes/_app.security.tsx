import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/lib/auth.server";
import { SecurityDashboard } from "~/components/security/security-dashboard";

export const meta: MetaFunction = () => {
  return [
    { title: "Security Dashboard | EstateEase" },
    { name: "description", content: "Security monitoring and threat detection dashboard" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  // In a real application, you would fetch actual security metrics
  // For now, we'll return mock data
  const securityData = {
    user,
    lastSecurityScan: new Date().toISOString(),
    securityScore: 85,
    activeThreats: 2,
    resolvedThreats: 15,
  };

  return json(securityData);
}

export default function SecurityPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Security Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive security monitoring and threat detection for your estate planning data
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span>Last security scan: {new Date(data.lastSecurityScan).toLocaleString()}</span>
          <span>•</span>
          <span>Security score: {data.securityScore}/100</span>
          <span>•</span>
          <span>Active threats: {data.activeThreats}</span>
        </div>
      </div>

      <SecurityDashboard />
    </div>
  );
}
