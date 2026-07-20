import { kv } from "@vercel/kv";
import { createClient } from "redis";

export interface Cache {
	get<T>(key: string): Promise<T | null>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	deleteByPattern(pattern: string): Promise<void>;
}

class VercelKvCache implements Cache {
	get<T>(key: string): Promise<T | null> {
		return kv.get<T>(key);
	}

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		if (ttlSeconds) {
			await kv.set(key, value, { ex: ttlSeconds });
			return;
		}

		await kv.set(key, value);
	}

	async deleteByPattern(pattern: string): Promise<void> {
		const keys = await kv.keys(pattern);
		if (keys.length > 0) {
			await kv.del(...keys);
		}
	}
}

class RedisCache implements Cache {
	private readonly client = createClient({ url: process.env.REDIS_URL });
	private connectionPromise: Promise<unknown> | null = null;

	constructor() {
		this.client.on("error", (error) => {
			// biome-ignore lint/suspicious/noConsole: Redis connection failures must remain visible.
			console.error("Redis cache error", error);
		});
	}

	async get<T>(key: string): Promise<T | null> {
		await this.connect();
		const value = await this.client.get(key);
		return value === null ? null : (JSON.parse(value) as T);
	}

	async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
		await this.connect();
		const serializedValue = JSON.stringify(value);

		if (ttlSeconds) {
			await this.client.set(key, serializedValue, { EX: ttlSeconds });
			return;
		}

		await this.client.set(key, serializedValue);
	}

	async deleteByPattern(pattern: string): Promise<void> {
		await this.connect();

		for await (const keys of this.client.scanIterator({
			MATCH: pattern,
			COUNT: 100,
		})) {
			if (keys.length > 0) {
				await this.client.del(keys);
			}
		}
	}

	private async connect(): Promise<void> {
		if (this.client.isReady) {
			return;
		}

		if (!this.connectionPromise) {
			this.connectionPromise = this.client.connect().finally(() => {
				this.connectionPromise = null;
			});
		}

		await this.connectionPromise;
	}
}

function createCache(): Cache {
	const backend = process.env.CACHE_BACKEND ?? "vercel-kv";

	switch (backend) {
		case "redis":
			if (!process.env.REDIS_URL) {
				throw new Error("REDIS_URL is required when CACHE_BACKEND=redis");
			}
			return new RedisCache();
		case "vercel-kv":
			return new VercelKvCache();
		default:
			throw new Error(`Unsupported CACHE_BACKEND: ${backend}`);
	}
}

export const cache = createCache();
