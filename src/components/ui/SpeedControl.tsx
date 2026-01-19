import React from 'react';

interface SpeedControlProps {
    speed: number;
    onChange: (speed: number) => void;
    className?: string;
}

export function SpeedControl({ speed, onChange, className = '' }: SpeedControlProps) {
    const speeds = [
        { label: '0.25×', value: 0.25 },
        { label: '0.5×', value: 0.5 },
        { label: '0.75×', value: 0.75 },
        { label: '1×', value: 1.0 },
        { label: '1.25×', value: 1.25 },
        { label: '1.5×', value: 1.5 },
        { label: '2×', value: 2.0 },
    ];

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label htmlFor="speed-slider" className="text-sm opacity-70">
                Speed: {speed}×
            </label>
            <div className="flex items-center gap-2">
                <input
                    id="speed-slider"
                    type="range"
                    min="0.25"
                    max="4.0"
                    step="0.25"
                    value={speed}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-screen rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {speeds.map((s) => (
                    <button
                        key={s.value}
                        onClick={() => onChange(s.value)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${speed === s.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-screen hover:bg-screen/80'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
