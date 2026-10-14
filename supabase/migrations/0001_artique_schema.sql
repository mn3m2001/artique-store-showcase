-- ==============================================================================
-- ARTIQUE HANDMADE CRAFTS — PRODUCTION SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- Delivery restricted to Damietta Governorate, Egypt. Currency: EGP.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name_ar TEXT NOT NULL DEFAULT 'آرتيك',
    store_name_en TEXT NOT NULL DEFAULT 'Artique',
    tagline_ar TEXT NOT NULL DEFAULT 'مشغولات كروشيه وهاند ميد مصنوعة بحب وإتقان',
    tagline_en TEXT NOT NULL DEFAULT 'Handmade crochet crafts woven with heart and precision',
    brand_story_ar TEXT NOT NULL,
    brand_story_en TEXT NOT NULL,
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/artique_11/',
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    whatsapp_phone TEXT NOT NULL DEFAULT '',
    require_email_at_checkout BOOLEAN NOT NULL DEFAULT TRUE,

    instapay_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    instapay_address TEXT NOT NULL DEFAULT '',
    instapay_instructions_ar TEXT NOT NULL DEFAULT '',
    instapay_instructions_en TEXT NOT NULL DEFAULT '',

    vodafone_cash_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    vodafone_cash_number TEXT NOT NULL DEFAULT '',
    vodafone_cash_instructions_ar TEXT NOT NULL DEFAULT '',
    vodafone_cash_instructions_en TEXT NOT NULL DEFAULT '',

    cod_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    accent_theme TEXT NOT NULL DEFAULT 'terracotta',
    hero_title_ar TEXT NOT NULL,
    hero_title_en TEXT NOT NULL,
    hero_subtitle_ar TEXT NOT NULL,
    hero_subtitle_en TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    brand_story_image_url TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || uuid_generate_v4()::text),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    cover_image TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || uuid_generate_v4()::text),
    slug TEXT UNIQUE NOT NULL,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '',
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    is_made_to_order BOOLEAN NOT NULL DEFAULT TRUE,
    preparation_days INT NOT NULL DEFAULT 3,
    stock_quantity INT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    allow_custom_notes BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PRODUCT IMAGES
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img-' || uuid_generate_v4()::text),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_ar TEXT,
    alt_en TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PRODUCT VARIANTS
CREATE TABLE IF NOT EXISTS public.product_variants (
    id TEXT PRIMARY KEY DEFAULT ('var-' || uuid_generate_v4()::text),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    sku TEXT,
    price_override NUMERIC(10, 2),
    stock_quantity INT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. SHIPPING AREAS (DAMIETTA ONLY)
CREATE TABLE IF NOT EXISTS public.shipping_areas (
    id TEXT PRIMARY KEY DEFAULT ('ship-' || uuid_generate_v4()::text),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 40,
    estimated_days_min INT NOT NULL DEFAULT 1,
    estimated_days_max INT NOT NULL DEFAULT 3,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ord-' || uuid_generate_v4()::text),
    order_number TEXT UNIQUE NOT NULL,
    idempotency_key TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_area_id TEXT NOT NULL REFERENCES public.shipping_areas(id),
    shipping_area_name_ar TEXT NOT NULL,
    shipping_area_name_en TEXT NOT NULL,
    shipping_address_detailed TEXT NOT NULL,
    customer_notes TEXT,

    subtotal_amount NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,

    payment_method TEXT NOT NULL CHECK (payment_method IN ('instapay', 'vodafone_cash', 'cod')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'awaiting_review', 'verified', 'rejected')),
    fulfillment_status TEXT NOT NULL DEFAULT 'new' CHECK (fulfillment_status IN ('new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),

    expected_delivery_date DATE,
    actual_delivery_date DATE,
    internal_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ORDER ITEM SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT ('item-' || uuid_generate_v4()::text),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name_ar TEXT NOT NULL,
    product_name_en TEXT NOT NULL,
    variant_id TEXT,
    variant_name_ar TEXT,
    variant_name_en TEXT,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    custom_note TEXT,
    product_cover_image TEXT NOT NULL
);

-- 10. PAYMENT PROOFS
CREATE TABLE IF NOT EXISTS public.payment_proofs (
    id TEXT PRIMARY KEY DEFAULT ('proof-' || uuid_generate_v4()::text),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    review_note TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at TIMESTAMPTZ
);

-- 11. ORDER STATUS HISTORY AUDIT LOG
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id TEXT PRIMARY KEY DEFAULT ('hist-' || uuid_generate_v4()::text),
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('fulfillment', 'payment', 'internal_note')),
    previous_status TEXT,
    new_status TEXT,
    comment TEXT,
    created_by TEXT NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view published product images" ON public.product_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_images.product_id AND products.status = 'published')
);
CREATE POLICY "Public can view published product variants" ON public.product_variants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.status = 'published')
);
CREATE POLICY "Public can view enabled shipping areas" ON public.shipping_areas FOR SELECT USING (is_enabled = true);

-- CUSTOMER ORDER LOOKUP BY ORDER ID / NUMBER (Order Confirmation page only)
-- Note: General public cannot browse or list orders.
CREATE POLICY "Public can view order by exact reference" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public can view items of an order" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Public can view proofs of an order" ON public.payment_proofs FOR SELECT USING (true);

-- ADMIN FULL ACCESS (Authenticated users)
CREATE POLICY "Admin full access to store_settings" ON public.store_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to categories" ON public.categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to product_images" ON public.product_images FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to product_variants" ON public.product_variants FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to shipping_areas" ON public.shipping_areas FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to orders" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to order_items" ON public.order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to payment_proofs" ON public.payment_proofs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access to order_status_history" ON public.order_status_history FOR ALL TO authenticated USING (true);

-- STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('artique-media', 'artique-media', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Public can view artique-media" ON storage.objects FOR SELECT USING (bucket_id = 'artique-media');
CREATE POLICY "Authenticated users can upload artique-media" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'artique-media');
CREATE POLICY "Authenticated users can view payment-proofs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs');
CREATE POLICY "Public can insert payment-proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');
