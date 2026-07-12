-- Closes the remaining advisories from `get_advisors` after 0001-0003:
-- SECURITY DEFINER views, mutable function search_path, extensions in the
-- public schema, and an over-broad public storage listing policy.

-- 1. Analytics views: run as the querying user (respects their RLS) instead
--    of the view creator's privileges. Dashboard queries already filter by
--    shop_id explicitly, so this closes the gap without changing behavior.
ALTER VIEW v_daily_sales SET (security_invoker = on);
ALTER VIEW v_top_products SET (security_invoker = on);
ALTER VIEW v_low_stock SET (security_invoker = on);
ALTER VIEW v_gst_summary SET (security_invoker = on);

-- 2. Pin search_path on SECURITY DEFINER-adjacent / trigger functions so a
--    malicious search_path can't shadow catalog objects they reference.
ALTER FUNCTION set_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION sync_inventory_from_ledger() SET search_path = public, pg_temp;
ALTER FUNCTION sync_customer_credit() SET search_path = public, pg_temp;
ALTER FUNCTION update_customer_aggregates() SET search_path = public, pg_temp;
ALTER FUNCTION claim_invoice_number(uuid) SET search_path = public, pg_temp;

-- 3. Move extensions out of the public schema. Existing objects (the trigram
--    GIN index on products.name) keep working via internal OID references;
--    the database-level search_path update keeps future unqualified
--    references (e.g. gin_trgm_ops in new DDL) resolving correctly.
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION btree_gist SET SCHEMA extensions;

DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET search_path = public, extensions', current_database());
END $$;

-- 4. shop-assets is a public bucket — individual objects are already
--    servable via the unauthenticated /storage/v1/object/public/ URL
--    regardless of RLS. This policy only added the ability to enumerate
--    every file in the bucket via table queries; the app never calls
--    .list(), only .upload()/.getPublicUrl(), so it's safe to remove.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
