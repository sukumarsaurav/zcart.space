-- Re-enable Row Level Security across all shop-scoped tables and add real policies.
-- Supersedes disable_rls.sql (which left every table world-readable/writable to any
-- authenticated user). Run this in the Supabase SQL editor, or via `supabase db push`.
--
-- Model:
--   - Dashboard/API access (browser anon-key client) is scoped to rows whose shop_id
--     belongs to an active shop_users row for auth.uid().
--   - A handful of tables also need an anonymous public-read policy because the
--     storefront (unauthenticated visitors) queries them directly via the anon client:
--     shops, categories, products, product_variants, inventory.
--   - Server routes using the service-role client (checkout, webhooks, edge functions)
--     bypass RLS entirely — those are hardened separately with explicit shop_id filters.

-- =============================================================================
-- Re-enable RLS (idempotent)
-- =============================================================================

ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops               ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_locations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory           ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger    ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_counters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger       ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_commissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rules       ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_ledger      ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;

-- Drop the old incomplete policy so we can redefine it consistently below.
DROP POLICY IF EXISTS shop_members_only ON orders;

-- =============================================================================
-- Shop-membership policies (dashboard / anon-key browser client)
-- =============================================================================
-- shop_id IN (...) pattern: user must have an active shop_users row for that shop.

CREATE POLICY shop_members_only ON shops FOR ALL
  USING (id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON shop_locations FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

-- shop_users: members can see other members of the same shop, but a row's own
-- auth_user_id can always see itself (covers the moment right after signup).
CREATE POLICY shop_members_only ON shop_users FOR ALL
  USING (
    auth_user_id = auth.uid()
    OR shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE)
  )
  WITH CHECK (
    auth_user_id = auth.uid()
    OR shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE)
  );

CREATE POLICY shop_members_only ON permissions FOR ALL
  USING (shop_user_id IN (
    SELECT su.id FROM shop_users su
    WHERE su.shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE)
  ))
  WITH CHECK (shop_user_id IN (
    SELECT su.id FROM shop_users su
    WHERE su.shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE)
  ));

CREATE POLICY shop_members_only ON categories FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON products FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON product_variants FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON inventory FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON inventory_ledger FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON customers FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON customer_addresses FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON orders FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON order_items FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON payments FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON invoices FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON invoice_counters FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON credit_ledger FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON coupons FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON expenses FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON staff_attendance FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON staff_commissions FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON campaigns FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON product_reviews FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON loyalty_rules FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON loyalty_ledger FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON carts FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

CREATE POLICY shop_members_only ON audit_log FOR ALL
  USING (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE))
  WITH CHECK (shop_id IN (SELECT shop_id FROM shop_users WHERE auth_user_id = auth.uid() AND is_active = TRUE));

-- organizations: Phase 4 (multi-shop franchises), not yet used by any app code.
-- No public/member policy needed until that feature lands — leave RLS enabled
-- with zero policies, which defaults to deny-all (safe default).

-- =============================================================================
-- Public read policies (storefront, unauthenticated anon-key client)
-- =============================================================================
-- The storefront resolves a shop by slug, then browses its catalogue, entirely
-- unauthenticated. These are read-only and scoped to "publishable" rows only.

CREATE POLICY public_read_active ON shops FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY public_read_active ON categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY public_read_active ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY public_read_active ON product_variants FOR SELECT
  USING (is_active = TRUE);

-- Stock quantity only; no pricing/PII here, safe to expose for "in stock" display.
CREATE POLICY public_read_all ON inventory FOR SELECT
  USING (TRUE);

-- Published, moderated reviews only (no write policy — reviews aren't submittable yet).
CREATE POLICY public_read_published ON product_reviews FOR SELECT
  USING (is_published = TRUE);
