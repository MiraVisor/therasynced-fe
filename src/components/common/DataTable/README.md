# Enhanced Data Table Component

A powerful, reusable data table component built with React Table (TanStack Table) and Tailwind CSS. This component provides sorting, filtering, pagination, column visibility controls, and more.

## Features

- ✅ **Sorting**: Click column headers to sort data
- ✅ **Filtering**: Global search and column-specific filters
- ✅ **Pagination**: Navigate through large datasets with page controls
- ✅ **Column Visibility**: Show/hide columns as needed
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Customizable**: Easy to configure and extend
- ✅ **TypeScript Support**: Fully typed for better developer experience

## Usage

### Basic Usage

```tsx
import { bookingColumns, sampleBookings } from '@/components/common/DataTable/columns';
import { DataTable } from '@/components/common/DataTable/data-table';

export default function MyPage() {
  return (
    <DataTable
      columns={bookingColumns}
      data={sampleBookings}
      title="All Bookings"
      searchKey="name"
      searchPlaceholder="Search..."
    />
  );
}
```

### Advanced Usage with All Features

```tsx
import { bookingColumns, sampleBookings } from '@/components/common/DataTable/columns';
import { DataTable } from '@/components/common/DataTable/data-table';

export default function BookingsPage() {
  return (
    <DataTable
      columns={bookingColumns}
      data={sampleBookings}
      title="All Bookings"
      searchKey="name"
      searchPlaceholder="Search by name..."
      enableSorting={true}
      enableFiltering={true}
      enableColumnVisibility={true}
      enablePagination={true}
      pageSize={10}
      pageSizeOptions={[5, 10, 20, 30, 40, 50]}
    />
  );
}
```

## Props

| Prop                     | Type                         | Default                   | Description                               |
| ------------------------ | ---------------------------- | ------------------------- | ----------------------------------------- |
| `columns`                | `ColumnDef<TData, TValue>[]` | **Required**              | Column definitions for the table          |
| `data`                   | `TData[]`                    | **Required**              | Array of data to display                  |
| `title`                  | `string`                     | `"Data Table"`            | Title displayed above the table           |
| `searchKey`              | `string`                     | `undefined`               | Column key to use for global search       |
| `searchPlaceholder`      | `string`                     | `"Search..."`             | Placeholder text for search input         |
| `enableSorting`          | `boolean`                    | `true`                    | Enable/disable column sorting             |
| `enableFiltering`        | `boolean`                    | `true`                    | Enable/disable filtering                  |
| `enableColumnVisibility` | `boolean`                    | `true`                    | Enable/disable column visibility controls |
| `enablePagination`       | `boolean`                    | `true`                    | Enable/disable pagination                 |
| `pageSize`               | `number`                     | `10`                      | Default number of rows per page           |
| `pageSizeOptions`        | `number[]`                   | `[5, 10, 20, 30, 40, 50]` | Available page size options               |

## Creating Columns

### Basic Column Definition

```tsx
import { ColumnDef } from '@tanstack/react-table';

export type MyData = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
};

export const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
];
```

### Advanced Column with Sorting and Custom Cell

```tsx
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const columns: ColumnDef<MyData>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge variant={status === 'active' ? 'default' : 'secondary'}>{status}</Badge>;
    },
  },
];
```

### Adding Action Column

```tsx
import { MoreHorizontal } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<MyData>[] = [
  // ... other columns
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

## Examples

### Bookings Table

Check out the example implementation in `/src/app/dashboard/bookings-example/page.tsx` for a complete bookings table with:

- Sortable columns (Name, Date, Price)
- Status badges with color coding
- Action dropdown menu
- Search functionality
- Pagination

### Customizing Styles

The component uses Tailwind CSS classes. You can customize the appearance by:

1. **Modifying the component styles** in `data-table.tsx`
2. **Customizing table cell styles** in your column definitions
3. **Overriding default styles** with custom CSS classes

## Dependencies

This component requires the following packages:

```bash
npm install @tanstack/react-table lucide-react
```

The component also uses these UI components (should already be available):

- `@/components/ui/button`
- `@/components/ui/input`
- `@/components/ui/select`
- `@/components/ui/table`
- `@/components/ui/dropdown-menu`
- `@/components/ui/badge`

## Best Practices

1. **Define your data types**: Always create TypeScript interfaces for your data
2. **Use memo for large datasets**: Consider using React.memo for better performance
3. **Implement server-side pagination**: For very large datasets, implement server-side pagination
4. **Handle loading states**: Add loading indicators while data is being fetched
5. **Add error handling**: Implement proper error boundaries and error states

## Troubleshooting

### Common Issues

1. **Columns not sorting**: Make sure your column has an `accessorKey` defined
2. **Search not working**: Ensure you've provided a valid `searchKey` prop
3. **Pagination not showing**: Check if `enablePagination` is set to `true`
4. **Styling issues**: Verify all required UI components are properly installed

### Performance Tips

- Use `React.memo` for row components when dealing with large datasets
- Consider virtualization for tables with hundreds of rows
- Implement debounced search for better performance
- Use server-side pagination for very large datasets
