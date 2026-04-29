## Feature: W-2 Upload & Rent vs Buy Calculator

### Phase 1: Enable Lovable Cloud
- Need backend for AI-powered W-2 parsing (Lovable AI) and file storage

### Phase 2: W-2 Upload & AI Extraction
- Add file upload step to onboarding (after current steps)
- Create edge function that sends W-2 image/PDF to Lovable AI for structured extraction (income, federal tax withheld, state, filing status)
- Auto-populate profile fields from extracted data
- User confirms/edits extracted values before proceeding

### Phase 3: Curated Real Estate Data
- Build a static dataset of ~50 major US metros with:
  - Median home price
  - Property tax rate
  - State income tax rate
  - Average rent for comparable home
- When user selects "home-buying" goal, ask which metro area they're targeting (searchable dropdown)

### Phase 4: Rent vs Buy Calculator (Full NYT-style + Visual Comparison)
- **Inputs** (pre-filled from profile + metro data):
  - Home price, down payment %, mortgage rate, loan term
  - Property tax rate, HOA, maintenance (1% default), homeowner's insurance
  - Rent amount, annual rent increase
  - Investment return rate (for opportunity cost), marginal tax rate
  - How long they plan to stay
- **Outputs**:
  - Monthly cost comparison (mortgage+taxes+insurance vs rent)
  - Breakeven year
  - 5/10/20/30 year wealth accumulation chart (recharts) comparing:
    - Renter scenario: rent + invest the difference
    - Buyer scenario: equity buildup + appreciation - costs
  - Net financial advantage with specific dollar amounts
  - Personalized recommendation based on their income/situation

### Phase 5: Integration
- Add "Rent vs Buy" as a dedicated section in AdviceDashboard when home-buying goal is selected
- Link calculator results back to advice cards (e.g., "Based on your numbers, renting and investing saves you $X over 10 years")

### Tech Stack
- Lovable Cloud: file storage (W-2 uploads), edge function (AI parsing)
- Lovable AI (Gemini): W-2 document extraction
- Recharts: wealth projection charts
- Static JSON: metro area real estate data
