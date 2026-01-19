import React, { useEffect, useRef } from 'react';

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
    language?: 'ar' | 'en' | 'mixed';
    characterCount?: number;
    className?: string;
}

export function TextEditor({
    value,
    onChange,
    placeholder = 'Enter your text here...',
    maxLength = 4096,
    disabled = false,
    language = 'en',
    characterCount,
    className = '',
}: TextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isRTL = language === 'ar';

    // Auto-focus when not disabled
    useEffect(() => {
        if (!disabled && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [disabled]);

    // Get placeholder based on language
    const getPlaceholder = () => {
        if (isRTL) {
            return 'اكتب النص هنا... (10-4096 حرف)';
        }
        return 'Enter your text here... (10-4096 characters)';
    };

    return (
        <div className={`relative flex flex-col h-full w-full ${className}`}>
            <textarea
                ref={textareaRef}
                dir={isRTL ? 'rtl' : 'ltr'}
                lang={language}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || getPlaceholder()}
                maxLength={maxLength}
                disabled={disabled}
                className={`
          w-full h-full min-h-[220px] resize-none outline-none focus:outline-none 
          bg-screen p-4 rounded-lg shadow-textarea text-[16px] md:text-[14px]
          transition-opacity duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
          ${isRTL ? 'text-right font-arabic' : 'text-left'}
          placeholder:opacity-40
          focus:ring-2 focus:ring-primary/20
        `}
                aria-label="Text input for speech generation"
                aria-describedby="character-count"
            />

            {/* Character count indicator */}
            {characterCount !== undefined && (
                <div
                    id="character-count"
                    className={`
            absolute bottom-3 z-10 opacity-50
            ${isRTL ? 'left-4' : 'right-4'}
          `}
                >
                    <span className="text-xs">
                        {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
                    </span>
                </div>
            )}

            {/* Language indicator */}
            {language && (
                <div
                    className={`
            absolute top-3 z-10 opacity-30
            ${isRTL ? 'left-4' : 'right-4'}
          `}
                >
                    <span className="text-xs uppercase">
                        {language === 'ar' ? '🇸🇦 عربي' : language === 'en' ? '🇬🇧 EN' : '🌐 Mixed'}
                    </span>
                </div>
            )}
        </div>
    );
}
