/**
 * Advanced Tax Calculation Engine for EstateEase
 * Comprehensive tax planning and optimization calculations
 */

import {
  FEDERAL_ESTATE_TAX_EXEMPTION,
  FEDERAL_ESTATE_TAX_RATE,
  GIFT_TAX_ANNUAL_EXCLUSION,
  GST_TAX,
  STATE_TAX_INFO,
  STANDARD_DEDUCTION_2025,
} from "~/data/financial-constants";

import type { Asset } from "~/types";

// =================================
// TAX CALCULATION TYPES
// =================================

export interface ComprehensiveTaxAnalysis {
  federalIncomeTax: number;
  stateIncomeTax: number;
  capitalGainsTax: number;
  estateTax: EstateTaxDetails;
  giftTax: GiftTaxDetails;
  gstTax: number;
  totalAnnualTaxLiability: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  recommendations: TaxRecommendation[];
}

export interface EstateTaxDetails {
  grossEstate: number;
  deductions: number;
  taxableEstate: number;
  federalEstateTax: number;
  stateEstateTax: number;
  totalEstateTax: number;
  exemptionUsed: number;
  exemptionRemaining: number;
}

export interface GiftTaxDetails {
  annualGifts: number;
  lifetimeGifts: number;
  exemptionUsed: number;
  exemptionRemaining: number;
  currentYearTax: number;
  projectedLifetimeTax: number;
}

export interface TaxRecommendation {
  type: "income" | "estate" | "gift" | "gst" | "investment";
  priority: "immediate" | "high" | "medium" | "low";
  strategy: string;
  potentialSavings: number;
  implementationCost: number;
  timeframe: string;
  riskLevel: "low" | "medium" | "high";
}

export interface TaxProjection {
  year: number;
  income: number;
  incomeTax: number;
  estateTax: number;
  totalTax: number;
  netWorth: number;
  effectiveRate: number;
}

// =================================
// FEDERAL ESTATE TAX CALCULATOR
// =================================

export class FederalEstateTaxCalculator {
  /**
   * Calculate federal estate tax with advanced deductions and credits
   */
  static calculateEstateTax(
    grossEstate: number,
    maritalDeduction: number = 0,
    charitableDeduction: number = 0,
    priorGifts: number = 0,
    year: number = 2025,
  ): EstateTaxDetails {
    // Get exemption amount for the year
    const exemption = year >= 2025 ? FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL : 13610000;

    // Calculate deductions
    const totalDeductions = maritalDeduction + charitableDeduction;
    const adjustedGrossEstate = grossEstate - totalDeductions;

    // Calculate taxable estate (gross estate minus deductions and exemption)
    const exemptionUsed = Math.min(exemption, adjustedGrossEstate + priorGifts);
    const taxableEstate = Math.max(0, adjustedGrossEstate - (exemption - priorGifts));

    // Calculate federal estate tax
    const federalEstateTax =
      this.calculateTaxFromTable(taxableEstate + priorGifts) -
      this.calculateTaxFromTable(priorGifts);

    const exemptionRemaining = Math.max(0, exemption - exemptionUsed);

    return {
      grossEstate,
      deductions: totalDeductions,
      taxableEstate,
      federalEstateTax: Math.max(0, federalEstateTax),
      stateEstateTax: 0, // Will be calculated separately
      totalEstateTax: Math.max(0, federalEstateTax),
      exemptionUsed,
      exemptionRemaining,
    };
  }

  /**
   * Calculate tax using federal estate tax table
   */
  private static calculateTaxFromTable(taxableAmount: number): number {
    if (taxableAmount <= 0) return 0;

    // Simplified calculation - actual IRS table has brackets
    // For amounts over the exemption, flat 40% rate applies
    return taxableAmount * FEDERAL_ESTATE_TAX_RATE;
  }

