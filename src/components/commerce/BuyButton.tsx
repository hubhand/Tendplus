'use client';

interface BuyButtonProps {
  productId: string;
  affiliateUrl: string;
  brandId?: string;
  children: React.ReactNode;
}

export function BuyButton({
  productId,
  affiliateUrl,
  brandId,
  children,
}: BuyButtonProps) {
  const handleClick = async () => {
    // 1. link_clicks 기록 (API 호출)
    await fetch('/api/commerce/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, brandId }),
    });

    // 2. 새 탭에서 링크 열기
    window.open(affiliateUrl, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </button>
  );
}
