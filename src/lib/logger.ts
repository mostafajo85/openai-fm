/**
 * Production-safe logging utility
 * Ensures no sensitive data is logged in production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: unknown;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Sanitize context to remove sensitive data
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };
    const sensitiveKeys = ['apiKey', 'password', 'token', 'secret', 'authorization'];

    Object.keys(sanitized).forEach((key) => {
        if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = '[REDACTED]';
        }
    });

    return sanitized;
}

/**
 * Format log message for production
 */
function formatLogMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = sanitizeContext(context);

    if (IS_PRODUCTION) {
        // Structured logging for production (JSON format for log aggregation)
        return JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            message,
            ...(sanitizedContext && { context: sanitizedContext }),
        });
    }

    // Human-readable format for development
    const contextStr = sanitizedContext
        ? `\n  ${JSON.stringify(sanitizedContext, null, 2)}`
        : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: LogContext): void {
    const formatted = formatLogMessage('info', message, context);
    console.log(formatted);
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: LogContext): void {
    const formatted = formatLogMessage('warn', message, context);
    console.warn(formatted);
}

/**
 * Log error message
 */
export function logError(message: string, error?: Error, context?: LogContext): void {
    const errorContext: LogContext = {
        ...context,
        ...(error && {
            errorMessage: error.message,
            errorStack: IS_PRODUCTION ? undefined : error.stack,
        }),
    };

    const formatted = formatLogMessage('error', message, errorContext);
    console.error(formatted);
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
    if (!IS_PRODUCTION) {
        const formatted = formatLogMessage('debug', message, context);
        console.debug(formatted);
    }
}

/**
 * Log application startup
 */
export function logStartup(config: Record<string, unknown>): void {
    logInfo('Application starting', {
        config: sanitizeContext(config),
    });
}

/**
 * Log API request (without sensitive data)
 */
export function logAPIRequest(
    endpoint: string,
    method: string,
    statusCode?: number,
    duration?: number
): void {
    logInfo('API Request', {
        endpoint,
        method,
        statusCode,
        duration: duration ? `${duration}ms` : undefined,
    });
}
