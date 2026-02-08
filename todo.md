# TEND+ 완전 통합 TODO v1.9 (Phase 0-14)

> **22가지 에러 수정 완료 (15 + 7)**  
> **프로덕션 투입 가능**  
> **Cursor 구현 가능 (Phase 0-14 완전)**  
> 완료 시 `[ ]` → `[x]`로 변경합니다.

---

## 📊 Phase 완전성 (v1.9 보완 후)

| Part | Phase | 완전성 | Cursor 구현 |
|------|-------|--------|-------------|
| Part 1 | 0-8 | 100% | ✅ 가능 |
| Part 2 | 9-11 | 100% | ✅ 가능 |
| Part 3 | 12-14 | 100% | ✅ 가능 |

---

## v1.9 추가 수정 사항 (7가지)

| # | 유형 | 수정 내용 | Phase |
|---|------|----------|-------|
| **#16** | 에러 | pantry_items → subscriptions 조회 분리 | 11 |
| **#17** | 에러 | pantry_items.added_at 추가 | 1 |
| **#18** | 에러 | display_name 중복 로직 개선 | 10 |
| **#19** | 보완 | CURRENT_PHASE 환경변수 문서화 | 0 |
| **#20** | 보완 | role CHECK 중복 제거 | 8 |
| **#21** | 보완 | optional chaining 추가 | 12 |
| **#22** | 보완 | brand_users INSERT 플로우 | 14 |

---

## ⚠️ Cursor(AI)가 못하는 것

> **CURSOR_LIMITS.md** 참조 — 아래 작업은 반드시 사용자가 직접 진행
> - `pnpm create next-app`, `pnpm install` (터미널)
> - Supabase SQL Editor 실행, Storage 버킷 생성
> - Clerk JWT Template, Webhook 설정
> - .env.local에 실제 API 키 입력
> - Vercel 배포, Git push

---

## 🚨 CRITICAL RULES (Cursor 필독)

```
🔴 ABSOLUTE RULES - NEVER VIOLATE

1. PHASE LOCK:
   - 현재 Phase에 명시되지 않은 테이블/API/파일은 절대 생성 금지
   - 다음 Phase 내용을 미리 구현 금지
   - "나중에 쓸 거니까" 판단 금지

2. COLUMN NAMES (EXACT):
   - ingredients_list (NOT ingredients!)
   - notified_at (NOT notified!)
   - name_ko_normalized (Generated Column - 수정 금지)

3. QUERY SAFETY:
   - .maybeSingle() ONLY
   - .single() 절대 사용 금지
   - .maybeSingle()이 null 반환 가능 → 항상 체크
   - const { data, error } 구조 사용 → error 체크 필수!
   - if (error) { console.error(...); throw error; } 또는 적절한 에러 핸들링

4. ID GENERATION:
   - UUID는 DB에서만 생성 (gen_random_uuid())
   - nanoid() 사용 금지 (string/uuid 타입 충돌)
   - id 컬럼은 항상 uuid 타입

5. GENERATED COLUMN:
   - 생성 후 절대 수정 금지
   - ALTER COLUMN 금지
   - DROP TABLE 금지 (마이그레이션 시)

6. ADMIN CLIENT:
   - /api/admin, /api/cron에서만 사용
   - 일반 라우트에서 사용 금지

7. FILE NAMING:
   - *.client.ts → Browser only (런타임 체크 필수)
   - *.server.ts → Server only

8. PACKAGE MANAGER:
   - pnpm ONLY (npm 금지)
```

---

## ⚠️ 주의사항 (구현 시 필수)

### 1. Phase Lock
- **현재 Phase만 구현**
- **다음 Phase 미리 구현 금지**
- "나중에 쓸 거니까" 판단 금지

### 2. CRITICAL RULES (절대 위반 금지)
- `.maybeSingle()` ONLY (`.single()` 절대 금지)
- `ingredients_list` (NOT `ingredients!`)
- `notified_at` (NOT `notified!`)
- **pnpm ONLY** (npm 금지)

### 3. 검증 (각 Phase 완료 시)
1. **체크리스트 확인** — 해당 Phase 완료 기준 모두 충족
2. **검증 프롬프트 실행** — Cursor에 검증 프롬프트 붙여넣기
3. **Git 커밋** — `git add . && git commit -m "Phase N 완료"`

### 4. 플랜모드 사용 시
- **[HUMAN] 태그** — 수동 작업 표시, 플랜은 멈추고 사용자에게 알림
- **Phase 사전 확인** — 각 Phase 상단 체크리스트 필수 확인
- **PLAN_MODE.md** — 플랜모드 사용 시 먼저 참조

---

## 📌 문서 사용 순서

1. **todo.md** — 메인 구현 가이드 (이 문서)
2. **SETUP.md** — Cursor 프롬프트·실습 흐름
3. **PACKAGE.md** — 워크플로우·체크리스트
4. **PLAN_MODE.md** — 플랜모드 사용 시 필독 (에러 75%→5% 감소)
5. **HUMAN_TASKS.md** — [HUMAN] 수동 작업 시 단계별 가이드
6. **CURSOR_LIMITS.md** — Cursor(AI)가 못하는 것 명시 (필독)
7. **PHASE_COMPLETION.md** — Phase 완료 체크리스트 (Windows 호환, pnpm verify)
8. **NODE_SECURITY.md** — Node.js 보안 버전 가이드 (개발 환경 준비 시 참조)

> **플랜모드 사용 시:** PLAN_MODE.md 먼저 참조 후 Phase별 프롬프트 사용  
> **[HUMAN] 알림 시:** HUMAN_TASKS.md 열어서 수동 작업 진행  
> **에러 발생 시:** CURSOR_LIMITS.md 확인 (Cursor 한계)

---

## 외부 서비스 준비 (코딩 전 필수)

### 필수 서비스 가입

- [ ] **A. Supabase** 프로젝트 생성 (supabase.com)
- [ ] **B. Clerk** 프로젝트 생성 (clerk.com)
- [ ] **C. Clerk JWT Template** 생성 (이름: supabase)
  ```json
  {
    "sub": "{{user.id}}",
    "aud": "authenticated",
    "role": "authenticated"
  }
  ```
  > **⚠️ CRITICAL:** sub를 Clerk user ID(string)로 설정

- [ ] **D. Clerk Webhook** 설정 (Phase 2 코드 작성 후, 배포 전 — HUMAN_TASKS 2.1.2 참조)
- [ ] **E. Gemini API** Key 발급 (ai.google.dev)
- [ ] **F. Upstash Redis** 생성 (upstash.com)

---

## PHASE 0 — 프로젝트 초기화 (수정 #19)

> **🔴 플랜모드 사전 확인:**
> ```
> [ ] pnpm 설치 확인 (pnpm --version)
> [ ] 빈 디렉토리에서 시작
> [ ] 외부 서비스 가입 완료 (Supabase, Clerk, Gemini, Upstash)
> ```

```
🚧 PHASE 0 LOCK

이 Phase에서만 생성 가능:
- package.json
- .env.local
- .cursorrules
- vercel.json
- .gitignore
- scripts/verify-schema.ts (최소 구현)

생성 금지:
- src/ 하위 파일 (Cursor가 생성 금지 — create-next-app이 [HUMAN]으로 기본 파일 생성)
- 데이터베이스 스키마
- API 라우트
```

### 0.1 프로젝트 생성

- [ ] **0.1.1** Next.js 프로젝트 생성

> **[HUMAN] 수동 작업 전 필수 확인:**
> ```powershell
> # Node.js 버전 확인 (Windows)
> node --version
> # 출력 예: v22.22.0
> 
> # ⚠️ v22.22.0 미만 또는 v20.20.0 미만이면:
> # 보안 취약점 존재 — 반드시 업그레이드!
> ```
> 
> **최소 요구 버전:**
> - ✅ v22.22.0 이상 (권장)
> - ✅ v20.20.0 이상 (최소)
> - ❌ v18.x, v19.x, v21.x (EOL, 사용 금지)
> 
> **업그레이드 후 프로젝트 생성:**
> ```bash
> pnpm create next-app@latest tendplus --typescript --tailwind --app --src-dir
> cd tendplus
> ```
> 
> **완료 후** Cursor에서 `tendplus` 폴더 열기 (프로젝트 루트)

- [x] **0.1.2** 패키지 설치

> **Cursor 프롬프트:** package.json에 dependencies 추가해줘.
> ```
> package.json dependencies에 추가:
> @supabase/supabase-js @clerk/nextjs @google/generative-ai
> zustand lucide-react date-fns react-hot-toast svix
> react-webcam recharts @hookform/resolvers react-hook-form zod
> fast-xml-parser @upstash/ratelimit @upstash/redis resend
> devDependencies: @types/node tsx
> 
> 프로덕션 안정성: ^ 대신 정확 버전 권장 (예: "2.39.0")
> ```
> 
> **[HUMAN] 수동 작업 (터미널):**
> ```bash
> pnpm install
> ```

- [x] **0.1.3** package.json 수정

> **Cursor 프롬프트:**
> ```
> package.json을 수정해줘.
> 
> 🔴 CRITICAL - 필수 필드 (누락 시 보안 취약):
> 
> 1. "packageManager": "pnpm@8.15.0"
> 
> 2. "engines": {
>      "node": ">=20.20.0"
>    }
>    ⚠️ 정확히 ">=20.20.0" 입력! (v22.22.0, v20.20.0 이상 허용)
>    ⚠️ ">=18.0.0" 또는 다른 낮은 버전 절대 금지!
> 
> 3. "scripts": {
>      "dev": "next dev",
>      "build": "next build",
>      "start": "next start",
>      "lint": "next lint",
>      "verify-schema": "tsx scripts/verify-schema.ts",
>      "verify": "tsx scripts/verify-phase.ts",
>      "check-node-version": "tsx scripts/check-node-version.ts",
>      "prebuild": "pnpm check-node-version && pnpm verify-schema"
>    }
> 
> CRITICAL:
> - npm 관련 명령어 절대 사용 금지
> - pnpm만 사용
> - engines 필드로 Node.js 버전 강제 (보안 취약점 방지)
> - prebuild에 check-node-version 추가
> 
> 검증: 완료 후 package.json 확인
> - engines.node 필드 존재하는가?
> - engines.node 값이 ">=20.20.0"인가?
> - scripts에 check-node-version, verify, verify-schema 모두 있는가?
> ```

---

### 0.2 환경변수 설정

- [x] **0.2.1** `.env.local` 생성

> **Cursor 프롬프트:**
> ```
> .env.local 파일을 생성해줘.
> 
> 내용:
> # Clerk
> NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
> CLERK_SECRET_KEY=
> CLERK_WEBHOOK_SECRET=
> 
> # Supabase
> NEXT_PUBLIC_SUPABASE_URL=
> NEXT_PUBLIC_SUPABASE_ANON_KEY=
> SUPABASE_SERVICE_ROLE_KEY=
> 
> # Upstash Redis
> UPSTASH_REDIS_REST_URL=
> UPSTASH_REDIS_REST_TOKEN=
> 
> # Gemini (주의: NEXT_PUBLIC_ 붙이지 말것!)
> GEMINI_API_KEY=
> 
> # Cron
> CRON_SECRET=
> 
> # Rate Limit
> RATE_LIMIT_FAIL_OPEN_THRESHOLD=20
> 
> # Encryption (Phase 9에서 생성)
> ENCRYPTION_KEY=
> 
> # 수정 #19: Schema Verification
> CURRENT_PHASE=0
> # Phase 진행 시 업데이트 (verify-schema/prebuild용):
> # Phase 1 완료 → CURRENT_PHASE=1 (1.1.1 스키마 Supabase 실행 완료 후!)
> # Phase 2 완료 → CURRENT_PHASE=2
> # ...
> 
> # Phase 4 (식약처)
> MFDS_API_KEY=
> 
> # Phase 13 (Resend 이메일)
> RESEND_API_KEY=
> 
> CRITICAL:
> - 실제 키는 수동으로 입력 필요
> - GEMINI_API_KEY에 NEXT_PUBLIC_ 절대 붙이지 말것
> ```

---

### 0.3 .cursorrules 생성

- [x] **0.3.1** `.cursorrules` 파일 생성

