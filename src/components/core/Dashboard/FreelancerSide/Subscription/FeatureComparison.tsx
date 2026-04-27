'use client';

import { CheckCircle2, ChevronDown, ChevronUp, X } from 'lucide-react';
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

  // Get all unique features from all plans
  const allFeatures = new Set<string>();
  plans.forEach((plan) => {
    plan.features?.forEach((feature) => allFeatures.add(feature));
  });

  // Create features array from backend data
  const features: Feature[] = Array.from(allFeatures).map((featureName) => {
    const bronzePlan = plans.find((p) => p.name === 'BRONZE');
    const silverPlan = plans.find((p) => p.name === 'SILVER');
    const goldPlan = plans.find((p) => p.name === 'GOLD');

    return {
      name: featureName,
      bronze: bronzePlan?.features?.includes(featureName) || false,
      silver: silverPlan?.features?.includes(featureName) || false,
      gold: goldPlan?.features?.includes(featureName) || false,
    };
  });

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      ) : (
        <X className="h-5 w-5 text-gray-400" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const getPlanColor = (planName: PlanType) => {
    switch (planName) {
      case 'BRONZE':
        return 'border-amber-600 bg-amber-50'
      case 'SILVER':
        return 'border-gray-400 bg-gray-50'
      case 'GOLD':
        return 'border-yellow-500 bg-yellow-50'
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
                  : 'border-gray-200'
              } ${getPlanColor(plan.name)}`}
            >
              <CardHeader
                className="cursor-pointer hover:bg-gray-50/50 transition-colors"
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
                  {plan.features && plan.features.length > 0 ? (
                    plan.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            {feature}
                          </span>
                        </div>
                        <div className="ml-4">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground italic py-2">
                      No features listed
                    </div>
                  )}
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
    <Card className={`border border-gray-200 shadow-sm ${className}`}>
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
              <TableRow className="border-b-2 border-gray-200">
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
              {/*
                Comparison rows come entirely from the backend plan.features
                array so this table stays in sync with the landing page
                pricing section. Don't reintroduce hardcoded rows - update
                the seed (scripts/seed-subscription-plans.ts) instead.
              */}
              {features.length > 0 ? (
                features.map((feature, idx) => {
                  return (
                    <TableRow key={idx} className="border-b border-gray-100">
                      <TableCell className="font-medium py-4">
                        <span className="text-sm text-gray-900">
                          {feature.name}
                        </span>
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
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                    No additional features available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
