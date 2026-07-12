-- Pricing plans + feature catalog, backing the /pricing page and the
-- homepage pricing teaser. Public marketing content: readable by anyone
-- (anon key), writable only via service-role/SQL for now — there's no
-- admin UI for editing plans in this pass.

CREATE TABLE plans (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    key             TEXT            NOT NULL UNIQUE,     -- matches shop_plan enum: free|starter|pro|enterprise
    name            TEXT            NOT NULL,
    tagline         TEXT,
    price_monthly   NUMERIC(10,2),                       -- NULL = "Contact us" (Enterprise)
    price_yearly    NUMERIC(10,2),
    currency        TEXT            NOT NULL DEFAULT 'INR',
    max_products    INTEGER,                             -- NULL = unlimited
    max_storefronts INTEGER,
    max_staff       INTEGER,
    max_locations   INTEGER,
    is_popular      BOOLEAN         NOT NULL DEFAULT FALSE,
    cta_label       TEXT            NOT NULL DEFAULT 'Get started',
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE feature_catalog (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    key             TEXT            NOT NULL UNIQUE,
    label           TEXT            NOT NULL,
    category        TEXT            NOT NULL,
    sort_order      INTEGER         NOT NULL DEFAULT 0
);

CREATE TABLE plan_features (
    plan_id         UUID            NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_id      UUID            NOT NULL REFERENCES feature_catalog(id) ON DELETE CASCADE,
    is_included     BOOLEAN         NOT NULL DEFAULT TRUE,
    note            TEXT,                                -- e.g. "up to 3 locations"
    PRIMARY KEY (plan_id, feature_id)
);

CREATE INDEX idx_plan_features_plan ON plan_features(plan_id);

ALTER TABLE plans           ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features   ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read ON plans FOR SELECT USING (is_active = TRUE);
CREATE POLICY public_read ON feature_catalog FOR SELECT USING (TRUE);
CREATE POLICY public_read ON plan_features FOR SELECT USING (TRUE);

-- ── Seed: plans ──────────────────────────────────────────────
INSERT INTO plans (key, name, tagline, price_monthly, price_yearly, max_products, max_storefronts, max_staff, max_locations, is_popular, cta_label, sort_order) VALUES
('free',       'Free',       'Try the full platform, no card required',   0,    0,     50,   1,    1,    1,    FALSE, 'Get started free', 1),
('starter',    'Starter',    'For a single shop going online',            499,  4999,  NULL, 1,    3,    1,    TRUE,  'Start free trial',  2),
('pro',        'Pro',        'For growing shops with a team',             1299, 12999, NULL, 3,    NULL, 3,    FALSE, 'Start free trial',  3),
('enterprise', 'Enterprise', 'For multi-location & franchise operations', NULL, NULL,  NULL, NULL, NULL, NULL, FALSE, 'Contact sales',     4);

-- ── Seed: feature catalog ────────────────────────────────────
INSERT INTO feature_catalog (key, label, category, sort_order) VALUES
('online_storefront', 'Online storefront with premium themes',              'Storefront',         1),
('custom_domain',     'Custom domain',                                       'Storefront',         2),
('product_variants',  'Size / colour product variants',                      'Storefront',         3),
('pos_billing',       'POS billing (barcode, UPI/card/cash)',                'Selling',            1),
('multi_channel',     'Multi-channel orders (online, POS, WhatsApp, marketplace)', 'Selling',       2),
('coupons',           'Discount coupons',                                    'Selling',            3),
('unified_inventory', 'Unified inventory across channels',                   'Inventory',          1),
('multi_location',    'Multi-location stock',                                'Inventory',          2),
('low_stock_alerts',  'Low stock alerts',                                    'Inventory',          3),
('gst_invoicing',     'GST-compliant invoicing with auto PDF',               'Billing & Finance',  1),
('khata_credit',      'Khata / customer credit ledger',                      'Billing & Finance',  2),
('expense_tracking',  'Expense tracking',                                    'Billing & Finance',  3),
('staff_logins',      'Multi-staff logins with roles',                       'Team',               1),
('staff_commissions', 'Staff attendance & commissions',                      'Team',               2),
('analytics',         'Revenue & sales analytics',                           'Insights',           1),
('gst_reports',       'GST summary reports',                                 'Insights',           2),
('priority_support',  'Priority support',                                    'Support',            1),
('dedicated_manager',  'Dedicated account manager',                          'Support',            2);

-- ── Seed: plan x feature matrix ──────────────────────────────
-- Free: core essentials only, single location/staff, no multi-channel/team features.
INSERT INTO plan_features (plan_id, feature_id, is_included, note)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, feature_catalog f
WHERE p.key = 'free' AND f.key IN
  ('online_storefront', 'pos_billing', 'unified_inventory', 'low_stock_alerts', 'gst_invoicing');

-- Starter: adds custom domain, coupons, khata, analytics, small team.
INSERT INTO plan_features (plan_id, feature_id, is_included, note)
SELECT p.id, f.id, TRUE,
  CASE f.key WHEN 'staff_logins' THEN 'up to 3 staff' ELSE NULL END
FROM plans p, feature_catalog f
WHERE p.key = 'starter' AND f.key IN
  ('online_storefront', 'custom_domain', 'product_variants', 'pos_billing', 'multi_channel', 'coupons',
   'unified_inventory', 'low_stock_alerts', 'gst_invoicing', 'khata_credit', 'staff_logins', 'analytics');

-- Pro: everything Starter has, plus multi-location, expenses, commissions, GST reports, priority support.
INSERT INTO plan_features (plan_id, feature_id, is_included, note)
SELECT p.id, f.id, TRUE,
  CASE f.key WHEN 'multi_location' THEN 'up to 3 locations' ELSE NULL END
FROM plans p, feature_catalog f
WHERE p.key = 'pro' AND f.key IN
  ('online_storefront', 'custom_domain', 'product_variants', 'pos_billing', 'multi_channel', 'coupons',
   'unified_inventory', 'multi_location', 'low_stock_alerts', 'gst_invoicing', 'khata_credit',
   'expense_tracking', 'staff_logins', 'staff_commissions', 'analytics', 'gst_reports', 'priority_support');

-- Enterprise: everything.
INSERT INTO plan_features (plan_id, feature_id, is_included, note)
SELECT p.id, f.id, TRUE, NULL
FROM plans p, feature_catalog f
WHERE p.key = 'enterprise';
