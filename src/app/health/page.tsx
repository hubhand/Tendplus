'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HealthChatbot } from '@/components/health/HealthChatbot';
import { TriggerAnalysisContent } from '@/components/trigger/TriggerAnalysisContent';

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
  const [activeTab, setActiveTab] = useState<'form' | 'chat' | 'trigger'>('form');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let res = await fetch('/api/health-profile');
        if (res.status === 401) {
          const syncRes = await fetch('/api/sync-profile', { method: 'POST' });
          if (syncRes.ok) {
            res = await fetch('/api/health-profile');
          }
          if (res.status === 401) {
            window.location.href = '/sign-in?redirect_url=' + encodeURIComponent('/health');
            return;
          }
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
          if (data.user_id) setUserId(data.user_id);
        } else if (res.ok) {
          const data = await res.json();
          setAllergies(arrToText(data.allergies));
          setMedications(arrToText(data.medications));
          setSkinConcerns(arrToText(data.skin_concerns));
          setChronicConditions(arrToText(data.chronic_conditions));
          setBlacklistIngredients(arrToText(data.blacklist_ingredients));
          if (data.user_id) setUserId(data.user_id);
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
    <div className="relative flex min-h-screen flex-col font-sans">
      {/* Full-page background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/health-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-cream/70 via-white/25 to-brand-cream/60"
          aria-hidden
        />
      </div>

      <header className="relative z-20 flex items-center justify-between border-b border-brand-peach/30 bg-brand-cream/80 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="text-lg font-semibold text-brand-navy">
          TEND+
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy"
          >
            제품 쇼핑
          </Link>
          <Link
            href="/trigger-analysis"
            className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy"
          >
            🔍 성분 수사관
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy"
          >
            홈으로
          </Link>
        </div>
      </header>

      <main
        className={`relative z-10 mx-auto w-full flex-1 px-6 py-8 ${
          activeTab === 'trigger' ? 'max-w-6xl' : 'max-w-2xl'
        }`}
      >
        <h1 className="mb-2 text-2xl font-bold text-brand-navy">건강 프로필</h1>
        <p className="mb-8 text-brand-navy/80">
          알러지, 복용 약, 피부 고민 등을 입력하면 제품 분석 시 참고됩니다.
        </p>

        {loading ? (
          <p className="text-brand-navy/80">불러오는 중...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            <div className="mb-6 flex gap-4 rounded-t-xl border border-brand-peach/20 border-b-0 bg-white/50 px-2 pt-2 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className={`rounded-t-lg px-4 pb-2 pt-1 font-medium transition-colors ${
                  activeTab === 'form'
                    ? 'bg-brand-pink text-white'
                    : 'bg-white/50 text-brand-navy hover:bg-white/70'
                }`}
              >
                직접 입력
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`rounded-t-lg px-4 pb-2 pt-1 font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-brand-pink text-white'
                    : 'bg-white/50 text-brand-navy hover:bg-white/70'
                }`}
              >
                AI 채팅으로 입력
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trigger')}
                className={`rounded-t-lg px-4 pb-2 pt-1 font-medium transition-colors ${
                  activeTab === 'trigger'
                    ? 'bg-brand-pink text-white'
                    : 'bg-white/50 text-brand-navy hover:bg-white/70'
                }`}
              >
                🔍 성분 수사관
              </button>
            </div>
            {activeTab === 'form' ? (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 rounded-b-xl rounded-t-lg border border-brand-peach/20 border-t-0 bg-white p-6 shadow-sm"
              >
            <div>
                <label
                htmlFor="allergies"
                className="mb-1 block text-sm font-medium text-brand-navy"
              >
                알러지
              </label>
              <textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="예: 땅콩, 대두, 우유"
                rows={2}
                className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50"
              />
            </div>

            <div>
              <label
                htmlFor="medications"
                className="mb-1 block text-sm font-medium text-brand-navy"
              >
                복용 중인 약
              </label>
              <textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="예: 아스피린, 혈압약"
                rows={2}
                className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50"
              />
            </div>

            <div>
              <label
                htmlFor="skin_concerns"
                className="mb-1 block text-sm font-medium text-brand-navy"
              >
                피부 고민
              </label>
              <textarea
                id="skin_concerns"
                value={skinConcerns}
                onChange={(e) => setSkinConcerns(e.target.value)}
                placeholder="예: 건조함, 민감성, 여드름"
                rows={2}
                className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50"
              />
            </div>

            <div>
              <label
                htmlFor="chronic_conditions"
                className="mb-1 block text-sm font-medium text-brand-navy"
              >
                만성 질환
              </label>
              <textarea
                id="chronic_conditions"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                placeholder="예: 당뇨, 고혈압"
                rows={2}
                className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50"
              />
            </div>

            <div>
              <label
                htmlFor="blacklist_ingredients"
                className="mb-1 block text-sm font-medium text-brand-navy"
              >
                피해야 할 성분
              </label>
              <textarea
                id="blacklist_ingredients"
                value={blacklistIngredients}
                onChange={(e) => setBlacklistIngredients(e.target.value)}
                placeholder="예: 파라벤, 실리콘, 알코올"
                rows={3}
                className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50"
              />
              <p className="mt-1 text-xs text-brand-navy/70">
                제품 분석 시 이 성분이 포함되면 알려드립니다.
              </p>
            </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand-navy px-6 py-3 text-white transition hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  {saving ? '저장 중...' : saved ? '저장됨 ✓' : '저장'}
                </button>
              </form>
            ) : activeTab === 'chat' ? (
              <div className="rounded-b-xl rounded-t-lg border border-brand-peach/20 border-t-0 bg-white p-6 shadow-sm">
                <HealthChatbot />
              </div>
            ) : (
              userId ? (
                <div className="rounded-b-xl rounded-t-lg border border-brand-peach/20 border-t-0 bg-white p-6 shadow-sm">
                  <TriggerAnalysisContent userId={userId} />
                </div>
              ) : (
                <p className="rounded-b-xl rounded-t-lg border border-brand-peach/20 border-t-0 bg-white p-6 text-brand-navy/80 shadow-sm">
                  프로필을 불러온 후 사용할 수 있습니다.
                </p>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}
