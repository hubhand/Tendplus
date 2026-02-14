"use client"

import { useEffect, useRef } from "react"

interface SuccessModalProps {
  open: boolean
  onClose: () => void
}

export function SuccessModal({ open, onClose }: SuccessModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="사전 신청 완료"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center shadow-xl animate-in fade-in zoom-in-95"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="text-5xl mb-4" aria-hidden="true">
          {"🎉"}
        </div>
        <h2
          className="text-xl font-bold mb-3"
          style={{ color: "#1b2240" }}
        >
          {"신청이 완료되었습니다."}
        </h2>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{ color: "#555555" }}
        >
          {"곧 연락드리겠습니다!"}
        </p>
        <button
          onClick={onClose}
          className="rounded-full px-8 py-3 text-base font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#f8a4b8", color: "#ffffff" }}
        >
          {"확인"}
        </button>
      </div>
    </div>
  )
}
