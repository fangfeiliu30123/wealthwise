import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle2, Wallet, TrendingUp, CreditCard, Info } from "lucide-react";
import { ConnectedAccountData, UserProfile } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { buildSnapshot, MergedFinancialSnapshot } from "@/lib/merge-financial-data";

const PROFILE_KEY = "wealthwise_profile";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

interface RowProps {
  label: string;
  field: { value: number; source: "manual" | "plaid" | "none"; manual?: number; plaid?: number };
}

const SourceBadge = ({ source }: { source: "manual" | "plaid" | "none" }) => {
  if (source === "manual")
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 uppercase tracking-wider">
        You entered
      </span>
    );
  if (source === "plaid")
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-info/15 text-info border border-info/30 uppercase tracking-wider">
        From Plaid
      </span>
    );
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">
      Not provided
    </span>
  );
};

const Row = ({ label, field }: RowProps) => {
  const conflict =
    field.manual !== undefined &&
    field.plaid !== undefined &&
    field.manual > 0 &&
    field.plaid > 0 &&
    Math.abs(field.manual - field.plaid) > 100;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <SourceBadge source={field.source} />
          {conflict && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle size={10} /> Plaid said {fmt(field.plaid!)}
            </span>
          )}
        </div>
      </div>
      <span
        className={`font-mono text-sm tabular-nums ${
          field.value === 0 ? "text-muted-foreground" : "text-foreground font-semibold"
        }`}
      >
        {fmt(field.value)}
      </span>
    </div>
  );
};

interface FinancialSnapshotProps {
  /** When provided, render in "review" mode with Continue/Edit CTAs instead of navigation. */
  profile?: UserProfile;
  onContinue?: () => void;
  onEdit?: () => void;
}

const FinancialSnapshot = ({ profile: profileProp, onContinue, onEdit }: FinancialSnapshotProps = {}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(profileProp ?? null);
  const reviewMode = !!profileProp;
  const [plaidData, setPlaidData] = useState<ConnectedAccountData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileProp) return;
    try {
      const saved = sessionStorage.getItem(PROFILE_KEY);
      if (saved) setProfile(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, [profileProp]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (!cancelled) setLoading(false);
          return;
        }
        const { data, error } = await supabase.functions.invoke("plaid-get-accounts");
        if (cancelled) return;
        if (!error && data?.summary) setPlaidData(data.summary);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const snapshot: MergedFinancialSnapshot | null = useMemo(
    () => (profile ? buildSnapshot(profile, plaidData) : null),
    [profile, plaidData],
  );

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-xl p-8 max-w-md text-center space-y-4">
          <h2 className="font-heading text-xl font-bold">No profile found</h2>
          <p className="text-muted-foreground text-sm">
            Complete the onboarding to see your financial snapshot.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg gold-gradient text-primary-foreground font-semibold"
          >
            Get started
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!reviewMode && (
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={18} />
              Back to roadmap
            </Link>
            <h1 className="font-heading font-bold text-lg gold-text">WealthWise</h1>
          </div>
        </header>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">Your financial snapshot</h2>
          <p className="text-muted-foreground">
            A consolidated view of everything we know about your finances — combining your linked Plaid accounts
            with what you entered manually. <span className="text-foreground font-medium">When the two disagree, your manual entry wins</span> because it reflects what you've verified.
          </p>
        </motion.div>

        {loading && (
          <div className="glass-card rounded-xl p-4 text-sm text-muted-foreground">Loading Plaid balances…</div>
        )}

        {snapshot && (
          <>
            {/* Net worth headline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
            >
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Estimated net worth</div>
                <div
                  className={`font-heading text-4xl md:text-5xl font-bold ${
                    snapshot.netWorth >= 0 ? "gold-text" : "text-destructive"
                  }`}
                >
                  {fmt(snapshot.netWorth)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Total assets</div>
                  <div className="font-mono text-lg font-semibold text-foreground">{fmt(snapshot.totalAssets)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Total liabilities</div>
                  <div className="font-mono text-lg font-semibold text-destructive">
                    {fmt(snapshot.totalLiabilities)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Source banner */}
            <div className="glass-card rounded-xl p-4 flex items-start gap-3 text-sm">
              <Info size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="space-y-1 text-muted-foreground">
                <div>
                  Sources used:{" "}
                  {snapshot.hasManual && <span className="text-primary font-medium">manual entries</span>}
                  {snapshot.hasManual && snapshot.hasPlaid && <span> + </span>}
                  {snapshot.hasPlaid && <span className="text-info font-medium">Plaid linked accounts</span>}
                  {!snapshot.hasManual && !snapshot.hasPlaid && <span>none yet</span>}.
                </div>
                {snapshot.conflicts.length > 0 ? (
                  <div className="text-destructive flex items-start gap-1.5">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>
                      We found {snapshot.conflicts.length} field{snapshot.conflicts.length === 1 ? "" : "s"} where Plaid and your manual entry disagree.
                      Your numbers are being used — see the red badges below.
                    </span>
                  </div>
                ) : (
                  snapshot.hasManual &&
                  snapshot.hasPlaid && (
                    <div className="text-primary flex items-start gap-1.5">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                      <span>No conflicts detected between your manual entries and Plaid balances.</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Assets */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" /> Assets
                </h3>
                <span className="font-mono text-sm font-semibold">{fmt(snapshot.totalAssets)}</span>
              </div>
              <div>
                <Row label="Liquid savings (checking, savings, MM)" field={snapshot.liquidSavings} />
                <Row label="Retirement accounts (401k, IRA)" field={snapshot.retirementAccounts} />
                <Row label="Brokerage / taxable investments" field={snapshot.brokerageInvestments} />
                <Row label="HSA balance" field={snapshot.hsa} />
                <Row label="Home equity" field={snapshot.homeEquity} />
                <Row label="Private equity / VC / angel" field={snapshot.privateInvestments} />
                <Row label="Other assets" field={snapshot.otherAssets} />
              </div>
            </div>

            {/* Liabilities */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold flex items-center gap-2">
                  <CreditCard size={18} className="text-destructive" /> Liabilities
                </h3>
                <span className="font-mono text-sm font-semibold text-destructive">
                  {fmt(snapshot.totalLiabilities)}
                </span>
              </div>
              <div>
                <Row label="Student loans" field={snapshot.studentLoans} />
                <Row label="Car / auto loans" field={snapshot.carLoans} />
                <Row label="Credit card debt" field={snapshot.creditCardDebt} />
                <Row label="Mortgage balance" field={snapshot.mortgageBalance} />
                <Row label="Personal guarantee on business debt" field={snapshot.businessGuarantee} />
                <Row label="Other liabilities" field={snapshot.otherLiabilities} />
              </div>
            </div>

            {/* CTA */}
            {reviewMode ? (
              <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Wallet size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>
                    Review your assets and liabilities above. If anything looks off, edit your info before we build your roadmap.
                  </span>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={onEdit}
                    className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium whitespace-nowrap"
                  >
                    Edit my info
                  </button>
                  <button
                    onClick={onContinue}
                    className="flex-1 md:flex-none px-5 py-2 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold whitespace-nowrap"
                  >
                    Continue to roadmap →
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Wallet size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>
                    Numbers look off? Restart onboarding to update your manual entries — they always override Plaid.
                  </span>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.removeItem(PROFILE_KEY);
                    navigate("/");
                  }}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium whitespace-nowrap"
                >
                  Edit my info
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default FinancialSnapshot;
