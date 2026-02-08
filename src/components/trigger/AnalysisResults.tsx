"use client";

import { useState, useEffect } from "react";

interface AnalysisResultsProps {
  userId: string;
  goodCount: number;
  badCount: number;
}

interface SuspectIngredient {
  ingredient_name: string;
  confidence_score: number;
  good_count: number;
  bad_count: number;
  total_good: number;
  total_bad: number;
}

export function AnalysisResults({
  userId,
  goodCount,
  badCount,
}: AnalysisResultsProps) {
  const [suspects, setSuspects] = useState<SuspectIngredient[]>([]);
  const [safeIngredients, setSafeIngredients] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const canAnalyze = goodCount >= 1 && badCount >= 1;

  const runAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/trigger-analysis/analyze", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setSuspects(data.suspects || []);
        setSafeIngredients(data.safe || []);
        setHasAnalyzed(true);
      } else {
        alert("분석 실패. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!canAnalyze) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-brand-cream p-8 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="font-bold text-lg mb-2">데이터가 부족합니다</h3>
        <p className="mb-4 text-brand-navy/80">
          분석을 위해서는 최소한:
        </p>
        <ul className="inline-block space-y-2 text-left text-brand-navy/80">
          <li>✅ Good 제품: {goodCount}개 / 최소 1개 필요</li>
          <li>❌ Bad 제품: {badCount}개 / 최소 1개 필요</li>
        </ul>
        <p className="mt-4 text-sm text-brand-navy/70">
          "제품 기록" 탭에서 더 많은 제품을 기록해주세요
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Button */}
      {!hasAnalyzed && (
        <div className="rounded-lg border border-brand-peach/20 bg-brand-cream p-6 text-center">
          <div className="text-4xl mb-4">🕵️</div>
          <h3 className="font-bold text-lg mb-2">분석 준비 완료!</h3>
          <p className="mb-4 text-brand-navy/80">
            Good {goodCount}개, Bad {badCount}개의 제품이 준비되었습니다
          </p>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="rounded-lg bg-brand-navy px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-50"
          >
            {isAnalyzing ? "분석 중..." : "🔍 AI 분석 시작"}
          </button>
        </div>
      )}

      {/* Results */}
      {hasAnalyzed && (
        <>
          {/* Suspect Ingredients */}
          {suspects.length > 0 ? (
            <div className="rounded-lg border border-brand-peach/20 bg-brand-cream p-6">
              <h3 className="font-bold text-xl mb-4">
                🔴 의심 성분 (확률 높은 순)
              </h3>
              <div className="space-y-4">
                {suspects.map((suspect, index) => {
                  const stars = Math.round(suspect.confidence_score * 5);
                  const badPercent = (
                    (suspect.bad_count / suspect.total_bad) *
                    100
                  ).toFixed(0);
                  const goodPercent =
                    suspect.total_good > 0
                      ? (
                          (suspect.good_count / suspect.total_good) *
                          100
                        ).toFixed(0)
                      : "0";

                  return (
                    <div
                      key={index}
                      className="rounded-lg border border-brand-pink/30 bg-brand-peach/10 p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-lg">
                          {suspect.ingredient_name}
                        </div>
                        <div className="text-yellow-500">
                          {"⭐".repeat(stars)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-brand-navy/70">
                            Bad 제품:
                          </div>
                          <div className="font-medium text-red-600 dark:text-red-400">
                            {suspect.bad_count}/{suspect.total_bad} (
                            {badPercent}%)
                          </div>
                        </div>
                        <div>
                          <div className="text-brand-navy/70">
                            Good 제품:
                          </div>
                          <div className="font-medium text-brand-navy">
                            {suspect.good_count}/{suspect.total_good} (
                            {goodPercent}%)
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-brand-navy/70">
                        신뢰도: {(suspect.confidence_score * 100).toFixed(0)}%
                      </div>

                      <button
                        onClick={async () => {
                          // TODO: Add to blacklist
                          alert("피해야 할 성분에 추가 기능은 곧 구현됩니다!");
                        }}
                        className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        피해야 할 성분에 추가
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={runAnalysis}
                disabled={isAnalyzing}
                className="mt-6 w-full rounded-lg border border-brand-peach bg-transparent px-4 py-2 font-medium text-brand-navy transition-colors hover:bg-brand-peach/50"
              >
                🔄 재분석
              </button>
            </div>
          ) : (
            <div className="rounded-lg border border-brand-peach/20 bg-brand-cream p-6 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-bold text-lg mb-2">
                의심 성분이 발견되지 않았습니다
              </h3>
              <p className="text-brand-navy/80">
                모든 성분이 안전한 것으로 분석되었습니다
              </p>
            </div>
          )}

          {/* Safe Ingredients */}
          {safeIngredients.length > 0 && (
            <div className="rounded-lg border border-brand-peach/20 bg-brand-cream p-6">
              <h3 className="font-bold text-xl mb-4">✅ 안전한 성분</h3>
              <div className="flex flex-wrap gap-2">
                {safeIngredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-brand-peach px-3 py-1 text-sm font-medium text-brand-navy"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