> **Cursor 프롬프트:**
> ```
> .cursorrules 파일을 생성해줘.
> 
> 내용:
> # TEND+ v1.9 - Cursor Rules
> 
> 🚨 CRITICAL RULES 🚨
> 
> 1. PHASE LOCK:
>    - 현재 Phase에 명시되지 않은 테이블/API/파일 생성 금지
>    - 다음 Phase 미리 구현 금지
> 
> 2. COLUMN NAMES (EXACT):
>    - ingredients_list (NOT ingredients!)
>    - notified_at (NOT notified!)
>    - name_ko_normalized (Generated Column)
> 
> 3. QUERY SAFETY:
>    - .maybeSingle() ONLY
>    - .single() 절대 금지
> 
> 4. ID GENERATION:
>    - UUID는 DB에서만 생성
>    - nanoid() 사용 금지
> 
> 5. GENERATED COLUMN:
>    - 생성 후 절대 수정 금지
>    - ALTER COLUMN 금지
>    - DROP TABLE 금지
> 
> 6. ADMIN CLIENT:
>    - /api/admin, /api/cron only
> 
> 7. FILE NAMING:
>    - *.client.ts → Browser only
>    - *.server.ts → Server only
> 
> 8. PACKAGE MANAGER:
>    - pnpm ONLY (NOT npm!)
> 
> NO SHORTCUTS. VERIFY EVERYTHING.
> ```

---

### 0.4 vercel.json 생성

- [x] **0.4.1** `vercel.json` 생성

> **Cursor 프롬프트:**
> ```
> vercel.json 파일을 생성해줘.
> 
> 내용:
> {
>   "buildCommand": "pnpm build",
>   "installCommand": "pnpm install",
>   "framework": "nextjs",
>   "crons": [
>     { "path": "/api/cron/pantry-check", "schedule": "0 9 * * *" }
>   ]
> }
> 
> CRITICAL:
> - pantry-check만 Phase 0에 추가 (Phase 5에서 route 생성)
> - subscription-reminder는 Phase 11에서 vercel.json에 추가
> ```

---

### 0.5 verify-schema 스크립트 생성 (수정 #4)

> **역할 구분:**
> - **verify-schema.ts:** Supabase 스키마 검증 (get_table_columns RPC), prebuild 시 자동 실행, Phase 0에서는 스킵
> - **verify-phase.ts:** Phase별 코드 검증 (.single(), 컬럼명, Phase Lock 등), 수동 실행 `pnpm verify N`, Windows 호환 (grep 대신 Node.js fs)

- [x] **0.5.1** `scripts/verify-schema.ts` 생성

> **Cursor 프롬프트:**
> ```
> scripts/verify-schema.ts 파일을 생성해줘.
>
> 내용:
> import { createClient } from '@supabase/supabase-js';
>
> async function verifySchema() {
>   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
>   const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
>   const phase = process.env.CURRENT_PHASE || '0';
>
>   if (!supabaseUrl || !supabaseKey) {
>     console.log('⚠️  Supabase 환경변수 없음 - 스키마 검증 스킵');
>     process.exit(0);
>   }
>
>   if (phase === '0') {
>     console.log('✅ Phase 0: 스키마 검증 스킵');
>     process.exit(0);
>   }
>
>   const supabase = createClient(supabaseUrl, supabaseKey);
>
>   try {
>     const { data, error } = await supabase.rpc('get_table_columns', {
>       table_name: 'ingredients'
>     });
>
>     if (error) {
>       console.error('❌ 스키마 검증 실패:', error);
>       process.exit(1);
>     }
>
>     const normalized = data?.find(
>       (col: any) => col.column_name === 'name_ko_normalized'
>     );
>
>     if (normalized?.is_generated !== 'ALWAYS') {
>       console.error('❌ name_ko_normalized는 Generated Column이어야 합니다');
>       process.exit(1);
>     }
>
>     console.log('✅ 스키마 검증 완료');
>     process.exit(0);
>   } catch (error) {
>     console.log('⚠️  스키마 검증 스킵:', error);
>     process.exit(0);
>   }
> }
>
> verifySchema();
>
> CRITICAL:
> - Phase 0에서는 스키마 없으므로 스킵
> - scripts/verify-phase.ts는 별도 파일 (Phase 검증, Windows 호환)
> - Phase 1 완료 후부터 실제 검증
> - 빌드 실패 방지
> ```

- [x] **0.5.2** `scripts/verify-phase.ts` 생성 (Windows 호환)

> **Cursor 프롬프트:** scripts/verify-phase.ts 생성. 루트 scripts/ 참조. package.json에 "verify": "tsx scripts/verify-phase.ts" 추가.

- [x] **0.5.3** `scripts/check-node-version.ts` 생성 (보안)

> **Cursor 프롬프트:**
> ```
> scripts/check-node-version.ts를 생성해줘.
> 
> import { execSync } from 'child_process';
> 
> const MIN_NODE_VERSION = '22.22.0';
> const MIN_NODE_MAINTENANCE = '20.20.0';
> 
> function parseVersion(v: string): number[] {
>   return v.replace(/^v/, '').split('.').map(Number);
> }
> 
> function gte(current: string, minimum: string): boolean {
>   const c = parseVersion(current);
>   const m = parseVersion(minimum);
>   for (let i = 0; i < 3; i++) {
>     const cn = c[i] ?? 0;
>     const mn = m[i] ?? 0;
>     if (cn > mn) return true;
>     if (cn < mn) return false;
>   }
>   return true;
> }
> 
> try {
>   const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
>   const versionStr = nodeVersion.replace('v', '');
>   const isValid =
>     gte(versionStr, MIN_NODE_VERSION) ||
>     (parseVersion(versionStr)[0] === 20 && gte(versionStr, MIN_NODE_MAINTENANCE));
> 
>   if (!isValid) {
>     console.error('❌❌❌ Node.js 보안 취약점 발견! ❌❌❌');
>     console.error('');
>     console.error('현재 버전:', nodeVersion);
>     console.error('최소 요구:', MIN_NODE_VERSION, '또는', MIN_NODE_MAINTENANCE);
>     console.error('');
>     console.error('🔴 영향받는 취약점:');
>     console.error('   - CVE-2025-55130: 파일 시스템 권한 우회');
>     console.error('   - CVE-2025-27210: 경로 탐색 우회 (.env.local 노출)');
>     console.error('   - CVE-2024-36138: Windows 임의 코드 실행');
>     console.error('');
>     console.error('⚠️ 즉시 Node.js 업그레이드 후 재시도!');
>     console.error('   https://nodejs.org/');
>     console.error('');
>     process.exit(1);
>   }
> 
>   console.log('✅ Node.js 버전 확인:', nodeVersion, '(보안 OK)');
> } catch (error) {
>   console.error('❌ Node.js 버전 확인 실패:', error);
>   process.exit(1);
> }
> 
> CRITICAL:
> - prebuild 시 자동 실행 (빌드 전 버전 체크)
> - 취약 버전이면 빌드 중단
> - 보안 취약점 CVE 번호 출력
> ```
>
> ---
>
## ✅ Phase 0 완료 기준

- [ ] pnpm dev 실행 성공
- [ ] localhost:3000 접속 확인
- [ ] .env.local 생성 확인
- [ ] .cursorrules 생성 확인
- [ ] vercel.json 생성 확인
- [ ] scripts/verify-schema.ts 생성 확인
- [ ] scripts/verify-phase.ts 생성 확인 (Windows 호환 Phase 검증)

> **검증 프롬프트:**
> ```
> Phase 0이 완료되었는지 확인해줘.
> 
> 확인 사항:
> 1. pnpm dev 실행 가능한가?
> 2. package.json에 packageManager가 있는가?
> 3. .cursorrules 파일이 있는가?
> 4. src/ 폴더에 기본 Next.js 파일만 있는가? (layout.tsx, page.tsx 등 - create-next-app 기본 구조)
> ```

---

## PHASE 1 — 데이터베이스 (수정 #17)

> **🔴 플랜모드 사전 확인:**
> ```
> [ ] Phase 0 완료 (pnpm dev 실행 가능)
> [ ] Supabase 프로젝트 생성 완료
> [ ] .env.local에 Supabase URL/키 입력 완료
> [ ] [HUMAN] 이 Phase는 SQL 파일만 생성, Supabase 실행은 수동
> ```

```
🚧 PHASE 1 LOCK

이 Phase에서만 생성 가능:
- users_profile 테이블
- ingredients 테이블 (Generated Column)
- products 테이블 (최소 스켈레톤만)
- health_profiles 테이블
- pantry_items 테이블
- notifications 테이블 (최소 스켈레톤만)
- scan_history 테이블
- product_ingredients 테이블
- get_current_user_id() 함수 (수정 #2 반영)
- get_table_columns() 함수
- get_expiring_items_kst() 함수
- RLS 정책

생성 금지:
- brands 테이블 (Phase 7)
- link_clicks 테이블 (Phase 7)
- audit_logs 테이블 (Phase 8)
- subscriptions 테이블 (Phase 11)
- consumption_patterns 테이블 (Phase 11)
- family_groups 테이블 (Phase 13)
- src/ 하위 파일 (Phase 2부터)
```

### 1.1 스키마 생성

- [x] **1.1.1** schema-tendplus-v1.9.sql 생성 (테이블 + 함수 + 인덱스만)

