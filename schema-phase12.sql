-- TEND+ Phase 12 스키마 (trigger_analyses)
-- 실행 순서: 1) schema-phase11.sql 2) schema-rls-phase11.sql 3) 이 파일

-- trigger_analyses (AI 성분 수사관)
CREATE TABLE trigger_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  good_products jsonb NOT NULL,
  bad_products jsonb NOT NULL,
  good_ingredients jsonb,
  bad_ingredients jsonb,
  difference_ingredients jsonb,
  suspected_ingredients jsonb,
  confidence decimal(3,2),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_trigger_analyses_user ON trigger_analyses(user_id);

-- RLS
ALTER TABLE trigger_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own analyses" ON trigger_analyses FOR ALL
USING (user_id = get_current_user_id());
