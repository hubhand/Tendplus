"use client"

import React from "react"

import { useState, useCallback, useRef, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { SuccessModal } from "./success-modal"

const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbzFNFvDF92_tav8BlNkP8eE-EsIXU8-xMpqX-nCaEzsxQJsCg8I7fu_Yh4cEILKqeYDIQ/exec"

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "")
  const limited = digits.slice(0, 11)
  if (limited.length <= 3) return limited
  if (limited.length <= 7) return `${limited.slice(0, 3)}-${limited.slice(3)}`
  return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`
}

/*
 * Image: 864 x 1180 px - precision pixel measurements
 */
const F = {
  left: "15.05%",
  width: "69.9%",
  height: "6.53%",
  name:  { top: "41.59%" },
  phone: { top: "52.37%" },
  email: { top: "63.15%" },
  cta:   { top: "75.68%", height: "5.68%" },
}

export function PreRegistrationForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    phone?: string
    email?: string
  }>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const errorModalOverlayRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  /* 검증 에러 모달: 배경 스크롤 잠금 + ESC로 닫기 */
  useEffect(() => {
    if (showErrorModal) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [showErrorModal])
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showErrorModal) setShowErrorModal(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [showErrorModal])

  /* Apply placeholder color via DOM to avoid hydration issues with <style> */
  useEffect(() => {
    const applyPlaceholderColor = (
      ref: React.RefObject<HTMLInputElement | null>,
      hasError: boolean,
    ) => {
      if (!ref.current) return
      const el = ref.current
      const color = hasError ? "#FA9EBC" : "#9ca3af"
      // Create or update a scoped style element
      const styleId = `ph-${el.id}`
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null
      if (!styleEl) {
        styleEl = document.createElement("style")
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      styleEl.textContent = `#${el.id}::placeholder { color: ${color} !important; }`
    }
    applyPlaceholderColor(nameRef, !!errors.name)
    applyPlaceholderColor(phoneRef, !!errors.phone)
    applyPlaceholderColor(emailRef, !!errors.email)
  }, [errors.name, errors.phone, errors.email])

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      setPhone(formatted)
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }))
    },
    [errors.phone],
  )

  const validate = () => {
    const errs: { name?: string; phone?: string; email?: string } = {}
    if (!name.trim()) errs.name = "이름을 입력해주세요"
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10)
      errs.phone = "올바른 연락처를 입력해주세요"
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "올바른 이메일을 입력해주세요"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!validate()) {
      setShowErrorModal(true)
      return
    }
    setIsSubmitting(true)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15초 타임아웃
    try {
      await fetch(WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone,
          email: email.trim(),
        }),
        mode: "no-cors", // Google Apps Script는 다른 도메인에서 응답을 읽을 수 없어 no-cors 사용. 요청은 전달됨.
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      setShowSuccess(true)
      setName("")
      setPhone("")
      setEmail("")
      setErrors({})
    } catch {
      clearTimeout(timeoutId)
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section id="registration-form" className="relative w-full">
        <div ref={containerRef} className="relative w-full">
          {/* Background image */}
          <Image
            src="/images/pre-registration.jpg"
            alt="지금 사전 신청하고 3개월 무료 혜택을 받으세요! TEND+ 사전 신청서"
            width={864}
            height={1180}
            className="block w-full h-auto"
            priority
          />

          {/* Loading overlay */}
          {isSubmitting && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{ backgroundColor: "rgba(248, 164, 184, 0.6)" }}
            >
              <Loader2
                className="animate-spin"
                size={48}
                style={{ color: "#ffffff" }}
              />
            </div>
          )}

          {/* Overlay form */}
          <form
            onSubmit={handleSubmit}
            className="absolute inset-0 w-full h-full z-10"
            noValidate
            aria-label="TEND+ 사전 신청 폼"
          >
            {/* 이름 */}
            <div
              className="absolute"
              style={{
                top: F.name.top,
                left: F.left,
                width: F.width,
                height: F.height,
              }}
            >
              <label htmlFor="reg-name" className="sr-only">
                이름
              </label>
              <input
                ref={nameRef}
                id="reg-name"
                type="text"
                placeholder={errors.name || "성함을 입력해주세요"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                className="w-full h-full rounded-full outline-none text-center"
                style={{
                  backgroundColor: "transparent",
                  color: "#2d2d2d",
                  caretColor: "#2d2d2d",
                  fontSize: "clamp(13px, 1.8vw, 18px)",
                  lineHeight: 1,
                  border: "none",
                  boxShadow: "none",
                }}
                aria-invalid={!!errors.name}
                disabled={isSubmitting}
              />
            </div>

            {/* 연락처 */}
            <div
              className="absolute"
              style={{
                top: F.phone.top,
                left: F.left,
                width: F.width,
                height: F.height,
              }}
            >
              <label htmlFor="reg-phone" className="sr-only">
                연락처
              </label>
              <input
                ref={phoneRef}
                id="reg-phone"
                type="tel"
                placeholder={errors.phone || "010-0000-0000"}
                value={phone}
                onChange={handlePhoneChange}
                className="w-full h-full rounded-full outline-none text-center"
                style={{
                  backgroundColor: "transparent",
                  color: "#2d2d2d",
                  caretColor: "#2d2d2d",
                  fontSize: "clamp(13px, 1.8vw, 18px)",
                  lineHeight: 1,
                  border: "none",
                  boxShadow: "none",
                }}
                aria-invalid={!!errors.phone}
                disabled={isSubmitting}
              />
            </div>

            {/* 이메일 */}
            <div
              className="absolute"
              style={{
                top: F.email.top,
                left: F.left,
                width: F.width,
                height: F.height,
              }}
            >
              <label htmlFor="reg-email" className="sr-only">
                이메일
              </label>
              <input
                ref={emailRef}
                id="reg-email"
                type="email"
                placeholder={errors.email || "메일 주소를 입력해주세요"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className="w-full h-full rounded-full outline-none text-center"
                style={{
                  backgroundColor: "transparent",
                  color: "#2d2d2d",
                  caretColor: "#2d2d2d",
                  fontSize: "clamp(13px, 1.8vw, 18px)",
                  lineHeight: 1,
                  border: "none",
                  boxShadow: "none",
                }}
                aria-invalid={!!errors.email}
                disabled={isSubmitting}
              />
            </div>

            {/* CTA 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="absolute cursor-pointer rounded-full disabled:opacity-60"
              style={{
                top: F.cta.top,
                left: F.left,
                width: F.width,
                height: F.cta.height,
                backgroundColor: "transparent",
                border: "none",
              }}
              aria-label={isSubmitting ? "신청 중..." : "무료 사전 신청하기"}
            >
              <span className="sr-only">
                {isSubmitting ? "신청 중..." : "무료 사전 신청하기"}
              </span>
            </button>
          </form>
        </div>
      </section>

      <SuccessModal open={showSuccess} onClose={() => setShowSuccess(false)} />

      {/* 검증 에러 모달 (올바른 정보 입력 안내) */}
      {showErrorModal && (
        <div
          ref={errorModalOverlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === errorModalOverlayRef.current) setShowErrorModal(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="입력 안내"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center shadow-xl animate-in fade-in zoom-in-95"
            style={{ backgroundColor: "#ffffff" }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: "#1b2240" }}
            >
              올바른 정보를 입력해주세요
            </h2>
            <button
              onClick={() => setShowErrorModal(false)}
              className="rounded-full px-8 py-3 text-base font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#f8a4b8", color: "#ffffff" }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  )
}
