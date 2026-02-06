'use client';
/// <reference lib="dom" />
if (typeof window === 'undefined') throw new Error('This module can only be used in browser!');

export async function resizeImageClient(
  base64: string,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<string> {
  const { maxWidth = 768, maxHeight = 768, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const resized = canvas.toDataURL('image/jpeg', quality);
      resolve(resized);
    };

    img.onerror = () => reject(new Error('Image load failed'));
    img.src = base64;
  });
}
