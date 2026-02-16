export interface NPVInput {
  cashFlows: number[];
  discountRateFraction: number;
}

export function npv(input: NPVInput): number {
  const { cashFlows, discountRateFraction } = input;
  let sum = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    sum += cashFlows[t] / Math.pow(1 + discountRateFraction, t);
  }
  return sum;
}

export function irr(cashFlows: number[], guess = 0.1, maxIter = 100): number {
  let r = guess;
  for (let i = 0; i < maxIter; i++) {
    let npvVal = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const factor = Math.pow(1 + r, t);
      npvVal += cashFlows[t] / factor;
      dNpv -= (t * cashFlows[t]) / (factor * (1 + r));
    }
    if (Math.abs(npvVal) < 1e-6) return r;
    if (Math.abs(dNpv) < 1e-10) break;
    r = r - npvVal / dNpv;
  }
  return r;
}

/** totalCost in currency, totalProductionM3 in m³ (SI). Returns break-even in currency per m³. */
export interface BreakEvenOilPriceInputSI {
  totalCost: number;
  totalProductionM3: number;
}

export function breakEvenOilPriceSI(input: BreakEvenOilPriceInputSI): number {
  const { totalCost, totalProductionM3 } = input;
  if (totalProductionM3 <= 0) return 0;
  return totalCost / totalProductionM3;
}
