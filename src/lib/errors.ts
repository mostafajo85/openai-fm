// Custom error types for the application

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(400, message, 'VALIDATION_ERROR');
    }
}

export class RateLimitError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(429, message, 'RATE_LIMIT_ERROR');
    }
}

export class QuotaExceededError extends AppError {
    constructor(message = 'Character quota exceeded. Please upgrade your plan.') {
        super(403, message, 'QUOTA_EXCEEDED');
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(401, message, 'AUTH_ERROR');
    }
}

export class OpenAIError extends AppError {
    constructor(message: string, statusCode = 500) {
        super(statusCode, message, 'OPENAI_ERROR');
    }
}

// User-friendly error messages
export const ERROR_MESSAGES = {
    INVALID_INPUT: 'Please enter valid text (10-4096 characters)',
    INVALID_VOICE: 'Please select a valid voice',
    INVALID_SPEED: 'Speed must be between 0.25 and 4.0',
    INVALID_FORMAT: 'Invalid audio format selected',
    TEXT_TOO_SHORT: 'Text must be at least 10 characters long',
    TEXT_TOO_LONG: 'Text must not exceed 4096 characters',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
    QUOTA_EXCEEDED: 'You have reached your monthly character limit. Please upgrade your plan.',
    OPENAI_API_ERROR: 'Failed to generate audio. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
    AUTH_REQUIRED: 'Please sign in to continue',
    INVALID_CREDENTIALS: 'Invalid email or password',
} as const;

// Error response formatter
export interface ErrorResponse {
    error: {
        message: string;
        code: string;
        statusCode: number;
    };
}

export function formatErrorResponse(error: AppError): ErrorResponse {
    return {
        error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
        },
    };
}

// Error logger (basic implementation, can be enhanced with Winston/Pino)
export function logError(error: Error, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'production') {
        // In production, log to your logging service
        console.error('[ERROR]', {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
        });
    } else {
        // In development, log to console
        console.error('[ERROR]', error.message, error.stack, context);
    }
}
