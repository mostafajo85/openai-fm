import { useState, useEffect } from 'react';

/**
 * Detect language from text
 */
export function detectLanguage(text: string): 'ar' | 'en' | 'mixed' {
    const arabicPattern = /[\u0600-\u06FF]/;
    const englishPattern = /[a-zA-Z]/;

    const hasArabic = arabicPattern.test(text);
    const hasEnglish = englishPattern.test(text);

    if (hasArabic && hasEnglish) return 'mixed';
    if (hasArabic) return 'ar';
    return 'en';
}

/**
 * Hook to detect language and manage text direction
 */
export function useLanguageDetection(text: string) {
    const [language, setLanguage] = useState<'ar' | 'en' | 'mixed'>('en');
    const [isRTL, setIsRTL] = useState(false);

    useEffect(() => {
        const detected = detectLanguage(text);
        setLanguage(detected);
        setIsRTL(detected === 'ar');
    }, [text]);

    return { language, isRTL };
}

/**
 * Count characters (excluding whitespace)
 */
export function countCharacters(text: string): number {
    return text.replace(/\s/g, '').length;
}

/**
 * Hook to manage character count with warnings
 */
export function useCharacterCount(text: string, maxCharacters = 4096) {
    const [count, setCount] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [isNearLimit, setIsNearLimit] = useState(false);
    const [isAtLimit, setIsAtLimit] = useState(false);

    useEffect(() => {
        const chars = countCharacters(text);
        const pct = (chars / maxCharacters) * 100;

        setCount(chars);
        setPercentage(pct);
        setIsNearLimit(pct > 80 && pct < 100);
        setIsAtLimit(pct >= 100);
    }, [text, maxCharacters]);

    return {
        count,
        percentage,
        isNearLimit,
        isAtLimit,
        remaining: Math.max(0, maxCharacters - count),
    };
}
