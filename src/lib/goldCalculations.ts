export type GoldType = "digital" | "physical" | "sgb";

export interface GoldInvestmentDetails {
  investedValue: number;
  purchasePricePerGram: number;
  goldType: GoldType;
  investmentDate: Date;
  sgbInterestRate?: number;
  sgbMaturityDate?: Date;
}

export interface GoldCalculationResult {
  weightInGrams: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  holdingPeriodDays: number;
  // SGB-specific
  accruedInterest?: number;
  sgbTotalValue?: number;
}

/**
 * Calculate gold weight from invested amount
 */
export function calculateGoldWeight(
  investedAmount: number,
  purchasePricePerGram: number
): number {
  if (purchasePricePerGram <= 0) return 0;
  // Round to 4 decimal places for precision
  return Math.round((investedAmount / purchasePricePerGram) * 10000) / 10000;
}

/**
 * Calculate current value from weight and current price
 */
export function calculateGoldCurrentValue(
  weightInGrams: number,
  currentPricePerGram: number
): number {
  return Math.round(weightInGrams * currentPricePerGram * 100) / 100;
}

/**
 * Calculate SGB accrued interest (paid semi-annually at 2.5% p.a.)
 */
export function calculateSGBAccruedInterest(
  investedAmount: number,
  interestRate: number,
  investmentDate: Date,
  currentDate: Date = new Date()
): number {
  const daysDiff = Math.floor(
    (currentDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const yearsFraction = daysDiff / 365;
  // Simple interest for SGB (paid semi-annually)
  return Math.round(investedAmount * (interestRate / 100) * yearsFraction * 100) / 100;
}

/**
 * Full gold investment calculation
 */
export function calculateGoldDetails(
  details: GoldInvestmentDetails,
  currentPricePerGram: number
): GoldCalculationResult {
  const {
    investedValue,
    purchasePricePerGram,
    goldType,
    investmentDate,
    sgbInterestRate,
  } = details;

  const today = new Date();
  const holdingPeriodDays = Math.floor(
    (today.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate weight
  const weightInGrams = calculateGoldWeight(investedValue, purchasePricePerGram);

  // Calculate current market value
  const currentValue = calculateGoldCurrentValue(weightInGrams, currentPricePerGram);

  // Calculate gain/loss
  const gainLoss = currentValue - investedValue;
  const gainLossPercent =
    investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

  // Base result
  const result: GoldCalculationResult = {
    weightInGrams,
    currentValue: Math.round(currentValue * 100) / 100,
    gainLoss: Math.round(gainLoss * 100) / 100,
    gainLossPercent: Math.round(gainLossPercent * 100) / 100,
    holdingPeriodDays,
  };

  // Add SGB-specific calculations
  if (goldType === "sgb" && sgbInterestRate) {
    const accruedInterest = calculateSGBAccruedInterest(
      investedValue,
      sgbInterestRate,
      investmentDate,
      today
    );
    result.accruedInterest = accruedInterest;
    result.sgbTotalValue = Math.round((currentValue + accruedInterest) * 100) / 100;
  }

  return result;
}

/**
 * Format gold weight for display
 */
export function formatGoldWeight(grams: number): string {
  if (grams >= 1) {
    return `${grams.toFixed(3)} g`;
  }
  // Show in milligrams for very small amounts
  return `${(grams * 1000).toFixed(2)} mg`;
}
