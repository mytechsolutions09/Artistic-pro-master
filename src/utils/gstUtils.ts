/**
 * GST Calculation Utilities
 * 
 * Rates (Inclusive of price):
 * - Posters: 12% GST
 * - Digital PDFs: 18% GST
 * - Others: 0% GST (default)
 */

export const GST_RATES = {
  POSTER: 12,
  DIGITAL: 18,
  DEFAULT: 0
};

/**
 * Get the GST rate (percentage) for a product type.
 */
export function getGSTRate(productType?: string): number {
  if (!productType) return GST_RATES.DEFAULT;
  const type = productType.toLowerCase();
  if (type === 'poster') {
    return GST_RATES.POSTER;
  }
  if (type === 'digital' || type === 'pdf' || type === 'digital pdf') {
    return GST_RATES.DIGITAL;
  }
  return GST_RATES.DEFAULT;
}

/**
 * Calculates the inclusive GST amount for a given total price and rate.
 * Formula: GST = Price - (Price / (1 + Rate / 100))
 */
export function calculateInclusiveGST(totalPrice: number, rate: number): number {
  if (rate <= 0 || totalPrice <= 0) return 0;
  const gstAmount = totalPrice - (totalPrice / (1 + rate / 100));
  // Round to 2 decimal places
  return Math.round(gstAmount * 100) / 100;
}

/**
 * Calculates the taxable value (base price) excluding GST.
 * Formula: Base = Price / (1 + Rate / 100)
 */
export function calculateTaxableValue(totalPrice: number, rate: number): number {
  if (rate <= 0 || totalPrice <= 0) return totalPrice;
  const basePrice = totalPrice / (1 + rate / 100);
  // Round to 2 decimal places
  return Math.round(basePrice * 100) / 100;
}

/**
 * Calculates a summary of GST for a list of items.
 */
export interface GSTSummaryItem {
  rate: number;
  taxableAmount: number;
  gstAmount: number;
  totalPrice: number;
}

export interface GSTSummary {
  totalGST: number;
  totalTaxable: number;
  breakdown: Record<number, GSTSummaryItem>;
}

export function calculateCartGSTSummary(items: Array<{
  selectedProductType?: string;
  selectedPrice: number;
  quantity: number;
}>): GSTSummary {
  const breakdown: Record<number, GSTSummaryItem> = {};
  let totalGST = 0;
  let totalTaxable = 0;

  items.forEach(item => {
    const rate = getGSTRate(item.selectedProductType);
    const totalPrice = item.selectedPrice * item.quantity;
    const gstAmount = calculateInclusiveGST(totalPrice, rate);
    const taxableAmount = totalPrice - gstAmount;

    totalGST += gstAmount;
    totalTaxable += taxableAmount;

    if (!breakdown[rate]) {
      breakdown[rate] = {
        rate,
        taxableAmount: 0,
        gstAmount: 0,
        totalPrice: 0
      };
    }

    breakdown[rate].taxableAmount += taxableAmount;
    breakdown[rate].gstAmount += gstAmount;
    breakdown[rate].totalPrice += totalPrice;
  });

  // Round values
  totalGST = Math.round(totalGST * 100) / 100;
  totalTaxable = Math.round(totalTaxable * 100) / 100;

  Object.keys(breakdown).forEach(key => {
    const rate = Number(key);
    breakdown[rate].taxableAmount = Math.round(breakdown[rate].taxableAmount * 100) / 100;
    breakdown[rate].gstAmount = Math.round(breakdown[rate].gstAmount * 100) / 100;
    breakdown[rate].totalPrice = Math.round(breakdown[rate].totalPrice * 100) / 100;
  });

  return {
    totalGST,
    totalTaxable,
    breakdown
  };
}
