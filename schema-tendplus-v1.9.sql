-- TEND+ Phase 1 스키마 (테이블, 함수, 인덱스만 — RLS 제외)
-- 실행 순서: 1) 이 파일 2) schema-rls-phase1.sql 3) [HUMAN] Storage 버킷 4) schema-storage-rls-phase1.sql

-- 1. users_profile (최우선)
CREATE TABLE users_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  display_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_users_profile_clerk ON users_profile(clerk_id);
CREATE INDEX idx_users_profile_email ON users_profile(email);
CREATE INDEX idx_users_profile_role ON users_profile(role);
CREATE INDEX idx_users_profile_status ON users_profile(status);

-- 2. ingredients (Generated Column)
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ko text NOT NULL,
  name_ko_normalized text GENERATED ALWAYS AS (
    LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name_ko, '[^가-힣a-zA-Z0-9]', '', 'g'), '\s+', '', 'g'))
  ) STORED,
  name_en text,
  ingredients_list jsonb DEFAULT '[]'::jsonb,
  allergens jsonb DEFAULT '[]'::jsonb,
  cached_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX idx_ingredients_normalized ON ingredients(name_ko_normalized);
CREATE INDEX idx_ingredients_cached ON ingredients(cached_at);

-- 3. products (최소 스켈레톤만)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text,
  category text,
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 4. notifications (최소 스켈레톤만)
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 5. health_profiles
CREATE TABLE health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL UNIQUE,
  allergies jsonb DEFAULT '[]'::jsonb,
  medications jsonb DEFAULT '[]'::jsonb,
  skin_concerns jsonb DEFAULT '[]'::jsonb,
  chronic_conditions jsonb DEFAULT '[]'::jsonb,
  blacklist_ingredients jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. pantry_items (수정 #17)
CREATE TABLE pantry_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('unopened', 'opened', 'almost_empty', 'empty')),
  added_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  expiry_date date,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 7. scan_history
CREATE TABLE scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  image_url text,
  ocr_result jsonb,
  confidence decimal(3,2),
  created_at timestamptz DEFAULT now()
);

-- 8. product_ingredients
CREATE TABLE product_ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
  amount text,
  position int,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, ingredient_id)
);

-- 9. 헬퍼 함수들
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
DECLARE
  clerk_id text;
  user_uuid uuid;
BEGIN
  clerk_id := auth.jwt()->>'sub';
  IF clerk_id IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO user_uuid FROM users_profile
  WHERE users_profile.clerk_id = clerk_id LIMIT 1;
  RETURN user_uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_generated text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_generated::text
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = get_table_columns.table_name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_expiring_items_kst(days_threshold int DEFAULT 3)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  product_id uuid,
  expiry_date date,
  days_until_expiry int
) AS $$
DECLARE
  kst_date date;
BEGIN
  kst_date := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date;
  RETURN QUERY
  SELECT 
    pi.id,
    pi.user_id,
    pi.product_id,
    pi.expiry_date,
    (pi.expiry_date - kst_date)::int AS days_until_expiry
  FROM pantry_items pi
  WHERE pi.status IN ('opened', 'almost_empty')
    AND pi.expiry_date IS NOT NULL
    AND pi.expiry_date <= kst_date + days_threshold
    AND pi.notified_at IS NULL
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- 10. 인덱스
CREATE INDEX idx_pantry_user ON pantry_items(user_id);
CREATE INDEX idx_pantry_product ON pantry_items(product_id);
CREATE INDEX idx_pantry_status ON pantry_items(status);
CREATE INDEX idx_pantry_expiry ON pantry_items(expiry_date);
CREATE INDEX idx_pantry_added ON pantry_items(added_at);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_users_display_name ON users_profile(display_name);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_scan_history_user ON scan_history(user_id);
CREATE INDEX idx_scan_history_created ON scan_history(created_at DESC);
CREATE INDEX idx_product_ingredients_product ON product_ingredients(product_id);
CREATE INDEX idx_product_ingredients_ingredient ON product_ingredients(ingredient_id);
