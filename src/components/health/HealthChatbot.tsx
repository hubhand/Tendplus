'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const CameraCapture = dynamic(
  () => import('@/components/scan/CameraCapture').then((m) => ({ default: m.CameraCapture })),
  { ssr: false }
);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function HealthChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply ?? '';

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <>
    <div className="flex h-[600px] flex-col overflow-hidden rounded-lg border border-brand-peach/30">
      <div className="flex-1 space-y-4 overflow-y-auto bg-brand-cream/30 p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[80%] rounded-lg bg-brand-navy px-4 py-3 text-white'
                  : 'max-w-[80%] rounded-lg border border-brand-peach/20 bg-white px-4 py-3 text-brand-navy'
              }
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg border border-brand-peach/20 bg-white px-4 py-3 text-brand-navy">
              <span className="animate-pulse">AI가 응답 중...</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-brand-peach/30 bg-white p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowCamera(true)}
            disabled={isLoading}
            className="rounded-lg p-2 transition-colors hover:bg-brand-peach/50 disabled:opacity-50"
            aria-label="사진 촬영"
            title="사진으로 정보 입력"
          >
            <span className="text-xl">📷</span>
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="예: 땅콩 알러지가 있어요"
            className="flex-1 rounded-lg border border-brand-peach/40 bg-white px-4 py-2 text-brand-navy placeholder:text-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-brand-navy px-6 py-2 text-white transition hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            전송
          </button>
        </div>
      </div>
    </div>

    {showCamera && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg border border-brand-peach/30 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-peach/30 p-4">
            <h3 className="text-lg font-bold text-brand-navy">사진으로 건강 정보 입력</h3>
            <button
              onClick={() => setShowCamera(false)}
              className="text-2xl leading-none text-brand-navy/70 hover:text-brand-navy"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <CameraCapture
              onCapture={async (data) => {
                setShowCamera(false);

                const parts: string[] = [];
                if (data.product_name) {
                  parts.push(`제품명: ${data.product_name}`);
                }
                if (data.ingredients_list && data.ingredients_list.length > 0) {
                  const ingredientStrings = data.ingredients_list
                    .map((ing) => {
                      if (typeof ing === 'string') return ing;
                      if (typeof ing === 'object' && ing !== null) {
                        const obj = ing as { name?: string; text?: string };
                        return obj.name || obj.text || JSON.stringify(ing);
                      }
                      return String(ing);
                    })
                    .filter(Boolean);
                  parts.push(`성분: ${ingredientStrings.join(', ')}`);
                }

                const ocrText =
                  parts.length > 0
                    ? `[사진에서 추출된 정보]\n${parts.join('\n')}\n\n이 정보를 바탕으로 제 건강 프로필에 맞는 조언을 해주세요.`
                    : '사진에서 정보를 추출할 수 없습니다. 다시 시도해주세요.';

                const userMessage: Message = {
                  id: crypto.randomUUID(),
                  role: 'user',
                  content: ocrText,
                  timestamp: new Date(),
                };
                setMessages((prev) => [...prev, userMessage]);
                setIsLoading(true);

                try {
                  const response = await fetch('/api/health-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: ocrText }),
                  });

                  if (response.ok) {
                    const result = await response.json();
                    const assistantMessage: Message = {
                      id: crypto.randomUUID(),
                      role: 'assistant',
                      content: result.reply,
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                  } else {
                    throw new Error('API request failed');
                  }
                } catch (error) {
                  console.error('Chat error:', error);
                  const errorMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: '죄송합니다. 처리 중 오류가 발생했습니다.',
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, errorMessage]);
                } finally {
                  setIsLoading(false);
                }
              }}
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
}
