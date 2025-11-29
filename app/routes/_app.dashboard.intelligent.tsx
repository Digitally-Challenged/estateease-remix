import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  getDashboardStats,
  getRecentAssets,
  getTrusts,
  getAssets,
  getFamilyMembers,
  getProfessionals,
} from "~/lib/dal";
import IntelligentDashboard from "~/components/dashboard/intelligent-dashboard";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;

  const [dashboardStats, recentAssets, trusts, assets, familyMembers, professionals] =
    await Promise.all([
      getDashboardStats(userId),
      getRecentAssets(userId, 10),
      getTrusts(userId),
      getAssets(userId),
      getFamilyMembers(userId),
      getProfessionals(userId),
    ]);

  return json({
    dashboardStats,
    recentAssets,
    trusts,
    assets,
    familyMembers,
    professionals,
    userId,
  });
}

export default function IntelligentDashboardPage() {
  const { assets, trusts, familyMembers, professionals, userId } = useLoaderData<typeof loader>();

  return (
    <IntelligentDashboard
      assets={assets}
      trusts={trusts}
      familyMembers={familyMembers}
      professionals={professionals}
      userId={userId}
    />
  );
}
