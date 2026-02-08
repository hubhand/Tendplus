-- TEND+ Phase 8 RLS 정책
-- 실행 순서: 1) schema-phase8.sql 2) 이 파일

-- 1. disclaimers (공개 READ, 관리자 WRITE)
ALTER TABLE disclaimers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active disclaimers" ON disclaimers FOR SELECT
USING (is_active = true);
CREATE POLICY "Admins can manage disclaimers" ON disclaimers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = get_current_user_id()
      AND role IN ('admin', 'super_admin')
  )
);

-- 2. ocr_corrections (본인 SELECT/INSERT, 관리자 UPDATE)
ALTER TABLE ocr_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own corrections" ON ocr_corrections FOR SELECT
USING (user_id = get_current_user_id());
CREATE POLICY "Users can insert own corrections" ON ocr_corrections FOR INSERT
WITH CHECK (user_id = get_current_user_id());
CREATE POLICY "Admins can review corrections" ON ocr_corrections FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE id = get_current_user_id()
      AND role IN ('admin', 'super_admin')
  )
);
