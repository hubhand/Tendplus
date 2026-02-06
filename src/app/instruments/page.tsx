/**
 * Supabase 연결 테스트 페이지
 *
 * Supabase SQL Editor에서 아래를 실행한 후 이 페이지를 확인하세요:
 *
 * -- instruments 테이블 생성
 * create table instruments (
 *   id bigint primary key generated always as identity,
 *   name text not null
 * );
 * insert into instruments (name) values ('violin'), ('viola'), ('cello');
 * alter table instruments enable row level security;
 * create policy "public can read instruments" on public.instruments
 *   for select to anon using (true);
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 */

import { createClient } from '@/lib/supabase/server';
import { Suspense } from 'react';

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from('instruments')
    .select();

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">Supabase 연결 오류</p>
        <p className="mt-1 text-sm">{error.message}</p>
        <p className="mt-2 text-xs">
          instruments 테이블이 없으면 Supabase SQL Editor에서 생성하세요.
        </p>
      </div>
    );
  }

  return (
    <pre className="overflow-auto rounded-lg border bg-gray-50 p-4 text-sm">
      {JSON.stringify(instruments, null, 2)}
    </pre>
  );
}

export default function InstrumentsPage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 text-2xl font-bold">Supabase 연결 테스트</h1>
      <p className="mb-6 text-gray-600">
        instruments 테이블 데이터를 불러옵니다.
      </p>
      <Suspense fallback={<div>Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>
    </div>
  );
}
