'use client';

import { CreditCard, ExternalLink, Lock, Shield } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePaymentMethods, useUpdatePaymentMethod } from '@/hooks/queries/usePaymentMethods';
import { useBillingPortal } from '@/hooks/queries/useSubscription';

export function PaymentMethodCard() {
  const { refetch: refetchBillingPortal, isFetching: isLoadingPortal } = useBillingPortal();
  const { data: paymentMethodsData, isLoading } = usePaymentMethods();
  const { mutate: updatePaymentMethod, isPending: isUpdating } = useUpdatePaymentMethod();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const paymentMethods = paymentMethodsData?.paymentMethods || [];
  const defaultMethod = paymentMethods.find((pm) => pm.isDefault);

  const handleManageBilling = async () => {
    try {
      const result = await refetchBillingPortal();
      if (result.data) {
        window.open(result.data, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  const handleSetDefault = (paymentMethodId: string) => {
    setSelectedMethodId(paymentMethodId);
    updatePaymentMethod(paymentMethodId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-poppins font-bold text-charcoal">
          Payment Methods
        </CardTitle>
        <CardDescription className="text-sm">
          Manage your payment methods and billing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((paymentMethod) => (
              <div
                key={paymentMethod.id}
                className={`relative p-5 rounded-xl border-2 transition-all ${
                  paymentMethod.isDefault
                    ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Credit Card Visual Style */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        paymentMethod.isDefault
                          ? 'bg-primary/20 dark:bg-primary/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {paymentMethod.type === 'card' ? (
                        <CreditCard
                          className={`h-6 w-6 ${
                            paymentMethod.isDefault
                              ? 'text-primary'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        />
                      ) : (
                        <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {paymentMethod.type === 'paypal' ? 'PP' : 'PM'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-poppins font-semibold text-lg text-charcoal">
                          {paymentMethod.type === 'card'
                            ? `${paymentMethod.brand?.toUpperCase() || 'Card'} •••• ${paymentMethod.last4 || '****'}`
                            : paymentMethod.type === 'paypal'
                              ? 'PayPal'
                              : paymentMethod.type}
                        </p>
                        {paymentMethod.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                            Default
                          </span>
                        )}
                      </div>
                      {paymentMethod.type === 'card' &&
                        paymentMethod.expMonth &&
                        paymentMethod.expYear && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Lock className="h-4 w-4" />
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                {!paymentMethod.isDefault && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(paymentMethod.id)}
                      disabled={isUpdating && selectedMethodId === paymentMethod.id}
                      className="w-full sm:w-auto"
                    >
                      {isUpdating && selectedMethodId === paymentMethod.id
                        ? 'Setting...'
                        : 'Set as Default'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4">
              <Button
                onClick={handleManageBilling}
                variant="outline"
                disabled={isLoadingPortal}
                className="w-full sm:w-auto"
                size="lg"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Payment Methods
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-poppins font-semibold text-charcoal mb-2">
              No Payment Method
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Add a payment method to subscribe to a plan and start accepting bookings.
            </p>
            <Button
              onClick={handleManageBilling}
              variant="outline"
              disabled={isLoadingPortal}
              size="lg"
            >
              Add Payment Method
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            Payment information is securely processed by Stripe. We never store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
