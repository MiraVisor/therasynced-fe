import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const ViewMoreButton = () => {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
      <CardContent className="flex items-center justify-center py-8">
        <Button
          variant="outline"
          size="lg"
          className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-3 text-lg font-semibold"
        >
          View More Experts
        </Button>
      </CardContent>
    </Card>
  );
};
