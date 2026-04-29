
-- Connected accounts (Plaid items)
CREATE TABLE public.connected_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plaid_item_id TEXT NOT NULL,
  plaid_access_token TEXT NOT NULL,
  institution_name TEXT,
  institution_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connected accounts"
ON public.connected_accounts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own connected accounts"
ON public.connected_accounts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connected accounts"
ON public.connected_accounts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connected accounts"
ON public.connected_accounts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Account balances
CREATE TABLE public.account_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  plaid_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subtype TEXT,
  current_balance NUMERIC,
  available_balance NUMERIC,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account balances"
ON public.account_balances FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.connected_accounts ca
    WHERE ca.id = account_balances.connected_account_id
    AND ca.user_id = auth.uid()
  )
);

-- Investment holdings
CREATE TABLE public.account_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_balance_id UUID NOT NULL REFERENCES public.account_balances(id) ON DELETE CASCADE,
  security_name TEXT,
  ticker TEXT,
  quantity NUMERIC,
  current_price NUMERIC,
  value NUMERIC,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holdings"
ON public.account_holdings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.account_balances ab
    JOIN public.connected_accounts ca ON ca.id = ab.connected_account_id
    WHERE ab.id = account_holdings.account_balance_id
    AND ca.user_id = auth.uid()
  )
);

-- Recent transactions
CREATE TABLE public.account_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_balance_id UUID NOT NULL REFERENCES public.account_balances(id) ON DELETE CASCADE,
  plaid_transaction_id TEXT,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  merchant_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.account_transactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.account_balances ab
    JOIN public.connected_accounts ca ON ca.id = ab.connected_account_id
    WHERE ab.id = account_transactions.account_balance_id
    AND ca.user_id = auth.uid()
  )
);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_connected_accounts_updated_at
BEFORE UPDATE ON public.connected_accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_balances_updated_at
BEFORE UPDATE ON public.account_balances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
