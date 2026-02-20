import { useRouteError, isRouteErrorResponse } from "@remix-run/react";

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-red-600">{error.status} {error.statusText}</h1>
        <p className="mt-2 text-gray-600">{error.data}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        {error instanceof Error ? error.message : "An unexpected error occurred"}
      </p>
    </div>
  );
}
