-- =============================================================================
-- LOCAL SHOP PLATFORM — COMPLETE DATABASE SCHEMA
-- PostgreSQL 15+  |  Designed for Supabase (Row Level Security ready)
-- Covers: Phase 1 MVP → Phase 4 Advanced (scaffold-only for later phases)
-- =============================================================================

-- ─────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- trigram search on product names
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- exclusion constraints


-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role          AS ENUM ('owner', 'manager', 'cashier', 'viewer');
CREATE TYPE shop_plan          AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE product_status     AS ENUM ('active', 'archived', 'draft');
CREATE TYPE order_channel      AS ENUM ('online', 'pos', 'whatsapp', 'marketplace');
CREATE TYPE order_status       AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status     AS ENUM ('pending', 'paid', 'partial', 'failed', 'refunded');
CREATE TYPE payment_method     AS ENUM ('upi', 'card', 'cash', 'cod', 'bank_transfer', 'credit_ledger', 'wallet');
CREATE TYPE invoice_type       AS ENUM ('sale', 'return', 'proforma');
CREATE TYPE ledger_entry_type  AS ENUM ('purchase', 'sale', 'return', 'adjustment', 'transfer');
CREATE TYPE credit_txn_type    AS ENUM ('credit', 'payment', 'adjustment');
CREATE TYPE delivery_status    AS ENUM ('not_required', 'pending', 'assigned', 'in_transit', 'delivered', 'failed');
CREATE TYPE discount_type      AS ENUM ('flat', 'percent');
CREATE TYPE coupon_scope       AS ENUM ('order', 'product', 'category');
CREATE TYPE campaign_channel   AS ENUM ('whatsapp', 'sms', 'email');
CREATE TYPE expense_category   AS ENUM ('rent', 'salaries', 'utilities', 'supplies', 'marketing', 'maintenance', 'taxes', 'other');
CREATE TYPE gst_rate           AS ENUM ('0', '5', '12', '18', '28');        -- valid Indian GST slabs
CREATE TYPE address_type       AS ENUM ('billing', 'shipping', 'shop');


-- =============================================================================
-- 0. ORGANISATIONS  (Phase 4 — Franchise mode; scaffolded now, safe to ignore)
-- =============================================================================

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT        NOT NULL,
    slug            TEXT        NOT NULL UNIQUE,
    logo_url        TEXT,
    metadata        JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE organizations IS 'Franchise / multi-brand umbrella. One org can own many shops.';


-- =============================================================================
-- 1. SHOPS
-- =============================================================================

