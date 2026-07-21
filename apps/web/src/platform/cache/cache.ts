import { kv } from '@vercel/kv';
import { createClient, type RedisClientType } from 'redis';

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds: number): Promise<void>;
}

class VercelKvCache implements Cache {
  get<T>(key: string): Promise<T | null> {
    return kv.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await kv.set(key, value, { ex: ttlSeconds });
  }
}

class RedisCache implements Cache {
  private client: RedisClientType | null = null;
  private connectionPromise: Promise<unknown> | null = null;

  async get<T>(key: string): Promise<T | null> {
    const client = await this.connect();
    const value = await client.get(key);
    return value === null ? null : (JSON.parse(value) as T);
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const client = await this.connect();
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  private async connect(): Promise<RedisClientType> {
    if (!this.client) {
      const url = process.env.REDIS_URL;
      if (!url) {
        throw new Error('REDIS_URL is required when CACHE_BACKEND=redis');
      }

      this.client = createClient({ url });
      this.client.on('error', (error) => {
        // biome-ignore lint/suspicious/noConsole: backend failures need an operational signal.
        console.error('Redis cache error', error);
      });
    }

    if (this.client.isReady) {
      return this.client;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.client.connect().finally(() => {
        this.connectionPromise = null;
      });
    }

    await this.connectionPromise;
    return this.client;
  }
}

class NoCache implements Cache {
  get<T>(_key: string): Promise<T | null> {
    return Promise.resolve(null);
  }

  set(_key: string, _value: unknown, _ttlSeconds: number): Promise<void> {
    return Promise.resolve();
  }
}

let cacheInstance: Cache | null = null;

function createCache(): Cache {
  switch (process.env.CACHE_BACKEND ?? 'vercel-kv') {
    case 'none':
      return new NoCache();
    case 'redis':
      return new RedisCache();
    case 'vercel-kv':
      return new VercelKvCache();
    default:
      throw new Error(
        `Unsupported CACHE_BACKEND: ${process.env.CACHE_BACKEND}`
      );
  }
}

/** Lazily selects the configured shared cache, so imports and builds never connect. */
export function getCache(): Cache {
  cacheInstance ??= createCache();
  return cacheInstance;
}
