
-- 1. Restrict client read access to plaid_access_token via column-level revoke.
-- RLS still controls row visibility; this prevents the column from being SELECTed by clients.
REVOKE SELECT (plaid_access_token) ON public.connected_accounts FROM anon, authenticated;

-- 2. Restrict fetch_errors column on metro_housing_data from public clients (may leak API errors).
REVOKE SELECT (fetch_errors) ON public.metro_housing_data FROM anon, authenticated;

-- 3. Add restrictive deny-by-default write policies on Plaid-derived tables.
-- These tables are written exclusively by the service role (edge functions); block client writes.
CREATE POLICY "Block client writes - account_balances insert"
  ON public.account_balances FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client writes - account_balances update"
  ON public.account_balances FOR UPDATE TO authenticated, anon
  USING (false);
CREATE POLICY "Block client writes - account_balances delete"
  ON public.account_balances FOR DELETE TO authenticated, anon
  USING (false);

CREATE POLICY "Block client writes - account_holdings insert"
  ON public.account_holdings FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client writes - account_holdings update"
  ON public.account_holdings FOR UPDATE TO authenticated, anon
  USING (false);
CREATE POLICY "Block client writes - account_holdings delete"
  ON public.account_holdings FOR DELETE TO authenticated, anon
  USING (false);

CREATE POLICY "Block client writes - account_transactions insert"
  ON public.account_transactions FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "Block client writes - account_transactions update"
  ON public.account_transactions FOR UPDATE TO authenticated, anon
  USING (false);
CREATE POLICY "Block client writes - account_transactions delete"
  ON public.account_transactions FOR DELETE TO authenticated, anon
  USING (false);

-- 4. SECURITY DEFINER functions should not be callable directly by clients.
-- These are used as triggers only; revoke EXECUTE from public/anon/authenticated.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
