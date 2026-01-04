'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UpgradeOverlayProps {
  isBlocked: boolean;
  requiredTier?: string;
  featureName?: string;
  onUpgrade?: () => void;
}

export function UpgradeOverlay({
  isBlocked,
  requiredTier = 'GOLD',
  featureName = 'Analytics & Insights',
  onUpgrade,
}: UpgradeOverlayProps) {
  const router = useRouter();

  if (!isBlocked) return null;

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push('/dashboard/account?tab=subscription&view=plans');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <Card className="max-w-md w-full mx-4 border-2 border-primary/20 shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-poppins font-bold text-charcoal">
            {featureName}
          </CardTitle>
          <CardDescription className="text-base font-inter text-muted-foreground mt-2">
            Upgrade to {requiredTier} tier to access advanced analytics and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm font-inter text-muted-foreground">
              Unlock comprehensive analytics including:
            </p>
            <ul className="text-sm font-inter text-left space-y-1 text-muted-foreground list-disc list-inside">
              <li>Booking performance metrics</li>
              <li>Client engagement insights</li>
              <li>Revenue deep dive analysis</li>
              <li>Performance & quality metrics</li>
              <li>Time & utilization analytics</li>
            </ul>
          </div>
          <Button
            onClick={handleUpgrade}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
            size="lg"
          >
            Upgrade to {requiredTier}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
