import React, { useState, useMemo, useCallback } from "react";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import ChevronsUpDown from "lucide-react/dist/esm/icons/chevrons-up-down";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Search from "lucide-react/dist/esm/icons/search";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { useDebouncedValue } from "~/hooks/use-debounced-value";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPageOptions?: number[];
  className?: string;
  emptyMessage?: string;
  sortable?: boolean;
}

type SortDirection = "asc" | "desc" | null;

// Extract default values outside component
const DEFAULT_ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_SEARCH_PLACEHOLDER = "Search...";
const DEFAULT_EMPTY_MESSAGE = "No data available";

function DataTableComponent<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE_OPTIONS,
  className,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

  // Use debounced search term
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Handle sorting with useCallback
  const handleSort = useCallback(
    (columnKey: string) => {
      if (sortColumn === columnKey) {
        setSortDirection(
          sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc",
        );
        if (sortDirection === "desc") {
          setSortColumn(null);
        }
      } else {
        setSortColumn(columnKey);
        setSortDirection("asc");
      }
    },
    [sortColumn, sortDirection],
  );

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Search filter with debounced value
    if (debouncedSearchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const keyStr = String(column.key);
          const value = keyStr.includes(".")
            ? keyStr
                .split(".")
                .reduce(
                  (obj: Record<string, unknown>, key: string) =>
                    obj?.[key] as Record<string, unknown>,
                  row as Record<string, unknown>,
                )
            : row[column.key as keyof T];

          return value?.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        }),
      );
    }

    // Sort
    if (sortColumn && sortDirection) {
      filtered.sort((a, b) => {
        const aValue = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((obj, key) => obj?.[key], a as Record<string, unknown>)
          : a[sortColumn];
        const bValue = sortColumn.includes(".")
          ? sortColumn.split(".").reduce((obj, key) => obj?.[key], b as Record<string, unknown>)
          : b[sortColumn];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, sortColumn, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = processedData.slice(startIndex, endIndex);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages],
  );

  const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const SortIcon = React.memo(({ columnKey }: { columnKey: string }) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary-600 dark:text-primary-400" />
    );
  });
  SortIcon.displayName = "SortIcon";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and filters */}
      {searchable && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {processedData.length} {processedData.length === 1 ? "result" : "results"}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400",
                      column.sortable &&
                        "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700",
                      column.className,
                    )}
                    onClick={() => column.sortable && handleSort(String(column.key))}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && <SortIcon columnKey={String(column.key)} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {columns.map((column) => {
                      const keyStr = String(column.key);
                      const value = keyStr.includes(".")
                        ? keyStr
                            .split(".")
                            .reduce(
                              (obj: Record<string, unknown>, key: string) =>
                                obj?.[key] as Record<string, unknown>,
                              row as Record<string, unknown>,
                            )
                        : row[column.key as keyof T];

                      return (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100",
                            column.className,
                          )}
                        >
                          {column.render ? column.render(value, row) : value?.toString() || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
            <Select
              value={String(itemsPerPage)}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              options={itemsPerPageOptions.map((num) => ({
                value: String(num),
                label: String(num),
              }))}
              className="w-20"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "rounded-md p-2",
                currentPage === 1
                  ? "cursor-not-allowed text-gray-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "rounded-md p-2",
                currentPage === totalPages
                  ? "cursor-not-allowed text-gray-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export memoized component
export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;
