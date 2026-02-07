'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ManualInputForm } from '@/components/scan/ManualInputForm';

const CameraCapture = dynamic(
  () => import('@/components/scan/CameraCapture').then((m) => ({ default: m.CameraCapture })),
  { ssr: false }
);

export default function ScanPage() {
  const [result, setResult] = useState<{
    product_name?: string;
    ingredients_list?: string[];
    confidence?: number;
  } | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-black dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold">
          TEND+
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/health"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            건강 프로필
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            홈으로
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold">제품 스캔</h1>

        {showCamera ? (
          <>
            <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
              제품 성분표를 카메라로 촬영하면 AI가 성분을 추출합니다.
            </p>
            <CameraCapture
              onCapture={(data) => {
                setResult(data);
                setShowCamera(false);
              }}
            />
            <button
              type="button"
              onClick={() => setShowCamera(false)}
              className="mt-6 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← 직접 입력으로 돌아가기
            </button>
          </>
        ) : (
          <>
            <p className="mb-8 text-center text-zinc-600 dark:text-zinc-400">
              성분을 직접 입력하거나, 사진으로 촬영할 수 있습니다.
            </p>
            <ManualInputForm
              onCapture={(data) => setResult(data)}
            />
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="mt-6 flex items-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              📷 사진으로 촬영
            </button>
          </>
        )}

        {result && (
          <div className="mt-8 w-full rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">분석 결과</h2>
            {result.product_name && (
              <p className="mb-2">
                <span className="text-zinc-500">제품명:</span>{' '}
                {result.product_name}
              </p>
            )}
            {result.ingredients_list && result.ingredients_list.length > 0 && (
              <div className="mt-2">
                <p className="text-zinc-500">성분:</p>
                <ul className="mt-1 list-inside list-disc text-sm">
                  {result.ingredients_list.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.confidence != null && (
              <p className="mt-2 text-sm text-zinc-500">
                신뢰도: {(result.confidence * 100).toFixed(0)}%
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
