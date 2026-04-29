ALTER TABLE public.connected_accounts ADD COLUMN IF NOT EXISTS device_id text;
ALTER TABLE public.connected_accounts ALTER COLUMN user_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS connected_accounts_device_id_idx ON public.connected_accounts(device_id);

-- Drop old user-based policies on connected_accounts
DROP POLICY IF EXISTS "Users can create their own connected accounts" ON public.connected_accounts;
DROP POLICY IF EXISTS "Users can delete their own connected accounts" ON public.connected_accounts;
DROP POLICY IF EXISTS "Users can update their own connected accounts" ON public.connected_accounts;
DROP POLICY IF EXISTS "Users can view their own connected accounts" ON public.connected_accounts;

-- Block all client access (service role bypasses RLS, used by edge functions)
CREATE POLICY "Block client reads - connected_accounts" ON public.connected_accounts FOR SELECT TO anon, authenticated USING (false);
CREATE POLICY "Block client writes - connected_accounts insert" ON public.connected_accounts FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "Block client writes - connected_accounts update" ON public.connected_accounts FOR UPDATE TO anon, authenticated USING (false);
CREATE POLICY "Block client writes - connected_accounts delete" ON public.connected_accounts FOR DELETE TO anon, authenticated USING (false);

-- Block client reads on related tables (edge functions use service role)
DROP POLICY IF EXISTS "Users can view their own account balances" ON public.account_balances;
CREATE POLICY "Block client reads - account_balances" ON public.account_balances FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Users can view their own holdings" ON public.account_holdings;
CREATE POLICY "Block client reads - account_holdings" ON public.account_holdings FOR SELECT TO anon, authenticated USING (false);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.account_transactions;
CREATE POLICY "Block client reads - account_transactions" ON public.account_transactions FOR SELECT TO anon, authenticated USING (false);