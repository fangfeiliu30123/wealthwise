import { UserProfile, AdviceCard } from "../types";
import {
  isLowIncome,
  isHighIncome,
  estimateHouseholdIncome,
  rothIRAEligibility,
} from "./helpers";

export function generateAgeAdvice(profile: UserProfile): AdviceCard[] {
  const advice: AdviceCard[] = [];
  const { age, income, filingStatus } = profile;
  const householdIncome = estimateHouseholdIncome(profile);
  const rothStatus = rothIRAEligibility(householdIncome, filingStatus);
  const rothLabel =
    rothStatus === "eligible"
      ? "Roth IRA"
      : "backdoor Roth IRA (your household income exceeds the direct Roth limit)";

  if (age < 25) {
    advice.push({
      id: "young-compound",
      title: "Leverage Compound Interest — Your Biggest Advantage",
      description:
        "Starting at 22 vs. 32 can mean the difference between $1.1M and $500K by 65 (assuming $300/month at 8%). The Rule of 72 (from Investor.gov) makes this intuitive: divide 72 by your return rate to see how fast money doubles. At 8%, your money doubles every 9 years. Starting 10 years earlier means one extra doubling — literally 2x more wealth.",
      actionSteps: [
        `Open a ${rothLabel} and set up automatic monthly contributions — even $50/month`,
        "Choose a single target-date fund or total market index (VTI) and don't touch it",
        "Turn on dividend reinvestment (DRIP) so gains compound automatically",
        "Increase contributions by 1% every time you get a raise",
        "Use Investor.gov's compound interest calculator to see the impact of starting now",
      ],
      category: "investing",
      priority: "high",
      icon: "⏰",
    });
    advice.push({
      id: "young-skills",
      title: "Your Earning Potential Is Your #1 Asset",
      description:
        "In your early 20s, a $10,000 salary increase invested over 40 years is worth $500K+. Focus on skills and certifications that have measurable ROI. Negotiate your salary — most people leave $5,000-$15,000 on the table at their first job.",
      actionSteps: [
        "Research market rates on Levels.fyi, Glassdoor, or Payscale for your role",
        "Identify 1-2 high-value certifications in your field (AWS, CPA, PMP, etc.)",
        "Practice salary negotiation — always counter the first offer",
        "Consider a strategic job change every 2-3 years (average 10-20% raise vs. 3% internal)",
        "Take free courses: Khan Academy (personal finance basics), Coursera 'Financial Planning for Young Adults'",
      ],
      category: "education",
      priority: "high",
      icon: "📚",
    });
    advice.push({
      id: "young-credit-foundation",
      title: "Build a 750+ Credit Score Now — It Saves $50K+ Over Your Lifetime",
      description:
        "Per the CFPB, your credit score directly determines the interest rate on mortgages, car loans, and credit cards. The difference between a 750 and 650 score on a $300K mortgage is $50,000+ over 30 years. Start building credit now with responsible use — it takes years to build and minutes to destroy.",
      actionSteps: [
        "Get a student or secured credit card (Discover It Student is a good starter)",
        "Set up autopay in full every month — never carry a balance",
        "Keep utilization under 30% (ideally under 10%) of your credit limit",
        "Check your credit report free at AnnualCreditReport.com — dispute any errors",
        "Never close your oldest credit card — length of history matters",
      ],
      category: "savings",
      priority: "high",
      icon: "💳",
    });
  } else if (age < 35) {
    advice.push({
      id: "thirties-401k",
      title: "Maximize Employer Match — Then Go Beyond",
      description:
        "The employer match is an immediate 50-100% return. But don't stop there — at your age, every dollar in tax-advantaged accounts has 30+ years to compound. The gap between saving 10% and 20% of income can mean retiring at 55 vs. 65. For 2026, the 401(k) limit is $24,500 (up from $23,500 in 2025).",
      actionSteps: [
        "Contribute at least enough for the full employer match (typically 3-6% of salary)",
        `Then max out ${rothLabel} ($7,500/year for 2026) for tax-free growth`,
        "Aim for 15-20% total savings rate including employer match",
        "If you can, increase 401(k) contributions toward the $24,500 max",
        "If 401(k) plan fees are high, roll old 401(k)s into current plan or an IRA",
      ],
      category: "retirement",
      priority: "high",
      icon: "🏦",
    });
  } else if (age < 50) {
    advice.push({
      id: "midcareer-peak",
      title: "Peak Earning Years: Accelerate Wealth Building",
      description:
        "You're in the wealth-building sweet spot: high income, established career, and still 15-25 years of growth ahead. The danger is lifestyle inflation — the gap between what you earn and what you save matters more than your salary. A family earning $200K saving 20% builds more wealth than a family earning $300K saving 5%.",
      actionSteps: [
        "Max out all tax-advantaged accounts: 401(k) ($24,500), IRA ($7,500), HSA ($4,300/$8,550 for 2026)",
        "Open a taxable brokerage account for savings beyond retirement accounts",
        "Automate investments so saving happens before spending",
        "Review and rebalance portfolio annually — shift toward your target allocation",
        "Use the CFPB's tools at consumerfinance.gov to compare financial products and avoid predatory fees",
      ],
      category: "investing",
      priority: "high",
      icon: "🚀",
    });
    advice.push({
      id: "midcareer-estate",
      title: "Protect What You've Built: Estate & Insurance Review",
      description:
        "At this stage, you likely have dependents, a mortgage, and significant assets. Without proper protection, a single event can wipe out a decade of wealth building. Term life insurance is cheap — a healthy 40-year-old can get $1M in coverage for $40-60/month.",
      actionSteps: [
        "Get term life insurance: 10-12x annual income, 20-30 year term",
        "Create or update your will and designate beneficiaries on all accounts",
        "Review disability insurance — your income is your biggest asset",
        "Consider an umbrella insurance policy ($1-2M for ~$200-$400/year)",
        "Review beneficiary designations on all retirement accounts and insurance policies annually",
      ],
      category: "insurance",
      priority: "medium",
      icon: "🛡️",
    });
  } else {
    advice.push({
      id: "preretire-strategy",
      title: "Retirement Withdrawal Strategy: Order Matters",
      description:
        "How you withdraw is as important as how much you've saved. The wrong withdrawal order can cost you tens of thousands in unnecessary taxes. Generally: taxable accounts first (capital gains rates), then tax-deferred 401(k)/IRA (ordinary income rates), then Roth (tax-free) last. RMDs now start at age 73 (SECURE 2.0 raises this to 75 starting in 2033).",
      actionSteps: [
        "Map out all accounts by tax treatment: taxable, tax-deferred, and Roth",
        "Plan withdrawals to stay in the 12% or 22% bracket in early retirement",
        "Consider Roth conversions in years between retirement and Social Security/RMDs",
        "Delay Social Security to 70 if possible — each year of delay = 8% permanent increase",
        "Catch-up contributions for 50+: 401(k) extra $8,000/year; ages 60-63 get $11,250 (SECURE 2.0)",
        "Use T. Rowe Price or Bankrate.com retirement calculators to model different scenarios",
      ],
      category: "retirement",
      priority: "high",
      icon: "📋",
    });
    advice.push({
      id: "preretire-healthcare",
      title: "Bridge the Healthcare Gap Before Medicare",
      description:
        "If you retire before 65, healthcare is your biggest wildcard expense. ACA marketplace plans with premium subsidies can cost $200-$600/month depending on income — but only if you manage your MAGI carefully. Too many Roth conversions or capital gains can push you above subsidy thresholds.",
      actionSteps: [
        "If retiring before 65, budget $500-$1,500/month for healthcare",
        "Manage MAGI to stay below 400% FPL for ACA premium subsidies",
        "Use HSA funds tax-free for medical expenses — save receipts from prior years",
        "At 65, enroll in Medicare Parts A & B during your Initial Enrollment Period (don't miss it — penalties are permanent)",
        "Review MyMoney.gov for government resources on healthcare planning in retirement",
      ],
      category: "insurance",
      priority: "high",
      icon: "🏥",
    });
    advice.push({
      id: "preretire-rmd-planning",
      title: "Required Minimum Distributions: Plan Ahead to Minimize Taxes",
      description:
        "Once you reach age 73 (75 starting in 2033 under SECURE 2.0), you must take Required Minimum Distributions from traditional 401(k) and IRA accounts. These are taxed as ordinary income and could push you into a higher bracket. Strategic Roth conversions in lower-income years before RMDs begin can save tens of thousands.",
      actionSteps: [
        "Use the RMD calculator at Investor.gov to estimate your future required distributions",
        "Consider Roth conversions in years between retirement and RMD age to reduce future tax burden",
        "Qualified Charitable Distributions (QCDs) up to $105,000/year count toward your RMD but aren't taxed",
        "Roth accounts have no RMDs — another reason to prioritize Roth conversions while in lower brackets",
        "Consult with a CPA or use 360financialliteracy.org's resources to model different scenarios",
      ],
      category: "tax",
      priority: "high",
      icon: "📊",
    });
  }

  return advice;
}