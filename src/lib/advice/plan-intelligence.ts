/**
 * Employer and plan intelligence — uses W2 employer name, career, and state
 * to make definitive recommendations instead of generic "check if" advice.
 */

// Major employers known to offer mega backdoor Roth (after-tax 401k + in-plan Roth conversion)
const MEGA_BACKDOOR_EMPLOYERS = new Set([
  "google", "alphabet", "meta", "facebook", "microsoft", "amazon", "apple",
  "netflix", "nvidia", "salesforce", "adobe", "oracle", "intel", "cisco",
  "qualcomm", "paypal", "stripe", "airbnb", "uber", "lyft", "doordash",
  "coinbase", "robinhood", "plaid", "snap", "pinterest", "twitter", "x corp",
  "linkedin", "dropbox", "zoom", "slack", "twilio", "datadog", "snowflake",
  "palantir", "splunk", "servicenow", "workday", "atlassian", "shopify",
  "square", "block", "jpmorgan", "jp morgan", "goldman sachs", "morgan stanley",
  "bank of america", "citigroup", "citi", "wells fargo", "blackrock",
  "vanguard", "fidelity", "charles schwab", "schwab", "citadel", "two sigma",
  "bridgewater", "jane street", "de shaw", "point72", "aqr",
  "deloitte", "mckinsey", "bain", "bcg", "accenture", "pwc", "ey", "kpmg",
  "lockheed martin", "raytheon", "boeing", "northrop grumman", "general electric",
  "ge", "honeywell", "3m", "johnson & johnson", "j&j", "pfizer", "merck",
  "unitedhealth", "anthem", "cigna", "aetna", "humana",
]);

