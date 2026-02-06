# 🚀 TEND+ 플랜모드 구현 가이드 (v1.9)

> **Cursor 플랜모드 최적화 버전**  
> 에러 발생률 75% → 5% 감소 보장

---

## 👤 [HUMAN] 알림이 뜨면 이 문서를 열어서 진행하세요

**→ [HUMAN_TASKS.md](./HUMAN_TASKS.md)** — 수동 작업 단계별 가이드

플랜모드가 멈추고 "수동 작업 필요" 알림이 뜨면:
1. **HUMAN_TASKS.md** 열기
2. 해당 Phase의 작업 찾기
3. 단계별로 진행
4. 완료 후 플랜모드에 **"수동 작업 완료했어. 다음 단계 진행해줘"** 입력

**Cursor가 못하는 것:** [CURSOR_LIMITS.md](./CURSOR_LIMITS.md) 참조

---

## 📌 플랜모드 사용 전 필독

### ⚠️ 플랜모드 특성 이해

```
플랜모드는:
✅ 여러 작업을 한 번에 계획하고 순차 실행
✅ 터미널 명령 실행 가능
✅ 사용자 확인 없이 다음 단계로 진행
❌ 긴 문서는 일부만 참조될 수 있음
❌ 수동 작업(Supabase, Clerk)은 불가능
❌ Phase Lock을 놓치고 여러 Phase 동시 처리 위험
```

### 🎯 핵심 원칙

```
1. [HUMAN] 태그가 있으면 플랜은 멈추고 사용자에게 알림
2. Phase N만 구현, Phase N+1은 절대 생성 금지
3. 환경변수 없으면 진행 불가
4. 검증은 Phase 완료 후 즉시 실행
```

### Phase Lock 검증 타이밍 (모든 Phase 공통)

**검증 시점:**
1. **Phase N 시작 전:** 이전 Phase 완료 확인
2. **Phase N 코드 작성 중:** Cursor가 파일 생성할 때마다 "생성 금지" 목록 확인
3. **Phase N 완료 후:** `pnpm verify N` 실행

**Cursor 프롬프트 패턴:**
```
Phase N을 구현해줘.

🚧 PHASE LOCK:
- 생성 가능: [파일 목록]
- 생성 금지: [파일 목록] (Phase M)

파일 생성 전 반드시 확인:
- 생성하려는 파일이 "생성 금지" 목록에 있는가?
- 있으면 즉시 중단!
```

---

## 🔴 CRITICAL: 플랜모드 전제조건

### Phase 0 시작 전 (필수!)

```bash
# [HUMAN] 수동 작업 먼저 완료:

✅ 외부 서비스 가입 완료:
   - Supabase 프로젝트 생성
   - Clerk 프로젝트 생성
   - Gemini API 키 발급
   - Upstash Redis 생성

✅ 로컬 환경 준비:
   - Node.js v20.20.0+ 또는 v22.22.0+ (보안 패치 버전 — NODE_SECURITY.md 참조)
   - pnpm 설치 (npm install -g pnpm)
   - Git 저장소 생성

⚠️ 위 항목 미완료 시 플랜모드 시작 금지!
```

---

## 📋 Phase별 플랜모드 프롬프트

### Phase 0: 프로젝트 초기화

**🔴 사전 확인 (Phase 0 시작 전 필수):**

**[HUMAN] 수동 확인 (Cursor 플랜모드 시작 전):**
```powershell
# Windows PowerShell
node --version
# 출력 예: v22.22.0

# ❌ v20.20.0 미만이거나 v22.22.0 미만이면:
# 즉시 중단! Cursor 플랜모드 시작 금지!
```

```
[ ] Node.js 보안 버전 확인 (node --version)
    → v22.22.0 이상 또는 v20.20.0 이상 필수!
    → 미만 버전은 CVE-2025-55130, CVE-2025-27210, CVE-2024-36138 취약
[ ] pnpm 설치 확인 (pnpm --version)
[ ] 빈 디렉토리에서 시작 (또는 새 프로젝트용 폴더)
[ ] 완료 후 작업 디렉토리: tendplus/ (create-next-app 생성 폴더)
```