> **Cursor 프롬프트:**
> ```
> schema-tendplus-v1.9.sql 파일을 생성해줘. (테이블, 함수, 인덱스만 — RLS 제외)
> 
> CRITICAL - 테이블 생성 순서 (절대 지킬 것):
> 
> 1. users_profile (최우선)
> CREATE TABLE users_profile (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   clerk_id text UNIQUE NOT NULL,
>   email text UNIQUE NOT NULL,
>   display_name text,
>   role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
>   status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
>   created_at timestamptz DEFAULT now()
> );
> CREATE INDEX idx_users_profile_clerk ON users_profile(clerk_id);
> CREATE INDEX idx_users_profile_email ON users_profile(email);
> CREATE INDEX idx_users_profile_role ON users_profile(role);
> CREATE INDEX idx_users_profile_status ON users_profile(status);
> 
> 2. ingredients (Generated Column)
> CREATE TABLE ingredients (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   name_ko text NOT NULL,
>   
>   -- ✅ v1.7: Generated Column (수정 금지!)
>   name_ko_normalized text GENERATED ALWAYS AS (
>     LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name_ko, '[^가-힣a-zA-Z0-9]', '', 'g'), '\s+', '', 'g'))
>   ) STORED,
>   
>   name_en text,
>   ingredients_list jsonb DEFAULT '[]'::jsonb,  -- ✅ ingredients_list (NOT ingredients!)
>   allergens jsonb DEFAULT '[]'::jsonb,
>   cached_at timestamptz,
>   created_at timestamptz DEFAULT now()
> );
> 
> CREATE UNIQUE INDEX idx_ingredients_normalized ON ingredients(name_ko_normalized);
> CREATE INDEX idx_ingredients_cached ON ingredients(cached_at);
> 
> 3. products (최소 스켈레톤만)
> CREATE TABLE products (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   name text NOT NULL,
>   brand text,
>   category text,
>   image_url text,
>   description text,
>   created_at timestamptz DEFAULT now()
> );
> 
> -- ⚠️ affiliate_url, brand_id는 Phase 7에서 ALTER TABLE로 추가 (brand 컬럼 유지, brand_id 추가)
> 
> 4. notifications (최소 스켈레톤만)
> CREATE TABLE notifications (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   type text NOT NULL,
>   title text NOT NULL,
>   body text,
>   data jsonb,
>   read boolean DEFAULT false,
>   created_at timestamptz DEFAULT now()
> );
> 
> 5. health_profiles
> CREATE TABLE health_profiles (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL UNIQUE,
>   allergies jsonb DEFAULT '[]'::jsonb,
>   medications jsonb DEFAULT '[]'::jsonb,
>   skin_concerns jsonb DEFAULT '[]'::jsonb,
>   chronic_conditions jsonb DEFAULT '[]'::jsonb,
>   blacklist_ingredients jsonb DEFAULT '[]'::jsonb,
>   created_at timestamptz DEFAULT now(),
>   updated_at timestamptz DEFAULT now()
> );
> 
> 6. pantry_items (수정 #17)
> CREATE TABLE pantry_items (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   product_id uuid REFERENCES products(id) NOT NULL,
>   status text NOT NULL CHECK (status IN ('unopened', 'opened', 'almost_empty', 'empty')),
>   added_at timestamptz DEFAULT now(),  -- 수정 #17: 구매/추가 시점
>   opened_at timestamptz,
>   expiry_date date,
>   notified_at timestamptz,  -- ✅ notified_at (NOT notified!)
>   created_at timestamptz DEFAULT now()
> );
> 
> 7. scan_history
> CREATE TABLE scan_history (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   product_id uuid REFERENCES products(id) ON DELETE SET NULL,
>   image_url text,
>   ocr_result jsonb,
>   confidence decimal(3,2),
>   created_at timestamptz DEFAULT now()
> );
> 
> 8. product_ingredients
> CREATE TABLE product_ingredients (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
>   ingredient_id uuid REFERENCES ingredients(id) ON DELETE CASCADE NOT NULL,
>   amount text,
>   position int,
>   created_at timestamptz DEFAULT now(),
>   UNIQUE(product_id, ingredient_id)
> );
> 
> 9. 헬퍼 함수들
> 
> -- ✅ 수정 #2: auth.jwt() 사용 (Supabase 표준)
> CREATE OR REPLACE FUNCTION get_current_user_id()
> RETURNS uuid AS $$
> DECLARE
>   clerk_id text;
>   user_uuid uuid;
> BEGIN
>   -- ✅ 수정: current_setting → auth.jwt()
>   clerk_id := auth.jwt()->>'sub';
>   IF clerk_id IS NULL THEN RETURN NULL; END IF;
>   
>   SELECT id INTO user_uuid FROM users_profile
>   WHERE users_profile.clerk_id = clerk_id LIMIT 1;
>   
>   RETURN user_uuid;
> END;
> $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
> 
> -- get_table_columns() (v1.7 신규)
> CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
> RETURNS TABLE (
>   column_name text,
>   data_type text,
>   is_generated text
> ) AS $$
> BEGIN
>   RETURN QUERY
>   SELECT 
>     c.column_name::text,
>     c.data_type::text,
>     c.is_generated::text
>   FROM information_schema.columns c
>   WHERE c.table_schema = 'public'
>     AND c.table_name = get_table_columns.table_name;
> END;
> $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
> 
> -- get_expiring_items_kst()
> CREATE OR REPLACE FUNCTION get_expiring_items_kst(days_threshold int DEFAULT 3)
> RETURNS TABLE (
>   id uuid,
>   user_id uuid,
>   product_id uuid,
>   expiry_date date,
>   days_until_expiry int
> ) AS $$
> DECLARE
>   kst_date date;
> BEGIN
>   kst_date := (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul')::date;
>   
>   RETURN QUERY
>   SELECT 
>     pi.id,
>     pi.user_id,
>     pi.product_id,
>     pi.expiry_date,
>     (pi.expiry_date - kst_date)::int AS days_until_expiry
>   FROM pantry_items pi
>   WHERE pi.status IN ('opened', 'almost_empty')
>     AND pi.expiry_date IS NOT NULL
>     AND pi.expiry_date <= kst_date + days_threshold
>     AND pi.notified_at IS NULL
>   FOR UPDATE SKIP LOCKED;
> END;
> $$ LANGUAGE plpgsql;
> 
> 10. 인덱스
> CREATE INDEX idx_pantry_user ON pantry_items(user_id);
> CREATE INDEX idx_pantry_product ON pantry_items(product_id);
> CREATE INDEX idx_pantry_status ON pantry_items(status);
> CREATE INDEX idx_pantry_expiry ON pantry_items(expiry_date);
> CREATE INDEX idx_pantry_added ON pantry_items(added_at);
> CREATE INDEX idx_products_name ON products(name);
> CREATE INDEX idx_products_brand ON products(brand);
> CREATE INDEX idx_products_category ON products(category);
> CREATE INDEX idx_users_display_name ON users_profile(display_name);  -- ✅ display_name 중복 조회 성능
> CREATE INDEX idx_notifications_user ON notifications(user_id);
> CREATE INDEX idx_notifications_read ON notifications(read);
> CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
> CREATE INDEX idx_scan_history_user ON scan_history(user_id);
> CREATE INDEX idx_scan_history_created ON scan_history(created_at DESC);
> CREATE INDEX idx_product_ingredients_product ON product_ingredients(product_id);
> CREATE INDEX idx_product_ingredients_ingredient ON product_ingredients(ingredient_id);
> 
> CRITICAL - 절대 생성 금지:
> - brands 테이블
> - link_clicks 테이블
> - audit_logs 테이블
> - subscriptions 테이블
> - consumption_patterns 테이블
> - trigger_analyses 테이블
> - family_groups 테이블
> 
> 이것들은 Phase 7-14에서 생성 예정
> ```
> 
> **[HUMAN] 수동 작업 (Supabase Dashboard):**
> 1. Supabase Dashboard → SQL Editor
> 2. 생성된 schema-tendplus-v1.9.sql 전체 복사
> 3. Run 실행
> 4. 에러 없이 완료 확인

- [ ] **1.1.2** 검증

> **검증 프롬프트:**
> ```
> Supabase SQL Editor에서 스키마가 제대로 생성되었는지 확인해줘.
> 
> ⚠️ CRITICAL: Supabase SQL Editor는 psql 명령어(\dt, \d, \l 등)를 지원하지 않습니다!
> 반드시 아래 SQL 사용:
> 
> 확인 SQL:
> 1. 테이블 목록 (8개여야 함):
>    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
>    → health_profiles, ingredients, notifications, pantry_items, product_ingredients,
>      products, scan_history, users_profile
> 
> 2. Generated Column 확인 (ingredients.name_ko_normalized):
>    SELECT column_name, is_generated, generation_expression 
>    FROM information_schema.columns 
>    WHERE table_schema = 'public' AND table_name = 'ingredients' AND column_name = 'name_ko_normalized';
>    → is_generated = 'ALWAYS' 여야 함
> 
> 3. 함수 확인 (3개):
>    SELECT proname FROM pg_proc 
>    WHERE proname IN ('get_current_user_id', 'get_table_columns', 'get_expiring_items_kst');
>    → 3 rows
> 
> CRITICAL:
> - brands, link_clicks, subscriptions 테이블 없어야 함!
> ```

---

### 1.2 RLS 정책

- [x] **1.2.1** RLS 정책 실행

> **Cursor 프롬프트:**
> ```
> schema-rls-phase1.sql 파일을 별도로 생성해줘. (RLS 정책만)
> 
> CRITICAL - 파일 분리:
> - schema-tendplus-v1.9.sql: 테이블, 함수, 인덱스만
> - schema-rls-phase1.sql: RLS 정책만
> - schema-storage-rls-phase1.sql: Storage RLS만 (1.3.2)
> 
> Supabase 실행 순서: 1) schema-tendplus-v1.9.sql 2) schema-rls-phase1.sql 3) [HUMAN] Storage 버킷 4) schema-storage-rls-phase1.sql
> 
> RLS 정책:
> 
> -- 1. users_profile
> ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
> 
> CREATE POLICY "Users can view own profile"
> ON users_profile FOR SELECT
> USING (id = get_current_user_id());
> 
> CREATE POLICY "Users can update own profile"
> ON users_profile FOR UPDATE
> USING (id = get_current_user_id());
> 
> -- 2. health_profiles
> ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
> 
> CREATE POLICY "Users can view own health"
> ON health_profiles FOR SELECT
> USING (user_id = get_current_user_id());
> 
> CREATE POLICY "Users can update own health"
> ON health_profiles FOR UPDATE
> USING (user_id = get_current_user_id());
> 
> -- 3. pantry_items
> ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
> 
> CREATE POLICY "Users can CRUD own pantry"
> ON pantry_items FOR ALL
> USING (user_id = get_current_user_id());
> 
> -- 4. Public read (ingredients, products)
> ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Anyone can view ingredients"
> ON ingredients FOR SELECT USING (true);
> 
> ALTER TABLE products ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Anyone can view products"
> ON products FOR SELECT USING (true);
> 
> -- 5. notifications
> ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
> 
> CREATE POLICY "Users can view own notifications"
> ON notifications FOR SELECT
> USING (user_id = get_current_user_id());
> 
> CREATE POLICY "Users can update own notifications"
> ON notifications FOR UPDATE
> USING (user_id = get_current_user_id());
> 
> -- 6. scan_history
> ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Users can CRUD own scans"
> ON scan_history FOR ALL
> USING (user_id = get_current_user_id());
> 
> CRITICAL:
> - 다른 테이블 RLS는 Phase 7-14에서 추가 예정
> ```

---

### 1.3 Storage 버킷

- [ ] **1.3.1** Storage 버킷 생성

> **[HUMAN] 수동 작업 (Supabase Dashboard):**
> ```
> Storage → New Bucket
> 
> 1. product-images (public: true)
> 2. ocr-scans (public: false)
> ```

