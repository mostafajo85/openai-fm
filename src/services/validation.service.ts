import { ValidationError, ERROR_MESSAGES } from '@/lib/errors';

const MIN_TEXT_LENGTH = 10;
const MAX_TEXT_LENGTH = 4096; // OpenAI API limit
const MIN_SPEED = 0.25;
const MAX_SPEED = 4.0;

// Supported voices from OpenAI API
export const VALID_VOICES = [
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

export type Voice = (typeof VALID_VOICES)[number];

// Supported audio formats
export const VALID_FORMATS = ['mp3', 'wav', 'opus', 'aac', 'flac', 'pcm'] as const;
export type AudioFormat = (typeof VALID_FORMATS)[number];

// Validation functions
export function validateText(text: string): string {
    if (!text || typeof text !== 'string') {
        throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT);
    }

    const trimmedText = text.trim();

    if (trimmedText.length < MIN_TEXT_LENGTH) {
        throw new ValidationError(ERROR_MESSAGES.TEXT_TOO_SHORT);
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
        throw new ValidationError(ERROR_MESSAGES.TEXT_TOO_LONG);
    }

    return trimmedText;
}

export function validateVoice(voice: string): Voice {
    if (!VALID_VOICES.includes(voice as Voice)) {
        throw new ValidationError(ERROR_MESSAGES.INVALID_VOICE);
    }
    return voice as Voice;
}

export function validateSpeed(speed: number): number {
    if (typeof speed !== 'number' || speed < MIN_SPEED || speed > MAX_SPEED) {
        throw new ValidationError(ERROR_MESSAGES.INVALID_SPEED);
    }
    return speed;
}

export function validateFormat(format: string): AudioFormat {
    if (!VALID_FORMATS.includes(format as AudioFormat)) {
        throw new ValidationError(ERROR_MESSAGES.INVALID_FORMAT);
    }
    return format as AudioFormat;
}

export function validateInstructions(instructions?: string): string | undefined {
    if (!instructions) return undefined;

    const trimmed = instructions.trim();
    if (trimmed.length === 0) return undefined;

    // Limit instructions to 1000 characters
    if (trimmed.length > 1000) {
        throw new ValidationError('Instructions must not exceed 1000 characters');
    }

    return trimmed;
}

// Language detection (basic implementation)
export function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
    const arabicPattern = /[\u0600-\u06FF]/;
    const englishPattern = /[a-zA-Z]/;

    const hasArabic = arabicPattern.test(text);
    const hasEnglish = englishPattern.test(text);

    if (hasArabic && hasEnglish) return 'mixed';
    if (hasArabic) return 'ar';
    return 'en';
}

// Count characters (excludes whitespace for quota calculation)
export function countCharacters(text: string): number {
    return text.replace(/\s/g, '').length;
}

// Abuse detection (basic patterns)
const SPAM_PATTERNS = [
    /(.)\1{20,}/, // Repeated characters (20+ times)
    /(\b\w+\b)(\s+\1){10,}/, // Repeated words (10+ times)
];

export function detectSpam(text: string): boolean {
    return SPAM_PATTERNS.some(pattern => pattern.test(text));
}

export function validateAndSanitize(params: {
    input: string;
    voice: string;
    speed?: number;
    format?: string;
    instructions?: string;
}): {
    input: string;
    voice: Voice;
    speed: number;
    format: AudioFormat;
    instructions?: string;
    characterCount: number;
    language: 'ar' | 'en' | 'mixed';
} {
    const input = validateText(params.input);
    const voice = validateVoice(params.voice);
    const speed = params.speed ? validateSpeed(params.speed) : 1.0;
    const format = params.format ? validateFormat(params.format) : 'mp3';
    const instructions = validateInstructions(params.instructions);

    // Check for spam
    if (detectSpam(input)) {
        throw new ValidationError('Text contains spam patterns');
    }

    const characterCount = countCharacters(input);
    const language = detectLanguage(input);

    return {
        input,
        voice,
        speed,
        format,
        instructions,
        characterCount,
        language,
    };
}
