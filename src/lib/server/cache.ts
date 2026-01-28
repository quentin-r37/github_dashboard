interface CacheEntry<T> {
	data: T;
	expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
	const entry = store.get(key) as CacheEntry<T> | undefined;
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		store.delete(key);
		return null;
	}
	return entry.data;
}

export function cacheSet<T>(key: string, data: T, ttlSeconds: number): void {
	store.set(key, {
		data,
		expiresAt: Date.now() + ttlSeconds * 1000,
	});
}

export function cacheInvalidate(pattern?: string): void {
	if (!pattern) {
		store.clear();
		return;
	}
	for (const key of store.keys()) {
		if (key.startsWith(pattern)) {
			store.delete(key);
		}
	}
}

export function extendTtl(key: string, additionalSeconds: number): void {
	const entry = store.get(key);
	if (entry) {
		entry.expiresAt += additionalSeconds * 1000;
	}
}
