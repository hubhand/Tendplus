-- TEND+ Phase 1 RLS 정책
-- 실행 순서: 1) schema-tendplus-v1.9.sql 2) 이 파일 3) [HUMAN] Storage 버킷 4) schema-storage-rls-phase1.sql

-- 1. users_profile
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON users_profile FOR SELECT
USING (id = get_current_user_id());

CREATE POLICY "Users can update own profile"
ON users_profile FOR UPDATE
USING (id = get_current_user_id());

-- 2. health_profiles
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health"
ON health_profiles FOR SELECT
USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own health"
ON health_profiles FOR UPDATE
USING (user_id = get_current_user_id());

-- 3. pantry_items
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own pantry"
ON pantry_items FOR ALL
USING (user_id = get_current_user_id());

-- 4. Public read (ingredients, products)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view ingredients"
ON ingredients FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products"
ON products FOR SELECT USING (true);

-- 5. notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (user_id = get_current_user_id());

-- 6. scan_history
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own scans"
ON scan_history FOR ALL
USING (user_id = get_current_user_id());
