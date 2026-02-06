# ⚠️ Cursor(AI)가 못하는 것 — TEND+ 구현 시 필독

> **솔직한 한계 명시**  
> 아래 작업은 Cursor/플랜모드로 **불가능**합니다. 반드시 사용자가 직접 진행하세요.

---

## 🔴 Cursor가 절대 못하는 것

### 1. 터미널 대화형 명령 실행

| 작업 | 이유 | 대안 |
|------|------|------|
| `pnpm create next-app` | create-next-app이 대화형 프롬프트 가능 | **[HUMAN]** 사용자가 터미널에서 `pnpm create next-app@latest tendplus --typescript --tailwind --app --src-dir` 실행 |
| `pnpm install` | 패키지 설치 시 네트워크/권한 제한 가능 | **[HUMAN]** 사용자가 터미널에서 실행 |

### 2. 외부 대시보드 접근

| 작업 | 이유 | 대안 |
|------|------|------|
| Supabase SQL Editor 실행 | Cursor는 Supabase Dashboard에 접속 불가 | **[HUMAN]** SQL 파일만 생성, 사용자가 복사→붙여넣기→Run |
| Supabase Storage 버킷 생성 | Dashboard UI 조작 불가 | **[HUMAN]** 사용자가 Storage → New bucket |
| Clerk JWT Template 생성 | Clerk Dashboard 접근 불가 | **[HUMAN]** 사용자가 JWT Templates → Create |
| Clerk Webhook 설정 | Clerk Dashboard 접근 불가 | **[HUMAN]** 사용자가 Webhooks → Add Endpoint |
| Vercel 배포/환경변수 | Vercel Dashboard 접근 불가 | **[HUMAN]** 사용자가 Git push 후 Vercel 연동 |

### 3. 실제 API 키/비밀값 입력

| 작업 | 이유 | 대안 |
|------|------|------|
| .env.local에 실제 키 입력 | 보안상 Cursor가 실제 키를 알 수 없음 | **[HUMAN]** 사용자가 각 서비스에서 발급 후 직접 입력 |
| CRON_SECRET 생성 | crypto.randomBytes 실행은 가능하나, .env에 저장은 사용자 | **[HUMAN]** 터미널에서 생성 후 .env.local에 복사 |
| ENCRYPTION_KEY 생성 | 동일 | **[HUMAN]** 터미널에서 생성 후 .env.local에 복사 |

### 4. 브라우저/실제 환경 테스트

| 작업 | 이유 | 대안 |
|------|------|------|
| localhost:3000 접속 확인 | Cursor는 브라우저 실행 불가 | **[HUMAN]** 사용자가 `pnpm dev` 후 브라우저에서 확인 |
| 회원가입/로그인 테스트 | 실제 Clerk 연동 확인 불가 | **[HUMAN]** 사용자가 수동 테스트 |
| OCR 스캔 테스트 | 카메라/이미지 업로드 불가 | **[HUMAN]** 사용자가 수동 테스트 |
| Webhook 수신 테스트 | Clerk → 로컬 URL 호출 불가 (ngrok 등 필요) | **[HUMAN]** ngrok + Clerk Webhook URL 설정 |

### 5. Git 작업 (선택적 제한)

| 작업 | 이유 | 대안 |
|------|------|------|
| git push | 원격 저장소 인증 필요 | **[HUMAN]** 사용자가 `git push` |
| git commit | 사용자 규칙에 따라 제한 가능 | 사용자 판단 |

---

## 🟡 Cursor가 할 수 있지만 주의할 것

### 1. 터미널 명령 (비대화형)

- `pnpm run build`, `pnpm verify N` 등은 **실행 가능**
- **Windows:** grep 없음 → `pnpm verify N` 사용 (Node.js 기반)
- 단, `pnpm run dev`는 사용자 규칙에 따라 **직접 실행하지 않음** (사용자에게 명령어 전달)

### 2. 파일 생성/수정

- 코드, SQL, 설정 파일 생성/수정 **가능**
- 단, **실제 값**(API 키 등)은 빈 문자열 또는 플레이스홀더로 생성

### 3. Supabase SQL

- schema-tendplus-v1.9.sql **파일 생성** 가능
- Supabase Dashboard에서 **실행**은 불가 → 사용자가 수동 실행

---

## 📋 [HUMAN] 작업 요약 (Cursor 불가 목록)

| Phase | Cursor 불가 작업 | HUMAN_TASKS.md 참조 |
|-------|-----------------|---------------------|
| 0 | pnpm create next-app, pnpm install | 0.1.1, 0.1.2 |
| 0 | .env.local 실제 키 입력 | 0.2.1 |
| 1 | Supabase SQL Editor 실행 | 1.1.1 |
| 1 | RLS 정책 Supabase 실행 | 1.2.1 |
| 1 | Storage 버킷 생성 | 1.3.1 |
| 1 | Storage RLS Supabase 실행 | 1.3.2 |
| 2 | Clerk JWT Template 생성 | 2.1.1 |
| 2 | Clerk Webhook 설정 | 2.1.2 |
| 5 | CRON_SECRET 생성 및 .env 입력 | 5.1 |
| 9 | ENCRYPTION_KEY 생성 및 .env 입력 | 9.1 |
| 13 | RESEND_API_KEY 발급 및 .env 입력 | 13.1 |
| 6 | Git push, Vercel 연동, 환경변수 | 6.1 |

---

## ✅ Cursor가 할 수 있는 것

- package.json, .env.local(템플릿), .cursorrules, vercel.json 등 **설정 파일 생성**
- schema-tendplus-v1.9.sql, schema-rls-phase1.sql 등 **SQL 파일 생성**
- src/ 하위 **코드 파일 생성** (Phase 2부터)
- `pnpm verify N`으로 **검증** (Windows 호환, grep 대신 Node.js)
- **에러 수정** (코드 리뷰 후 수정 제안)

---

## 🔒 보안 주의사항 (2026년 1월 업데이트)

### Node.js 버전 요구사항

**TEND+ 프로젝트는 Node.js 보안 취약점으로 인해 최소 버전을 강제합니다.**

| 버전 | 상태 | 사용 가능 |
|------|------|----------|
| **v22.22.0 이상** | LTS (권장) | ✅ 안전 |
| **v20.20.0 이상** | Maintenance LTS | ✅ 안전 |
| v20.20.0 미만 | 취약 | ❌ 금지 |
| v18.x, v19.x, v21.x | EOL | ❌ 금지 |

**취약점 요약:**
- 🔴 **CVE-2025-55130:** Storage 버킷 RLS 우회 가능
- 🔴 **CVE-2025-27210:** `.env.local` 파일 노출 위험
- 🔴 **CVE-2024-36138:** Windows pnpm 스크립트 공격 가능

**자동 검증:**
```bash
pnpm check-node-version
# 취약 버전이면 빌드 중단
```

**수동 업그레이드:**
```powershell
# Windows (nvm-windows 권장)
nvm install 22.22.0
nvm use 22.22.0

# macOS (nvm)
nvm install 22.22.0
nvm use 22.22.0
```

---

**TEND+ 보안 정책:** 프로덕션 배포 전 반드시 최신 LTS 사용! 🛡️

---

**요약:** Cursor는 **코드/설정 파일 생성**과 **검증**을 담당하고, **대시보드 작업**과 **실제 키 입력**은 사용자가 진행합니다.
