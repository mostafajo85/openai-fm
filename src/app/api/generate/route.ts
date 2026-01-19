export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server';
import { ttsService } from '@/services/tts.service';
import { validateAndSanitize } from '@/services/validation.service';
import { quotaService } from '@/services/quota.service';
import { getUserIdFromCookie, createUserId } from '@/services/user.service';
import { ipRateLimiter, getClientIP } from '@/middleware/rate-limiter';
import { AppError, formatErrorResponse, logError } from '@/lib/errors';

/**
 * Generate speech from text using OpenAI TTS API
 * Supports both GET and POST methods
 */
async function handleRequest(req: NextRequest): Promise<Response> {
  try {
    // Rate limiting by IP
    const clientIP = getClientIP(req);
    await ipRateLimiter.check(clientIP);

    // Extract parameters from request
    let input: string;
    let voice: string;
    let speed: number | undefined;
    let format: string | undefined;
    let instructions: string | undefined;

    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      input = searchParams.get('input') || '';
      voice = searchParams.get('voice') || '';
      speed = searchParams.get('speed') ? parseFloat(searchParams.get('speed')!) : undefined;
      format = searchParams.get('format') || undefined;
      instructions = searchParams.get('prompt') || undefined;
    } else {
      // POST method
      const formData = await req.formData();
      input = formData.get('input')?.toString() || '';
      voice = formData.get('voice')?.toString() || '';
      speed = formData.get('speed') ? parseFloat(formData.get('speed')!.toString()) : undefined;
      format = formData.get('format')?.toString() || undefined;
      instructions = formData.get('prompt')?.toString() || undefined;
    }

    // Validate and sanitize all inputs
    const validated = validateAndSanitize({
      input,
      voice,
      speed,
      format,
      instructions,
    });

    // Get user ID from cookie for quota tracking
    const cookieHeader = req.headers.get('cookie');
    const userId = cookieHeader ? getUserIdFromCookie(cookieHeader) : createUserId();

    // Check quota before processing (if monetization is enabled)
    quotaService.checkQuota(userId, validated.characterCount);

    // Generate speech using TTS service
    const result = await ttsService.generateSpeech({
      input: validated.input,
      voice: validated.voice,
      speed: validated.speed,
      format: validated.format,
      instructions: validated.instructions,
    });

    // Consume quota after successful generation
    quotaService.consumeQuota(userId, validated.characterCount);

    // Return audio stream
    return new Response(result.audio, {
      headers: {
        'Content-Type': result.contentType,
        'Content-Disposition': `inline; filename="${result.filename}"`,
        'Cache-Control': 'no-cache',
        'X-Character-Count': validated.characterCount.toString(),
        'X-Language': validated.language,
      },
    });
  } catch (error) {
    // Handle errors
    if (error instanceof AppError) {
      return Response.json(formatErrorResponse(error), {
        status: error.statusCode,
      });
    }

    // Log unexpected errors
    logError(error as Error, {
      endpoint: '/api/generate',
      method: req.method,
    });

    return Response.json(
      {
        error: {
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

