import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile } from "@/lib/types";
import { MetroArea } from "@/lib/metro-data";
import { buildTaxAudit } from "@/lib/tax-calc";
import LinkedText from "./LinkedText";

interface AllocationBucket {
  label: string;
  amount: number;
  color: string;
  icon: string;
  note?: string;
  priority: number;
  breakdown?: string[]; // Step-by-step math explanation
}

interface TimelineInsight {
  homeYearsToSave: number | null;
  homeBuyAge: number | null;
  downPaymentTarget: number | null;
  monthlySavingsForHome: number | null;
}

interface IncomeAllocationChartProps {
  profile: UserProfile;
  metro?: MetroArea | null;
}

function getIncomeNumber(profile: UserProfile): number {
  // Prioritize forward-looking expected income (next 3 years) — that's what
  // the funnel projection should be based on, not historical W-2 averages.
  if (profile.expectedIncome3yr) return profile.expectedIncome3yr;
  if (profile.averageHistoricalIncome) return profile.averageHistoricalIncome;
  if (profile.w2Data?.grossIncome) return profile.w2Data.grossIncome;
  if (!profile.income) return 0;
  const map: Record<string, number> = {
    "Under $30,000": 25000,
    "$30,000 - $50,000": 40000,
    "$50,000 - $75,000": 62500,
    "$75,000 - $100,000": 87500,
    "$100,000 - $150,000": 125000,
    "$150,000 - $250,000": 200000,
    "$250,000+": 300000,
  };
  return map[profile.income] || 75000;
}

