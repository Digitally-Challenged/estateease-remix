import React from 'react';

import { TrendingUp, Users, User, ScrollText, Building2 } from 'lucide-react';

import Card from '../common/Card';

interface OwnershipTotals {
  joint: number;
  nick: number;
  kelsey: number;
  trust: number;
  business: number;
  total: number;
}

interface AssetStatsOverviewProps {
  ownershipTotals: OwnershipTotals;
  totalAssets: number;
}

const AssetStatsOverview: React.FC<AssetStatsOverviewProps> = ({
  ownershipTotals,
  totalAssets,
}) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-DEFAULT" />
        Portfolio Overview
      </h2>

      {/* Primary Total */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6">
        <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Total Portfolio Value
        </p>
        <p className="text-4xl font-bold text-primary-DEFAULT dark:text-primary-light">
          ${ownershipTotals.total.toLocaleString()}
        </p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Across {totalAssets} assets
        </p>
      </div>

      {/* Ownership Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Joint</p>
          </div>
          <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            ${ownershipTotals.joint.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {((ownershipTotals.joint / ownershipTotals.total) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nick's</p>
          </div>
          <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            ${ownershipTotals.nick.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {((ownershipTotals.nick / ownershipTotals.total) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Kelsey's</p>
          </div>
          <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            ${ownershipTotals.kelsey.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {((ownershipTotals.kelsey / ownershipTotals.total) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Trusts</p>
          </div>
          <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
            ${ownershipTotals.trust.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {((ownershipTotals.trust / ownershipTotals.total) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {ownershipTotals.business > 0 && (
        <div className="mt-4">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Business Assets
              </p>
            </div>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              ${ownershipTotals.business.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {((ownershipTotals.business / ownershipTotals.total) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AssetStatsOverview;
