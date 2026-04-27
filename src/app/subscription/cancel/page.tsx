'use client';

import { ArrowLeft, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
            <XCircle className="h-8 w-8 text-orange-600 />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="mt-2">
            Your payment was cancelled. No charges were made. You can continue using your current
            plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => router.push('/dashboard/account?tab=subscription')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Subscription Page
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