  /**
   * Project estate tax over multiple years with growth assumptions
   */
  static projectEstateTax(
    currentNetWorth: number,
    growthRate: number = 0.05,
    projectionYears: number = 20,
    annualGifting: number = 0,
  ): TaxProjection[] {
    const projections: TaxProjection[] = [];
    let netWorth = currentNetWorth;
    let cumulativeGifts = 0;

    for (let year = 1; year <= projectionYears; year++) {
      // Apply growth
      netWorth *= 1 + growthRate;

      // Subtract annual gifting
      netWorth -= annualGifting;
      cumulativeGifts += annualGifting;

      // Calculate estate tax for this year
      const estateTaxDetails = this.calculateEstateTax(netWorth, 0, 0, cumulativeGifts);

      projections.push({
        year: new Date().getFullYear() + year,
        income: 0, // Would need income data
        incomeTax: 0, // Would need income data
        estateTax: estateTaxDetails.federalEstateTax,
        totalTax: estateTaxDetails.federalEstateTax,
        netWorth,
        effectiveRate: netWorth > 0 ? (estateTaxDetails.federalEstateTax / netWorth) * 100 : 0,
      });
    }

    return projections;
  }
}

// =================================
// STATE ESTATE TAX CALCULATOR
// =================================

export class StateEstateTaxCalculator {
  /**
   * Calculate state estate tax based on domicile state
   */
  static calculateStateEstateTax(
    grossEstate: number,
    state: string,
    federalTaxableEstate: number,
  ): number {
    const stateInfo = STATE_TAX_INFO.ESTATE_TAX_STATES.find((s) =>
      s.state.toLowerCase().includes(state.toLowerCase()),
    );

    if (!stateInfo) return 0;

    const stateTaxableEstate = Math.max(0, grossEstate - stateInfo.exemption);

    // Use graduated rate structure (simplified)
    if (stateTaxableEstate <= 1000000) {
      return stateTaxableEstate * stateInfo.minRate;
    } else {
      return 1000000 * stateInfo.minRate + (stateTaxableEstate - 1000000) * stateInfo.maxRate;
    }
  }

  /**
   * Get state tax information for planning purposes
   */
  static getStateTaxInfo(state: string) {
    return (
      STATE_TAX_INFO.ESTATE_TAX_STATES.find((s) =>
        s.state.toLowerCase().includes(state.toLowerCase()),
      ) || null
    );
  }
}

// =================================
// GIFT TAX CALCULATOR
// =================================

export class GiftTaxCalculator {
  /**
   * Calculate gift tax liability and exemption usage
   */
  static calculateGiftTax(
    currentYearGifts: Array<{ recipient: string; amount: number }>,
    priorLifetimeGifts: number = 0,
    year: number = 2025,
  ): GiftTaxDetails {
    const annualExclusion = GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT;
    const lifetimeExemption = FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL;

    // Calculate taxable gifts for current year
    let currentYearTaxableGifts = 0;
    const totalCurrentYearGifts = currentYearGifts.reduce((sum, gift) => {
      const taxableAmount = Math.max(0, gift.amount - annualExclusion);
      currentYearTaxableGifts += taxableAmount;
      return sum + gift.amount;
    }, 0);

    // Calculate lifetime exemption usage
    const totalLifetimeGifts = priorLifetimeGifts + currentYearTaxableGifts;
    const exemptionUsed = Math.min(lifetimeExemption, totalLifetimeGifts);
    const exemptionRemaining = lifetimeExemption - exemptionUsed;

    // Calculate current year gift tax
    const currentYearTax =
      exemptionRemaining >= currentYearTaxableGifts
        ? 0
        : (currentYearTaxableGifts - exemptionRemaining) * FEDERAL_ESTATE_TAX_RATE;

    // Project lifetime gift tax
    const projectedLifetimeTax = Math.max(
      0,
      (totalLifetimeGifts - lifetimeExemption) * FEDERAL_ESTATE_TAX_RATE,
    );

    return {
      annualGifts: totalCurrentYearGifts,
      lifetimeGifts: totalLifetimeGifts,
      exemptionUsed,
      exemptionRemaining,
      currentYearTax,
      projectedLifetimeTax,
    };
  }