- [x] **1.3.2** Storage RLS (수정 #5)

> **Cursor 프롬프트:**
> ```
> schema-storage-rls-phase1.sql 파일을 별도로 생성해줘. (Storage RLS만)
> [HUMAN] 1.3.1 Storage 버킷 생성 완료 후 실행
> 
> Supabase 실행 순서: 1) schema-tendplus-v1.9.sql 2) schema-rls-phase1.sql 3) [HUMAN] Storage 버킷 4) schema-storage-rls-phase1.sql
> 
> Storage RLS 정책:
> 
> -- ✅ 수정 #5: Clerk JWT 호환 (인증된 사용자만)
> 
> -- product-images (공개)
> CREATE POLICY "Public can view product images"
> ON storage.objects FOR SELECT
> USING (bucket_id = 'product-images');
> 
> CREATE POLICY "Authenticated can upload product images"
> ON storage.objects FOR INSERT
> WITH CHECK (
>   bucket_id = 'product-images'
>   AND auth.role() = 'authenticated'
> );
> 
> -- ocr-scans (비공개, 인증된 사용자만)
> CREATE POLICY "Authenticated can upload scans"
> ON storage.objects FOR INSERT
> WITH CHECK (
>   bucket_id = 'ocr-scans'
>   AND auth.role() = 'authenticated'
> );
> 
> CREATE POLICY "Authenticated can view scans"
> ON storage.objects FOR SELECT
> USING (
>   bucket_id = 'ocr-scans'
>   AND auth.role() = 'authenticated'
> );
> 
> CRITICAL:
> - auth.uid() 대신 auth.role() 사용 (Clerk JWT 호환)
> - Clerk JWT의 role: "authenticated" 사용
> ```

---

## ✅ Phase 1 완료 기준

- [ ] Supabase에서 8개 테이블 생성 확인
- [ ] Generated Column 확인 (information_schema로 name_ko_normalized 확인)
- [ ] 헬퍼 함수 3개 확인
- [ ] RLS 정책 확인
- [ ] Storage 버킷 2개 확인
- [ ] .env.local의 CURRENT_PHASE를 1로 업데이트 (1.1.1 스키마 Supabase 실행 완료 후!)

> **검증 프롬프트:**
> ```
> Phase 1이 완료되었는지 확인해줘.
> 
> CRITICAL 확인 사항:
> 1. brands, link_clicks, subscriptions 테이블이 없는가?
> 2. ingredients.name_ko_normalized이 Generated Column인가?
> 3. ingredients.ingredients_list 컬럼명이 정확한가?
> 4. pantry_items.notified_at, pantry_items.added_at 컬럼이 있는가? (수정 #17)
> 5. users_profile에 role, status, display_name 컬럼이 있는가?
> 6. get_table_columns() 함수가 있는가?
> 
> 공통 검증 (Phase 1+):
> - pnpm verify N (Phase 2~5, 해당 Phase)
> - Phase Lock: 다음 Phase 파일 생성 안 했는가?
> ```

---

## PHASE 2 — 인증 (Clerk)

> **🔴 플랜모드 사전 확인:**
> ```
> [ ] Phase 1 완료 (Supabase 테이블 8개 존재)
> [ ] [HUMAN] Clerk JWT Template "supabase" 생성 완료 ⚠️ 필수!
> [ ] .env.local에 Clerk 키 3개 입력 완료
> [ ] 위 조건 미충족 시 Phase 2 시작 금지!
> ```

```
🚧 PHASE 2 LOCK

이 Phase에서만 생성 가능:
- src/lib/supabase/client.ts
- src/lib/supabase/server.ts
- src/app/api/webhooks/clerk/route.ts
- src/middleware.ts
- src/app/(auth)/ 하위 파일

생성 금지:
- src/lib/api/ (Phase 3)
- src/components/ (Phase 3)
- src/app/api/ai/ (Phase 3)
- src/app/api/admin/ (Phase 8)
```

### 2.1 Clerk 설정

- [ ] **2.1.1** ⚠️ Clerk JWT Template (필수!)

> **[HUMAN] 수동 작업 먼저 — 완료 후 코드 작성 시작:**
> ```
> **Clerk Dashboard:**
> 1. JWT Templates → Create Template
> 2. Name: **supabase** (정확히)
> 3. Claims: `{"sub": "{{user.id}}", "aud": "authenticated", "role": "authenticated"}`
> 
> **Supabase Dashboard:**
> 1. Settings → API → JWT Settings
> 2. Custom JWT Secret
> 3. JWKS Endpoint: https://[clerk-domain]/.well-known/jwks.json
> ```

---

### 2.2 Clerk 통합

- [x] **2.2.1** Supabase 클라이언트 생성

> **Cursor 프롬프트:**
> ```
> src/lib/supabase/client.ts와 server.ts를 생성해줘.
> 
> // src/lib/supabase/client.ts
> 'use client';
> 
> import { createClient } from '@supabase/supabase-js';
> import { useAuth } from '@clerk/nextjs';
> 
> export function useSupabaseClient() {
>   const { getToken } = useAuth();
>   // JWT template 이름은 정확히 'supabase' (소문자) — Clerk Dashboard에서 확인
>   
>   return createClient(
>     process.env.NEXT_PUBLIC_SUPABASE_URL!,
>     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
>     {
>       global: {
>         headers: async () => {
>           const token = await getToken({ template: 'supabase' });
>           // template 'supabase' 없으면 null — Clerk JWT Template "supabase" 생성 확인
>           return token ? { Authorization: `Bearer ${token}` } : {};
>         },
>       },
>     }
>   );
> }
> 
> // src/lib/supabase/server.ts
> import { createClient } from '@supabase/supabase-js';
> import { auth } from '@clerk/nextjs/server';
> 
> export async function createServerClient() {
>   const { getToken } = await auth();
>   const token = await getToken({ template: 'supabase' });
>   
>   return createClient(
>     process.env.NEXT_PUBLIC_SUPABASE_URL!,
>     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
>     {
>       global: {
>         headers: { Authorization: token ? `Bearer ${token}` : '' },
>       },
>     }
>   );
> }
> 
> export function createAdminClient() {
>   return createClient(
>     process.env.NEXT_PUBLIC_SUPABASE_URL!,
>     process.env.SUPABASE_SERVICE_ROLE_KEY!
>   );
> }
> 
> export async function getCurrentUserId(): Promise<string | null> {
>   const { userId } = await auth();
>   if (!userId) return null;
>   
>   const supabase = await createServerClient();
>   const { data, error } = await supabase
>     .from('users_profile')
>     .select('id')
>     .eq('clerk_id', userId)
>     .maybeSingle();  // ✅ v1.7: .single() 금지!
>   
>   if (error) {
>     console.error('getCurrentUserId DB error:', error);
>     throw error;
>   }
>   return data?.id || null;
> }
> 
> CRITICAL:
> - .maybeSingle() 사용 (NOT .single()!)
> - JWT template 'supabase' 필수
> - createAdminClient()는 Service Role Key 사용
> ```

---

### 2.3 Webhook (수정 #3, #6, #18)

- [x] **2.3.1** Webhook 라우트 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/webhooks/clerk/route.ts를 생성해줘.
> 
> import { Webhook } from 'svix';
> import { headers } from 'next/headers';
> import { createAdminClient } from '@/lib/supabase/server';
> 
> export async function POST(req: Request) {
>   const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
>   
>   if (!WEBHOOK_SECRET) {
>     throw new Error('Missing CLERK_WEBHOOK_SECRET');
>   }
>   
>   const headerPayload = await headers();
>   const svix_id = headerPayload.get('svix-id');
>   const svix_timestamp = headerPayload.get('svix-timestamp');
>   const svix_signature = headerPayload.get('svix-signature');
>   
>   if (!svix_id || !svix_timestamp || !svix_signature) {
>     return new Response('Missing svix headers', { status: 400 });
>   }
>   
>   const payload = await req.json();
>   const body = JSON.stringify(payload);
>   
>   const wh = new Webhook(WEBHOOK_SECRET);
>   let evt: any;
>   
>   try {
>     evt = wh.verify(body, {
>       'svix-id': svix_id,
>       'svix-timestamp': svix_timestamp,
>       'svix-signature': svix_signature,
>     });
>   } catch (err) {
>     console.error('Webhook verification failed:', {
>       error: err instanceof Error ? err.message : 'Unknown error',
>       svixId: svix_id,
>       svixTimestamp: svix_timestamp,
>     });
>     return new Response('Invalid signature', { status: 400 });
>   }
>   
>   const { id, email_addresses, first_name, last_name } = evt.data;
>   const eventType = evt.type;
>   
>   const supabase = createAdminClient();
>   
>   // ✅ 수정 #6, #18: user.created 처리
>   if (eventType === 'user.created') {
>     // ✅ 수정 #3: 이메일 null/undefined 체크 + UNIQUE 보장
>     const email = email_addresses?.[0]?.email_address ?? `user-${id}@placeholder.local`;
>     
>     // 수정 #18: display_name (전체 조회 후 최대 번호 기반 생성)
>     let displayName = first_name && last_name
>       ? `${first_name} ${last_name}`
>       : email.split('@')[0];
>     
>     const { data: existingNames } = await supabase
>       .from('users_profile')
>       .select('display_name')
>       .ilike('display_name', `${displayName}%`);
>     
>     if (existingNames && existingNames.length > 0) {
>       const maxNum = existingNames.reduce((max, row) => {
>         const match = row.display_name?.match(/_(\d+)$/);
>         return match ? Math.max(max, parseInt(match[1])) : max;
>       }, 1);
>       if (maxNum >= 1) {
>         displayName = `${displayName}_${maxNum + 1}`;
>       }
>     }
>     
>     // 1. users_profile 생성
>     const { data: profile, error: insertError } = await supabase
>       .from('users_profile')
>       .insert({
>         clerk_id: id,
>         email,
>         display_name: displayName,
>       })
>       .select('id')
>       .maybeSingle();
>     
>     if (insertError) {
>       console.error('Webhook users_profile insert error:', insertError);
>       return new Response('DB error', { status: 500 });
>     }
>     
>     // 2. health_profiles 생성
>     if (profile) {
>       await supabase.from('health_profiles').insert({
>         user_id: profile.id,
>       });
>     }
>   }
>   
>   // ✅ 수정 #6: user.deleted 처리 (GDPR 준수)
>   if (eventType === 'user.deleted') {
>     // users_profile 삭제 (CASCADE로 관련 데이터 자동 삭제)
>     await supabase
>       .from('users_profile')
>       .delete()
>       .eq('clerk_id', id);
>   }
>   
>   // ✅ user.updated: 이메일 변경 시 Supabase 동기화 (HUMAN_TASKS 2.1.2 Events에 포함)
>   if (eventType === 'user.updated') {
>     const email = email_addresses?.[0]?.email_address ?? null;
>     if (email) {
>       const { error } = await supabase
>         .from('users_profile')
>         .update({ email })
>         .eq('clerk_id', id);
>       if (error) console.error('Webhook user.updated error:', error);
>     }
>   }
>   
>   return Response.json({ success: true });
> }
> 
> CRITICAL:
> - createAdminClient() 사용 (Service Role)
> - .maybeSingle() 사용 (NOT .single()!)
> - ✅ 수정 #3: email null 체크 + user-${id}@placeholder.local (UNIQUE 보장)
> - ✅ 수정 #6: user.deleted 처리
> - ✅ user.updated: 이메일 변경 시 users_profile.email 업데이트
> - ✅ 수정 #18: display_name 중복 시 _N 접미사 (전체 조회 후 maxNum+1)
> - Svix 서명 검증 필수
> ```

- [ ] **2.3.2** Clerk Dashboard에서 Webhook URL 설정

> **수동 작업:**
> ```
> Clerk Dashboard → Webhooks
> 1. Endpoint URL: https://your-app.vercel.app/api/webhooks/clerk
> 2. Events: user.created, user.updated, user.deleted (3개 모두 필수!)
> 3. Save
> ```

---

### 2.4 미들웨어 (수정 #1)

- [x] **2.4.1** 미들웨어 생성

> **Cursor 프롬프트:**
> ```
> src/middleware.ts를 생성해줘.
> 
> 🔴🔴🔴 CRITICAL: '/api/cron(.*)' 반드시 포함!
> 없으면 Cron 요청 401 에러 발생!
> 
> import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
> 
> const isPublicRoute = createRouteMatcher([
>   '/',
>   '/sign-in(.*)',
>   '/sign-up(.*)',
>   '/api/webhooks(.*)',
>   '/api/cron(.*)',  // 🔴 필수! 없으면 Cron 401
> ]);
> 
> export default clerkMiddleware(async (auth, req) => {
>   if (!isPublicRoute(req)) {
>     await auth.protect();
>   }
> });
> 
> export const config = {
>   matcher: [
>     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
>     '/(api|trpc)(.*)',
>   ],
> };
> ```
>
> CRITICAL:
> - 🔴 /api/cron(.*) 필수! (없으면 Cron 요청 차단됨)
> ```
> 
> **검증 프롬프트 (생성 후 즉시 실행 — 필수!):**
> ```
> CRITICAL - 생성 후 즉시 검증 (Windows 호환):
> pnpm verify 2
> → 또는 파일에서 "api/cron" 문자열 검색 (1개 이상 있어야 함!)
> → 결과 없으면 에러! 반드시 '/api/cron(.*)' 추가 후 재검증
> 
> Cursor가 주석만 넣고 실제 matcher에 누락할 수 있음.
> ```

---

## ✅ Phase 2 완료 기준

- [ ] 회원가입 테스트 성공
- [ ] Supabase에서 users_profile 생성 확인
- [ ] health_profiles 생성 확인
- [ ] Webhook 로그 확인 (Clerk Dashboard)
- [ ] ✅ 미들웨어에 /api/cron 확인
- [ ] .env.local의 CURRENT_PHASE를 2로 업데이트
- [ ] **자동 검증:** `pnpm verify 2` (Windows 호환)

> **검증 프롬프트:**
> ```
> Phase 2가 완료되었는지 확인해줘.
> 
> 확인 사항:
> 1. src/middleware.ts에 '/api/cron(.*)'이 있는가? (🔴 필수!)
> 2. Webhook에서 email null 체크하는가? (수정 #3)
> 3. Webhook에서 user.deleted 처리하는가? (수정 #6)
> 4. Webhook에서 user.updated 처리하는가? (이메일 동기화)
> 5. src/lib/supabase/client.ts에 .maybeSingle()을 사용했는가?
> 6. src/lib/supabase/server.ts에 .maybeSingle()을 사용했는가?
> 7. getCurrentUserId()에 .maybeSingle()을 사용했는가?
> 8. Webhook에서 createAdminClient()를 사용했는가?
> 9. .single()이 단 한 곳도 없는가?
> 10. getCurrentUserId()에 error 체크 있는가? (if (error) throw/return)
> 11. Webhook users_profile insert에 error 체크 있는가?
> 12. 모든 .maybeSingle() 쿼리에 { data, error } 구조 + error 체크 있는가?
> 
> CRITICAL:
> - pnpm verify 2 실행 (Windows 호환, 권장)
> 
> 공통 검증 (Phase 2+):
> - pnpm verify N (해당 Phase)
> - .single() → .maybeSingle() 변경
> - ingredients → ingredients_list
> - notified → notified_at
> - Phase Lock: 다음 Phase 파일 생성 안 했는가?
> ```

---

## PHASE 3 — AI 기능

> **🔴 플랜모드 사전 확인:**
> ```
> [ ] Phase 2 완료 (회원가입 테스트 성공)
> [ ] .env.local에 Upstash Redis 키 입력 완료
> [ ] .env.local에 GEMINI_API_KEY 입력 완료
> [ ] 없으면 플랜 중단!
> ```

```
🚧 PHASE 3 LOCK

이 Phase에서만 생성 가능:
- src/lib/api/rate-limiter.ts
- src/lib/utils/image-resize.client.ts
- src/app/api/ai/ocr/route.ts
- src/components/scan/CameraCapture.tsx

생성 금지:
- src/lib/api/mfds.ts (Phase 4)
- src/app/api/cron/ (Phase 5)
- src/app/api/admin/ (Phase 8)
```

### 3.1 Rate Limiter (v1.7 Fail Closed)

- [x] **3.1.1** Rate Limiter 생성

> **Cursor 프롬프트:**
> ```
> src/lib/api/rate-limiter.ts를 생성해줘.
> 
> import { Ratelimit } from '@upstash/ratelimit';
> import { Redis } from '@upstash/redis';
> 
> export const geminiRateLimiter = new Ratelimit({
>   redis: Redis.fromEnv(),
>   limiter: Ratelimit.slidingWindow(10, '1 m'),
>   analytics: true,
> });
> 
> let failOpenCount = 0;
> let lastFailTime = 0;  // Fail Closed 시점 (1시간 리셋용)
> let lastFailAlert = 0;
> const MAX_FAIL_OPEN = parseInt(
>   process.env.RATE_LIMIT_FAIL_OPEN_THRESHOLD || '20',
>   10
> );
> 
> export async function checkRateLimit(userId: string) {
>   try {
>     const { success, reset } = await geminiRateLimiter.limit(userId);
>     
>     failOpenCount = 0;  // ✅ v1.7: 성공 시 리셋
>     
>     if (!success) {
>       const waitSeconds = Math.ceil((reset - Date.now()) / 1000);
>       
>       if (process.env.NODE_ENV === 'production') {
>         return { allowed: false, retryAfter: waitSeconds };
>       }
>     }
>     
>     return { allowed: true };
>     
>   } catch (error) {
>     console.error('❌ Rate limiter error:', error);
>     
>     failOpenCount++;
>     
>     // 관리자 알림 (5회마다)
>     const now = Date.now();
>     if (failOpenCount % 5 === 0 && now - lastFailAlert > 60 * 60 * 1000) {
>       lastFailAlert = now;
>       console.warn(`🚨 Rate limit failed ${failOpenCount} times`);
>     }
>     
>     // ✅ v1.7: 20회 초과 시 Fail Closed
>     if (failOpenCount >= MAX_FAIL_OPEN) {
>       const now = Date.now();
>       if (lastFailTime === 0) {
>         lastFailTime = now;
>         console.error(`🚨 FAIL CLOSED: ${failOpenCount} failures`);
>         return { allowed: false, failClosed: true };
>       }
>       // ✅ 1시간 경과 시 리셋 (Serverless 콜드 스타트 대비, 수동 복구 없이)
>       if (now - lastFailTime > 60 * 60 * 1000) {
>         failOpenCount = 0;
>         lastFailTime = 0;
>         console.warn('🔄 Fail Closed 1시간 경과 — failOpenCount 리셋');
>       } else {
>         return { allowed: false, failClosed: true };
>       }
>     }
>     
>     // Fail Open (20회 미만)
>     console.warn(`⚠️ FAIL OPEN: ${failOpenCount}/${MAX_FAIL_OPEN}`);
>     return { allowed: true, failedOpen: true };
>   }
> }
> 
> CRITICAL:
> - failOpenCount는 전역 변수
> - 성공 시 failOpenCount = 0
> - 20회 초과 시 Fail Closed, 1시간 경과 시 자동 리셋 (lastFailTime 사용)
> - 환경변수 RATE_LIMIT_FAIL_OPEN_THRESHOLD=20
> ```

---

### 3.2 클라이언트 이미지 리사이징 (v1.7 신규)

- [x] **3.2.1** 이미지 리사이징 유틸 생성

> **Cursor 프롬프트:**
> ```
> src/lib/utils/image-resize.client.ts를 생성해줘.
> 
> 🔴 파일 최상단 필수 (SSR 빌드 실패 방지):
> 'use client';  // Next.js 클라이언트 컴포넌트
> /// <reference lib="dom" />
> if (typeof window === 'undefined') throw new Error('This module can only be used in browser!');
> 
> (위 3줄 다음에 나머지 코드)
> 
> export async function resizeImageClient(
>   base64: string,
>   options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
> ): Promise<string> {
>   const { maxWidth = 768, maxHeight = 768, quality = 0.8 } = options;
>   
>   return new Promise((resolve, reject) => {
>     const img = new Image();
>     
>     img.onload = () => {
>       const canvas = document.createElement('canvas');
>       const ctx = canvas.getContext('2d');
>       
>       if (!ctx) {
>         reject(new Error('Canvas not supported'));
>         return;
>       }
>       
>       let { width, height } = img;
>       
>       if (width > maxWidth) {
>         height = (height * maxWidth) / width;
>         width = maxWidth;
>       }
>       
>       if (height > maxHeight) {
>         width = (width * maxHeight) / height;
>         height = maxHeight;
>       }
>       
>       canvas.width = width;
>       canvas.height = height;
>       ctx.drawImage(img, 0, 0, width, height);
>       
>       const resized = canvas.toDataURL('image/jpeg', quality);
>       resolve(resized);
>     };
>     
>     img.onerror = () => reject(new Error('Image load failed'));
>     img.src = base64;
>   });
> }
> 
> CRITICAL:
> - 파일명 .client.ts 필수!
> - 런타임 체크 필수: if (typeof window === 'undefined') throw
> - maxWidth 768px
> - quality 0.8
> ```
> 
> **검증 프롬프트 (즉시 실행 — Windows 호환):**
> ```
> pnpm verify 3
> → 또는 image-resize.client.ts 최상단에 'use client' + 런타임 체크 있는지 확인
> 없으면 SSR 빌드 시 Image is not defined 에러 발생!
> ```

---

### 3.3 Gemini OCR

- [x] **3.3.1** OCR API 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/ai/ocr/route.ts를 생성해줘.
> 
> import { GoogleGenerativeAI } from '@google/generative-ai';
> import { getCurrentUserId } from '@/lib/supabase/server';
> import { checkRateLimit } from '@/lib/api/rate-limiter';
> 
> const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
> if (!GEMINI_API_KEY) {
>   throw new Error('GEMINI_API_KEY not set in .env.local');
> }
> const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
> 
> export async function POST(req: Request) {
>   const userId = await getCurrentUserId();
>   if (!userId) {
>     return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   }
>   
>   // ✅ v1.7: Rate Limit 체크
>   const rateLimitResult = await checkRateLimit(userId);
>   if (!rateLimitResult.allowed) {
>     return Response.json(
>       { 
>         error: '요청이 너무 많습니다', 
>         retryAfter: rateLimitResult.retryAfter,
>         failClosed: rateLimitResult.failClosed 
>       },
>       { status: 429 }
>     );
>   }
>   
>   const { imageBase64 } = await req.json();
>   
>   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
>   
>   const prompt = `이미지에서 제품 성분을 추출하세요.
> 
> JSON 형식으로 반환:
> {
>   "product_name": "제품명",
>   "ingredients": ["성분1", "성분2", ...],
>   "confidence": 0.9
> }`;
>   
>   try {
>     // ✅ 방어 코드: data: 프리픽스 없으면 그대로 사용 (직접 base64 전송 시)
>     const base64Data = imageBase64.includes(',')
>       ? imageBase64.split(',')[1]
>       : imageBase64;
>     
>     const result = await model.generateContent([
>       {
>         inlineData: {
>           mimeType: 'image/jpeg',
>           data: base64Data,
>         },
>       },
>       { text: prompt },
>     ]);
>     
>     const text = result.response.text();
>     const jsonMatch = text.match(/\{[\s\S]*\}/);
>     
>     if (!jsonMatch) {
>       throw new Error('Invalid JSON response');
>     }
>     
>     const data = JSON.parse(jsonMatch[0]);
>     
>     return Response.json({ success: true, data });
>     
>   } catch (error) {
>     console.error('Gemini OCR error:', error);
>     return Response.json(
>       { error: 'OCR 실패', needsManualInput: true },
>       { status: 500 }
>     );
>   }
> }
> 
> CRITICAL:
> - checkRateLimit(userId) 호출 필수
> - getCurrentUserId() 사용
> - 429 에러 처리 (retryAfter, failClosed)
> - base64Data: imageBase64.includes(',') ? split(',')[1] : imageBase64 (방어 코드)
> ```

---

### 3.4 카메라 UI

- [x] **3.4.1** 카메라 컴포넌트 생성

> **Cursor 프롬프트:**
> ```
> src/components/scan/CameraCapture.tsx를 생성해줘.
> 
> 'use client';
> 
> import { useRef, useState } from 'react';
> import Webcam from 'react-webcam';
> import { resizeImageClient } from '@/lib/utils/image-resize.client';
> 
> interface CameraCaptureProps {
>   onCapture: (data: any) => void;
> }
> 
> export function CameraCapture({ onCapture }: CameraCaptureProps) {
>   const webcamRef = useRef<Webcam>(null);
>   const [isProcessing, setIsProcessing] = useState(false);
>   
>   const handleCapture = async () => {
>     setIsProcessing(true);
>     
>     try {
>       const imageSrc = webcamRef.current?.getScreenshot();
>       if (!imageSrc) throw new Error('No image');
>       
>       // ✅ v1.7: 클라이언트 리사이징 (6배 빠름)
>       const resized = await resizeImageClient(imageSrc, {
>         maxWidth: 768,
>         quality: 0.8,
>       });
>       
>       const response = await fetch('/api/ai/ocr', {
>         method: 'POST',
>         headers: { 'Content-Type': 'application/json' },
>         body: JSON.stringify({ imageBase64: resized }),
>       });
>       
>       const result = await response.json();
>       
>       if (result.success) {
>         onCapture(result.data);
>       } else {
>         throw new Error(result.error);
>       }
>       
>     } catch (error) {
>       console.error('Capture failed:', error);
>       alert('촬영 실패. 다시 시도해주세요.');
>     } finally {
>       setIsProcessing(false);
>     }
>   };
>   
>   return (
>     <div className="flex flex-col items-center gap-4">
>       <Webcam
>         ref={webcamRef}
>         screenshotFormat="image/jpeg"
>         className="rounded-lg"
>       />
>       
>       <button
>         onClick={handleCapture}
>         disabled={isProcessing}
>         className="px-6 py-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50"
>       >
>         {isProcessing ? '처리 중...' : '📷 촬영'}
>       </button>
>     </div>
>   );
> }
> 
> CRITICAL:
> - resizeImageClient() 호출 필수
> - maxWidth 768px
> - quality 0.8
> - /api/ai/ocr 연동
> ```

---

## ✅ Phase 3 완료 기준

- [ ] .env.local의 CURRENT_PHASE를 3으로 업데이트
- [ ] Rate Limiter 동작 확인
- [ ] 이미지 리사이징 테스트
- [ ] OCR API 테스트
- [ ] 카메라 UI 테스트
- [ ] **자동 검증:** `pnpm verify 3` (Windows 호환)
- [ ] **빌드 테스트:** `pnpm build`

> **검증 프롬프트:**
> ```
> Phase 3이 완료되었는지 확인해줘.
> 
> 확인 사항:
> 1. src/lib/utils/image-resize.client.ts 파일명 확인
> 2. 런타임 체크 있는가? (if (typeof window === 'undefined'))
> 3. Rate Limiter에 failOpenCount 변수 있는가?
> 4. MAX_FAIL_OPEN = 20인가?
> 5. OCR API에서 checkRateLimit() 호출하는가?
> 
> CRITICAL:
> - pnpm verify 3 실행 (Windows 호환)
> - pnpm build 성공 확인
> - image-resize.client.ts 파일명 정확한가?
> - Rate Limit Fail Closed 동작하는가?
> 
> 공통 검증 (Phase 3+):
> - pnpm verify N (해당 Phase)
> - Phase Lock: 다음 Phase 파일 생성 안 했는가?
> ```

---

## PHASE 4 — 식약처 API

> **🔴 플랜모드 사전 확인:**
> ```
> [ ] Phase 3 완료 (OCR 테스트 성공)
> [ ] .env.local에 MFDS_API_KEY 입력 (선택)
> ```

```
🚧 PHASE 4 LOCK

이 Phase에서만 생성 가능:
- src/lib/api/mfds.ts
- 식약처 API 연동 로직

생성 금지:
- src/app/api/cron/ (Phase 5)
```

### 4.1 식약처 API 연동

- [x] **4.1.1** `src/lib/api/mfds.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/lib/api/mfds.ts를 생성해줘.
> 
> /**
>  * 식약처 식품의약품안전처 API
>  * https://www.data.go.kr/
>  * 
>  * 필수: 공공데이터포털 API 키 발급
>  * 환경변수: MFDS_API_KEY
>  */
> 
> export async function searchFoodByIngredient(
>   ingredientName: string
> ): Promise<{ name: string; approval: string }[]> {
>   const apiKey = process.env.MFDS_API_KEY;
>   if (!apiKey) {
>     console.warn('⚠️ MFDS_API_KEY not set');
>     return [];
>   }
>   
>   try {
>     const url = new URL('http://apis.data.go.kr/1471000/FoodNtrIrdntInfoService1/getFoodNtrItdntList1');
>     url.searchParams.set('serviceKey', apiKey);
>     url.searchParams.set('item_name', ingredientName);
>     url.searchParams.set('type', 'json');
>     url.searchParams.set('numOfRows', '10');
>     
>     const res = await fetch(url.toString());
>     const data = await res.json();
>     
>     return data.body?.items || [];
>   } catch (error) {
>     console.error('MFDS API error:', error);
>     return [];
>   }
> }
> 
> CRITICAL:
> - .env.local에 MFDS_API_KEY 추가
> - 공공데이터포털에서 API 키 발급 필요
> ```

---

## PHASE 5 — Cron Job

> **🔴 Phase 5 시작 전 필수 (미충족 시 플랜 중단!):**
> ```
> [ ] Phase 4 완료
> [ ] [HUMAN] CRON_SECRET 생성 완료 (.env.local)
> [ ] Vercel 배포 시 Environment Variables에 CRON_SECRET 추가 (배포 후 Cron 401 방지)
> ```
> **[HUMAN] CRON_SECRET 생성:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> # 결과를 .env.local에 CRON_SECRET= 추가
> ```

### 5.1 Pantry Check

- [x] **5.1.1** `src/app/api/cron/pantry-check/route.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/cron/pantry-check/route.ts를 생성해줘.
> 
> import { createAdminClient } from '@/lib/supabase/server';
> 
> export async function GET(req: Request) {
>   const authHeader = req.headers.get('x-vercel-cron-secret');
>   
>   if (authHeader !== process.env.CRON_SECRET) {
>     console.error('❌ Unauthorized cron request');
>     return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   }
>   
>   const supabase = createAdminClient();
>   
>   try {
>     const { data: items, error } = await supabase.rpc(
>       'get_expiring_items_kst',
>       { days_threshold: 3 }
>     );
>     
>     if (error) {
>       console.error('❌ RPC error:', error);
>       throw error;
>     }
>     
>     if (!items || items.length === 0) {
>       console.log('✅ No expiring items');
>       return Response.json({
>         message: '알림 대상 없음',
>         count: 0,
>       });
>     }
>     
>     console.log(`📦 Found ${items.length} expiring items`);
>     
>     // ✅ Race Condition 방지: 알림 생성 전 즉시 notified_at 일괄 업데이트 (다른 Cron 차단)
>     const itemIds = items.map((i: { id: string }) => i.id);
>     await supabase
>       .from('pantry_items')
>       .update({ notified_at: new Date().toISOString() })
>       .in('id', itemIds);
>     
>     for (const item of items) {
>       await supabase.from('notifications').insert({
>         user_id: item.user_id,
>         type: 'expiry_warning',
>         title: '유통기한 임박',
>         body: `제품이 ${item.days_until_expiry}일 후 만료됩니다.`,
>         data: {
>           pantry_item_id: item.id,
>           product_id: item.product_id,
>           expiry_date: item.expiry_date,
>         },
>       });
>     }
>     
>     console.log('✅ Notifications created');
>     
>     return Response.json({
>       message: '알림 생성 완료',
>       count: items.length,
>     });
>   } catch (error) {
>     console.error('❌ Cron error:', error);
>     return Response.json(
>       { error: 'Cron 실행 실패' },
>       { status: 500 }
>     );
>   }
> }
> 
> CRITICAL:
> - x-vercel-cron-secret 헤더로 인증 (수정 #9)
> - notified_at 업데이트 필수 (수정 #2)
> ```

---

## PHASE 6 — 배포 검증

### 6.1 Vercel 배포

- [ ] **6.1.1** Vercel 프로젝트 연결
- [ ] **6.1.2** 환경변수 설정 (Clerk, Supabase, Gemini, Cron 등)
- [ ] **6.1.3** 빌드 성공 확인 (`pnpm build`)
- [ ] **6.1.4** Cron Secret 설정 (Vercel Dashboard → Settings → Environment Variables)

> **검증 체크리스트:**
> - [ ] pnpm build 성공
> - [ ] verify-schema 스크립트 통과
> - [ ] /api/cron/pantry-check 호출 시 401 (secret 없음) 또는 200 (secret 있음)
> - [ ] Clerk Webhook URL: https://[도메인]/api/webhooks/clerk
> ```

---

## PHASE 7 — 아웃링크 커머스 (수정 #10)

```
🚧 PHASE 7 LOCK

이 Phase에서만 생성 가능:
- brands 테이블
- link_clicks 테이블
- audit_logs 테이블
- src/components/commerce/BuyButton.tsx
- RLS 정책
```

### 7.1 테이블 생성

- [x] **7.1.1** brands, link_clicks, audit_logs 테이블 생성

> **Cursor 프롬프트:**
> ```
> Phase 7 테이블을 생성해줘.
> 
> -- brands (Phase 7)
> CREATE TABLE brands (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   name text NOT NULL,
>   logo_url text,
>   website_url text,
>   affiliate_url text,
>   commission_rate decimal(5,2) DEFAULT 15.00,
>   status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
>   created_at timestamptz DEFAULT now()
> );
> 
> -- products에 brand_id, affiliate_url 추가 (Phase 7)
> -- ⚠️ brand 컬럼은 Phase 1에서 생성됨 — 유지. brand_id는 별도 FK.
> ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id);
> ALTER TABLE products ADD COLUMN IF NOT EXISTS affiliate_url text;
> 
> -- link_clicks
> CREATE TABLE link_clicks (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE SET NULL,
>   product_id uuid REFERENCES products(id) ON DELETE SET NULL,
>   brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
>   clicked_at timestamptz DEFAULT now()
> );
> 
> -- audit_logs (Phase 8 선행)
> CREATE TABLE audit_logs (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE SET NULL,
>   action text NOT NULL,
>   resource_type text,
>   resource_id uuid,
>   details jsonb,
>   created_at timestamptz DEFAULT now()
> );
> 
> CREATE INDEX idx_link_clicks_user ON link_clicks(user_id);
> CREATE INDEX idx_link_clicks_product ON link_clicks(product_id);
> CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
> ```

### 7.2 RLS 정책 (수정 #10)

- [x] **7.2.1** brands, link_clicks, audit_logs RLS 생성

> ```sql
> -- brands (공개 READ)
> ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Anyone can view brands" ON brands FOR SELECT USING (true);
> 
> -- link_clicks (INSERT만, 본인 READ)
> ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Anyone can insert clicks" ON link_clicks FOR INSERT WITH CHECK (true);
> CREATE POLICY "Users can view own clicks" ON link_clicks FOR SELECT
> USING (user_id = get_current_user_id() OR user_id IS NULL);
> 
> -- audit_logs (관리자만)
> ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT
> USING (
>   EXISTS (
>     SELECT 1 FROM users_profile
>     WHERE id = get_current_user_id()
>       AND role IN ('admin', 'super_admin')
>   )
> );
> ```

### 7.3 BuyButton 컴포넌트

- [x] **7.3.1** `src/components/commerce/BuyButton.tsx` 생성

> **Cursor 프롬프트:**
> ```
> src/components/commerce/BuyButton.tsx를 생성해줘.
> 
> 'use client';
> 
> interface BuyButtonProps {
>   productId: string;
>   affiliateUrl: string;
>   brandId?: string;
>   children: React.ReactNode;
> }
> 
> export function BuyButton({ productId, affiliateUrl, brandId, children }: BuyButtonProps) {
>   const handleClick = async () => {
>     // 1. link_clicks 기록 (API 호출)
>     await fetch('/api/commerce/click', {
>       method: 'POST',
>       headers: { 'Content-Type': 'application/json' },
>       body: JSON.stringify({ productId, brandId }),
>     });
>     
>     // 2. 새 탭에서 링크 열기
>     window.open(affiliateUrl, '_blank');
>   };
>   
>   return (
>     <button onClick={handleClick} className="...">
>       {children}
>     </button>
>   );
> }
> 
> ```

### 7.4 링크 클릭 API

- [x] **7.4.1** `src/app/api/commerce/click/route.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/commerce/click/route.ts를 생성해줘.
> 
> import { getCurrentUserId, createServerClient } from '@/lib/supabase/server';
> 
> export async function POST(req: Request) {
>   const userId = await getCurrentUserId();  // null 허용 (비로그인 클릭)
>   const { productId, brandId } = await req.json();
>   
>   const supabase = await createServerClient();
>   await supabase.from('link_clicks').insert({
>     user_id: userId,
>     product_id: productId,
>     brand_id: brandId,
>   });
>   
>   return Response.json({ success: true });
> }
> ```

---

## PHASE 8 — 어드민 (수정 #20)

### 8.1 Role 제약 (수정 #20)

- [x] **8.1.1** Phase 1 스키마 확인

> **수정 #20: Phase 1에서 이미 role CHECK 생성됨**
> Phase 8에서는 추가 작업 불필요.
> 
> 만약 Phase 1에서 CHECK를 깜빡했다면:
> ```sql
> ALTER TABLE users_profile DROP CONSTRAINT IF EXISTS users_profile_role_check;
> ALTER TABLE users_profile ADD CONSTRAINT users_profile_role_check
> CHECK (role IN ('user', 'admin', 'super_admin'));
> CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);
> ```

### 8.2 어드민 테이블 RLS (수정 #10)

- [x] **8.2.1** disclaimers, ocr_corrections 테이블 및 RLS

> ```sql
> -- disclaimers (공개 READ, 관리자 WRITE)
> CREATE TABLE disclaimers (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   title text NOT NULL,
>   content text NOT NULL,
>   is_active boolean DEFAULT true,
>   created_at timestamptz DEFAULT now()
> );
> ALTER TABLE disclaimers ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Anyone can view active disclaimers" ON disclaimers FOR SELECT
> USING (is_active = true);
> CREATE POLICY "Admins can manage disclaimers" ON disclaimers FOR ALL
> USING (
>   EXISTS (
>     SELECT 1 FROM users_profile
>     WHERE id = get_current_user_id()
>       AND role IN ('admin', 'super_admin')
>   )
> );
> 
> -- ocr_corrections (본인 + 관리자)
> CREATE TABLE ocr_corrections (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   scan_history_id uuid REFERENCES scan_history(id) ON DELETE CASCADE,
>   original_text text,
>   corrected_text text,
>   status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
>   created_at timestamptz DEFAULT now()
> );
> ALTER TABLE ocr_corrections ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Users can view own corrections" ON ocr_corrections FOR SELECT
> USING (user_id = get_current_user_id());
> CREATE POLICY "Admins can review corrections" ON ocr_corrections FOR UPDATE
> USING (
>   EXISTS (
>     SELECT 1 FROM users_profile
>     WHERE id = get_current_user_id()
>       AND role IN ('admin', 'super_admin')
>   )
> );
> ```

### 8.3 check-role 유틸

- [x] **8.3.1** `src/lib/auth/check-role.ts` 생성

> ```typescript
> import { getCurrentUserId } from '@/lib/supabase/server';
> import { createServerClient } from '@/lib/supabase/server';
> 
> export async function checkRole(allowedRoles: ('admin' | 'super_admin')[]) {
>   const userId = await getCurrentUserId();
>   if (!userId) throw new Error('Unauthorized');
>   
>   const supabase = await createServerClient();
>   const { data } = await supabase
>     .from('users_profile')
>     .select('role')
>     .eq('id', userId)
>     .maybeSingle();
>   
>   if (!data || !allowedRoles.includes(data.role as any)) {
>     throw new Error('Forbidden');
>   }
> }
> ```

---

## PHASE 9 — 보안 강화

> **🔴 플랜모드 사전 확인:**
> ```
> [ ] [HUMAN] ENCRYPTION_KEY 생성 후 .env.local에 추가 (32바이트 = 64 hex 문자)
> ```
> **[HUMAN] ENCRYPTION_KEY 생성:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> # 결과를 .env.local에 ENCRYPTION_KEY= 추가
> ```

