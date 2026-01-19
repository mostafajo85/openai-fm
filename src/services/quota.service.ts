/**
 * Simple quota tracking service
 * Tracks character usage per anonymous user
 * No database required - uses in-memory storage (can be upgraded to Redis later)
 */

import { MONETIZATION_ENABLED, PRICING_TIERS, PricingTier } from '@/config';
import { QuotaExceededError } from '@/lib/errors';

interface UserQuota {
    userId: string;
    tier: PricingTier;
    charactersUsed: number;
    resetAt: number; // Timestamp when quota resets
}

class QuotaService {
    private quotas: Map<string, UserQuota> = new Map();

    /**
     * Get user's current quota information
     */
    getUserQuota(userId: string): UserQuota {
        const now = Date.now();
        let quota = this.quotas.get(userId);

        // Create new quota if doesn't exist or expired
        if (!quota || now > quota.resetAt) {
            quota = {
                userId,
                tier: 'FREE',
                charactersUsed: 0,
                resetAt: this.getNextResetTime(),
            };
            this.quotas.set(userId, quota);
        }

        return quota;
    }

    /**
     * Check if user has enough quota for a request
     * Returns true if allowed, throws QuotaExceededError if not
     */
    checkQuota(userId: string, characterCount: number): boolean {
        // If monetization is disabled, always allow
        if (!MONETIZATION_ENABLED) {
            return true;
        }

        const quota = this.getUserQuota(userId);
        const limit = PRICING_TIERS[quota.tier].charactersPerMonth;
        const newTotal = quota.charactersUsed + characterCount;

        if (newTotal > limit) {
            const remaining = Math.max(0, limit - quota.charactersUsed);
            throw new QuotaExceededError(
                `Monthly character limit reached. You have ${remaining} characters remaining. Upgrade to continue.`
            );
        }

        return true;
    }

    /**
     * Consume quota after successful request
     */
    consumeQuota(userId: string, characterCount: number): void {
        // If monetization is disabled, don't track
        if (!MONETIZATION_ENABLED) {
            return;
        }

        const quota = this.getUserQuota(userId);
        quota.charactersUsed += characterCount;
        this.quotas.set(userId, quota);
    }

    /**
     * Get quota usage percentage (0-1)
     */
    getUsagePercentage(userId: string): number {
        const quota = this.getUserQuota(userId);
        const limit = PRICING_TIERS[quota.tier].charactersPerMonth;
        return quota.charactersUsed / limit;
    }

    /**
     * Get remaining characters
     */
    getRemainingCharacters(userId: string): number {
        const quota = this.getUserQuota(userId);
        const limit = PRICING_TIERS[quota.tier].charactersPerMonth;
        return Math.max(0, limit - quota.charactersUsed);
    }

    /**
     * Upgrade user tier (for future payment integration)
     */
    upgradeTier(userId: string, newTier: PricingTier): void {
        const quota = this.getUserQuota(userId);
        quota.tier = newTier;
        this.quotas.set(userId, quota);
    }

    /**
     * Get next quota reset time (first day of next month)
     */
    private getNextResetTime(): number {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.getTime();
    }

    /**
     * Get days until reset
     */
    getDaysUntilReset(userId: string): number {
        const quota = this.getUserQuota(userId);
        const now = Date.now();
        const msUntilReset = quota.resetAt - now;
        return Math.ceil(msUntilReset / (1000 * 60 * 60 * 24));
    }

    /**
     * Cleanup expired quotas (optional, for memory management)
     */
    cleanup(): void {
        const now = Date.now();
        for (const [userId, quota] of this.quotas.entries()) {
            if (now > quota.resetAt) {
                this.quotas.delete(userId);
            }
        }
    }
}

// Singleton instance
export const quotaService = new QuotaService();

// Cleanup task - run every hour
if (typeof setInterval !== 'undefined') {
    setInterval(() => quotaService.cleanup(), 60 * 60 * 1000);
}