// Progressive federal tax (2024 brackets) — returns total tax owed + breakdown
function computeFederalTax(income: number, filingStatus?: string): { tax: number; breakdown: string[] } {
  const single = [
    { upTo: 11600, rate: 0.10 },
    { upTo: 47150, rate: 0.12 },
    { upTo: 100525, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243725, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ];
  const mfj = [
    { upTo: 23200, rate: 0.10 },
    { upTo: 94300, rate: 0.12 },
    { upTo: 201050, rate: 0.22 },
    { upTo: 383900, rate: 0.24 },
    { upTo: 487450, rate: 0.32 },
    { upTo: 731200, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ];
  const hoh = [
    { upTo: 16550, rate: 0.10 },
    { upTo: 63100, rate: 0.12 },
    { upTo: 100500, rate: 0.22 },
    { upTo: 191950, rate: 0.24 },
    { upTo: 243700, rate: 0.32 },
    { upTo: 609350, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ];
  const normalizedStatus = filingStatus === "married" ? "married" : filingStatus === "head-of-household" ? "head-of-household" : "single";
  const brackets = normalizedStatus === "married" ? mfj : normalizedStatus === "head-of-household" ? hoh : single;
  const stdDed = normalizedStatus === "married" ? 29200 : normalizedStatus === "head-of-household" ? 21900 : 14600;
  const statusLabel = normalizedStatus === "married" ? "MFJ" : normalizedStatus === "head-of-household" ? "HOH" : "Single";
  const taxable = Math.max(0, income - stdDed);

  const breakdown: string[] = [
    `Gross income: $${income.toLocaleString()}`,
    `− Standard deduction (${statusLabel} 2024): $${stdDed.toLocaleString()}`,
    `= Taxable income: $${taxable.toLocaleString()}`,
    `Bracket-by-bracket (2024 ${statusLabel}):`,
  ];

  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, b.upTo) - prev;
    const sliceTax = slice * b.rate;
    tax += sliceTax;
    const upper = b.upTo === Infinity ? "∞" : `$${b.upTo.toLocaleString()}`;
    breakdown.push(
      `  $${prev.toLocaleString()}–${upper} @ ${(b.rate * 100).toFixed(0)}% × $${Math.round(slice).toLocaleString()} = $${Math.round(sliceTax).toLocaleString()}`
    );
    prev = b.upTo;
    if (taxable <= b.upTo) break;
  }
  breakdown.push(`Total: $${Math.round(tax).toLocaleString()} (effective ${((tax / income) * 100).toFixed(1)}%)`);
  return { tax: Math.round(tax), breakdown };
}

// Progressive state tax — returns tax + step-by-step breakdown
function computeStateTax(income: number, state?: string): { tax: number; breakdown: string[] } {
  if (!state) {
    const tax = Math.round(income * 0.05);
    return { tax, breakdown: [`No state selected — using 5% estimate.`, `$${income.toLocaleString()} × 5% = $${tax.toLocaleString()}`] };
  }
  const noTax = ["TX", "FL", "NV", "WA", "WY", "SD", "AK", "TN", "NH"];
  if (noTax.includes(state)) {
    return { tax: 0, breakdown: [`${state} has no state income tax.`] };
  }

  const stateBrackets: Record<string, Array<{ upTo: number; rate: number }>> = {
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

  const brackets = stateBrackets[state];
  if (brackets) {
    const breakdown: string[] = [`${state} progressive brackets (2024 Single):`];
    let tax = 0;
    let prev = 0;
    for (const b of brackets) {
      if (income <= prev) break;
      const slice = Math.min(income, b.upTo) - prev;
      const sliceTax = slice * b.rate;
      tax += sliceTax;
      const upper = b.upTo === Infinity ? "∞" : `$${b.upTo.toLocaleString()}`;
      breakdown.push(
        `  $${prev.toLocaleString()}–${upper} @ ${(b.rate * 100).toFixed(2)}% × $${Math.round(slice).toLocaleString()} = $${Math.round(sliceTax).toLocaleString()}`
      );
      prev = b.upTo;
      if (income <= b.upTo) break;
    }
    breakdown.push(`Total: $${Math.round(tax).toLocaleString()} (effective ${((tax / income) * 100).toFixed(2)}%)`);
    return { tax: Math.round(tax), breakdown };
  }

  const flat: Record<string, number> = {
    CO: 0.044, IL: 0.0495, IN: 0.0315, KY: 0.045, MA: 0.05, MI: 0.0425,
    NC: 0.0475, PA: 0.0307, UT: 0.0485, AZ: 0.025, GA: 0.0549,
  };
  const rate = flat[state] ?? 0.05;
  const tax = Math.round(income * rate);
  return {
    tax,
    breakdown: [
      `${state} has a flat ${(rate * 100).toFixed(2)}% state income tax.`,
      `$${income.toLocaleString()} × ${(rate * 100).toFixed(2)}% = $${tax.toLocaleString()}`,
    ],
  };
}

// Monthly minimum discretionary spending floor by state cost-of-living tier
function getMinMonthlyDiscretionary(state?: string): number {
  const veryHigh: Record<string, number> = { CA: 3200, NY: 3000, HI: 3400, MA: 2800, NJ: 2700, CT: 2600, DC: 2900 };
  const high: Record<string, number> = { WA: 2500, CO: 2400, OR: 2400, MD: 2400, VA: 2300, IL: 2200, MN: 2200 };
  if (!state) return 2000;
  if (veryHigh[state]) return veryHigh[state];
  if (high[state]) return high[state];
  return 2000;
}

function computeMonthlyMortgage(homePrice: number, downPct: number, rate: number, years: number): number {
  const loan = homePrice * (1 - downPct / 100);
  const mr = rate / 100 / 12;
  const n = years * 12;
  return loan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}

const COLORS = {
  tax: "hsl(0 55% 50%)",
  stateTax: "hsl(15 60% 48%)",
  fica: "hsl(30 55% 45%)",
  housing: "hsl(210 65% 50%)",
  rent: "hsl(260 45% 55%)",
  retirement: "hsl(43 80% 55%)",
  hsa: "hsl(190 60% 45%)",
  roth: "hsl(142 60% 42%)",
  emergency: "hsl(45 75% 50%)",
  homeDown: "hsl(180 55% 42%)",
  remaining: "hsl(220 15% 55%)",
};

const IncomeAllocationChart = ({ profile, metro }: IncomeAllocationChartProps) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const { buckets, gross, housingScenario, timeline, isHousehold } = useMemo(() => {
    const userGross = getIncomeNumber(profile);
    if (!userGross) return { buckets: [], gross: 0, housingScenario: null, timeline: null as TimelineInsight | null, isHousehold: false };

    const age = profile.age;
    const goals = profile.goals;
    const wantsHome = goals.includes("home-buying");
    const jobState = profile.jobState || metro?.state;

    // === Single source of truth for all tax math (shared with TaxAuditPanel) ===
    const audit = buildTaxAudit(profile, userGross, jobState);
    const gross = audit.gross; // household gross when MFJ; otherwise user gross
    const isHousehold = profile.filingStatus === "married" && (profile.spouse?.income ?? 0) > 0;
    const { preTax, fedTaxableBase, stateTaxableBase, ficaBase, federal, state: stateAudit, fica: ficaAudit, totalTax, netAfterTax } = audit;
    const { planned401k, plannedHsa, max401k, hsaMax, has401kGoal } = preTax;
    const rothMax = profile.age < 50 ? 7000 : 8000;
    const fedTax = federal.totalTax;
    const stateTax = stateAudit.totalTax;
    const fica = ficaAudit.totalFica;

    // Reconstruct human-readable breakdowns from the audit (kept identical to before)
    const fedBreakdown = [
      `Gross income: $${gross.toLocaleString()}`,
      ...(planned401k > 0 ? [`− Pre-tax 401(k) contribution: $${planned401k.toLocaleString()}`] : []),
      ...(plannedHsa > 0 ? [`− Pre-tax HSA contribution: $${plannedHsa.toLocaleString()}`] : []),
      `= Federally taxable wages: $${fedTaxableBase.toLocaleString()}`,
      `− Standard deduction (${federal.filingStatusLabel} 2024): $${federal.standardDeduction.toLocaleString()}`,
      `= Taxable income: $${federal.taxableIncome.toLocaleString()}`,
      ``,
      `Bracket-by-bracket (2024 ${federal.filingStatusLabel}):`,
      ...federal.brackets.map((b) => {
        const upper = b.upTo === Infinity ? "∞" : `$${b.upTo.toLocaleString()}`;
        return `  $${b.sliceFrom.toLocaleString()}–${upper} @ ${(b.rate * 100).toFixed(0)}% × $${Math.round(b.sliceAmount).toLocaleString()} = $${Math.round(b.taxOnSlice).toLocaleString()}`;
      }),
      `Total: $${fedTax.toLocaleString()} (effective ${(federal.effectiveRate * 100).toFixed(1)}% vs gross)`,
      ...(profile.w2Data?.federalTaxWithheld ? [``, `W-2 Box 2 withheld: $${Math.round(profile.w2Data.federalTaxWithheld).toLocaleString()} (reference only).`] : []),
    ];

    const stateBreakdown: string[] = [
      `Gross income: $${gross.toLocaleString()}`,
      ...(planned401k > 0 ? [`− Pre-tax 401(k): $${planned401k.toLocaleString()} (most states conform)`] : []),
      ...(plannedHsa > 0 ? [`− Pre-tax HSA: $${plannedHsa.toLocaleString()}`] : []),
      `= State taxable wages: $${stateTaxableBase.toLocaleString()}`,
      ``,
    ];
    if (stateAudit.type === "none") {
      stateBreakdown.push(`${stateAudit.state} has no state income tax.`);
    } else if (stateAudit.type === "default") {
      stateBreakdown.push(`No state selected — using 5% generic estimate.`, `$${stateTaxableBase.toLocaleString()} × 5% = $${stateTax.toLocaleString()}`);
    } else if (stateAudit.type === "flat") {
      stateBreakdown.push(`${stateAudit.state} flat ${((stateAudit.flatRate ?? 0) * 100).toFixed(2)}% rate.`, `$${stateTaxableBase.toLocaleString()} × ${((stateAudit.flatRate ?? 0) * 100).toFixed(2)}% = $${stateTax.toLocaleString()}`);
    } else if (stateAudit.brackets) {
      stateBreakdown.push(`${stateAudit.state} progressive brackets (2024):`);
      stateAudit.brackets.forEach((b) => {
        const upper = b.upTo === Infinity ? "∞" : `$${b.upTo.toLocaleString()}`;
        stateBreakdown.push(`  $${b.sliceFrom.toLocaleString()}–${upper} @ ${(b.rate * 100).toFixed(2)}% × $${Math.round(b.sliceAmount).toLocaleString()} = $${Math.round(b.taxOnSlice).toLocaleString()}`);
      });
      stateBreakdown.push(`Total: $${stateTax.toLocaleString()} (effective ${(stateAudit.effectiveRate * 100).toFixed(2)}% vs gross)`);
    }
    if (profile.w2Data?.stateTaxWithheld) {
      stateBreakdown.push(``, `W-2 Box 17 withheld: $${Math.round(profile.w2Data.stateTaxWithheld).toLocaleString()} (reference only).`);
    }

    const ficaBreakdown = [
      `FICA wages: $${ficaBase.toLocaleString()}${plannedHsa > 0 ? ` (gross − HSA $${plannedHsa.toLocaleString()}; 401(k) is NOT FICA-exempt)` : ""}`,
      `Social Security: 6.2% on first $168,600`,
      `  $${ficaAudit.socialSecurityWages.toLocaleString()} × 6.2% = $${ficaAudit.socialSecurityTax.toLocaleString()}`,
      `Medicare: 1.45% on all FICA wages`,
      `  $${ficaBase.toLocaleString()} × 1.45% = $${ficaAudit.medicareTax.toLocaleString()}`,
      ...(ficaAudit.additionalMedicareTax > 0 ? [
        `Additional Medicare: 0.9% on wages over $200K`,
        `  $${(ficaBase - 200000).toLocaleString()} × 0.9% = $${ficaAudit.additionalMedicareTax.toLocaleString()}`,
      ] : []),
      `Total FICA: $${fica.toLocaleString()}`,
    ];

    // === Housing ===
    let housingScenario: { type: "rent" | "buy"; monthly: number; annual: number; label: string; note: string } | null = null;
    let housingBreakdown: string[] = [];

    if (metro) {
      housingScenario = { type: "rent", monthly: metro.averageRent, annual: metro.averageRent * 12, label: `Rent (${metro.name})`, note: wantsHome ? "Current — saving to buy" : `${metro.name} avg` };
      housingBreakdown = [
        `${metro.name} average rent: $${metro.averageRent.toLocaleString()}/mo`,
        `× 12 months = $${(metro.averageRent * 12).toLocaleString()}/yr`,
        ...(wantsHome ? [`You're renting now while saving for a down payment.`] : []),
      ];
    } else if (!wantsHome) {
      const estRent = Math.round(gross * 0.28 / 12) * 12;
      housingScenario = { type: "rent", monthly: Math.round(estRent / 12), annual: estRent, label: "Housing (Rent est.)", note: "~28% of gross" };
      housingBreakdown = [
        `No metro selected — using 28% rule of thumb.`,
        `$${gross.toLocaleString()} × 28% ÷ 12 = $${Math.round(estRent / 12).toLocaleString()}/mo`,
        `Annualized: $${estRent.toLocaleString()}/yr`,
      ];
    }

    // === Discretionary floor ===
    const minDiscretionaryMonthly = getMinMonthlyDiscretionary(jobState);
    const minDiscretionaryAnnual = minDiscretionaryMonthly * 12;

    const housingAnnual = housingScenario?.annual || 0;
    const availableForSavings = Math.max(0, netAfterTax - housingAnnual - minDiscretionaryAnnual);

    let budget = availableForSavings;

    // 401(k) and HSA are already locked in (pre-tax, removed from taxable wages above).
    const retirement401k = planned401k;
    const retirementBreakdown = [
      has401kGoal
        ? `Goal: max retirement → target 15% of gross (PRE-TAX — already removed from taxable wages above).`
        : `No retirement goal → target 6% (typical employer match — PRE-TAX, removes from taxable wages).`,
      `$${gross.toLocaleString()} × ${has401kGoal ? "15%" : "6%"} = $${Math.round(gross * (has401kGoal ? 0.15 : 0.06)).toLocaleString()}`,
      `IRS 2024 401(k) limit: $${max401k.toLocaleString()}${age >= 50 ? " (50+ catch-up)" : ""}`,
      `Final: $${retirement401k.toLocaleString()}/yr ($${Math.round(retirement401k / 12).toLocaleString()}/mo)`,
      `Tax savings: ~$${Math.round(retirement401k * 0.30).toLocaleString()}/yr at a ~30% combined marginal rate.`,
    ];

    const hsa = plannedHsa;
    const hsaBreakdown = [
      `2024 HSA limit (self-only HDHP): $${hsaMax.toLocaleString()}`,
      `Triple tax advantage: pre-tax in (federal + state + FICA), tax-free growth, tax-free for medical.`,
      `Requires HDHP enrollment.`,
      `Final: $${hsa.toLocaleString()}/yr`,
      ...(hsa > 0 ? [`Tax savings: ~$${Math.round(hsa * 0.37).toLocaleString()}/yr (federal + state + 7.65% FICA).`] : []),
    ];

    const rothCap = isHousehold ? rothMax * 2 : rothMax; // each spouse gets their own Roth IRA
    let roth = (goals.includes("retirement") || goals.includes("investing") || goals.includes("wealth-building"))
      ? Math.round(Math.min(rothCap, budget)) : 0;
    budget -= roth;
    const rothBreakdown = [
      `2024 Roth IRA limit: $${rothMax.toLocaleString()}${age >= 50 ? " (50+ catch-up)" : ""}`,
      gross > 161000
        ? `Income above $161K phaseout → use Backdoor Roth (Traditional IRA → convert).`
        : `Direct Roth contribution allowed at this income.`,
      `Funded with AFTER-tax dollars (no deduction now, tax-free in retirement).`,
      `Final: $${roth.toLocaleString()}/yr`,
    ];

    let emergency = goals.includes("emergency-fund") ? Math.round(Math.min(Math.round(gross * 0.05 / 12) * 12, budget)) : 0;
    budget -= emergency;
    const emergencyBreakdown = [
      `Goal: build emergency fund (3–6 mo of expenses).`,
      `Allocating 5% of gross to reach target within ~2 years.`,
      `$${gross.toLocaleString()} × 5% = $${Math.round(gross * 0.05).toLocaleString()}/yr`,
      `Park in HYSA / VMFXX-type money market for liquidity + yield.`,
      `Final: $${emergency.toLocaleString()}/yr`,
    ];

    let homeDown = 0;
    let homeBreakdown: string[] = [];
    let timeline: TimelineInsight | null = null;

    if (wantsHome && metro) {
      // === Step 1: What home can they actually afford? ===
      // Lender 28% DTI rule: PITI ≤ 28% of GROSS monthly.
      const grossMonthly = gross / 12;
      const maxPITI = grossMonthly * 0.28;
      const mortgageRate = 0.068;
      const years = 30;
      const propTaxRate = 0.012;
      const insuranceRate = 0.005;
      const maintRate = 0.01;
      const monthlyTaxInsMaint = (propTaxRate + insuranceRate + maintRate) / 12;
      const mr = mortgageRate / 12;
      const n = years * 12;
      const mortgageFactor = (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
      // Solve P from: 0.8*P*mortgageFactor + P*monthlyTaxInsMaint = maxPITI
      const affordableHomePrice = Math.round(maxPITI / (0.8 * mortgageFactor + monthlyTaxInsMaint));

      // === Step 2: Target = min(affordable, metro median) ===
      const targetHomePrice = Math.min(affordableHomePrice, metro.medianHomePrice);
      const downPaymentTarget = Math.round(targetHomePrice * 0.20);
      const closingCosts = Math.round(targetHomePrice * 0.03);
      const totalNeeded = downPaymentTarget + closingCosts;

      // === Step 3: Pace — 4-year target, capped at 25% of after-tax for headroom ===
      const cap25PctNet = Math.round(netAfterTax * 0.25);
      const fourYearPace = Math.round(totalNeeded / 4);
      const reasonableTarget = Math.min(cap25PctNet, fourYearPace);
      homeDown = Math.max(0, Math.min(reasonableTarget, Math.round(budget)));
      budget -= homeDown;

      const monthlySavingsForHome = Math.round(homeDown / 12);

      if (monthlySavingsForHome > 0) {
        const yearsToSave = Math.ceil(totalNeeded / homeDown);
        timeline = { homeYearsToSave: yearsToSave, homeBuyAge: age + yearsToSave, downPaymentTarget: totalNeeded, monthlySavingsForHome };
      } else {
        timeline = { homeYearsToSave: null, homeBuyAge: null, downPaymentTarget: totalNeeded, monthlySavingsForHome: 0 };
      }

      const affordsMedian = affordableHomePrice >= metro.medianHomePrice;

      // Where to park the down payment savings based on time horizon
      const yrs = timeline.homeYearsToSave;
      const parkingAdvice = !yrs
        ? `Park in HYSA (Marcus, Ally, Wealthfront Cash) — ~4.5% APY, FDIC-insured, fully liquid.`
        : yrs <= 2
        ? `Time horizon ≤2yr → 100% safe assets. Use HYSA (~4.5% APY) or T-Bills via TreasuryDirect / VMFXX (~5.0% SEC yield, state-tax-free). NO stocks — sequence-of-returns risk is too high.`
        : yrs <= 4
        ? `Time horizon 3–4yr → mostly safe with a small growth sleeve. Suggested: 70% in 6–12mo T-Bill ladder or VMFXX (~5%), 30% in short-duration bond ETF (BSV, ~4.5%). Skip equities — drawdown risk outweighs upside.`
        : `Time horizon 5+yr → can take measured risk. Suggested: 50% HYSA/T-Bills (~4.5–5%), 30% short bonds (BSV/VTIP), 20% broad equity (VTI). Blended expected return ~5–6%/yr.`;

      const blendedReturn = !yrs ? 0.045 : yrs <= 2 ? 0.048 : yrs <= 4 ? 0.047 : 0.055;
      // Future value of monthly contributions at blended return
      const monthlyR = blendedReturn / 12;
      const months = (yrs || 0) * 12;
      const fvWithGrowth = monthlySavingsForHome * ((Math.pow(1 + monthlyR, months) - 1) / monthlyR);
      const growthBoost = Math.max(0, Math.round(fvWithGrowth - homeDown * (yrs || 0)));

      homeBreakdown = [
        `Affordability check (lender 28% DTI rule):`,
        `  Max PITI = $${gross.toLocaleString()} ÷ 12 × 28% = $${Math.round(maxPITI).toLocaleString()}/mo`,
        `  Assumes: 6.8% 30-yr fixed, 20% down, 1.2% prop tax, 0.5% insurance, 1% maintenance`,
        `  → Affordable home price: $${affordableHomePrice.toLocaleString()}`,
        ``,
        `${metro.name} median home: $${metro.medianHomePrice.toLocaleString()}`,
        affordsMedian
          ? `✓ Median home is within reach — targeting median.`
          : `⚠ Median exceeds your affordability — targeting $${targetHomePrice.toLocaleString()} instead.`,
        ``,
        `Target down payment (20% of $${targetHomePrice.toLocaleString()}): $${downPaymentTarget.toLocaleString()}`,
        `+ 3% closing costs: $${closingCosts.toLocaleString()}`,
        `= Total needed: $${totalNeeded.toLocaleString()}`,
        ``,
        `Savings pace (smallest wins — preserves headroom):`,
        `  • 25% of after-tax income: $${cap25PctNet.toLocaleString()}/yr`,
        `  • 4-year pace to target: $${fourYearPace.toLocaleString()}/yr`,
        `  • Available in budget: $${Math.max(0, Math.round(budget + homeDown)).toLocaleString()}/yr`,
        `→ Allocating: $${homeDown.toLocaleString()}/yr ($${monthlySavingsForHome.toLocaleString()}/mo)`,
        timeline.homeYearsToSave
          ? `→ Reach down payment in ~${timeline.homeYearsToSave} years (age ${timeline.homeBuyAge})`
          : `Budget too tight to save for a home right now.`,
        ``,
        `WHERE TO PARK THIS MONEY (target ~${(blendedReturn * 100).toFixed(1)}% blended return):`,
        `  ${parkingAdvice}`,
        ...(growthBoost > 1000
          ? [`  Compounding boost over ${yrs}yr: ~$${growthBoost.toLocaleString()} of "free" growth — covers part of closing costs.`]
          : []),
        `  ⚠ Never invest down-payment funds in individual stocks or crypto.`,
      ];
    }

    const result: AllocationBucket[] = [];
    result.push({ label: "Federal Tax", amount: fedTax, color: COLORS.tax, icon: "🏛️", priority: 1, breakdown: fedBreakdown });
    if (stateTax > 0) {
      result.push({ label: `State Tax (${jobState || "est."})`, amount: stateTax, color: COLORS.stateTax, icon: "📍", priority: 1, breakdown: stateBreakdown });
    }
    result.push({ label: "FICA (SS + Medicare)", amount: fica, color: COLORS.fica, icon: "🛡️", priority: 1, breakdown: ficaBreakdown });

    if (housingScenario) {
      result.push({
        label: housingScenario.label, amount: housingScenario.annual,
        color: housingScenario.type === "buy" ? COLORS.housing : COLORS.rent,
        icon: housingScenario.type === "buy" ? "🏠" : "🏢", note: housingScenario.note, priority: 2,
        breakdown: housingBreakdown,
      });
    }

    if (retirement401k > 0) result.push({ label: isHousehold ? "401(k) — both spouses" : "401(k) / Retirement", amount: retirement401k, color: COLORS.retirement, icon: "🏦", note: isHousehold ? `Max $${max401k.toLocaleString()} each` : `Max $${max401k.toLocaleString()}`, priority: 3, breakdown: retirementBreakdown });
    if (hsa > 0) result.push({ label: "HSA", amount: hsa, color: COLORS.hsa, icon: "🏥", note: isHousehold ? "Family HDHP — triple tax" : "Triple tax advantage", priority: 4, breakdown: hsaBreakdown });
    if (roth > 0) result.push({ label: gross > 161000 ? (isHousehold ? "Backdoor Roth IRA (each)" : "Backdoor Roth IRA") : (isHousehold ? "Roth IRA (each spouse)" : "Roth IRA"), amount: roth, color: COLORS.roth, icon: "🚪", note: `Max $${rothMax.toLocaleString()}/yr`, priority: 4, breakdown: rothBreakdown });
    if (emergency > 0) result.push({ label: "Emergency Fund", amount: emergency, color: COLORS.emergency, icon: "🛟", priority: 5, breakdown: emergencyBreakdown });
    if (homeDown > 0) {
      const homeNote = timeline?.homeYearsToSave
        ? `Buy by age ${timeline.homeBuyAge} (~${timeline.homeYearsToSave}yr)`
        : "Saving for down payment";
      result.push({ label: "Home Down Payment", amount: homeDown, color: COLORS.homeDown, icon: "🏡", note: homeNote, priority: 5, breakdown: homeBreakdown });
    }

    const allocated = result.reduce((s, b) => s + b.amount, 0);
    const takeHome = Math.max(0, gross - allocated);
    const monthlyDisc = Math.round(takeHome / 12);
    const headroom = Math.max(0, monthlyDisc - minDiscretionaryMonthly);
    // Suggest 50% of headroom into a taxable brokerage (already maxed tax-advantaged buckets)
    const brokerageMonthly = Math.round(headroom * 0.5);
    const trueSpendMonthly = monthlyDisc - brokerageMonthly;
    const brokerageAnnual = brokerageMonthly * 12;
    // 30yr at 7% real return
    const fv30 = brokerageMonthly > 0
      ? Math.round(brokerageMonthly * ((Math.pow(1 + 0.07 / 12, 360) - 1) / (0.07 / 12)))
      : 0;

    const discretionaryBreakdown = [
      `Gross: $${gross.toLocaleString()}`,
      `− All allocations above: $${allocated.toLocaleString()}`,
      `= Discretionary: $${takeHome.toLocaleString()}/yr ($${monthlyDisc.toLocaleString()}/mo)`,
      ``,
      `Essential floor for ${jobState || "your area"}: $${minDiscretionaryMonthly.toLocaleString()}/mo (food, transport, utilities, insurance copays).`,
      `Headroom above floor: $${headroom.toLocaleString()}/mo`,
      ``,
      ...(headroom > 200
        ? [
            `RECOMMENDED SPLIT OF HEADROOM:`,
            `  • Taxable brokerage: $${brokerageMonthly.toLocaleString()}/mo ($${brokerageAnnual.toLocaleString()}/yr)`,
            `    → 80% VTI (US total market) + 20% VXUS (intl) — target ~7% real return long-term.`,
            `    → For higher tax brackets: add VTEB (muni bonds) for tax-free yield.`,
            `    → If $${brokerageAnnual.toLocaleString()}/yr invested for 30yr @ 7%: ~$${fv30.toLocaleString()} future value.`,
            `  • True "guilt-free" spend: $${trueSpendMonthly.toLocaleString()}/mo for travel, dining, hobbies, gifts.`,
            ``,
            `Rule of thumb: tax-advantaged accounts (401k/Roth/HSA) are already maxed above — taxable brokerage is the next layer for FI/early retirement bridge.`,
          ]
        : [
            `Headroom is tight — prioritize the floor first. Once 401k match + HSA + Roth are funded, any leftover should sweep to a taxable brokerage (VTI, ~7% target return) before lifestyle inflation.`,
          ]),
    ];
    result.push({ label: "Discretionary", amount: takeHome, color: COLORS.remaining, icon: "💵", note: brokerageMonthly > 0 ? `Invest $${brokerageMonthly.toLocaleString()}/mo · Spend $${trueSpendMonthly.toLocaleString()}/mo` : `Min ${jobState || ""} floor: $${minDiscretionaryMonthly.toLocaleString()}/mo`, priority: 6, breakdown: discretionaryBreakdown });

    return { buckets: result, gross, housingScenario, timeline };
  }, [profile, metro]);

  if (!gross || buckets.length === 0) return null;

  // Build cumulative deductions for the shrinking stripe
  const steps: { bucket: AllocationBucket; remainingBefore: number; remainingAfter: number }[] = [];
  let remaining = gross;
  for (const bucket of buckets) {
    const before = remaining;
    remaining -= bucket.amount;
    steps.push({ bucket, remainingBefore: before, remainingAfter: Math.max(0, remaining) });
  }

  const groupLabels: Record<number, string> = {
    1: "Mandatory",
    2: "Housing",
    3: "Retirement",
    4: "Tax-Advantaged",
    5: "Goals",
    6: "What's Left",
  };

  return (
    <div className="space-y-3">
      {/* Gross bar — full width */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-1"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span className="uppercase tracking-wider font-semibold">
            {isHousehold ? "Household Gross Income" : (profile.expectedIncome3yr ? "Expected Avg Gross (Next 3 Yrs)" : "Gross Annual Income")}
          </span>
          <span className="font-mono font-bold text-foreground text-sm">${gross.toLocaleString()}</span>
        </div>
        {isHousehold && profile.spouse?.income !== undefined && (
          <div className="text-[10px] font-mono text-muted-foreground/70 px-1 mt-0.5">
            You: ${getIncomeNumber(profile).toLocaleString()} + Spouse: ${profile.spouse.income.toLocaleString()} = MFJ household
          </div>
        )}
        <div className="h-7 rounded-lg bg-primary/20 border border-primary/30 w-full" />
      </motion.div>

      {/* Deduction rows */}
      <div className="space-y-0.5">
        {steps.map((step, i) => {
          const { bucket, remainingAfter } = step;
          const isLast = i === steps.length - 1;
          const widthPct = (remainingAfter / gross) * 100;
          const showGroupLabel = i === 0 || bucket.priority !== steps[i - 1].bucket.priority;

          return (
            <div key={bucket.label}>
              {showGroupLabel && (
                <div className="flex items-center gap-2 pt-2 pb-1 px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {groupLabels[bucket.priority]}
                  </span>
                  <div className="flex-1 h-px bg-border/30" />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Clickable row */}
                <button
                  type="button"
                  onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                  className="w-full text-left rounded-md hover:bg-secondary/20 transition-colors p-1 -m-1"
                  aria-expanded={expandedIdx === i}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm">{bucket.icon}</span>
                      <span className="text-xs text-foreground/80 truncate">{bucket.label}</span>
                      {bucket.note && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground hidden sm:inline">
                          {bucket.note}
                        </span>
                      )}
                      <span className="text-[9px] text-muted-foreground/50 ml-1">
                        {expandedIdx === i ? "▾" : "▸"} math
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {isLast ? "" : `−`}${bucket.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* The stripe — shows remaining after this deduction */}
                  <div className="relative h-5 w-full">
                    {!isLast && (
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-secondary/30"
                        style={{ width: `${(step.remainingBefore / gross) * 100}%` }}
                      />
                    )}
                    <motion.div
                      initial={{ width: `${(step.remainingBefore / gross) * 100}%` }}
                      animate={{ width: `${Math.max(widthPct, 2)}%` }}
                      transition={{ delay: i * 0.06 + 0.15, duration: 0.5, ease: "easeOut" }}
                      className={`absolute inset-y-0 left-0 rounded ${isLast ? "border border-border/50" : ""}`}
                      style={{ backgroundColor: isLast ? "hsl(var(--secondary))" : bucket.color, opacity: isLast ? 1 : 0.7 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className={`text-[10px] font-mono font-medium ${widthPct > 30 ? "text-white/90" : "text-foreground/60"}`}>
                        ${remainingAfter.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Expandable math breakdown */}
                <AnimatePresence initial={false}>
                  {expandedIdx === i && bucket.breakdown && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 mb-1 ml-6 px-3 py-2 rounded-md bg-secondary/40 border-l-2 space-y-0.5"
                        style={{ borderLeftColor: bucket.color }}
                      >
                        {bucket.breakdown.map((line, j) => (
                          <p
                            key={j}
                            className={`text-[11px] font-mono leading-snug ${line.startsWith("  ") ? "text-muted-foreground pl-3" : "text-foreground/85"}`}
                          >
                            <LinkedText text={line} />
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Timeline insight for home buyers */}
      {timeline && timeline.homeYearsToSave && (
        <div className="rounded-lg bg-secondary/30 border border-border/40 px-4 py-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">🏡</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Optimal Home Purchase Timeline</span>
          </div>
          <p className="text-sm text-foreground">
            At <span className="font-bold">${timeline.monthlySavingsForHome?.toLocaleString()}/mo</span> toward your down payment,
            you can buy by <span className="font-bold">age {timeline.homeBuyAge}</span> (~{timeline.homeYearsToSave} years).
          </p>
          <p className="text-xs text-muted-foreground">
            Target: ${timeline.downPaymentTarget?.toLocaleString()} (20% down + closing costs).
            This pace keeps your discretionary budget livable for {profile.jobState || metro?.state || "your area"}.
          </p>
        </div>
      )}

      {/* Monthly summary */}
      <div className="pt-2 border-t border-border/30 mt-2">
        <p className="text-xs text-muted-foreground text-center">
          Monthly discretionary:{" "}
          <span className="font-semibold text-foreground">
            ${Math.round(buckets[buckets.length - 1]?.amount / 12).toLocaleString()}/mo
          </span>
          {" · "}Saving & investing:{" "}
          <span className="font-semibold text-foreground">
            ${Math.round(
              buckets
                .filter((b) => [3, 4, 5].includes(b.priority))
                .reduce((s, b) => s + b.amount, 0) / 12
            ).toLocaleString()}/mo
          </span>
          {housingScenario && (
            <>
              {" · "}Housing:{" "}
              <span className="font-semibold text-foreground">
                ${housingScenario.monthly.toLocaleString()}/mo
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default IncomeAllocationChart;
