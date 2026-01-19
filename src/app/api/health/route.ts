export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { ttsService } from '@/services/tts.service';

/**
 * Health check endpoint
 * Returns the status of the application and its dependencies
 */
export async function GET() {
    try {
        // Check OpenAI API connectivity
        const openaiHealthy = await ttsService.healthCheck();

        const status = openaiHealthy ? 'ok' : 'degraded';

        return Response.json(
            {
                status,
                timestamp: Date.now(),
                services: {
                    openai: openaiHealthy ? 'ok' : 'down',
                    database: 'not_implemented', // TODO: Add database health check after implementing auth
                },
            },
            {
                status: openaiHealthy ? 200 : 503,
            }
        );
    } catch (_error) {
        return Response.json(
            {
                status: 'down',
                timestamp: Date.now(),
                error: 'Health check failed',
            },
            { status: 503 }
        );
    }
}
