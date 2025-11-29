import { json } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import Plus from "lucide-react/dist/esm/icons/plus";
import { getAssets } from "~/lib/dal";
import { ErrorBoundary, EmptyStates, ErrorDisplay } from "~/components/ui";
import { AssetAccordion } from "~/components/ui/asset-accordion";
import { AssetCategory } from "~/types/enums";

export async function loader() {
  try {
    const userId = "user-nick-001"; // Default user for now
    const assets = getAssets(userId);

    return json({ assets, error: null });
  } catch (error) {
    console.error("Failed to load assets:", error);
    return json(
      {
        assets: [],
        error: error instanceof Error ? error.message : "Failed to load assets",
      },
      { status: 500 },
    );
  }
}

function AssetsContent() {
  const { assets, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Show error if there was one
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assets Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive view of all estate assets and their current values
            </p>
          </div>
        </div>
        <ErrorDisplay
          error={error}
          type="server"
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Show empty state if no assets
  if (!assets || assets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assets Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive view of all estate assets and their current values
            </p>
          </div>
        </div>
        <EmptyStates.Assets />
      </div>
    );
  }

  const handleEdit = (asset: { id: string }) => {
    navigate(`/assets/${asset.id}/edit`);
  };

  const handleDelete = async (assetId: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      // TODO: Implement delete functionality with proper form submission
      console.log("Delete asset:", assetId);
      window.location.reload();
    }
  };

  const handleAdd = (category: AssetCategory) => {
    navigate(`/assets/new?category=${category}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Assets Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Comprehensive view of all estate assets and their current values
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/assets/performance"
            className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Performance Dashboard
          </Link>
          <Link
            to="/assets/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Link>
        </div>
      </div>

      {/* Asset Accordion */}
      <AssetAccordion
        assets={assets.filter(
          (asset): asset is NonNullable<typeof asset> => asset !== null && asset !== undefined,
        )}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
}

export default function AssetsOverview() {
  return (
    <ErrorBoundary level="page">
      <AssetsContent />
    </ErrorBoundary>
  );
}
