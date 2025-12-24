'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceCategoryAnalytics {
  categoryName: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

interface CategoryBreakdownChartProps {
  data: ServiceCategoryAnalytics[];
  isLoading?: boolean;
}

// Test data for visualization (remove in production)

const CategoryBreakdownChart = ({ data, isLoading = false }: CategoryBreakdownChartProps) => {
  // Use test data if no data provided (for visualization purposes)
  const displayData = data && data;
  // Sort by bookings (descending) for better visualization
  const sortedData = [...displayData].sort((a, b) => b.bookings - a.bookings);

  // Transform data for chart - use full names for horizontal chart
  const chartData = sortedData.map((category) => ({
    name: category.categoryName,
    bookings: category.bookings,
    revenue: category.revenue,
    percentage: category.percentage,
  }));

  if (isLoading) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <div className="h-6 bg-gray-200 dark:bg-gray-700/30 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700/20 rounded w-1/2 animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
          <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
            Category Breakdown
          </CardTitle>
          <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
            Bookings by category
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center w-full min-h-[300px] p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No category data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max bookings for percentage bar
  const maxBookings = Math.max(...chartData.map((d) => d.bookings), 1);

  return (
    <Card className="w-full border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-2xl">
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-mint/30 to-white px-5 py-5">
        <CardTitle className="text-lg font-poppins font-semibold text-charcoal">
          Category Breakdown
        </CardTitle>
        <CardDescription className="text-sm font-inter text-muted-foreground mt-1">
          Bookings by category
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 h-[300px] overflow-y-auto">
        <div className="space-y-4">
          {chartData.map((category, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-poppins font-semibold text-charcoal text-base mb-1">
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-inter text-sm text-muted-foreground">Bookings:</span>
                      <span className="font-poppins font-semibold text-charcoal">
                        {category.bookings}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-inter text-sm text-muted-foreground">Revenue:</span>
                      <span className="font-poppins font-semibold text-primary">
                        EUR {category.revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-inter text-sm text-muted-foreground">Share:</span>
                      <span className="font-poppins font-semibold text-charcoal">
                        {category.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Visual progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                  style={{ width: `${(category.bookings / maxBookings) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryBreakdownChart;