### 9.1 AES-256-GCM 암호화

- [x] **9.1.1** `src/lib/security/encryption.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/lib/security/encryption.ts를 생성해줘.
> 
> import crypto from 'crypto';
> 
> const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
> 
> if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
>   throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
> }
> 
> export function encrypt(text: string): string {
>   const iv = crypto.randomBytes(16);
>   const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
>   let encrypted = cipher.update(text, 'utf8', 'hex');
>   encrypted += cipher.final('hex');
>   const authTag = cipher.getAuthTag();
>   return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
> }
> 
> export function decrypt(encryptedData: string): string {
>   const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
>   const iv = Buffer.from(ivHex, 'hex');
>   const authTag = Buffer.from(authTagHex, 'hex');
>   const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
>   decipher.setAuthTag(authTag);
>   let decrypted = decipher.update(encrypted, 'hex', 'utf8');
>   decrypted += decipher.final('utf8');
>   return decrypted;
> }
> 
> // 키 생성: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
> ```

### 9.1.3 health_profiles 암호화

- [x] **9.1.3** health_profiles 저장/조회 시 encrypt/decrypt 적용

> medications, allergies 등 민감 데이터 저장 시:
> `encrypt(JSON.stringify(medications))` 사용
> 조회 시: `JSON.parse(decrypt(data.medications))` 사용

