export interface MetroArea {
  id: string;
  name: string;
  state: string;
  medianHomePrice: number;
  propertyTaxRate: number; // annual % of home value
  stateIncomeTaxRate: number; // top marginal rate
  averageRent: number; // monthly for comparable home
  homeInsuranceAnnual: number;
  appreciationRate: number; // annual % historical
}

export const METRO_AREAS: MetroArea[] = [
  { id: "nyc", name: "New York City", state: "NY", medianHomePrice: 750000, propertyTaxRate: 1.23, stateIncomeTaxRate: 8.82, averageRent: 3200, homeInsuranceAnnual: 1800, appreciationRate: 3.5 },
  { id: "la", name: "Los Angeles", state: "CA", medianHomePrice: 950000, propertyTaxRate: 0.76, stateIncomeTaxRate: 13.3, averageRent: 2800, homeInsuranceAnnual: 1600, appreciationRate: 4.0 },
  { id: "chicago", name: "Chicago", state: "IL", medianHomePrice: 320000, propertyTaxRate: 2.07, stateIncomeTaxRate: 4.95, averageRent: 1900, homeInsuranceAnnual: 1400, appreciationRate: 2.5 },
  { id: "houston", name: "Houston", state: "TX", medianHomePrice: 330000, propertyTaxRate: 1.81, stateIncomeTaxRate: 0, averageRent: 1600, homeInsuranceAnnual: 2400, appreciationRate: 3.0 },
  { id: "phoenix", name: "Phoenix", state: "AZ", medianHomePrice: 420000, propertyTaxRate: 0.62, stateIncomeTaxRate: 2.5, averageRent: 1700, homeInsuranceAnnual: 1200, appreciationRate: 4.5 },
  { id: "philly", name: "Philadelphia", state: "PA", medianHomePrice: 310000, propertyTaxRate: 1.36, stateIncomeTaxRate: 3.07, averageRent: 1600, homeInsuranceAnnual: 1300, appreciationRate: 2.8 },
  { id: "san-antonio", name: "San Antonio", state: "TX", medianHomePrice: 280000, propertyTaxRate: 1.81, stateIncomeTaxRate: 0, averageRent: 1350, homeInsuranceAnnual: 2200, appreciationRate: 3.2 },
  { id: "san-diego", name: "San Diego", state: "CA", medianHomePrice: 900000, propertyTaxRate: 0.76, stateIncomeTaxRate: 13.3, averageRent: 2600, homeInsuranceAnnual: 1500, appreciationRate: 4.2 },
  { id: "dallas", name: "Dallas", state: "TX", medianHomePrice: 380000, propertyTaxRate: 1.81, stateIncomeTaxRate: 0, averageRent: 1700, homeInsuranceAnnual: 2300, appreciationRate: 3.5 },
  { id: "austin", name: "Austin", state: "TX", medianHomePrice: 500000, propertyTaxRate: 1.81, stateIncomeTaxRate: 0, averageRent: 1800, homeInsuranceAnnual: 2100, appreciationRate: 4.0 },
  { id: "sf", name: "San Francisco", state: "CA", medianHomePrice: 1350000, propertyTaxRate: 0.76, stateIncomeTaxRate: 13.3, averageRent: 3500, homeInsuranceAnnual: 1800, appreciationRate: 3.8 },
  { id: "seattle", name: "Seattle", state: "WA", medianHomePrice: 800000, propertyTaxRate: 0.93, stateIncomeTaxRate: 0, averageRent: 2400, homeInsuranceAnnual: 1400, appreciationRate: 4.0 },
  { id: "denver", name: "Denver", state: "CO", medianHomePrice: 580000, propertyTaxRate: 0.55, stateIncomeTaxRate: 4.4, averageRent: 2000, homeInsuranceAnnual: 1500, appreciationRate: 3.8 },
  { id: "dc", name: "Washington, D.C.", state: "DC", medianHomePrice: 650000, propertyTaxRate: 0.56, stateIncomeTaxRate: 10.75, averageRent: 2400, homeInsuranceAnnual: 1400, appreciationRate: 3.2 },
  { id: "boston", name: "Boston", state: "MA", medianHomePrice: 780000, propertyTaxRate: 1.17, stateIncomeTaxRate: 5.0, averageRent: 2800, homeInsuranceAnnual: 1600, appreciationRate: 3.5 },
  { id: "nashville", name: "Nashville", state: "TN", medianHomePrice: 440000, propertyTaxRate: 0.71, stateIncomeTaxRate: 0, averageRent: 1700, homeInsuranceAnnual: 1500, appreciationRate: 4.2 },
  { id: "atlanta", name: "Atlanta", state: "GA", medianHomePrice: 400000, propertyTaxRate: 0.92, stateIncomeTaxRate: 5.49, averageRent: 1700, homeInsuranceAnnual: 1600, appreciationRate: 3.5 },
  { id: "miami", name: "Miami", state: "FL", medianHomePrice: 580000, propertyTaxRate: 0.89, stateIncomeTaxRate: 0, averageRent: 2500, homeInsuranceAnnual: 3500, appreciationRate: 5.0 },
  { id: "tampa", name: "Tampa", state: "FL", medianHomePrice: 380000, propertyTaxRate: 0.89, stateIncomeTaxRate: 0, averageRent: 1800, homeInsuranceAnnual: 3000, appreciationRate: 4.5 },
  { id: "orlando", name: "Orlando", state: "FL", medianHomePrice: 370000, propertyTaxRate: 0.89, stateIncomeTaxRate: 0, averageRent: 1700, homeInsuranceAnnual: 2800, appreciationRate: 4.2 },
  { id: "portland", name: "Portland", state: "OR", medianHomePrice: 520000, propertyTaxRate: 0.97, stateIncomeTaxRate: 9.9, averageRent: 1800, homeInsuranceAnnual: 1200, appreciationRate: 3.5 },
  { id: "minneapolis", name: "Minneapolis", state: "MN", medianHomePrice: 360000, propertyTaxRate: 1.12, stateIncomeTaxRate: 9.85, averageRent: 1500, homeInsuranceAnnual: 1500, appreciationRate: 3.0 },
  { id: "charlotte", name: "Charlotte", state: "NC", medianHomePrice: 380000, propertyTaxRate: 0.77, stateIncomeTaxRate: 4.5, averageRent: 1600, homeInsuranceAnnual: 1400, appreciationRate: 3.8 },
  { id: "raleigh", name: "Raleigh", state: "NC", medianHomePrice: 420000, propertyTaxRate: 0.77, stateIncomeTaxRate: 4.5, averageRent: 1600, homeInsuranceAnnual: 1300, appreciationRate: 4.0 },
  { id: "salt-lake", name: "Salt Lake City", state: "UT", medianHomePrice: 520000, propertyTaxRate: 0.58, stateIncomeTaxRate: 4.65, averageRent: 1600, homeInsuranceAnnual: 1100, appreciationRate: 4.0 },
  { id: "pittsburgh", name: "Pittsburgh", state: "PA", medianHomePrice: 230000, propertyTaxRate: 1.36, stateIncomeTaxRate: 3.07, averageRent: 1200, homeInsuranceAnnual: 1100, appreciationRate: 2.5 },
  { id: "columbus", name: "Columbus", state: "OH", medianHomePrice: 290000, propertyTaxRate: 1.56, stateIncomeTaxRate: 3.75, averageRent: 1300, homeInsuranceAnnual: 1100, appreciationRate: 3.0 },
  { id: "indianapolis", name: "Indianapolis", state: "IN", medianHomePrice: 270000, propertyTaxRate: 0.85, stateIncomeTaxRate: 3.05, averageRent: 1200, homeInsuranceAnnual: 1200, appreciationRate: 3.0 },
  { id: "detroit", name: "Detroit", state: "MI", medianHomePrice: 230000, propertyTaxRate: 1.54, stateIncomeTaxRate: 4.25, averageRent: 1100, homeInsuranceAnnual: 1400, appreciationRate: 2.5 },
  { id: "las-vegas", name: "Las Vegas", state: "NV", medianHomePrice: 420000, propertyTaxRate: 0.55, stateIncomeTaxRate: 0, averageRent: 1600, homeInsuranceAnnual: 1200, appreciationRate: 4.5 },
  { id: "san-jose", name: "San Jose", state: "CA", medianHomePrice: 1400000, propertyTaxRate: 0.76, stateIncomeTaxRate: 13.3, averageRent: 3200, homeInsuranceAnnual: 1700, appreciationRate: 4.0 },
  { id: "kansas-city", name: "Kansas City", state: "MO", medianHomePrice: 270000, propertyTaxRate: 1.0, stateIncomeTaxRate: 4.8, averageRent: 1200, homeInsuranceAnnual: 1400, appreciationRate: 3.0 },
  { id: "cincinnati", name: "Cincinnati", state: "OH", medianHomePrice: 260000, propertyTaxRate: 1.56, stateIncomeTaxRate: 3.75, averageRent: 1200, homeInsuranceAnnual: 1100, appreciationRate: 2.8 },
  { id: "milwaukee", name: "Milwaukee", state: "WI", medianHomePrice: 260000, propertyTaxRate: 1.76, stateIncomeTaxRate: 7.65, averageRent: 1100, homeInsuranceAnnual: 1100, appreciationRate: 2.5 },
  { id: "richmond", name: "Richmond", state: "VA", medianHomePrice: 340000, propertyTaxRate: 0.82, stateIncomeTaxRate: 5.75, averageRent: 1400, homeInsuranceAnnual: 1200, appreciationRate: 3.2 },
  { id: "new-orleans", name: "New Orleans", state: "LA", medianHomePrice: 270000, propertyTaxRate: 0.55, stateIncomeTaxRate: 4.25, averageRent: 1300, homeInsuranceAnnual: 3200, appreciationRate: 2.5 },
  { id: "sacramento", name: "Sacramento", state: "CA", medianHomePrice: 520000, propertyTaxRate: 0.76, stateIncomeTaxRate: 13.3, averageRent: 1800, homeInsuranceAnnual: 1300, appreciationRate: 3.8 },
  { id: "memphis", name: "Memphis", state: "TN", medianHomePrice: 210000, propertyTaxRate: 0.71, stateIncomeTaxRate: 0, averageRent: 1100, homeInsuranceAnnual: 1500, appreciationRate: 2.5 },
  { id: "louisville", name: "Louisville", state: "KY", medianHomePrice: 250000, propertyTaxRate: 0.83, stateIncomeTaxRate: 4.0, averageRent: 1100, homeInsuranceAnnual: 1300, appreciationRate: 2.8 },
  { id: "baltimore", name: "Baltimore", state: "MD", medianHomePrice: 350000, propertyTaxRate: 1.09, stateIncomeTaxRate: 5.75, averageRent: 1500, homeInsuranceAnnual: 1300, appreciationRate: 2.8 },
  { id: "oklahoma-city", name: "Oklahoma City", state: "OK", medianHomePrice: 220000, propertyTaxRate: 0.87, stateIncomeTaxRate: 4.75, averageRent: 1100, homeInsuranceAnnual: 2500, appreciationRate: 3.0 },
  { id: "jacksonville", name: "Jacksonville", state: "FL", medianHomePrice: 340000, propertyTaxRate: 0.89, stateIncomeTaxRate: 0, averageRent: 1500, homeInsuranceAnnual: 2500, appreciationRate: 3.5 },
  { id: "boise", name: "Boise", state: "ID", medianHomePrice: 450000, propertyTaxRate: 0.63, stateIncomeTaxRate: 5.8, averageRent: 1500, homeInsuranceAnnual: 1100, appreciationRate: 4.5 },
  { id: "tucson", name: "Tucson", state: "AZ", medianHomePrice: 310000, propertyTaxRate: 0.62, stateIncomeTaxRate: 2.5, averageRent: 1200, homeInsuranceAnnual: 1100, appreciationRate: 3.5 },
  { id: "honolulu", name: "Honolulu", state: "HI", medianHomePrice: 850000, propertyTaxRate: 0.28, stateIncomeTaxRate: 11.0, averageRent: 2400, homeInsuranceAnnual: 1200, appreciationRate: 3.0 },
  { id: "charleston", name: "Charleston", state: "SC", medianHomePrice: 420000, propertyTaxRate: 0.57, stateIncomeTaxRate: 6.5, averageRent: 1700, homeInsuranceAnnual: 1800, appreciationRate: 4.0 },
  { id: "des-moines", name: "Des Moines", state: "IA", medianHomePrice: 240000, propertyTaxRate: 1.52, stateIncomeTaxRate: 5.7, averageRent: 1100, homeInsuranceAnnual: 1200, appreciationRate: 2.8 },
  { id: "albuquerque", name: "Albuquerque", state: "NM", medianHomePrice: 310000, propertyTaxRate: 0.73, stateIncomeTaxRate: 5.9, averageRent: 1200, homeInsuranceAnnual: 1100, appreciationRate: 3.0 },
];

