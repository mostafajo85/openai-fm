import React from 'react';
import { PRICING_TIERS, PricingTier, MONETIZATION_ENABLED } from '@/config';

interface QuotaDisplayProps {
    tier: PricingTier;
    charactersUsed: number;
    charactersRemaining: number;
    daysUntilReset: number;
    className?: string;
}

export function QuotaDisplay({
    tier,
    charactersUsed,
    charactersRemaining,
    daysUntilReset,
    className = '',
}: QuotaDisplayProps) {
    // If monetization is disabled, don't show anything
    if (!MONETIZATION_ENABLED) {
        return null;
    }

    const limit = PRICING_TIERS[tier].charactersPerMonth;
    const percentage = (charactersUsed / limit) * 100;
    const isWarning = percentage >= 80 && percentage < 100;
    const isDanger = percentage >= 100;

    return (
        <div className={`bg-screen rounded-lg p-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h3 className="font-medium text-sm">
                        {PRICING_TIERS[tier].name} Plan
                    </h3>
                    <p className="text-xs opacity-60">
                        Resets in {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''}
                    </p>
                </div>
                {tier === 'FREE' && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Free
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
                <div className="h-2 bg-background rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${isDanger
                                ? 'bg-red-500'
                                : isWarning
                                    ? 'bg-yellow-500'
                                    : 'bg-primary'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
                <span className={isDanger ? 'text-red-500' : isWarning ? 'text-yellow-600' : ''}>
                    {charactersUsed.toLocaleString()} / {limit.toLocaleString()} chars
                </span>
                <span className="opacity-60">
                    {charactersRemaining.toLocaleString()} left
                </span>
            </div>

            {/* Warning/Danger Messages */}
            {isDanger && (
                <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
                    ⚠️ Monthly limit reached. Upgrade to continue using the service.
                </div>
            )}
            {isWarning && !isDanger && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-700 dark:text-yellow-300">
                    ⚡ You're using {Math.round(percentage)}% of your monthly quota.
                </div>
            )}

            {/* Upgrade CTA (for Free tier only) */}
            {tier === 'FREE' && percentage >= 50 && (
                <div className="mt-3 text-center">
                    <p className="text-xs opacity-70 mb-2">
                        Need more? Upgrade for higher limits.
                    </p>
                    <div className="flex gap-2 text-xs">
                        <div className="flex-1 p-2 border rounded">
                            <div className="font-medium">Basic</div>
                            <div className="opacity-60">
                                {PRICING_TIERS.BASIC.charactersPerMonth.toLocaleString()} chars
                            </div>
                            <div className="text-primary">${PRICING_TIERS.BASIC.price}/mo</div>
                        </div>
                        <div className="flex-1 p-2 border rounded">
                            <div className="font-medium">Pro</div>
                            <div className="opacity-60">
                                {PRICING_TIERS.PRO.charactersPerMonth.toLocaleString()} chars
                            </div>
                            <div className="text-primary">${PRICING_TIERS.PRO.price}/mo</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