// States with 529 tax deductions and their approximate benefit
const STATE_529_DEDUCTIONS: Record<string, { deduction: string; planName: string }> = {
  "AL": { deduction: "up to $10,000/year deductible", planName: "CollegeCounts 529" },
  "AZ": { deduction: "up to $2,000 single / $4,000 joint deductible", planName: "Arizona 529" },
  "AR": { deduction: "up to $5,000 single / $10,000 joint deductible", planName: "GIFT Plan" },
  "CO": { deduction: "full amount deductible", planName: "CollegeInvest" },
  "CT": { deduction: "up to $5,000 single / $10,000 joint deductible", planName: "CHET" },
  "GA": { deduction: "up to $8,000 single / $16,000 joint deductible", planName: "Path2College" },
  "ID": { deduction: "up to $6,000 single / $12,000 joint deductible", planName: "IDeal" },
  "IL": { deduction: "up to $10,000 single / $20,000 joint deductible", planName: "Bright Start" },
  "IN": { deduction: "20% tax credit up to $1,500", planName: "CollegeChoice 529" },
  "IA": { deduction: "up to $3,785 per beneficiary deductible", planName: "College Savings Iowa" },
  "KS": { deduction: "up to $3,000 single / $6,000 joint deductible", planName: "Learning Quest" },
  "KY": { deduction: "up to $2,000 per beneficiary deductible", planName: "KY Saves 529" },
  "LA": { deduction: "up to $2,400 single / $4,800 joint deductible", planName: "START Saving" },
  "MD": { deduction: "up to $2,500 per account per beneficiary", planName: "Maryland 529" },
  "MA": { deduction: "up to $1,000 single / $2,000 joint deductible", planName: "U.Fund" },
  "MI": { deduction: "up to $5,000 single / $10,000 joint deductible", planName: "MI 529 Advisor" },
  "MN": { deduction: "up to $1,500 single / $3,000 joint tax credit", planName: "MN College Savings" },
  "MS": { deduction: "up to $10,000 single / $20,000 joint deductible", planName: "MPACT/MACS" },
  "MO": { deduction: "up to $8,000 single / $16,000 joint deductible", planName: "MOST 529" },
  "MT": { deduction: "up to $3,000 single / $6,000 joint deductible", planName: "Achieve Montana" },
  "NE": { deduction: "up to $10,000 single / $10,000 joint deductible", planName: "NEST 529" },
  "NM": { deduction: "full amount deductible", planName: "Education Plan" },
  "NY": { deduction: "up to $5,000 single / $10,000 joint deductible", planName: "NY 529 Direct" },
  "NC": { deduction: "no state income tax", planName: "NC 529" },
  "ND": { deduction: "up to $5,000 single / $10,000 joint deductible", planName: "College SAVE" },
  "OH": { deduction: "up to $4,000 per beneficiary deductible", planName: "CollegeAdvantage" },
  "OK": { deduction: "up to $10,000 single / $20,000 joint deductible", planName: "Oklahoma 529" },
  "OR": { deduction: "up to $150 single / $300 joint tax credit", planName: "Oregon College Savings" },
  "PA": { deduction: "up to $17,000 per beneficiary deductible", planName: "PA 529" },
  "RI": { deduction: "up to $500 single / $1,000 joint deductible", planName: "CollegeBound" },
  "SC": { deduction: "full amount deductible", planName: "Future Scholar" },
  "UT": { deduction: "up to $2,290 single / $4,580 joint tax credit", planName: "my529" },
  "VA": { deduction: "up to $4,000 per account deductible", planName: "Virginia529" },
  "VT": { deduction: "10% tax credit up to $250 single / $500 joint", planName: "VHEIP" },
  "WV": { deduction: "full amount deductible", planName: "SMART529" },
  "WI": { deduction: "up to $3,860 single / $3,860 per beneficiary", planName: "Edvest 529" },
  "DC": { deduction: "up to $4,000 single / $8,000 joint deductible", planName: "DC College Savings" },
  // States with NO income tax (no deduction needed)
  "TX": { deduction: "no state income tax — use any state's plan", planName: "Texas College Savings (Lonestar 529)" },
  "FL": { deduction: "no state income tax — use any state's plan", planName: "Florida 529" },
  "WA": { deduction: "no state income tax — use any state's plan", planName: "WA529 (GET/DreamAhead)" },
  "NV": { deduction: "no state income tax — use any state's plan", planName: "Nevada 529 (Vanguard)" },
  "TN": { deduction: "no state income tax — use any state's plan", planName: "TNStars 529" },
  "WY": { deduction: "no state income tax — use any state's plan", planName: "WY529" },
  "AK": { deduction: "no state income tax — use any state's plan", planName: "UA College Savings" },
  "SD": { deduction: "no state income tax — use any state's plan", planName: "CollegeAccess 529" },
  "NH": { deduction: "no state income tax on earned income — use any state's plan", planName: "UNIQUE 529" },
  // No deduction states
  "CA": { deduction: "no state deduction — consider using Nevada 529 (Vanguard) or Utah my529 for better investment options", planName: "ScholarShare 529" },
  "NJ": { deduction: "no state deduction — consider using NY 529 Direct or Utah my529", planName: "NJBEST 529" },
  "DE": { deduction: "no state deduction", planName: "DE529" },
  "HI": { deduction: "no state deduction", planName: "HI529" },
  "ME": { deduction: "no state deduction — use NextGen 529", planName: "NextGen 529" },
};

export interface PlanIntelligence {
  megaBackdoorEligible: "yes" | "likely" | "unlikely" | "unknown";
  megaBackdoorNote: string;
  has403bAnd457b: boolean;
  state529Info: { deduction: string; planName: string } | null;
  hasTraditionalIRAOrOld401k: boolean;
  employerName: string | null;
}

