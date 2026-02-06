-- TEND+ Phase 7 RLS 정책
-- 실행 순서: 1) schema-phase7.sql 2) 이 파일

-- 1. brands (공개 READ)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view brands" ON brands FOR SELECT USING (true);

-- 2. link_clicks (INSERT만 anyone, 본인 READ)
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert clicks" ON link_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own clicks" ON link_clicks FOR SELECT
USING (user_id = get_current_user_id() OR user_id IS NULL);

-- 3. audit_logs (관리자만 SELECT)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = get_current_user_id()
      AND role IN ('admin', 'super_admin')
  )
);
