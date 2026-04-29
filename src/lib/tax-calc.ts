// Shared tax calculation engine — used by IncomeAllocationChart, TaxAuditPanel,
// and funnel-summary so every surface shows identical numbers.

import { UserProfile } from "./types";

export interface TaxBracket {
  upTo: number;
  rate: number;
}

export interface BracketComputation {
  upTo: number;
  rate: number;
  sliceFrom: number;
  sliceTo: number;
  sliceAmount: number;
  taxOnSlice: number;
}

export interface FederalTaxResult {
  filingStatusLabel: "Single" | "MFJ" | "HOH";
  standardDeduction: number;
  taxableIncome: number;
  brackets: BracketComputation[];
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
}

export interface StateTaxResult {
  state: string;
  type: "none" | "flat" | "progressive" | "default";
  flatRate?: number;
  brackets?: BracketComputation[];
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
}

export interface FicaResult {
  ficaWages: number;
  socialSecurityWages: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  totalFica: number;
}

export interface PreTaxPlan {
  planned401k: number;
  plannedHsa: number;
  max401k: number;
  hsaMax: number;
  has401kGoal: boolean;
}

export interface TaxAudit {
  gross: number;
  preTax: PreTaxPlan;
  fedTaxableBase: number;
  stateTaxableBase: number;
  ficaBase: number;
  federal: FederalTaxResult;
  state: StateTaxResult;
  fica: FicaResult;
  totalTax: number;
  netAfterTax: number;
  combinedMarginalRate: number;
  combinedEffectiveRate: number;
}

