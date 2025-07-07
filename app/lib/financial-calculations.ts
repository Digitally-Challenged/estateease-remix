import type { Asset, Trust } from '~/types';
import { PropertyType, FinancialAccountType, OwnershipType } from '~/types/enums';

// Calculate total net worth
export function calculateNetWorth(
  assets: Asset[],
  liabilities: Array<{ amount: number }>
): number {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
  return totalAssets - totalLiabilities;
}

// Calculate asset allocation by category
export function calculateAssetAllocation(assets: Asset[]): Record<string, {
  value: number;
  percentage: number;
  count: number;
}> {
  const total = assets.reduce((sum, asset) => sum + asset.value, 0);
  const allocation: Record<string, { value: number; count: number }> = {};
  
  assets.forEach(asset => {
    if (!allocation[asset.category]) {
      allocation[asset.category] = { value: 0, count: 0 };
    }
    allocation[asset.category].value += asset.value;
    allocation[asset.category].count += 1;
  });
  
  const result: Record<string, { value: number; percentage: number; count: number }> = {};
  Object.entries(allocation).forEach(([category, data]) => {
    result[category] = {
      value: data.value,
      percentage: total > 0 ? (data.value / total) * 100 : 0,
      count: data.count
    };
  });
  
  return result;
}

// Calculate ownership summary
export function calculateOwnershipSummary(assets: Asset[]): {
  trust: number;
  joint: number;
  individual: number;
  business: number;
  total: number;
} {
  const summary = {
    trust: 0,
    joint: 0,
    individual: 0,
    business: 0,
    total: 0
  };
  
  assets.forEach(asset => {
    const ownershipPercentage = asset.ownership?.percentage || 100;
    const value = asset.value * (ownershipPercentage / 100);
    summary.total += value;
    
    switch (asset.ownership?.type?.toLowerCase()) {
      case 'trust':
        summary.trust += value;
        break;
      case 'joint':
        summary.joint += value;
        break;
      case 'individual':
        summary.individual += value;
        break;
      case 'business':
        summary.business += value;
        break;
    }
  });
  
  return summary;
}

// Calculate trust values
export function calculateTrustValues(
  trusts: Trust[],
  assets: Asset[]
): Record<string, number> {
  const trustValues: Record<string, number> = {};
  
  trusts.forEach(trust => {
    trustValues[trust.id] = 0;
  });
  
  assets.forEach(asset => {
    if (asset.ownership?.type === OwnershipType.TRUST && asset.ownership?.trustId) {
      const ownershipPercentage = asset.ownership?.percentage || 100;
      const value = asset.value * (ownershipPercentage / 100);
      if (trustValues[asset.ownership.trustId] !== undefined) {
        trustValues[asset.ownership.trustId] += value;
      }
    }
  });
  
  return trustValues;
}

// Calculate projected estate tax (simplified federal calculation)
export function calculateEstateTax(netWorth: number, year: number = 2024): {
  taxableEstate: number;
  estateTax: number;
  effectiveRate: number;
  exemption: number;
} {
  // Federal estate tax exemptions (2024 values)
  const exemptions: Record<number, number> = {
    2024: 13610000, // $13.61 million per person
    2025: 13990000, // Projected
  };
  
  const exemption = exemptions[year] || exemptions[2024];
  const taxableEstate = Math.max(0, netWorth - exemption);
  
  // Federal estate tax rate is 40% on amounts over exemption
  const estateTax = taxableEstate * 0.40;
  const effectiveRate = netWorth > 0 ? (estateTax / netWorth) * 100 : 0;
  
  return {
    taxableEstate,
    estateTax,
    effectiveRate,
    exemption
  };
}

// Calculate monthly cash flow from assets
export function calculateCashFlow(assets: Asset[]): {
  monthlyIncome: number;
  annualIncome: number;
  incomeGeneratingAssets: number;
} {
  let monthlyIncome = 0;
  let incomeGeneratingAssets = 0;
  
  assets.forEach(asset => {
    // Check if asset has income data (would need to extend Asset type)
    // For now, estimate based on asset type and value
    if ('propertyType' in asset && asset.propertyType === PropertyType.MULTI_FAMILY) {
      // Assume 5% annual yield for rental properties
      monthlyIncome += (asset.value * 0.05) / 12;
      incomeGeneratingAssets++;
    } else if (asset.category === 'FINANCIAL_ACCOUNT' && 'accountType' in asset && asset.accountType === 'INVESTMENT_BROKERAGE') {
      // Assume 3% dividend yield for investment accounts
      monthlyIncome += (asset.value * 0.03) / 12;
      incomeGeneratingAssets++;
    }
  });
  
  return {
    monthlyIncome,
    annualIncome: monthlyIncome * 12,
    incomeGeneratingAssets
  };
}

// Calculate liquidity ratio
export function calculateLiquidity(assets: Asset[]): {
  liquidAssets: number;
  illiquidAssets: number;
  liquidityRatio: number;
} {
  let liquidAssets = 0;
  let illiquidAssets = 0;
  
  const liquidTypes = [
    FinancialAccountType.CHECKING,
    FinancialAccountType.SAVINGS,
    FinancialAccountType.INVESTMENT_BROKERAGE,
    FinancialAccountType.MONEY_MARKET
  ];
  
  assets.forEach(asset => {
    // Check if asset has an accountType property for financial accounts
    if ('accountType' in asset && liquidTypes.includes(asset.accountType as FinancialAccountType)) {
      liquidAssets += asset.value;
    } else {
      illiquidAssets += asset.value;
    }
  });
  
  const total = liquidAssets + illiquidAssets;
  const liquidityRatio = total > 0 ? (liquidAssets / total) * 100 : 0;
  
  return {
    liquidAssets,
    illiquidAssets,
    liquidityRatio
  };
}