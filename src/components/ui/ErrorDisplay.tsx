import React from 'react';

interface ErrorDisplayProps {
    error: {
        message: string;
        code?: string;
    } | null;
    onDismiss?: () => void;
    className?: string;
}

const errorIcons: Record<string, string> = {
    VALIDATION_ERROR: '⚠️',
    RATE_LIMIT_ERROR: '⏱️',
    QUOTA_EXCEEDED: '📊',
    OPENAI_ERROR: '🔧',
    NETWORK_ERROR: '📡',
    default: '❌',
};

const errorTitles: Record<string, string> = {
    VALIDATION_ERROR: 'Invalid Input',
    RATE_LIMIT_ERROR: 'Too Many Requests',
    QUOTA_EXCEEDED: 'Quota Exceeded',
    OPENAI_ERROR: 'Service Error',
    NETWORK_ERROR: 'Connection Error',
    default: 'Error',
};

export function ErrorDisplay({ error, onDismiss, className = '' }: ErrorDisplayProps) {
    if (!error) return null;

    const code = error.code || 'default';
    const icon = errorIcons[code] || errorIcons.default;
    const title = errorTitles[code] || errorTitles.default;

    return (
        <div
            className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 ${className}`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                    {icon}
                </span>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {error.message}
                    </p>
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
                        aria-label="Dismiss error"
                    >
                        <svg
                            className="w-4 h-4 text-red-600 dark:text-red-400"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
