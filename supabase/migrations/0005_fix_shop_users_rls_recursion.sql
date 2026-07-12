-- The shop_members_only policy on shop_users queries shop_users in its own
-- USING/WITH CHECK clause. Evaluating that subquery re-triggers the same
-- policy, which Postgres detects as infinite recursion (42P17), breaking
-- every dashboard query that touches shop_users (including the post-login
-- shop lookup, which silently fails and bounces the user back to /login).
--
-- Fix: move the self-lookup into a SECURITY DEFINER function, which runs
-- with the privileges of its owner and therefore bypasses RLS on shop_users
-- internally instead of re-invoking the policy.

CREATE OR REPLACE FUNCTION public.active_shop_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE
$$;

DROP POLICY IF EXISTS shop_members_only ON shop_users;

CREATE POLICY shop_members_only ON shop_users FOR ALL
  USING (
    auth_user_id = auth.uid()
    OR shop_id IN (SELECT active_shop_ids())
  )
  WITH CHECK (
    auth_user_id = auth.uid()
    OR shop_id IN (SELECT active_shop_ids())
  );
