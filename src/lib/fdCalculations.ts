/**
 * Utility functions for Fixed Deposit calculations
 * These are reusable for any tenure-based investment
 */

export interface FDCalculationInput {
  principal: number;
  interestRate: number; // Annual interest rate as percentage (e.g., 7.5 for 7.5%)
  startDate: Date;
  tenureValue: number;
  tenureUnit: 'months' | 'years';
  compoundingFrequency?: number; // Times per year, default 4 (quarterly)
}

export interface FDCalculationResult {
  maturityDate: Date;
  maturityAmount: number;
  currentValue: number;
  interestEarnedTillDate: number;
  totalInterest: number;
  isMatured: boolean;
  daysElapsed: number;
  totalDays: number;
  progressPercent: number;
}

/**
 * Convert tenure to months for consistent calculations
 */
export function tenureToMonths(value: number, unit: 'months' | 'years'): number {
  return unit === 'years' ? value * 12 : value;
}

/**
 * Calculate maturity date from start date and tenure
 */
export function calculateMaturityDate(
  startDate: Date,
  tenureValue: number,
  tenureUnit: 'months' | 'years'
): Date {
  const maturityDate = new Date(startDate);
  const months = tenureToMonths(tenureValue, tenureUnit);
  maturityDate.setMonth(maturityDate.getMonth() + months);
  return maturityDate;
}

/**
 * Calculate compound interest maturity amount
 * Formula: A = P(1 + r/n)^(nt)
 * Where:
 *   P = Principal
 *   r = Annual interest rate (decimal)
 *   n = Compounding frequency per year
 *   t = Time in years
 */
export function calculateMaturityAmount(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  compoundingFrequency: number = 4 // Quarterly by default
): number {
  const r = annualRate / 100;
  const t = tenureMonths / 12;
  const n = compoundingFrequency;
  
  const amount = principal * Math.pow(1 + r / n, n * t);
  return Math.round(amount);
}

/**
 * Calculate current value of FD based on elapsed time
 * Uses the same compound interest formula but with elapsed time
 */
export function calculateCurrentValue(
  principal: number,
  annualRate: number,
  startDate: Date,
  maturityDate: Date,
  maturityAmount: number,
  compoundingFrequency: number = 4
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const maturity = new Date(maturityDate);
  maturity.setHours(0, 0, 0, 0);
  
  // If matured, return maturity amount
  if (today >= maturity) {
    return maturityAmount;
  }
  
  // If not yet started, return principal
  if (today < start) {
    return principal;
  }
  
  // Calculate elapsed time in years
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((today.getTime() - start.getTime()) / msPerDay);
  const yearsElapsed = daysElapsed / 365;
  
  const r = annualRate / 100;
  const n = compoundingFrequency;
  
  const currentValue = principal * Math.pow(1 + r / n, n * yearsElapsed);
  return Math.round(currentValue);
}

/**
 * Complete FD calculation with all values
 */
export function calculateFDDetails(input: FDCalculationInput): FDCalculationResult {
  const { principal, interestRate, startDate, tenureValue, tenureUnit, compoundingFrequency = 4 } = input;
  
  const tenureMonths = tenureToMonths(tenureValue, tenureUnit);
  const maturityDate = calculateMaturityDate(startDate, tenureValue, tenureUnit);
  const maturityAmount = calculateMaturityAmount(principal, interestRate, tenureMonths, compoundingFrequency);
  const totalInterest = maturityAmount - principal;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const maturity = new Date(maturityDate);
  maturity.setHours(0, 0, 0, 0);
  
  const isMatured = today >= maturity;
  
  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(1, Math.floor((maturity.getTime() - start.getTime()) / msPerDay));
  const daysElapsed = Math.min(
    totalDays,
    Math.max(0, Math.floor((today.getTime() - start.getTime()) / msPerDay))
  );
  
  const currentValue = isMatured 
    ? maturityAmount 
    : calculateCurrentValue(principal, interestRate, startDate, maturityDate, maturityAmount, compoundingFrequency);
  
  const interestEarnedTillDate = currentValue - principal;
  const progressPercent = Math.min(100, (daysElapsed / totalDays) * 100);
  
  return {
    maturityDate,
    maturityAmount,
    currentValue,
    interestEarnedTillDate,
    totalInterest,
    isMatured,
    daysElapsed,
    totalDays,
    progressPercent,
  };
}

/**
 * Format tenure for display
 */
export function formatTenure(value: number, unit: 'months' | 'years'): string {
  if (unit === 'years') {
    return value === 1 ? '1 Year' : `${value} Years`;
  }
  return value === 1 ? '1 Month' : `${value} Months`;
}

/**
 * Parse date string to Date object safely
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}
