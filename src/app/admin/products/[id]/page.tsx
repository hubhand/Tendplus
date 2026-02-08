import { redirect, notFound } from 'next/navigation';
import { isAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/server';
import ProductForm from '@/components/admin/ProductForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;

  const admin = await isAdmin();
  if (!admin) {
    redirect('/');
  }

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
      ingredients (
        name_ko
      )
    `
    )
    .eq('product_id', id)
    .order('position');

  const ingredientsList =
    productIngredients?.map((pi) => (pi.ingredients as { name_ko?: string })?.name_ko).filter(
      Boolean
    ) || [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-brand-navy">제품 수정</h1>
        <p className="text-brand-navy/70">
          제품 정보를 수정합니다
        </p>
      </div>

      <ProductForm
        initialData={{
          id: product.id,
          name: product.name || '',
          brand: product.brand || '',
          price: product.price?.toString() || '',
          shop_url: product.shop_url || '',
          image_url: product.image_url || '',
          description: product.description || '',
          ingredients: ingredientsList.join(', '),
        }}
        isEdit={true}
      />
    </div>
  );
}
