'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DeleteProductModal } from './DeleteProductModal';

interface Product {
  id: string;
  name: string;
  category: string;
  price?: number;
  created_at: string;
}

interface ProductsTableProps {
  initialProducts: Product[];
}

export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deleteModal, setDeleteModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteSuccess = () => {
    setDeleteModal(null);
    router.refresh();
  };

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-brand-peach/20 bg-white">
        <table className="w-full">
          <thead className="border-b border-brand-peach/20 bg-brand-peach/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-navy">
                제품명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-navy">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-navy">
                가격
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-navy">
                등록일
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-brand-navy">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-peach/20">
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-brand-cream"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-brand-navy">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        product.category === 'shop'
                          ? 'bg-brand-peach/50 text-brand-navy'
                          : 'bg-brand-cream text-brand-navy/80'
                      }`}
                    >
                      {product.category === 'shop' ? '쇼핑' : '스캔'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-navy">
                    {product.price
                      ? `₩${product.price.toLocaleString()}`
                      : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-navy/70">
                    {new Date(product.created_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-brand-navy hover:text-brand-navy/80"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() =>
                        setDeleteModal({ id: product.id, name: product.name })
                      }
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-8 text-center text-brand-navy/70"
                >
                  등록된 제품이 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteModal && (
        <DeleteProductModal
          productId={deleteModal.id}
          productName={deleteModal.name}
          onClose={() => setDeleteModal(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
