import React, { useMemo, useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronsUpDownIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '~/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (item: T, value: unknown) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  loading?: boolean;
  emptyState?: React.ReactNode;
  sortable?: boolean;
  pagination?: {
    pageSize: number;
    showPagination?: boolean;
  };
  onRowClick?: (item: T) => void;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <div className="text-lg font-medium">No data available</div>
      <div className="text-sm">There are no items to display</div>
    </div>
  );
}

function LoadingSkeleton({ columns }: { columns: Column<Record<string, unknown>>[] }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="border-b border-gray-200">
          {columns.map((column, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  className,
  loading = false,
  emptyState,
  sortable = true,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState>({
    column: null,
    direction: null,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    setSortState(prev => {
      if (prev.column === columnKey) {
        if (prev.direction === 'asc') return { column: columnKey, direction: 'desc' };
        if (prev.direction === 'desc') return { column: null, direction: null };
      }
      return { column: columnKey, direction: 'asc' };
    });
    setCurrentPage(1); // Reset to first page when sorting
  };

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortState.column!];
      const bValue = b[sortState.column!];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortState.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortState.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortState.direction === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortState.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });
  }, [data, sortState]);

  const paginatedData = useMemo(() => {
    if (!pagination?.pageSize) return sortedData;
    
    const startIndex = (currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pagination?.pageSize]);

  const totalPages = pagination ? Math.ceil(sortedData.length / pagination.pageSize) : 1;

  const getSortIcon = (columnKey: string) => {
    if (!sortable) return null;
    
    if (sortState.column === columnKey) {
      return sortState.direction === 'asc' ? (
        <ChevronUpIcon className="w-4 h-4" />
      ) : (
        <ChevronDownIcon className="w-4 h-4" />
      );
    }
    return <ChevronsUpDownIcon className="w-4 h-4 opacity-50" />;
  };

  const renderCellValue = (item: T, column: Column<T>) => {
    const value = typeof column.key === 'string' && column.key.includes('.') 
      ? column.key.split('.').reduce((obj: Record<string, unknown>, key: string) => obj?.[key] as Record<string, unknown>, item as Record<string, unknown>)
      : item[column.key as keyof T];

    if (column.render) {
      return column.render(item, value);
    }

    // Handle null/undefined
    if (value == null) return '—';

    // Handle dates
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    // Handle numbers
    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  };

  if (loading) {
    return (
      <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th 
                    key={index}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                      column.headerClassName
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <LoadingSkeleton columns={columns as Column<Record<string, unknown>>[]} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={cn("border border-gray-200 rounded-lg", className)}>
        {emptyState || <DefaultEmptyState />}
      </div>
    );
  }

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                    sortable && column.sortable !== false && "cursor-pointer hover:bg-gray-100 select-none",
                    column.headerClassName
                  )}
                  onClick={() => column.sortable !== false && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable !== false && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr 
                key={index}
                className={cn(
                  "hover:bg-gray-50",
                  onRowClick && "cursor-pointer",
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex}
                    className={cn(
                      "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                      column.className
                    )}
                  >
                    {renderCellValue(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination?.showPagination !== false && pagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((currentPage - 1) * pagination.pageSize) + 1} to{' '}
                {Math.min(currentPage * pagination.pageSize, sortedData.length)} of{' '}
                {sortedData.length} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;