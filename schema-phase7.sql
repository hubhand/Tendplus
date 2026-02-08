-- TEND+ Phase 7 스키마 (brands, link_clicks, audit_logs, products ALTER)
-- 실행 순서: 1) schema-tendplus-v1.9.sql 2) schema-rls-phase1.sql 3) 이 파일 4) schema-rls-phase7.sql

-- 1. brands (Phase 7)
CREATE TABLE brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  affiliate_url text,
  commission_rate decimal(5,2) DEFAULT 15.00,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- 2. products에 brand_id, affiliate_url 추가 (Phase 7)
-- brand 컬럼은 Phase 1에서 생성됨 — 유지. brand_id는 별도 FK.
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url text;

-- 3. link_clicks
CREATE TABLE link_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  clicked_at timestamptz DEFAULT now()
);

-- 4. audit_logs (Phase 8 선행)
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. 인덱스
CREATE INDEX idx_link_clicks_user ON link_clicks(user_id);
CREATE INDEX idx_link_clicks_product ON link_clicks(product_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
