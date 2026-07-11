# Product Roadmap: Local Shop Platform
### Prioritized Feature List with Effort Estimates

**Effort scale** (rough, for a small team of 1-3 developers):
**S** = 1–3 days · **M** = 4–8 days · **L** = 2–4 weeks · **XL** = 4+ weeks

---

## Phase 1 — MVP (Launch)
*Goal: a shop owner can set up a storefront, sell online AND offline, and get a proper invoice. This is the minimum that beats both Dukaan and Vyapar individually.*

| # | Feature | Effort | Depends on | Notes |
|---|---|---|---|---|
| 1.1 | Shop signup + dashboard shell + auth | M | — | Core `shops`, `shop_users` tables |
| 1.2 | Product catalog CRUD (add/edit/delete, images, categories) | M | 1.1 | |
| 1.3 | Storefront rendering (template + theme colors/logo) | L | 1.2 | Start with 2–3 fixed templates, not a full page builder |
| 1.4 | Subdomain hosting (`shop.yoursite.com`) | S | 1.3 | |
| 1.5 | Custom domain connection (CNAME) | M | 1.4 | Needs DNS verification flow |
| 1.6 | Unified inventory (online + POS shared stock) | L | 1.2 | The atomic decrement + ledger pattern — get this right, everything depends on it |
| 1.7 | POS billing screen | M | 1.6 | Counter sale UI, works on tablet/laptop |
| 1.8 | Online cart + checkout | M | 1.6 | |
| 1.9 | Payment gateway integration (Razorpay/Cashfree — UPI, card, COD) | M | 1.8 | Webhook handling, idempotency |
| 1.10 | GST-compliant invoice generation (PDF, auto-numbered) | M | 1.7, 1.9 | Shared by POS and online orders |
| 1.11 | Order management (accept/fulfil/cancel) | S | 1.9 | |
| 1.12 | Low-stock alerts | S | 1.6 | |
| 1.13 | Basic dashboard analytics (sales, top products, views) | S | 1.11 | |

**Phase 1 total: roughly 10–14 weeks for a small team.** This is your fundraising/launch-ready product.

---

## Phase 2 — Growth & Retention
*Goal: give shop owners reasons to stay instead of switching to a competitor after month 2.*

| # | Feature | Effort | Depends on | Notes |
|---|---|---|---|---|
| 2.1 | Customer CRM (purchase history, phone capture) | M | 1.11 | |
| 2.2 | **Khata / credit ledger** (buy-now-pay-later tracking) | M | 2.1 | High-retention feature for Indian local retail — recommend prioritizing this early in Phase 2 |
| 2.3 | Coupons & discounts | M | 1.8 | |
| 2.4 | WhatsApp/SMS order notifications | M | 1.11 | Needs WhatsApp Business API or SMS gateway account |
| 2.5 | Abandoned cart recovery | S | 2.4 | |
| 2.6 | Multi-staff logins with roles | M | 1.1 | Owner / cashier / manager permission levels |
| 2.7 | Delivery partner integration or local-delivery-radius setting | L | 1.11 | Shiprocket/Delhivery API, or simple manual radius rule |
| 2.8 | Product reviews & ratings | S | 1.3 | |
| 2.9 | Expense tracking | M | 1.1 | Turns dashboard into lightweight accounting tool |

**Phase 2 total: roughly 8–10 weeks.**

---

## Phase 3 — Scale & Stickiness
*Goal: features that make switching away genuinely costly — deep operational lock-in.*

| # | Feature | Effort | Depends on | Notes |
|---|---|---|---|---|
| 3.1 | Multi-location inventory | L | 1.6 | Needs `location_id` (already scaffolded in schema) |
| 3.2 | Barcode / batch / expiry tracking | M | 1.6 | Important for grocery/pharmacy verticals |
| 3.3 | Advanced reports (margins, staff-wise sales, GST summary) | M | 1.13, 2.9 | |
| 3.4 | Bulk marketing campaigns (WhatsApp/SMS/email blast) | M | 2.1 | |
| 3.5 | Loyalty points / repeat-customer rewards | M | 2.1 | |
| 3.6 | GST return prep / e-way bill generation | XL | 1.10 | Complex compliance logic — consider partnering with an existing GST API provider instead of building in-house |
| 3.7 | Accounting export (Tally/Excel) | S | 1.10, 2.9 | |
| 3.8 | Staff attendance & commission tracking | M | 2.6 | |
| 3.9 | QR-code table/counter ordering | M | 1.8 | Strong fit for cafes/restaurants sub-vertical |

**Phase 3 total: roughly 12–16 weeks**, though 3.6 alone can eat a third of that — sequence it last or outsource via API partner.

---

## Phase 4 — Advanced / Competitive Moat
*Goal: differentiation once core product-market fit is proven. Don't start these until Phases 1–3 are stable and adopted.*

| # | Feature | Effort | Notes |
|---|---|---|---|
| 4.1 | AI demand forecasting / reorder suggestions | L | Needs sufficient sales history data to be useful — not viable until you have real usage volume |
| 4.2 | Personalized product recommendations | M | |
| 4.3 | WhatsApp catalog / Instagram shop sync | L | API access + approval processes add lead time |
| 4.4 | Marketplace sync (Amazon/Flipkart/Meesho, shared inventory) | XL | Each marketplace is its own integration project |
| 4.5 | Subscription / recurring orders | M | Milk, water, medicine refill use cases |
| 4.6 | Franchise mode (one login, multiple shop storefronts) | L | Schema-level: needs an `org_id` layer above `shop_id` |
| 4.7 | Public API / integrations (Zapier-style) | L | |
| 4.8 | Lending/credit line partnership | XL | Business/legal partnership work, not just engineering |

---

