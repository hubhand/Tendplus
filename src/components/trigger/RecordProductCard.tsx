'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const CameraCapture = dynamic(
  () => import('@/components/scan/CameraCapture').then(m => ({ default: m.CameraCapture })),
  { ssr: false }
);

interface RecordProductCardProps {
  userId: string;
  onSuccess: () => void;
}

export function RecordProductCard({ userId, onSuccess }: RecordProductCardProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [reactionType, setReactionType] = useState<'good' | 'bad'>('good');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrData, setOcrData] = useState<any>(null);

  const handleOcrCapture = async (data: any) => {
    setShowCamera(false);
    setOcrData(data);

    // Auto-save product if not exists
    if (data.product_name && data.ingredients_list) {
      setIsSubmitting(true);

      try {
        // Save product first (will be created via OCR API or manually)
        const productResponse = await fetch('/api/trigger-analysis/save-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.product_name,
            ingredients: data.ingredients_list
          })
        });

        if (!productResponse.ok) throw new Error('Failed to save product');

        const { productId } = await productResponse.json();

        // Save trigger analysis
        const analysisResponse = await fetch('/api/trigger-analysis/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            reactionType,
            notes
          })
        });

        if (analysisResponse.ok) {
          alert(`✅ ${reactionType === 'good' ? 'Good' : 'Bad'} 제품으로 기록되었습니다!`);
          setOcrData(null);
          setNotes('');
          onSuccess();
        } else {
          throw new Error('Failed to save analysis');
        }
      } catch (error) {
        console.error('Save error:', error);
        alert('저장 실패. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Reaction Type Selection */}
      <div className="rounded-lg border border-brand-peach/20 bg-brand-cream p-6">
        <h3 className="mb-4 text-lg font-bold text-brand-navy">제품 반응 선택</h3>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setReactionType('good')}
            className={`rounded-lg border-2 p-6 transition-all ${
              reactionType === 'good'
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-brand-peach/40 bg-white text-brand-navy hover:border-brand-pink'
            }`}
          >
            <div className="text-4xl mb-2">✅</div>
            <div className={`font-bold text-lg ${reactionType === 'good' ? 'text-white' : 'text-brand-navy'}`}>Good</div>
            <div className={`text-sm ${reactionType === 'good' ? 'text-white/90' : 'text-brand-navy/70'}`}>
              트러블 없음, 만족
            </div>
          </button>

          <button
            onClick={() => setReactionType('bad')}
            className={`rounded-lg border-2 p-6 transition-all ${
              reactionType === 'bad'
                ? 'border-red-500 bg-red-500 text-white'
                : 'border-brand-peach/40 bg-white text-brand-navy hover:border-red-300'
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className={`font-bold text-lg ${reactionType === 'bad' ? 'text-white' : 'text-brand-navy'}`}>Bad</div>
            <div className={`text-sm ${reactionType === 'bad' ? 'text-white/90' : 'text-brand-navy/70'}`}>
              트러블 발생, 불만족
            </div>
          </button>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 빨갛게 올라옴, 가려움증, 촉촉함 등"
            rows={3}
            className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50"
          />
        </div>

        {/* Camera Button */}
        <button
          onClick={() => setShowCamera(true)}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-navy px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:opacity-50"
        >
          📷 제품 성분표 촬영하기
        </button>

        {/* OCR Preview */}
        {ocrData && (
          <div className="mt-4 rounded-lg bg-white p-4">
            <div className="mb-2 text-sm text-brand-navy/70">
              촬영된 제품:
            </div>
            <div className="font-medium text-brand-navy">{ocrData.product_name || '제품명 없음'}</div>
            <div className="mt-2 text-sm text-brand-navy/70">
              성분: {ocrData.ingredients_list?.length || 0}개
            </div>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-brand-peach/30 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-peach/30 p-4">
              <h3 className="text-lg font-bold text-brand-navy">제품 성분표 촬영</h3>
              <button
                onClick={() => setShowCamera(false)}
                className="text-2xl text-brand-navy/70 hover:text-brand-navy"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <CameraCapture onCapture={handleOcrCapture} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