CREATE TABLE shops (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID        REFERENCES organizations(id) ON DELETE SET NULL,   -- Phase 4
    name            TEXT        NOT NULL,
    slug            TEXT        NOT NULL UNIQUE,          -- used for subdomain: slug.platform.com
    custom_domain   TEXT        UNIQUE,                   -- CNAME target
    domain_verified BOOLEAN     NOT NULL DEFAULT FALSE,
    phone           TEXT,
    email           TEXT,
    gstin           TEXT,                                 -- 15-char GST Identification Number
    pan             TEXT,                                 -- PAN for non-GST shops
    plan            shop_plan   NOT NULL DEFAULT 'free',
    plan_expires_at TIMESTAMPTZ,
    theme           JSONB       NOT NULL DEFAULT '{"primary_color":"#6366f1","font":"inter","template":"default"}',
    logo_url        TEXT,
    banner_url      TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    metadata        JSONB       NOT NULL DEFAULT '{}',    -- flexible: social links, payment notes, etc.
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shops_org        ON shops(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX idx_shops_gstin      ON shops(gstin)  WHERE gstin IS NOT NULL;
COMMENT ON COLUMN shops.theme IS 'Storefront config: template name, colours, font. Extensible via JSONB.';


-- =============================================================================
-- 2. SHOP LOCATIONS  (single row = Phase 1; multi-row = Phase 3.1 activated)
-- =============================================================================

CREATE TABLE shop_locations (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name            TEXT        NOT NULL DEFAULT 'Main Store',
    address_line1   TEXT,
    address_line2   TEXT,
    city            TEXT,
    state           TEXT,
    pincode         TEXT,
    country         TEXT        NOT NULL DEFAULT 'IN',
    lat             NUMERIC(10,7),
    lng             NUMERIC(10,7),
    is_primary      BOOLEAN     NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shop_locations_shop ON shop_locations(shop_id);
-- Only one primary location per shop
CREATE UNIQUE INDEX uq_primary_location ON shop_locations(shop_id) WHERE is_primary = TRUE;


-- =============================================================================
-- 3. USERS & PERMISSIONS
-- =============================================================================

CREATE TABLE shop_users (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    auth_user_id    UUID        NOT NULL,                 -- foreign key to Supabase auth.users
    role            user_role   NOT NULL DEFAULT 'cashier',
    display_name    TEXT,
    phone           TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    invited_by      UUID        REFERENCES shop_users(id) ON DELETE SET NULL,
    joined_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (shop_id, auth_user_id)                       -- one role per shop per user
);

CREATE INDEX idx_shop_users_shop     ON shop_users(shop_id);
CREATE INDEX idx_shop_users_auth     ON shop_users(auth_user_id);

-- Granular permission overrides on top of role defaults (Phase 2.6)
CREATE TABLE permissions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_user_id    UUID        NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
    permission_key  TEXT        NOT NULL,                 -- e.g. 'orders.refund', 'reports.view'
    is_granted      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (shop_user_id, permission_key)
);


-- =============================================================================
-- 4. PRODUCT CATALOGUE
-- =============================================================================

CREATE TABLE categories (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    parent_id       UUID        REFERENCES categories(id) ON DELETE SET NULL,
    name            TEXT        NOT NULL,
    slug            TEXT        NOT NULL,
    image_url       TEXT,
    sort_order      INTEGER     NOT NULL DEFAULT 0,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (shop_id, slug)
);

CREATE INDEX idx_categories_shop   ON categories(shop_id);
CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE parent_id IS NOT NULL;


CREATE TABLE products (
    id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID           NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id     UUID           REFERENCES categories(id) ON DELETE SET NULL,
    name            TEXT           NOT NULL,
    slug            TEXT           NOT NULL,
    description     TEXT,
    images          TEXT[]         NOT NULL DEFAULT '{}',  -- ordered list of URLs
    sku             TEXT,
    barcode         TEXT,                                  -- EAN-13 / QR / custom
    unit            TEXT           NOT NULL DEFAULT 'pcs', -- pcs, kg, litre, box, etc.
    -- Pricing
    mrp             NUMERIC(12,2)  NOT NULL,               -- Maximum Retail Price (printed on pack)
    selling_price   NUMERIC(12,2)  NOT NULL,
    cost_price      NUMERIC(12,2),                         -- for margin reports
    -- Tax
    hsn_code        TEXT,                                  -- required for GST invoicing
    gst_rate        gst_rate       NOT NULL DEFAULT '18',
    tax_inclusive   BOOLEAN        NOT NULL DEFAULT TRUE,  -- is selling_price GST-inclusive?
    -- Inventory
    track_inventory BOOLEAN        NOT NULL DEFAULT TRUE,
    -- Phase 3.2: batch/expiry — columns added here, populated later
    has_batch       BOOLEAN        NOT NULL DEFAULT FALSE,
    has_expiry      BOOLEAN        NOT NULL DEFAULT FALSE,
    -- Misc
    is_featured     BOOLEAN        NOT NULL DEFAULT FALSE,
    status          product_status NOT NULL DEFAULT 'active',
    metadata        JSONB          NOT NULL DEFAULT '{}',
    created_by      UUID           REFERENCES shop_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    UNIQUE (shop_id, slug),
    CONSTRAINT ck_price_positive   CHECK (selling_price >= 0),
    CONSTRAINT ck_mrp_positive     CHECK (mrp >= 0)
);

CREATE INDEX idx_products_shop     ON products(shop_id);
CREATE INDEX idx_products_category ON products(category_id)  WHERE category_id IS NOT NULL;
CREATE INDEX idx_products_barcode  ON products(shop_id, barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);  -- fuzzy search
COMMENT ON COLUMN products.hsn_code IS 'Harmonised System Nomenclature code, mandatory on B2B GST invoices.';

-- Product variants (size, colour, flavour, etc.)
CREATE TABLE product_variants (
    id              UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID           NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    shop_id         UUID           NOT NULL REFERENCES shops(id)    ON DELETE CASCADE,
    name            TEXT           NOT NULL,              -- e.g. "500ml", "Red / L"
    sku             TEXT,
    barcode         TEXT,
    selling_price   NUMERIC(12,2)  NOT NULL,
    mrp             NUMERIC(12,2)  NOT NULL,
    cost_price      NUMERIC(12,2),
    images          TEXT[]         NOT NULL DEFAULT '{}',
    is_active       BOOLEAN        NOT NULL DEFAULT TRUE,
    sort_order      INTEGER        NOT NULL DEFAULT 0,
    metadata        JSONB          NOT NULL DEFAULT '{}', -- {"attributes": {"size":"L","colour":"red"}}
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_shop    ON product_variants(shop_id);


-- =============================================================================
-- 5. INVENTORY LEDGER  (append-only, single source of truth for stock)
-- =============================================================================

CREATE TABLE inventory (
    id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID               NOT NULL REFERENCES shops(id)              ON DELETE CASCADE,
    location_id     UUID               REFERENCES shop_locations(id)              ON DELETE SET NULL,
    product_id      UUID               NOT NULL REFERENCES products(id)           ON DELETE CASCADE,
    variant_id      UUID               REFERENCES product_variants(id)            ON DELETE CASCADE,
    -- Running balance — maintained via trigger, never updated manually
    quantity        NUMERIC(12,3)      NOT NULL DEFAULT 0,
    reserved        NUMERIC(12,3)      NOT NULL DEFAULT 0,  -- held for pending orders
    reorder_point   NUMERIC(12,3)      NOT NULL DEFAULT 5,
    updated_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

    UNIQUE (shop_id, location_id, product_id, variant_id),
    CONSTRAINT ck_quantity_positive CHECK (quantity >= 0),
    CONSTRAINT ck_reserved_lte_qty CHECK (reserved <= quantity)
);

CREATE INDEX idx_inventory_shop    ON inventory(shop_id);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_low_stock ON inventory(shop_id)
    WHERE quantity <= reorder_point;  -- partial index — fast low-stock query


-- Append-only ledger — every stock movement recorded here
CREATE TABLE inventory_ledger (
    id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID               NOT NULL REFERENCES shops(id)              ON DELETE CASCADE,
    location_id     UUID               REFERENCES shop_locations(id)             ON DELETE SET NULL,
    product_id      UUID               NOT NULL REFERENCES products(id)           ON DELETE CASCADE,
    variant_id      UUID               REFERENCES product_variants(id)            ON DELETE CASCADE,
    entry_type      ledger_entry_type  NOT NULL,
    delta           NUMERIC(12,3)      NOT NULL,           -- positive = in, negative = out
    quantity_after  NUMERIC(12,3)      NOT NULL,           -- running total at time of entry
    reference_type  TEXT,                                  -- 'order', 'purchase', 'adjustment', etc.
    reference_id    UUID,                                  -- FK to order_id, purchase_id, etc.
    batch_no        TEXT,                                  -- Phase 3.2
    expiry_date     DATE,                                  -- Phase 3.2
    notes           TEXT,
    created_by      UUID               REFERENCES shop_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW()
    -- No updated_at — this is immutable
);

CREATE INDEX idx_inv_ledger_shop    ON inventory_ledger(shop_id, created_at DESC);
CREATE INDEX idx_inv_ledger_product ON inventory_ledger(product_id, created_at DESC);
CREATE INDEX idx_inv_ledger_ref     ON inventory_ledger(reference_type, reference_id) WHERE reference_id IS NOT NULL;
COMMENT ON TABLE inventory_ledger IS 'Immutable. Every stock movement is a new row. inventory.quantity is derived from this.';


-- =============================================================================
-- 6. CUSTOMERS  (Phase 2.1 CRM)
-- =============================================================================

CREATE TABLE customers (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    auth_user_id    UUID,                                  -- if customer has an account
    name            TEXT        NOT NULL,
    phone           TEXT,
    email           TEXT,
    gstin           TEXT,                                  -- for B2B GST billing
    -- Aggregates (maintained via triggers for performance)
    total_orders    INTEGER     NOT NULL DEFAULT 0,
    total_spent     NUMERIC(14,2) NOT NULL DEFAULT 0,
    outstanding_credit NUMERIC(14,2) NOT NULL DEFAULT 0,  -- Khata balance
    metadata        JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_shop    ON customers(shop_id);
CREATE INDEX idx_customers_phone   ON customers(shop_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_email   ON customers(shop_id, email) WHERE email IS NOT NULL;

CREATE TABLE customer_addresses (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID         NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    shop_id         UUID         NOT NULL REFERENCES shops(id)     ON DELETE CASCADE,
    type            address_type NOT NULL DEFAULT 'shipping',
    name            TEXT,
    phone           TEXT,
    address_line1   TEXT         NOT NULL,
    address_line2   TEXT,
    city            TEXT         NOT NULL,
    state           TEXT         NOT NULL,
    pincode         TEXT         NOT NULL,
    country         TEXT         NOT NULL DEFAULT 'IN',
    is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cust_addr_customer ON customer_addresses(customer_id);


-- =============================================================================
-- 7. ORDERS
-- =============================================================================

CREATE TABLE orders (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID            NOT NULL REFERENCES shops(id)        ON DELETE CASCADE,
    location_id     UUID            REFERENCES shop_locations(id)        ON DELETE SET NULL,
    customer_id     UUID            REFERENCES customers(id)             ON DELETE SET NULL,
    channel         order_channel   NOT NULL DEFAULT 'online',
    status          order_status    NOT NULL DEFAULT 'pending',
    -- Amounts (all in INR paisa stored as decimal — 2dp)
    subtotal        NUMERIC(14,2)   NOT NULL DEFAULT 0,   -- before discount & tax
    discount_amount NUMERIC(14,2)   NOT NULL DEFAULT 0,
    taxable_amount  NUMERIC(14,2)   NOT NULL DEFAULT 0,   -- subtotal - discount
    cgst_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,
    sgst_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,
    igst_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,   -- interstate
    total_amount    NUMERIC(14,2)   NOT NULL DEFAULT 0,   -- what customer pays
    paid_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,
    payment_status  payment_status  NOT NULL DEFAULT 'pending',
    -- Shipping
    shipping_address JSONB,                               -- snapshot at order time
    delivery_status  delivery_status NOT NULL DEFAULT 'not_required',
    tracking_number  TEXT,
    expected_delivery_at TIMESTAMPTZ,
    -- Coupon
    coupon_id       UUID,                                 -- FK added after coupons table
    coupon_code     TEXT,
    -- Staff
    created_by      UUID            REFERENCES shop_users(id)            ON DELETE SET NULL,
    notes           TEXT,
    metadata        JSONB           NOT NULL DEFAULT '{}', -- e.g. {'whatsapp_msg_id': '...'}
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_shop        ON orders(shop_id, created_at DESC);
CREATE INDEX idx_orders_customer    ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX idx_orders_status      ON orders(shop_id, status);
CREATE INDEX idx_orders_payment     ON orders(shop_id, payment_status);
CREATE INDEX idx_orders_channel     ON orders(shop_id, channel);
-- Date range queries (daily summary, GST reports)
CREATE INDEX idx_orders_date        ON orders(shop_id, ((created_at AT TIME ZONE 'UTC')::DATE));


CREATE TABLE order_items (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID            NOT NULL REFERENCES orders(id)       ON DELETE CASCADE,
    shop_id         UUID            NOT NULL REFERENCES shops(id)        ON DELETE CASCADE,
    product_id      UUID            NOT NULL REFERENCES products(id)     ON DELETE RESTRICT,
    variant_id      UUID            REFERENCES product_variants(id)      ON DELETE RESTRICT,
    -- Snapshot values at time of sale (prices can change; invoice must reflect point-in-time)
    product_name    TEXT            NOT NULL,
    variant_name    TEXT,
    sku             TEXT,
    hsn_code        TEXT,
    unit            TEXT            NOT NULL DEFAULT 'pcs',
    quantity        NUMERIC(12,3)   NOT NULL,
    unit_price      NUMERIC(12,2)   NOT NULL,             -- selling price at time of sale
    mrp             NUMERIC(12,2)   NOT NULL,
    cost_price      NUMERIC(12,2),
    discount_amount NUMERIC(12,2)   NOT NULL DEFAULT 0,
    taxable_amount  NUMERIC(12,2)   NOT NULL DEFAULT 0,
    gst_rate        gst_rate        NOT NULL DEFAULT '18',
    cgst_amount     NUMERIC(12,2)   NOT NULL DEFAULT 0,
    sgst_amount     NUMERIC(12,2)   NOT NULL DEFAULT 0,
    igst_amount     NUMERIC(12,2)   NOT NULL DEFAULT 0,
    line_total      NUMERIC(12,2)   NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);


-- =============================================================================
-- 8. PAYMENTS
-- =============================================================================

CREATE TABLE payments (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id             UUID            NOT NULL REFERENCES shops(id)    ON DELETE CASCADE,
    order_id            UUID            NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    method              payment_method  NOT NULL,
    amount              NUMERIC(14,2)   NOT NULL,
    currency            TEXT            NOT NULL DEFAULT 'INR',
    status              payment_status  NOT NULL DEFAULT 'pending',
    -- Gateway fields
    gateway             TEXT,                             -- 'razorpay', 'cashfree', 'manual'
    gateway_payment_id  TEXT,                             -- Razorpay payment_id
    gateway_order_id    TEXT,                             -- Razorpay order_id
    gateway_signature   TEXT,
    gateway_response    JSONB,                            -- raw webhook payload
    -- Idempotency
    idempotency_key     TEXT            UNIQUE,           -- prevent duplicate webhook processing
    paid_at             TIMESTAMPTZ,
    refunded_at         TIMESTAMPTZ,
    refund_amount       NUMERIC(14,2)   NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order   ON payments(order_id);
CREATE INDEX idx_payments_shop    ON payments(shop_id, created_at DESC);
CREATE INDEX idx_payments_gateway ON payments(gateway_payment_id) WHERE gateway_payment_id IS NOT NULL;


-- =============================================================================
-- 9. INVOICES
-- =============================================================================

-- Auto-incrementing invoice number per shop (not global)
CREATE SEQUENCE invoice_number_seq START 1 INCREMENT 1;  -- global fallback

CREATE TABLE invoices (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID            NOT NULL REFERENCES shops(id)    ON DELETE CASCADE,
    order_id        UUID            NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    invoice_number  TEXT            NOT NULL,              -- shop-specific: 'INV-2024-00001'
    invoice_type    invoice_type    NOT NULL DEFAULT 'sale',
    invoice_date    DATE            NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    -- Amounts (mirror of order, snapshot)
    subtotal        NUMERIC(14,2)   NOT NULL,
    discount_amount NUMERIC(14,2)   NOT NULL DEFAULT 0,
    cgst_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,
    sgst_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,
    igst_amount     NUMERIC(14,2)   NOT NULL DEFAULT 0,
    total_amount    NUMERIC(14,2)   NOT NULL,
    -- Billing party snapshot (so invoice remains valid even if customer changes)
    buyer_name      TEXT,
    buyer_gstin     TEXT,
    buyer_address   JSONB,
    seller_snapshot JSONB   NOT NULL,                     -- shop name, GSTIN, address at invoice time
    pdf_url         TEXT,                                 -- generated and stored in object storage
    is_cancelled    BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (shop_id, invoice_number)
);

CREATE INDEX idx_invoices_shop    ON invoices(shop_id, invoice_date DESC);
CREATE INDEX idx_invoices_order   ON invoices(order_id);
COMMENT ON COLUMN invoices.seller_snapshot IS 'Point-in-time copy of shop GST details. Ensures invoice remains legally valid even after shop edits.';


-- Per-shop invoice counter (atomic, no gaps)
CREATE TABLE invoice_counters (
    shop_id         UUID    PRIMARY KEY REFERENCES shops(id) ON DELETE CASCADE,
    prefix          TEXT    NOT NULL DEFAULT 'INV',
    last_number     INTEGER NOT NULL DEFAULT 0,
    fiscal_year     TEXT    NOT NULL DEFAULT '2024-25'       -- reset per FY
);
COMMENT ON TABLE invoice_counters IS 'Use SELECT ... FOR UPDATE to atomically claim the next invoice number.';


-- =============================================================================
-- 10. KHATA — CREDIT LEDGER  (Phase 2.2 — highest retention feature)
-- =============================================================================

CREATE TABLE credit_ledger (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID                NOT NULL REFERENCES shops(id)       ON DELETE CASCADE,
    customer_id     UUID                NOT NULL REFERENCES customers(id)   ON DELETE CASCADE,
    txn_type        credit_txn_type     NOT NULL,
    amount          NUMERIC(14,2)       NOT NULL,           -- always positive; direction = txn_type
    balance_after   NUMERIC(14,2)       NOT NULL,           -- running total outstanding
    order_id        UUID                REFERENCES orders(id) ON DELETE SET NULL,
    payment_id      UUID                REFERENCES payments(id) ON DELETE SET NULL,
    notes           TEXT,
    recorded_by     UUID                REFERENCES shop_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
    -- Immutable — no updated_at
);

CREATE INDEX idx_credit_shop       ON credit_ledger(shop_id, created_at DESC);
CREATE INDEX idx_credit_customer   ON credit_ledger(customer_id, created_at DESC);
COMMENT ON TABLE credit_ledger IS 'Append-only Khata. outstanding_credit on customers is a cached sum of this.';


-- =============================================================================
-- 11. COUPONS & DISCOUNTS  (Phase 2.3)
-- =============================================================================

CREATE TABLE coupons (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID            NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    code            TEXT            NOT NULL,
    description     TEXT,
    scope           coupon_scope    NOT NULL DEFAULT 'order',
    discount_type   discount_type   NOT NULL DEFAULT 'percent',
    discount_value  NUMERIC(10,2)   NOT NULL,
    max_discount    NUMERIC(10,2),                         -- cap on percent discounts
    min_order_value NUMERIC(10,2)   NOT NULL DEFAULT 0,
    usage_limit     INTEGER,                               -- NULL = unlimited
    usage_count     INTEGER         NOT NULL DEFAULT 0,
    per_user_limit  INTEGER         NOT NULL DEFAULT 1,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    starts_at       TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_by      UUID            REFERENCES shop_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (shop_id, code)
);

CREATE INDEX idx_coupons_shop   ON coupons(shop_id, is_active);

-- Add FK now that coupons table exists
ALTER TABLE orders ADD CONSTRAINT fk_orders_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL;


-- =============================================================================
-- 12. EXPENSES  (Phase 2.9)
-- =============================================================================

CREATE TABLE expenses (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID                NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    location_id     UUID                REFERENCES shop_locations(id) ON DELETE SET NULL,
    category        expense_category    NOT NULL DEFAULT 'other',
    amount          NUMERIC(14,2)       NOT NULL,
    expense_date    DATE                NOT NULL DEFAULT CURRENT_DATE,
    description     TEXT,
    vendor_name     TEXT,
    receipt_url     TEXT,
    recorded_by     UUID                REFERENCES shop_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_expense_amount CHECK (amount > 0)
);

CREATE INDEX idx_expenses_shop  ON expenses(shop_id, expense_date DESC);
CREATE INDEX idx_expenses_cat   ON expenses(shop_id, category);


-- =============================================================================
-- 13. STAFF — ATTENDANCE & COMMISSION  (Phase 3.8)
-- =============================================================================

CREATE TABLE staff_attendance (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id)       ON DELETE CASCADE,
    shop_user_id    UUID        NOT NULL REFERENCES shop_users(id)  ON DELETE CASCADE,
    date            DATE        NOT NULL,
    check_in        TIMESTAMPTZ,
    check_out       TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (shop_user_id, date)
);

CREATE TABLE staff_commissions (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id)       ON DELETE CASCADE,
    shop_user_id    UUID        NOT NULL REFERENCES shop_users(id)  ON DELETE CASCADE,
    order_id        UUID        NOT NULL REFERENCES orders(id)      ON DELETE CASCADE,
    rate_percent    NUMERIC(5,2) NOT NULL,
    commission_amt  NUMERIC(12,2) NOT NULL,
    is_paid         BOOLEAN     NOT NULL DEFAULT FALSE,
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commission_user  ON staff_commissions(shop_user_id, is_paid);


-- =============================================================================
-- 14. MARKETING — CAMPAIGNS  (Phase 3.4)
-- =============================================================================

CREATE TABLE campaigns (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID                NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name            TEXT                NOT NULL,
    channel         campaign_channel    NOT NULL,
    template        TEXT,
    target_segment  JSONB,              -- filter criteria: {"min_spent": 500, "last_order_before": "2024-01-01"}
    scheduled_at    TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    recipient_count INTEGER             NOT NULL DEFAULT 0,
    open_count      INTEGER             NOT NULL DEFAULT 0,
    click_count     INTEGER             NOT NULL DEFAULT 0,
    created_by      UUID                REFERENCES shop_users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 15. PRODUCT REVIEWS  (Phase 2.8)
-- =============================================================================

CREATE TABLE product_reviews (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id)      ON DELETE CASCADE,
    product_id      UUID        NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
    customer_id     UUID        REFERENCES customers(id)           ON DELETE SET NULL,
    order_item_id   UUID        REFERENCES order_items(id)         ON DELETE SET NULL,
    rating          SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title           TEXT,
    body            TEXT,
    images          TEXT[]      NOT NULL DEFAULT '{}',
    is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,            -- bought = verified
    is_published    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id, is_published);
CREATE INDEX idx_reviews_shop    ON product_reviews(shop_id);


-- =============================================================================
-- 16. LOYALTY POINTS  (Phase 3.5)
-- =============================================================================

CREATE TABLE loyalty_rules (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id) ON DELETE CASCADE UNIQUE,
    points_per_rupee NUMERIC(6,3) NOT NULL DEFAULT 1,      -- 1 point per ₹1
    rupee_per_point  NUMERIC(6,3) NOT NULL DEFAULT 0.25,   -- ₹0.25 per point at redemption
    min_redeem      INTEGER     NOT NULL DEFAULT 100,       -- minimum points to redeem
    expiry_days     INTEGER,                                -- NULL = no expiry
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_ledger (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id)       ON DELETE CASCADE,
    customer_id     UUID        NOT NULL REFERENCES customers(id)   ON DELETE CASCADE,
    order_id        UUID        REFERENCES orders(id)               ON DELETE SET NULL,
    delta           INTEGER     NOT NULL,                           -- positive = earn, negative = redeem
    balance_after   INTEGER     NOT NULL,
    expires_at      TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_customer ON loyalty_ledger(customer_id, created_at DESC);


-- =============================================================================
-- 17. NOTIFICATIONS — ABANDONED CART  (Phase 2.5)
-- =============================================================================

CREATE TABLE carts (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID        NOT NULL REFERENCES shops(id)       ON DELETE CASCADE,
    customer_id     UUID        REFERENCES customers(id)            ON DELETE SET NULL,
    session_id      TEXT,                                           -- anonymous visitor
    items           JSONB       NOT NULL DEFAULT '[]',              -- [{product_id, variant_id, qty, price}]
    coupon_id       UUID        REFERENCES coupons(id)             ON DELETE SET NULL,
    recovery_sent_at TIMESTAMPTZ,
    converted_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_carts_shop      ON carts(shop_id, updated_at DESC);
CREATE INDEX idx_carts_customer  ON carts(customer_id) WHERE customer_id IS NOT NULL;
-- Find carts to chase (not converted, not already messaged, stale > 1h)
CREATE INDEX idx_carts_abandoned ON carts(shop_id, updated_at)
    WHERE converted_at IS NULL AND recovery_sent_at IS NULL;


-- =============================================================================
-- 18. AUDIT LOG  (cross-cutting — every important mutation)
-- =============================================================================

CREATE TABLE audit_log (
    id              BIGSERIAL   PRIMARY KEY,                        -- integer for speed
    shop_id         UUID        REFERENCES shops(id) ON DELETE CASCADE,
    actor_id        UUID        REFERENCES shop_users(id) ON DELETE SET NULL,
    entity_type     TEXT        NOT NULL,                           -- 'order', 'product', 'inventory', etc.
    entity_id       UUID        NOT NULL,
    action          TEXT        NOT NULL,                           -- 'created', 'updated', 'deleted', 'refunded'
    old_data        JSONB,
    new_data        JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioning audit_log by month is recommended once volume grows
CREATE INDEX idx_audit_shop    ON audit_log(shop_id, created_at DESC);
CREATE INDEX idx_audit_entity  ON audit_log(entity_type, entity_id, created_at DESC);


-- =============================================================================
-- UTILITY TRIGGERS
-- =============================================================================

-- updated_at auto-maintenance
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply to every table with updated_at
DO $$
DECLARE t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'organizations','shops','shop_locations','shop_users',
        'categories','products','product_variants',
        'customers','orders','payments','coupons',
        'expenses','campaigns'
    ] LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;


-- Inventory: update running balance when ledger entry is inserted
CREATE OR REPLACE FUNCTION sync_inventory_from_ledger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO inventory (shop_id, location_id, product_id, variant_id, quantity, updated_at)
    VALUES (NEW.shop_id, NEW.location_id, NEW.product_id, NEW.variant_id, NEW.quantity_after, NOW())
    ON CONFLICT (shop_id, location_id, product_id, variant_id)
    DO UPDATE SET
        quantity   = NEW.quantity_after,
        updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inventory_ledger_sync
AFTER INSERT ON inventory_ledger
FOR EACH ROW EXECUTE FUNCTION sync_inventory_from_ledger();


-- Credit ledger: keep customers.outstanding_credit in sync
CREATE OR REPLACE FUNCTION sync_customer_credit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    UPDATE customers
    SET    outstanding_credit = NEW.balance_after,
           updated_at         = NOW()
    WHERE  id = NEW.customer_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_ledger_sync
AFTER INSERT ON credit_ledger
FOR EACH ROW EXECUTE FUNCTION sync_customer_credit();


-- Customer aggregate: update total_orders + total_spent when order is delivered
CREATE OR REPLACE FUNCTION update_customer_aggregates()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.status = 'delivered' AND (OLD.status IS DISTINCT FROM 'delivered') THEN
        UPDATE customers
        SET    total_orders = total_orders + 1,
               total_spent  = total_spent + NEW.total_amount,
               updated_at   = NOW()
        WHERE  id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_customer_aggregate
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_customer_aggregates();


-- =============================================================================
-- ROW LEVEL SECURITY  (Supabase — enable per table, policy per role)
-- =============================================================================

ALTER TABLE shops             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_ledger  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger     ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- Example policy: shop members can only see their own shop's data
-- Replace with your actual auth.uid() Supabase pattern
CREATE POLICY shop_members_only ON orders
    USING (
        shop_id IN (
            SELECT shop_id FROM shop_users
            WHERE auth_user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Service-role (backend functions) bypass RLS — handled by Supabase automatically


-- =============================================================================
-- HELPFUL VIEWS
-- =============================================================================

-- Daily sales summary per shop (feeds dashboard widget)
CREATE VIEW v_daily_sales AS
SELECT
    o.shop_id,
    o.created_at::DATE          AS sale_date,
    COUNT(*)                    AS order_count,
    SUM(o.total_amount)         AS gross_revenue,
    SUM(o.discount_amount)      AS total_discount,
    SUM(o.cgst_amount + o.sgst_amount + o.igst_amount) AS total_tax,
    SUM(o.total_amount - o.cgst_amount - o.sgst_amount - o.igst_amount) AS net_revenue
FROM   orders o
WHERE  o.status NOT IN ('cancelled','refunded')
GROUP  BY o.shop_id, o.created_at::DATE;

-- Top products by revenue
CREATE VIEW v_top_products AS
SELECT
    oi.shop_id,
    oi.product_id,
    oi.product_name,
    SUM(oi.quantity)    AS units_sold,
    SUM(oi.line_total)  AS revenue
FROM   order_items  oi
JOIN   orders        o  ON o.id = oi.order_id
WHERE  o.status NOT IN ('cancelled','refunded')
GROUP  BY oi.shop_id, oi.product_id, oi.product_name;

-- Low stock alert view
CREATE VIEW v_low_stock AS
SELECT
    i.shop_id,
    i.location_id,
    i.product_id,
    p.name      AS product_name,
    p.sku,
    i.quantity  AS current_stock,
    i.reorder_point,
    (i.reorder_point - i.quantity) AS units_to_reorder
FROM  inventory i
JOIN  products  p ON p.id = i.product_id
WHERE i.quantity <= i.reorder_point
  AND p.track_inventory = TRUE
  AND p.status = 'active';

-- GST summary for filing (GSTR-1 input)
CREATE VIEW v_gst_summary AS
SELECT
    o.shop_id,
    DATE_TRUNC('month', o.created_at)   AS month,
    oi.gst_rate,
    SUM(oi.taxable_amount)              AS taxable_value,
    SUM(oi.cgst_amount)                 AS cgst,
    SUM(oi.sgst_amount)                 AS sgst,
    SUM(oi.igst_amount)                 AS igst,
    SUM(oi.cgst_amount + oi.sgst_amount + oi.igst_amount) AS total_tax
FROM   order_items oi
JOIN   orders      o  ON o.id = oi.order_id
WHERE  o.status NOT IN ('cancelled','refunded')
GROUP  BY o.shop_id, DATE_TRUNC('month', o.created_at), oi.gst_rate
ORDER  BY month, oi.gst_rate;


-- =============================================================================
-- SEED: DEFAULT DATA
-- =============================================================================

-- Default coupon type examples (not inserted, documented for reference)
-- WELCOME10  → percent, 10%, order scope, first-use only
-- FLAT50     → flat ₹50 off, min order ₹299
-- FREESHIP   → flat ₹0 shipping override (handled in app logic)


-- =============================================================================
-- END OF SCHEMA
-- Phase 1 tables: organizations(scaffold), shops, shop_locations, shop_users,
--   permissions, categories, products, product_variants,
--   inventory, inventory_ledger, orders, order_items,
--   payments, invoices, invoice_counters
-- Phase 2 tables: customers, customer_addresses, credit_ledger, coupons,
--   expenses, carts, product_reviews
-- Phase 3 tables: staff_attendance, staff_commissions, campaigns,
--   loyalty_rules, loyalty_ledger
-- Phase 4 scaffolds: organizations (already present), franchise via org_id
-- =============================================================================