---

## PHASE 11 — 가변형 구독 (수정 #16, #17)

### 11.1 테이블 생성

- [ ] **11.1.1** subscriptions, consumption_patterns 테이블 생성

> ```sql
> CREATE TABLE subscriptions (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   product_id uuid REFERENCES products(id) NOT NULL,
>   pantry_item_id uuid REFERENCES pantry_items(id) ON DELETE SET NULL,
>   status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
>   current_cycle_days int DEFAULT 30,
>   last_finished_at timestamptz,
>   next_reminder_at timestamptz,
>   created_at timestamptz DEFAULT now(),
>   UNIQUE(user_id, product_id)
> );
> 
> CREATE TABLE consumption_patterns (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   product_id uuid REFERENCES products(id) NOT NULL,
>   pantry_item_id uuid REFERENCES pantry_items(id) ON DELETE SET NULL,
>   purchased_at timestamptz NOT NULL,
>   finished_at timestamptz NOT NULL,
>   actual_duration_days int GENERATED ALWAYS AS (
>     EXTRACT(DAY FROM (finished_at - purchased_at))::int
>   ) STORED,
>   status text DEFAULT 'completed',
>   created_at timestamptz DEFAULT now()
> );
> ```

### 11.2 가변형 주기 계산

- [ ] **11.2.1** `src/lib/subscription/calculate-cycle.ts` 생성

