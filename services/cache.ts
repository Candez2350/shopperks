
// Simulating a Redis-like Cache Layer to reduce Database load
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const CACHE_STORE = new Map<string, CacheEntry<any>>();

export const CacheService = {
  // Set key with TTL (Time To Live in seconds)
  set: <T>(key: string, data: T, ttlSeconds: number = 60): void => {
    const expiry = Date.now() + ttlSeconds * 1000;
    CACHE_STORE.set(key, { data, expiry });
    // console.log(`[Redis Sim] CACHE SET: ${key} (TTL: ${ttlSeconds}s)`);
  },

  // Get key if valid
  get: <T>(key: string): T | null => {
    const entry = CACHE_STORE.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      CACHE_STORE.delete(key);
      // console.log(`[Redis Sim] CACHE MISS (Expired): ${key}`);
      return null;
    }

    // console.log(`[Redis Sim] CACHE HIT: ${key}`);
    return entry.data as T;
  },

  // Invalidate specific key pattern (simplified)
  invalidate: (key: string) => {
    CACHE_STORE.delete(key);
    // console.log(`[Redis Sim] CACHE INVALIDATED: ${key}`);
  },

  // Clear all
  flush: () => {
    CACHE_STORE.clear();
  }
};
