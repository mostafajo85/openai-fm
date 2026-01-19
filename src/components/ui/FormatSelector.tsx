import React from 'react';

interface FormatSelectorProps {
    format: 'mp3' | 'wav' | 'opus';
    onChange: (format: 'mp3' | 'wav' | 'opus') => void;
    className?: string;
}

const formats = [
    { value: 'mp3' as const, label: 'MP3', description: 'Smaller size, compatible' },
    { value: 'wav' as const, label: 'WAV', description: 'High quality, larger' },
    { value: 'opus' as const, label: 'Opus', description: 'Web streaming' },
];

export function FormatSelector({ format, onChange, className = '' }: FormatSelectorProps) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label className="text-sm opacity-70">Audio Format</label>
            <div className="grid grid-cols-3 gap-2">
                {formats.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => onChange(f.value)}
                        className={`px-3 py-2 rounded flex flex-col items-center gap-1 transition-colors ${format === f.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-screen hover:bg-screen/80'
                            }`}
                        title={f.description}
                    >
                        <span className="font-medium">{f.label}</span>
                        <span className="text-[10px] opacity-70">{f.description}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