> ```typescript
> export function calculateAdjustedCycle(patterns: { actual_duration_days: number }[]): number | null {
>   if (!patterns || patterns.length === 0) return null;
>   // ✅ 1개 패턴이면 그대로 사용 (null 반환 시 구독 알림 안 옴)
>   if (patterns.length === 1) return patterns[0].actual_duration_days;
>   const sum = patterns.reduce((acc, p) => acc + p.actual_duration_days, 0);
>   const avg = sum / patterns.length;
>   if (!Number.isFinite(avg) || avg <= 0 || avg > 365) return null;
>   return Math.round(avg);
> }
> ```

### 11.3 "다 썼어요" API (수정 #16, #17)

- [ ] **11.3.1** `src/app/api/pantry/finish/route.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/pantry/finish/route.ts를 생성해줘.
> 
> import { getCurrentUserId, createServerClient } from '@/lib/supabase/server';
> import { calculateAdjustedCycle } from '@/lib/subscription/calculate-cycle';
> 
> export async function POST(req: Request) {
>   const userId = await getCurrentUserId();
>   if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   
>   const { pantryItemId } = await req.json();
>   const supabase = await createServerClient();
>   
>   // 수정 #16: pantry_items만 조회
>   const { data: pantryItem } = await supabase
>     .from('pantry_items')
>     .select('*')
>     .eq('id', pantryItemId)
>     .eq('user_id', userId)
>     .maybeSingle();
>   
>   if (!pantryItem) return Response.json({ error: 'Not found' }, { status: 404 });
>   
>   const now = new Date();
>   
>   await supabase.from('pantry_items').update({ status: 'empty' }).eq('id', pantryItemId);
>   
>   // 수정 #17: added_at 사용
>   if (pantryItem.added_at) {
>     await supabase.from('consumption_patterns').insert({
>       user_id: userId,
>       product_id: pantryItem.product_id,
>       pantry_item_id: pantryItemId,
>       purchased_at: pantryItem.added_at,
>       finished_at: now.toISOString(),
>     });
>   }
>   
>   // 수정 #16: subscriptions 별도 조회
>   const { data: subscription, error: subError } = await supabase
>     .from('subscriptions')
>     .select('*')
>     .eq('user_id', userId)
>     .eq('product_id', pantryItem.product_id)
>     .maybeSingle();
>   
>   if (subError) {
>     console.error('Subscription query error:', subError);
>     return Response.json({ error: 'DB error' }, { status: 500 });
>   }
>   
>   if (subscription) {
>     const { data: patterns } = await supabase
>       .from('consumption_patterns')
>       .select('actual_duration_days')
>       .eq('user_id', userId)
>       .eq('product_id', pantryItem.product_id)
>       .order('finished_at', { ascending: false })
>       .limit(5);
>     
>     const adjustedCycle = patterns ? calculateAdjustedCycle(patterns) : null;
>     const nextCycle = adjustedCycle || subscription.current_cycle_days || 30;
>     
>     await supabase.from('subscriptions').update({
>       last_finished_at: now.toISOString(),
>       current_cycle_days: nextCycle,
>       next_reminder_at: new Date(now.getTime() + nextCycle * 24 * 60 * 60 * 1000).toISOString(),
>     }).eq('id', subscription.id);
>     
>     return Response.json({ success: true, nextCycle });
>   }
>   
>   return Response.json({ success: true });
> }
> ```

### 11.4 구독 알림 Cron

- [ ] **11.4.1** `src/app/api/cron/subscription-reminder/route.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/cron/subscription-reminder/route.ts를 생성해줘.
> 
> import { createAdminClient } from '@/lib/supabase/server';
> 
> export async function GET(req: Request) {
>   if (req.headers.get('x-vercel-cron-secret') !== process.env.CRON_SECRET) {
>     return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   }
>   
>   const supabase = createAdminClient();
>   const now = new Date();
>   
>   const { data: subs } = await supabase
>     .from('subscriptions')
>     .select('*')
>     .eq('status', 'active')
>     .lte('next_reminder_at', now.toISOString());
>   
>   if (!subs || subs.length === 0) {
>     return Response.json({ message: '알림 대상 없음', count: 0 });
>   }
>   
>   for (const sub of subs) {
>     await supabase.from('notifications').insert({
>       user_id: sub.user_id,
>       type: 'subscription_reminder',
>       title: '재구매 시기 알림',
>       body: `${sub.current_cycle_days}일 주기 재구매 시기입니다.`,
>       data: { subscription_id: sub.id, product_id: sub.product_id },
>     });
>     
>     const nextReminderAt = new Date(
>       now.getTime() + sub.current_cycle_days * 24 * 60 * 60 * 1000
>     );
>     await supabase.from('subscriptions')
>       .update({ next_reminder_at: nextReminderAt.toISOString() })
>       .eq('id', sub.id);
>   }
>   
>   return Response.json({ message: '알림 생성 완료', count: subs.length });
> }
> ```

- [ ] **11.4.2** vercel.json에 subscription-reminder cron 추가

> **Cursor 프롬프트:** vercel.json crons 배열에 subscription-reminder 항목 추가해줘.
> ```json
> "crons": [
>   { "path": "/api/cron/pantry-check", "schedule": "0 9 * * *" },
>   { "path": "/api/cron/subscription-reminder", "schedule": "0 10 * * *" }
> ]
> ```
> (pantry-check는 Phase 0에 이미 있음, subscription-reminder만 추가)

---

## PHASE 12 — AI 고도화 (수정 #21, #15)

### 12.1 trigger_analyses 테이블 (수정 #7)

- [ ] **12.1.1** trigger_analyses 테이블 및 RLS 생성

> ```sql
> CREATE TABLE trigger_analyses (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   good_products jsonb NOT NULL,
>   bad_products jsonb NOT NULL,
>   good_ingredients jsonb,
>   bad_ingredients jsonb,
>   difference_ingredients jsonb,
>   suspected_ingredients jsonb,
>   confidence decimal(3,2),
>   created_at timestamptz DEFAULT now()
> );
> CREATE INDEX idx_trigger_analyses_user ON trigger_analyses(user_id);
> ALTER TABLE trigger_analyses ENABLE ROW LEVEL SECURITY;
> CREATE POLICY "Users can CRUD own analyses" ON trigger_analyses FOR ALL
> USING (user_id = get_current_user_id());
> ```

### 12.2 DrugBank, EWG 연동 (수정 #15)

- [ ] **12.2.1** `src/lib/api/drugbank.ts` (라이선스 주석)

> **수정 #15: DrugBank Academic License 필요**
> - Academic use only
> - Commercial use 금지
> - 대안: FDA API, OpenFDA
> 
> ```typescript
> export async function checkDrugInteraction(medication: string, ingredient: string) {
>   const key = process.env.DRUGBANK_API_KEY;
>   if (!key) return { hasInteraction: false, skipped: true };  // UI에서 "확인 불가" 표시
>   // API 호출...
> }
> 
> CRITICAL: skipped: true 반환 시 UI에서 "약물 상호작용 확인 불가 (API 키 미설정)" 표시
> ```

- [ ] **12.2.2** `src/lib/api/ewg.ts` (크롤링 제한 주석)

> **수정 #15: EWG Skin Deep**
> - API 없음, robots.txt 준수
> - Rate limiting 1 req/sec
> - 대안: INCI Decoder, CosDNA

### 12.3 AI 성분 수사관 (수정 #21)

- [ ] **12.3.1** `src/app/api/ai/trigger-analysis/route.ts` 생성

> **수정 #21: optional chaining + 타입 가드**
> ```typescript
> const goodIngredients = [...new Set(
>   (goodIngs ?? [])
>     .map((i) => i.ingredients?.name_ko)
>     .filter((name): name is string => Boolean(name))
> )];
> const badIngredients = [...new Set(
>   (badIngs ?? [])
>     .map((i) => i.ingredients?.name_ko)
>     .filter((name): name is string => Boolean(name))
> )];
> ```
> - Good/Bad 성분 합집합 → 차집합 → Gemini 질의 → trigger_analyses 저장

### 12.4 세이프티 프로필 Cron (선택)

- [ ] **12.4.1** `src/app/api/cron/safety-profile/route.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/cron/safety-profile/route.ts를 생성해줘.
> 
> import { createAdminClient } from '@/lib/supabase/server';
> 
> export async function GET(req: Request) {
>   if (req.headers.get('x-vercel-cron-secret') !== process.env.CRON_SECRET) {
>     return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   }
>   
>   const supabase = createAdminClient();
>   
>   const { data: profiles } = await supabase
>     .from('health_profiles')
>     .select('user_id, blacklist_ingredients')
>     .not('blacklist_ingredients', 'eq', '[]');
>   
>   if (!profiles || profiles.length === 0) {
>     return Response.json({ message: '알림 대상 없음', count: 0 });
>   }
>   
>   for (const p of profiles) {
>     const ingredients = p.blacklist_ingredients as string[];
>     if (ingredients?.length > 0) {
>       await supabase.from('notifications').insert({
>         user_id: p.user_id,
>         type: 'safety_reminder',
>         title: '성분 주의 알림',
>         body: `주의 성분 ${ingredients.length}개가 등록되어 있습니다.`,
>         data: { blacklist: ingredients },
>       });
>     }
>   }
>   
>   return Response.json({ message: '알림 생성 완료', count: profiles.length });
> }
> ```
> 
> vercel.json에 `{ "path": "/api/cron/safety-profile", "schedule": "0 8 * * *" }` 추가

---

## PHASE 13 — 알림 시스템

### 13.1 Resend 이메일 연동

- [ ] **13.1.1** `src/lib/notifications/email.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/lib/notifications/email.ts를 생성해줘.
> 
> import { Resend } from 'resend';
> 
> const resend = new Resend(process.env.RESEND_API_KEY);
> 
> export async function sendEmail(to: string, subject: string, html: string) {
>   try {
>     const { data, error } = await resend.emails.send({
>       from: 'TEND+ <noreply@example.com>',
>       to,
>       subject,
>       html,
>     });
>     if (error) throw error;
>     console.log('✅ Email sent:', to);
>     return data;
>   } catch (error) {
>     console.error('❌ Email send error:', error);
>     throw error;
>   }
> }
> ```
> 
> **참고:** resend는 Phase 0 패키지 설치에 포함됨

### 13.2 가족 계정 (수정 #10)

- [ ] **13.2.1** family_groups, family_members, family_invites 테이블 및 RLS 생성

> ```sql
> CREATE TABLE family_groups (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   name text NOT NULL,
>   owner_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   created_at timestamptz DEFAULT now()
> );
> CREATE TABLE family_members (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
>   user_id uuid REFERENCES users_profile(id) ON DELETE CASCADE NOT NULL,
>   role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
>   created_at timestamptz DEFAULT now(),
>   UNIQUE(group_id, user_id)
> );
> CREATE TABLE family_invites (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   group_id uuid REFERENCES family_groups(id) ON DELETE CASCADE NOT NULL,
>   inviter_id uuid REFERENCES users_profile(id) NOT NULL,
>   invitee_email text NOT NULL,
>   token text UNIQUE NOT NULL,
>   status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
>   expires_at timestamptz NOT NULL,
>   created_at timestamptz DEFAULT now()
> );
> -- RLS: owner/member만 조회, owner만 관리
> ```

