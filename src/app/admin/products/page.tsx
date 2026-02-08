import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ProductsTable } from '@/components/admin/ProductsTable';

export default async function AdminProductsPage() {
  // Check admin permission
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  // Fetch all products
  const supabase = createAdminClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-brand-navy">제품 관리</h1>
          <p className="text-brand-navy/70">
            쇼핑몰 제품을 추가하고 관리합니다
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-brand-navy px-6 py-3 font-medium text-white transition-colors hover:bg-brand-navy/90"
        >
          + 제품 추가
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-brand-peach/20 bg-white p-6">
          <div className="mb-1 text-sm text-brand-navy/70">
            전체 제품
          </div>
          <div className="text-2xl font-bold text-brand-navy">{products?.length || 0}</div>
        </div>
        <div className="rounded-lg border border-brand-peach/20 bg-white p-6">
          <div className="mb-1 text-sm text-brand-navy/70">
            쇼핑 제품
          </div>
          <div className="text-2xl font-bold text-brand-navy">
            {products?.filter((p) => p.category === 'shop').length || 0}
          </div>
        </div>
        <div className="rounded-lg border border-brand-peach/20 bg-white p-6">
          <div className="mb-1 text-sm text-brand-navy/70">
            스캔 제품
          </div>
          <div className="text-2xl font-bold text-brand-navy">
            {products?.filter((p) => p.category === 'scanned').length || 0}
          </div>
        </div>
      </div>

      {/* Product List */}
      <ProductsTable initialProducts={products || []} />
    </div>
  );
}
