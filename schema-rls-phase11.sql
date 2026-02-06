-- TEND+ Phase 11 RLS 정책
-- 실행 순서: 1) schema-phase11.sql 2) 이 파일

-- 1. subscriptions (본인 CRUD)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own subscriptions" ON subscriptions FOR ALL
USING (user_id = get_current_user_id());

-- 2. consumption_patterns (본인 CRUD)
ALTER TABLE consumption_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own consumption patterns" ON consumption_patterns FOR ALL
USING (user_id = get_current_user_id());
