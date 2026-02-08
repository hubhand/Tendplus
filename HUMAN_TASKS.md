# 👤 TEND+ 플랜모드 수동 작업 가이드 (v1.9)

> **플랜모드에서 [HUMAN] 알림이 뜨면 이 문서를 열어서 진행하세요.**

---

## 📌 사용 방법

1. 플랜모드가 멈추고 **[HUMAN] 수동 작업** 알림이 뜸
2. 아래에서 해당 Phase의 작업 찾기
3. 단계별로 진행
4. 완료 후 플랜모드에 **"수동 작업 완료했어. 다음 단계 진행해줘"** 입력

**Phase 완료 검증 (Windows):** `pnpm verify N` — PHASE_COMPLETION.md 참조

**CURRENT_PHASE 업데이트 시점:**
- ✅ Phase N 코드 작성 + Supabase 실행(해당 시) + 수동 작업(해당 시) + `pnpm verify N` 통과 **후**
- ❌ Phase N 시작 전, 코드 작성 중, 검증 실패 시에는 업데이트 금지

---

## 🔴 Phase 0 시작 전 (플랜모드 시작 전 필수!)

### 1. 외부 서비스 가입

| 서비스 | URL | 완료 확인 |
|--------|-----|----------|
| Supabase | supabase.com | [ ] 프로젝트 생성 |
| Clerk | clerk.com | [ ] 프로젝트 생성 |
| Gemini API | ai.google.dev | [ ] API 키 발급 |
| Upstash Redis | upstash.com | [ ] Redis 생성 |

### 2. 로컬 환경 준비

**⚠️ Node.js 보안 업데이트 (2026년 1월)**

```bash
# Node.js 버전 확인
node --version
```

**최소 버전 요구사항:**
- ✅ **v22.22.0 이상** (LTS, 권장)
- ✅ **v20.20.0 이상** (Maintenance LTS)
- ❌ v18.x, v19.x, v21.x, v24.13.0 미만 (EOL 또는 보안 취약)

**설치 방법 (Windows):**

**방법 1: Node.js 공식 설치 (권장)**
1. https://nodejs.org/ 접속
2. **"22.22.0 LTS"** 또는 최신 LTS 다운로드
3. 설치 후 PowerShell/CMD 재시작
4. `node --version` 확인

**방법 2: nvm-windows (여러 버전 관리)**
1. https://github.com/coreybutler/nvm-windows/releases 에서 최신 nvm-setup.exe 다운로드
2. 설치 후 PowerShell 재시작
3. 아래 명령어 실행:
```powershell
nvm install 22.22.0
nvm use 22.22.0
node --version  # v22.22.0 확인
```

**왜 중요한가요?**
- 🔴 **CVE-2025-55130:** 파일 시스템 권한 우회 (Storage 버킷 접근 위험)
- 🔴 **CVE-2025-27210:** 경로 탐색 우회 (.env.local 노출 위험)
- 🔴 **CVE-2024-36138:** Windows 임의 코드 실행 (pnpm 스크립트 공격)

**참고:** Node.js 22.x LTS는 2027년 4월까지 지원됩니다.

```bash
# pnpm 설치
npm install -g pnpm
pnpm --version

# 🔴 Git 저장소 초기화 (Vercel 배포 필수)
git init
git add .
git commit -m "chore: 초기 커밋 (Phase 0 준비)"
```

**⚠️ Git 초기화 안 하면:** Phase 6 Vercel 배포 시 실패 (Git 저장소 없으면 Vercel 연동 불가)

### 3. Windows 사용자 추가 설정

**⚠️ 프로젝트 경로:** 한글 경로 사용 금지 (일부 도구 에러)
- ✅ 권장: `C:\projects\tendplus`
- ❌ 금지: `C:\사용자\문서\tendplus`

**⚠️ Node.js 보안 (Windows):** v18.20.4, v20.15.1, v22.4.1 미만은 CVE-2024-36138(임의 명령 실행) 취약. **반드시 해당 버전 이상 사용**

**pnpm 설치 에러 시 (PowerShell):**

**증상 1: 실행 정책 에러**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install -g pnpm
pnpm --version
```

**증상 2: npm install -g 권한 에러 (관리자 없이)**
```powershell
# 1. npm prefix 변경
npm config set prefix "$env:APPDATA\npm"

# 2. pnpm 설치
npm install -g pnpm

# 3. PATH 추가 (현재 세션)
$env:Path += ";$env:APPDATA\npm"

# 4. pnpm 확인
pnpm --version
```

**PATH 영구 추가 (Windows):**
```powershell
# PowerShell (사용자 환경변수)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:APPDATA\npm", [EnvironmentVariableTarget]::User)

