// cache/NodeCacheService.ts
import NodeCache from 'node-cache';

export interface CacheService {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete?(key: string): Promise<void>;
}

export interface NodeCacheServiceOptions {
  defaultTtl?: number; // in seconds
}

export class NodeCacheService implements CacheService {
  private cache: NodeCache;
  private defaultTtl: number;

  constructor(options?: NodeCacheServiceOptions) {
    this.defaultTtl = options?.defaultTtl ?? 600; // default to 600 seconds (10 minutes)
    this.cache = new NodeCache({ stdTTL: this.defaultTtl });
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // ttl (if provided) is in seconds, falling back to the default
    this.cache.set(key, value, ttl || this.defaultTtl);
  }
}