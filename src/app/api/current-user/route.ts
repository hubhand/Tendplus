import { getCurrentUserId } from '@/lib/supabase/server';

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({ userId: null }, { status: 401 });
    }

    return Response.json({ userId });
  } catch (error) {
    console.error('Current user API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
