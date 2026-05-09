import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function createRatelimiter() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: false,
  });
}

const ratelimiter = createRatelimiter();

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; reset?: number }> {
  if (!ratelimiter) return { success: true };
  const result = await ratelimiter.limit(identifier);
  return { success: result.success, reset: result.reset };
}