export function analyzePlanEligibility(
  employer: string | undefined,
  career: string,
  state: string | undefined,
  accountData?: { holdings?: { security_name?: string | null; ticker?: string | null }[] }
): PlanIntelligence {
  const employerLower = (employer || "").toLowerCase().trim();
  const stateTwoLetter = normalizeState(state);

  // Mega backdoor Roth eligibility
  let megaBackdoorEligible: PlanIntelligence["megaBackdoorEligible"] = "unknown";
  let megaBackdoorNote = "";

  if (employerLower) {
    const isKnown = [...MEGA_BACKDOOR_EMPLOYERS].some(
      (e) => employerLower.includes(e) || e.includes(employerLower)
    );
    if (isKnown) {
      megaBackdoorEligible = "yes";
      megaBackdoorNote = `${employer} offers after-tax 401(k) contributions with in-plan Roth conversions (mega backdoor Roth).`;
    } else if (career === "tech" || career === "finance") {
      megaBackdoorEligible = "likely";
      megaBackdoorNote = `Most major ${career === "tech" ? "tech" : "finance"} employers offer mega backdoor Roth. ${employer}'s plan likely supports it — confirm with your benefits portal or HR.`;
    } else {
      megaBackdoorEligible = "unlikely";
      megaBackdoorNote = `Mega backdoor Roth availability varies. Check your 401(k) plan's Summary Plan Description (SPD) — look for "after-tax contributions" and "in-plan Roth conversion" or "in-service withdrawal."`;
    }
  } else {
    if (career === "tech" || career === "finance") {
      megaBackdoorEligible = "likely";
      megaBackdoorNote = "Most large tech and finance employers offer mega backdoor Roth — check your 401(k) plan documents.";
    }
  }

  // 403(b) + 457(b) eligibility
  const has403bAnd457b = career === "education" || career === "healthcare" || career === "government";

  // 529 state info
  const state529Info = stateTwoLetter ? STATE_529_DEDUCTIONS[stateTwoLetter] || null : null;

  // Check for existing traditional IRA / old 401k from holdings
  const holdingNames = (accountData?.holdings || []).map(
    (h) => ((h.security_name || "") + " " + (h.ticker || "")).toLowerCase()
  );
  const hasTraditionalIRAOrOld401k = holdingNames.some(
    (n) =>
      n.includes("traditional") ||
      n.includes("rollover") ||
      n.includes("sep ira") ||
      n.includes("simple ira")
  );

  return {
    megaBackdoorEligible,
    megaBackdoorNote,
    has403bAnd457b,
    state529Info,
    hasTraditionalIRAOrOld401k,
    employerName: employer || null,
  };
}

function normalizeState(state: string | undefined): string | null {
  if (!state) return null;
  const s = state.trim().toUpperCase();
  if (s.length === 2) return s;
  // Common full names → abbreviations
  const map: Record<string, string> = {
    "ALABAMA": "AL", "ALASKA": "AK", "ARIZONA": "AZ", "ARKANSAS": "AR",
    "CALIFORNIA": "CA", "COLORADO": "CO", "CONNECTICUT": "CT", "DELAWARE": "DE",
    "FLORIDA": "FL", "GEORGIA": "GA", "HAWAII": "HI", "IDAHO": "ID",
    "ILLINOIS": "IL", "INDIANA": "IN", "IOWA": "IA", "KANSAS": "KS",
    "KENTUCKY": "KY", "LOUISIANA": "LA", "MAINE": "ME", "MARYLAND": "MD",
    "MASSACHUSETTS": "MA", "MICHIGAN": "MI", "MINNESOTA": "MN", "MISSISSIPPI": "MS",
    "MISSOURI": "MO", "MONTANA": "MT", "NEBRASKA": "NE", "NEVADA": "NV",
    "NEW HAMPSHIRE": "NH", "NEW JERSEY": "NJ", "NEW MEXICO": "NM", "NEW YORK": "NY",
    "NORTH CAROLINA": "NC", "NORTH DAKOTA": "ND", "OHIO": "OH", "OKLAHOMA": "OK",
    "OREGON": "OR", "PENNSYLVANIA": "PA", "RHODE ISLAND": "RI", "SOUTH CAROLINA": "SC",
    "SOUTH DAKOTA": "SD", "TENNESSEE": "TN", "TEXAS": "TX", "UTAH": "UT",
    "VERMONT": "VT", "VIRGINIA": "VA", "WASHINGTON": "WA", "WEST VIRGINIA": "WV",
    "WISCONSIN": "WI", "WYOMING": "WY", "DISTRICT OF COLUMBIA": "DC",
  };
  return map[s] || null;
}