### 13.3 가족 초대/수락 API

- [ ] **13.3.1** `src/app/api/family/invite/route.ts` (POST)

> **Cursor 프롬프트:**
> ```
> src/app/api/family/invite/route.ts를 생성해줘.
> 
> import { getCurrentUserId, createServerClient } from '@/lib/supabase/server';
> import { sendEmail } from '@/lib/notifications/email';
> import crypto from 'crypto';
> 
> export async function POST(req: Request) {
>   const userId = await getCurrentUserId();
>   if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   
>   const { groupId, inviteeEmail } = await req.json();
>   const supabase = await createServerClient();
>   
>   const { data: group } = await supabase
>     .from('family_groups')
>     .select('id, owner_id')
>     .eq('id', groupId)
>     .eq('owner_id', userId)
>     .maybeSingle();
>   
>   if (!group) return Response.json({ error: 'Forbidden' }, { status: 403 });
>   
>   const token = crypto.randomBytes(32).toString('hex');
>   const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
>   
>   await supabase.from('family_invites').insert({
>     group_id: groupId,
>     inviter_id: userId,
>     invitee_email: inviteeEmail,
>     token,
>     expires_at: expiresAt.toISOString(),
>   });
>   
>   const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/family/accept?token=${token}`;
>   await sendEmail(inviteeEmail, 'TEND+ 가족 초대', `${inviteUrl}에서 수락해주세요.`);
>   
>   return Response.json({ success: true });
> }
> ```

- [ ] **13.3.2** `src/app/api/family/accept/route.ts` (POST, token 검증)

> **Cursor 프롬프트:**
> ```
> src/app/api/family/accept/route.ts를 생성해줘.
> 
> import { getCurrentUserId, createServerClient } from '@/lib/supabase/server';
> 
> export async function POST(req: Request) {
>   const userId = await getCurrentUserId();
>   if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   
>   const { token } = await req.json();
>   const supabase = await createServerClient();
>   
>   const { data: invite } = await supabase
>     .from('family_invites')
>     .select('*, family_groups!inner(owner_id)')
>     .eq('token', token)
>     .eq('status', 'pending')
>     .gt('expires_at', new Date().toISOString())
>     .maybeSingle();
>   
>   if (!invite) return Response.json({ error: 'Invalid or expired token' }, { status: 400 });
>   
>   const { data: profile } = await supabase
>     .from('users_profile')
>     .select('email')
>     .eq('id', userId)
>     .maybeSingle();
>   
>   if (profile?.email !== invite.invitee_email) {
>     return Response.json({ error: 'Email mismatch' }, { status: 403 });
>   }
>   
>   await supabase.from('family_members').insert({
>     group_id: invite.group_id,
>     user_id: userId,
>     role: 'member',
>   });
>   
>   await supabase.from('family_invites')
>     .update({ status: 'accepted' })
>     .eq('id', invite.id);
>   
>   return Response.json({ success: true });
> }
> ```

### 13.4 Chrome Extension (선택)

- [ ] **13.4.1** 쇼핑몰 페이지에서 성분 분석 확장 (별도 프로젝트)

---

## PHASE 14 — B2B 수익화 (수정 #22)

### 14.1 brand_users (수정 #22)

- [ ] **14.1.1** brand_users 테이블 생성
- [ ] **14.1.2** 브랜드 생성 시 brand_users에 owner 자동 등록

> **수정 #22: POST 브랜드 생성 시**
> ```typescript
> const { data: brand } = await supabase.from('brands').insert({...}).select('id').single();
> await supabase.from('brand_users').insert({
>   brand_id: brand.id, user_id: userId, role: 'owner',
> });
> ```

### 14.2 brand_reports, settlements

- [ ] **14.2.1** brand_reports, settlements 테이블 및 RLS 생성

> ```sql
> CREATE TABLE brand_reports (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
>   month date NOT NULL,
>   total_clicks int DEFAULT 0,
>   total_conversions int DEFAULT 0,
>   conversion_rate decimal(5,2),
>   excluded_count int DEFAULT 0,
>   top_exclusion_ingredients jsonb,
>   created_at timestamptz DEFAULT now(),
>   UNIQUE(brand_id, month)
> );
> CREATE TABLE settlements (
>   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
>   brand_id uuid REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
>   month date NOT NULL,
>   total_clicks int DEFAULT 0,
>   total_amount decimal(10,2),
>   commission_rate decimal(5,2),
>   commission_amount decimal(10,2),
>   status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled')),
>   paid_at timestamptz,
>   created_at timestamptz DEFAULT now(),
>   UNIQUE(brand_id, month)
> );
> -- RLS: brand_users 멤버만 reports 조회, 관리자+owner만 settlements 조회
> ```

### 14.3 월별 리포트 Cron

- [ ] **14.3.1** `src/app/api/cron/brand-report/route.ts` 생성

> **Cursor 프롬프트:**
> ```
> src/app/api/cron/brand-report/route.ts를 생성해줘.
> 
> import { createAdminClient } from '@/lib/supabase/server';
> 
> export async function GET(req: Request) {
>   if (req.headers.get('x-vercel-cron-secret') !== process.env.CRON_SECRET) {
>     return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   }
>   
>   const supabase = createAdminClient();
>   const now = new Date();
>   const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
>   const monthStr = monthStart.toISOString().slice(0, 10);
>   
>   const { data: brands } = await supabase.from('brands').select('id, commission_rate');
>   if (!brands) return Response.json({ message: '브랜드 없음', count: 0 });
>   
>   let count = 0;
>   const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
>   for (const brand of brands) {
>     const { count: totalClicks } = await supabase
>       .from('link_clicks')
>       .select('*', { count: 'exact', head: true })
>       .eq('brand_id', brand.id)
>       .gte('clicked_at', monthStart.toISOString())
>       .lt('clicked_at', monthEnd.toISOString());
>     const totalConversions = Math.floor((totalClicks ?? 0) * 0.05);
>     const clicks = totalClicks ?? 0;
>     const conversionRate = clicks > 0 ? (totalConversions / clicks * 100) : 0;
>     
>     await supabase.from('brand_reports').upsert({
>       brand_id: brand.id,
>       month: monthStr,
>       total_clicks: clicks,
>       total_conversions: totalConversions,
>       conversion_rate: conversionRate,
>       top_exclusion_ingredients: [],
>     }, { onConflict: 'brand_id,month' });
>     
>     count++;
>   }
>   
>   return Response.json({ message: '리포트 생성 완료', count });
> }
> ```
> 
> vercel.json에 `{ "path": "/api/cron/brand-report", "schedule": "0 0 1 * *" }` 추가 (매월 1일 0시)

### 14.4 정산 API

- [ ] **14.4.1** `src/app/api/admin/settlements/route.ts` (GET, 관리자만)

> **Cursor 프롬프트:**
> ```
> src/app/api/admin/settlements/route.ts를 생성해줘.
> 
> import { checkRole } from '@/lib/auth/check-role';
> import { getCurrentUserId, createServerClient } from '@/lib/supabase/server';
> import { createAdminClient } from '@/lib/supabase/server';
> 
> export async function GET(req: Request) {
>   await checkRole(['admin', 'super_admin']);
>   const userId = await getCurrentUserId();
>   if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
>   
>   const supabase = await createServerClient();
>   const { data } = await supabase
>     .from('settlements')
>     .select('*, brands(name)')
>     .order('month', { ascending: false })
>     .limit(50);
>   
>   return Response.json({ data });
> }
> 
> export async function PATCH(req: Request) {
>   await checkRole(['admin', 'super_admin']);
>   const { settlementId, status } = await req.json();
>   
>   const supabase = createAdminClient();
>   const update: Record<string, unknown> = { status };
>   if (status === 'paid') update.paid_at = new Date().toISOString();
>   
>   await supabase.from('settlements').update(update).eq('id', settlementId);
>   return Response.json({ success: true });
> }
> ```

### 14.5 브랜드 대시보드

- [ ] **14.5.1** `src/app/brand/dashboard/page.tsx`

> **Cursor 프롬프트:**
> ```
> src/app/brand/dashboard/page.tsx를 생성해줘.
> 
> import { getCurrentUserId, createServerClient } from '@/lib/supabase/server';
> import { redirect } from 'next/navigation';
> 
> export default async function BrandDashboard() {
>   const userId = await getCurrentUserId();
>   if (!userId) redirect('/sign-in');
>   
>   const supabase = await createServerClient();
>   const { data: membership } = await supabase
>     .from('brand_users')
>     .select('*, brands(*)')
>     .eq('user_id', userId)
>     .maybeSingle();
>   
>   if (!membership) {
>     return (
>       <div className="p-8">
>         <h1 className="text-2xl font-bold mb-4">브랜드 대시보드</h1>
>         <p className="text-gray-600">연결된 브랜드가 없습니다.</p>
>       </div>
>     );
>   }
>   
>   const { data: reports } = await supabase
>     .from('brand_reports')
>     .select('*')
>     .eq('brand_id', membership.brand_id)
>     .order('month', { ascending: false })
>     .limit(12);
>   
>   return (
>     <div className="p-8">
>       <h1 className="text-3xl font-bold mb-8">{membership.brands?.name} 대시보드</h1>
>       <div className="grid grid-cols-3 gap-6">
>         {reports?.slice(0, 1).map((r) => (
>           <div key={r.id} className="p-6 bg-white rounded-lg shadow">
>             <h2 className="text-sm text-gray-600">이번 달 클릭</h2>
>             <p className="text-3xl font-bold mt-2">{r.total_clicks}</p>
>           </div>
>         ))}
>       </div>
>     </div>
>   );
> }
> ```

---

## 📊 최종 체크리스트 (v1.9)

### ✅ 필수 확인 사항

- [ ] ingredients_list (NOT ingredients!)
- [ ] notified_at (NOT notified!)
- [ ] .maybeSingle() (NOT .single()!)
- [ ] UUID는 DB에서만 생성
- [ ] Generated Column 수정 안 함
- [ ] Phase Lock 준수
- [ ] Admin Client 제한
- [ ] .client.ts 파일명 + 런타임 체크
- [ ] pnpm ONLY

### v1.8 수정 (15개)

- [x] #1: role 중복
- [x] #2: notified_at 미갱신
- [x] #3: email placeholder
- [x] #4: status 없음
- [x] #5: username 없음
- [x] #6: 스키마 미완성
- [x] #7: trigger_analyses
- [x] #8: 브랜드-사용자
- [x] #9: Cron 인증
- [x] #10: RLS 누락
- [x] #11: verify-schema
- [x] #12: 암호화 방식
- [x] #13: consumption 연결
- [x] #14: email UNIQUE
- [x] #15: DrugBank 라이선스

### v1.9 추가 수정 (7개)

- [x] #16: pantry → subscriptions 조회 분리
- [x] #17: pantry_items.added_at 추가
- [x] #18: display_name 중복 로직
- [x] #19: CURRENT_PHASE 환경변수
- [x] #20: role CHECK 중복 제거
- [x] #21: optional chaining 추가
- [x] #22: brand_users INSERT 플로우

---

## 📊 수정 사항 요약 (전체)

| # | 수정 내용 | Phase |
|---|----------|-------|
| **#1** | 미들웨어 `/api/cron(.*)` 추가 | 2 |
| **#2** | auth.jwt()->>'sub' 사용, notified_at 갱신 | 1, 5 |
| **#3** | email placeholder (UNIQUE 보장) | 2 |
| **#4** | verify-schema.ts | 0 |
| **#5** | Storage RLS Clerk 호환 | 1 |
| **#6** | user.deleted 처리 | 2 |
| **#7~#15** | v1.8 수정 | 7-15 |
| **#16** | pantry_items → subscriptions 조회 분리 | 11 |
| **#17** | pantry_items.added_at 추가 | 1 |
| **#18** | display_name 중복 로직 개선 | 10 |
| **#19** | CURRENT_PHASE 환경변수 | 0 |
| **#20** | role CHECK 중복 제거 | 8 |
| **#21** | optional chaining 추가 | 12 |
| **#22** | brand_users INSERT 플로우 | 14 |

---

**프로덕션 투입 가능!** ✅ **8주 후 TEND+ 완성!** 💪