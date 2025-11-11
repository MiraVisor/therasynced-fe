'use client';

import {
  Award,
  CheckCircle,
  Clock,
  Gift,
  History,
  Medal,
  Sparkles,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { LoyaltySectionSkeleton } from '@/components/ui/skeletons/LoyaltySectionSkeleton';
import {
  getLoyaltyProfile,
  getLoyaltyRewards,
  getRedemptionHistory,
  redeemReward,
} from '@/redux/api/loyaltyApi';
import { RootState } from '@/redux/store';
import { LoyaltyTier } from '@/types/types';

export default function LoyaltyPage() {
  const dispatch = useDispatch();
  const { profile, rewards, redemptions, isLoading, isRedeeming, error } = useSelector(
    (state: RootState) => state.loyalty,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getLoyaltyProfile() as any),
          dispatch(getLoyaltyRewards() as any),
          dispatch(getRedemptionHistory() as any),
        ]);
      } catch (error) {
        toast.error('Failed to load loyalty information. Please try again.');
      }
    };

    fetchData();
  }, [dispatch]);

  const handleRedeem = async (rewardId: string) => {
    try {
      const result = await dispatch(redeemReward(rewardId) as any);
      if (redeemReward.fulfilled.match(result)) {
        toast.success('Reward redeemed successfully!');
        // Refresh data
        dispatch(getLoyaltyProfile() as any);
        dispatch(getRedemptionHistory() as any);
      }
    } catch (error) {
      toast.error('Failed to redeem reward');
    }
  };

  const getTierColor = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'SILVER':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierIcon = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'BRONZE':
        return <Medal className="h-5 w-5" />;
      case 'SILVER':
        return <Medal className="h-5 w-5" />;
      case 'GOLD':
        return <Medal className="h-5 w-5" />;
      case 'PLATINUM':
        return <Award className="h-5 w-5" />;
      default:
        return <Medal className="h-5 w-5" />;
    }
  };

  if (isLoading && !profile) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
            <p className="text-gray-600">Earn points and redeem rewards</p>
          </div>
        }
      >
        <LoyaltySectionSkeleton />
      </DashboardPageWrapper>
    );
  }

  // Show skeleton as fallback when no profile data is available
  if (!profile) {
    return (
      <DashboardPageWrapper
        header={
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
            <p className="text-gray-600">Earn points and redeem rewards</p>
          </div>
        }
      >
        <LoyaltySectionSkeleton />
      </DashboardPageWrapper>
    );
  }

  const progressPercentage =
    profile.pointsToNextTier > 0 ? (profile.availablePoints / profile.pointsToNextTier) * 100 : 100;

  return (
    <DashboardPageWrapper
      header={
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loyalty Program</h1>
          <p className="text-gray-600">Earn points and redeem rewards</p>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Hero Section - Points and Tier */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  {profile.availablePoints ? profile.availablePoints.toLocaleString() : 0}
                </h2>
                <p className="text-lg text-gray-600 mb-6">Available Points</p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress to {profile.nextTier}</span>
                    <span>
                      {profile.pointsToNextTier - profile.availablePoints} points remaining
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className={`px-6 py-4 rounded-lg border-2 ${getTierColor(profile.tier)}`}>
                  <div className="flex items-center gap-2">
                    {getTierIcon(profile.tier)}
                    <span className="text-lg font-bold">{profile.tier}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  Current Tier
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Tier Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.tierBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Available Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4" />
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
                  </div>
                ))}
              </div>
            ) : rewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => {
                  const canRedeem = profile.availablePoints >= reward.pointsCost;
                  return (
                    <div
                      key={reward.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                        <Badge variant="secondary">{reward.pointsCost} pts</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                      <Button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={!canRedeem || isRedeeming}
                        className="w-full"
                        variant={canRedeem ? 'default' : 'outline'}
                      >
                        {canRedeem ? 'Redeem' : 'Insufficient Points'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No rewards available</div>
            )}
          </CardContent>
        </Card>

        {/* Points History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Points History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.pointTransactions && profile.pointTransactions.length > 0 ? (
              <div className="space-y-3">
                {profile.pointTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.type === 'EARNED' ? (
                        <div className="p-2 rounded-full bg-green-100">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-red-100">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${transaction.type === 'EARNED' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {transaction.type === 'EARNED' ? '+' : '-'}
                      {transaction.points}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No transaction history</div>
            )}
          </CardContent>
        </Card>

        {/* Redemption History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Redemption History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {redemptions.length > 0 ? (
              <div className="space-y-3">
                {redemptions.map((redemption) => (
                  <div
                    key={redemption.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Gift className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {redemption.reward.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(redemption.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        redemption.status === 'FULFILLED'
                          ? 'default'
                          : redemption.status === 'PENDING'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {redemption.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No redemptions yet</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageWrapper>
  );
}
