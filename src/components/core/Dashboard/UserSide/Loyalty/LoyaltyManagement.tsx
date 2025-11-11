'use client';

import { Award, Gift, Medal } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoyaltySectionSkeleton } from '@/components/ui/skeletons/LoyaltySectionSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getLoyaltyProfile,
  getLoyaltyRewards,
  getRedemptionHistory,
  redeemReward,
} from '@/redux/api/loyaltyApi';
import { RootState } from '@/redux/store';
import { LoyaltyTier } from '@/types/types';

export default function LoyaltyManagement() {
  const dispatch = useDispatch();
  const { profile, rewards, redemptions, isLoading, isRedeeming } = useSelector(
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
        return 'bg-orange-500';
      case 'SILVER':
        return 'bg-gray-400';
      case 'GOLD':
        return 'bg-yellow-500';
      case 'PLATINUM':
        return 'bg-purple-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getTierIcon = (tier: LoyaltyTier) => {
    if (tier === 'PLATINUM') {
      return <Award className="h-5 w-5" />;
    }
    return <Medal className="h-5 w-5" />;
  };

  if (isLoading && !profile) {
    return <LoyaltySectionSkeleton />;
  }

  // Show skeleton as fallback when no profile data is available
  if (!profile) {
    return <LoyaltySectionSkeleton />;
  }

  const progressPercentage = Math.min(
    profile.pointsToNextTier > 0 ? (profile.availablePoints / profile.pointsToNextTier) * 100 : 100,
    100,
  );
  const pointsRemaining = Math.max(0, profile.pointsToNextTier - profile.availablePoints);

  // Combine history (recent transactions and redemptions)
  const recentTransactions = profile.pointTransactions?.slice(0, 5) || [];
  const recentRedemptions = redemptions?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Points & Tier Overview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Available Points</p>
            <h2 className="text-4xl font-bold text-gray-900">
              {profile.availablePoints?.toLocaleString() || 0}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full ${getTierColor(profile.tier)} flex items-center justify-center text-white`}
            >
              {getTierIcon(profile.tier)}
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Tier</p>
              <p className="text-lg font-semibold text-gray-900">{profile.tier}</p>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress to {profile.nextTier}</span>
            <span>{pointsRemaining} points remaining</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Tier Benefits */}
        {profile.tierBenefits && profile.tierBenefits.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Your Benefits</p>
            <div className="flex flex-wrap gap-2">
              {profile.tierBenefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rewards & History Tabs */}
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rewards">Available Rewards</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16 ml-2" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse w-full mt-4" />
                </div>
              ))}
            </div>
          ) : rewards && rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canRedeem = profile.availablePoints >= reward.pointsCost;
                return (
                  <div
                    key={reward.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      <Badge variant="secondary" className="ml-2 shrink-0">
                        {reward.pointsCost} pts
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={!canRedeem || isRedeeming}
                      className="w-full mt-4"
                      variant={canRedeem ? 'default' : 'outline'}
                    >
                      {canRedeem ? 'Redeem' : 'Insufficient Points'}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No rewards available</p>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="space-y-4">
            {/* Points Transactions */}
            {recentTransactions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Points Activity</h3>
                <div className="space-y-2">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          transaction.type === 'EARNED' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'EARNED' ? '+' : '-'}
                        {transaction.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Redemptions */}
            {recentRedemptions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Redemptions</h3>
                <div className="space-y-2">
                  {recentRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {redemption.reward.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(redemption.createdAt).toLocaleDateString()}
                        </p>
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
              </div>
            )}

            {recentTransactions.length === 0 && recentRedemptions.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-500">No history available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
