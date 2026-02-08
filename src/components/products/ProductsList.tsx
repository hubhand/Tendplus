'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CompatibilityResult } from '@/lib/services/ingredient-analyzer';

interface Product {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  image_url?: string;
  description?: string;
}

interface ProductsListProps {
  products: Product[];
  compatibilityMap: Record<string, CompatibilityResult>;
  isLoggedIn: boolean;
}

type FilterType = 'all' | 'safe' | 'warning' | 'danger';

export function ProductsList({ products, compatibilityMap, isLoggedIn }: ProductsListProps) {
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter products based on compatibility
  const filteredProducts = products.filter(product => {
    if (!isLoggedIn || filter === 'all') return true;
    
    const compatibility = compatibilityMap[product.id];
    if (!compatibility) return filter === 'all';
    
    return compatibility.warningLevel === filter;
  });

  // Count by filter type
  const counts = {
    all: products.length,
    safe: 0,
    warning: 0,
    danger: 0
  };

  if (isLoggedIn) {
    products.forEach(product => {
      const level = compatibilityMap[product.id]?.warningLevel || 'safe';
      counts[level]++;
    });
  }

  return (
    <div>
      {/* Filter Buttons */}
      {isLoggedIn && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'border-transparent bg-brand-navy text-white'
                : 'border-brand-peach/40 bg-white text-brand-navy hover:border-brand-pink'
            }`}
          >
            전체보기 ({counts.all})
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
              filter === 'safe'
                ? 'border-transparent bg-brand-navy text-white'
                : 'border-brand-peach/40 bg-white text-brand-navy hover:border-brand-pink'
            }`}
          >
            ✅ 안전 ({counts.safe})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
              filter === 'warning'
                ? 'border-transparent bg-brand-navy text-white'
                : 'border-brand-peach/40 bg-white text-brand-navy hover:border-brand-pink'
            }`}
          >
            ⚠️ 주의 ({counts.warning})
          </button>
          <button
            onClick={() => setFilter('danger')}
            className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
              filter === 'danger'
                ? 'border-transparent bg-brand-navy text-white'
                : 'border-brand-peach/40 bg-white text-brand-navy hover:border-brand-pink'
            }`}
          >
            🚫 위험 ({counts.danger})
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const compatibility = compatibilityMap[product.id];
          
          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="relative overflow-hidden rounded-xl border border-brand-peach/10 bg-white shadow-sm transition-all hover:border-brand-pink hover:shadow-md"
            >
              {/* Badge */}
              {isLoggedIn && compatibility && (
                <div className="absolute top-3 right-3 z-10">
                  {compatibility.warningLevel === 'safe' && (
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      ✅ 안전
                    </span>
                  )}
                  {compatibility.warningLevel === 'warning' && (
                    <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                      ⚠️ 주의
                    </span>
                  )}
                  {compatibility.warningLevel === 'danger' && (
                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                      🚫 위험
                    </span>
                  )}
                </div>
              )}

              {/* Image */}
              <div className="relative aspect-square bg-brand-cream/50">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand-navy/40">
                    No Image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                {product.brand && (
                  <div className="mb-1 text-sm text-brand-navy/70">
                    {product.brand}
                  </div>
                )}
                <h3 className="mb-2 text-lg font-bold text-brand-navy">{product.name}</h3>
                {product.price && (
                  <div className="text-xl font-bold text-brand-navy">
                    ₩{product.price.toLocaleString()}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-xl border border-brand-peach/20 bg-white py-12 text-center text-brand-navy/80 shadow-sm">
          조건에 맞는 제품이 없습니다.
        </div>
      )}
    </div>
  );
}
