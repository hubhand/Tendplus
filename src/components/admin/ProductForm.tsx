'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  initialData?: {
    id?: string;
    name: string;
    brand: string;
    price: string;
    shop_url: string;
    image_url: string;
    description: string;
    ingredients: string;
  };
  isEdit?: boolean;
}

export default function ProductForm({
  initialData,
  isEdit = false,
}: ProductFormProps = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    brand: initialData?.brand ?? '',
    price: initialData?.price ?? '',
    shop_url: initialData?.shop_url ?? '',
    image_url: initialData?.image_url ?? '',
    description: initialData?.description ?? '',
    ingredients: initialData?.ingredients ?? '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit && initialData?.id && { id: initialData.id }),
          name: formData.name,
          brand: formData.brand || null,
          price: formData.price ? parseFloat(formData.price) : null,
          shop_url: formData.shop_url || null,
          image_url: formData.image_url || null,
          description: formData.description || null,
          ingredients: formData.ingredients
            .split(',')
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        const error = await response.json();
        alert(
          (isEdit ? '제품 수정' : '제품 등록') +
            ' 실패: ' +
            (error.error || '알 수 없는 오류')
        );
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(
        (isEdit ? '제품 수정' : '제품 등록') + ' 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="rounded-lg border border-brand-peach/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">기본 정보</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              제품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="예: 수분 보습 크림"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">브랜드</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="예: 네이처리퍼블릭"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">가격 (원)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="29900"
            />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="rounded-lg border border-brand-peach/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">링크</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              자사몰 링크
            </label>
            <input
              type="url"
              name="shop_url"
              value={formData.shop_url}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="https://shop.example.com/product/123"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">이미지 URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="https://example.com/images/product.jpg"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-brand-peach/20 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-brand-navy">설명 및 성분</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">제품 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="제품에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-brand-navy">
              성분 (쉼표로 구분)
            </label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="물, 글리세린, 디메치콘, ..."
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-navy px-6 py-3 font-medium text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (isEdit ? '수정 중...' : '등록 중...') : (isEdit ? '제품 수정' : '제품 등록')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-brand-peach px-6 py-3 font-medium text-brand-navy transition-colors hover:bg-brand-pink/80"
        >
          취소
        </button>
      </div>
    </form>
  );
}