  /**
   * Calculate optimal gifting strategy
   */
  static calculateOptimalGiftingStrategy(
    netWorth: number,
    numberOfRecipients: number,
    yearsToGift: number,
    targetEstateTaxReduction: number,
  ): {
    annualGiftPerRecipient: number;
    totalAnnualGifting: number;
    totalGiftingProgram: number;
    estateTaxSavings: number;
    presentValueOfSavings: number;
    recommendedStrategy: string;
  } {
    const annualExclusion = GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT;
    const maxAnnualGifting = annualExclusion * numberOfRecipients;
    const maxTotalGifting = maxAnnualGifting * yearsToGift;

    // Calculate required gifting to achieve target reduction
    const requiredGifting = targetEstateTaxReduction / FEDERAL_ESTATE_TAX_RATE;
    const feasibleGifting = Math.min(requiredGifting, maxTotalGifting);

    const annualGiftPerRecipient = feasibleGifting / (numberOfRecipients * yearsToGift);
    const totalAnnualGifting = annualGiftPerRecipient * numberOfRecipients;

    const estateTaxSavings = feasibleGifting * FEDERAL_ESTATE_TAX_RATE;

    // Present value calculation (assuming 3% discount rate)
    const discountRate = 0.03;
    const presentValueOfSavings = estateTaxSavings / Math.pow(1 + discountRate, yearsToGift);

    let recommendedStrategy = "";
    if (annualGiftPerRecipient <= annualExclusion) {
      recommendedStrategy = "Use annual exclusion gifts - no gift tax liability";
    } else if (annualGiftPerRecipient <= annualExclusion * 2) {
      recommendedStrategy = "Consider using lifetime exemption for additional gifts";
    } else {
      recommendedStrategy = "Gifts exceed practical limits - consider other strategies";
    }

    return {
      annualGiftPerRecipient: Math.min(annualGiftPerRecipient, annualExclusion * 2),
      totalAnnualGifting: Math.min(totalAnnualGifting, maxAnnualGifting * 2),
      totalGiftingProgram: feasibleGifting,
      estateTaxSavings,
      presentValueOfSavings,
      recommendedStrategy,
    };
  }
}

// =================================
// GENERATION SKIPPING TAX CALCULATOR
// =================================

export class GenerationSkippingTaxCalculator {
  /**
   * Calculate GST tax liability
   */
  static calculateGST(
    transferAmount: number,
    priorGSTExemptionUsed: number = 0,
    isDirectSkip: boolean = true,
  ): {
    exemptionUsed: number;
    exemptionRemaining: number;
    gstTax: number;
    effectiveRate: number;
  } {
    const gstExemption = GST_TAX.EXEMPTION;
    const exemptionRemaining = Math.max(0, gstExemption - priorGSTExemptionUsed);
    const exemptionUsed = Math.min(exemptionRemaining, transferAmount);
    const taxableAmount = Math.max(0, transferAmount - exemptionUsed);

    const gstTax = taxableAmount * GST_TAX.RATE;
    const effectiveRate = transferAmount > 0 ? (gstTax / transferAmount) * 100 : 0;

    return {
      exemptionUsed,
      exemptionRemaining: exemptionRemaining - exemptionUsed,
      gstTax,
      effectiveRate,
    };
  }

