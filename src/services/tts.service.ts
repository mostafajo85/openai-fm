import { OpenAIError, logError } from '@/lib/errors';
import type { Voice, AudioFormat } from '@/services/validation.service';

const OPENAI_API_URL = 'https://api.openai.com/v1/audio/speech';
const OPENAI_MODEL = 'gpt-4o-mini-tts';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

export interface TTSRequest {
    input: string;
    voice: Voice;
    speed?: number;
    format?: AudioFormat;
    instructions?: string;
}

export interface TTSResponse {
    audio: ReadableStream<Uint8Array>;
    contentType: string;
    filename: string;
}

class TTSService {
    private get apiKey(): string {
        const key = process.env.OPENAI_API_KEY;
        if (!key) {
            throw new OpenAIError('OPENAI_API_KEY is not configured', 503);
        }
        return key;
    }

    constructor() {
        // Lazy initialization - validation happens on first use
    }

    /**
     * Generate speech from text using OpenAI TTS API
     */
    async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
        const { input, voice, speed = 1.0, format = 'mp3', instructions } = request;

        let lastError: Error | null = null;

        // Retry logic
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await this.callOpenAI({
                    input,
                    voice,
                    speed,
                    format,
                    instructions,
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new OpenAIError(
                        `OpenAI API error: ${errorText}`,
                        response.status
                    );
                }

                const body = response.body;
                if (!body) {
                    throw new OpenAIError('Empty response from OpenAI API');
                }

                const contentType = this.getContentType(format);
                const filename = this.generateFilename(voice, format);

                return {
                    audio: body,
                    contentType,
                    filename,
                };
            } catch (error) {
                lastError = error as Error;

                // Don't retry on client errors (4xx)
                if (error instanceof OpenAIError && error.statusCode < 500) {
                    throw error;
                }

                // Retry on server errors (5xx) or network errors
                if (attempt < MAX_RETRIES) {
                    await this.delay(RETRY_DELAY * (attempt + 1));
                    continue;
                }

                // Log error after all retries
                logError(lastError, {
                    service: 'TTSService',
                    method: 'generateSpeech',
                    attempt: attempt + 1,
                });
            }
        }

        // If we get here, all retries failed
        throw new OpenAIError('Failed to generate speech after multiple attempts');
    }

    /**
     * Call OpenAI API
     */
    private async callOpenAI(params: {
        input: string;
        voice: Voice;
        speed: number;
        format: AudioFormat;
        instructions?: string;
    }): Promise<Response> {
        const body: Record<string, unknown> = {
            model: OPENAI_MODEL,
            input: params.input,
            voice: params.voice,
            response_format: params.format,
            speed: params.speed,
        };

        // Add instructions only if provided
        if (params.instructions) {
            body.instructions = params.instructions;
        }

        return fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    }

    /**
     * Get content type for audio format
     */
    private getContentType(format: AudioFormat): string {
        const contentTypes: Record<AudioFormat, string> = {
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            opus: 'audio/opus',
            aac: 'audio/aac',
            flac: 'audio/flac',
            pcm: 'audio/pcm',
        };
        return contentTypes[format];
    }

    /**
     * Generate filename for the audio file
     */
    private generateFilename(voice: Voice, format: AudioFormat): string {
        const timestamp = Date.now();
        return `tts-${voice}-${timestamp}.${format}`;
    }

    /**
     * Delay helper for retries
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Health check - verify API key works
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await this.callOpenAI({
                input: 'test',
                voice: 'alloy',
                speed: 1.0,
                format: 'mp3',
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Singleton instance
export const ttsService = new TTSService();
