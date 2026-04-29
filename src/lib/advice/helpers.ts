import { INCOME_RANGES, UserProfile, FilingStatus } from "../types";

export function getIncomeIndex(income?: string): number {
  if (!income) return -1;
  return INCOME_RANGES.indexOf(income);
}

export function isLowIncome(income?: string): boolean {
  const idx = getIncomeIndex(income);
  return idx >= 0 && idx <= 1; // Under $50K
}

export function isHighIncome(income?: string): boolean {
  const idx = getIncomeIndex(income);
  return idx >= 4; // $100K+
}

/** Convert an INCOME_RANGES bucket to an approximate numeric midpoint. */
function incomeBucketToNumber(income?: string): number {
  const idx = getIncomeIndex(income);
  const midpoints = [20000, 40000, 62500, 87500, 125000, 200000, 350000];
  return idx >= 0 ? midpoints[idx] : 0;
}

/**
 * Best estimate of household gross income (combines W-2 / 3yr expected /
 * historical / bucket selection, plus spouse income when filing jointly).
 */
export function estimateHouseholdIncome(profile: UserProfile): number {
  const self =
    profile.expectedIncome3yr ||
    profile.averageHistoricalIncome ||
    profile.w2Data?.grossIncome ||
    incomeBucketToNumber(profile.income);

  const spouse =
    profile.filingStatus === "married"
      ? profile.spouse?.income || 0
      : 0;

  return (self || 0) + spouse;
}

/**
 * 2025/2026 Roth IRA direct contribution phase-outs (approx.):
 *  - Single / HoH: phase-out $150K–$165K (2025), $161K–$176K (2026).
 *  - MFJ: phase-out $236K–$246K (2025), $246K–$256K (2026).
 * We use the upper bound as the hard cutoff for "fully eligible".
 */
export function rothIRAEligibility(
  householdIncome: number,
  filingStatus?: FilingStatus
): "eligible" | "phaseout" | "ineligible" {
  const isMarried = filingStatus === "married";
  const lower = isMarried ? 236000 : 150000;
  const upper = isMarried ? 256000 : 176000;
  if (householdIncome <= lower) return "eligible";
  if (householdIncome < upper) return "phaseout";
  return "ineligible";
}

/** IRS Free File AGI cap (2024 filing season: $84K). */
export function isFreeFileEligible(householdIncome: number): boolean {
  return householdIncome > 0 && householdIncome <= 84000;
}

/** Saver's Credit upper AGI thresholds (2025): $79,500 MFJ, $59,625 HoH, $39,750 single. */
export function isSaversCreditEligible(
  householdIncome: number,
  filingStatus?: FilingStatus
): boolean {
  if (!householdIncome) return false;
  if (filingStatus === "married") return householdIncome <= 79500;
  if (filingStatus === "head-of-household") return householdIncome <= 59625;
  return householdIncome <= 39750;
}
