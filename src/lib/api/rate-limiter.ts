import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const geminiRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
});

let failOpenCount = 0;
let lastFailTime = 0;
let lastFailAlert = 0;
const MAX_FAIL_OPEN = parseInt(
  process.env.RATE_LIMIT_FAIL_OPEN_THRESHOLD || '20',
  10
);

export async function checkRateLimit(userId: string) {
  try {
    const { success, reset } = await geminiRateLimiter.limit(userId);

    failOpenCount = 0;

    if (!success) {
      const waitSeconds = Math.ceil((reset - Date.now()) / 1000);

      if (process.env.NODE_ENV === 'production') {
        return { allowed: false, retryAfter: waitSeconds };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('❌ Rate limiter error:', error);

    failOpenCount++;

    const now = Date.now();
    if (failOpenCount % 5 === 0 && now - lastFailAlert > 60 * 60 * 1000) {
      lastFailAlert = now;
      console.warn(`🚨 Rate limit failed ${failOpenCount} times`);
    }

    if (failOpenCount >= MAX_FAIL_OPEN) {
      const now = Date.now();
      if (lastFailTime === 0) {
        lastFailTime = now;
        console.error(`🚨 FAIL CLOSED: ${failOpenCount} failures`);
        return { allowed: false, failClosed: true };
      }
      if (now - lastFailTime > 60 * 60 * 1000) {
        failOpenCount = 0;
        lastFailTime = 0;
        console.warn('🔄 Fail Closed 1시간 경과 — failOpenCount 리셋');
      } else {
        return { allowed: false, failClosed: true };
      }
    }

    console.warn(`⚠️ FAIL OPEN: ${failOpenCount}/${MAX_FAIL_OPEN}`);
    return { allowed: true, failedOpen: true };
  }
}
