import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="mx-auto max-w-md px-4 pt-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-emerald-600">TEND+</h1>
        <p className="mt-2 text-gray-500">나의 건강에 맞는 식품을 찾아드립니다</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/scan" className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 p-6 hover:bg-emerald-100">
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium text-emerald-700">제품 스캔</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center gap-2 rounded-2xl bg-blue-50 p-6 hover:bg-blue-100">
          <span className="text-3xl">🔍</span>
          <span className="text-sm font-medium text-blue-700">제품 검색</span>
        </Link>
        <Link href="/investigator" className="flex flex-col items-center gap-2 rounded-2xl bg-purple-50 p-6 hover:bg-purple-100">
          <span className="text-3xl">🕵️</span>
          <span className="text-sm font-medium text-purple-700">AI 수사관</span>
        </Link>
        <Link href="/pantry" className="flex flex-col items-center gap-2 rounded-2xl bg-orange-50 p-6 hover:bg-orange-100">
          <span className="text-3xl">📦</span>
          <span className="text-sm font-medium text-orange-700">나의 팬트리</span>
        </Link>
      </div>

      {userId && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">⚠️ 건강 프로필을 설정하면 더 정확한 맞춤 분석을 받을 수 있어요</p>
          <Link href="/profile" className="mt-2 inline-block text-sm font-semibold text-amber-700 underline">프로필 설정하기 →</Link>
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">최근 분석</h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-400">
          <p>아직 분석 기록이 없어요</p>
          <p className="mt-1 text-sm">제품을 스캔하거나 검색해보세요!</p>
        </div>
      </section>
    </div>
  );
}
