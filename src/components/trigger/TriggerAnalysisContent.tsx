'use client';

import { useState, useEffect } from 'react';
import { RecordProductCard } from './RecordProductCard';
import { AnalysisResults } from './AnalysisResults';
import { ProductHistory } from './ProductHistory';

interface TriggerAnalysisContentProps {
  userId: string;
}

type TabType = 'record' | 'analyze' | 'history';

export function TriggerAnalysisContent({ userId }: TriggerAnalysisContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('record');
  const [goodCount, setGoodCount] = useState(0);
  const [badCount, setBadCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch counts
  useEffect(() => {
    fetchCounts();
  }, [refreshKey]);

  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/trigger-analysis/counts');
      if (response.ok) {
        const data = await response.json();
        setGoodCount(data.good || 0);
        setBadCount(data.bad || 0);
      }
    } catch (error) {
      console.error('Failed to fetch counts:', error);
    }
  };

  const handleRecordSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="rounded-lg bg-brand-cream p-6">
      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('record')}
          className={`rounded-lg px-4 py-3 font-medium transition-colors ${
            activeTab === 'record'
              ? 'bg-brand-pink text-white'
              : 'bg-white text-brand-navy'
          }`}
        >
          📷 제품 기록
        </button>
        <button
          onClick={() => setActiveTab('analyze')}
          className={`rounded-lg px-4 py-3 font-medium transition-colors ${
            activeTab === 'analyze'
              ? 'bg-brand-pink text-white'
              : 'bg-white text-brand-navy'
          }`}
        >
          🕵️ 분석 결과
          {(goodCount > 0 || badCount > 0) && (
            <span className="ml-2 rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-brand-navy">
              G:{goodCount} B:{badCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`rounded-lg px-4 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-brand-pink text-white'
              : 'bg-white text-brand-navy'
          }`}
        >
          📋 기록 내역
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'record' && (
        <RecordProductCard userId={userId} onSuccess={handleRecordSuccess} />
      )}

      {activeTab === 'analyze' && (
        <AnalysisResults
          userId={userId}
          goodCount={goodCount}
          badCount={badCount}
        />
      )}

      {activeTab === 'history' && (
        <ProductHistory userId={userId} onDelete={handleRecordSuccess} />
      )}
    </div>
  );
}
