export type Locale = "ar" | "en";

export type ProductStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string;
  description_en?: string;
  cover_image: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  name_ar: string;
  name_en: string;
  sku?: string;
  price_override?: number | null; // EGP
  stock_quantity?: number | null; // null if made-to-order
  is_available?: boolean;
  sort_order?: number;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  url: string;
  alt_ar?: string;
  alt_en?: string;
  sort_order: number;
  is_cover: boolean;
}

export interface Product {
  id: string;
  slug: string;
  category_id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  base_price: number; // in EGP (must be > 0 to publish)
  is_made_to_order: boolean; // ready-made vs made-to-order
  preparation_days: number; // e.g. 3-7 days if made-to-order
  stock_quantity: number | null; // null for made-to-order
  is_featured: boolean;
  status: ProductStatus;
  allow_custom_notes: boolean; // allows buyer to request color/size tweaks

  // Craft specifications
  material_ar?: string;
  material_en?: string;
  dimensions_ar?: string;
  dimensions_en?: string;
  care_instructions_ar?: string;
  care_instructions_en?: string;

  created_at: string;
  updated_at: string;

  // Joined relations
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: Category;
}

export interface ShippingArea {
  id: string;
  name_ar: string;
  name_en: string;
  delivery_fee: number; // in EGP
  estimated_days_min: number;
  estimated_days_max: number;
  is_enabled: boolean;
  sort_order: number;
}

export type PaymentMethod = "instapay" | "vodafone_cash" | "cod";

export type PaymentStatus =
  | "unpaid"
  | "awaiting_proof"
  | "awaiting_review"
  | "verified"
  | "paid"
  | "rejected"
  | "refunded";

export type FulfillmentStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface PaymentProof {
  id: string;
  order_id: string;
  file_url: string;
  uploaded_at: string;
  reviewed_at?: string;
  review_note?: string;
  rejection_reason?: string;
  status: "pending" | "accepted" | "rejected";
}

export interface OrderItemSnapshot {
  id: string;
  order_id: string;
  product_id: string;
  product_name_ar: string;
  product_name_en: string;
  variant_id?: string | null;
  variant_name_ar?: string | null;
  variant_name_en?: string | null;
  unit_price: number; // EGP at purchase time
  quantity: number;
  custom_note?: string | null;
  product_cover_image: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  type: "fulfillment" | "payment" | "internal_note";
  previous_status?: string;
  new_status?: string;
  comment?: string;
  created_at: string;
  created_by?: string;
}

export interface RefundDetails {
  amount: number;
  reference?: string;
  date: string;
  reason: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. ARTQ-2601
  idempotency_key?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_area_id: string;
  shipping_area_name_ar: string;
  shipping_area_name_en: string;
  shipping_address_detailed: string;
  customer_notes?: string | null;

  subtotal_amount: number;
  delivery_fee: number;
  total_amount: number;

  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;

  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  internal_notes?: string | null;
  refund_details?: RefundDetails | null;

  created_at: string;
  updated_at: string;

  items?: OrderItemSnapshot[];
  proofs?: PaymentProof[];
  history?: OrderStatusHistoryItem[];
}

export interface StoreSettings {
  customer_reviews?: CustomerReview[];
  gift_wrap_available?: boolean;
  gift_wrap_description_ar?: string;
  gift_wrap_description_en?: string;
  store_name_ar: string;
  store_name_en: string;
  tagline_ar: string;
  tagline_en: string;
  brand_story_ar: string;
  brand_story_en: string;
  instagram_url: string;
  whatsapp_enabled: boolean;
  whatsapp_phone: string; // Egyptian format, e.g. 201xxxxxxxxx
  require_email_at_checkout: boolean;

  instapay_enabled: boolean;
  instapay_address: string; // IPA username or phone
  instapay_number?: string;
  instapay_account_name?: string;
  instapay_instructions?: string;
  instapay_instructions_ar: string;
  instapay_instructions_en: string;

  vodafone_cash_enabled: boolean;
  vodafone_cash_number: string;
  vodafone_cash_instructions?: string;
  vodafone_cash_instructions_ar: string;
  vodafone_cash_instructions_en: string;

  cod_enabled: boolean;

  accent_theme: "terracotta" | "olive" | "gold" | "rose";
  hero_title_ar: string;
  hero_title_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  hero_image_url: string;
  brand_story_image_url: string;

  // Visual & 3D controls
  enable_3d_hero: boolean;
  hero_motion_intensity: "low" | "medium" | "high";
  background_pattern: "yarn_mesh" | "dots" | "clean";
  announcement_bar_ar?: string;
  announcement_bar_en?: string;
  announcement_bar_enabled?: boolean;

  // Policies in AR & EN
  shipping_policy_ar?: string;
  shipping_policy_en?: string;
  custom_orders_policy_ar?: string;
  custom_orders_policy_en?: string;
  return_policy_ar?: string;
  return_policy_en?: string;

  // Hero Buttons & Links
  hero_cta_explore_text_ar?: string;
  hero_cta_explore_text_en?: string;
  hero_cta_explore_link?: string;
  hero_cta_story_text_ar?: string;
  hero_cta_story_text_en?: string;
  hero_cta_story_link?: string;

  // Image alt texts
  hero_image_alt_ar?: string;
  hero_image_alt_en?: string;
  brand_story_image_alt_ar?: string;
  brand_story_image_alt_en?: string;

  // Section Visibility Toggles
  show_hero_section?: boolean;
  show_trust_banner?: boolean;
  show_journey_section?: boolean;
  show_featured_section?: boolean;
  show_categories_section?: boolean;
  show_policies_section?: boolean;
  show_story_section?: boolean;

  // SEO Metadata
  seo_meta_title_ar?: string;
  seo_meta_title_en?: string;
  seo_meta_description_ar?: string;
  seo_meta_description_en?: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  quote_ar: string;
  quote_en?: string;
  rating: number;
  confirmed: boolean;
  published: boolean;
}

export interface SettingsHistoryEntry {
  version: number;
  timestamp: string;
  snapshot: StoreSettings;
  note?: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  orders_count: number;
  total_spent: number;
  first_order_at: string;
  last_order_at: string;
}