# 또는 GUI: 제어판 → 시스템 → 고급 시스템 설정 → 환경 변수
# 사용자 변수 Path에 %APPDATA%\npm 추가
```

**검증:** 새 PowerShell 창 열고 `pnpm --version` — 출력 없으면 PATH 추가 실패, 위 단계 재실행

**증상 3: pnpm 명령어 인식 안 됨**
```powershell
$env:Path += ";$env:APPDATA\npm"
# 위 "PATH 영구 추가" 참조
```

**포트 3000 충돌 시:**

**증상:** `Error: listen EADDRINUSE: address already in use :::3000`

**해결 1: 해당 프로세스만 종료**
```powershell
netstat -ano | findstr :3000
taskkill /PID [PID번호] /F
```

**해결 2: 다른 포트 사용**
```powershell
pnpm dev -- -p 3001
```

**해결 3: 모든 Node 프로세스 종료 (주의)**
```powershell
taskkill /IM node.exe /F
```

---

## Phase 0: 프로젝트 초기화

### [HUMAN] 0.1.1 — Next.js 프로젝트 생성

**언제:** Phase 0 플랜모드 시작 시, Cursor가 "수동 작업 필요" 알림

**터미널에서 실행:**
```bash
pnpm create next-app@latest tendplus --typescript --tailwind --app --src-dir
cd tendplus
```

**완료 후:**
- Cursor에서 **File → Open Folder** → `tendplus` 폴더 선택
- 또는 `code tendplus` (VS Code/Cursor CLI)

⚠️ **반드시 `tendplus` 폴더를 열어야 함!** (상위 폴더 `[Your Project Folder]`가 아님)

---

### [HUMAN] 0.1.2 — 패키지 설치

**언제:** Cursor가 package.json에 dependencies 추가한 후

**터미널에서 실행:**
```bash
cd tendplus   # 아직 tendplus 폴더가 아니면
pnpm install
```

**완료 후:** 플랜모드에 "pnpm install 완료" 알림

---

### [HUMAN] 0.2.1 — 환경변수 입력

**언제:** Cursor가 .env.local 파일 생성한 후

**작업:** .env.local 파일을 열고 아래 키에 **실제 값** 입력

| 변수명 | 발급처 | 비고 |
|--------|--------|------|
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Clerk Dashboard | 공개 키 |
| CLERK_SECRET_KEY | Clerk Dashboard | 비밀 |
| CLERK_WEBHOOK_SECRET | Clerk Webhook 설정 후 | 나중에 입력 가능 |
| NEXT_PUBLIC_SUPABASE_URL | Supabase Settings | Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Settings | anon public |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Settings | service_role (비밀!) |
| UPSTASH_REDIS_REST_URL | Upstash Console | Redis URL |
| UPSTASH_REDIS_REST_TOKEN | Upstash Console | Redis Token |
| GEMINI_API_KEY | ai.google.dev | NEXT_PUBLIC_ 붙이지 말 것! |

**Phase 0에서는** Supabase, Clerk, Upstash, Gemini 키만 있으면 됨. 나머지는 Phase 진행 시 추가.

| Phase | 추가할 환경변수 |
|-------|----------------|
| Phase 4 | MFDS_API_KEY (식약처 API, 선택) |
| Phase 5 | CRON_SECRET |
| Phase 9 | ENCRYPTION_KEY |
| Phase 13 | RESEND_API_KEY (가족 초대 이메일) |

---

## Phase 1: 데이터베이스

### [HUMAN] 1.1.1 — Supabase SQL 실행

**언제:** Cursor가 schema-tendplus-v1.9.sql 파일 생성한 후

**단계:**
1. Supabase Dashboard 접속 → **SQL Editor**
2. Cursor가 생성한 `schema-tendplus-v1.9.sql` 파일 열기
3. **전체 내용 복사** (Ctrl+A, Ctrl+C)
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭
6. 에러 없이 완료 확인

**검증 (Supabase SQL Editor에서 실행):**
```sql
-- 8개 테이블 확인 (결과 8개여야 함)
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Generated Column 확인 (is_generated = 'ALWAYS' 여야 함)
SELECT column_name, is_generated, generation_expression 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'ingredients' AND column_name = 'name_ko_normalized';
```

---

### [HUMAN] 1.2.1 — RLS 정책 실행

**언제:** 1.1.1 완료 후, Cursor가 RLS SQL 생성한 후

**단계:**
1. Cursor가 생성한 `schema-rls-phase1.sql` 파일 확인 (todo.md 기준 별도 파일)
2. Supabase SQL Editor에서 해당 SQL **전체 복사 → 붙여넣기 → Run**
3. 에러 없이 완료 확인

---

### [HUMAN] 1.3.1 — Storage 버킷 생성

**언제:** 1.2.1 RLS 완료 후, Storage RLS 실행 전

**단계:**
1. Supabase Dashboard → **Storage** → **New bucket**
2. 버킷 1: 이름 `product-images`
   - **"Public bucket" 체크박스 반드시 체크** → Create
3. **New bucket** 클릭
4. 버킷 2: 이름 `ocr-scans`
   - **"Public bucket" 체크박스 반드시 해제** (비공개) → Create

---

### [HUMAN] 1.3.2 — Storage RLS 실행

**언제:** 1.3.1 Storage 버킷 2개 생성 완료 후

**단계:**
1. Cursor가 생성한 `schema-storage-rls-phase1.sql` 파일 확인 (todo.md 기준 별도 파일)
2. Supabase SQL Editor에서 해당 SQL **전체 복사 → 붙여넣기 → Run**
3. 에러 없이 완료 확인

---

## Phase 2: 인증

### [HUMAN] 2.1.1 — Clerk JWT Template 생성 (⚠️ Phase 2 시작 전 필수!)

**언제:** Phase 2 플랜모드 시작 **전에** 반드시 완료

**단계:**
1. Clerk Dashboard → **JWT Templates**
2. **Create Template** 클릭
3. **Name:** `supabase`

⚠️ **CRITICAL:** 정확히 소문자 `supabase`만 가능!
- ✅ 정답: `supabase`
- ❌ 오답: `Supabase`, `SUPABASE`, `supabase_jwt`
- `getToken({ template: 'supabase' })`와 정확히 일치해야 함 (대소문자 다르면 401)
4. **Claims** (JSON):
```json
{
  "sub": "{{user.id}}",
  "aud": "authenticated",
  "role": "authenticated"
}
```
5. **Save** 클릭

**Supabase 연동:**
1. Supabase Dashboard → **Settings** → **API** → **JWT Settings**
2. **Custom JWT** 섹션
3. **JWKS URL:** `https://[clerk-도메인]/.well-known/jwks.json`
   - Clerk Dashboard → **Configure** → **Domains**에서 도메인 확인
   - Development: `https://xxx.clerk.accounts.dev`
   - Production: `https://xxx-your-app.clerk.accounts.dev`
   - 예: `https://xxx.clerk.accounts.dev/.well-known/jwks.json`