// ─── Childcare cost estimates (full-time infant/toddler daycare center, monthly USD) ───
// Sources: Care.com 2024 Cost of Care Report, ChildCare Aware of America 2023, BLS regional data.
// Infant care is the most expensive tier; toddler/preschool typically runs ~15-25% lower.
const METRO_INFANT_DAYCARE_MONTHLY: Record<string, number> = {
  "nyc": 2700, "sf": 2900, "san-jose": 2850, "boston": 2600, "dc": 2500,
  "seattle": 2400, "la": 2200, "san-diego": 2100, "chicago": 1900, "denver": 1800,
  "minneapolis": 1750, "portland": 1700, "honolulu": 1900, "philly": 1700,
  "baltimore": 1700, "miami": 1750, "sacramento": 1850, "austin": 1700,
  "dallas": 1500, "houston": 1450, "san-antonio": 1300, "phoenix": 1450,
  "atlanta": 1400, "charlotte": 1300, "raleigh": 1350, "nashville": 1400,
  "tampa": 1500, "orlando": 1450, "jacksonville": 1350, "richmond": 1400,
  "salt-lake": 1300, "boise": 1250, "las-vegas": 1300, "kansas-city": 1200,
  "indianapolis": 1150, "columbus": 1200, "cincinnati": 1150, "milwaukee": 1300,
  "detroit": 1300, "pittsburgh": 1300, "memphis": 1000, "louisville": 1100,
  "new-orleans": 1100, "oklahoma-city": 1000, "tucson": 1150, "albuquerque": 1100,
  "des-moines": 1150, "charleston": 1300,
};

