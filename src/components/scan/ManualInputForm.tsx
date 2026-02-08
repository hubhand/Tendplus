'use client';

import { useState } from 'react';

interface ManualInputFormProps {
  onCapture: (data: {
    product_name?: string;
    ingredients_list?: string[];
    confidence?: number;
  }) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  /** 뒤로 버튼 텍스트 (예: "← 카메라로 돌아가기") */
  backButtonText?: string;
}

export function ManualInputForm({
  onCapture,
  onBack,
  showBackButton = false,
  backButtonText = '← 뒤로',
}: ManualInputFormProps) {
  const [productName, setProductName] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ingredients_list = ingredientsText
      .split(/[,，\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (ingredients_list.length === 0) return;

    onCapture({
      product_name: productName.trim() || undefined,
      ingredients_list,
      confidence: 1,
    });
  };

  return (
    <div className="w-full max-w-md">
      {showBackButton && onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          {backButtonText}
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="productName"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            제품명 (선택)
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="예: 수분 크림"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="ingredients"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            성분 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ingredients"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder={
              '전체 성분을 입력하거나, 확인이 필요한 알러지 성분만 입력해도 됩니다\n예: 정제수, 글리세린, 땅콩\n또는 알러지 확인용: 땅콩, 대두'
            }
            rows={5}
            required
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            쉼표 또는 줄바꿈으로 구분. 땅콩 알러지 등 확인할 성분만 입력해도 됩니다.
          </p>
        </div>

        <button
          type="submit"
          disabled={!ingredientsText.trim()}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white disabled:opacity-50"
        >
          확인
        </button>
      </form>
    </div>
  );
}