**검증 (선택):** Clerk API로 템플릿 확인
```bash
curl https://api.clerk.com/v1/jwt_templates -H "Authorization: Bearer $CLERK_SECRET_KEY"
# 응답에 "supabase" 이름의 템플릿 있는지 확인
```

---


**언제:** Phase 2 코드 작성 후, 배포 전

**단계:**
1. Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. **Endpoint URL:** `https://[your-domain]/api/webhooks/clerk` (로컬 테스트 시 ngrok 등 사용)
3. **Events:** `user.created`, `user.updated`, `user.deleted` **3개 모두 선택해야 함!** (코드에서 모두 처리)
4. **Create** 후 **Signing Secret** 복사
5. .env.local에 `CLERK_WEBHOOK_SECRET=` 값 입력

---

## Phase 13: 가족 초대

### [HUMAN] 13.1 — RESEND_API_KEY 추가

**언제:** Phase 13 플랜모드 시작 전

**작업:**
1. Resend (resend.com) 가입 후 API Key 발급
2. .env.local에 추가:
```
RESEND_API_KEY=re_your_resend_api_key
```

---

## Phase 5: Cron Job

### [HUMAN] 5.1 — CRON_SECRET 생성

**언제:** Phase 5 플랜모드 시작 전

**터미널에서 실행 (Windows):**

**방법 1: PowerShell (권장 — 복사해서 붙여넣기):**
```powershell
node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```
**↑ 이 명령어를 복사해서 PowerShell에 붙여넣기**

**방법 2: CMD (명령 프롬프트):**
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**방법 3: OpenSSL (설치된 경우):**
```bash
openssl rand -hex 32
```

**결과 예시:** `a1b2c3d4e5f6...0123456789abcdef` (64자 hex)

**작업:**
1. 위 명령어 중 하나 실행
2. 출력된 64자 문자열 복사
3. .env.local 파일 열기
4. `CRON_SECRET=` 뒤에 붙여넣기
5. 저장

**검증:**
```powershell
Get-Content .env.local | Select-String "CRON_SECRET="
# 출력: CRON_SECRET=a1b2c3d4e5f6...
```

---

## Phase 9: 보안 강화

### [HUMAN] 9.1 — ENCRYPTION_KEY 생성

**언제:** Phase 9 플랜모드 시작 전