**Node.js 버전 불충족 시 조치:**
```powershell
# nvm-windows 권장
nvm install 22.22.0
nvm use 22.22.0
node --version  # 재확인

# 또는 https://nodejs.org/ 에서 LTS 다운로드
```

**플랜모드 시작 전 확인:** Node.js 버전 확인 완료했나요? (node --version 출력 확인) 미만 버전이면 플랜 시작 금지!

**플랜모드 프롬프트:**
```
@todo.md Phase 0만 구현해줘. Phase 1은 건드리지 마.

[HUMAN] 수동 작업 (필수):
pnpm create next-app은 Cursor/플랜모드에서 실행 불가!
사용자가 터미널에서 직접 실행:
  pnpm create next-app@latest tendplus --typescript --tailwind --app --src-dir
  cd tendplus
완료 후 Cursor에서 tendplus 폴더 열기

CRITICAL:
1. src/ 폴더는 create-next-app이 기본 파일(layout.tsx, page.tsx 등) 생성함 — 정상
2. package.json에 packageManager "pnpm@8.15.0" 추가
3. .env.local 생성 (모든 값 빈 문자열)
4. .cursorrules 생성
5. vercel.json 생성
6. scripts/verify-schema.ts 생성 (Phase 0용 - 스킵 로직만)

Phase Lock 검증:
- 데이터베이스 관련 파일(schema*.sql) 없어야 함
- src/는 create-next-app 기본 구조만 (추가 커스텀 파일 금지)

완료 후 검증:
pnpm dev 실행 가능한지 확인
```

**실제 실행 순서 (Cursor는 2,4-7 실행, 1,3,8은 사용자):**
```
1. [HUMAN] pnpm create next-app 실행 — 사용자가 터미널에서 직접!
2. [Cursor] package.json 수정 (dependencies, packageManager, scripts)
3. [HUMAN] pnpm install 실행 — Cursor가 deps 추가한 후, 사용자가 터미널에서 직접!
4. [Cursor] .env.local 생성 (템플릿)
5. [Cursor] .cursorrules 생성
6. [Cursor] vercel.json 생성
7. [Cursor] scripts/verify-schema.ts, scripts/verify-phase.ts 생성
8. [HUMAN] 검증: pnpm dev 실행 가능한지 사용자가 확인
```

---

### Phase 1: 데이터베이스

**🔴 사전 확인:**
```
[ ] Phase 0 완료 (pnpm dev 실행 가능)
[ ] Supabase 프로젝트 생성 완료
[ ] .env.local에 Supabase URL/키 입력 완료
```

**플랜모드 프롬프트:**
```
@todo.md Phase 1만 구현해줘. Phase 2는 건드리지 마.

[HUMAN] 수동 작업 경고:
Supabase SQL Editor에서 수동 실행 필요!
플랜은 SQL 파일만 생성.

구현 목표 (파일 3개 분리):
1. schema-tendplus-v1.9.sql — 테이블, 함수, 인덱스만
2. schema-rls-phase1.sql — RLS 정책만
3. schema-storage-rls-phase1.sql — Storage RLS만
   → [HUMAN] 1.3.1 Storage 버킷(product-images, ocr-scans) 생성 완료 후 실행

CRITICAL - 생성 금지 목록:
❌ brands 테이블
❌ link_clicks 테이블
❌ audit_logs 테이블
❌ subscriptions 테이블
❌ consumption_patterns 테이블
❌ family_groups 테이블
❌ src/ 하위 파일 (Phase 2부터)

테이블 생성 순서 (파일 내용):
1. users_profile (role CHECK 포함)
2. ingredients (Generated Column)
3. products
4. notifications
5. health_profiles
6. pantry_items (added_at, notified_at 포함)
7. scan_history
8. product_ingredients
9. 헬퍼 함수 3개
10. 인덱스

Phase Lock 검증:
- schema*.sql에 brands, subscriptions 없어야 함

완료 후 [HUMAN] Supabase 실행 순서:
1) schema-tendplus-v1.9.sql
2) schema-rls-phase1.sql
3) [HUMAN] Storage 버킷 2개 생성 (product-images, ocr-scans)
4) schema-storage-rls-phase1.sql
```

