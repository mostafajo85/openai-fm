import React from 'react';

interface LanguageDetectorProps {
    language: 'ar' | 'en' | 'mixed';
    characterCount: number;
    maxCharacters?: number;
    className?: string;
}

export function LanguageDetector({
    language,
    characterCount,
    maxCharacters = 4096,
    className = '',
}: LanguageDetectorProps) {
    const percentage = (characterCount / maxCharacters) * 100;
    const isWarning = percentage > 80 && percentage < 100;
    const isError = percentage >= 100;

    const languageLabels = {
        ar: { flag: '🇸🇦', label: 'عربي', name: 'Arabic' },
        en: { flag: '🇬🇧', label: 'English', name: 'English' },
        mixed: { flag: '🌐', label: 'Mixed', name: 'Mixed Languages' },
    };

    const lang = languageLabels[language];

    return (
        <div
            className={`bg-screen rounded-lg p-3 flex items-center justify-between ${className}`}
        >
            {/* Language indicator */}
            <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                    {lang.flag}
                </span>
                <div>
                    <p className="text-sm font-medium">{lang.label}</p>
                    <p className="text-xs opacity-60">{lang.name}</p>
                </div>
            </div>

            {/* Character count with status */}
            <div className="text-right">
                <p
                    className={`text-sm font-medium ${isError ? 'text-red-500' : isWarning ? 'text-yellow-500' : ''
                        }`}
                >
                    {characterCount.toLocaleString()}
                </p>
                <p className="text-xs opacity-60">
                    of {maxCharacters.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
