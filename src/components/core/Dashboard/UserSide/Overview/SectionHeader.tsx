import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export const SectionHeader = () => {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Featured Healthcare Experts
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with qualified professionals who are ready to help you on your wellness journey
        </p>
      </CardHeader>
    </Card>
  );
};
