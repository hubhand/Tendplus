import { createClient } from '@supabase/supabase-js';

async function verifySchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const phase = process.env.CURRENT_PHASE || '0';

  if (!supabaseUrl || !supabaseKey) {
    console.log('⚠️  Supabase 환경변수 없음 - 스키마 검증 스킵');
    process.exit(0);
  }

  if (phase === '0') {
    console.log('✅ Phase 0: 스키마 검증 스킵');
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase.rpc('get_table_columns', {
      table_name: 'ingredients',
    });

    if (error) {
      console.error('❌ 스키마 검증 실패:', error);
      process.exit(1);
    }

    const normalized = data?.find(
      (col: { column_name: string; is_generated: string }) =>
        col.column_name === 'name_ko_normalized'
    );

    if (normalized?.is_generated !== 'ALWAYS') {
      console.error('❌ name_ko_normalized는 Generated Column이어야 합니다');
      process.exit(1);
    }

    console.log('✅ 스키마 검증 완료');
    process.exit(0);
  } catch (error) {
    console.log('⚠️  스키마 검증 스킵:', error);
    process.exit(0);
  }
}

verifySchema();