// State-level fallback when metro isn't matched. Statewide center-based infant care average.
const STATE_INFANT_DAYCARE_MONTHLY: Record<string, number> = {
  CA: 1900, NY: 1900, MA: 2400, DC: 2400, NJ: 1700, CT: 1900, WA: 1900, MD: 1700,
  HI: 1700, IL: 1500, CO: 1600, MN: 1600, OR: 1500, VA: 1500, RI: 1700, NH: 1500,
  PA: 1400, FL: 1400, AZ: 1300, NV: 1300, GA: 1200, NC: 1200, SC: 1200, TN: 1100,
  TX: 1300, OH: 1100, MI: 1200, IN: 1050, WI: 1200, MO: 1100, KY: 1000, LA: 1000,
  AL: 950, MS: 850, AR: 900, OK: 950, NM: 1050, UT: 1150, ID: 1100, NE: 1050,
  KS: 1000, IA: 1100, MT: 1050, WY: 1000, ND: 1000, SD: 950, ME: 1300, VT: 1400,
  WV: 950, AK: 1400, DE: 1300,
};

export interface ChildcareEstimate {
  monthly: number;
  annual: number;
  source: "metro" | "state" | "national";
  locationLabel: string;
}

/**
 * Estimate monthly center-based infant/toddler daycare cost for a household.
 * Falls back from metro → state → national average if no match.
 */
