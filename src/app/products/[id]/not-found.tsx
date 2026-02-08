import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-6">
      <h1 className="mb-2 text-2xl font-bold text-brand-navy">
        제품을 찾을 수 없습니다
      </h1>
      <p className="mb-6 text-brand-navy/70">
        요청하신 제품이 삭제되었거나 존재하지 않습니다.
      </p>
      <Link
        href="/products"
        className="rounded-lg bg-brand-navy px-6 py-3 text-white transition-colors hover:bg-brand-navy/90"
      >
        제품 목록으로
      </Link>
    </div>
  );
}