  /**
   * Calculate optimal GST exemption allocation
   */
  static optimizeGSTExemptionAllocation(
    transfers: Array<{
      amount: number;
      appreciationPotential: number; // annual rate
      timeHorizon: number; // years
    }>,
  ): Array<{
    transferIndex: number;
    exemptionAllocation: number;
    futureValue: number;
    taxSavings: number;
    priority: number;
  }> {
    return transfers
      .map((transfer, index) => {
        const futureValue =
          transfer.amount * Math.pow(1 + transfer.appreciationPotential, transfer.timeHorizon);
        const taxSavings = futureValue * GST_TAX.RATE;
        const priority = taxSavings / transfer.amount; // Tax savings per dollar of exemption used

        return {
          transferIndex: index,
          exemptionAllocation: transfer.amount,
          futureValue,
          taxSavings,
          priority,
        };
      })
      .sort((a, b) => b.priority - a.priority);
  }
}

// =================================
// INCOME TAX CALCULATOR
// =================================

export class IncomeTaxCalculator {
  /**
   * Calculate federal income tax (simplified)
   */
  static calculateFederalIncomeTax(
    income: number,
    filingStatus: "single" | "marriedJoint" | "marriedSeparate" | "headOfHousehold",
    deductions: number = 0,
  ): {
    grossIncome: number;
    standardDeduction: number;
    totalDeductions: number;
    taxableIncome: number;
    incomeTax: number;
    effectiveRate: number;
    marginalRate: number;
  } {
    // Get standard deduction
    const standardDeductions = {
      single: STANDARD_DEDUCTION_2025.SINGLE,
      marriedJoint: STANDARD_DEDUCTION_2025.MARRIED_FILING_JOINTLY,
      marriedSeparate: STANDARD_DEDUCTION_2025.SINGLE,
      headOfHousehold: STANDARD_DEDUCTION_2025.HEAD_OF_HOUSEHOLD,
    };

    const standardDeduction = standardDeductions[filingStatus];
    const totalDeductions = Math.max(standardDeduction, deductions);
    const taxableIncome = Math.max(0, income - totalDeductions);

    // Calculate tax using brackets (simplified - would need full tax table)
    const incomeTax = this.calculateTaxFromBrackets(taxableIncome, filingStatus);

    const effectiveRate = income > 0 ? (incomeTax / income) * 100 : 0;
    const marginalRate = this.getMarginalRate(taxableIncome, filingStatus);

    return {
      grossIncome: income,
      standardDeduction,
      totalDeductions,
      taxableIncome,
      incomeTax,
      effectiveRate,
      marginalRate,
    };
  }

  private static calculateTaxFromBrackets(taxableIncome: number, filingStatus: string): number {
    // Simplified tax calculation - would need actual tax brackets
    if (taxableIncome <= 50000) return taxableIncome * 0.12;
    if (taxableIncome <= 100000) return 6000 + (taxableIncome - 50000) * 0.22;
    if (taxableIncome <= 200000) return 17000 + (taxableIncome - 100000) * 0.24;
    return 41000 + (taxableIncome - 200000) * 0.32;
  }

  private static getMarginalRate(taxableIncome: number, filingStatus: string): number {
    // Simplified marginal rate calculation
    if (taxableIncome <= 50000) return 12;
    if (taxableIncome <= 100000) return 22;
    if (taxableIncome <= 200000) return 24;
    return 32;
  }
}

// =================================
// COMPREHENSIVE TAX ANALYZER
// =================================

