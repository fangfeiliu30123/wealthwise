export type Career = 
  | "tech" 
  | "healthcare" 
  | "finance" 
  | "education" 
  | "creative" 
  | "trades" 
  | "entrepreneur" 
  | "government" 
  | "student"
  | "other";

export type FinancialGoal = 
  | "emergency-fund" 
  | "debt-payoff" 
  | "investing" 
  | "retirement" 
  | "home-buying" 
  | "education-fund" 
  | "wealth-building" 
  | "tax-optimization";

export type FilingStatus = "single" | "married" | "head-of-household";

export interface W2Data {
  grossIncome?: number;
  federalTaxWithheld?: number;
  stateTaxWithheld?: number;
  socialSecurityWages?: number;
  medicareWages?: number;
  state?: string;
  employer?: string;
  year?: number;
}

export interface AccountHolding {
  security_name: string | null;
  ticker: string | null;
  quantity: number | null;
  current_price: number | null;
  value: number | null;
  type: string | null;
}

export interface SpendingCategory {
  category: string;
  amount: number;
}

export interface DebtAccount {
  name: string;
  type: string;       // "credit" | "loan"
  subtype: string | null;  // "credit card", "auto", "student", "mortgage", etc.
  balance: number;
  institutionName: string | null;
}

export interface ConnectedAccountData {
  totalBalance: number;
  totalInvestments: number;
  totalDebt: number;
  debtAccounts: DebtAccount[];
  holdings: AccountHolding[];
  topSpendingCategories: SpendingCategory[];
  holdingsCount: number;
  transactionCount: number;
}

/**
 * User-supplied snapshot of assets and liabilities, captured during onboarding
 * as an alternative or supplement to Plaid-connected accounts.
 * All fields are optional so users can fill in just what they know.
 */
export interface ManualNetWorth {
  // Assets
  liquidSavings?: number;
  retirementAccounts?: number;
  hsa?: number;
  brokerageInvestments?: number;
  homeEquity?: number;
  privateInvestments?: number;
  otherAssets?: number;
  // Liabilities
  studentLoans?: number;
  carLoans?: number;
  creditCardDebt?: number;
  mortgageBalance?: number;
  businessGuarantee?: number;
  otherLiabilities?: number;
}

export interface KidsPlanning {
  wantsKids: "yes" | "no" | "maybe";
  plannedAge?: number; // age at which they plan to have first child
  numberOfKids?: number;
}

export const US_STATES: { value: string; label: string }[] = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" }, { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" }, { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" }, { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" }, { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" }, { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" }, { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" }, { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" }, { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" }, { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" }, { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" }, { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" }, { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" }, { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" }, { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" }, { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" }, { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" }, { value: "DC", label: "Washington D.C." },
];

export interface SpouseProfile {
  income?: number;          // annual gross
  career?: Career;
  age?: number;
}

export interface UserProfile {
  career: Career;
  age: number;
  goals: FinancialGoal[];
  income?: string;
  expectedIncome3yr?: number;
  filingStatus?: FilingStatus;
  jobState?: string;
  w2Data?: W2Data;
  w2History?: W2Data[];
  averageHistoricalIncome?: number;
  targetMetroId?: string;
  accountData?: ConnectedAccountData;
  kidsPlanning?: KidsPlanning;
  spouse?: SpouseProfile;
  manualNetWorth?: ManualNetWorth;
}

export type AdviceCategory = "savings" | "investing" | "debt" | "retirement" | "tax" | "insurance" | "education";

export interface AdviceCard {
  id: string;
  title: string;
  description: string;
  actionSteps?: string[];
  category: AdviceCategory;
  /** Optional additional category labels — used when one piece of advice spans multiple buckets (e.g. retirement + tax). */
  categories?: AdviceCategory[];
  priority: "high" | "medium" | "low";
  icon: string;
  timelineYear?: number; // 1 = Year 1 (now), 2 = Year 2, etc.
}

export const CAREER_OPTIONS: { value: Career; label: string; icon: string }[] = [
  { value: "tech", label: "Technology", icon: "💻" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "finance", label: "Finance", icon: "📊" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "creative", label: "Creative Arts", icon: "🎨" },
  { value: "trades", label: "Skilled Trades", icon: "🔧" },
  { value: "entrepreneur", label: "Entrepreneur", icon: "🚀" },
  { value: "government", label: "Government", icon: "🏛️" },
  { value: "student", label: "Student / Grad School", icon: "🎓" },
  { value: "other", label: "Other", icon: "💼" },
];

export const GOAL_OPTIONS: { value: FinancialGoal; label: string; icon: string }[] = [
  { value: "emergency-fund", label: "Emergency Fund", icon: "🛡️" },
  { value: "debt-payoff", label: "Pay Off Debt", icon: "💳" },
  { value: "investing", label: "Start Investing", icon: "📈" },
  { value: "retirement", label: "Retirement Planning", icon: "🏖️" },
  { value: "home-buying", label: "Buy a Home", icon: "🏠" },
  { value: "education-fund", label: "Education Fund", icon: "🎓" },
  { value: "wealth-building", label: "Build Wealth", icon: "💰" },
  { value: "tax-optimization", label: "Tax Optimization", icon: "📋" },
];

export const INCOME_RANGES = [
  "Under $30,000",
  "$30,000 - $50,000",
  "$50,000 - $75,000",
  "$75,000 - $100,000",
  "$100,000 - $150,000",
  "$150,000 - $250,000",
  "$250,000+",
];

export const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string; icon: string }[] = [
  { value: "single", label: "Single", icon: "👤" },
  { value: "married", label: "Married Filing Jointly", icon: "👫" },
  { value: "head-of-household", label: "Head of Household", icon: "🏠" },
];