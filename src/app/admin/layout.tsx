import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Admin Header */}
      <header className="border-b border-brand-peach/30 bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-brand-navy">
              Tend+ Admin
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/admin/products"
                className="text-brand-navy/80 hover:text-brand-navy"
              >
                제품 관리
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-brand-navy px-4 py-2 text-white transition-colors hover:bg-brand-navy/90">
                  로그인
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main>
        {children}
      </main>
    </div>
  );
}
