-- TEND+ Phase 11 스키마 (subscriptions, consumption_patterns)
-- 실행 순서: 1) schema-phase8.sql 2) schema-rls-phase8.sql 3) 이 파일 4) schema-rls-phase11.sql

-- 1. subscriptions (가변형 구독)
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  pantry_item_id uuid REFERENCES pantry_items(id) ON DELETE SET NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  current_cycle_days int DEFAULT 30,
  last_finished_at timestamptz,
  next_reminder_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 2. consumption_patterns (소비 패턴)
CREATE TABLE consumption_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  pantry_item_id uuid REFERENCES pantry_items(id) ON DELETE SET NULL,
  purchased_at timestamptz NOT NULL,
  finished_at timestamptz NOT NULL,
  actual_duration_days int GENERATED ALWAYS AS (
    EXTRACT(DAY FROM (finished_at - purchased_at))::int
  ) STORED,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);
