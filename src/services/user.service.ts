/**
 * Simple cookie-based user identification
 * No authentication, just anonymous tracking for quotas
 */

import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_COOKIE = 'tts_user_id';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year

/**
 * Get or create anonymous user ID from cookie
 */
export async function getOrCreateUserId(): Promise<string> {
    const cookieStore = await cookies();
    let userId = cookieStore.get(USER_ID_COOKIE)?.value;

    if (!userId) {
        userId = uuidv4();
        cookieStore.set(USER_ID_COOKIE, userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
        });
    }

    return userId;
}

/**
 * Get user ID from request headers (for API routes)
 */
export function getUserIdFromCookie(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').map(c => c.trim());
    const userIdCookie = cookies.find(c => c.startsWith(`${USER_ID_COOKIE}=`));

    if (!userIdCookie) return null;

    return userIdCookie.split('=')[1];
}

/**
 * Create a new user ID cookie value
 */
export function createUserId(): string {
    return uuidv4();
}
