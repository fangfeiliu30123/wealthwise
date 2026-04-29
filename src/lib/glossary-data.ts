export interface GlossaryEntry {
  slug: string;
  term: string;
  shortDef: string;
  explanation: string;
  benefits: string[];
  example: string;
  relatedTerms?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    slug: "roth-ira",
    term: "Roth IRA",
    shortDef: "A retirement account where you pay taxes now but withdrawals are tax-free in retirement.",
    explanation:
      "A Roth IRA is an individual retirement account funded with after-tax dollars. Unlike a traditional IRA where you get a tax deduction now but pay taxes later, with a Roth you pay taxes upfront but never pay taxes on the growth or withdrawals in retirement. There are income limits for direct contributions ($161K single, $240K married in 2024), but the 'backdoor' method bypasses these.",
    benefits: [
      "All growth and withdrawals are 100% tax-free after age 59½",
      "No required minimum distributions (RMDs) — your money can grow forever",
      "You can withdraw your contributions (not gains) anytime without penalty — acts as a backup emergency fund",
      "Especially powerful if you expect to be in a higher tax bracket in retirement",
    ],
    example:
      "Sarah, 28, contributes $7,000/year to her Roth IRA invested in VOO (S&P 500). At 8% average returns, by age 65 she'll have ~$1.1M — and every penny comes out tax-free. If she'd used a traditional IRA instead and is in the 24% bracket at withdrawal, she'd lose ~$264K to taxes.",
    relatedTerms: ["backdoor-roth", "roth-conversion", "traditional-ira"],
  },
  {
    slug: "backdoor-roth",
    term: "Backdoor Roth IRA",
    shortDef: "A legal workaround to contribute to a Roth IRA even if your income is too high.",
    explanation:
      "High earners can't contribute directly to a Roth IRA. The backdoor method works by contributing to a traditional IRA (no income limit for non-deductible contributions) and then immediately converting it to a Roth IRA. Since you contributed after-tax money and convert right away (before any gains), there's minimal or zero tax owed on the conversion.",
    benefits: [
      "Lets high earners access Roth benefits regardless of income",
      "Completely legal — confirmed by IRS and Congress",
      "No limit on income — works whether you make $200K or $2M",
    ],
    example:
      "Mike earns $250K and can't contribute directly to a Roth IRA. He contributes $7,000 to a traditional IRA (non-deductible), waits 1-2 business days, then converts to his Roth IRA. Since the $7,000 had no time to grow, he owes $0 in taxes on the conversion. He does this every year.",
    relatedTerms: ["roth-ira", "mega-backdoor-roth"],
  },
  {
    slug: "mega-backdoor-roth",
    term: "Mega Backdoor Roth",
    shortDef: "A strategy to contribute $40K+ extra per year to a Roth account through your employer's 401(k).",
    explanation:
      "The total 401(k) contribution limit is ~$69K-$72K (including employer match). Most people only use ~$23K (the employee elective deferral limit). If your plan allows after-tax contributions AND in-plan Roth conversions, you can fill the gap — potentially $40K+ per year — and convert it to Roth. This is the single largest legal tax shelter available to employees.",
    benefits: [
      "Shelter $40K-$50K+ per year in tax-free Roth growth — on top of your regular 401(k)",
      "Over 20 years at 8% returns, the extra contributions alone could grow to $2M+ tax-free",
      "Available at many large tech and finance companies",
    ],
    example:
      "Lisa works at Google, earns $300K. She maxes her pre-tax 401(k) at $23,500. Google matches $9,750. That's $33,250 total. The 401(k) limit is $70,000, so she contributes $36,750 in after-tax dollars and immediately converts to Roth. After 20 years at 8% returns, that extra $36,750/year grows to ~$1.8M — all tax-free.",
    relatedTerms: ["backdoor-roth", "401k", "roth-ira"],
  },
  {
    slug: "roth-conversion",
    term: "Roth Conversion",
    shortDef: "Moving money from a traditional (pre-tax) retirement account to a Roth (tax-free) account.",
    explanation:
      "A Roth conversion means transferring funds from a traditional IRA or old 401(k) into a Roth IRA. You pay income taxes on the converted amount in the year of conversion, but all future growth and withdrawals are tax-free. The strategy is most powerful when your income (and tax rate) is temporarily low — you 'lock in' a low tax rate on money that will grow tax-free for decades.",
    benefits: [
      "Lock in today's low tax rate on money that grows tax-free forever",
      "Eliminate future required minimum distributions (RMDs)",
      "Especially valuable during low-income years (grad school, career transition, early career)",
    ],
    example:
      "James is in grad school earning $25K/year (12% tax bracket). He has $50K in a traditional IRA from a previous job. He converts $37K to Roth (staying in the 12% bracket), paying ~$4,440 in taxes. When he's a surgeon earning $400K (37% bracket), that $37K will have grown to $200K+ — all tax-free. Without converting, he'd owe $74K+ in taxes on that same money.",
    relatedTerms: ["roth-ira", "traditional-ira"],
  },
  {
    slug: "traditional-ira",
    term: "Traditional IRA",
    shortDef: "A retirement account where contributions may be tax-deductible now, but you pay taxes on withdrawals.",
    explanation:
      "A traditional IRA gives you a tax deduction when you contribute (reducing your taxable income today), but you pay ordinary income taxes when you withdraw in retirement. If you have a workplace retirement plan, the deduction phases out at higher incomes. Required minimum distributions (RMDs) begin at age 73.",
    benefits: [
      "Immediate tax deduction reduces your tax bill this year",
      "Tax-deferred growth — no taxes on dividends or capital gains until withdrawal",
      "Can be converted to Roth IRA strategically during low-income years",
    ],
    example:
      "David, 35, earns $80K and contributes $7,000 to a traditional IRA. His taxable income drops to $73K, saving him ~$1,540 in taxes (22% bracket). The $7,000 grows tax-deferred for 30 years. At withdrawal in the 22% bracket, he pays $1,540 on the original $7,000 — but he had 30 years of tax-free compounding.",
    relatedTerms: ["roth-ira", "roth-conversion", "401k"],
  },
  {
    slug: "401k",
    term: "401(k)",
    shortDef: "An employer-sponsored retirement savings plan with tax benefits and often an employer match.",
    explanation:
      "A 401(k) is a retirement plan offered through your employer. You contribute pre-tax dollars (lowering your taxable income now), and many employers match a percentage of your contributions — that's free money. The 2024 employee contribution limit is $23,000 ($30,500 if 50+). Many plans now also offer a Roth 401(k) sub-account where contributions are after-tax but withdrawals are tax-free.\n\n**401(k) vs. Traditional IRA vs. Roth IRA — the simple breakdown:**\n• **401(k)**: Set up by your *employer*. Highest contribution limit ($23K). Often includes an employer match. Limited to the funds your plan offers. Pre-tax by default; Roth option sometimes available.\n• **Traditional IRA**: You open it yourself at any brokerage (Fidelity, Vanguard, Schwab). Lower limit ($7K). Pre-tax contributions (deductible if you don't have a workplace plan or are below income limits). Pay taxes on withdrawal.\n• **Roth IRA**: Same as Traditional IRA but you contribute *after-tax* money — and all growth + withdrawals in retirement are 100% tax-free. Best when you expect to be in a higher tax bracket later. Income limits apply ($161K single / $240K married in 2024) — high earners use the Backdoor Roth workaround.\n\nThe usual priority order: 1) 401(k) up to the employer match (free money), 2) Max HSA if eligible, 3) Max Roth IRA, 4) Max the rest of your 401(k), 5) Mega Backdoor Roth or taxable brokerage.",
    benefits: [
      "Employer match is an immediate 50–100% return on your money",
      "Pre-tax contributions lower your current tax bill",
      "Higher contribution limits than IRAs ($23K vs $7K)",
      "Automatic payroll deductions make saving effortless",
    ],
    example:
      "Emma earns $100K. Her employer matches 50% of contributions up to 6% of salary. She contributes 6% ($6,000/year), and her employer adds $3,000 — that's a 50% instant return. Plus, her taxable income drops to $94K, saving ~$1,320 in taxes (22% bracket). Not contributing at least 6% = leaving $3,000/year on the table.",
    relatedTerms: ["mega-backdoor-roth", "traditional-ira", "roth-ira"],
  },
  {
    slug: "hsa",
    term: "HSA (Health Savings Account)",
    shortDef: "The only account with triple tax benefits: deductible going in, tax-free growth, tax-free withdrawals for medical.",
    explanation:
      "An HSA is available to anyone with a High Deductible Health Plan (HDHP). It's the only account in the US tax code with a triple tax advantage: contributions are tax-deductible, growth is tax-free, and withdrawals for qualified medical expenses are tax-free. The advanced strategy: don't spend your HSA — pay medical bills out of pocket, invest the HSA in index funds, save receipts, and reimburse yourself years or decades later. After age 65, it works like a traditional IRA for any expense.",
    benefits: [
      "Triple tax advantage — no other account offers this",
      "No 'use it or lose it' rule (unlike FSAs) — rolls over forever",
      "After 65, withdrawals for any purpose (taxed like traditional IRA) or tax-free for medical",
      "Average American spends $280K+ on healthcare in retirement — HSA covers this tax-free",
    ],
    example:
      "Priya, 30, has an HDHP and contributes $4,150/year to her HSA. She pays her $500 doctor bill from her checking account (not the HSA), saves the receipt, and invests the HSA in index funds. After 35 years at 8% returns, her HSA grows to ~$690K — all tax-free for medical expenses. She can reimburse herself for every receipt she saved, whenever she wants.",
    relatedTerms: ["hdhp"],
  },
  {
    slug: "hdhp",
    term: "HDHP (High Deductible Health Plan)",
    shortDef: "A health insurance plan with higher deductibles but lower premiums, required to open an HSA.",
    explanation:
      "An HDHP has a higher annual deductible (2024: $1,600+ individual, $3,200+ family) and a maximum out-of-pocket limit. The tradeoff: lower monthly premiums. The key benefit is that HDHPs are the only plans that qualify you for an HSA — the tax savings from the HSA often more than offset the higher deductible, especially if you're generally healthy.",
    benefits: [
      "Lower monthly premiums than traditional plans",
      "Unlocks HSA eligibility — the most tax-advantaged account available",
      "HSA tax savings often exceed the higher deductible cost",
      "Great for healthy individuals who don't use healthcare frequently",
    ],
    example:
      "Tom compares plans: Traditional PPO costs $400/month with $500 deductible. HDHP costs $250/month with $1,600 deductible. The HDHP saves $1,800/year in premiums. His HSA contribution of $4,150 saves ~$913 in taxes (22% bracket). Net savings: $1,800 + $913 = $2,713/year — far more than the $1,100 higher deductible risk.",
    relatedTerms: ["hsa"],
  },
  {
    slug: "tax-loss-harvesting",
    term: "Tax-Loss Harvesting",
    shortDef: "Selling investments at a loss to offset capital gains taxes, then buying a similar investment.",
    explanation:
      "When you sell an investment for less than you paid, the loss can offset capital gains (and up to $3,000 of ordinary income per year). You can immediately reinvest in a similar (but not 'substantially identical') investment to maintain your portfolio allocation. The IRS wash-sale rule prevents buying back the exact same security within 30 days.",
    benefits: [
      "Reduce your tax bill by offsetting gains with losses",
      "Up to $3,000/year in losses can offset ordinary income (carried forward indefinitely)",
      "Your portfolio stays invested — you just swap to a similar fund",
      "Can save thousands annually for large taxable portfolios",
    ],
    example:
      "Alex has $10K in gains from selling AAPL. He also holds VTI (total market ETF) with a $8K loss. He sells VTI, harvesting the $8K loss, and buys SCHB (a similar total market ETF) immediately. His taxable gain drops from $10K to $2K, saving ~$1,200 in taxes (15% cap gains rate). After 31 days, he can switch back to VTI if he wants.",
    relatedTerms: ["capital-gains"],
  },
  {
    slug: "capital-gains",
    term: "Capital Gains Tax",
    shortDef: "Tax on profit from selling investments. Long-term (held 1+ year) rates are lower than short-term.",
    explanation:
      "When you sell an investment for more than you paid, the profit is a capital gain. Short-term gains (held less than 1 year) are taxed as ordinary income (up to 37%). Long-term gains (held over 1 year) get preferential rates: 0%, 15%, or 20% depending on your income. This is why buy-and-hold investing is so tax-efficient.",
    benefits: [
      "Long-term rates (0-20%) are much lower than ordinary income rates (up to 37%)",
      "0% rate applies if taxable income is under ~$47K single / $94K married",
      "Holding investments over 1 year before selling can cut your tax bill in half",
    ],
    example:
      "Maria bought $10K of VOO and it grew to $15K. If she sells after 11 months (short-term), she owes ~$1,100 in taxes (22% bracket). If she waits 1 more month (long-term), she owes only $750 (15% rate) — saving $350 just by waiting 30 days.",
    relatedTerms: ["tax-loss-harvesting"],
  },
  {
    slug: "index-fund",
    term: "Index Fund",
    shortDef: "A low-cost fund that tracks a market index (like the S&P 500), giving you instant diversification.",
    explanation:
      "An index fund passively tracks a market index — for example, VOO tracks the S&P 500 (500 largest US companies). Instead of trying to pick winning stocks, you own a small piece of the entire market. Index funds have ultra-low fees (0.03% for VOO vs. 1-2% for actively managed funds). Over 15 years, 90%+ of actively managed funds underperform their index — you're statistically better off with the index.",
    benefits: [
      "Instant diversification — one fund gives you hundreds or thousands of stocks",
      "Ultra-low fees (0.03-0.10%) vs. 1-2% for active funds — saves hundreds of thousands over a lifetime",
      "Historically returns ~10% annually (S&P 500 long-term average)",
      "No stock-picking skill required — just buy and hold",
    ],
    example:
      "Investing $500/month in VOO (0.03% fee) vs. an actively managed fund (1.0% fee), both earning 10% gross return. After 30 years: VOO = $1,130,000. Active fund = $983,000. The 0.97% fee difference costs you $147,000 — and the active fund likely underperformed the index anyway.",
    relatedTerms: ["sp500", "diversification"],
  },
  {
    slug: "sp500",
    term: "S&P 500",
    shortDef: "An index of the 500 largest US public companies — the benchmark for 'the stock market.'",
    explanation:
      "The S&P 500 includes companies like Apple, Microsoft, Amazon, Google, and 496 others. It represents ~80% of the total US stock market by value. When people say 'the market returned 10%,' they usually mean the S&P 500. Popular funds tracking it: VOO (Vanguard), SPY (SPDR), IVV (iShares) — all virtually identical with tiny fee differences.",
    benefits: [
      "Historical average return of ~10% per year (7% after inflation)",
      "Extremely liquid — can buy/sell instantly during market hours",
      "Self-cleansing — underperforming companies get removed, winners stay",
    ],
    example:
      "$10,000 invested in the S&P 500 in 1994 would be worth ~$210,000 in 2024 — a 21x return. Even with crashes (2000, 2008, 2020), buy-and-hold investors who stayed in came out far ahead.",
    relatedTerms: ["index-fund", "voo"],
  },
  {
    slug: "balance-transfer",
    term: "Balance Transfer",
    shortDef: "Moving high-interest credit card debt to a new card with 0% APR for 12-21 months.",
    explanation:
      "A balance transfer lets you move existing credit card debt to a new card offering 0% APR for an introductory period (typically 12-21 months). You pay a one-time transfer fee (usually 3-5% of the balance). During the 0% period, 100% of your payment goes to principal instead of interest. This can save thousands compared to paying 20-25% APR.",
    benefits: [
      "0% APR for 12-21 months — all payments go to principal",
      "Can save thousands in interest compared to 20-25% APR cards",
      "One-time 3-5% fee is much less than months of 20%+ interest",
      "Creates a clear deadline to pay off the debt",
    ],
    example:
      "Chris has $8,000 in credit card debt at 24% APR. Monthly interest: $160 — just to stay even. He transfers to Chase Slate Edge (0% for 21 months, 3% fee = $240). Now his entire $400/month payment attacks the principal. He pays off $8,400 total ($8,000 + $240 fee) in 21 months instead of paying $3,360 in interest over the same period. Savings: $3,120.",
    relatedTerms: ["apr"],
  },
  {
    slug: "apr",
    term: "APR (Annual Percentage Rate)",
    shortDef: "The yearly interest rate charged on debt, including fees — the true cost of borrowing.",
    explanation:
      "APR represents the annualized cost of borrowing money, including interest and certain fees. Credit cards typically have 20-30% APR (variable). Mortgages: 6-8%. Auto loans: 5-10%. Student loans: 4-8%. The higher the APR, the more urgently you should pay off that debt — or refinance to a lower rate.",
    benefits: [
      "Standardized way to compare the true cost of different loans",
      "Helps prioritize which debts to pay off first (highest APR = first priority)",
      "Required by law to be disclosed by lenders",
    ],
    example:
      "A $10,000 credit card balance at 24% APR costs $2,400/year in interest ($200/month). Making only minimum payments ($250/month), it takes 62 months to pay off and costs $5,500 in total interest. At 0% APR (balance transfer), the same $250/month pays it off in 40 months with $0 interest.",
    relatedTerms: ["balance-transfer"],
  },
  {
    slug: "dollar-cost-averaging",
    term: "Dollar-Cost Averaging (DCA)",
    shortDef: "Investing a fixed amount at regular intervals regardless of market price — removes emotion from investing.",
    explanation:
      "Instead of trying to time the market (buying low, selling high — which almost nobody can do consistently), DCA means investing the same dollar amount on a regular schedule (weekly, biweekly, monthly). When prices are high, you buy fewer shares. When prices are low, you buy more. Over time, this averages out your cost basis and removes the stress of market timing.",
    benefits: [
      "Removes emotion and market-timing risk from investing",
      "Automatically buys more shares when prices drop (buying the dip)",
      "Easy to automate through your brokerage",
      "Studies show DCA matches or outperforms lump-sum investing for most people (because they actually do it)",
    ],
    example:
      "Instead of agonizing over whether to invest $12,000 now, set up automatic $1,000/month into VOO. In January the market is high — you buy 2.5 shares at $400. In March it drops — you buy 3.3 shares at $300. By December, your average cost is lower than if you'd bought all at January's high price. Most importantly, you actually invested instead of waiting on the sidelines.",
    relatedTerms: ["index-fund"],
  },
  {
    slug: "emergency-fund",
    term: "Emergency Fund",
    shortDef: "3-6 months of expenses kept in a high-yield savings account for unexpected events.",
    explanation:
      "An emergency fund is cash reserves to cover unexpected expenses (job loss, medical bills, car repairs) without going into debt or selling investments at a bad time. The standard recommendation is 3-6 months of essential expenses. Keep it in a high-yield savings account (5%+ APY) — not invested in stocks, not under your mattress.",
    benefits: [
      "Prevents going into high-interest debt during emergencies",
      "Lets you take career risks (negotiate, switch jobs) without financial panic",
      "Prevents selling investments at a loss during market downturns",
      "Psychological benefit of financial security reduces stress",
    ],
    example:
      "Jen's monthly expenses are $4,000. She keeps $18,000 (4.5 months) in a Flourish high-yield savings account earning 5% APY ($75/month in interest). When her car needs a $3,000 repair, she pays from the emergency fund instead of putting it on a 24% APR credit card — saving ~$720 in interest over a year.",
    relatedTerms: ["high-yield-savings"],
  },
  {
    slug: "high-yield-savings",
    term: "High-Yield Savings Account (HYSA)",
    shortDef: "An FDIC-insured savings account paying 4-5%+ APY, vs. ~0.01% at traditional banks.",
    explanation:
      "Online banks and fintech platforms offer savings accounts paying 4-5%+ APY — over 400x more than the ~0.01% at big banks like Chase or BofA. Your money is just as safe (FDIC insured up to $250K). The difference: online banks have lower overhead, so they pass the savings to you as higher interest. Popular options: Flourish, Marcus (Goldman Sachs), Ally, Discover.",
    benefits: [
      "Earn 4-5%+ on your cash vs. 0.01% at traditional banks",
      "FDIC insured — just as safe as any bank account",
      "No risk to principal — unlike investing in stocks",
      "Perfect for emergency funds and short-term savings goals",
    ],
    example:
      "$20,000 in a Chase savings account (0.01% APY) earns $2/year. The same $20,000 in a Flourish HYSA (5.0% APY) earns $1,000/year. That's $998/year in free money just for moving your cash to a different bank. Takes 10 minutes to set up.",
    relatedTerms: ["emergency-fund"],
  },
  {
    slug: "asset-allocation",
    term: "Asset Allocation",
    shortDef: "How you divide investments between stocks, bonds, and other assets based on your age and risk tolerance.",
    explanation:
      "Asset allocation is the most important investment decision you'll make — studies show it determines ~90% of portfolio returns over time (not stock picking). A common rule of thumb: '110 minus your age' in stocks, the rest in bonds. Young investors can be more aggressive (90% stocks). Near retirement, shift to more bonds for stability. The key is matching your allocation to your time horizon and sleeping well at night.",
    benefits: [
      "Determines 90% of your portfolio's long-term performance",
      "Manages risk — bonds cushion stock market crashes",
      "Simple target-date funds do this automatically",
    ],
    example:
      "At 30, a simple allocation: 90% stocks (60% VOO US, 30% VXUS international), 10% bonds (BND). At 50: 60% stocks, 40% bonds. At 65: 40% stocks, 60% bonds. Or just buy a target-date fund (e.g., Vanguard Target 2060) and it automatically shifts for you.",
    relatedTerms: ["index-fund", "diversification"],
  },
  {
    slug: "diversification",
    term: "Diversification",
    shortDef: "Spreading investments across many assets so no single loss can devastate your portfolio.",
    explanation:
      "Diversification means not putting all your eggs in one basket. If 50% of your portfolio is one stock and it drops 50%, you lose 25% of everything. If that stock is 5% of a diversified portfolio, the same drop costs you only 2.5%. Index funds provide instant diversification — VOO holds 500 stocks, VT holds 9,000+ stocks globally.",
    benefits: [
      "Reduces risk without necessarily reducing returns",
      "Protects against any single company or sector failing",
      "Index funds provide instant diversification in one purchase",
    ],
    example:
      "In 2022, Meta (Facebook) stock dropped 65%. If it was 40% of your portfolio, you'd lose 26% overall. If you held VOO instead (where Meta is ~1.5%), the same Meta crash cost you only ~1% of your portfolio. VOO itself was down 19% — but recovered fully by 2024.",
    relatedTerms: ["index-fund", "asset-allocation"],
  },
  {
    slug: "compound-interest",
    term: "Compound Interest",
    shortDef: "Earning interest on your interest — the force that turns small regular investments into large sums.",
    explanation:
      "Compound interest means your money earns returns, and then those returns earn returns. The Rule of 72: divide 72 by your return rate to see how many years it takes to double. At 8% returns, your money doubles every 9 years. This is why starting early matters so much — the first $100K is the hardest, but then compounding accelerates dramatically.",
    benefits: [
      "Turns small consistent investments into life-changing wealth over time",
      "Starting 10 years earlier can mean 2-3x more at retirement",
      "Works automatically — you just need to invest consistently and be patient",
    ],
    example:
      "$500/month at 8% returns: After 10 years: $91K. After 20 years: $294K. After 30 years: $745K. After 40 years: $1.75M. Notice the last 10 years added $1M — more than the first 30 years combined. That's compounding. Starting at 25 vs 35 with the same contributions means $1M more at retirement.",
    relatedTerms: ["dollar-cost-averaging", "index-fund"],
  },
  {
    slug: "529-plan",
    term: "529 Plan",
    shortDef: "A tax-advantaged savings plan for education expenses — grows tax-free, withdrawals tax-free for school.",
    explanation:
      "A 529 plan lets you save for education (K-12, college, grad school) with tax-free growth and tax-free withdrawals for qualified expenses. Many states offer a state tax deduction for contributions. SECURE 2.0 added a huge benefit: unused 529 funds can be rolled into a Roth IRA (up to $35K lifetime, after 15 years), eliminating the risk of over-saving.",
    benefits: [
      "Tax-free growth and tax-free withdrawals for education expenses",
      "Many states offer a state tax deduction — immediate 4-9% return",
      "Unused funds can roll to Roth IRA ($35K lifetime) per SECURE 2.0",
      "Can be used for K-12 private school tuition (up to $10K/year), not just college",
    ],
    example:
      "The Johnsons contribute $500/month to New York's 529 Direct plan when their daughter is born. They get a $5,000 NY state tax deduction each year (saving ~$325/year in state taxes). At 8% returns, the account grows to ~$240K by college. All withdrawals for tuition, room, and board are tax-free. If she gets a full scholarship, they roll $35K to her Roth IRA — a huge head start on retirement savings.",
    relatedTerms: ["roth-ira"],
  },
  {
    slug: "pslf",
    term: "PSLF (Public Service Loan Forgiveness)",
    shortDef: "Federal student loan forgiveness after 10 years of payments while working for a nonprofit or government.",
    explanation:
      "PSLF forgives the remaining balance on federal Direct Loans after 120 qualifying monthly payments (10 years) while working full-time for a qualifying employer (government, nonprofit, 501(c)(3)). You must be on an income-driven repayment plan. The average PSLF forgiveness is $70,000-$150,000+. Critical: do NOT refinance federal loans to private lenders — you'll permanently lose PSLF eligibility.",
    benefits: [
      "Complete forgiveness of remaining balance after 10 years",
      "Average forgiveness amount: $70K-$150K+",
      "Combined with income-driven repayment, monthly payments can be very low",
      "Forgiven amount is NOT taxable income (unlike other forgiveness programs)",
    ],
    example:
      "Dr. Patel has $200K in federal student loans, earns $80K at a nonprofit hospital. On the SAVE plan, her payment is $350/month. After 10 years (120 payments = $42,000 total paid), the remaining ~$180K+ is forgiven tax-free. If she'd refinanced privately, she'd have paid ~$280K total over 20 years.",
    relatedTerms: ["idr"],
  },
  {
    slug: "idr",
    term: "Income-Driven Repayment (IDR)",
    shortDef: "Federal student loan repayment plans that cap monthly payments at a percentage of your discretionary income.",
    explanation:
      "IDR plans (SAVE, PAYE, IBR, ICR) set your monthly federal student loan payment based on your income rather than your loan balance. The SAVE plan caps payments at 5-10% of discretionary income. After 20-25 years of payments, any remaining balance is forgiven. If your income is low enough, your payment could be $0/month.",
    benefits: [
      "Payments based on what you can afford, not what you owe",
      "Payments can be as low as $0/month during low-income periods",
      "Remaining balance forgiven after 20-25 years",
      "Qualifies you for PSLF if working for a qualifying employer",
    ],
    example:
      "After grad school, Maria earns $35K with $80K in federal loans. Standard repayment: $920/month (impossible on $35K). On the SAVE plan: $88/month (5% of income above 225% of poverty line). As her income grows, payments adjust. If she works for government, the remaining balance is forgiven after 10 years via PSLF.",
    relatedTerms: ["pslf"],
  },
  {
    slug: "s-corp",
    term: "S-Corp Election",
    shortDef: "A tax election for LLCs that can save 15.3% self-employment tax on business profits above a reasonable salary.",
    explanation:
      "By default, LLC profits are subject to 15.3% self-employment tax (Social Security + Medicare). With an S-Corp election (Form 2553), you pay yourself a 'reasonable salary' (subject to payroll taxes) and take remaining profits as distributions (not subject to SE tax). This works when net profit significantly exceeds a reasonable salary.",
    benefits: [
      "Save 15.3% SE tax on profits above your reasonable salary",
      "Can save $5,000-$30,000+ per year depending on profit level",
      "Simple IRS form to elect — no need to change your LLC structure",
    ],
    example:
      "Freelancer Dev earns $150K net profit. Without S-Corp: pays 15.3% SE tax on all $150K = $22,950. With S-Corp: pays $80K salary (payroll taxes: $12,240) + takes $70K as distribution (no SE tax). Savings: $10,710/year. Note: S-Corp has additional costs (payroll processing ~$500/year, separate tax return ~$1,500), so net savings ~$8,700.",
    relatedTerms: ["qbi"],
  },
  {
    slug: "qbi",
    term: "QBI Deduction (Section 199A)",
    shortDef: "A 20% deduction on qualified business income for self-employed and small business owners.",
    explanation:
      "The Qualified Business Income deduction lets eligible self-employed individuals and pass-through business owners deduct up to 20% of their qualified business income. This effectively reduces your top tax rate by 20%. It phases out for high-income service businesses (above $191K single / $383K married in 2024).",
    benefits: [
      "20% deduction on business income — like paying taxes on only 80% of your profit",
      "Available to sole proprietors, LLCs, S-Corps, partnerships",
      "Can save thousands per year for self-employed individuals",
    ],
    example:
      "Freelance designer Ava earns $100K in business income. The QBI deduction is 20% × $100K = $20,000. Her taxable income drops from $100K to $80K, saving ~$4,400 in taxes (22% bracket). This deduction is automatic — you just need to report business income on Schedule C.",
    relatedTerms: ["s-corp"],
  },
  {
    slug: "voo",
    term: "VOO (Vanguard S&P 500 ETF)",
    shortDef: "A popular, ultra-low-cost ETF tracking the S&P 500 — the most recommended single fund for US stock exposure.",
    explanation:
      "VOO is Vanguard's S&P 500 ETF with a 0.03% expense ratio (that's $3/year per $10,000 invested). It holds all 500 companies in the S&P 500 index, weighted by market cap. It's functionally identical to SPY and IVV — VOO just has the lowest fee. Often recommended as the 'if you only buy one fund' choice for US stock market exposure.",
    benefits: [
      "0.03% expense ratio — one of the cheapest funds in existence",
      "Instant diversification across 500 largest US companies",
      "Historical average return ~10%/year",
      "Extremely liquid — trade anytime during market hours",
    ],
    example:
      "$10,000 invested in VOO in 2014 would be worth ~$32,000 by 2024 — a 220% return with almost zero effort. The $3/year fee on that $10,000 means over 10 years you paid about $60 total in fees — compared to $2,000+ for a typical 2% fee fund.",
    relatedTerms: ["index-fund", "sp500"],
  },
  {
    slug: "child-tax-credit",
    term: "Child Tax Credit",
    shortDef: "A federal tax credit of up to $2,000 per qualifying child under 17.",
    explanation:
      "The Child Tax Credit (CTC) directly reduces your federal tax bill — dollar for dollar — for each qualifying child under age 17. Unlike a deduction (which reduces taxable income), a credit reduces actual taxes owed. Up to $1,700 is refundable (you get it even if you owe no tax). Income phase-outs begin at $200K single / $400K married.",
    benefits: [
      "Directly reduces taxes owed by up to $2,000 per child per year",
      "Partially refundable — you can receive up to $1,700 even with zero tax liability",
      "Available for children under 17 with a valid SSN",
      "No limit on number of qualifying children",
    ],
    example:
      "A married couple with 2 children under 17 and $80,000 combined income would receive $4,000 in Child Tax Credits, reducing their federal tax bill from $6,800 to $2,800. If they owed less than $4,000, they'd get up to $3,400 refunded.",
    relatedTerms: ["Dependent Care FSA", "Earned Income Tax Credit"],
  },
  {
    slug: "dependent-care-fsa",
    term: "Dependent Care FSA",
    shortDef: "A pre-tax account that lets you set aside up to $5,000/year for childcare expenses.",
    explanation:
      "A Dependent Care Flexible Spending Account (DCFSA) lets you set aside pre-tax dollars from your paycheck to pay for eligible childcare — daycare, preschool, before/after-school programs, and summer day camps. The money avoids federal income tax, Social Security tax, and Medicare tax, giving you a ~30% discount on childcare.",
    benefits: [
      "Save ~30% on childcare costs by avoiding income tax + payroll taxes",
      "Covers daycare, preschool, after-school care, and summer day camps",
      "Reduces your taxable income and your FICA taxes",
      "Can be combined with the Child and Dependent Care Credit (but not for the same expenses)",
    ],
    example:
      "A parent in the 22% tax bracket contributing $5,000 to a Dependent Care FSA saves $1,100 in income tax plus $383 in FICA taxes = $1,483 total savings. That's like getting 6 weeks of daycare free.",
    relatedTerms: ["Child Tax Credit", "529 Plan"],
  },
  {
    slug: "eitc",
    term: "Earned Income Tax Credit",
    shortDef: "A refundable tax credit for low-to-moderate income workers, especially those with children.",
    explanation:
      "The Earned Income Tax Credit (EITC) is one of the largest anti-poverty programs in the US. It's a refundable credit — meaning you get the full amount even if you owe no taxes. The credit increases with earned income up to a point, then phases out. Having children significantly increases the credit amount, from ~$600 with no kids to ~$7,830 with 3+ children.",
    benefits: [
      "Fully refundable — you receive the entire credit as a refund if you owe no tax",
      "Worth up to $7,830 with 3+ qualifying children",
      "Phases in with earned income — encourages work",
      "Can be combined with Child Tax Credit for even larger refunds",
    ],
    example:
      "A single parent with 2 children earning $25,000/year could receive an EITC of approximately $6,164. Combined with $4,000 in Child Tax Credits, their total tax benefit would be over $10,000 — effectively a 40% boost to their income.",
    relatedTerms: ["Child Tax Credit"],
  },
  {
    slug: "fica",
    term: "FICA (Social Security + Medicare Tax)",
    shortDef: "Federal payroll tax of 7.65% that funds Social Security and Medicare — automatically deducted from your paycheck.",
    explanation:
      "FICA stands for the Federal Insurance Contributions Act. It's the payroll tax that funds Social Security (6.2% on wages up to $168,600 in 2024) and Medicare (1.45% on all wages, with an extra 0.9% on wages over $200K single). Your employer pays a matching amount. Self-employed people pay both halves (15.3%) but get to deduct half. FICA is separate from federal income tax — even people who owe $0 in income tax still pay FICA.",
    benefits: [
      "Funds your future Social Security retirement benefits (claim at 62–70)",
      "Funds Medicare healthcare starting at age 65",
      "Required by law — no opt-out for W-2 employees",
    ],
    example:
      "Sarah earns $100K. Her FICA: $100K × 6.2% = $6,200 (Social Security) + $100K × 1.45% = $1,450 (Medicare) = $7,650 total. Her employer pays another $7,650 on her behalf (she never sees it). On her paycheck, $7,650 / 26 pay periods = ~$294 per check.",
    relatedTerms: ["agi"],
  },
  {
    slug: "piti",
    term: "PITI (Principal, Interest, Taxes, Insurance)",
    shortDef: "The four components of your total monthly mortgage payment that lenders use to qualify you for a home loan.",
    explanation:
      "PITI is the all-in monthly cost of owning a home: **P**rincipal (paying down the loan), **I**nterest (cost of borrowing), **T**axes (property tax, often escrowed monthly), and **I**nsurance (homeowner's insurance + PMI if down payment is under 20%). Lenders typically require your PITI to be ≤ 28% of your gross monthly income (the 'front-end DTI ratio'). Many people also include HOA dues to get the full picture.",
    benefits: [
      "Gives a true picture of monthly home cost — not just the mortgage payment",
      "Used by lenders to determine how much house you can afford",
      "Prevents the rookie mistake of budgeting for P&I only",
    ],
    example:
      "On a $400K home with 20% down ($80K) and a 6.8% 30-yr mortgage: Principal + Interest = $2,086/mo. Property tax (1.2% of $400K ÷ 12) = $400/mo. Insurance ($2,000/yr ÷ 12) = $167/mo. Total PITI = $2,653/mo. To qualify under the 28% rule, you'd need gross income of ~$113,700/yr.",
    relatedTerms: ["dti", "mortgage"],
  },
  {
    slug: "dti",
    term: "DTI (Debt-to-Income Ratio)",
    shortDef: "The percentage of your gross monthly income that goes to debt payments — lenders' #1 metric for qualifying you.",
    explanation:
      "DTI = total monthly debt payments ÷ gross monthly income. There are two versions: **Front-end DTI** (just housing/PITI, lender max ≈ 28%) and **Back-end DTI** (housing + all other debt — car loan, student loans, credit cards minimums, lender max ≈ 36–43%). Lower is always better. Conventional mortgages typically cap back-end DTI at 43%; FHA loans go up to 50%.",
    benefits: [
      "Determines how large of a mortgage you qualify for",
      "Lower DTI = better interest rates offered",
      "Forces a reality check on whether you can truly afford a debt",
    ],
    example:
      "Mike earns $8,000/mo gross. He's looking at a $2,000/mo PITI, has a $400/mo car payment, and $200/mo in student loans. Front-end DTI = $2,000 / $8,000 = 25% ✓. Back-end DTI = $2,600 / $8,000 = 32.5% ✓. He qualifies. If his car payment were $800 instead, back-end DTI would be 40% — still under 43%, but rate offers would be worse.",
    relatedTerms: ["piti"],
  },
  {
    slug: "mortgage",
    term: "Mortgage",
    shortDef: "A loan used to buy real estate, secured by the property itself — typically 15 or 30 years long.",
    explanation:
      "A mortgage lets you buy a home with a down payment (typically 5–20%) and borrow the rest. The most common is a 30-year fixed-rate mortgage — same monthly payment for 30 years. A 15-year mortgage has higher monthly payments but ~1% lower rate and you build equity faster. The total interest paid on a 30-yr loan often equals or exceeds the original loan amount. Refinancing makes sense when rates drop ~1%+ below your current rate.",
    benefits: [
      "Lets you build equity instead of paying rent",
      "Mortgage interest is tax-deductible (if itemizing)",
      "Locks in housing cost — protects against rent inflation",
      "30-yr fixed = predictable budget for decades",
    ],
    example:
      "$400K home, 20% down ($80K), 30-yr fixed at 6.8%: monthly P&I = $2,086. Total paid over 30 years = $751K — meaning $431K in interest. Same loan at 15-yr / 5.8%: monthly P&I = $2,668. Total paid = $480K — only $160K in interest. The 15-yr saves $271K but requires $582 more per month.",
    relatedTerms: ["piti", "dti"],
  },
  {
    slug: "agi",
    term: "AGI (Adjusted Gross Income)",
    shortDef: "Your gross income minus specific 'above-the-line' deductions — the number that drives most tax calculations.",
    explanation:
      "AGI = total income (wages, interest, dividends, business income) minus above-the-line deductions (traditional 401(k) and IRA contributions, HSA contributions, student loan interest up to $2.5K, half of self-employment tax). AGI determines eligibility for the Roth IRA, education credits, deductible IRA contributions, and many other tax benefits. **MAGI** (Modified AGI) adds back a few items and is what's actually used for most income-based phaseouts.",
    benefits: [
      "Lower AGI = qualifies for more tax credits and deductions",
      "Maxing pre-tax 401(k)/HSA directly reduces AGI",
      "Determines Roth IRA eligibility ($161K single / $240K married phaseout)",
    ],
    example:
      "Lisa earns $130K W-2. She maxes her 401(k) at $23K and HSA at $4,150. Her AGI = $130K − $23K − $4,150 = $102,850. This keeps her under the $146K Roth IRA single phaseout, so she can contribute the full $7,000 directly without needing the Backdoor Roth.",
    relatedTerms: ["401k", "roth-ira"],
  },
  {
    slug: "filing-status",
    term: "Filing Status (Single / MFJ / HOH)",
    shortDef: "Your tax filing category — determines your tax brackets, standard deduction, and many credit eligibility limits.",
    explanation:
      "The IRS recognizes 5 filing statuses. The 3 most common:\n\n• **Single**: Unmarried, no qualifying dependents. 2024 standard deduction: $14,600.\n• **MFJ (Married Filing Jointly)**: Married couples filing one combined return. Highest standard deduction ($29,200) and widest brackets — usually the lowest tax. Both spouses are jointly liable for the full tax.\n• **HOH (Head of Household)**: Unmarried but supports a qualifying child or relative (paid more than half the cost of maintaining the home). Standard deduction $21,900, brackets in between Single and MFJ.\n\nMFS (Married Filing Separately) and Qualifying Surviving Spouse exist but are rare. Choosing the right status can save thousands per year.",
    benefits: [
      "MFJ usually saves more than two Single returns combined",
      "HOH gives single parents a major boost over Single status",
      "Filing status determines bracket widths, deduction size, and credit phaseouts",
    ],
    example:
      "A couple earning $80K + $80K = $160K total. Filing Single (each): combined federal tax ≈ $24,700. Filing MFJ: federal tax ≈ $22,400. Marriage saves them ~$2,300/yr. A single parent earning $60K with one child: Single status owes ~$5,000; HOH status owes ~$3,400 — saving $1,600.",
    relatedTerms: ["agi"],
  },
  {
    slug: "etf",
    term: "ETF (Exchange-Traded Fund)",
    shortDef: "A basket of stocks or bonds that trades on a stock exchange like a single stock — usually tracks an index.",
    explanation:
      "An ETF is a fund that holds many securities (stocks, bonds, commodities) but trades on the stock market like a single share. ETFs are typically passively managed (track an index) with very low fees. Compared to mutual funds, ETFs are more tax-efficient (less capital gains distribution), trade intraday (you see real-time prices), and have no investment minimum beyond the price of one share. Examples: VTI (US total market), VXUS (international), BND (US bonds).",
    benefits: [
      "Ultra-low expense ratios (0.03–0.10% typical)",
      "Tax-efficient — minimal capital gains distributions",
      "Buy/sell instantly during market hours like a stock",
      "Instant diversification with one ticker",
    ],
    example:
      "Buying 1 share of VTI (~$280) gives you fractional ownership of all ~3,700 publicly traded US companies. Annual fee: 0.03% — that's $0.84 per year on $2,800 invested.",
    relatedTerms: ["index-fund", "vti", "vxus"],
  },
  {
    slug: "vti",
    term: "VTI (Vanguard Total Stock Market ETF)",
    shortDef: "An ETF holding ~3,700 US stocks — broader than the S&P 500, the most popular 'one-fund' US equity choice.",
    explanation:
      "VTI tracks the CRSP US Total Market Index, holding nearly every publicly traded US company — large, mid, and small cap. Expense ratio is 0.03% ($3/yr per $10K). Compared to VOO (S&P 500), VTI adds ~3,200 mid- and small-cap stocks for slightly more diversification. Historical returns track very closely to VOO since the S&P 500 is ~80% of total US market cap. Many FIRE/Boglehead investors use VTI as their core US holding.",
    benefits: [
      "Owns essentially the entire US stock market in one fund",
      "0.03% expense ratio — among the lowest in the industry",
      "Tax-efficient ETF structure",
      "Captures small-cap upside missed by S&P 500-only funds",
    ],
    example:
      "$1,000/mo into VTI for 30 years at the S&P 500's historical 10% return = ~$2.26M. The lifetime cost in fees: ~$13K (vs. ~$240K for a typical 1% actively managed fund).",
    relatedTerms: ["etf", "vxus", "sp500", "voo"],
  },
  {
    slug: "vxus",
    term: "VXUS (Vanguard Total International Stock ETF)",
    shortDef: "An ETF holding ~8,500 stocks from developed and emerging markets outside the US.",
    explanation:
      "VXUS gives you exposure to non-US stocks — Europe, Japan, China, India, emerging markets. Expense ratio: 0.07%. Many advisors recommend a 70/30 or 80/20 US/international split (VTI/VXUS) for global diversification, since ~40% of world market cap is non-US. VXUS pays slightly higher dividends than VTI (~3% vs 1.4%), partially because international markets have been valuation-discounted vs. US for the past decade.",
    benefits: [
      "True global diversification — not just US",
      "Hedges against US-specific underperformance",
      "Foreign tax credit recoverable if held in taxable account",
    ],
    example:
      "An 80/20 VTI/VXUS portfolio: $800 of every $1,000 invested goes to US stocks, $200 to international. Over 30 years, this captures upside from whichever region outperforms — and reduces sequence-of-returns risk.",
    relatedTerms: ["etf", "vti"],
  },
  {
    slug: "vmfxx",
    term: "VMFXX (Vanguard Federal Money Market Fund)",
    shortDef: "A money market fund yielding ~5% on cash, with state-tax-exempt income from US Treasury holdings.",
    explanation:
      "VMFXX is Vanguard's flagship government money market fund. It holds short-term US Treasury bills and government repos, currently yielding ~5.0% SEC yield (2024). The big advantage over a regular HYSA: ~60–70% of its income comes from US Treasury obligations, which is exempt from state and local income tax. For someone in CA/NY (high state tax states) with significant cash, this can be worth an extra 0.5–1% in after-tax yield. Available inside a Vanguard brokerage account; trades like a fund (settles next day).",
    benefits: [
      "~5% yield with near-zero credit risk (US government backed)",
      "Most income state-tax-exempt — big win in CA/NY/NJ/HI",
      "Better than most HYSAs after-tax for high earners in high-tax states",
      "$1.00 share price — designed not to fluctuate",
    ],
    example:
      "Aisha lives in CA (9.3% top state rate) and parks $100K in VMFXX. SEC yield 5.0% = $5,000/yr. ~65% is Treasury income → $3,250 escapes CA tax (saves ~$300/yr vs. an HYSA paying the same yield).",
    relatedTerms: ["t-bills", "high-yield-savings"],
  },
  {
    slug: "t-bills",
    term: "T-Bills (US Treasury Bills)",
    shortDef: "Short-term US government debt (4 weeks to 52 weeks) — the safest dollar investment, and state-tax-free.",
    explanation:
      "Treasury Bills are short-duration debt issued by the US Treasury, sold at a discount and maturing at face value. Maturities: 4, 8, 13, 17, 26, and 52 weeks. Currently yielding ~5.0–5.3%. Income is exempt from state and local taxes (federal taxable). Buy directly at TreasuryDirect.gov (no fees) or through any brokerage. A common strategy is a 'T-Bill ladder' — buying T-Bills with staggered maturities so cash matures regularly.",
    benefits: [
      "Backed by the full faith and credit of the US government — zero default risk",
      "State and local tax exempt",
      "Highly liquid secondary market",
      "Yields often beat HYSAs and CDs",
    ],
    example:
      "Alex has $50K earmarked for a home down payment in 2 years. He builds a 6-month T-Bill ladder: $8,333 maturing each month at ~5.2%. As each matures, he reinvests into a new 6-month bill. Total income: ~$2,600/yr, all state-tax-free.",
    relatedTerms: ["vmfxx", "high-yield-savings"],
  },
  {
    slug: "vteb",
    term: "VTEB (Vanguard Tax-Exempt Bond ETF)",
    shortDef: "A muni bond ETF where interest is exempt from federal income tax — best for high earners in taxable accounts.",
    explanation:
      "VTEB holds investment-grade municipal bonds issued by US states and localities. Interest income is exempt from federal income tax (and from your home state's tax if you buy a state-specific muni fund). Current SEC yield ~3.5% — but for someone in the 32% federal bracket, that's a tax-equivalent yield of ~5.1%. Best used for the bond portion of a taxable brokerage account. Don't hold munis in an IRA/401(k) — you'd waste the tax advantage.",
    benefits: [
      "Federal-tax-free interest income",
      "Tax-equivalent yield often beats taxable bonds for high earners",
      "Diversified across thousands of muni issuers — low default risk",
    ],
    example:
      "A 32%-bracket investor compares VTEB (3.5% federal-tax-free) vs. BND (4.5% taxable). After-tax yield on BND: 4.5% × (1 − 0.32) = 3.06%. VTEB wins by ~0.44%/yr — about $440/yr extra on a $100K position.",
    relatedTerms: ["bsv", "etf"],
  },
  {
    slug: "bsv",
    term: "BSV (Vanguard Short-Term Bond ETF)",
    shortDef: "A short-duration bond ETF (1–5 yr maturities) — low volatility, ~4.5% yield, good for 3–5yr money.",
    explanation:
      "BSV holds investment-grade US bonds (Treasuries + corporates) with average maturities of 1–5 years. Because of the short duration, it barely moves when interest rates change — making it ideal for money you'll need in 2–5 years (e.g., near-term home down payment savings sleeve). Expense ratio 0.04%. Currently yielding ~4.5%. Higher yield than HYSA, with very modest price risk.",
    benefits: [
      "Higher yield than HYSA with minimal interest-rate risk",
      "Pairs well with cash for 3–5yr time horizons",
      "Diversified across hundreds of bonds",
    ],
    example:
      "For a home down payment goal 4 years away: 30% in BSV (~4.5%) + 70% in T-Bills/HYSA (~5%) gives a blended ~4.85% yield with very low drawdown risk. Pure equities would have higher expected return but unacceptable downside if the market dips right before purchase.",
    relatedTerms: ["vteb", "etf"],
  },
  {
    slug: "apy",
    term: "APY (Annual Percentage Yield)",
    shortDef: "The real yearly return on a savings account, accounting for compounding — what you actually earn.",
    explanation:
      "APY is the effective annual interest rate including the effect of compounding (vs. APR, which doesn't compound). For savings accounts, money market funds, and CDs, APY is the number to compare. A 5.0% APY means $1,000 grows to $1,050 after one year. Always compare APY-to-APY when shopping rates — not APR vs APY.",
    benefits: [
      "Standardized way to compare savings account returns",
      "Required to be disclosed by banks",
      "Higher APY directly = more money in your pocket",
    ],
    example:
      "Chase savings: 0.01% APY → $20K earns $2/yr. Marcus HYSA: 4.5% APY → $20K earns $900/yr. Wealthfront Cash: 5.0% APY → $20K earns $1,000/yr. Same risk (FDIC insured), different APY = $998/yr difference for free.",
    relatedTerms: ["high-yield-savings", "apr"],
  },
  {
    slug: "vfiax",
    term: "VFIAX",
    shortDef: "Vanguard's S&P 500 Index Fund — owns the 500 largest U.S. companies in one ticker.",
    explanation:
      "VFIAX is the Vanguard 500 Index Fund Admiral Shares — a low-cost mutual fund that tracks the S&P 500 index. It holds the same 500 large-cap U.S. companies (Apple, Microsoft, Amazon, etc.) in roughly the same proportions as the index. Expense ratio is just 0.04%, meaning you keep 99.96% of returns. It's the mutual-fund cousin of VOO (the ETF version) — same holdings, different wrapper. Most often used as a core holding inside 401(k)s and IRAs.",
    benefits: [
      "Instant diversification across 500 of America's largest companies",
      "Ultra-low 0.04% expense ratio — beats >85% of actively managed funds long-term",
      "$3,000 minimum investment (vs. $1 for VOO ETF)",
      "Automatic dividend reinvestment available",
    ],
    example:
      "Anna invests $10,000 in VFIAX inside her Roth IRA. Annual fee: $4 (0.04%). Over 30 years at 8% historical S&P returns, that grows to ~$100K — vs. an actively managed fund charging 1% that would grow to only ~$76K. Same investment, $24K more from picking the lower-fee index fund.",
    relatedTerms: ["voo", "sp500", "index-fund", "expense-ratio"],
  },
  {
    slug: "expense-ratio",
    term: "Expense Ratio",
    shortDef: "The annual fee a fund charges, expressed as a percentage of your investment.",
    explanation:
      "An expense ratio is the yearly fee a mutual fund or ETF charges to cover its operating costs. A 0.04% expense ratio on a $10,000 investment costs you $4/year — automatically deducted from returns, so you never see a bill. Over decades these tiny percentages compound massively: a 1% fee vs. a 0.05% fee can cost you 25-30% of your final balance over 30 years. Index funds typically charge 0.03%-0.20%; actively managed funds often charge 0.5%-1.5%.",
    benefits: [
      "Lower expense ratios = more of the market's return goes to you",
      "Easy apples-to-apples comparison between funds",
      "A simple way to filter out overpriced funds",
    ],
    example:
      "Two S&P 500 funds: Vanguard VFIAX at 0.04% vs. an actively managed fund at 1.0%. On $100K invested for 30 years at 8% gross returns: VFIAX → $986K. The 1% fund → $761K. The expense ratio cost $225K — for the same underlying market exposure.",
    relatedTerms: ["index-fund", "voo", "vfiax"],
  },
  {
    slug: "auto-liability-limits",
    term: "250/500/100 Auto Liability",
    shortDef: "Auto insurance liability minimums of $250K per person / $500K per accident / $100K property damage.",
    explanation:
      "The three numbers on car insurance — written like 250/500/100 — are your liability coverage limits in thousands of dollars: $250,000 max per injured person, $500,000 max total per accident, $100,000 for property damage. Most state minimums are far lower (often 25/50/25), but if you have any meaningful assets (savings, home equity, retirement accounts), low limits leave you personally exposed when sued. Umbrella insurance policies typically REQUIRE you to carry at least 250/500/100 on auto and 300K on homeowners before they'll cover you on top.",
    benefits: [
      "Protects assets if you cause a serious injury or multi-car accident",
      "Required floor before umbrella insurance kicks in",
      "Costs only ~$10-30/month more than state minimums but adds hundreds of thousands in protection",
    ],
    example:
      "Mark has $400K in retirement and $150K home equity. He carries state-minimum 25/50/25 auto. He causes an accident with $400K in injuries. Insurance pays $25K — Mark is personally on the hook for $375K and the injured party can sue for his retirement and home equity. Had he carried 250/500/100 + a $1M umbrella ($30/mo total), his personal exposure would be $0.",
    relatedTerms: ["umbrella-insurance"],
  },
  {
    slug: "umbrella-insurance",
    term: "Umbrella Insurance",
    shortDef: "Extra liability insurance that kicks in after your auto/home limits are exhausted.",
    explanation:
      "An umbrella policy adds $1M-$5M of liability coverage on top of your auto and homeowners insurance. If a covered claim exceeds your underlying limits (auto, home, boat, etc.), the umbrella picks up the rest — including legal defense costs. It's one of the cheapest forms of insurance: typically $200-$400/year for $1M of coverage. Insurers require you to carry minimum underlying limits first (usually 250/500/100 auto and $300K home) so the umbrella isn't the front line.",
    benefits: [
      "$1M of extra protection for ~$20-35/month",
      "Covers lawsuits, libel/slander, and coverage gaps",
      "Pays legal defense costs separately from the limit",
      "Critical once net worth exceeds $250K",
    ],
    example:
      "Sarah's dog bites a guest, causing $800K in injuries and legal fees. Her homeowners caps out at $300K. Without umbrella, she'd owe $500K personally. With a $1M umbrella ($25/mo), the umbrella pays the remaining $500K — she pays $0 out of pocket.",
    relatedTerms: ["auto-liability-limits"],
  },
  {
    slug: "fmr",
    term: "FMR (Fair Market Rent)",
    shortDef: "HUD's official estimate of typical rent for a metro area, used for housing affordability benchmarks.",
    explanation:
      "Fair Market Rent (FMR) is published every year by the U.S. Department of Housing and Urban Development. It represents the 40th-percentile rent (gross rent including utilities) for standard-quality units in a given metro area, by bedroom count. It's the benchmark used for Section 8 housing vouchers, but it's also a useful, neutral 'is rent reasonable here?' yardstick when comparing cities or judging whether you're overpaying.",
    benefits: [
      "Government-published, unbiased rent data updated annually",
      "Lets you compare metros apples-to-apples",
      "Quick sanity check on what you should expect to pay",
    ],
    example:
      "FMR for a 2-bedroom in Austin TX (FY2025) is ~$1,750. If you're being quoted $2,800 for an average 2BR, you're paying 60% above FMR — either the unit is premium or the neighborhood is hot, but it's a signal to comparison-shop.",
    relatedTerms: [],
  },
  {
    slug: "rsu",
    term: "RSU (Restricted Stock Unit)",
    shortDef: "Company shares granted by your employer that vest over time and are taxed as ordinary income at vest.",
    explanation:
      "RSUs are a form of equity compensation common at tech companies. You're granted a number of shares that 'vest' on a schedule (e.g. 25% per year over 4 years). When they vest, the full market value is taxed as ordinary income (added to your W-2). Your employer typically withholds shares to cover taxes, but the default 22% federal withholding is often too low for high earners — leading to surprise tax bills. Once vested, RSUs are just regular stock; selling immediately = no additional tax, holding = capital gains/losses on future moves.",
    benefits: [
      "Direct upside in your company's stock price",
      "Vested RSUs can be sold immediately to diversify",
      "Often a major chunk of total comp at tech companies",
    ],
    example:
      "Priya gets 400 RSUs vesting over 4 years at Meta. Year 1, 100 shares vest at $500 = $50K added to her W-2 income. Meta withholds 22% = $11K, but she's in the 32% bracket — she owes another $5K at tax time. Most advisors suggest selling vested RSUs immediately and reinvesting in diversified index funds to avoid concentration risk.",
    relatedTerms: ["iso", "nso", "capital-gains"],
  },
  {
    slug: "iso",
    term: "ISO (Incentive Stock Option)",
    shortDef: "A tax-favored type of employee stock option — but watch out for AMT on exercise.",
    explanation:
      "Incentive Stock Options give you the right to buy company shares at a fixed 'strike' price. If you exercise and hold for at least 1 year after exercise + 2 years after grant, the gain is taxed as long-term capital gains (much lower than ordinary income). The catch: at exercise, the spread between strike price and current value counts as income for Alternative Minimum Tax (AMT) purposes — which can trigger a large surprise tax bill even if you haven't sold any shares.",
    benefits: [
      "Long-term capital gains treatment if you hold long enough",
      "No regular income tax at exercise (only AMT consideration)",
      "Big upside in startups that IPO or get acquired",
    ],
    example:
      "Jay exercises 10,000 ISOs at $1 strike when the FMV is $11. The $100K spread isn't regular income — but it IS AMT income. He could owe ~$28K in AMT in April even though he hasn't sold a single share. Many people lose money this way when the stock later crashes. Best practice: model the AMT before exercising or use a same-day-sale to avoid it.",
    relatedTerms: ["nso", "rsu", "amt"],
  },
  {
    slug: "nso",
    term: "NSO (Non-Qualified Stock Option)",
    shortDef: "Standard employee stock options taxed as ordinary income on the spread at exercise.",
    explanation:
      "Non-qualified stock options (also called NQSOs or NSOs) are the most common form of stock option. When you exercise, the 'spread' (current value minus strike price) is taxed as ordinary income, just like a salary bonus, with payroll taxes withheld. Any gains AFTER exercise are taxed as capital gains when you eventually sell. Less tax-favored than ISOs but more straightforward — no AMT trap.",
    benefits: [
      "Predictable tax treatment (no AMT surprises)",
      "Easier to plan for — like a salary bonus",
      "Future appreciation taxed as capital gains",
    ],
    example:
      "Carlos exercises 5,000 NSOs at $2 strike, current FMV $12. The $50K spread is added to his W-2 and taxed at his marginal rate (~35% federal + state). His employer withholds taxes automatically. If he sells immediately, no further tax. If he holds and the stock doubles, that future $50K gain is capital gains.",
    relatedTerms: ["iso", "rsu", "amt"],
  },
  {
    slug: "amt",
    term: "AMT (Alternative Minimum Tax)",
    shortDef: "A parallel tax system that can trigger an extra bill, most often from exercising ISOs.",
    explanation:
      "The Alternative Minimum Tax is a separate tax calculation that runs alongside your regular tax return. You pay whichever is higher. Most people never hit it, but exercising Incentive Stock Options (ISOs) is the #1 trigger — the spread on exercise counts as AMT income even though it's not regular income. High earners with lots of state/local tax deductions and large ISO exercises are most at risk. Any AMT you pay can later be recovered as a credit against future regular tax.",
    benefits: [
      "AMT paid creates a credit you can use in future years",
      "Knowing your AMT exposure helps time ISO exercises",
    ],
    example:
      "Jen exercises ISOs with a $200K spread. Her regular federal tax is $80K but her AMT comes out to $115K — she owes the extra $35K. The next year, when she sells the shares (regular tax kicks in instead of AMT), she can claim the $35K as a credit.",
    relatedTerms: ["iso"],
  },
  {
    slug: "cobra",
    term: "COBRA",
    shortDef: "A federal law letting you keep your employer's health insurance for up to 18 months after leaving a job — at full cost.",
    explanation:
      "COBRA (Consolidated Omnibus Budget Reconciliation Act) lets you continue your employer-sponsored health plan after you leave the job, get laid off, or have a qualifying event. The catch: you pay 100% of the premium (employer + employee portion) plus a 2% admin fee — usually 3-5x what you paid as an employee. It's expensive but valuable as a bridge: keeps your existing doctors, deductible accumulators, and HSA contributions during a job transition.",
    benefits: [
      "Keeps your same plan, doctors, and deductibles",
      "Up to 18 months of coverage (36 in some cases)",
      "Lets you stay on your HSA-eligible plan to keep contributing",
    ],
    example:
      "Tom leaves his job where his health premium was $200/mo (employer paid $1,000 more). His COBRA cost: $1,224/mo ($1,200 + 2% fee). For 3 months while job-hunting, he pays ~$3,700 — vs. switching to a marketplace plan that might be $450/mo but with a new deductible.",
    relatedTerms: ["hdhp", "hsa"],
  },
  {
    slug: "fsa",
    term: "FSA (Flexible Spending Account)",
    shortDef: "A pre-tax account for medical expenses — but use it or lose it each year.",
    explanation:
      "A Flexible Spending Account lets you set aside up to $3,300/year (2025 limit) in pre-tax money for medical expenses. Unlike an HSA, FSA money generally must be used by year-end (or a short grace period) — anything left expires. FSAs are paired with traditional health plans (not HDHPs). A separate Dependent Care FSA lets you set aside $5,000/year for childcare costs.",
    benefits: [
      "Pre-tax savings of 22-37% on medical expenses",
      "Available even if you don't have an HDHP",
      "Full annual amount available on Jan 1 (you don't have to fund it first)",
    ],
    example:
      "Maya elects $2,000 to her FSA. She's in the 24% federal + 5% state bracket. She saves $580 in taxes. She uses it for glasses ($400), a dental crown ($1,200), and copays ($400) — fully spent before year-end.",
    relatedTerms: ["hsa", "dependent-care-fsa"],
  },
  {
    slug: "rmd",
    term: "RMD (Required Minimum Distribution)",
    shortDef: "The IRS-mandated minimum you must withdraw from pre-tax retirement accounts starting at age 73.",
    explanation:
      "Required Minimum Distributions are the amount the IRS forces you to withdraw each year from traditional 401(k)s and IRAs starting at age 73 (75 if born after 1960). The amount is based on your account balance and an IRS life-expectancy table. Roth IRAs have no RMDs during the owner's lifetime — one of their biggest advantages. Skipping an RMD triggers a 25% penalty on the missed amount.",
    benefits: [
      "Forces tax-deferred money to start coming out (good for the IRS)",
      "Knowing the RMD schedule lets you plan Roth conversions in the gap years (60-72) to lower future RMDs",
    ],
    example:
      "Linda turns 73 with $1.5M in her traditional IRA. The IRS divisor for age 73 is 26.5, so her first RMD is ~$56,600. She must withdraw and pay ordinary income tax on it — even if she doesn't need the money. If she'd done Roth conversions in her 60s, the RMD (and tax) would be smaller.",
    relatedTerms: ["roth-ira", "401k", "roth-conversion"],
  },
  {
    slug: "fdic",
    term: "FDIC Insurance",
    shortDef: "Federal insurance that protects bank deposits up to $250,000 per depositor, per bank.",
    explanation:
      "The Federal Deposit Insurance Corporation guarantees deposits at member banks up to $250,000 per depositor, per ownership category, per bank. If the bank fails, the FDIC reimburses you within days. Coverage applies to checking, savings, money market deposit accounts, and CDs — but NOT to investments, mutual funds, or stocks held at the bank's brokerage arm. SIPC is the equivalent for brokerage accounts.",
    benefits: [
      "Zero-risk protection on cash up to $250K per bank",
      "Spread cash across multiple banks to expand coverage",
      "Joint accounts get $500K coverage",
    ],
    example:
      "Eric has $400K in cash. Putting it all in one bank means $150K is unprotected if the bank fails. He splits it: $250K at Marcus (FDIC), $150K at Wealthfront Cash (which sweeps to multiple FDIC-insured banks for higher total coverage). All $400K protected.",
    relatedTerms: ["high-yield-savings"],
  },
  {
    slug: "sipc",
    term: "SIPC Insurance",
    shortDef: "Insurance that protects up to $500K of your brokerage account if the brokerage fails.",
    explanation:
      "The Securities Investor Protection Corporation covers up to $500,000 per customer (including $250K cash) if your brokerage firm goes bankrupt. SIPC does NOT cover investment losses from market drops — only against the brokerage itself failing and your assets going missing. Most large brokers (Fidelity, Schwab, Vanguard) carry additional 'excess SIPC' coverage in the tens of millions per account.",
    benefits: [
      "Protection if the brokerage fails (not market losses)",
      "Most brokers add private excess insurance on top",
    ],
    example:
      "If Schwab went under, SIPC would cover Maria's first $500K of investments. Schwab's additional Lloyd's of London policy covers tens of millions more. In practice, SIPC has rarely had to pay out — major brokers are extremely safe.",
    relatedTerms: ["fdic"],
  },
  {
    slug: "ltc",
    term: "Long-Term Care Insurance",
    shortDef: "Insurance that pays for nursing-home, assisted-living, or in-home care later in life.",
    explanation:
      "Long-term care insurance covers extended care services that regular health insurance and Medicare DON'T cover — primarily nursing homes, assisted living, and home health aides. The average nursing home runs $100K+/year. Premiums depend heavily on age at purchase: buying at 55 is dramatically cheaper than buying at 65. About 70% of people 65+ will need some long-term care. Modern hybrid policies bundle LTC with life insurance so premiums aren't 'wasted' if you never need care.",
    benefits: [
      "Protects retirement savings from being drained by years of care",
      "Far cheaper to buy in your 50s than 60s",
      "Hybrid policies pay out as life insurance if not used",
    ],
    example:
      "Robert buys LTC at age 55 for $2,800/yr — locks in $200/day of coverage. At 78 he develops Alzheimer's and needs 3 years of memory care at $9K/mo ($324K total). LTC pays $219K. Without it, his $500K nest egg would be wiped out.",
    relatedTerms: [],
  },
];

