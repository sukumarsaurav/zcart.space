// ─────────────────────────────────────────────────────────────────
// Supabase Database Types — Generated from schema
// ─────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'manager' | 'cashier' | 'viewer'
export type ShopPlan = 'free' | 'starter' | 'pro' | 'enterprise'
export type ProductStatus = 'active' | 'archived' | 'draft'
export type OrderChannel = 'online' | 'pos' | 'whatsapp' | 'marketplace'
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'failed' | 'refunded'
export type PaymentMethod = 'upi' | 'card' | 'cash' | 'cod' | 'bank_transfer' | 'credit_ledger' | 'wallet'
export type InvoiceType = 'sale' | 'return' | 'proforma'
export type LedgerEntryType = 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer'
export type CreditTxnType = 'credit' | 'payment' | 'adjustment'
export type DeliveryStatus =
  | 'not_required'
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'failed'
export type DiscountType = 'flat' | 'percent'
export type CouponScope = 'order' | 'product' | 'category'
export type GstRate = '0' | '5' | '12' | '18' | '28'
export type AddressType = 'billing' | 'shipping' | 'shop'
export type ExpenseCategory =
  | 'rent'
  | 'salaries'
  | 'utilities'
  | 'supplies'
  | 'marketing'
  | 'maintenance'
  | 'taxes'
  | 'other'

// ─────────────────────────────────────────────────────────────────
// Row Types
// ─────────────────────────────────────────────────────────────────

export interface Shop {
  id: string
  org_id: string | null
  name: string
  slug: string
  custom_domain: string | null
  domain_verified: boolean
  phone: string | null
  email: string | null
  gstin: string | null
  pan: string | null
  plan: ShopPlan
  plan_expires_at: string | null
  theme: ShopTheme
  logo_url: string | null
  banner_url: string | null
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ShopTheme {
  primary_color: string
  font: string
  template: 'default' | 'fashion' | 'toys'
  radius?: 'sharp' | 'rounded' | 'pill'
}

export interface ShopLocation {
  id: string
  shop_id: string
  name: string
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  pincode: string | null
  country: string
  lat: number | null
  lng: number | null
  is_primary: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShopUser {
  id: string
  shop_id: string
  auth_user_id: string
  role: UserRole
  display_name: string | null
  phone: string | null
  is_active: boolean
  invited_by: string | null
  joined_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  shop_id: string
  parent_id: string | null
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  shop_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  images: string[]
  sku: string | null
  barcode: string | null
  unit: string
  mrp: number
  selling_price: number
  cost_price: number | null
  hsn_code: string | null
  gst_rate: GstRate
  tax_inclusive: boolean
  track_inventory: boolean
  has_batch: boolean
  has_expiry: boolean
  is_featured: boolean
  status: ProductStatus
  metadata: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  shop_id: string
  name: string
  sku: string | null
  barcode: string | null
  selling_price: number
  mrp: number
  cost_price: number | null
  images: string[]
  is_active: boolean
  sort_order: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  shop_id: string
  location_id: string | null
  product_id: string
  variant_id: string | null
  quantity: number
  reserved: number
  reorder_point: number
  updated_at: string
}

export interface Customer {
  id: string
  shop_id: string
  auth_user_id: string | null
  name: string
  phone: string | null
  email: string | null
  gstin: string | null
  total_orders: number
  total_spent: number
  outstanding_credit: number
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Wishlist {
  id: string
  shop_id: string
  customer_id: string
  product_id: string
  created_at: string
}

export interface Order {
  id: string
  shop_id: string
  location_id: string | null
  customer_id: string | null
  channel: OrderChannel
  status: OrderStatus
  subtotal: number
  discount_amount: number
  taxable_amount: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_amount: number
  paid_amount: number
  payment_status: PaymentStatus
  shipping_address: Record<string, unknown> | null
  delivery_status: DeliveryStatus
  tracking_number: string | null
  expected_delivery_at: string | null
  coupon_id: string | null
  coupon_code: string | null
  created_by: string | null
  notes: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  shop_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  variant_name: string | null
  sku: string | null
  hsn_code: string | null
  unit: string
  quantity: number
  unit_price: number
  mrp: number
  cost_price: number | null
  discount_amount: number
  taxable_amount: number
  gst_rate: GstRate
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  line_total: number
  created_at: string
}

export interface Payment {
  id: string
  shop_id: string
  order_id: string
  method: PaymentMethod
  amount: number
  currency: string
  status: PaymentStatus
  gateway: string | null
  gateway_payment_id: string | null
  gateway_order_id: string | null
  gateway_signature: string | null
  gateway_response: Record<string, unknown> | null
  idempotency_key: string | null
  paid_at: string | null
  refunded_at: string | null
  refund_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  shop_id: string
  order_id: string
  invoice_number: string
  invoice_type: InvoiceType
  invoice_date: string
  due_date: string | null
  subtotal: number
  discount_amount: number
  cgst_amount: number
  sgst_amount: number
  igst_amount: number
  total_amount: number
  buyer_name: string | null
  buyer_gstin: string | null
  buyer_address: Record<string, unknown> | null
  seller_snapshot: Record<string, unknown>
  pdf_url: string | null
  is_cancelled: boolean
  cancelled_at: string | null
  created_at: string
}

export interface Plan {
  id: string
  key: ShopPlan
  name: string
  tagline: string | null
  price_monthly: number | null
  price_yearly: number | null
  currency: string
  max_products: number | null
  max_storefronts: number | null
  max_staff: number | null
  max_locations: number | null
  is_popular: boolean
  cta_label: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FeatureCatalogEntry {
  id: string
  key: string
  label: string
  category: string
  sort_order: number
}

export interface PlanFeature {
  plan_id: string
  feature_id: string
  is_included: boolean
  note: string | null
}

// ─────────────────────────────────────────────────────────────────
// Database interface for Supabase client typing
// ─────────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      shops: { Row: Shop; Insert: Partial<Shop>; Update: Partial<Shop> }
      shop_locations: { Row: ShopLocation; Insert: Partial<ShopLocation>; Update: Partial<ShopLocation> }
      shop_users: { Row: ShopUser; Insert: Partial<ShopUser>; Update: Partial<ShopUser> }
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> }
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      product_variants: { Row: ProductVariant; Insert: Partial<ProductVariant>; Update: Partial<ProductVariant> }
      inventory: { Row: Inventory; Insert: Partial<Inventory>; Update: Partial<Inventory> }
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem> }
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> }
      invoices: { Row: Invoice; Insert: Partial<Invoice>; Update: Partial<Invoice> }
    }
    Views: {
      v_daily_sales: { Row: Record<string, unknown> }
      v_top_products: { Row: Record<string, unknown> }
      v_low_stock: { Row: Record<string, unknown> }
    }
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
