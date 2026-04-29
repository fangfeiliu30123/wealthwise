import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import { TrendingUp, Wallet, PiggyBank, CreditCard, BarChart3, Loader2, ChevronDown } from "lucide-react";

interface AccountSummary {
  totalCash: number;
  totalBalance: number;
  totalInvestments: number;
  totalDebt: number;
  holdingsCount: number;
  transactionCount: number;
  topSpendingCategories: { category: string; amount: number }[];
  holdings: {
    security_name: string;
    ticker: string;
    quantity: number;
    current_price: number;
    value: number;
    type: string;
  }[];
  accounts?: {
    name: string;
    type: string;
    subtype?: string;
    current_balance?: number;
    institutionName?: string;
  }[];
}

interface ConnectedAccountsSummaryProps {
  refreshKey?: number;
}

type ExpandedPanel = "balance" | "investments" | "debt" | null;

const ConnectedAccountsSummary = ({ refreshKey }: ConnectedAccountsSummaryProps) => {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedPanel>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("plaid-get-accounts", {
        body: { device_id: getDeviceId() },
      });
      if (error) throw error;
      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch accounts summary:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading financial data...
      </div>
    );
  }

  if (!summary || ((summary.totalCash || 0) === 0 && summary.totalDebt === 0 && summary.totalInvestments === 0)) {
    return null;
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const toggle = (panel: ExpandedPanel) =>
    setExpanded((prev) => (prev === panel ? null : panel));

  // Bucket every account into exactly one of: cash | investments | debt.
  // Mirrors the edge-function logic so totals reconcile.
  const cashAccounts = (summary.accounts || []).filter((a) => {
    const sub = (a.subtype || "").toLowerCase();
    if (a.type === "credit" || a.type === "loan") return false;
    if (a.type === "investment") return false;
    if (sub === "hsa") return false;
    return true;
  });
  const investmentAccounts = (summary.accounts || []).filter((a) => {
    const sub = (a.subtype || "").toLowerCase();
    return a.type === "investment" || sub === "hsa";
  });
  const debtAccounts = (summary.accounts || []).filter(
    (a) => a.type === "credit" || a.type === "loan"
  );

  const grandTotal =
    (summary.totalCash || 0) + (summary.totalInvestments || 0) + (summary.totalDebt || 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics — clickable to reveal details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<Wallet size={14} />}
          label="Total Cash & Cash Equivalents"
          value={fmt(summary.totalCash || 0)}
          valueClass="text-green-400"
          active={expanded === "balance"}
          onClick={() => toggle("balance")}
        />
        <MetricCard
          icon={<TrendingUp size={14} />}
          label="Investments (Long-Term)"
          value={fmt(summary.totalInvestments)}
          valueClass="text-primary"
          active={expanded === "investments"}
          onClick={() => toggle("investments")}
          disabled={summary.totalInvestments === 0 && summary.holdings.length === 0}
        />
        {summary.totalDebt > 0 && (
          <MetricCard
            icon={<CreditCard size={14} />}
            label="Total Debt"
            value={fmt(summary.totalDebt)}
            valueClass="text-red-400"
            active={expanded === "debt"}
            onClick={() => toggle("debt")}
          />
        )}
      </div>

      {/* Reconciliation: cash + investments + debt = grand total across all linked accounts */}
      <div className="text-xs text-muted-foreground text-center">
        Cash + Investments + Debt ={" "}
        <span className="text-foreground font-medium">{fmt(grandTotal)}</span>{" "}
        across all connected accounts
      </div>

      {/* Conditional detail panels */}
      {expanded === "balance" && (
        <div className="glass-card rounded-xl p-5">
          <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <Wallet size={16} className="text-green-400" />
            Cash & Cash Equivalent Accounts
          </h4>
          {cashAccounts.length > 0 ? (
            <div className="space-y-2">
              {cashAccounts.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-secondary rounded text-muted-foreground capitalize shrink-0">
                      {a.subtype || a.type}
                    </span>
                    <div className="min-w-0">
                      <div className="text-foreground/90 truncate">{a.name}</div>
                      {a.institutionName && (
                        <div className="text-xs text-muted-foreground truncate">{a.institutionName}</div>
                      )}
                    </div>
                  </div>
                  <span className="font-medium">{fmt(a.current_balance || 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No detailed account breakdown available.</p>
          )}
        </div>
      )}

      {expanded === "investments" && (
        <div className="glass-card rounded-xl p-5 space-y-5">
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Long-Term Investment Accounts
            </h4>
            {investmentAccounts.length > 0 ? (
              <div className="space-y-2">
                {investmentAccounts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono px-1.5 py-0.5 bg-secondary rounded text-muted-foreground capitalize shrink-0">
                        {a.subtype || a.type}
                      </span>
                      <div className="min-w-0">
                        <div className="text-foreground/90 truncate">{a.name}</div>
                        {a.institutionName && (
                          <div className="text-xs text-muted-foreground truncate">{a.institutionName}</div>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{fmt(a.current_balance || 0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No long-term investment accounts (IRA, 401(k), HSA, etc.) connected yet.
              </p>
            )}
          </div>

          {summary.holdings.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" />
                Holdings
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {summary.holdings
                  .sort((a, b) => (b.value || 0) - (a.value || 0))
                  .map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-secondary rounded text-muted-foreground shrink-0">
                          {h.ticker || "—"}
                        </span>
                        <span className="text-muted-foreground truncate max-w-[180px]">{h.security_name}</span>
                      </div>
                      <span className="font-medium">{fmt(h.value || 0)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {expanded === "debt" && (
        <div className="glass-card rounded-xl p-5">
          <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <CreditCard size={16} className="text-red-400" />
            Debt Accounts
          </h4>
          {debtAccounts.length > 0 ? (
            <div className="space-y-2">
              {debtAccounts.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono px-1.5 py-0.5 bg-secondary rounded text-muted-foreground capitalize shrink-0">
                      {a.subtype || a.type}
                    </span>
                    <div className="min-w-0">
                      <div className="text-foreground/90 truncate">{a.name}</div>
                      {a.institutionName && (
                        <div className="text-xs text-muted-foreground truncate">{a.institutionName}</div>
                      )}
                    </div>
                  </div>
                  <span className="font-medium text-red-400">{fmt(a.current_balance || 0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No detailed debt breakdown available.</p>
          )}
        </div>
      )}

      {/* Spending categories — always visible, not in scope of toggle */}
      {summary.topSpendingCategories.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <PiggyBank size={16} className="text-primary" />
            Top Spending Categories (30 days)
          </h4>
          <div className="space-y-2">
            {summary.topSpendingCategories.map((cat, i) => {
              const maxAmount = summary.topSpendingCategories[0].amount;
              const pct = (cat.amount / maxAmount) * 100;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{cat.category}</span>
                    <span className="font-medium">{fmt(cat.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full gold-gradient rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({
  icon,
  label,
  value,
  valueClass,
  active,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-expanded={active}
    className={`glass-card rounded-xl p-4 text-left transition-all ${
      disabled
        ? "opacity-60 cursor-not-allowed"
        : "hover:border-primary/40 cursor-pointer"
    } ${active ? "ring-2 ring-primary/40 border-primary/40" : ""}`}
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        {icon}
        {label}
      </div>
      {!disabled && (
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${active ? "rotate-180" : ""}`}
        />
      )}
    </div>
    <span className={`text-xl font-heading font-bold ${valueClass}`}>{value}</span>
  </button>
);

export default ConnectedAccountsSummary;
