/**
 * Centralized Application Configuration
 * All magic numbers, limits, and defaults in one place
 */

// Environment
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// API Configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_API_URL = 'https://api.openai.com/v1/audio/speech';
export const OPENAI_MODEL = 'gpt-4o-mini-tts';

// Rate Limiting
export const RATE_LIMIT_IP_MAX = 10; // requests per window
export const RATE_LIMIT_IP_WINDOW = 60 * 1000; // 1 minute
export const RATE_LIMIT_USER_MAX = 50; // requests per window (for authenticated users)
export const RATE_LIMIT_USER_WINDOW = 60 * 1000; // 1 minute

// Text Validation
export const MIN_TEXT_LENGTH = 10;
export const MAX_TEXT_LENGTH = 4096; // OpenAI API limit
export const MAX_INSTRUCTIONS_LENGTH = 1000;

// Audio Configuration
export const SUPPORTED_VOICES = [
    'alloy',
    'ash',
    'ballad',
    'coral',
    'echo',
    'fable',
    'onyx',
    'nova',
    'sage',
    'shimmer',
    'verse',
] as const;

export type Voice = (typeof SUPPORTED_VOICES)[number];

export const DEFAULT_VOICE: Voice = 'coral';

export const SUPPORTED_FORMATS = ['mp3', 'wav', 'opus', 'aac', 'flac', 'pcm'] as const;
export type AudioFormat = (typeof SUPPORTED_FORMATS)[number];

export const DEFAULT_FORMAT: AudioFormat = 'mp3';

// Speed Configuration
export const MIN_SPEED = 0.25;
export const MAX_SPEED = 4.0;
export const DEFAULT_SPEED = 1.0;

// Monetization Configuration
export const MONETIZATION_ENABLED = process.env.NEXT_PUBLIC_ENABLE_MONETIZATION === 'true';

export const PRICING_TIERS = {
    FREE: {
        name: 'Free',
        charactersPerMonth: 10000,
        price: 0,
    },
    BASIC: {
        name: 'Basic',
        charactersPerMonth: 100000,
        price: 9.99,
    },
    PRO: {
        name: 'Pro',
        charactersPerMonth: 500000,
        price: 29.99,
    },
} as const;

export type PricingTier = keyof typeof PRICING_TIERS;

// Warning thresholds
export const QUOTA_WARNING_THRESHOLD = 0.8; // Warn at 80%
export const QUOTA_DANGER_THRESHOLD = 1.0; // Block at 100%

// TTS Service Configuration
export const TTS_MAX_RETRIES = 2;
export const TTS_RETRY_DELAY = 1000; // milliseconds

// Application URLs
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Quota Configuration (for future use)
export const FREE_TIER_CHARACTERS = parseInt(
    process.env.NEXT_PUBLIC_MAX_FREE_CHARACTERS || '10000',
    10
);

/**
 * Validate required environment variables
 * Throws error if critical variables are missing
 */
export function validateEnvironment(): void {
    const errors: string[] = [];

    if (!OPENAI_API_KEY) {
        errors.push('OPENAI_API_KEY is required');
    }

    if (IS_PRODUCTION && !process.env.NEXT_PUBLIC_APP_URL) {
        errors.push('NEXT_PUBLIC_APP_URL is required in production');
    }

    if (errors.length > 0) {
        throw new Error(
            `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
        );
    }
}

/**
 * Get configuration summary for logging
 */
export function getConfigSummary() {
    return {
        environment: process.env.NODE_ENV,
        apiConfigured: !!OPENAI_API_KEY,
        appUrl: APP_URL,
        rateLimitIP: `${RATE_LIMIT_IP_MAX} req/${RATE_LIMIT_IP_WINDOW}ms`,
        textLimits: `${MIN_TEXT_LENGTH}-${MAX_TEXT_LENGTH} chars`,
        voices: SUPPORTED_VOICES.length,
        formats: SUPPORTED_FORMATS.length,
    };
}
