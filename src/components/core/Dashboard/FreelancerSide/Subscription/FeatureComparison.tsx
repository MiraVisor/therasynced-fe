'use client';

import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, X } from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PlanType, SubscriptionPlan } from '@/types/subscription';

interface FeatureComparisonProps {
  plans: SubscriptionPlan[];
  currentPlanName?: PlanType;
  className?: string;
}

interface Feature {
  name: string;
  description?: string;
  bronze: boolean | string;
  silver: boolean | string;
  gold: boolean | string;
}

export function FeatureComparison({
  plans,
  currentPlanName,
  className = '',
}: FeatureComparisonProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [expandedPlan, setExpandedPlan] = useState<PlanType | null>(null);

  // Get plan details
  const bronzePlan = plans.find((p) => p.name === 'BRONZE');
  const silverPlan = plans.find((p) => p.name === 'SILVER');
  const goldPlan = plans.find((p) => p.name === 'GOLD');

  // Define features based on plan details
  const features: Feature[] = [
    {
      name: 'Maximum Slots',
      description: 'Number of active slots you can create',
      bronze: bronzePlan?.maxSlots?.toString() || '5',
      silver: silverPlan?.maxSlots?.toString() || '15',
      gold: 'Unlimited',
    },
    {
      name: 'Commission Rate',
      description: 'Percentage charged per booking',
      bronze: bronzePlan ? `${bronzePlan.commissionRate}%` : '10%',
      silver: silverPlan ? `${silverPlan.commissionRate}%` : '7%',
      gold: goldPlan ? `${goldPlan.commissionRate}%` : '5%',
    },
    {
      name: 'Search Priority',
      description: 'Your placement in search results',
      bronze: 'Priority 1 (Lowest)',
      silver: 'Priority 2 (Medium)',
      gold: 'Priority 3 (Highest)',
    },
    {
      name: 'Toggle Reviews',
      description: 'Ability to show/hide reviews',
      bronze: false,
      silver: true,
      gold: true,
    },
    {
      name: 'Analytics Access',
      description: 'View detailed analytics and insights',
      bronze: false,
      silver: false,
      gold: true,
    },
    {
      name: 'Monthly Reports',
      description: 'Receive monthly performance reports',
      bronze: false,
      silver: false,
      gold: true,
    },
    {
      name: 'All Notifications',
      description: 'Access to all notification features',
      bronze: false,
      silver: false,
      gold: true,
    },
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : (
        <X className="h-5 w-5 text-gray-400" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const getPlanColor = (planName: PlanType) => {
    switch (planName) {
      case 'BRONZE':
        return 'border-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'SILVER':
        return 'border-gray-400 bg-gray-50 dark:bg-gray-800/50';
      case 'GOLD':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return '';
    }
  };

  if (isMobile) {
    // Mobile: Accordion layout with better design
    return (
      <div className={`space-y-4 ${className}`}>
        {plans.map((plan) => {
          const isExpanded = expandedPlan === plan.name;
          const isCurrent = currentPlanName === plan.name;

          return (
            <Card
              key={plan.id}
              className={`border transition-all ${
                isCurrent
                  ? 'border-2 border-primary shadow-md'
                  : 'border-gray-200 dark:border-gray-700'
              } ${getPlanColor(plan.name)}`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedPlan(isExpanded ? null : plan.name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-poppins font-bold text-charcoal mb-1">
                      {plan.displayName}
                    </CardTitle>
                    {isCurrent && (
                      <span className="inline-block rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white mt-1">
                        Current Plan
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="space-y-3 pt-0">
                  {features.map((feature, idx) => {
                    const planValue =
                      plan.name === 'BRONZE'
                        ? feature.bronze
                        : plan.name === 'SILVER'
                          ? feature.silver
                          : feature.gold;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {feature.name}
                            </span>
                            {feature.description && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs max-w-xs">{feature.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">{renderFeatureValue(planValue)}</div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <Card className={`border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-poppins font-bold text-charcoal">
          Plan Comparison
        </CardTitle>
        <CardDescription className="text-sm">
          Compare features across all available plans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                <TableHead className="w-[220px] font-poppins font-semibold text-charcoal">
                  Feature
                </TableHead>
                {plans.map((plan) => (
                  <TableHead
                    key={plan.id}
                    className={`text-center font-poppins font-semibold text-charcoal ${
                      currentPlanName === plan.name ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base">{plan.displayName}</span>
                      {currentPlanName === plan.name && (
                        <span className="text-xs text-primary font-medium">(Current)</span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature, idx) => (
                <TableRow key={idx} className="border-b border-gray-100 dark:border-gray-800">
                  <TableCell className="font-medium py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {feature.name}
                      </span>
                      {feature.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs">{feature.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-center py-4 ${
                      currentPlanName === 'BRONZE' ? 'bg-primary/5' : ''
                    }`}
                  >
                    {renderFeatureValue(feature.bronze)}
                  </TableCell>
                  <TableCell
                    className={`text-center py-4 ${
                      currentPlanName === 'SILVER' ? 'bg-primary/5' : ''
                    }`}
                  >
                    {renderFeatureValue(feature.silver)}
                  </TableCell>
                  <TableCell
                    className={`text-center py-4 ${
                      currentPlanName === 'GOLD' ? 'bg-primary/5' : ''
                    }`}
                  >
                    {renderFeatureValue(feature.gold)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
