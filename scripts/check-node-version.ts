/**
 * Node.js 보안 버전 검증 (2026년 1월 CVE 대응)
 * prebuild 시 자동 실행 — 취약 버전이면 빌드 중단
 *
 * 사용법: pnpm check-node-version
 */

import { execSync } from 'child_process';

const MIN_NODE_VERSION = '22.22.0';
const MIN_NODE_MAINTENANCE = '20.20.0';

function parseVersion(v: string): [number, number, number] {
  const parts = v.replace(/^v/, '').split('.');
  return [
    parseInt(parts[0] || '0', 10),
    parseInt(parts[1] || '0', 10),
    parseInt(parts[2] || '0', 10),
  ];
}

function gte(current: string, minimum: string): boolean {
  const c = parseVersion(current);
  const m = parseVersion(minimum);
  for (let i = 0; i < 3; i++) {
    if (c[i] > m[i]) return true;
    if (c[i] < m[i]) return false;
  }
  return true;
}

try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const versionStr = nodeVersion.replace('v', '');
  const major = parseVersion(versionStr)[0];

  const isValid =
    gte(versionStr, MIN_NODE_VERSION) ||
    (major === 20 && gte(versionStr, MIN_NODE_MAINTENANCE));

  if (!isValid) {
    console.error('❌❌❌ Node.js 보안 취약점 발견! ❌❌❌');
    console.error('');
    console.error('현재 버전:', nodeVersion);
    console.error('최소 요구:', MIN_NODE_VERSION, '또는', MIN_NODE_MAINTENANCE);
    console.error('');
    console.error('🔴 영향받는 취약점:');
    console.error('   - CVE-2025-55130: 파일 시스템 권한 우회');
    console.error('   - CVE-2025-27210: 경로 탐색 우회 (.env.local 노출)');
    console.error('   - CVE-2024-36138: Windows 임의 코드 실행');
    console.error('');
    console.error('⚠️ 즉시 Node.js 업그레이드 후 재시도!');
    console.error('   https://nodejs.org/');
    console.error('');
    process.exit(1);
  }

  console.log('✅ Node.js 버전 확인:', nodeVersion, '(보안 OK)');
} catch (error) {
  console.error('❌ Node.js 버전 확인 실패:', error);
  process.exit(1);
}
