import Link from 'next/link';
import Image from 'next/image';
import { createClient, getCurrentUserId } from '@/lib/supabase/server';
import {
  checkMultipleProducts,
  type CompatibilityResult,
} from '@/lib/services/ingredient-analyzer';
import { ProductsList } from '@/components/products/ProductsList';

export const metadata = {
  title: '제품 쇼핑 | TEND+',
  description: '건강에 맞는 제품을 찾아보세요.',
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, category, image_url, description')
    .eq('category', 'shop')
    .order('created_at', { ascending: false })
    .limit(48);

  if (error) {
    return (
      <div className="relative flex min-h-screen flex-col font-sans">
        <div className="fixed inset-0 z-0">
          <Image
            src="/images/products-bg.png"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-brand-cream/90 via-white/70 to-brand-cream/90"
            aria-hidden
          />
        </div>
        <header className="relative z-20 flex items-center justify-between border-b border-brand-peach/30 bg-white/80 px-6 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl w-full items-center justify-between">
            <Link href="/" className="text-lg font-semibold text-brand-navy">
              TEND+
            </Link>
            <Link href="/" className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy">
              홈으로
            </Link>
          </div>
        </header>
        <main className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16">
          <div className="rounded-xl border border-red-200 bg-white p-6 text-red-800 shadow-sm">
            <p className="font-semibold">제품 목록을 불러올 수 없습니다.</p>
            <p className="mt-1 text-sm">{error.message}</p>
          </div>
        </main>
      </div>
    );
  }

  const userId = await getCurrentUserId();
  const isLoggedIn = !!userId;

  let compatibilityMap: Record<string, CompatibilityResult> = {};
  if (userId && products && products.length > 0) {
    const productIds = products.map((p) => p.id);
    const map = await checkMultipleProducts(productIds, userId);
    compatibilityMap = Object.fromEntries(map);
  }

  return (
    <div className="relative flex min-h-screen flex-col font-sans">
      {/* Full-page background image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/products-bg.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-brand-cream/90 via-white/70 to-brand-cream/90"
          aria-hidden
        />
      </div>

      <header className="relative z-20 flex items-center justify-between border-b border-brand-peach/30 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl w-full items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-brand-navy">
            TEND+
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/health"
              className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy"
            >
              건강 프로필
            </Link>
            <Link
              href="/trigger-analysis"
              className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy"
            >
              🔍 성분 수사관
            </Link>
            <Link href="/" className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy">
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold text-brand-navy">제품 쇼핑</h1>

        {!products || products.length === 0 ? (
          <div className="rounded-xl border border-brand-peach/20 bg-white p-12 text-center shadow-sm">
            <p className="text-brand-navy/80">
              등록된 제품이 없습니다.
            </p>
            <p className="mt-2 text-sm text-brand-navy/60">
              곧 다양한 제품을 만나보실 수 있습니다.
            </p>
          </div>
        ) : (
          <ProductsList
            products={products}
            compatibilityMap={compatibilityMap}
            isLoggedIn={isLoggedIn}
          />
        )}
      </main>
    </div>
  );
}