const FED_BRACKETS_SINGLE: TaxBracket[] = [
  { upTo: 11600, rate: 0.10 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243725, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

const FED_BRACKETS_MFJ: TaxBracket[] = [
  { upTo: 23200, rate: 0.10 },
  { upTo: 94300, rate: 0.12 },
  { upTo: 201050, rate: 0.22 },
  { upTo: 383900, rate: 0.24 },
  { upTo: 487450, rate: 0.32 },
  { upTo: 731200, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

const FED_BRACKETS_HOH: TaxBracket[] = [
  { upTo: 16550, rate: 0.10 },
  { upTo: 63100, rate: 0.12 },
  { upTo: 100500, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243700, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

const STATE_BRACKETS: Record<string, TaxBracket[]> = {
  CA: [
    { upTo: 10412, rate: 0.01 }, { upTo: 24684, rate: 0.02 }, { upTo: 38959, rate: 0.04 },
    { upTo: 54081, rate: 0.06 }, { upTo: 68350, rate: 0.08 }, { upTo: 349137, rate: 0.093 },
    { upTo: 418961, rate: 0.103 }, { upTo: 698271, rate: 0.113 }, { upTo: Infinity, rate: 0.123 },
  ],
  NY: [
    { upTo: 8500, rate: 0.04 }, { upTo: 11700, rate: 0.045 }, { upTo: 13900, rate: 0.0525 },
    { upTo: 80650, rate: 0.055 }, { upTo: 215400, rate: 0.06 }, { upTo: 1077550, rate: 0.0685 },
    { upTo: 5000000, rate: 0.0965 }, { upTo: Infinity, rate: 0.103 },
  ],
  NJ: [
    { upTo: 20000, rate: 0.014 }, { upTo: 35000, rate: 0.0175 }, { upTo: 40000, rate: 0.035 },
    { upTo: 75000, rate: 0.05525 }, { upTo: 500000, rate: 0.0637 }, { upTo: 1000000, rate: 0.0897 },
    { upTo: Infinity, rate: 0.1075 },
  ],
  OR: [
    { upTo: 4300, rate: 0.0475 }, { upTo: 10750, rate: 0.0675 }, { upTo: 125000, rate: 0.0875 },
    { upTo: Infinity, rate: 0.099 },
  ],
  HI: [
    { upTo: 9600, rate: 0.055 }, { upTo: 14400, rate: 0.064 }, { upTo: 19200, rate: 0.068 },
    { upTo: 24000, rate: 0.072 }, { upTo: 36000, rate: 0.076 }, { upTo: 48000, rate: 0.079 },
    { upTo: 150000, rate: 0.0825 }, { upTo: 175000, rate: 0.09 }, { upTo: 200000, rate: 0.10 },
    { upTo: Infinity, rate: 0.11 },
  ],
  MN: [
    { upTo: 31690, rate: 0.0535 }, { upTo: 104090, rate: 0.068 }, { upTo: 193240, rate: 0.0785 },
    { upTo: Infinity, rate: 0.0985 },
  ],
};

const STATE_FLAT: Record<string, number> = {
  CO: 0.044, IL: 0.0495, IN: 0.0315, KY: 0.045, MA: 0.05, MI: 0.0425,
  NC: 0.0475, PA: 0.0307, UT: 0.0485, AZ: 0.025, GA: 0.0549,
};

const NO_TAX_STATES = new Set(["TX", "FL", "NV", "WA", "WY", "SD", "AK", "TN", "NH"]);

function normalizeStatus(status?: string): { key: "married" | "head-of-household" | "single"; label: "Single" | "MFJ" | "HOH" } {
  if (status === "married") return { key: "married", label: "MFJ" };
  if (status === "head-of-household") return { key: "head-of-household", label: "HOH" };
  return { key: "single", label: "Single" };
}

function runBrackets(taxableIncome: number, brackets: TaxBracket[]): { totalTax: number; computations: BracketComputation[]; marginalRate: number } {
  let totalTax = 0;
  let prev = 0;
  const computations: BracketComputation[] = [];
  let marginalRate = brackets[0].rate;

  for (const b of brackets) {
    if (taxableIncome <= prev) break;
    const sliceTo = Math.min(taxableIncome, b.upTo);
    const sliceAmount = sliceTo - prev;
    const taxOnSlice = sliceAmount * b.rate;
    computations.push({
      upTo: b.upTo,
      rate: b.rate,
      sliceFrom: prev,
      sliceTo,
      sliceAmount,
      taxOnSlice,
    });
    totalTax += taxOnSlice;
    marginalRate = b.rate;
    prev = b.upTo;
    if (taxableIncome <= b.upTo) break;
  }

  return { totalTax, computations, marginalRate };
}

export function computeFederal(grossOrTaxable: number, filingStatus?: string, applyStdDeduction = true): FederalTaxResult {
  const status = normalizeStatus(filingStatus);
  const brackets = status.key === "married" ? FED_BRACKETS_MFJ : status.key === "head-of-household" ? FED_BRACKETS_HOH : FED_BRACKETS_SINGLE;
  const standardDeduction = status.key === "married" ? 29200 : status.key === "head-of-household" ? 21900 : 14600;
  const taxableIncome = applyStdDeduction ? Math.max(0, grossOrTaxable - standardDeduction) : grossOrTaxable;
  const { totalTax, computations, marginalRate } = runBrackets(taxableIncome, brackets);

  return {
    filingStatusLabel: status.label,
    standardDeduction,
    taxableIncome,
    brackets: computations,
    totalTax: Math.round(totalTax),
    effectiveRate: grossOrTaxable > 0 ? totalTax / grossOrTaxable : 0,
    marginalRate,
  };
}

export function computeState(income: number, state?: string): StateTaxResult {
  if (!state) {
    const tax = Math.round(income * 0.05);
    return { state: "—", type: "default", taxableIncome: income, totalTax: tax, effectiveRate: 0.05 };
  }
  if (NO_TAX_STATES.has(state)) {
    return { state, type: "none", taxableIncome: income, totalTax: 0, effectiveRate: 0 };
  }
  const brackets = STATE_BRACKETS[state];
  if (brackets) {
    const { totalTax, computations } = runBrackets(income, brackets);
    return {
      state,
      type: "progressive",
      brackets: computations,
      taxableIncome: income,
      totalTax: Math.round(totalTax),
      effectiveRate: income > 0 ? totalTax / income : 0,
    };
  }
  const flatRate = STATE_FLAT[state] ?? 0.05;
  const tax = Math.round(income * flatRate);
  return {
    state,
    type: STATE_FLAT[state] ? "flat" : "default",
    flatRate,
    taxableIncome: income,
    totalTax: tax,
    effectiveRate: flatRate,
  };
}

export function computeFica(ficaBase: number): FicaResult {
  const ssWages = Math.min(ficaBase, 168600);
  const ssTax = ssWages * 0.062;
  const medicareTax = ficaBase * 0.0145;
  const addlMedicare = ficaBase > 200000 ? (ficaBase - 200000) * 0.009 : 0;
  return {
    ficaWages: ficaBase,
    socialSecurityWages: ssWages,
    socialSecurityTax: Math.round(ssTax),
    medicareTax: Math.round(medicareTax),
    additionalMedicareTax: Math.round(addlMedicare),
    totalFica: Math.round(ssTax + medicareTax + addlMedicare),
  };
}

/**
 * Plan pre-tax savings.
 * - Single/HOH: one 401(k) + one HSA based on user's income.
 * - MFJ: each spouse can max their own 401(k) and HSA. We plan based on each spouse's
 *   income separately so we don't over-allocate (e.g., a stay-at-home spouse can't
 *   contribute to a workplace 401(k)).
 */
export function planPreTax(profile: UserProfile, userGross: number): PreTaxPlan {
  const age = profile.age;
  const goals = profile.goals;
  const has401kGoal = goals.includes("retirement") || goals.includes("wealth-building");
  const max401k = age < 50 ? 23000 : 30500;
  const hsaMax = 4150; // self-only HDHP

  const isMFJ = profile.filingStatus === "married";
  const spouseGross = isMFJ ? (profile.spouse?.income ?? 0) : 0;
  const familyHsaMax = isMFJ ? 8300 : hsaMax; // 2024 family HDHP limit when MFJ

  // User's own 401(k) — based on user's wages (can't contribute more than W-2 wages either)
  const user401k = userGross > 0
    ? Math.round(Math.min(max401k, userGross * (has401kGoal ? 0.15 : 0.06), userGross))
    : 0;
  // Spouse's own 401(k) — only if spouse has wages
  const spouse401k = spouseGross > 0
    ? Math.round(Math.min(max401k, spouseGross * (has401kGoal ? 0.15 : 0.06), spouseGross))
    : 0;
  const planned401k = user401k + spouse401k;

  // HSA: needs at least one spouse with HDHP enrollment + sufficient income
  const householdGross = userGross + spouseGross;
  const plannedHsa = householdGross >= 40000 ? familyHsaMax : 0;

  return { planned401k, plannedHsa, max401k, hsaMax: familyHsaMax, has401kGoal };
}

/**
 * Build full tax audit.
 * - For MFJ: combines user + spouse income into household gross before computing taxes.
 *   Federal and state brackets use MFJ; FICA is per-individual (each spouse pays SS up
 *   to their own wage base) — modeled here as the household total split correctly.
 */
export function buildTaxAudit(profile: UserProfile, userGross: number, jobState?: string): TaxAudit {
  const isMFJ = profile.filingStatus === "married";
  const spouseGross = isMFJ ? (profile.spouse?.income ?? 0) : 0;
  const householdGross = userGross + spouseGross;

  const preTax = planPreTax(profile, userGross);
  const fedTaxableBase = Math.max(0, householdGross - preTax.planned401k - preTax.plannedHsa);
  const stateTaxableBase = Math.max(0, householdGross - preTax.planned401k - preTax.plannedHsa);
  // FICA base excludes HSA (cafeteria) for whoever's paystub it runs through.
  // For MFJ we approximate by removing HSA from the household FICA base.
  const ficaBase = Math.max(0, householdGross - preTax.plannedHsa);

  const federal = computeFederal(fedTaxableBase, profile.filingStatus, true);
  const state = computeState(stateTaxableBase, jobState);

  // FICA is per-person (Social Security wage base applies to each spouse separately).
  // Compute each spouse's FICA on their own wages, minus an even split of HSA cafeteria.
  let fica: FicaResult;
  if (isMFJ && spouseGross > 0) {
    const hsaSplit = preTax.plannedHsa / 2;
    const userFicaBase = Math.max(0, userGross - hsaSplit);
    const spouseFicaBase = Math.max(0, spouseGross - hsaSplit);
    const userFica = computeFica(userFicaBase);
    const spouseFica = computeFica(spouseFicaBase);
    fica = {
      ficaWages: userFica.ficaWages + spouseFica.ficaWages,
      socialSecurityWages: userFica.socialSecurityWages + spouseFica.socialSecurityWages,
      socialSecurityTax: userFica.socialSecurityTax + spouseFica.socialSecurityTax,
      medicareTax: userFica.medicareTax + spouseFica.medicareTax,
      additionalMedicareTax: userFica.additionalMedicareTax + spouseFica.additionalMedicareTax,
      totalFica: userFica.totalFica + spouseFica.totalFica,
    };
  } else {
    fica = computeFica(ficaBase);
  }

  const totalTax = federal.totalTax + state.totalTax + fica.totalFica;
  const netAfterTax = householdGross - totalTax;

  const ssMarginal = ficaBase < 168600 ? 0.062 : 0;
  const medicareMarginal = 0.0145 + (ficaBase > 200000 ? 0.009 : 0);
  const stateMarginal = state.type === "progressive" && state.brackets && state.brackets.length > 0
    ? state.brackets[state.brackets.length - 1].rate
    : state.type === "flat" || state.type === "default"
    ? state.flatRate ?? 0.05
    : 0;
  const combinedMarginalRate = federal.marginalRate + stateMarginal + ssMarginal + medicareMarginal;
  const combinedEffectiveRate = householdGross > 0 ? totalTax / householdGross : 0;

  return {
    gross: householdGross,
    preTax,
    fedTaxableBase,
    stateTaxableBase,
    ficaBase,
    federal,
    state,
    fica,
    totalTax,
    netAfterTax,
    combinedMarginalRate,
    combinedEffectiveRate,
  };
}
