import { RateLimitError } from '@/lib/errors';

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private readonly maxRequests: number;
    private readonly windowMs: number;

    constructor(maxRequests = 10, windowMs = 60 * 1000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;

        // Cleanup old entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    /**
     * Check if request is allowed for the given identifier (IP or user ID)
     */
    async check(identifier: string): Promise<void> {
        const now = Date.now();
        const entry = this.store.get(identifier);

        if (!entry || now > entry.resetAt) {
            // First request or window expired
            this.store.set(identifier, {
                count: 1,
                resetAt: now + this.windowMs,
            });
            return;
        }

        if (entry.count >= this.maxRequests) {
            const resetIn = Math.ceil((entry.resetAt - now) / 1000);
            throw new RateLimitError(
                `Too many requests. Please try again in ${resetIn} seconds.`
            );
        }

        // Increment count
        entry.count++;
        this.store.set(identifier, entry);
    }

    /**
     * Get remaining requests for identifier
     */
    getRemaining(identifier: string): number {
        const entry = this.store.get(identifier);
        if (!entry || Date.now() > entry.resetAt) {
            return this.maxRequests;
        }
        return Math.max(0, this.maxRequests - entry.count);
    }

    /**
     * Reset rate limit for identifier
     */
    reset(identifier: string): void {
        this.store.delete(identifier);
    }

    /**
     * Cleanup expired entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetAt) {
                this.store.delete(key);
            }
        }
    }
}

// Create rate limiter instances for different use cases
export const ipRateLimiter = new RateLimiter(10, 60 * 1000); // 10 requests per minute per IP
export const userRateLimiter = new RateLimiter(50, 60 * 1000); // 50 requests per minute per user

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
    // Try various headers in order of preference
    const headers = request.headers;

    const forwardedFor = headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback to a default (won't happen in real deployment)
    return 'unknown';
}