export class ComprehensiveTaxAnalyzer {
  /**
   * Generate complete tax analysis with optimization recommendations
   */
  static analyzeCompleteTaxSituation(
    assets: Asset[],
    income: number,
    filingStatus: "single" | "marriedJoint" | "marriedSeparate" | "headOfHousehold",
    state: string = "CA",
    giftingHistory: number = 0,
  ): ComprehensiveTaxAnalysis {
    const netWorth = assets.reduce((sum, asset) => sum + asset.value, 0);

    // Calculate income tax
    const incomeTaxCalc = IncomeTaxCalculator.calculateFederalIncomeTax(income, filingStatus);

    // Calculate estate tax
    const estateTaxCalc = FederalEstateTaxCalculator.calculateEstateTax(
      netWorth,
      0,
      0,
      giftingHistory,
    );
    const stateEstateTax = StateEstateTaxCalculator.calculateStateEstateTax(
      netWorth,
      state,
      estateTaxCalc.taxableEstate,
    );

    // Calculate capital gains (simplified)
    const capitalGainsTax = this.estimateCapitalGainsTax(assets, filingStatus);

    // Calculate gift tax (no current year gifts assumed)
    const giftTaxCalc = GiftTaxCalculator.calculateGiftTax([], giftingHistory);

    // Calculate GST tax (minimal for most estates)
    const gstCalc = GenerationSkippingTaxCalculator.calculateGST(0, 0);

    const totalAnnualTaxLiability = incomeTaxCalc.incomeTax + capitalGainsTax;
    const effectiveTaxRate = income > 0 ? (totalAnnualTaxLiability / income) * 100 : 0;

    // Generate recommendations
    const recommendations = this.generateTaxRecommendations({
      netWorth,
      income,
      incomeTax: incomeTaxCalc.incomeTax,
      estateTax: estateTaxCalc.federalEstateTax + stateEstateTax,
      exemptionRemaining: estateTaxCalc.exemptionRemaining,
      filingStatus,
    });

    return {
      federalIncomeTax: incomeTaxCalc.incomeTax,
      stateIncomeTax: 0, // Would need state-specific calculation
      capitalGainsTax,
      estateTax: {
        ...estateTaxCalc,
        stateEstateTax,
        totalEstateTax: estateTaxCalc.federalEstateTax + stateEstateTax,
      },
      giftTax: giftTaxCalc,
      gstTax: gstCalc.gstTax,
      totalAnnualTaxLiability,
      effectiveTaxRate,
      marginalTaxRate: incomeTaxCalc.marginalRate,
      recommendations,
    };
  }

  private static estimateCapitalGainsTax(assets: Asset[], filingStatus: string): number {
    // Simplified capital gains calculation
    const investmentAssets = assets.filter((a) => a.category === "FINANCIAL_ACCOUNT");
    const totalInvestments = investmentAssets.reduce((sum, asset) => sum + asset.value, 0);

    // Assume 20% of investments are unrealized gains
    const unrealizedGains = totalInvestments * 0.2;

    // Apply capital gains rate (simplified)
    const rate = filingStatus === "marriedJoint" ? 0.15 : 0.2;
    return unrealizedGains * rate;
  }

  private static generateTaxRecommendations(params: {
    netWorth: number;
    income: number;
    incomeTax: number;
    estateTax: number;
    exemptionRemaining: number;
    filingStatus: string;
  }): TaxRecommendation[] {
    const recommendations: TaxRecommendation[] = [];

    // Estate tax recommendations
    if (params.estateTax > 100000) {
      recommendations.push({
        type: "estate",
        priority: "high",
        strategy: "Implement annual gifting program to reduce taxable estate",
        potentialSavings: Math.min(params.estateTax * 0.3, 200000),
        implementationCost: 5000,
        timeframe: "1-10 years",
        riskLevel: "low",
      });
    }

    // Income tax recommendations
    if (params.incomeTax > 50000) {
      recommendations.push({
        type: "income",
        priority: "medium",
        strategy: "Maximize retirement plan contributions",
        potentialSavings: 23000 * 0.24, // 2025 401k contribution limit
        implementationCost: 0,
        timeframe: "Immediate",
        riskLevel: "low",
      });
    }

    // Investment recommendations
    if (params.netWorth > 1000000) {
      recommendations.push({
        type: "investment",
        priority: "medium",
        strategy: "Consider tax-loss harvesting strategies",
        potentialSavings: params.netWorth * 0.001, // 0.1% of net worth
        implementationCost: 2500,
        timeframe: "Annual",
        riskLevel: "low",
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// =================================
// ALL CALCULATORS EXPORTED ABOVE
// =================================