## Suggested Sequencing Logic

1. **Ship 1.1 → 1.13 as one connected release** — a shop owner needs all of these together to actually replace their current setup (a website builder *and* a billing app). Shipping half of it isn't a usable product.
2. **2.2 (khata/credit) before other Phase 2 items** — it's the single feature most likely to make an Indian local shop owner switch and stay, based on how central credit-based selling is to local retail.
3. **Defer 3.6 (GST/e-way compliance)** as long as possible, or integrate a third-party compliance API rather than building it — it's disproportionately expensive for the retention value versus 2.2 or 3.1.
4. **Don't start Phase 4** until you have paying shops actively using Phase 1–2 daily — several of these (4.1, 4.4) need real usage data or partnership lead time to even be buildable well.

---

## What this means for the database

All of Phase 2–4 above plugs into the schema already designed (`shops`, `products`, `inventory`, `orders`, `invoices`) by adding new tables that reference `shop_id` / `product_id` / `customer_id` — for example:
- 2.2 Khata → a `credit_ledger` table, same append-only pattern as `inventory_ledger`
- 2.6 Roles → extend `shop_users.role` + a `permissions` table
- 3.1 Multi-location → activate the `location_id` column already present in `inventory`
- 4.6 Franchise → add an `organizations` table one level above `shops`

Nothing here requires reshaping the Phase 1 core — which is exactly why it's safe to build Phase 1 now without waiting to "design everything first."

Phase 1 (0 – ~50K shops): single Postgres cluster


One primary + 2-3 read replicas.
Storefront reads go to replicas; dashboard/POS writes go to primary.
This alone comfortably handles low hundreds of thousands of shops if indexed well — don't over-engineer early.


Phase 2 (~50K – 500K shops): read scaling + caching


Add Redis in front of the storefront for: rendered product catalog pages, shop theme config, session/cart data. TTL a few minutes, invalidate on product update.
Add Elasticsearch/Meilisearch for product search — Postgres full-text search struggles once you have millions of products across tenants; a dedicated search index keeps this fast and offloads load from Postgres entirely.
Serve all product images via CDN + object storage (S3-compatible), never from the app server.


Phase 3 (500K+ shops / very large tenants): sharding


Shard Postgres by shop_id hash (e.g., Citus, or manual shard routing at the app layer) — since every query is already naturally scoped to one shop, this is a clean shard key with no cross-shard joins needed for 95% of queries.
Keep a small global/control-plane database (shops directory, domain routing, billing/plan info) separate from the sharded tenant-data cluster — this table is tiny and needs to be looked up on every request to route to the right shard.
Move to an event-driven pipeline (Kafka/SQS) for order → inventory → invoice → notification, so a spike in orders (festival sale) doesn't block the checkout API waiting on invoice PDF generation or SMS/WhatsApp sends — those become async consumers.



7. Caching Strategy Summary

DataCacheTTL / InvalidationStorefront product listingRedis / CDN edgeInvalidate on product update; TTL 5 min fallbackShop theme/configRedisInvalidate on dashboard saveProduct imagesCDNLong TTL, versioned URLsSearch resultsElasticsearch (already fast)Re-index on product change (async)Cart/sessionRedisSession-length TTLInventory countNot cached — always read from PostgresCorrectness > speed here

Inventory is the one place you deliberately don't cache aggressively — overselling a physical product is a worse failure than a slightly slower page load.


8. Reliability & Consistency Choices


Strong consistency (ACID, Postgres transactions) for: inventory, orders, payments, invoices. These must never be "eventually correct" — a shop owner cannot tolerate double-selling stock or a missing invoice.
Eventual consistency acceptable for: search index freshness, analytics dashboards, "recently viewed," recommendation data.
Idempotency keys on all write APIs that touch money or stock (order creation, payment webhook handling) — payment gateways will retry webhooks; your handler must be safe to receive the same event twice.
Payment webhook handling: treat gateway webhooks as the source of truth for payment status, not the client-side "success" callback (that can be spoofed or lost). Verify signatures.



9. Security & Tenant Isolation


Postgres Row-Level Security policy on every tenant table: USING (shop_id = current_setting('app.current_shop_id')::bigint) — even if application code has a bug, the database itself refuses cross-tenant reads.
Rate-limit and authenticate the dashboard/POS APIs per shop; storefront APIs are public but rate-limited per IP to prevent scraping/abuse.
Custom domain → shop routing table cached at the edge/CDN layer so domain lookups don't hit the database on every request.



10. Suggested Tech Stack

LayerChoiceWhyPrimary DBPostgreSQL (managed: RDS/Cloud SQL/Supabase)ACID, JSONB flexibility for theme config, mature sharding tools (Citus)CacheRedisIndustry standard, simple TTL + pub/sub for cache invalidationSearchMeilisearch (simpler) or Elasticsearch (more scale)Fast typo-tolerant product searchObject storageS3-compatible + CDN (Cloudflare/CloudFront)Cheap, scales infinitely for imagesQueueSQS (simple) or Kafka (high throughput)Decouple order → invoice → notificationApp layerNode.js/NestJS or Django/FastAPI, containerizedHorizontal scaling behind load balancer


11. Build Order (don't build Phase 3 on day one)


MVP: single Postgres, shared schema + shop_id, basic Redis cache, storefront + dashboard + POS on the schema above. This alone can handle tens of thousands of shops.
Add: read replicas, CDN for images, search index — once storefront traffic actually needs it.
Add: sharding, event-driven pipeline — only once a single Postgres primary is measurably the bottleneck (you'll see it in write latency/connection saturation, not before).


Over-building sharding and microservices before you have the user base to need them is the single most common way small teams waste 6+ months. The schema above is designed so that migration path exists without a rewrite — that's the important part to get right early.