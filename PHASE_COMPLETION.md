# TEND+ Phase 완료 체크리스트

> **각 Phase 완료 후 반드시 확인**  
> Windows 호환: `pnpm verify N` 사용 (grep 대신 Node.js 검증)

---

## Phase 0 완료 체크

- [ ] pnpm dev 실행 성공
- [ ] localhost:3000 접속 확인
- [ ] .env.local 생성 확인
- [ ] .cursorrules 생성 확인
- [ ] vercel.json 생성 확인
- [ ] scripts/verify-schema.ts 생성 확인
- [ ] scripts/verify-phase.ts 생성 확인
- [ ] scripts/check-node-version.ts 생성 확인 (보안)
- [ ] package.json에 `"verify"`, `"check-node-version"`, `prebuild` 스크립트 확인
- [ ] Node.js v20.20.0+ 또는 v22.22.0+ 사용 확인

**검증 명령 (Windows):**
```powershell
pnpm dev
# Ctrl+C로 종료 후
pnpm check-node-version
dir .env.local .cursorrules vercel.json scripts\verify-schema.ts scripts\verify-phase.ts scripts\check-node-version.ts
```

---

## Phase 1 완료 체크

- [ ] **자동 검증:** `pnpm verify 1` (schema 금지 테이블 확인)
- [ ] Supabase에서 8개 테이블 생성 확인
- [ ] Generated Column 확인 (information_schema)
- [ ] 헬퍼 함수 3개 확인
- [ ] RLS 정책 확인
- [ ] Storage 버킷 2개 확인
- [ ] .env.local의 CURRENT_PHASE를 1로 업데이트 (스키마 실행 + 검증 통과 후)

**검증 명령 (Supabase SQL Editor):**
```sql
-- 테이블 8개
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Generated Column
SELECT column_name, is_generated 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'ingredients' AND column_name = 'name_ko_normalized';

-- 함수 3개
SELECT proname FROM pg_proc 
WHERE proname IN ('get_current_user_id', 'get_table_columns', 'get_expiring_items_kst');
```

---

## Phase 2 완료 체크

- [ ] 회원가입 테스트 성공
- [ ] Supabase에서 users_profile 생성 확인
- [ ] health_profiles 생성 확인
- [ ] Webhook 로그 확인 (Clerk Dashboard)
- [ ] **필수:** src/middleware.ts에 `/api/cron(.*)` 확인
- [ ] **자동 검증 실행:** `pnpm verify 2`
- [ ] .env.local의 CURRENT_PHASE를 2로 업데이트 (검증 통과 후)

**검증 명령 (Windows):**
```powershell
# 자동 검증
pnpm verify 2

# 수동 확인 (middleware에 api/cron 있는지)
Select-String -Path src\middleware.ts -Pattern "api/cron"
# 결과 있어야 함! 없으면 즉시 추가
```

**실패 시:**
- `/api/cron` 없음 → src/middleware.ts 수정
- `.single()` 발견 → `.maybeSingle()`로 변경

---

## Phase 3 완료 체크

- [ ] .env.local의 CURRENT_PHASE를 3으로 업데이트 (검증 통과 후)
- [ ] Rate Limiter 동작 확인
- [ ] 이미지 리사이징 테스트
- [ ] OCR API 테스트
- [ ] 카메라 UI 테스트
- [ ] **빌드 테스트:** `pnpm build`
- [ ] **자동 검증 실행:** `pnpm verify 3`

**검증 명령 (Windows):**
```powershell
# 자동 검증
pnpm verify 3

# 빌드 테스트
pnpm build
```

**실패 시:**
- SSR 에러 → image-resize.client.ts 최상단에 'use client' 추가
- 빌드 실패 → 에러 메시지 확인 후 수정

---

## Phase 4 완료 체크

- [ ] 식약처 API 호출 테스트
- [ ] 캐시 동작 확인
- [ ] **자동 검증 실행:** `pnpm verify 4`

**검증 명령 (Windows):**
```powershell
pnpm verify 4
```

---

## Phase 5 완료 체크

- [ ] .env.local에 CRON_SECRET 확인 (64자 hex)
- [ ] Cron 수동 호출 테스트
- [ ] 알림 생성 확인
- [ ] **자동 검증 실행:** `pnpm verify 5`

**검증 명령 (Windows):**
```powershell
pnpm verify 5
```

**Cron 수동 테스트 (PowerShell):**
```powershell
$secret = (Get-Content .env.local | Select-String "CRON_SECRET=").ToString().Split("=")[1].Trim()
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/pantry-check" -Headers @{"x-vercel-cron-secret"=$secret}
```

---

## Phase 6 완료 체크

- [ ] pnpm build 성공
- [ ] Vercel 배포 성공
- [ ] 프로덕션 환경 테스트
- [ ] Clerk Webhook URL 업데이트
- [ ] **자동 검증 실행:** `pnpm verify 6`
- [ ] **최종 검증:** Phase 2~5 재실행

**검증 명령 (Windows):**
```powershell
pnpm build
pnpm verify 2
pnpm verify 3
pnpm verify 4
pnpm verify 5
pnpm verify 6
```

---

## 🚨 에러 발생 시 대응

### 1. 자동 검증 실패
```powershell
pnpm verify [phase]
# → 에러 메시지 확인 후 수정
# → 재실행
```

### 2. 빌드 실패
```powershell
pnpm build
# → 에러 메시지 전체 복사
# → Cursor에 제공: "이 빌드 에러를 고쳐줘"
```

### 3. Supabase 에러
- SQL Editor 에러 메시지 확인
- 테이블 생성 순서 확인 (users_profile → ingredients → ...)
- Generated Column 수정 시도 시 → DROP TABLE 후 재생성

---

**모든 체크리스트 통과 = Phase 완료!** ✅
