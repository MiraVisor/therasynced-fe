'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useState } from 'react';

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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    onColumnVisibilityChange: enableColumnVisibility ? setColumnVisibility : undefined,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting: enableSorting ? sorting : undefined,
      columnFilters: enableFiltering ? columnFilters : undefined,
      columnVisibility: enableColumnVisibility ? columnVisibility : undefined,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });
  const [firstWord, ...rest] = (title ?? '').split(' ');
  const restTitle = rest.join(' ');
  return (
    <div className="border rounded-lg">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="font-poppins text-lg sm:text-[22px] font-bold tracking-tight">
            <span className="text-black">{firstWord} </span>
            <span className="text-primary">{restTitle}</span>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          {/* Search Input */}
          {showSearch && enableFiltering && searchKey && (
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                className="pl-8 border-gray-200 w-full"
              />
            </div>
          )}

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
      <div className="rounded-lg bg-[#ffffff] overflow-hidden h-full overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-poppins font-semibold text-sm sm:text-base text-black py-3 sm:py-4 px-3 sm:px-6 first:pl-3 sm:first:pl-6 last:pr-3 sm:last:pr-6 border-0"
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-gray-100 border-b"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="font-poppins font-medium text-xs sm:text-[14px] text-table-row py-3 sm:py-4 px-3 sm:px-6 first:pl-3 sm:first:pl-6 last:pr-3 sm:last:pr-6 border-0"
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
                  className="h-24 text-center font-poppins font-medium text-[14px] text-table-row border-0"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 space-x-0 sm:space-x-2 p-4 sm:p-6 border-t">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-poppins font-medium text-table-row">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px] font-poppins border-gray-200">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
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
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                className="hidden lg:flex h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                {'<<'}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                {'<'}
              </Button>

              {/* Page Numbers - Hide on mobile, show on tablet+ */}
              <div className="hidden sm:flex items-center space-x-1">
                {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  const totalPages = table.getPageCount();
                  let startPage = Math.max(0, pageIndex - 2);
                  const endPage = Math.min(totalPages - 1, startPage + 4);

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
                        onClick={() => table.setPageIndex(page)}
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
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                {'>'}
              </Button>
              <Button
                variant="outline"
                className="hidden lg:flex h-8 w-8 p-0 font-poppins border-gray-200 hover:bg-gray-50"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
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
