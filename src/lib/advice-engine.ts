import { UserProfile, AdviceCard, FinancialGoal } from "./types";
import { generateAgeAdvice } from "./advice/age-advice";
import { generateCareerAdvice } from "./advice/career-advice";
import { generateGoalAdvice } from "./advice/goal-advice";
import { generateCrossCuttingAdvice } from "./advice/cross-cutting";
import { generateAccountAdvice } from "./advice/account-advice";
import { generateOptimizeAdvice } from "./advice/optimize-advice";

// Map card categories/ids to the goal they relate to
function cardToGoal(card: AdviceCard): FinancialGoal | null {
  const idMap: Record<string, FinancialGoal> = {
    "goal-emergency": "emergency-fund",
    "goal-debt": "debt-payoff",
    "goal-home": "home-buying",
    "goal-invest": "investing",
    "goal-tax": "tax-optimization",
    "goal-wealth": "wealth-building",
    "goal-education-fund": "education-fund",
    "goal-retirement-roadmap": "retirement",
  };
  if (idMap[card.id]) return idMap[card.id];

  // Fallback: match by category
  const catMap: Record<string, FinancialGoal> = {
    debt: "debt-payoff",
    retirement: "retirement",
    education: "education-fund",
  };
  return catMap[card.category] || null;
}

function assignTimelineYears(cards: AdviceCard[], goalOrder: FinancialGoal[]): AdviceCard[] {
  // High priority cards always Year 1
  // For others, use goal ranking: top 2 goals → Year 1, next 2 → Year 2, rest → Year 3
  // Cards not tied to a goal: use priority (high→1, medium→2, low→3)

  const goalYearMap = new Map<FinancialGoal, number>();
  goalOrder.forEach((g, i) => {
    if (i < 2) goalYearMap.set(g, 1);
    else if (i < 4) goalYearMap.set(g, 2);
    else goalYearMap.set(g, 3);
  });

  return cards.map((card) => {
    if (card.timelineYear) return card; // already set

    if (card.priority === "high") {
      return { ...card, timelineYear: 1 };
    }

    const goal = cardToGoal(card);
    if (goal && goalYearMap.has(goal)) {
      return { ...card, timelineYear: goalYearMap.get(goal)! };
    }

    // Fallback by priority
    const yearByPriority = card.priority === "medium" ? 2 : 3;
    return { ...card, timelineYear: yearByPriority };
  });
}

// Topical fingerprints — when two advice cards share a fingerprint, they're
// considered duplicates of the same idea and get merged (categories unioned)
// rather than shown as two near-identical paragraphs.
const TOPIC_FINGERPRINTS: { key: string; patterns: RegExp[] }[] = [
  { key: "mega-backdoor-roth", patterns: [/mega[- ]?backdoor/i] },
  { key: "backdoor-roth", patterns: [/backdoor roth(?! ?401)/i] },
  { key: "401k-match", patterns: [/401\(?k\)?[^.]{0,40}(match|free money)/i, /employer match/i] },
  { key: "401k-max", patterns: [/max(?:imize|imum|ing)?\s+(your\s+)?401\(?k\)?/i, /max 401\(?k\)?/i] },
  { key: "roth-ira-direct", patterns: [/(open|fund|max)[^.]{0,30}roth ira(?! ?401)/i] },
  { key: "hsa-triple", patterns: [/\bHSA\b/i, /health savings account/i] },
  { key: "tax-loss-harvest", patterns: [/tax[- ]loss harvest/i] },
  { key: "529-plan", patterns: [/\b529\b/i] },
  { key: "i-bonds", patterns: [/\bI[- ]?bonds?\b/i, /series i\b/i] },
  { key: "umbrella-insurance", patterns: [/umbrella (insurance|policy|coverage)/i] },
  { key: "estate-plan", patterns: [/estate plan|living trust|revocable trust/i] },
  { key: "donor-advised-fund", patterns: [/donor[- ]advised fund|\bDAF\b/i] },
  { key: "roth-conversion", patterns: [/roth conversion(?! ladder)/i] },
  { key: "roth-conversion-ladder", patterns: [/roth conversion ladder/i] },
  { key: "emergency-fund", patterns: [/emergency fund/i, /\bHYSA\b.*month/i] },
  { key: "high-yield-savings", patterns: [/high[- ]yield savings|\bHYSA\b/i] },
  { key: "asset-location", patterns: [/asset location/i] },
  { key: "asset-allocation", patterns: [/asset allocation|three[- ]fund portfolio/i] },
  { key: "backdoor-mega-via-after-tax", patterns: [/after[- ]tax 401\(?k\)?/i] },
  { key: "s-corp-election", patterns: [/s[- ]?corp(\s+election)?/i] },
  { key: "qbi-199a", patterns: [/QBI|199A/] },
  { key: "solo-401k", patterns: [/solo 401\(?k\)?|individual 401\(?k\)?/i] },
  { key: "sep-ira", patterns: [/SEP[- ]?IRA/i] },
  { key: "private-wealth-mgmt", patterns: [/private wealth|private bank/i] },
  { key: "muni-bonds", patterns: [/\bmunicipal bonds?\b|\bmuni\b|\bVTEB\b/i] },
  { key: "term-life", patterns: [/term life|life insurance/i] },
  { key: "disability-insurance", patterns: [/disability insurance|own[- ]occupation/i] },
  { key: "hsa-investing", patterns: [/invest.*HSA|HSA.*invest/i] },
];

