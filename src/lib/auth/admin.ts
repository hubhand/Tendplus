import { currentUser } from '@clerk/nextjs/server';

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();

    if (!user) return false;

    // Check if user has admin role in Clerk metadata
    const role = user.publicMetadata?.role as string | undefined;

    // Or check by email (fallback method)
    const adminEmails =
      process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];
    const userEmail = user.emailAddresses[0]?.emailAddress || '';
    const isAdminEmail = adminEmails.includes(userEmail);

    return role === 'admin' || isAdminEmail;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function getAdminUser() {
  const user = await currentUser();
  const admin = await isAdmin();

  if (!admin) {
    return null;
  }

  return user;
}
