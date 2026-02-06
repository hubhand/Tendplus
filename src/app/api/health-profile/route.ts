import { getCurrentUserId, createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/security/encryption';

const SENSITIVE_FIELDS = [
  'allergies',
  'medications',
  'skin_concerns',
  'chronic_conditions',
  'blacklist_ingredients',
] as const;

function isEncrypted(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.split(':').length === 3 &&
    /^[a-f0-9]+:[a-f0-9]+:[a-f0-9]+$/i.test(value)
  );
}

function decryptField(value: unknown): unknown {
  if (value == null) return value;
  if (isEncrypted(value)) {
    try {
      return JSON.parse(decrypt(value));
    } catch {
      return value;
    }
  }
  return value;
}

function encryptField(value: unknown): string {
  return encrypt(JSON.stringify(value ?? []));
}

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('health_profiles GET error:', error);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  if (!data) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const result = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    result[field] = decryptField(data[field]);
  }

  return Response.json(result);
}

export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const field of SENSITIVE_FIELDS) {
    if (field in body) {
      update[field] = encryptField(body[field]);
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('health_profiles')
    .update(update)
    .eq('user_id', userId);

  if (error) {
    console.error('health_profiles PUT error:', error);
    return Response.json({ error: 'DB error' }, { status: 500 });
  }

  return Response.json({ success: true });
}