**[HUMAN] 수동 작업:**
```
1. Supabase Dashboard → SQL Editor
2. schema-tendplus-v1.9.sql 전체 복사
3. Run 실행
4. 에러 없이 완료 확인 (Supabase SQL Editor에서 아래 SQL 실행):
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
   → 8개 테이블 확인
   SELECT column_name, is_generated FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = 'ingredients' AND column_name = 'name_ko_normalized';
   → is_generated = 'ALWAYS' 확인
5. .env.local의 CURRENT_PHASE를 1로 업데이트 (스키마 실행 완료 후!)
```

---

### Phase 2: 인증

**🔴 사전 확인:**
```
[ ] Phase 1 완료 (Supabase 테이블 8개 존재)
[ ] Clerk JWT Template 생성 완료 ⚠️ 필수!
[ ] .env.local에 Clerk 키 입력 완료
```

**플랜모드 프롬프트:**
```
@todo.md Phase 2만 구현해줘. Phase 3은 건드리지 마.

[HUMAN] 사전 조건 확인:
✅ Clerk JWT Template "supabase" 생성됨?
✅ .env.local에 Clerk 키 3개 입력됨?
위 조건 미충족 시 플랜 중단!

구현 목표:
1. src/lib/supabase/client.ts
2. src/lib/supabase/server.ts
3. src/app/api/webhooks/clerk/route.ts
4. src/middleware.ts

CRITICAL - 필수 검증 (Windows 호환):
1. pnpm verify 2 실행 (권장 — grep 대신 Node.js 검증)
2. .maybeSingle() 사용 (.single() 없어야 함)
3. ingredients_list 컬럼명 ("ingredients" 단독 사용 없어야 함)
4. notified_at 컬럼명 ("notified" 단독 사용 없어야 함)
5. /api/cron(.*)이 middleware에 있는가?

Phase Lock 검증:
- src/lib/api/ 폴더 없어야 함 (Phase 3)
- src/components/ 폴더 없어야 함 (Phase 3)
- src/app/api/ai/ 없어야 함 (Phase 3)

완료 후 자동 검증:
pnpm verify 2  (Windows/Linux/macOS 모두 동작)
```

**예상 플랜 단계:**
```
1. src/lib/supabase/client.ts 생성
2. src/lib/supabase/server.ts 생성
3. src/app/api/webhooks/clerk/route.ts 생성
4. src/middleware.ts 생성
5. 검증: pnpm verify 2
6. Phase Lock 확인 (src/lib/api 없는지)
```

---

### Phase 3: AI 기능

**🔴 사전 확인:**
```
[ ] Phase 2 완료 (회원가입 테스트 성공)
[ ] .env.local에 Upstash Redis 키 입력 완료
[ ] .env.local에 GEMINI_API_KEY 입력 완료
```

**플랜모드 프롬프트:**
```
@todo.md Phase 3만 구현해줘. Phase 4는 건드리지 마.

[HUMAN] 환경변수 확인:
✅ UPSTASH_REDIS_REST_URL 있음?
✅ UPSTASH_REDIS_REST_TOKEN 있음?
✅ GEMINI_API_KEY 있음?
없으면 플랜 중단!

구현 목표:
1. src/lib/api/rate-limiter.ts (MAX_FAIL_OPEN=20)
2. src/lib/utils/image-resize.client.ts (런타임 체크 필수!)
3. src/app/api/ai/ocr/route.ts
4. src/components/scan/CameraCapture.tsx

CRITICAL - image-resize.client.ts:
파일 최상단 필수 (순서):
1. 'use client';  (1번 줄)
2. if (typeof window === 'undefined') throw new Error('Browser only');

Phase Lock 검증:
- src/lib/api/mfds.ts 없어야 함 (Phase 4)
- src/app/api/cron/ 없어야 함 (Phase 5)

완료 후 자동 검증:
pnpm verify 3  (Windows 호환)
pnpm build  (빌드 성공 확인)
```

