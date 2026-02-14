import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_KR } from 'next/font/google'

import './globals.css'

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-noto-sans-kr',
})

export const metadata: Metadata = {
  title: "TEND+ | 나만의 쇼핑 청정 지역을 찾아서",
  description: "TEND+는 AI 기반으로 당신과 가족에게 안전한 상품만을 추천합니다. 지금 사전 신청하고 3개월 무료 혜택을 받으세요!",
}

export const viewport: Viewport = {
  themeColor: '#f8a4b8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKr.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