function fingerprintCard(card: AdviceCard): string | null {
  const text = `${card.title} ${card.description}`;
  for (const { key, patterns } of TOPIC_FINGERPRINTS) {
    if (patterns.some((p) => p.test(text))) return key;
  }
  return null;
}

const PRIORITY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

function mergeDuplicateTopics(cards: AdviceCard[]): AdviceCard[] {
  const byTopic = new Map<string, AdviceCard>();
  const result: AdviceCard[] = [];

  for (const card of cards) {
    const fp = fingerprintCard(card);
    if (!fp) {
      result.push(card);
      continue;
    }
    const existing = byTopic.get(fp);
    if (!existing) {
      byTopic.set(fp, card);
      result.push(card);
      continue;
    }
    // Merge: keep the higher-priority one's content; union categories.
    const keep = PRIORITY_RANK[card.priority] > PRIORITY_RANK[existing.priority] ? card : existing;
    const drop = keep === card ? existing : card;
    const cats = new Set<string>([keep.category, drop.category, ...(keep.categories || []), ...(drop.categories || [])]);
    keep.categories = Array.from(cats).filter((c) => c !== keep.category) as AdviceCard["categories"];
    // Replace existing in result if we swapped
    if (keep === card) {
      const idx = result.indexOf(existing);
      if (idx >= 0) result[idx] = keep;
      byTopic.set(fp, keep);
    }
    // If we kept existing, just don't push the new card (and existing already has updated categories ref).
  }
  return result;
}

export function generateAdvice(profile: UserProfile): AdviceCard[] {
  const accountAdvice = generateAccountAdvice(profile);
  const crossCutting = generateCrossCuttingAdvice(profile);
  const ageAdvice = generateAgeAdvice(profile);
  const careerAdvice = generateCareerAdvice(profile);
  const goalAdvice = generateGoalAdvice(profile);
  const optimizeAdvice = generateOptimizeAdvice(profile);

  const all = [...accountAdvice, ...crossCutting, ...ageAdvice, ...careerAdvice, ...goalAdvice, ...optimizeAdvice];
  const seen = new Set<string>();
  const dedupedById: AdviceCard[] = [];
  for (const card of all) {
    if (!seen.has(card.id)) {
      seen.add(card.id);
      // Clone so merges don't mutate source modules
      dedupedById.push({ ...card, categories: card.categories ? [...card.categories] : undefined });
    }
  }

  const merged = mergeDuplicateTopics(dedupedById);
  return assignTimelineYears(merged, profile.goals);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high": return "border-l-primary";
    case "medium": return "border-l-info";
    case "low": return "border-l-muted-foreground";
    default: return "border-l-border";
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    savings: "Savings",
    investing: "Investing",
    debt: "Debt Management",
    retirement: "Retirement",
    tax: "Tax Strategy",
    insurance: "Insurance",
    education: "Education",
  };
  return labels[category] || category;
}
