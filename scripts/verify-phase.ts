/**
 * TEND+ Phase 검증 스크립트 (Windows 호환)
 * grep 대신 Node.js fs 사용 — Windows/Linux/macOS 모두 동작
 *
 * 사용법: pnpm verify 2  (Phase 2 검증)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PHASE = process.argv[2];

if (!PHASE) {
  console.error('❌ Usage: pnpm verify <phase>');
  console.error('   예: pnpm verify 2');
  process.exit(1);
}

const phase = parseInt(PHASE, 10);
if (isNaN(phase) || phase < 0 || phase > 6) {
  console.error('❌ Phase는 0~6 사이 숫자여야 합니다.');
  process.exit(1);
}

const rootDir = path.resolve(process.cwd());

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(path.join(rootDir, filePath));
  } catch {
    return false;
  }
}

function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
  } catch {
    return null;
  }
}

function grepInDir(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  function walk(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      if (e.isDirectory() && e.name !== 'node_modules' && !e.name.startsWith('.')) {
        walk(full);
      } else if (e.isFile() && /\.(ts|tsx|js|jsx)$/.test(e.name)) {
        const content = fs.readFileSync(full, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (pattern.test(line)) results.push(`${path.relative(rootDir, full)}:${i + 1}: ${line.trim()}`);
        });
      }
    }
  }
  walk(path.join(rootDir, dir));
  return results;
}

console.log(`\n🔍 Phase ${phase} 검증 시작...\n`);
let errors = 0;

// Phase 0 검증
if (phase === 0) {
  console.log('📋 Phase 0 검증 항목:');
  const files = ['.env.local', '.cursorrules', 'vercel.json', 'scripts/verify-schema.ts', 'scripts/verify-phase.ts', 'scripts/check-node-version.ts', 'package.json'];
  for (const f of files) {
    if (fileExists(f)) {
      console.log(`✅ ${f} 존재`);
    } else {
      console.error(`❌ ${f} 없음!`);
      errors++;
    }
  }
  // package.json에 verify 스크립트 확인
  const pkg = readFile('package.json');
  if (pkg && /"verify"\s*:/.test(pkg) && pkg.includes('verify-phase.ts')) {
    console.log('✅ package.json verify 스크립트 존재');
  } else if (pkg) {
    console.error('❌ package.json에 "verify": "tsx scripts/verify-phase.ts" 스크립트 없음!');
    errors++;
  }
  if (pkg && pkg.includes('check-node-version') && pkg.includes('prebuild')) {
    console.log('✅ package.json prebuild에 check-node-version 포함');
  } else if (pkg) {
    console.error('❌ package.json prebuild에 check-node-version 추가 필요!');
    errors++;
  }
  // engines.node 검증 (>=20.20.0 또는 >=22.22.0 필수)
  if (pkg) {
    const enginesMatch = pkg.match(/"engines"\s*:\s*\{[\s\S]*?"node"\s*:\s*"([^"]+)"/);
    const nodeEngines = enginesMatch?.[1];
    const isValidEngines = nodeEngines && (/>=20\.20\.0|>=22\.22\.0/.test(nodeEngines));
    if (isValidEngines) {
      console.log('✅ package.json engines.node >=20.20.0');
    } else if (pkg.includes('"engines"')) {
      console.error('❌ package.json engines.node가 ">=20.20.0"이어야 함! (현재:', nodeEngines || '없음', ')');
      errors++;
    } else {
      console.error('❌ package.json에 engines.node 필드 없음!');
      errors++;
    }
  }
}

// Phase 1 검증
if (phase === 1) {
  console.log('📋 Phase 1 검증 항목:');
  const schemaFile = readFile('schema-tendplus-v1.9.sql');
  if (schemaFile) {
    const forbidden = [
      'CREATE TABLE brands',
      'CREATE TABLE subscriptions',
      'CREATE TABLE link_clicks',
      'CREATE TABLE audit_logs',
      'CREATE TABLE consumption_patterns',
      'CREATE TABLE trigger_analyses',
      'CREATE TABLE family_groups',
    ];
    const violations = forbidden.filter((t) => schemaFile.includes(t));
    if (violations.length > 0) {
      console.error('❌ Phase 1 금지 테이블 발견:', violations.join(', '));
      errors++;
    } else {
      console.log('✅ 금지 테이블 없음');
    }
  } else {
    console.log('⚠️  schema-tendplus-v1.9.sql 없음 (정상)');
  }
}

// Phase 2 검증
if (phase === 2) {
  console.log('📋 Phase 2 검증 항목:');

  // 1. /api/cron 체크
  console.log('\n1. Middleware /api/cron 경로 확인...');
  const middleware = readFile('src/middleware.ts');
  if (middleware && /api\/cron/.test(middleware)) {
    console.log('✅ /api/cron 경로 존재');
  } else {
    console.error('❌ /api/cron 경로 없음!');
    console.error('   수정: src/middleware.ts의 isPublicRoute에 "/api/cron(.*)" 추가');
    errors++;
  }

  // 2. .single() 사용 체크
  console.log('\n2. .single() 사용 금지 확인...');
  const singleMatches = grepInDir('src', /\.single\s*\(/);
  if (singleMatches.length === 0) {
    console.log('✅ .single() 사용 없음');
  } else {
    console.error('❌ .single() 사용 발견!');
    singleMatches.forEach((m) => console.error('   ', m));
    console.error('   수정: 모든 .single()을 .maybeSingle()로 변경');
    errors++;
  }

  // 3. JWT template 확인
  console.log('\n3. JWT template "supabase" 확인...');
  const clientFile = readFile('src/lib/supabase/client.ts');
  const serverFile = readFile('src/lib/supabase/server.ts');
  const hasTemplate =
    (clientFile && /template:\s*['"]supabase['"]/.test(clientFile)) ||
    (serverFile && /template:\s*['"]supabase['"]/.test(serverFile));
  if (hasTemplate) {
    console.log('✅ JWT template 이름 정확');
  } else if (clientFile || serverFile) {
    console.error('❌ JWT template 이름 오류!');
    console.error('   수정: getToken({ template: "supabase" }) 확인 (소문자)');
    errors++;
  } else {
    console.log('⚠️  supabase 파일 없음 (Phase 2 미완료)');
  }

  // 4. error 체크 확인
  console.log('\n4. Supabase error 처리 확인...');
  if (serverFile && /if\s*\(\s*error\s*\)/.test(serverFile)) {
    console.log('✅ error 체크 존재');
  } else if (serverFile) {
    console.error('❌ error 체크 누락!');
    console.error('   수정: .maybeSingle() 후 if (error) { ... } 추가');
    errors++;
  }

  // 5. Phase Lock: Phase 3+ 폴더/파일 없어야 함
  console.log('\n5. Phase Lock 확인...');
  const phase3Forbidden = [
    'src/lib/api',
    'src/components',
    'src/lib/api/rate-limiter.ts',
    'src/lib/utils/image-resize.client.ts',
    'src/app/api/ai',
    'src/app/api/cron',
  ];
  let foundForbidden = false;
  for (const p of phase3Forbidden) {
    if (fileExists(p)) {
      console.error(`❌ Phase 2에서 ${p} 생성 금지! (Phase 3+)`);
      foundForbidden = true;
      errors++;
    }
  }
  if (!foundForbidden) {
    console.log('✅ Phase Lock 준수');
  }
}

// Phase 3 검증
if (phase === 3) {
  console.log('📋 Phase 3 검증 항목:');

  // 1. 'use client' 확인
  console.log('\n1. image-resize.client.ts "use client" 확인...');
  const resizeFile = readFile('src/lib/utils/image-resize.client.ts');
  if (resizeFile) {
    const firstLine = resizeFile.split('\n')[0]?.trim();
    if (firstLine === "'use client';" || firstLine === '"use client";') {
      console.log('✅ "use client" 1번 줄 존재');
    } else {
      console.error('❌ "use client" 1번 줄 없음!');
      console.error('   현재 1번 줄:', firstLine);
      console.error('   수정: 파일 최상단에 "use client"; 추가');
      errors++;
    }
  } else {
    console.error('❌ image-resize.client.ts 없음!');
    errors++;
  }

  // 2. 런타임 체크 확인
  console.log('\n2. 런타임 체크 확인...');
  if (resizeFile && /typeof\s+window\s*===?\s*['"]undefined['"]/.test(resizeFile)) {
    console.log('✅ 런타임 체크 존재');
  } else if (resizeFile) {
    console.error('❌ 런타임 체크 없음!');
    console.error('   수정: if (typeof window === "undefined") throw ... 추가');
    errors++;
  }

  // 3. failOpenCount 리셋 확인
  console.log('\n3. Rate Limiter failOpenCount 리셋 확인...');
  const rateLimiter = readFile('src/lib/api/rate-limiter.ts');
  if (rateLimiter && /failOpenCount\s*=\s*0/.test(rateLimiter)) {
    console.log('✅ failOpenCount 리셋 존재');
  } else if (rateLimiter) {
    console.error('❌ failOpenCount 리셋 누락!');
    console.error('   수정: 성공 시 failOpenCount = 0; 추가');
    errors++;
  } else {
    console.error('❌ rate-limiter.ts 없음!');
    errors++;
  }

  // 4. MAX_FAIL_OPEN 확인
  console.log('\n4. MAX_FAIL_OPEN = 20 확인...');
  if (rateLimiter && /MAX_FAIL_OPEN/.test(rateLimiter) && /20/.test(rateLimiter)) {
    console.log('✅ MAX_FAIL_OPEN = 20');
  } else if (rateLimiter) {
    console.error('❌ MAX_FAIL_OPEN 설정 오류!');
    errors++;
  }
}

// Phase 4 검증
if (phase === 4) {
  console.log('📋 Phase 4 검증 항목:');
  const ingredientsWrong = grepInDir('src', /["']ingredients["'](?!_)/);
  if (ingredientsWrong.length === 0) {
    console.log('✅ ingredients_list 컬럼명 정확');
  } else {
    console.error('❌ "ingredients" 컬럼명 사용 발견!');
    ingredientsWrong.forEach((m) => console.error('   ', m));
    console.error('   수정: "ingredients"를 "ingredients_list"로 변경');
    errors++;
  }
}

// Phase 5 검증
if (phase === 5) {
  console.log('📋 Phase 5 검증 항목:');

  // 1. CRON_SECRET 확인 (64자 hex 정규식)
  console.log('\n1. .env.local CRON_SECRET 확인...');
  const envFile = readFile('.env.local');
  if (envFile) {
    const match = envFile.match(/CRON_SECRET=(.+)/);
    const value = match?.[1]?.trim();
    const isValid = value && /^[a-f0-9]{64}$/i.test(value);
    if (isValid) {
      console.log('✅ CRON_SECRET 존재 (64자 hex)');
    } else {
      console.error('❌ CRON_SECRET 없거나 비어있음!');
      console.error('   수정: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))" 실행 후 .env.local에 추가');
      errors++;
    }
  } else {
    console.error('❌ .env.local 없음!');
    errors++;
  }

  // 2. notified_at 컬럼명 확인 (notified 단독 사용 금지)
  console.log('\n2. notified_at 컬럼명 확인...');
  const notifiedWrong = grepInDir('src', /notified(?!_)/);
  if (notifiedWrong.length === 0) {
    console.log('✅ notified_at 컬럼명 정확');
  } else {
    console.error('❌ "notified" 컬럼명 사용 발견!');
    notifiedWrong.forEach((m) => console.error('   ', m));
    console.error('   수정: "notified"를 "notified_at"으로 변경');
    errors++;
  }
}

// Phase 6 검증
if (phase === 6) {
  console.log('📋 Phase 6 검증 항목:');
  console.log('\n1. .single() 최종 확인...');
  const singleMatches = grepInDir('src', /\.single\s*\(/);
  if (singleMatches.length > 0) {
    console.error('❌ .single() 사용 발견!');
    singleMatches.forEach((m) => console.error('   ', m));
    errors++;
  } else {
    console.log('✅ .single() 없음');
  }
  console.log('\n2. ingredients_list 컬럼명 확인...');
  const ingredientsWrong = grepInDir('src', /["']ingredients["'](?!_)/);
  if (ingredientsWrong.length > 0) {
    console.error('❌ "ingredients" 컬럼명 사용 발견!');
    errors++;
  } else {
    console.log('✅ ingredients_list 정확');
  }
  console.log('\n3. notified_at 컬럼명 확인...');
  const notifiedWrong = grepInDir('src', /notified(?!_)/);
  if (notifiedWrong.length > 0) {
    console.error('❌ "notified" 컬럼명 사용 발견!');
    errors++;
  } else {
    console.log('✅ notified_at 정확');
  }
  console.log('\n4. 빌드 테스트...');
  try {
    execSync('pnpm build', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ 빌드 성공');
  } catch {
    console.error('❌ 빌드 실패!');
    errors++;
  }
}

// 최종 결과
console.log('\n' + '='.repeat(50));
if (errors === 0) {
  console.log('✅✅✅ Phase ' + phase + ' 검증 통과! ✅✅✅');
  console.log('='.repeat(50) + '\n');
  process.exit(0);
} else {
  console.error('❌❌❌ Phase ' + phase + ' 검증 실패! (' + errors + '개 에러) ❌❌❌');
  console.error('='.repeat(50) + '\n');
  process.exit(1);
}
