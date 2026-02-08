import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import "./globals.css";

/**
 * Clerk 한국어 로컬라이제이션
 * - koKR: SignIn, SignUp 등 모든 Clerk 컴포넌트를 한국어로 표시
 * - applicationName: Clerk Dashboard → Customization에서 설정
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEND+ | 나만의 쇼핑 청정 지역을 찾아서",
  description: "건강 상태 기반 맞춤 쇼핑",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
