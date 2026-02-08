import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createAdminClient, getCurrentUserId } from '@/lib/supabase/server';
import { checkProductCompatibility } from '@/lib/services/ingredient-analyzer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = createAdminClient();

  // Fetch product
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  // Fetch ingredients
  const { data: productIngredients } = await supabase
    .from('product_ingredients')
    .select(
      `
      position,
      ingredients (
        id,
        name_ko
      )
    `
    )
    .eq('product_id', id)
    .order('position');

  const ingredients =
    productIngredients?.map((pi) => ({
      position: pi.position,
      ...(pi.ingredients as Record<string, unknown>),
    })) || [];

  // Check compatibility
  const userId = await getCurrentUserId();
  let compatibility = null;

  if (userId) {
    compatibility = await checkProductCompatibility(id, userId);
  }

  return (
    <div className="relative min-h-screen font-sans">
      {/* Background image - consistent with products listing */}
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

      {/* Header - consistent with products listing */}
      <header className="relative z-20 flex items-center justify-between border-b border-brand-peach/30 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-6xl w-full items-center justify-between">
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
              href="/products"
              className="text-sm font-medium text-brand-navy/90 hover:text-brand-navy"
            >
              제품 쇼핑
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto max-w-4xl px-4 py-8">
        {/* Back Button */}
        <Link
          href="/products"
          className="mb-6 inline-block text-brand-navy transition-colors hover:text-brand-pink"
        >
          ← 제품 목록으로
        </Link>

        {/* Product Info Card */}
        <div className="mb-6 overflow-hidden rounded-lg border border-brand-peach/20 bg-white shadow-lg">
          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-brand-cream/50">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand-navy/40">
                  이미지 없음
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {product.brand && (
                <div className="mb-2 text-sm text-brand-navy/70">
                  {product.brand}
                </div>
              )}
              <h1 className="mb-4 text-3xl font-bold text-brand-navy">
                {product.name}
              </h1>

              {product.price && (
                <div className="mb-4 text-2xl font-bold text-brand-navy">
                  ₩{product.price.toLocaleString()}
                </div>
              )}

              {product.description && (
                <p className="mb-6 text-brand-navy/80">
                  {product.description}
                </p>
              )}

              {product.shop_url && (
                <a
                  href={product.shop_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-lg bg-brand-navy px-6 py-3 font-medium text-white transition-colors hover:bg-brand-navy/90"
                >
                  자사몰에서 구매하기 →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Health Compatibility Warning - Danger */}
        {compatibility &&
          !compatibility.compatible &&
          compatibility.warningLevel === 'danger' && (
            <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🚫</div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-red-900">
                    건강 프로필 주의사항
                  </h3>
                  <ul className="space-y-1 text-red-800">
                    {compatibility.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        {/* Health Compatibility Warning - Warning */}
        {compatibility &&
          !compatibility.compatible &&
          compatibility.warningLevel === 'warning' && (
            <div className="mb-6 rounded-lg border-2 border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-yellow-900">
                    건강 프로필 주의사항
                  </h3>
                  <ul className="space-y-1 text-yellow-800">
                    {compatibility.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        {/* Health Compatibility - Safe */}
        {compatibility &&
          compatibility.compatible &&
          userId && (
            <div className="mb-6 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-emerald-900">
                    안전한 제품입니다
                  </h3>
                  <p className="text-emerald-800">
                    이 제품은 회원님의 건강 프로필과 호환됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Ingredients List */}
        {ingredients.length > 0 && (
          <div className="rounded-lg border border-brand-peach/20 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-brand-navy">전성분</h2>
            <div className="space-y-2">
              {ingredients.map((ingredient) => {
                const concern = compatibility?.concerns.find(
                  (c) => c.ingredient === ingredient.name_ko
                );

                return (
                  <div
                    key={ingredient.id}
                    className={`flex items-start gap-2 rounded-lg border p-2 ${
                      concern
                        ? concern.type === 'allergy'
                          ? 'border-red-200 bg-red-50'
                          : 'border-yellow-200 bg-yellow-50'
                        : 'border-brand-peach/10 bg-white'
                    }`}
                  >
                    <span className="min-w-[2rem] text-brand-navy/50">
                      {ingredient.position}.
                    </span>
                    <span className="flex-1 text-brand-navy">
                      {ingredient.name_ko}
                    </span>
                    {concern && (
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          concern.type === 'allergy'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {concern.type === 'allergy' ? '알러지' : '주의'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
