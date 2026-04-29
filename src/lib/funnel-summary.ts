import { UserProfile } from "./types";
import { MetroArea } from "./metro-data";
import { buildTaxAudit } from "./tax-calc";

export interface FunnelBucket {
  label: string;
  annual: number;
  monthly: number;
}

export interface FunnelSummary {
  gross: number;
  buckets: FunnelBucket[];
  takeHomeMonthly: number;
  takeHomeAnnual: number;
}

/**
 * Mirror of the income-allocation funnel logic, returning a compact summary
 * suitable for feeding into AI prompts so milestone advice aligns with what
 * the user actually sees in "Where Your Income Goes."
 *
 * Keep this in sync with src/components/IncomeAllocationChart.tsx.
 */

function getIncome(p: UserProfile): number {
  if (p.expectedIncome3yr) return p.expectedIncome3yr;
  if (p.averageHistoricalIncome) return p.averageHistoricalIncome;
  if (p.w2Data?.grossIncome) return p.w2Data.grossIncome;
  if (!p.income) return 0;
  const map: Record<string, number> = {
    "Under $30,000": 25000,
    "$30,000 - $50,000": 40000,
    "$50,000 - $75,000": 62500,
    "$75,000 - $100,000": 87500,
    "$100,000 - $150,000": 125000,
    "$150,000 - $250,000": 200000,
    "$250,000+": 300000,
  };
  return map[p.income] || 75000;
}

function fedTax(income: number, status?: string): number {
  const single = [11600, 47150, 100525, 191950, 243725, 609350, Infinity];
  const mfj = [23200, 94300, 201050, 383900, 487450, 731200, Infinity];
  const hoh = [16550, 63100, 100500, 191950, 243700, 609350, Infinity];
  const rates = [0.10, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];
  const ups = status === "married" ? mfj : status === "head-of-household" ? hoh : single;
  const stdDed = status === "married" ? 29200 : status === "head-of-household" ? 21900 : 14600;
  const taxable = Math.max(0, income - stdDed);
  let tax = 0, prev = 0;
  for (let i = 0; i < ups.length; i++) {
    if (taxable <= prev) break;
    tax += (Math.min(taxable, ups[i]) - prev) * rates[i];
    prev = ups[i];
    if (taxable <= ups[i]) break;
  }
  return Math.round(tax);
}

function stateTax(income: number, state?: string): number {
  if (!state) return Math.round(income * 0.05);
  const noTax = ["TX", "FL", "NV", "WA", "WY", "SD", "AK", "TN", "NH"];
  if (noTax.includes(state)) return 0;
  const flat: Record<string, number> = {
    CA: 0.093, NY: 0.0685, NJ: 0.0637, OR: 0.099, HI: 0.0825, MN: 0.0785,
    CO: 0.044, IL: 0.0495, IN: 0.0315, KY: 0.045, MA: 0.05, MI: 0.0425,
    NC: 0.0475, PA: 0.0307, UT: 0.0485, AZ: 0.025, GA: 0.0549,
  };
  return Math.round(income * (flat[state] ?? 0.05));
}

function minDiscretionary(state?: string): number {
  const veryHigh: Record<string, number> = { CA: 3200, NY: 3000, HI: 3400, MA: 2800, NJ: 2700, CT: 2600, DC: 2900 };
  const high: Record<string, number> = { WA: 2500, CO: 2400, OR: 2400, MD: 2400, VA: 2300, IL: 2200, MN: 2200 };
  if (!state) return 2000;
  if (veryHigh[state]) return veryHigh[state];
  if (high[state]) return high[state];
  return 2000;
}

export function computeFunnelSummary(profile: UserProfile, metro?: MetroArea | null): FunnelSummary | null {
  const userGross = getIncome(profile);
  if (!userGross) return null;

  const goals = profile.goals;
  const wantsHome = goals.includes("home-buying");
  const jobState = profile.jobState || metro?.state;

  // Use shared tax engine — handles MFJ household + spouse income consistently.
  const audit = buildTaxAudit(profile, userGross, jobState);
  const gross = audit.gross; // household when MFJ
  const fed = audit.federal.totalTax;
  const st = audit.state.totalTax;
  const fica = audit.fica.totalFica;
  const planned401k = audit.preTax.planned401k;
  const plannedHsa = audit.preTax.plannedHsa;
  const isHousehold = profile.filingStatus === "married" && (profile.spouse?.income ?? 0) > 0;
  const rothMax = (profile.age < 50 ? 7000 : 8000) * (isHousehold ? 2 : 1);
  const netAfterTax = gross - fed - st - fica - planned401k - plannedHsa;

  const housingAnnual = metro
    ? metro.averageRent * 12
    : !wantsHome
    ? Math.round((gross * 0.28) / 12) * 12
    : 0;

  const minDiscAnnual = minDiscretionary(jobState) * 12;
  let budget = Math.max(0, netAfterTax - housingAnnual - minDiscAnnual);

  const r401k = planned401k;
  const hsa = plannedHsa;
  let roth = (goals.includes("retirement") || goals.includes("investing") || goals.includes("wealth-building"))
    ? Math.round(Math.min(rothMax, budget)) : 0;
  budget -= roth;
  let emerg = goals.includes("emergency-fund") ? Math.round(Math.min(Math.round((gross * 0.05) / 12) * 12, budget)) : 0;
  budget -= emerg;

  let homeDown = 0;
  if (wantsHome && metro) {
    // Affordability: PITI ≤ 28% of gross monthly @ 6.8% / 30yr / 20% down + tax+ins+maint
    const grossMonthly = gross / 12;
    const maxPITI = grossMonthly * 0.28;
    const mr = 0.068 / 12;
    const n = 30 * 12;
    const mortgageFactor = (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    const monthlyTaxInsMaint = (0.012 + 0.005 + 0.01) / 12;
    const affordableHomePrice = Math.round(maxPITI / (0.8 * mortgageFactor + monthlyTaxInsMaint));
    const targetHomePrice = Math.min(affordableHomePrice, metro.medianHomePrice);
    const totalNeeded = Math.round(targetHomePrice * 0.23); // 20% down + 3% closing
    const cap = Math.min(Math.round(netAfterTax * 0.25), Math.round(totalNeeded / 4));
    homeDown = Math.max(0, Math.min(cap, Math.round(budget)));
    budget -= homeDown;
  }

  const buckets: FunnelBucket[] = [];
  const push = (label: string, amt: number) => {
    if (amt > 0) buckets.push({ label, annual: amt, monthly: Math.round(amt / 12) });
  };
  push("Federal Tax", fed);
  push(`State Tax (${jobState || "est."})`, st);
  push("FICA", fica);
  if (housingAnnual > 0) push(metro ? `Rent (${metro.name})` : "Housing (est.)", housingAnnual);
  push("401(k) / Retirement", r401k);
  push("HSA", hsa);
  push(gross > 161000 ? "Backdoor Roth IRA" : "Roth IRA", roth);
  push("Emergency Fund", emerg);
  push("Home Down Payment", homeDown);

  const allocated = buckets.reduce((s, b) => s + b.annual, 0);
  const takeHomeAnnual = Math.max(0, gross - allocated);

  return {
    gross,
    buckets,
    takeHomeAnnual,
    takeHomeMonthly: Math.round(takeHomeAnnual / 12),
  };
}