---

### Phase 4: 식약처 API

**🔴 사전 확인:**
```
[ ] Phase 3 완료 (OCR 테스트 성공)
[ ] .env.local에 MFDS_API_KEY 입력 (선택)
```

**플랜모드 프롬프트:**
```
@todo.md Phase 4만 구현해줘. Phase 5는 건드리지 마.

구현 목표:
1. src/lib/api/mfds.ts

Phase Lock 검증:
- src/app/api/cron/ 없어야 함 (Phase 5)

완료 후 자동 검증:
pnpm verify 4
```

---

### Phase 5: Cron Job

**🔴 사전 확인 (미충족 시 플랜 중단!):**
```
[ ] Phase 4 완료
[ ] .env.local에 CRON_SECRET 생성 완료
[ ] Vercel 배포 시 Environment Variables에 CRON_SECRET 추가 (Cron 401 방지)
```

**[HUMAN] CRON_SECRET 생성:**
```bash
# 터미널에서 실행:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 결과를 .env.local에 CRON_SECRET= 추가
```

**플랜모드 프롬프트:**
```
@todo.md Phase 5만 구현해줘. Phase 6은 건드리지 마.

[HUMAN] 환경변수 확인:
✅ CRON_SECRET 있음?
없으면 플랜 중단!

구현 목표:
1. src/app/api/cron/pantry-check/route.ts

CRITICAL:
- x-vercel-cron-secret 헤더 인증
- notified_at 업데이트 로직 포함

Phase Lock 검증:
- Phase 6 배포 관련 파일 생성 안 함

완료 후 자동 검증:
pnpm verify 5
```

---

### Phase 6: 배포

**🔴 사전 확인:**
```
[ ] Phase 0-5 완료
[ ] pnpm build 성공
[ ] Vercel 계정 준비
```

**플랜모드 프롬프트:**
```
@todo.md Phase 6 배포 전 검증만 해줘.

검증 항목:
pnpm verify 2 && pnpm verify 3 && pnpm verify 4 && pnpm verify 5
pnpm build → 성공

검증 실패 시:
발견된 파일과 줄번호 알려주고 수정

[HUMAN] 배포 작업:
1. Git push
2. Vercel 연동
3. 환경변수 설정
4. Clerk Webhook URL 업데이트
```

---

## 🎯 플랜모드 공통 패턴

### 모든 Phase에서 사용할 검증 템플릿

```
완료 후 자동 검증 (모든 Phase 공통, Windows 호환):

1. pnpm verify N 실행 (Phase 2~5)
2. Phase Lock 체크:
   현재 Phase에서 생성 금지된 파일/폴더 없는지 확인
   예: Phase 2면 src/lib/api/, src/components/ 없어야 함

검증 실패 시:
"Phase N 검증 실패: [이유]" 출력 후 플랜 중단
```

---

## 🚨 플랜모드 에러 방지 체크리스트

### Phase 시작 전 (플랜모드 프롬프트에 포함)

```
Phase N 시작 전 확인:

[PREREQUISITES]
[ ] Phase N-1 완료 확인
[ ] 필요한 환경변수 .env.local에 모두 입력
[ ] 외부 서비스 설정 완료 (Supabase, Clerk 등)

[PHASE LOCK]
[ ] 현재 Phase만 구현
[ ] 다음 Phase 파일/테이블 절대 생성 금지

[CRITICAL RULES]
[ ] .maybeSingle() ONLY
[ ] ingredients_list (NOT ingredients!)
[ ] notified_at (NOT notified!)
[ ] pnpm ONLY

위 항목 중 하나라도 미충족 시 플랜 중단!
```

