import { ConnectedAccountData, ManualNetWorth, UserProfile } from "@/lib/types";

export interface MergedFinancialSnapshot {
  // Top-level totals (manual wins on conflict)
  liquidSavings: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  retirementAccounts: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  brokerageInvestments: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  hsa: { value: number; source: "manual" | "none"; manual?: number };
  homeEquity: { value: number; source: "manual" | "none"; manual?: number };
  privateInvestments: { value: number; source: "manual" | "none"; manual?: number };
  otherAssets: { value: number; source: "manual" | "none"; manual?: number };

  studentLoans: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  carLoans: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  creditCardDebt: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  mortgageBalance: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
  businessGuarantee: { value: number; source: "manual" | "none"; manual?: number };
  otherLiabilities: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };

  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;

  hasPlaid: boolean;
  hasManual: boolean;
  conflicts: { label: string; manual: number; plaid: number }[];
}

const sumPlaidDebt = (plaid: ConnectedAccountData | undefined, match: (s: string) => boolean) =>
  (plaid?.debtAccounts || [])
    .filter((d) => match((d.subtype || "").toLowerCase()))
    .reduce((a, b) => a + (b.balance || 0), 0);

const pickField = (
  manual: number | undefined,
  plaid: number | undefined,
): { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number } => {
  if (manual !== undefined && manual > 0) {
    return { value: manual, source: "manual", manual, plaid };
  }
  if (plaid !== undefined && plaid > 0) {
    return { value: plaid, source: "plaid", manual, plaid };
  }
  return { value: 0, source: "none", manual, plaid };
};

const pickManualOnly = (
  manual: number | undefined,
): { value: number; source: "manual" | "none"; manual?: number } => {
  if (manual !== undefined && manual > 0) return { value: manual, source: "manual", manual };
  return { value: 0, source: "none", manual };
};

export function buildSnapshot(profile: UserProfile, plaid?: ConnectedAccountData | null): MergedFinancialSnapshot {
  const m: ManualNetWorth = profile.manualNetWorth || {};

  // Plaid debt subtype breakdown
  const plaidMortgage = sumPlaidDebt(plaid || undefined, (s) => s.includes("mortgage"));
  const plaidStudent = sumPlaidDebt(plaid || undefined, (s) => s.includes("student"));
  const plaidAuto = sumPlaidDebt(plaid || undefined, (s) => s.includes("auto") || s.includes("car"));
  const plaidCredit = sumPlaidDebt(plaid || undefined, (s) => s.includes("credit"));
  const plaidOtherDebt = Math.max(
    0,
    (plaid?.totalDebt || 0) - (plaidMortgage + plaidStudent + plaidAuto + plaidCredit),
  );

  // Plaid total investments — best-effort split: assume retirement holds it unless user provides brokerage
  const plaidInvest = plaid?.totalInvestments || 0;

  const liquidSavings = pickField(m.liquidSavings, plaid?.totalBalance);
  const retirementAccounts = pickField(m.retirementAccounts, plaidInvest);
  const brokerageInvestments = pickField(m.brokerageInvestments, undefined);
  const hsa = pickManualOnly(m.hsa);
  const homeEquity = pickManualOnly(m.homeEquity);
  const privateInvestments = pickManualOnly(m.privateInvestments);
  const otherAssets = pickManualOnly(m.otherAssets);

  const studentLoans = pickField(m.studentLoans, plaidStudent);
  const carLoans = pickField(m.carLoans, plaidAuto);
  const creditCardDebt = pickField(m.creditCardDebt, plaidCredit);
  const mortgageBalance = pickField(m.mortgageBalance, plaidMortgage);
  const businessGuarantee = pickManualOnly(m.businessGuarantee);
  const otherLiabilities = pickField(m.otherLiabilities, plaidOtherDebt);

  const assetFields = [
    liquidSavings, retirementAccounts, brokerageInvestments, hsa,
    homeEquity, privateInvestments, otherAssets,
  ];
  const liabilityFields = [
    studentLoans, carLoans, creditCardDebt, mortgageBalance, businessGuarantee, otherLiabilities,
  ];

  const totalAssets = assetFields.reduce((s, f) => s + f.value, 0);
  const totalLiabilities = liabilityFields.reduce((s, f) => s + f.value, 0);

  // Conflicts: manual provided AND plaid provided AND they differ by >$100
  const conflicts: { label: string; manual: number; plaid: number }[] = [];
  const checkConflict = (label: string, f: { manual?: number; plaid?: number }) => {
    if (f.manual !== undefined && f.plaid !== undefined && f.manual > 0 && f.plaid > 0) {
      if (Math.abs(f.manual - f.plaid) > 100) {
        conflicts.push({ label, manual: f.manual, plaid: f.plaid });
      }
    }
  };
  checkConflict("Liquid savings", liquidSavings);
  checkConflict("Retirement accounts", retirementAccounts);
  checkConflict("Student loans", studentLoans);
  checkConflict("Car loans", carLoans);
  checkConflict("Credit card debt", creditCardDebt);
  checkConflict("Mortgage balance", mortgageBalance);

  return {
    liquidSavings, retirementAccounts, brokerageInvestments, hsa,
    homeEquity, privateInvestments, otherAssets,
    studentLoans, carLoans, creditCardDebt, mortgageBalance, businessGuarantee, otherLiabilities,
    totalAssets, totalLiabilities, netWorth: totalAssets - totalLiabilities,
    hasPlaid: !!plaid && (plaid.totalBalance > 0 || plaid.totalInvestments > 0 || plaid.totalDebt > 0),
    hasManual: Object.values(m).some((v) => typeof v === "number" && v > 0),
    conflicts,
  };
}
