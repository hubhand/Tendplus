import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-brand-navy">제품 추가</h1>
        <p className="text-brand-navy/70">
          새로운 쇼핑몰 제품을 등록합니다
        </p>
      </div>

      <ProductForm />
    </div>
  );
}
