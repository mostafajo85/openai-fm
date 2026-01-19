import React from 'react';

interface LoadingStateProps {
    message?: string;
    progress?: number;
}

export function LoadingState({ message = 'Generating audio...', progress }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 p-6">
            <div className="relative">
                {/* Spinner */}
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>

            {/* Message */}
            <p className="text-sm opacity-70 text-center">{message}</p>

            {/* Progress bar (optional) */}
            {progress !== undefined && (
                <div className="w-full max-w-xs">
                    <div className="h-1 bg-screen rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-center mt-1 opacity-50">{Math.round(progress)}%</p>
                </div>
            )}
        </div>
    );
}

export function LoadingOverlay({ message }: { message?: string }) {
    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <LoadingState message={message} />
        </div>
    );
}
