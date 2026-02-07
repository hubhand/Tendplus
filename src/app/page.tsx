import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4 dark:bg-black dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold">
          TEND+
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              로그인
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              회원가입
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-16 py-32">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            TEND+ | 식품 안전 분석
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            건강 상태 기반 식품 성분 분석 PWA
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <SignedOut>
            <Link
              href="/sign-up"
              className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-600 px-6 text-white transition-colors hover:bg-emerald-700 md:w-auto"
            >
              회원가입하고 시작하기
            </Link>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/health"
                className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-auto"
              >
                건강 프로필
              </Link>
              <Link
                href="/scan"
                className="flex h-12 w-full items-center justify-center rounded-full bg-emerald-600 px-6 text-white transition-colors hover:bg-emerald-700 md:w-auto"
              >
                제품 스캔
              </Link>
            </div>
          </SignedIn>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="/instruments"
          >
            Supabase 연결 테스트
          </Link>
        </div>
      </main>
    </div>
  );
}
