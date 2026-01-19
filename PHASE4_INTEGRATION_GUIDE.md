# Phase 4: User Experience - Component Integration Guide

This guide shows how to integrate the new UX components into your application.

## Components Created

### 1. LoadingState & LoadingOverlay
**File**: `src/components/ui/LoadingState.tsx`

**Usage**:
```tsx
import { LoadingState, LoadingOverlay } from '@/components/ui/LoadingState';

// Basic loading state
<LoadingState message="Generating audio..." />

// With progress
<LoadingState message="Processing..." progress={75} />

// As overlay
<div className="relative">
  {isLoading && <LoadingOverlay message="Please wait..." />}
  {/* Your content */}
</div>
```

### 2. ErrorDisplay
**File**: `src/components/ui/ErrorDisplay.tsx`

**Usage**:
```tsx
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

<ErrorDisplay
  error={{
    message: "Text must be at least 10 characters",
    code: "VALIDATION_ERROR"
  }}
  onDismiss={() => setError(null)}
/>
```

**Error Codes Supported**:
- `VALIDATION_ERROR` - ⚠️ Invalid Input
- `RATE_LIMIT_ERROR` - ⏱️ Too Many Requests
- `QUOTA_EXCEEDED` - 📊 Quota Exceeded
- `OPENAI_ERROR` - 🔧 Service Error
- `NETWORK_ERROR` - 📡 Connection Error

### 3. TextEditor
**File**: `src/components/ui/TextEditor.tsx`

**Features**:
- Automatic RTL for Arabic text
- Character counter
- Language indicator
- Disabled state
- Auto-focus
- Accessibility

**Usage**:
```tsx
import { TextEditor } from '@/components/ui/TextEditor';

<TextEditor
  value={text}
  onChange={setText}
  language={detectedLanguage}
  characterCount={charCount}
  maxLength={4096}
  disabled={isLoading}
/>
```

### 4. AudioPlayer
**File**: `src/components/ui/AudioPlayer.tsx`

**Features**:
- Play/Pause
- Restart
- Progress bar with seeking
- Volume control
- Download button
- Format indicator

**Usage**:
```tsx
import { AudioPlayer } from '@/components/ui/AudioPlayer';

<AudioPlayer
  audioUrl={generatedAudioUrl}
  format="mp3"
  fileName="my-audio.mp3"
  onPlayStateChange={(isPlaying) => console.log(isPlaying)}
/>
```

### 5. LanguageDetector
**File**: `src/components/ui/LanguageDetector.tsx`

**Usage**:
```tsx
import { LanguageDetector } from '@/components/ui/LanguageDetector';

<LanguageDetector
  language="ar"
  characterCount={2500}
  maxCharacters={4096}
/>
```

### 6. SpeedControl (from Phase 3)
**File**: `src/components/ui/SpeedControl.tsx`

**Usage**:
```tsx
import { SpeedControl } from '@/components/ui/SpeedControl';

<SpeedControl
  speed={1.0}
  onChange={(newSpeed) => setSpeed(newSpeed)}
/>
```

### 7. FormatSelector (from Phase 3)
**File**: `src/components/ui/FormatSelector.tsx`

**Usage**:
```tsx
import { FormatSelector } from '@/components/ui/FormatSelector';

<FormatSelector
  format="mp3"
  onChange={(format) => setFormat(format)}
/>
```

## Custom Hooks

### useLanguageDetection
**File**: `src/hooks/useLanguage.tsx`

```tsx
import { useLanguageDetection } from '@/hooks/useLanguage';

const { language, isRTL } = useLanguageDetection(text);
// language: 'ar' | 'en' | 'mixed'
// isRTL: boolean
```

### useCharacterCount
**File**: `src/hooks/useLanguage.tsx`

```tsx
import { useCharacterCount } from '@/hooks/useLanguage';

const { count, percentage, isNearLimit, isAtLimit, remaining } = 
  useCharacterCount(text, 4096);
```

## Complete Integration Example

```tsx
'use client';
import React, { useState } from 'react';
import { TextEditor } from '@/components/ui/TextEditor';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { LoadingOverlay } from '@/components/ui/LoadingState';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LanguageDetector } from '@/components/ui/LanguageDetector';
import { SpeedControl } from '@/components/ui/SpeedControl';
import { FormatSelector } from '@/components/ui/FormatSelector';
import { CharacterCounter } from '@/components/ui/CharacterCounter';
import { useLanguageDetection, useCharacterCount } from '@/hooks/useLanguage';

export default function TTSInterface() {
  const [text, setText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [format, setFormat] = useState<'mp3' | 'wav' | 'opus'>('mp3');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const { language, isRTL } = useLanguageDetection(text);
  const { count, isAtLimit } = useCharacterCount(text, 4096);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('input', text);
      formData.append('voice', 'coral');
      formData.append('speed', speed.toString());
      formData.append('format', format);

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError({
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Error Display */}
      {error && (
        <ErrorDisplay
          error={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Language & Character Info */}
      <LanguageDetector
        language={language}
        characterCount={count}
        maxCharacters={4096}
      />

      {/* Text Editor */}
      <div className="relative">
        {isLoading && <LoadingOverlay message="Generating audio..." />}
        <TextEditor
          value={text}
          onChange={setText}
          language={language}
          characterCount={count}
          disabled={isLoading}
        />
      </div>

      {/* Character Counter */}
      <CharacterCounter current={count} max={4096} />

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SpeedControl speed={speed} onChange={setSpeed} />
        <FormatSelector format={format} onChange={setFormat} />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading || isAtLimit || count < 10}
        className="w-full py-3 px-6 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Speech'}
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <AudioPlayer
          audioUrl={audioUrl}
          format={format}
          fileName={`speech-${Date.now()}.${format}`}
        />
      )}
    </div>
  );
}
```

## RTL Support

The application automatically detects Arabic text and switches to RTL mode:

1. **Text direction**: Automatically applied via `dir="rtl"` attribute
2. **Font**: Arabic text uses 'Noto Sans Arabic' font
3. **Layout mirroring**: Text alignment, positioning inverted for RTL

## Accessibility Features

All components include:

- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus indicators
- ✅ Disabled states
- ✅ Screen reader support
- ✅ High contrast mode support

## Styling

Colors and states:
- **Warning**: Yellow (80-99% of limit)
- **Error**: Red (≥100% of limit)
- **Success**: Primary color (<80%)

All components use theme variables from `globals.css`.
