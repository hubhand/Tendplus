/**
 * Supabase 연결 테스트 페이지
 *
 * schema-tendplus-v1.9.sql 실행 후 products 테이블로 연결을 확인합니다.
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function SupabaseTestData() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, category, created_at')
    .limit(10);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Supabase 연결 오류</p>
        <p className="mt-1 text-sm">{error.message}</p>
        <p className="mt-2 text-xs">
          schema-tendplus-v1.9.sql을 Supabase SQL Editor에서 실행했는지 확인하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        products 테이블 ({products?.length ?? 0}건)
      </p>
      <pre className="overflow-auto rounded-lg border bg-gray-50 p-4 text-sm">
        {JSON.stringify(products ?? [], null, 2)}
      </pre>
    </div>
  );
}

export default function InstrumentsPage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Supabase 연결 테스트</h1>
      <p className="mb-6 text-gray-600">
        products 테이블 데이터를 불러옵니다.
      </p>
      <Suspense fallback={<div>Loading...</div>}>
        <SupabaseTestData />
      </Suspense>
    </div>
  );
}