**터미널에서 실행:** (CRON_SECRET과 동일 — 5.1 참조)

**Windows PowerShell (복사해서 붙여넣기):**
```powershell
node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```

**검증:** `Get-Content .env.local | Select-String "ENCRYPTION_KEY="`

**작업:** .env.local에 추가
```
ENCRYPTION_KEY=출력된64자hex값
```

---

## Phase 6: 배포

### [HUMAN] 6.1 — Vercel 배포

**언제:** Phase 0-5 검증 완료 후

**단계:**
1. **Git push** (GitHub/GitLab 등에 코드 푸시)
2. **Vercel** (vercel.com) → **Add New Project** → 저장소 연결
3. **Environment Variables**에 .env.local 내용 복사
   - CRON_SECRET, Clerk, Supabase, Gemini, Upstash 등 모두
4. **Deploy** 클릭
5. 배포 완료 후 **Clerk Webhook URL** 업데이트
   - `https://[vercel-domain]/api/webhooks/clerk`
6. **Vercel Dashboard** → Settings → Environment Variables
   - `CRON_SECRET` 확인 (Vercel Cron이 사용)

---

## 📋 수동 작업 체크리스트 (Phase별)

### Phase 0
- [ ] pnpm create next-app 실행
- [ ] pnpm install 실행
- [ ] .env.local에 API 키 입력 (Supabase, Clerk, Upstash, Gemini)

### Phase 1
- [ ] schema-tendplus-v1.9.sql Supabase에서 실행
- [ ] RLS 정책 Supabase에서 실행
- [ ] Storage 버킷 2개 생성 (product-images, ocr-scans)
- [ ] Storage RLS Supabase에서 실행
- [ ] .env.local의 CURRENT_PHASE를 1로 업데이트 (1.1.1 스키마 Supabase 실행 완료 후!)

### Phase 2
- [ ] Clerk JWT Template "supabase" 생성
- [ ] Supabase JWT JWKS URL 설정
- [ ] Clerk Webhook 설정 (Phase 2 코드 작성 후, 배포 후 URL 업데이트)
- [ ] .env.local의 CURRENT_PHASE를 2로 업데이트

### Phase 5
- [ ] CRON_SECRET 생성 후 .env.local 추가

### Phase 9
- [ ] ENCRYPTION_KEY 생성 후 .env.local 추가

### Phase 13
- [ ] RESEND_API_KEY 발급 후 .env.local 추가

### Phase 6
- [ ] Git push
- [ ] Vercel 연동
- [ ] 환경변수 설정
- [ ] Clerk Webhook URL 업데이트

---

## 🆘 문제 해결

### "pnpm create" 실행 안 됨
- 터미널을 **새로 열고** 프로젝트 상위 폴더에서 실행
- `pnpm --version`으로 pnpm 설치 확인

### Supabase SQL 에러
- **순서 확인:** 테이블 → RLS → Storage RLS
- `users_profile`이 가장 먼저 생성되어야 함 (FK 의존성)
- 에러 메시지의 테이블/컬럼명 확인

### Clerk JWT "supabase" 인식 안 됨
- Template 이름이 정확히 `supabase`인지 확인 (소문자)
- Supabase JWKS URL이 Clerk 도메인과 일치하는지 확인
- Clerk Dashboard → Configure → Domains에서 프론트엔드 도메인 확인
- JWKS URL 형식: `https://[프론트엔드-도메인]/.well-known/jwks.json`
  - 예: `https://clerk.xxx.accounts.dev/.well-known/jwks.json`

### Cron 401 에러
- .env.local에 CRON_SECRET 있는지 확인
- Vercel Environment Variables에 CRON_SECRET 추가했는지 확인
- middleware.ts에 `/api/cron(.*)` 경로가 public인지 확인

### Cursor가 "이 작업은 할 수 없습니다"라고 할 때
- **CURSOR_LIMITS.md** 확인
- 해당 작업이 [HUMAN] 목록에 있으면 사용자가 직접 진행
- 완료 후 "수동 작업 완료했어"라고 Cursor에 알림

---

## 📌 Cursor(AI) 한계 요약

| Cursor 가능 | Cursor 불가 |
|-------------|-------------|
| SQL 파일 생성 | Supabase에서 SQL 실행 |
| 코드 파일 생성 | 터미널 pnpm create/install |
| .env.local 템플릿 생성 | 실제 API 키 입력 |
| pnpm verify N 검증 | 브라우저/실제 환경 테스트 |
| 설정 파일 수정 | Clerk/Supabase/Vercel Dashboard |

**상세:** [CURSOR_LIMITS.md](./CURSOR_LIMITS.md)

---

**수동 작업 완료 후 플랜모드에 알려주세요!** 👋
