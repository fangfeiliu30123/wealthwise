import { useEffect, useState } from "react";
import { Wallet, PiggyBank, TrendingUp, Home, Briefcase, GraduationCap, Car, CreditCard, Building2, Sparkles, Landmark } from "lucide-react";
import { ManualNetWorth } from "@/lib/types";
import PlaidConnector from "./PlaidConnector";
import { invokePlaidFunction } from "@/lib/plaid-functions";

interface NetWorthStepProps {
  value: ManualNetWorth;
  onChange: (next: ManualNetWorth) => void;
}

interface FieldDef {
  key: keyof ManualNetWorth;
  label: string;
  hint?: string;
  icon: React.ReactNode;
}

const ASSET_FIELDS: FieldDef[] = [
  { key: "liquidSavings", label: "Liquid savings", hint: "Checking, savings, money market", icon: <PiggyBank size={16} /> },
  { key: "retirementAccounts", label: "Retirement (401k / IRA)", hint: "Combined balance across all retirement accounts", icon: <Sparkles size={16} /> },
  { key: "hsa", label: "HSA balance", hint: "Health Savings Account", icon: <Wallet size={16} /> },
  { key: "brokerageInvestments", label: "Brokerage investments", hint: "Taxable stocks, bonds, ETFs", icon: <TrendingUp size={16} /> },
  { key: "homeEquity", label: "Home equity", hint: "0 if renting (home value − mortgage)", icon: <Home size={16} /> },
  { key: "privateInvestments", label: "Private equity / VC / angel", hint: "Private business equity, startup investments", icon: <Briefcase size={16} /> },
  { key: "otherAssets", label: "Other assets", hint: "Anything else (collectibles, crypto, etc.)", icon: <Wallet size={16} /> },
];

const LIABILITY_FIELDS: FieldDef[] = [
  { key: "studentLoans", label: "Student loans", icon: <GraduationCap size={16} /> },
  { key: "carLoans", label: "Car / auto loans", icon: <Car size={16} /> },
  { key: "creditCardDebt", label: "Credit card debt", hint: "Balance carried month-to-month", icon: <CreditCard size={16} /> },
  { key: "mortgageBalance", label: "Mortgage balance", icon: <Home size={16} /> },
  { key: "businessGuarantee", label: "Personal guarantee on business debt", icon: <Building2 size={16} /> },
  { key: "otherLiabilities", label: "Other liabilities", icon: <CreditCard size={16} /> },
];

const formatNumber = (raw: string) => {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString();
};

