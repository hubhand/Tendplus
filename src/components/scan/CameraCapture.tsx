'use client';

import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { resizeImageClient } from '@/lib/utils/image-resize.client';

interface CameraCaptureProps {
  onCapture: (data: {
    product_name?: string;
    ingredients_list?: string[];
    confidence?: number;
  }) => void;
}

type FacingMode = 'user' | 'environment';

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleCapture = async () => {
    setIsProcessing(true);

    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) throw new Error('No image');

      const resized = await resizeImageClient(imageSrc, {
        maxWidth: 768,
        quality: 0.8,
      });

      const response = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: resized }),
      });

      const result = await response.json();

      if (result.success) {
        onCapture(result.data);
      } else if (result.needsManualInput) {
        setShowManualInput(true);
      } else {
        throw new Error(result.error ?? '촬영 실패');
      }
    } catch (error) {
      console.error('Capture failed:', error);
      setShowManualInput(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const videoConstraints = {
    facingMode: { ideal: facingMode },
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  if (showManualInput) {
    return (
      <ManualInputForm
        onCapture={onCapture}
        onBack={() => setShowManualInput(false)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Webcam
          key={facingMode}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-lg"
        />
        <button
          type="button"
          onClick={toggleCamera}
          className="absolute bottom-2 right-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          title={facingMode === 'user' ? '후면 카메라로 전환' : '전면 카메라로 전환'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
            <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
        >
          {isProcessing ? '처리 중...' : '📷 촬영'}
        </button>
        <button
          type="button"
          onClick={() => setShowManualInput(true)}
          className="px-6 py-3 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          직접 입력
        </button>
      </div>
    </div>
  );
}

interface ManualInputFormProps {
  onCapture: (data: {
    product_name?: string;
    ingredients_list?: string[];
    confidence?: number;
  }) => void;
  onBack: () => void;
}

function ManualInputForm({ onCapture, onBack }: ManualInputFormProps) {
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
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        ← 카메라로 돌아가기
      </button>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
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
          <label htmlFor="ingredients" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            성분 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ingredients"
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder={'전체 성분을 입력하거나, 확인이 필요한 알러지 성분만 입력해도 됩니다\n예: 정제수, 글리세린, 땅콩\n또는 알러지 확인용: 땅콩, 대두'}
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
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
        >
          확인
        </button>
      </form>
    </div>
  );
}
