import { getCurrentUserId, createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const userId = await getCurrentUserId(); // null 허용 (비로그인 클릭)
  let productId: string | undefined;
  let brandId: string | undefined;
  try {
    const body = await req.json();
    productId = body?.productId;
    brandId = body?.brandId;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('link_clicks').insert({
    user_id: userId,
    product_id: productId ?? null,
    brand_id: brandId ?? null,
  });

  if (error) {
    console.error('link_clicks insert error:', error);
    return Response.json({ error: 'Failed to record click' }, { status: 500 });
  }

  return Response.json({ success: true });
}
