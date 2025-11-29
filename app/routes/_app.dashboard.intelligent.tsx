import { json } from "@remix-run/node";
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

export async function loader() {
  // For now, we'll use the default user ID from the seed data
  const userId = "user-nick-001";

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