const NetWorthStep = ({ value, onChange }: NetWorthStepProps) => {
  // local string-state mirrors so we can format with commas as user types
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    Object.entries(value || {}).forEach(([k, v]) => {
      if (typeof v === "number") init[k] = v.toLocaleString();
    });
    return init;
  });
  const [plaidLinked, setPlaidLinked] = useState(false);

  // Pull Plaid totals when connected and merge into manual fields (without overwriting non-empty user entries).
  const refreshFromPlaid = async () => {
    try {
      const { getDeviceId } = await import("@/lib/device-id");
      const data = await invokePlaidFunction<{ summary?: any }>("plaid-get-accounts", { device_id: getDeviceId() });
      if (!data?.summary) return;
      const summary = data.summary;
      setPlaidLinked(true);
      const plaidLiquid = Number(summary?.totalBalance || 0);
      const plaidInvest = Number(summary?.totalInvestments || 0);
      const plaidDebt = Number(summary?.totalDebt || 0);

      // Heuristic: split Plaid debt across student / mortgage / credit if subtypes available
      const debts = (summary?.debtAccounts || []) as { subtype?: string | null; balance?: number }[];
      const sumBy = (match: (s: string) => boolean) =>
        debts.filter(d => match((d.subtype || "").toLowerCase())).reduce((a, b) => a + (b.balance || 0), 0);
      const mortgage = sumBy(s => s.includes("mortgage"));
      const student = sumBy(s => s.includes("student"));
      const auto = sumBy(s => s.includes("auto") || s.includes("car"));
      const credit = sumBy(s => s.includes("credit"));
      const otherLiab = Math.max(0, plaidDebt - (mortgage + student + auto + credit));

      const merged: ManualNetWorth = { ...value };
      const setIfEmpty = (k: keyof ManualNetWorth, v: number) => {
        if (v > 0 && !merged[k]) merged[k] = v;
      };
      setIfEmpty("liquidSavings", plaidLiquid);
      setIfEmpty("retirementAccounts", plaidInvest); // best-guess; user can override
      setIfEmpty("mortgageBalance", mortgage);
      setIfEmpty("studentLoans", student);
      setIfEmpty("carLoans", auto);
      setIfEmpty("creditCardDebt", credit);
      setIfEmpty("otherLiabilities", otherLiab);

      // sync display drafts
      const newDraft = { ...draft };
      Object.entries(merged).forEach(([k, v]) => {
        if (typeof v === "number" && !newDraft[k]) newDraft[k] = v.toLocaleString();
      });
      setDraft(newDraft);
      onChange(merged);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    refreshFromPlaid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key: keyof ManualNetWorth, raw: string) => {
    const formatted = formatNumber(raw);
    setDraft({ ...draft, [key]: formatted });
    const num = Number(formatted.replace(/,/g, ""));
    const next: ManualNetWorth = { ...value };
    if (formatted === "" || isNaN(num)) {
      delete next[key];
    } else {
      next[key] = num;
    }
    onChange(next);
  };

  const totalAssets = ASSET_FIELDS.reduce((s, f) => s + (value[f.key] || 0), 0);
  const totalLiabilities = LIABILITY_FIELDS.reduce((s, f) => s + (value[f.key] || 0), 0);
  const netWorth = totalAssets - totalLiabilities;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const renderField = (f: FieldDef) => (
    <div key={f.key as string} className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm text-foreground/80">
        <span className="text-primary">{f.icon}</span>
        <span>{f.label}</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <input
          inputMode="numeric"
          value={draft[f.key as string] || ""}
          onChange={(e) => handleChange(f.key, e.target.value)}
          placeholder="0"
          className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-foreground"
        />
      </div>
      {f.hint && <p className="text-[11px] text-muted-foreground">{f.hint}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Plaid section */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Landmark size={18} className="text-primary" />
          <h3 className="font-heading font-semibold">Auto-fill with Plaid (recommended)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Securely connect your bank, brokerage, and retirement accounts. We'll pull live balances and pre-fill the
          fields below — you can still edit anything manually.
        </p>
        <PlaidConnector onAccountsUpdated={refreshFromPlaid} />
        {plaidLinked && (
          <p className="text-xs text-primary flex items-center gap-1">
            ✓ Plaid balances pre-filled below — edit any field to override
          </p>
        )}
      </div>

      {/* Manual entry */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Assets */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Assets
            </h3>
            <span className="text-xs text-muted-foreground">{fmt(totalAssets)}</span>
          </div>
          <div className="space-y-3">{ASSET_FIELDS.map(renderField)}</div>
        </div>

        {/* Liabilities */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <CreditCard size={18} className="text-destructive" /> Liabilities
            </h3>
            <span className="text-xs text-muted-foreground">{fmt(totalLiabilities)}</span>
          </div>
          <div className="space-y-3">{LIABILITY_FIELDS.map(renderField)}</div>
        </div>
      </div>

      {/* Net worth summary */}
      {(totalAssets > 0 || totalLiabilities > 0) && (
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Estimated net worth</div>
            <div className={`font-heading text-3xl font-bold ${netWorth >= 0 ? "text-primary" : "text-destructive"}`}>
              {fmt(netWorth)}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>Assets {fmt(totalAssets)}</div>
            <div>− Liabilities {fmt(totalLiabilities)}</div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        All fields are optional — leave any blank you don't have. You can also skip this step entirely.
      </p>
    </div>
  );
};

export default NetWorthStep;
