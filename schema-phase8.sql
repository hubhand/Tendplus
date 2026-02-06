-- TEND+ Phase 8 스키마 (disclaimers, ocr_corrections)
-- 실행 순서: 1) schema-phase7.sql 2) schema-rls-phase7.sql 3) 이 파일 4) schema-rls-phase8.sql

-- 1. disclaimers (공개 READ, 관리자 WRITE)
CREATE TABLE disclaimers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. ocr_corrections (본인 + 관리자)
CREATE TABLE ocr_corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
  scan_history_id uuid REFERENCES scan_history(id) ON DELETE CASCADE,
  original_text text,
  corrected_text text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);
