"use client"

import Image from "next/image"

export function DetailSection() {
  const scrollToForm = () => {
    const formEl = document.getElementById("registration-form")
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative w-full">
      {/* Full-width detail page image */}
      <Image
        src="/images/detail-page.jpg"
        alt="TEND+ 상세 설명 - AI 클린 뷰, 성분 분석, 세이프티 가이드, 스마트 팬트리 기능 소개"
        width={800}
        height={4000}
        className="w-full h-auto"
        priority
      />

      {/* Invisible click overlay: user can click anywhere on the detail image to scroll to the form */}
      <button
        onClick={scrollToForm}
        className="absolute inset-0 w-full h-full cursor-pointer"
        style={{ background: "transparent" }}
        aria-label="사전 신청 폼으로 이동"
        type="button"
      >
        <span className="sr-only">{"사전 신청 폼으로 이동"}</span>
      </button>
    </section>
  )
}
