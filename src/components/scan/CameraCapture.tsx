'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { resizeImageClient } from '@/lib/utils/image-resize.client';
import { ManualInputForm } from './ManualInputForm';

interface CameraCaptureProps {
  onCapture: (data: {
    product_name?: string;
    ingredients_list?: string[];
    confidence?: number;
  }) => void;
}

type FacingMode = 'user' | 'environment';

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleUserMedia = (stream: MediaStream | null) => {
    videoTrackRef.current = stream?.getVideoTracks()[0] ?? null;
  };

  const handleFocus = async () => {
    const track = videoTrackRef.current;
    if (!track) return;

    const caps = track.getCapabilities?.() as { focusMode?: string[] } | undefined;
    if (!caps?.focusMode?.length) return;

    setIsFocusing(true);
    try {
      await track.applyConstraints({
        focusMode: 'single-shot',
      } as unknown as MediaTrackConstraints);
      await new Promise((r) => setTimeout(r, 600));
    } catch {
      // focusMode 미지원 시 무시
    } finally {
      setIsFocusing(false);
    }
  };

  const handleCapture = async () => {
    setIsProcessing(true);

    try {
      await handleFocus();
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

      if (response.status === 401) {
        router.push('/sign-in?redirect_url=' + encodeURIComponent('/scan'));
        return;
      }

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
    focusMode: { ideal: 'continuous' },
  } as MediaTrackConstraints;

  if (showManualInput) {
    return (
      <ManualInputForm
        onCapture={onCapture}
        onBack={() => setShowManualInput(false)}
        showBackButton
        backButtonText="← 카메라로 돌아가기"
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
          onUserMedia={handleUserMedia}
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

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={handleFocus}
          disabled={isFocusing || isProcessing}
          className="px-4 py-3 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          title="촬영 전 초점을 잡습니다"
        >
          {isFocusing ? '초점 잡는 중...' : '🎯 초점'}
        </button>
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
