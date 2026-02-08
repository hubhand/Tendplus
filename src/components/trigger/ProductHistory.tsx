'use client';

import { useState, useEffect } from 'react';

interface ProductHistoryProps {
  userId: string;
  onDelete: () => void;
}

interface HistoryItem {
  id: string;
  product_name: string;
  reaction_type: 'good' | 'bad';
  notes: string | null;
  created_at: string;
  ingredients_count: number;
}

export function ProductHistory({ userId, onDelete }: ProductHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'good' | 'bad'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trigger-analysis/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/trigger-analysis/record?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        onDelete();
      } else {
        alert('삭제 실패');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.reaction_type === filter;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-brand-navy/70">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'bg-brand-pink text-white'
              : 'bg-white text-brand-navy'
          }`}
        >
          전체 ({history.length})
        </button>
        <button
          onClick={() => setFilter('good')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            filter === 'good'
              ? 'bg-brand-pink text-white'
              : 'bg-white text-brand-navy'
          }`}
        >
          ✅ Good ({history.filter((h) => h.reaction_type === 'good').length})
        </button>
        <button
          onClick={() => setFilter('bad')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            filter === 'bad'
              ? 'bg-red-500 text-white'
              : 'bg-white text-brand-navy'
          }`}
        >
          ❌ Bad ({history.filter((h) => h.reaction_type === 'bad').length})
        </button>
      </div>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border-2 p-4 ${
                item.reaction_type === 'good'
                  ? 'border-brand-peach bg-brand-cream'
                  : 'border-red-200 bg-brand-cream'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {item.reaction_type === 'good' ? '✅' : '❌'}
                  </div>
                  <div>
                    <div className="font-bold">{item.product_name}</div>
                    <div className="text-sm text-brand-navy/70">
                      성분 {item.ingredients_count}개
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                >
                  삭제
                </button>
              </div>

              {item.notes && (
                <div className="mt-2 rounded bg-brand-cream/50 p-2 text-sm text-brand-navy/70">
                  💬 {item.notes}
                </div>
              )}

              <div className="mt-2 text-xs text-brand-navy/60">
                {new Date(item.created_at).toLocaleString('ko-KR')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-brand-peach/20 bg-brand-cream p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <div className="text-brand-navy/80">
            {filter === 'all'
              ? '기록된 제품이 없습니다'
              : `${filter === 'good' ? 'Good' : 'Bad'} 제품이 없습니다`}
          </div>
        </div>
      )}
    </div>
  );
}
