import Link from "next/link";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="text-lg font-semibold text-white">
          TEND+
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/health"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            건강 프로필
          </Link>
          <Link
            href="/products"
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            제품 쇼핑
          </Link>
          <SignedOut>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-white/90 hover:text-white"
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

      <main className="relative flex flex-1">
        {/* Hero section with background image */}
        <section className="relative flex min-h-screen w-full items-center justify-center">
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Light overlay - keep background bright and visible */}
          <div className="absolute inset-0 bg-black/10" aria-hidden />
          {/* Centered content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 py-24 text-center">
            <h1 className="max-w-4xl text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
              TEND+ | 나만의 쇼핑 청정 지역을 찾아서
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/90 sm:text-lg">
              건강 상태 기반 맞춤 쇼핑
            </p>
            {/* CTA buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full bg-emerald-600 px-8 text-base font-semibold text-white shadow-lg shadow-emerald-900/50 transition hover:bg-emerald-700"
                >
                  회원가입하고 시작하기
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  제품 쇼핑
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/health"
                  className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  건강 프로필
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  제품 쇼핑
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
