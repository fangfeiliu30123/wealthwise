import { useState, useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import { getDeviceId } from "@/lib/device-id";
import { Landmark, CheckCircle2, Loader2, AlertCircle, Plus } from "lucide-react";

interface ConnectedAccount {
  id: string;
  institution_name: string;
  status: string;
  account_balances: {
    name: string;
    type: string;
    current_balance: number;
    currency: string;
  }[];
}

interface PlaidConnectorProps {
  onAccountsUpdated?: () => void;
}

const invokePlaidFunction = async (functionName: string, payload: Record<string, unknown>) => {
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!publishableKey || !import.meta.env.VITE_SUPABASE_URL) {
    throw new Error("Account linking is not configured for this build");
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.error) {
    throw new Error(result?.error || `Unable to connect accounts (${response.status})`);
  }
  return result;
};

const PlaidConnector = ({ onAccountsUpdated }: PlaidConnectorProps) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);

  // Fetch existing connected accounts (via edge function — uses device_id, no auth required)
  const fetchAccounts = useCallback(async () => {
    try {
      const data = await invokePlaidFunction("plaid-get-accounts", { device_id: getDeviceId() });
      setConnectedAccounts((data?.accounts as any) || []);
    } catch {
      // ignore
    } finally {
      setFetchingAccounts(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const createLinkToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invokePlaidFunction("plaid-create-link-token", { device_id: getDeviceId() });
      setLinkToken(data.link_token);
    } catch (e: any) {
      setError(e.message || "Failed to initialize account linking");
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = useCallback(async (publicToken: string) => {
    setExchanging(true);
    setError(null);
    try {
      await invokePlaidFunction("plaid-exchange-token", { public_token: publicToken, device_id: getDeviceId() });
      await fetchAccounts();
      onAccountsUpdated?.();
    } catch (e: any) {
      setError(e.message || "Failed to connect account");
    } finally {
      setExchanging(false);
    }
  }, [fetchAccounts, onAccountsUpdated]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => setLinkToken(null),
  });

  // Auto-open when link token is ready
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  const formatBalance = (balance: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(balance);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "depository": return "🏦";
      case "investment": return "📈";
      case "credit": return "💳";
      case "loan": return "🏠";
      default: return "💰";
    }
  };

  if (fetchingAccounts) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={18} />
        Loading accounts...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connected accounts list */}
      {connectedAccounts.length > 0 && (
        <div className="space-y-3">
          {connectedAccounts.map((acct) => {
            const acctCount = acct.account_balances?.length || 0;
            return (
              <div key={acct.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Landmark size={18} className="text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-heading font-semibold truncate">{acct.institution_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {acctCount} account{acctCount === 1 ? "" : "s"} linked
                    </div>
                  </div>
                  <CheckCircle2 size={14} className="text-green-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect button */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={createLinkToken}
        disabled={loading || exchanging}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
      >
        {loading || exchanging ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            {exchanging ? "Connecting account..." : "Initializing..."}
          </>
        ) : (
          <>
            <Plus size={18} />
            {connectedAccounts.length > 0 ? "Connect Another Account" : "Connect Your Financial Accounts"}
          </>
        )}
      </button>

      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          🔒 Secured by Plaid — your credentials are never shared with WealthWise
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Robinhood", "Fidelity", "Charles Schwab", "Vanguard", "Chase", "Bank of America", "Wells Fargo", "Amex", "Capital One"].map((name) => (
            <span key={name} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              {name}
            </span>
          ))}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            + 12,000 more
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaidConnector;
