'use client';

import { useState } from 'react';

interface DeleteProductModalProps {
  productId: string;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteProductModal({
  productId,
  productName,
  onClose,
  onSuccess,
}: DeleteProductModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert('삭제 실패: ' + (error.error || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-md w-full rounded-lg border border-brand-peach/20 bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-xl font-bold text-brand-navy">제품 삭제</h3>

        <p className="mb-6 text-brand-navy/80">
          <strong className="text-brand-navy">
            &quot;{productName}&quot;
          </strong>
          을(를) 정말 삭제하시겠습니까?
          <br />
          <br />
          이 작업은 되돌릴 수 없으며, 다음 데이터도 함께 삭제됩니다:
        </p>

        <ul className="mb-6 list-inside list-disc space-y-1 text-sm text-brand-navy/80">
          <li>제품 정보</li>
          <li>성분 연결 정보</li>
          <li>스캔 기록 (있는 경우)</li>
        </ul>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-brand-peach px-4 py-2 text-brand-navy transition-colors hover:bg-brand-pink/80 disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
