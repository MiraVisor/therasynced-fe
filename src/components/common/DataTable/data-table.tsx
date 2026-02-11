'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { LoadingSpinner } from './loading-spinner';
import { TableSkeleton } from './table-skeleton';

export interface FilterOption<T = string> {
  label: string;
  value: T;
  color?: string; // e.g., 'primary', 'warning', 'success', 'error'
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  searchKey?: string;
  searchPlaceholder?: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showSearch?: boolean;
  showSorting?: boolean;
  loading?: boolean;
  initialLoading?: boolean;
  // External search control (for server-side search with debouncing)
  externalSearchValue?: string;
  onExternalSearchChange?: (value: string) => void;
  // External pagination control (for server-side pagination)
  externalPageIndex?: number;
  externalPageSize?: number;
  totalPages?: number;
  onExternalPageChange?: (pageIndex: number) => void;
  onExternalPageSizeChange?: (pageSize: number) => void;
  // Filter buttons beside search bar
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  // Row selection
  enableRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = '',
  searchKey,
  searchPlaceholder = 'Search...',
  enableSorting = true,
  enableFiltering = true,
  enableColumnVisibility = true,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  showSearch = true,
  showSorting = true,
  loading = false,
  initialLoading = false,
  externalSearchValue,
  onExternalSearchChange,
  externalPageIndex,
  externalPageSize,
  totalPages,
  onExternalPageChange,
  onExternalPageSizeChange,
  filterOptions,
  selectedFilter,
  onFilterChange,
  enableRowSelection = false,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // External pagination state
  const [internalPageIndex, setInternalPageIndex] = useState(0);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  const currentPageIndex = onExternalPageChange ? (externalPageIndex ?? 0) : internalPageIndex;
  const currentPageSize = onExternalPageSizeChange
    ? (externalPageSize ?? pageSize)
    : internalPageSize;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel:
      enablePagination && !onExternalPageChange ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: setRowSelection,
    onPaginationChange:
      enablePagination && !onExternalPageChange
        ? (updater) => {
            const newPagination =
              typeof updater === 'function'
                ? updater({ pageIndex: internalPageIndex, pageSize: internalPageSize })
                : updater;
            if (newPagination.pageIndex !== undefined) {
              setInternalPageIndex(newPagination.pageIndex);
            }
            if (newPagination.pageSize !== undefined) {
              setInternalPageSize(newPagination.pageSize);
            }
          }
        : undefined,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableFiltering ? columnFilters : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      rowSelection,
      ...(enablePagination &&
        !onExternalPageChange && {
          pagination: {
            pageIndex: internalPageIndex,
            pageSize: currentPageSize,
          },
        }),
    },
    initialState: {
      pagination: {
        pageSize: currentPageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: !!onExternalPageChange,
    enableRowSelection: enableRowSelection,
  });

  // Notify parent of row selection changes
  useEffect(() => {
    if (enableRowSelection && onRowSelectionChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelection, enableRowSelection, onRowSelectionChange, table]);

  return (
    <div className="border rounded-lg">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2">
        <div className="flex items-center space-x-2 px-2 py-4">
          <h2 className="font-poppins text-[22px] font-bold tracking-tight text-charcoal">
            {title}
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {/* Loading Spinner */}
          {loading && (
            <div className="flex items-center">
              <LoadingSpinner size="medium" />
            </div>
          )}

          {/* Search Input and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto px-3 py-2">
            {showSearch && enableFiltering && searchKey && (
              <div className="w-full sm:max-w-sm">
                <div className="relative w-full">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={
                      onExternalSearchChange
                        ? (externalSearchValue ?? '')
                        : ((table.getColumn(searchKey)?.getFilterValue() as string) ?? '')
                    }
                    onChange={(event) => {
                      if (onExternalSearchChange) {
                        onExternalSearchChange(event.target.value);
                      } else {
                        table.getColumn(searchKey)?.setFilterValue(event.target.value);
                      }
                    }}
                    className="pl-8 border-gray-200 w-full"
                  />
                </div>
              </div>
            )}

            {/* Filter Dropdown */}
            {filterOptions && filterOptions.length > 0 && onFilterChange && (
              <div className="w-full sm:w-[180px]">
                <Select value={selectedFilter ?? 'all'} onValueChange={onFilterChange}>
                  <SelectTrigger className="h-8 border-gray-200">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((option) => (
                      <SelectItem key={String(option.value)} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          {showSorting && enableSorting && (
            <Select
              value={`${table.getState().sorting[0]?.id ?? ''}-${table.getState().sorting[0]?.desc ? 'desc' : 'asc'}`}
              onValueChange={(value) => {
                const [column, direction] = value.split('-');
                if (column) {
                  table.setSorting([{ id: column, desc: direction === 'desc' }]);
                }
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
                <SelectValue placeholder="Sort by: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className={`bg-[#ffffff] flex flex-col ${
          table.getRowModel().rows?.length && !initialLoading
            ? 'overflow-hidden max-h-[calc(48px*11)]'
            : ''
        }`}
      >
        <Table className={table.getRowModel().rows?.length && !initialLoading ? 'h-full' : ''}>
          <TableHeader className="bg-gray-100 rounded-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="min-w-[150px] font-poppins font-medium text-sm sm:text-base text-charcoal py-1 sm:py-1 px-2 sm:px-3 first:pl-3 sm:first:pl-6 last:pr-3 sm:last:pr-6 border-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            className={table.getRowModel().rows?.length && !initialLoading ? 'overflow-y-auto' : ''}
          >
            {initialLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-4">
                  <TableSkeleton columns={columns.length} rows={5} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-gray-100 border-b"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="font-poppins font-medium text-xs sm:text-[14px] text-table-row py-4 sm:py-6 px-2 sm:px-3 first:pl-3 sm:first:pl-6 last:pr-2 sm:last:pr-6 border-0"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center font-poppins font-medium text-[14px] text-table-row border-0 py-8"
                >
                  <div className="flex items-center justify-center">No results found.</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 py-2 px-4 sm:px-6 border-t">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-poppins font-medium text-table-row">Rows per page</p>
            <Select
              value={`${currentPageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                if (onExternalPageSizeChange) {
                  onExternalPageSizeChange(newPageSize);
                } else {
                  setInternalPageSize(newPageSize);
                  table.setPageSize(newPageSize);
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px] font-poppins border-gray-200">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="font-poppins">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8">
            <div className="flex w-full sm:w-[100px] items-center justify-center text-sm font-poppins font-medium text-table-row">
              Page {currentPageIndex + 1} of {totalPages || table.getPageCount()}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                className="hidden lg:flex h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  if (onExternalPageChange) {
                    onExternalPageChange(0);
                  } else {
                    table.setPageIndex(0);
                  }
                }}
                disabled={currentPageIndex === 0}
              >
                <span className="sr-only">Go to first page</span>
                {'<<'}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  if (onExternalPageChange) {
                    onExternalPageChange(currentPageIndex - 1);
                  } else {
                    const newPageIndex = Math.max(0, currentPageIndex - 1);
                    table.setPageIndex(newPageIndex);
                  }
                }}
                disabled={currentPageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                {'<'}
              </Button>

              {/* Page Numbers - Hide on mobile, show on tablet+ */}
              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages || table.getPageCount()) }, (_, i) => {
                  const pageIndex = currentPageIndex;
                  const totalPagesCount = totalPages || table.getPageCount();
                  let startPage = Math.max(0, pageIndex - 2);
                  const endPage = Math.min(totalPagesCount - 1, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(0, endPage - 4);
                  }

                  const page = startPage + i;
                  if (page <= endPage) {
                    return (
                      <Button
                        key={page}
                        variant={page === pageIndex ? 'default' : 'outline'}
                        className={`h-8 w-8 p-0 font-poppins font-medium text-[14px] ${
                          page === pageIndex
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'border-gray-200 text-table-row hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          if (onExternalPageChange) {
                            onExternalPageChange(page);
                          } else {
                            table.setPageIndex(page);
                          }
                        }}
                      >
                        {page + 1}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                className="h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  if (onExternalPageChange) {
                    onExternalPageChange(currentPageIndex + 1);
                  } else {
                    const maxPage = (totalPages || table.getPageCount()) - 1;
                    const newPageIndex = Math.min(maxPage, currentPageIndex + 1);
                    table.setPageIndex(newPageIndex);
                  }
                }}
                disabled={currentPageIndex >= (totalPages || table.getPageCount()) - 1}
              >
                <span className="sr-only">Go to next page</span>
                {'>'}
              </Button>
              <Button
                variant="outline"
                className="hidden lg:flex h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  if (onExternalPageChange) {
                    onExternalPageChange((totalPages || table.getPageCount()) - 1);
                  } else {
                    const lastPage = table.getPageCount() - 1;
                    table.setPageIndex(lastPage);
                  }
                }}
                disabled={currentPageIndex >= (totalPages || table.getPageCount()) - 1}
              >
                <span className="sr-only">Go to last page</span>
                {'>>'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
