'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function arrToText(arr: string[] | undefined): string {
  if (!Array.isArray(arr)) return '';
  return arr.join(', ');
}

function textToArr(text: string): string[] {
  return text
    .split(/[,，\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState('');
  const [skinConcerns, setSkinConcerns] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [blacklistIngredients, setBlacklistIngredients] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/health-profile');
        if (res.status === 401) {
          window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/health');
          return;
        }
        if (res.status === 404) {
          const createRes = await fetch('/api/health-profile', { method: 'POST' });
          if (!createRes.ok) {
            setError('건강 프로필을 생성할 수 없습니다.');
            return;
          }
          const retryRes = await fetch('/api/health-profile');
          if (!retryRes.ok) {
            setError('프로필을 불러올 수 없습니다.');
            return;
          }
          const data = await retryRes.json();
          setAllergies(arrToText(data.allergies));
          setMedications(arrToText(data.medications));
          setSkinConcerns(arrToText(data.skin_concerns));
          setChronicConditions(arrToText(data.chronic_conditions));
          setBlacklistIngredients(arrToText(data.blacklist_ingredients));
        } else if (res.ok) {
          const data = await res.json();
          setAllergies(arrToText(data.allergies));
          setMedications(arrToText(data.medications));
          setSkinConcerns(arrToText(data.skin_concerns));
          setChronicConditions(arrToText(data.chronic_conditions));
          setBlacklistIngredients(arrToText(data.blacklist_ingredients));
        } else {
          setError('프로필을 불러올 수 없습니다.');
        }
      } catch {
        setError('오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/health-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allergies: textToArr(allergies),
          medications: textToArr(medications),
          skin_concerns: textToArr(skinConcerns),
          chronic_conditions: textToArr(chronicConditions),
          blacklist_ingredients: textToArr(blacklistIngredients),
        }),
      });
      if (res.status === 401) {
        window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/health');
        return;
      }
      if (!res.ok) {
        setError('저장에 실패했습니다.');
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-black dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold">
          TEND+
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/scan"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            제품 스캔
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            홈으로
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold">건강 프로필</h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          알러지, 복용 약, 피부 고민 등을 입력하면 제품 분석 시 참고됩니다.
        </p>

        {loading ? (
          <p className="text-zinc-500">불러오는 중...</p>
        ) : error ? (
          <p className="text-red-600 dark:text-red-400">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label
                htmlFor="allergies"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                알러지
              </label>
              <textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="예: 땅콩, 대두, 우유"
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="medications"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                복용 중인 약
              </label>
              <textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="예: 아스피린, 혈압약"
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="skin_concerns"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                피부 고민
              </label>
              <textarea
                id="skin_concerns"
                value={skinConcerns}
                onChange={(e) => setSkinConcerns(e.target.value)}
                placeholder="예: 건조함, 민감성, 여드름"
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="chronic_conditions"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                만성 질환
              </label>
              <textarea
                id="chronic_conditions"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="예: 당뇨, 고혈압"
                rows={2}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="blacklist_ingredients"
                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                피해야 할 성분
              </label>
              <textarea
                id="blacklist_ingredients"
                value={blacklistIngredients}
                onChange={(e) => setBlacklistIngredients(e.target.value)}
                placeholder="예: 파라벤, 실리콘, 알코올"
                rows={3}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                제품 분석 시 이 성분이 포함되면 알려드립니다.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-white disabled:opacity-50"
            >
              {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