/**
 * Map of terms/phrases to their glossary slugs.
 * Longer phrases are matched first to avoid partial matches.
 */
export function getTermMatcher(): { phrase: string; slug: string }[] {
  const matchers: { phrase: string; slug: string }[] = [
    // Multi-word phrases first (longer = higher priority)
    { phrase: "mega backdoor Roth", slug: "mega-backdoor-roth" },
    { phrase: "Mega Backdoor Roth", slug: "mega-backdoor-roth" },
    { phrase: "backdoor Roth IRA", slug: "backdoor-roth" },
    { phrase: "Backdoor Roth IRA", slug: "backdoor-roth" },
    { phrase: "backdoor Roth", slug: "backdoor-roth" },
    { phrase: "Backdoor Roth", slug: "backdoor-roth" },
    { phrase: "Roth conversion", slug: "roth-conversion" },
    { phrase: "Roth Conversion", slug: "roth-conversion" },
    { phrase: "Roth IRA", slug: "roth-ira" },
    { phrase: "traditional IRA", slug: "traditional-ira" },
    { phrase: "Traditional IRA", slug: "traditional-ira" },
    { phrase: "401(k)", slug: "401k" },
    { phrase: "tax-loss harvesting", slug: "tax-loss-harvesting" },
    { phrase: "Tax-Loss Harvesting", slug: "tax-loss-harvesting" },
    { phrase: "capital gains", slug: "capital-gains" },
    { phrase: "Capital Gains", slug: "capital-gains" },
    { phrase: "dollar-cost average", slug: "dollar-cost-averaging" },
    { phrase: "dollar-cost averaging", slug: "dollar-cost-averaging" },
    { phrase: "Dollar-Cost Averaging", slug: "dollar-cost-averaging" },
    { phrase: "emergency fund", slug: "emergency-fund" },
    { phrase: "Emergency Fund", slug: "emergency-fund" },
    { phrase: "high-yield savings", slug: "high-yield-savings" },
    { phrase: "High-Yield Savings", slug: "high-yield-savings" },
    { phrase: "asset allocation", slug: "asset-allocation" },
    { phrase: "Asset Allocation", slug: "asset-allocation" },
    { phrase: "compound interest", slug: "compound-interest" },
    { phrase: "Compound Interest", slug: "compound-interest" },
    { phrase: "529 plan", slug: "529-plan" },
    { phrase: "529 Plan", slug: "529-plan" },
    { phrase: "balance transfer", slug: "balance-transfer" },
    { phrase: "Balance Transfer", slug: "balance-transfer" },
    { phrase: "S-Corp", slug: "s-corp" },
    { phrase: "S-Corp election", slug: "s-corp" },
    { phrase: "QBI deduction", slug: "qbi" },
    { phrase: "QBI Deduction", slug: "qbi" },
    { phrase: "Section 199A", slug: "qbi" },
    { phrase: "index fund", slug: "index-fund" },
    { phrase: "Index Fund", slug: "index-fund" },
    { phrase: "index funds", slug: "index-fund" },
    { phrase: "S&P 500", slug: "sp500" },
    { phrase: "diversification", slug: "diversification" },
    { phrase: "diversified", slug: "diversification" },
    { phrase: "HSA", slug: "hsa" },
    { phrase: "Health Savings Account", slug: "hsa" },
    { phrase: "HDHP", slug: "hdhp" },
    { phrase: "High Deductible Health Plan", slug: "hdhp" },
    { phrase: "PSLF", slug: "pslf" },
    { phrase: "Public Service Loan Forgiveness", slug: "pslf" },
    { phrase: "income-driven repayment", slug: "idr" },
    { phrase: "Income-Driven Repayment", slug: "idr" },
    { phrase: "SAVE plan", slug: "idr" },
    { phrase: "IDR", slug: "idr" },
    { phrase: "VOO", slug: "voo" },
    { phrase: "APR", slug: "apr" },
    { phrase: "0% APR", slug: "apr" },
    { phrase: "Child Tax Credit", slug: "child-tax-credit" },
    { phrase: "child tax credit", slug: "child-tax-credit" },
    { phrase: "Dependent Care FSA", slug: "dependent-care-fsa" },
    { phrase: "dependent care FSA", slug: "dependent-care-fsa" },
    { phrase: "Earned Income Tax Credit", slug: "eitc" },
    { phrase: "EITC", slug: "eitc" },
    // Acronyms & investing vehicles
    { phrase: "FICA", slug: "fica" },
    { phrase: "Social Security + Medicare", slug: "fica" },
    { phrase: "PITI", slug: "piti" },
    { phrase: "DTI", slug: "dti" },
    { phrase: "debt-to-income", slug: "dti" },
    { phrase: "Debt-to-Income", slug: "dti" },
    { phrase: "AGI", slug: "agi" },
    { phrase: "MAGI", slug: "agi" },
    { phrase: "Adjusted Gross Income", slug: "agi" },
    { phrase: "MFJ", slug: "filing-status" },
    { phrase: "HOH", slug: "filing-status" },
    { phrase: "Head of Household", slug: "filing-status" },
    { phrase: "Married Filing Jointly", slug: "filing-status" },
    { phrase: "filing status", slug: "filing-status" },
    { phrase: "Filing Status", slug: "filing-status" },
    { phrase: "mortgage", slug: "mortgage" },
    { phrase: "Mortgage", slug: "mortgage" },
    { phrase: "30-yr fixed", slug: "mortgage" },
    { phrase: "30-year fixed", slug: "mortgage" },
    { phrase: "ETF", slug: "etf" },
    { phrase: "ETFs", slug: "etf" },
    { phrase: "VTI", slug: "vti" },
    { phrase: "VXUS", slug: "vxus" },
    { phrase: "VMFXX", slug: "vmfxx" },
    { phrase: "VTEB", slug: "vteb" },
    { phrase: "BSV", slug: "bsv" },
    { phrase: "T-Bills", slug: "t-bills" },
    { phrase: "T-Bill", slug: "t-bills" },
    { phrase: "Treasury Bills", slug: "t-bills" },
    { phrase: "TreasuryDirect", slug: "t-bills" },
    { phrase: "APY", slug: "apy" },
    { phrase: "HYSA", slug: "high-yield-savings" },
    { phrase: "IRA", slug: "traditional-ira" },
    // Funds & insurance terms
    { phrase: "VFIAX", slug: "vfiax" },
    { phrase: "expense ratio", slug: "expense-ratio" },
    { phrase: "Expense Ratio", slug: "expense-ratio" },
    { phrase: "expense ratios", slug: "expense-ratio" },
    { phrase: "250/500/100", slug: "auto-liability-limits" },
    { phrase: "auto liability", slug: "auto-liability-limits" },
    { phrase: "Auto Liability", slug: "auto-liability-limits" },
    { phrase: "umbrella insurance", slug: "umbrella-insurance" },
    { phrase: "Umbrella Insurance", slug: "umbrella-insurance" },
    { phrase: "umbrella policy", slug: "umbrella-insurance" },
    { phrase: "Umbrella Policy", slug: "umbrella-insurance" },
    { phrase: "umbrella coverage", slug: "umbrella-insurance" },
    { phrase: "Fair Market Rent", slug: "fmr" },
    { phrase: "FMR", slug: "fmr" },
    { phrase: "RSU", slug: "rsu" },
    { phrase: "RSUs", slug: "rsu" },
    { phrase: "Restricted Stock Unit", slug: "rsu" },
    { phrase: "Restricted Stock Units", slug: "rsu" },
    { phrase: "ISO", slug: "iso" },
    { phrase: "ISOs", slug: "iso" },
    { phrase: "Incentive Stock Option", slug: "iso" },
    { phrase: "Incentive Stock Options", slug: "iso" },
    { phrase: "NSO", slug: "nso" },
    { phrase: "NSOs", slug: "nso" },
    { phrase: "NQSO", slug: "nso" },
    { phrase: "Non-Qualified Stock Option", slug: "nso" },
    { phrase: "AMT", slug: "amt" },
    { phrase: "Alternative Minimum Tax", slug: "amt" },
    { phrase: "COBRA", slug: "cobra" },
    { phrase: "FSA", slug: "fsa" },
    { phrase: "Flexible Spending Account", slug: "fsa" },
    { phrase: "RMD", slug: "rmd" },
    { phrase: "RMDs", slug: "rmd" },
    { phrase: "Required Minimum Distribution", slug: "rmd" },
    { phrase: "Required Minimum Distributions", slug: "rmd" },
    { phrase: "FDIC", slug: "fdic" },
    { phrase: "FDIC insured", slug: "fdic" },
    { phrase: "FDIC Insurance", slug: "fdic" },
    { phrase: "SIPC", slug: "sipc" },
    { phrase: "long-term care", slug: "ltc" },
    { phrase: "Long-Term Care", slug: "ltc" },
    { phrase: "LTC insurance", slug: "ltc" },
    { phrase: "LTC", slug: "ltc" },
  ];

  // Sort by phrase length descending so longer matches take priority
  return matchers.sort((a, b) => b.phrase.length - a.phrase.length);
}