export function estimateChildcareMonthly(
  metroId?: string,
  state?: string,
  numKids: number = 1
): ChildcareEstimate {
  const kids = Math.max(1, numKids);
  // Sibling discount: typical center gives ~10-15% off second child, ~20% off third+.
  const siblingMultiplier = kids === 1 ? 1 : kids === 2 ? 1.85 : 1.85 + (kids - 2) * 0.8;

  if (metroId && METRO_INFANT_DAYCARE_MONTHLY[metroId]) {
    const metro = METRO_AREAS.find((m) => m.id === metroId);
    const base = METRO_INFANT_DAYCARE_MONTHLY[metroId];
    return {
      monthly: Math.round(base * siblingMultiplier),
      annual: Math.round(base * siblingMultiplier * 12),
      source: "metro",
      locationLabel: metro ? `${metro.name}, ${metro.state}` : metroId,
    };
  }
  if (state && STATE_INFANT_DAYCARE_MONTHLY[state]) {
    const base = STATE_INFANT_DAYCARE_MONTHLY[state];
    return {
      monthly: Math.round(base * siblingMultiplier),
      annual: Math.round(base * siblingMultiplier * 12),
      source: "state",
      locationLabel: state,
    };
  }
  const national = 1300;
  return {
    monthly: Math.round(national * siblingMultiplier),
    annual: Math.round(national * siblingMultiplier * 12),
    source: "national",
    locationLabel: "U.S. average",
  };
}
