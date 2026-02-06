'use client';

import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { resizeImageClient } from '@/lib/utils/image-resize.client';

interface CameraCaptureProps {
  onCapture: (data: { product_name?: string; ingredients?: string[]; confidence?: number }) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Capture failed:', error);
      alert('촬영 실패. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="rounded-lg"
      />

      <button
        onClick={handleCapture}
        disabled={isProcessing}
        className="px-6 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
      >
        {isProcessing ? '처리 중...' : '📷 촬영'}
      </button>
    </div>
  );
}
