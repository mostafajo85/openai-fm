import React from 'react';

interface CharacterCounterProps {
    current: number;
    max: number;
    className?: string;
}

export function CharacterCounter({ current, max, className = '' }: CharacterCounterProps) {
    const percentage = (current / max) * 100;
    const isNearLimit = percentage > 80;
    const isAtLimit = percentage >= 100;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div className="flex justify-between items-center text-xs opacity-70">
                <span>Characters</span>
                <span className={isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : ''}>
                    {current.toLocaleString()} / {max.toLocaleString()}
                </span>
            </div>
            <div className="w-full h-1 bg-screen rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
}