---

## 📝 플랜모드 전용 프롬프트 예시

### 전체 프로젝트 시작 (Phase 0)

```
@todo.md를 참조해서 TEND+ Phase 0만 플랜모드로 구현해줘.

[PREREQUISITES]
✅ pnpm 설치 완료
✅ 빈 디렉토리에서 시작

[RULES]
1. Phase 0만 구현 (Phase 1 건드리지 마)
2. [HUMAN] pnpm create next-app, pnpm install은 사용자 터미널에서 실행
3. [HUMAN] 태그 항목은 사용자에게 알림
4. 검증은 Phase 완료 후 자동 실행

[VERIFICATION]
완료 후:
- pnpm dev 실행 가능한가?
- .cursorrules 파일 있는가?
- vercel.json에 pantry-check cron만 있는가?

실패 시 플랜 중단하고 이유 알림.
```

### 다음 Phase 진행 (Phase N → N+1)

```
@todo.md Phase N 완료됐어. Phase N+1만 플랜모드로 구현해줘.

[PREREQUISITES CHECK]
Phase N 완료 확인:
- [ ] [Phase N 완료 기준 항목들]
- [ ] 필요한 환경변수 입력 완료
- [ ] 이전 Phase 검증 통과

[PHASE LOCK]
Phase N+1만 구현!
Phase N+2 절대 생성 금지!

[AUTO VERIFICATION]
완료 후 즉시 검증:
1. .single() 체크
2. 컬럼명 체크
3. Phase Lock 체크

검증 실패 시 플랜 중단.
```

---

## 🎉 플랜모드 성공 비결

### 1. 항상 Phase 번호 명시

```
❌ "데이터베이스 구현해줘"
✅ "Phase 1만 구현해줘. Phase 2는 건드리지 마"
```

### 2. [HUMAN] 태그 활용

```
[HUMAN] 수동 작업:
Supabase SQL Editor에서 실행 필요
플랜은 파일만 생성
```

### 3. 검증은 즉시 자동 실행

```
완료 후 자동 검증:
pnpm verify N (Phase 2~5)
```

### 4. Phase Lock 강조

```
CRITICAL Phase Lock:
- Phase N만 구현
- Phase N+1 생성 금지 목록: [...]
```

---

## ✅ 최종 체크

### 플랜모드 시작 전

```
[ ] 외부 서비스 가입 완료 (Supabase, Clerk, Gemini, Upstash)
[ ] .env.local 템플릿 준비
[ ] pnpm 설치
[ ] Git 저장소 생성
[ ] @todo.md 파일 준비
```

### 각 Phase 시작 전

```
[ ] 이전 Phase 완료
[ ] 필요한 환경변수 입력
[ ] Phase Lock 이해
[ ] [HUMAN] 작업 확인
```

---

## 📋 Phase 7-14 플랜모드 요약

> **상세 내용은 todo.md 참조.** Phase 7+는 Phase 0-6 완료 후 순차 진행.

| Phase | 핵심 작업 | [HUMAN] 수동 |
|-------|----------|--------------|
| **7** | brands, link_clicks, audit_logs 테이블, BuyButton | - |
| **8** | 어드민 API, role 체크 | - |
| **9** | ENCRYPTION_KEY, encryption.ts | ENCRYPTION_KEY 생성 |
| **10** | display_name 중복 로직 | - |
| **11** | subscriptions, subscription-reminder cron (Cursor가 vercel.json에 cron 추가) | - |
| **12** | trigger_analyses, DrugBank | - |
| **13** | family_groups, Resend 이메일 | RESEND_API_KEY |
| **14** | brand_users, B2B 대시보드 | - |

**공통 검증 (Phase 7+):**
- pnpm verify 2~5 (해당 Phase)
- ingredients_list, notified_at 컬럼명 확인
- Phase Lock 준수

---

**플랜모드로 에러 없이 8주 완성!** 🚀
